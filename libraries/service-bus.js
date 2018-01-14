const azureSb = require('azure-sb');
const busBoy = require('bus-boy');

let serviceBusService = null;

/**
 * [connect description]
 * @param  {[type]} connectionString [description]
 * @return {[type]}                  [description]
 */
function connect(connectionString) {
  serviceBusService = azureSb.createServiceBusService(connectionString);
  return serviceBusService;
}

/**
 * [getSubscriptionCount description]
 * @param  {[type]} topic        [description]
 * @param  {[type]} subscription [description]
 * @return {promise}
 */
function getSubscriptionCount(topic, subscription) {
  return busBoy.subscriptionMsgCount(serviceBusService, topic, subscription)
    .then(results => results)
    .catch(error => error);
}

module.exports = {
  connect,
  getSubscriptionCount,
};
