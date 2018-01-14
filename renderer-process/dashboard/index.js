const { store, keys } = require('../../libraries/data-store');
const azureSb = require('../../libraries/service-bus');

const INTERVAL = 60000;

// elements
const environmentList = document.getElementById('environment-list');
const displayEnvironment = document.getElementById('display-environment');
const environmentValue = document.getElementById('display-environment-value');
const subscriptionsList = document.getElementById('subscriptions-list');

/**
 * [updateUI description]
 * @param  {[type]} uiResults [description]
 * @param  {[type]} topic [description]
 * @param  {[type]} subscription [description]
 */
function updateUI(uiResults, topic, subscription) {
  // get icon class based on result count

  const resultsTemplate = `
  <li class="mdl-list__item mdl-list__item--two-line">
    <i class="material-icons topic-icon">sentiment_very_satisfied</i>
    <span class="mdl-list__item-primary-content">
      <span>${topic}</span>
      <span class="mdl-list__item-sub-title">${subscription}</span>
    </span>

    <span class="mdl-list__item-secondary-content">
      <table>
        <tbody>
          <tr>
            <td>Active</td>
            <td>${uiResults.active}</td>
          </tr>
          <tr>
            <td>Dead Letter</td>
            <td>${uiResults.deadLetter}</td>
          </tr>
        </tbody>
      </table>
    </span>
  </li>`;

  subscriptionsList.insertAdjacentHTML('beforeend', resultsTemplate);
}

/**
 * [getSubscriptionData description]
 * @param  {[type]} topic [description]
 * @param  {[type]} subscription [description]
 */
function getSubscriptionData(topic, subscription) {
  azureSb.getSubscriptionCount(topic, subscription).then(results => {
    const uiResults = {
      active: results['d3p1:ActiveMessageCount'],
      deadLetter: results['d3p1:DeadLetterMessageCount'],
    };
    updateUI(uiResults, topic, subscription);
  });
}

/**
 * [monitorAndUpdateResults description]
 * @param  {[type]} topic [description]
 * @param  {[type]} subscription [description]
 */
function monitorAndUpdateResults(topic, subscription) {
  // get results immediately, then set interval
  getSubscriptionData(topic, subscription);
  setInterval(() => {
    getSubscriptionData(topic, subscription);
  }, INTERVAL);
}

/**
 * [handleEnvironmentSelected description]
 * @param  {[type]} e [description]
 */
function handleEnvironmentSelected() {
  const { environments } = store.get(keys.CONFIG);
  // get the selected environment
  const { 'service-bus': sb, 'topic-prefix': topicPrefix } = environments[environmentValue.value];
  // connect to service bus
  azureSb.connect(sb.connection);
  // monitor subscriptions
  sb['subscriptions-to-monitor'].forEach(s => {
    const topic = `${topicPrefix}-${s.topic}`;
    monitorAndUpdateResults(topic, s.subscription);
  });
}

/**
 * [listEnvironments description]
 * @param  {[type]} environments [description]
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
 * [init description]
 */
function init() {
  const config = store.get(keys.CONFIG);
  listEnvironments(config.environments);

  // invoke callback when connection strings change
  store.onDidChange(keys.CONFIG, listEnvironments);
}

// add event listeners
displayEnvironment.addEventListener('change', handleEnvironmentSelected);

init();
