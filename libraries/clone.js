/**
 * Super fast deep object clone
 * @param  {object} objectToClone - Object to clone
 * @return {object} - cloned object
 */
function clone(objectToClone) {
  if (!objectToClone) return objectToClone;

  return JSON.parse(JSON.stringify(objectToClone));
}

module.exports = clone;
