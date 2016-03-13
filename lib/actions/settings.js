import actionTypes from './types';

export function setHeader(key, value) {
  return {
    type: actionTypes.setHeader,
    key,
    value
  };
}

export function removeHeader(key) {
  return {
    type: actionTypes.setHeader,
    key
  };
}

export function setEndpoint(endpoint) {
  return {
    type: actionTypes.setEndpoint,
    endpoint
  };
}