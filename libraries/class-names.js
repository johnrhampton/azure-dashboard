const clone = require('./clone');

/**
 * Returns a string of class names to apply
 * @param  {object} classesToEvaluate - Object to evaluate
 * @return {string}
 */
function apply(classesToEvaluate) {
  const classnames = clone(classesToEvaluate);
  // delete any keys whose value is falseworthy
  Object.keys(classnames).forEach(key => {
    if (!classnames[key]) delete classnames[key];
  });

  return Object.keys(classnames).join(' ');
}

module.exports = apply;
