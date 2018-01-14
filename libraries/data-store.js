/**
 * Super basic store implementation
 */
const Store = require('electron-store');

const keys = {
  SERVICE_BUS_CONNECTIONS: 'service-bus-connections',
  CONFIG: 'config',
};

module.exports.store = new Store();
module.exports.keys = keys;
