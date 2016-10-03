import forEach from 'lodash.foreach';

/**
 * Captures a relate query or mutation values (concats scoped queries)
 *
 * @param {Object} action
 * @param {String||Array} test
 */
export default (action, test) => {
  if (!test) {
    return null;
  }

  const querieTestNames = test.constructor === Array ? test : [test];
  let result = null;

  forEach(action.data, (queryValue, key) => {
    if (queryValue && querieTestNames.indexOf(key) !== -1 ||
        querieTestNames.indexOf(action.scopes[key]) !== -1) {
      // is in query test values

      if (queryValue.constructor === Array) {
        result = result && [...result, ...queryValue] || [...queryValue];
      } else {
        result = queryValue;
      }
    }
  });

  return result;
};
