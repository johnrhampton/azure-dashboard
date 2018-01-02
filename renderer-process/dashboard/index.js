const { store, keys } = require('../../libraries/data-store');

/**
 * [init description]
 */
function init() {
  const sbConnections = store.get(keys.SERVICE_BUS_CONNECTIONS);
}

init();
