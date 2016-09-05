import actionTypes from './types';

export default function removeConnector (id) {
  return {
    type: actionTypes.removeConnector,
    id
  };
}
