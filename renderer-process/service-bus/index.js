const ipc = require('electron').ipcRenderer;
const moment = require('moment');
const { store, keys } = require('../../libraries/data-store');
const azureSb = require('../../libraries/service-bus');
const classNames = require('../../libraries/class-names');
// get config from store
const config = store.get(keys.CONFIG);
// store the current environment interval
let environmentInterval = null;

// elements
const environmentList = document.getElementById('environment-list');
const displayEnvironment = document.getElementById('display-environment');
const environmentValue = document.getElementById('display-environment-value');
const subscriptionsList = document.getElementById('subscriptions-list');
const serviceBusContent = document.getElementById('service-bus-content');
const serviceBusLastUpdate = document.getElementById('service-bus-last-update');

/**
 * Sorts Subscription results
 * @param  {object} a - Result a
 * @param  {object} b - Result b
 * @return {number} - comparison
 */
function sortResults(a, b) {
  const subA = a.subscription.toLowerCase();
  const subB = b.subscription.toLowerCase();
  if (subA < subB) return -1;
  if (subA > subB) return 1;
  return 0; // equal
}

/**
 * Builds a html template for a subscription result set
 * @param  {object} subscriptionResult - Subscription result set
 * @returns {string} - html string template
 */
function buildTemplateForResultSet(subscriptionResult) {
  const { serviceBus: { subscriptionThresholds } } = config;
  const { prettyPrettyGood, meh, ugh } = subscriptionThresholds;
  const { topic, subscription, active, deadLetter } = subscriptionResult;

  // get icon class based on result count
  const resultIconClass = classNames({
    'pretty-pretty-good-status': active <= prettyPrettyGood,
    'meh-status': active >= prettyPrettyGood && active <= meh,
    'ugh-status': active >= meh && active <= ugh,
    'danger-status': active > ugh || !active,
  });

  const resultsTemplate = `
  <li class="mdl-list__item mdl-list__item--two-line">
    <i class="material-icons md-36 topic-icon ${resultIconClass}"></i>
    <span class="mdl-list__item-primary-content">
      <span>${topic}</span>
      <span class="mdl-list__item-sub-title">${subscription}</span>
    </span>

    <span class="mdl-list__item-secondary-content">
      <table>
        <tbody>
          <tr>
            <td>Active</td>
            <td>${active || '!!'}</td>
          </tr>
          <tr>
            <td>Dead Letter</td>
            <td>${deadLetter || '!!'}</td>
          </tr>
        </tbody>
      </table>
    </span>
  </li>`;

  return resultsTemplate;
}

/**
 * Retrieves data for a list of subscriptions
 * @param  {array} subscriptionsToMonitor - List of topic/subscriptions to monitor
 * @param  {string} topicPrefix - Optional prefix to apply to a topic
 * @param  {function} done - Callback invoked when results for all subscriptions are retrieved
 */
function getSubscriptionData(subscriptionsToMonitor, topicPrefix, done) {
  const subscriptionResults = [];

  subscriptionsToMonitor.forEach(s => {
    const { topic, subscription } = s;
    // build fully qualified topic name with prefix
    const qualifiedTopic = topicPrefix ? `${topicPrefix}-${topic}` : topic;

    azureSb.getSubscriptionCount(qualifiedTopic, subscription).then(counts => {
      subscriptionResults.push({
        topic: qualifiedTopic,
        subscription,
        active: counts['d3p1:ActiveMessageCount'],
        deadLetter: counts['d3p1:DeadLetterMessageCount'],
      });

      if (subscriptionResults.length === subscriptionsToMonitor.length) done(subscriptionResults);
    });
  });
}

/**
 * Builds HTML templates from the result sets, notifies a user when a subscription count threshold has been exceeded
 * @param  {array} subscriptionResults - List of subscription details
 */
function updateResults(subscriptionResults) {
  const { serviceBus: { subscriptionThresholds: { ugh } } } = config;
  let resultsTemplate = '';

  subscriptionResults.sort(sortResults).forEach(r => {
    if (r.active >= ugh) {
      ipc.send('request-user-notification', {
        title: `Ugh, Active Message Threshold Exceeded - ${r.subscription}`,
        text: r.active,
      });
    }

    resultsTemplate += buildTemplateForResultSet(r);
  });

  // clear old data and insert new
  subscriptionsList.innerHTML = '';
  serviceBusLastUpdate.innerHTML = `${moment().format('MMM Do YYYY, h:mm:ss a')}`;
  subscriptionsList.insertAdjacentHTML('beforeend', resultsTemplate);
}

/**
 * Callback invoked when the environment dropdown is selected
 *  Retrieves subscription data and sets an interval to retrieve updated data
 */
function handleEnvironmentSelected() {
  const { environments, serviceBus } = config;
  // clear existing environment intervals
  if (environmentInterval) clearInterval(environmentInterval);
  // get the selected environment
  const { serviceBus: environmentServiceBus } = environments[environmentValue.value];
  // remove no-display class from service bus content area
  serviceBusContent.classList.remove('no-display');
  // connect to service bus
  azureSb.connect(environmentServiceBus.connection);
  // get subscription data
  getSubscriptionData(serviceBus.subscriptionsToMonitor, environmentServiceBus.topicPrefix, updateResults);
  // set an interval to refresh subscription data
  environmentInterval = setInterval(() => {
    getSubscriptionData(serviceBus.subscriptionsToMonitor, environmentServiceBus.topicPrefix, updateResults);
  }, serviceBus.monitorRate);
}

/**
 * Appends an <li> to the DOM for each defined environment - Should be moved to header component
 * @param  {object} environments - Object hash of environments
 */
function listEnvironments(environments) {
  Object.keys(environments).forEach(e => {
    const listItem = document.createElement('li');
    listItem.innerHTML = e.toUpperCase();
    listItem.className = 'mdl-menu__item';
    listItem.dataset.val = e;
    environmentList.appendChild(listItem);
  });
}

/**
 * Initialize Service Bus module
 */
function init() {
  listEnvironments(config.environments);

  // invoke callback when connection strings change
  store.onDidChange(keys.CONFIG, listEnvironments);
}

// add event listeners
displayEnvironment.addEventListener('change', handleEnvironmentSelected);

init();
