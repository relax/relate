import forEach from 'lodash.foreach';

export default (data, callback) => {
  if (data && data.constructor === Array) {
    forEach(data, callback);
  } else {
    callback(data);
  }
};
