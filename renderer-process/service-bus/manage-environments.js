const { Map } = require('immutable');
const azureSb = require('azure-sb');
const { store, keys } = require('../../libraries/data-store');
const showSnack = require('../../libraries/snackbar');

let state = Map({
  environment: '',
  connectionName: '',
  topic: '',
  subscription: '',
});

// elements
const addEnvironmentName = document.getElementById('add-environment-name');
const addConnectionString = document.getElementById('add-connection-string');
const saveConnectionBtn = document.getElementById('save-connection');
const connectionList = document.getElementById('service-bus-connection-list');
const connectionCount = document.getElementById('sb-connection-count');
const addTopic = document.getElementById('add-topic');
const addSubscription = document.getElementById('add-subscription');

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
  const environment = state.get('environment');
  const connection = state.get('connection');
  const topic = state.get('topic');
  const subscription = state.get('subscription');

  if (!environment || !connection) {
    return showSnack({
      message: 'Environment Name and Connection String are required!',
      type: 'warn',
    });
  }

  const serviceBus = verifyConnection(connection);
  if (serviceBus) {
    const serviceBusConnections = getServiceBusConnections().concat([
      {
        environment,
        connection,
        topic,
        subscription,
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
  (connections || []).forEach(c => {
    const li = document.createElement('li');
    li.className = 'mdl-list__item mdl-list__item--three-line';

    const liSpan = document.createElement('span');
    liSpan.className = 'mdl-list__item-primary-content';
    li.appendChild(liSpan);

    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = c.environment;
    liSpan.appendChild(nameSpan);

    const stringSpan = document.createElement('span');
    stringSpan.className = 'mdl-list__item-text-body';
    stringSpan.innerHTML = c.connection.split(';').join(';<br />');
    liSpan.appendChild(stringSpan);

    connectionList.appendChild(li);
  });
}

/**
 * [onConnectionStringChange description]
 * @param  {[type]} newValue [description]
 */
function onConnectionStringChange(newValue) {
  connectionCount.innerHTML = (newValue || []).length;
  renderConnections(newValue);
}

/**
 * [init description]
 */
function init() {
  const serviceBusConnections = getServiceBusConnections();
  // set connection count
  connectionCount.innerHTML = serviceBusConnections.length;
  // invoke callback when connection strings change
  store.onDidChange(keys.SERVICE_BUS_CONNECTIONS, onConnectionStringChange);
  // render connection strings
  renderConnections(serviceBusConnections);
}

// bind event listeners
addEnvironmentName.addEventListener('input', onFieldValueChange);
addConnectionString.addEventListener('input', onFieldValueChange);
addTopic.addEventListener('input', onFieldValueChange);
addSubscription.addEventListener('input', onFieldValueChange);
saveConnectionBtn.addEventListener('click', verifyAndSaveConnection);

init();
