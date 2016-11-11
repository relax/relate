import forEach from 'lodash/forEach';

export default (data, callback) => {
  if (data && data.constructor === Array) {
    forEach(data, callback);
  } else {
    callback(data);
  }
};
