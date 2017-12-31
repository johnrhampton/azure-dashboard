const { show } = require('js-snackbar');

// baseline snackbar styles
const snackbarTypes = {
  ERROR: {
    background: '#F44336',
    duration: 5000,
    actionType: 'CLOSE',
    pos: 'bottom-right',
  },
  INFO: {
    background: 'rgb(68, 138, 255)',
    duration: 5000,
    pos: 'bottom-right',
  },
  SUCCESS: {
    background: '#4CAF50',
    duration: 5000,
    pos: 'bottom-right',
  },
  WARN: {
    background: '#FF9800',
    duration: 10000,
    actionType: 'CLOSE',
    pos: 'bottom-right',
  },
};

/**
 * Returns the predefined type
 * @param {string} type - Type of snackbar message
 * @returns {*}
 */
function snackbarType(type) {
  if (!type || typeof type !== 'string') return snackbarTypes.INFO;
  return snackbarTypes[type.toUpperCase()];
}

/**
 * Displays a snackbar notification
 * @param  {object} payload - snackbar payload
 */
module.exports = function showSnack(payload) {
  const options = snackbarType(payload.type);
  const pos = payload.pos || options.pos;
  const duration = payload.duration || options.duration;

  show({
    text: payload.message,
    textColor: '#FFFFFF',
    pos,
    backgroundColor: options.background,
    duration,
    actionTextColor: '#FFFFFF',
    actionType: options.actionType,
  });
};
