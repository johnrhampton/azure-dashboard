const azureSb = require('azure-sb');
const busBoy = require('bus-boy');

let serviceBusService = null;

/**
 * Connects to service bus
 * @param  {string} connectionString - Service Bus connection string
 * @return {object}
 */
function connect(connectionString) {
  serviceBusService = azureSb.createServiceBusService(connectionString);
  return serviceBusService;
}

/**
 * [getSubscriptionsAndCountsForEachTopic description]
 * @param  {[type]} topics [description]
 * @return {[type]}        [description]
 */
function getSubscriptionsAndCountsForEachTopic(topics) {
  return new Promise(resolve => {
    const results = {};

    topics.forEach(t => {
      busBoy.listSubscriptions(serviceBusService, t).then(subscriptions => {
        const sub = subscriptions.map(s => {
          const countDetails = Object.keys(s.CountDetails);

          return {
            topic: t,
            subscription: s.SubscriptionName,
            active: s.CountDetails[countDetails.find(k => k.toLowerCase().includes('active'))],
            deadLetter: s.CountDetails[countDetails.find(k => k.toLowerCase().includes('deadletter'))],
          };
        });

        results[t] = sub;

        if (Object.keys(results).length === topics.length) {
          resolve(results);
        }
      });
    });
  });
}

/**
 * Returns the counts for a given topic / subscription
 * @param  {string} topic - Topic to check
 * @param  {string} subscription - Subscription to check
 * @return {promise}
 */
function getSubscriptionCount(topic, subscription) {
  return busBoy
    .subscriptionMsgCount(serviceBusService, topic, subscription)
    .then(results => results)
    .catch(error => error);
}

/**
 * Returns the counts for all subscriptions
 * @return {array}
 */
function getCountsForAllSubscriptions() {
  return busBoy
    .listTopics(serviceBusService)
    .then(results => getSubscriptionsAndCountsForEachTopic(results.topics))
    .then(results => results)
    .catch(error => error);
}

module.exports = {
  connect,
  getSubscriptionCount,
  getCountsForAllSubscriptions,
};
