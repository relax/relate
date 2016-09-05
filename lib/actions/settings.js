import actionTypes from './types';

export function setHeader (key, value) {
  return {
    type: actionTypes.setHeader,
    key,
    value
  };
}

export function removeHeader (key) {
  return {
    type: actionTypes.removeHeader,
    key
  };
}

export function setEndpoint (endpoint) {
  return {
    type: actionTypes.setEndpoint,
    endpoint
  };
}

export function setBody (key, value) {
  return {
    type: actionTypes.setBody,
    key,
    value
  };
}

export function removeBody (key) {
  return {
    type: actionTypes.removeBody,
    key
  };
}
