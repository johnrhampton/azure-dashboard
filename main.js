const path = require('path');
const glob = require('glob');
const { app, BrowserWindow } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

const autoUpdater = require('./auto-updater');
const { loadConfig } = require('./boot/app-config');

const debug = /--debug/.test(process.argv[3]);

if (process.mas) app.setName('Azure Dashboard');

let mainWindow = null;

/**
 * Make this app a single instance app.
 * The main window will be restored and focused instead of a second window
 * opened when a person attempts to launch a second instance.
 * Returns true if the current version of the app should quit instead of
 * launching.
 * @return {boolean}
 */
function makeSingleInstance() {
  if (process.mas) return false;

  return app.makeSingleInstance(() => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Require JS files in the main-process dir
 */
function loadMainProcessFiles() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  files.forEach(file => {
    require(file);
  });
  autoUpdater.updateMenu();
}

/**
 * Initialize the Electron App
 * @return {void}
 */
function initialize() {
  const shouldQuit = makeSingleInstance();
  if (shouldQuit) return app.quit();

  loadMainProcessFiles();

  loadConfig();

  // create the main window
  // eslint-disable-next-line require-jsdoc
  function createWindow() {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName(),
    };

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png');
    }

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require('devtron').install(); // eslint-disable-line import/no-extraneous-dependencies
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', () => {
    createWindow();
    autoUpdater.initialize();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
  case '--squirrel-install':
    autoUpdater.createShortcut(() => {
      app.quit();
    });
    break;
  case '--squirrel-uninstall':
    autoUpdater.removeShortcut(() => {
      app.quit();
    });
    break;
  case '--squirrel-obsolete':
  case '--squirrel-updated':
    app.quit();
    break;
  default:
    initialize();
}
