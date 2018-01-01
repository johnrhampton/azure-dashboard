const { Map } = require('immutable');
const azureSb = require('azure-sb');
const { store, keys } = require('../../libraries/data-store');
const showSnack = require('../../libraries/snackbar');

let state = Map({
  connectionName: '',
  connectionString: '',
});

const addConnectionName = document.getElementById('add-connection-name');
const addConnectionString = document.getElementById('add-connection-string');
const saveConnectionBtn = document.getElementById('save-connection');

/**
 * [getServiceBusConnections description]
 * @return {[type]} [description]
 */
function getServiceBusConnections() {
  const sbConnections = store.get(keys.SERVICE_BUS_CONNECTIONS);
  return sbConnections || [];
}

/**
 * [onFieldValueChange description]
 * @param  {[type]} e [description]
 */
function onFieldValueChange(e) {
  const field = e.currentTarget.dataset.field;
  const value = e.currentTarget.value;
  state = state.set(field, value);
}

/**
 * [verifyConnection description]
 * @param  {[type]} connectionString [description]
 * @return {[type]}                  [description]
 */
function verifyConnection(connectionString) {
  try {
    return azureSb.createServiceBusService(connectionString);
  } catch (error) {
    showSnack({
      message: 'Invalid Connection string!',
      type: 'warn',
    });
  }
}

/**
 * [verifyAndSaveConnection description]
 * @return {void}
 */
function verifyAndSaveConnection() {
  const connectionName = state.get('connectionName');
  const connectionString = state.get('connectionString');

  if (!connectionName || !connectionString) {
    return showSnack({
      message: 'Connection name and string are required!',
      type: 'warn',
    });
  }

  const serviceBus = verifyConnection(connectionString);
  if (serviceBus) {
    const serviceBusConnections = getServiceBusConnections().concat([
      {
        connectionName,
        connectionString,
      },
    ]);
    store.set(keys.SERVICE_BUS_CONNECTIONS, serviceBusConnections);

    showSnack({
      message: 'Connection string verified and saved!',
      type: 'success',
    });
  }
}

/**
 * [renderConnections description]
 * @param  {[type]} connections [description]
 */
function renderConnections(connections) {
  const connectionList = document.getElementById('service-bus-connection-list');
  (connections || []).forEach(c => {
    const li = document.createElement('li');
    li.className = 'mdl-list__item mdl-list__item--three-line';

    const liSpan = document.createElement('span');
    liSpan.className = 'mdl-list__item-primary-content';
    li.appendChild(liSpan);

    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = c.connectionName;
    liSpan.appendChild(nameSpan);

    const stringSpan = document.createElement('span');
    stringSpan.className = 'mdl-list__item-text-body';
    stringSpan.innerHTML = c.connectionString.split(';').join(';<br />');
    liSpan.appendChild(stringSpan);

    connectionList.appendChild(li);
  });
}

/**
 * [onConnectionStringChange description]
 * @param  {[type]} newValue [description]
 */
function onConnectionStringChange(newValue) {
  document.getElementById('sb-connection-count').innerHTML = (newValue || []).length;
  renderConnections(newValue);
}

/**
 * [init description]
 */
function init() {
  const serviceBusConnections = getServiceBusConnections();
  // set connection count
  document.getElementById('sb-connection-count').innerHTML = serviceBusConnections.length;
  // invoke callback when connection strings change
  store.onDidChange(keys.SERVICE_BUS_CONNECTIONS, onConnectionStringChange);
  // render connection strings
  renderConnections(serviceBusConnections);
}

// bind event listeners
addConnectionName.addEventListener('input', onFieldValueChange);
addConnectionString.addEventListener('input', onFieldValueChange);
saveConnectionBtn.addEventListener('click', verifyAndSaveConnection);

init();
