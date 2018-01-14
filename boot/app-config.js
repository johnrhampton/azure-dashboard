const path = require('path');
const { store, keys } = require('../libraries/data-store');

/**
 * Loads Configuration from a JSON file
 */
function loadConfig() {
  try {
    const configPath = path.join(__dirname, '../', 'app-config.json');
    const config = require(configPath);
    store.set(keys.CONFIG, config);
  } catch (error) {
    store.set(keys.CONFIG, {});
  }
}

module.exports.loadConfig = loadConfig;
