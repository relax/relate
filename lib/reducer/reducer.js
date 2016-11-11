import forEach from 'lodash/foreach';

import actionTypes from '../actions/types';
import Store from '../store';

const store = new Store();

// Default state
// state will be composed of connectors data, e.g.
// {
//   connector_1: {
//     pages: [{...}, {...}]
//   },
//   connector_2: {
//     page: {...}
//   }
// }
const defaultState = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  body: {},
  endpoint: '/graphql',
  withCredentials: false
};

export function relateReducer (_state = defaultState, action = {}) {
  const isIntrospection = action.isIntrospection;
  let state = _state;

  // Server store hydration
  if (!isIntrospection && state.serverStore && state.serverConnectors) {
    store.db.db = state.serverStore;
    store.connectors.connectors = state.serverConnectors;
    state = Object.assign({}, state);
    delete state.serverStore;
    delete state.serverConnectors;
  }

  if ((action.type === actionTypes.query || action.type === actionTypes.mutation) &&
      action.data &&
      action.fragments) {
    const isMutation = action.type === actionTypes.mutation;
    const isRemoveMutation = isMutation && action.mutationType === 'REMOVE';

    const changes = store.processIncoming({
      data: action.data,
      fragments: action.fragments,
      connectors: action.connectors,
      mutates: action.mutates,
      isMutation,
      isRemoveMutation
    });

    let result;
    if (isIntrospection) {
      // is introspection (server side), so save connectors mapping for later re hydration
      const connectorsMap = {};
      forEach(action.connectors, (connectorData, connectorId) => {
        connectorsMap[connectorId] = {
          fragments: connectorData.fragments,
          variables: connectorData.variables
        };
      });
      result = Object.assign({}, state, changes, {
        server: connectorsMap,
        serverStore: store.db.db,
        serverConnectors: store.connectors.connectors
      });
    } else {
      // client side
      result = Object.assign({}, state, changes);
    }

    return result;
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    store.deleteConnector(action.id);

    if (state.server) {
      // server mapping no longer needed
      delete newState.server;
    }

    // TODO Delete no longer needed data from state? or maintain for future cache?
    return newState;
  }

  if (action.type === actionTypes.setHeader) {
    return Object.assign({}, state, {
      headers: Object.assign({}, state.headers, {
        [action.key]: action.value
      })
    });
  }

  if (action.type === actionTypes.removeHeader) {
    const headers = Object.assign({}, state.headers);
    delete headers[action.key];
    return Object.assign({}, state, {
      headers
    });
  }

  if (action.type === actionTypes.setEndpoint) {
    return Object.assign({}, state, {
      endpoint: action.endpoint
    });
  }

  if (action.type === actionTypes.setBody) {
    return Object.assign({}, state, {
      body: Object.assign({}, state.body, {
        [action.key]: action.value
      })
    });
  }

  if (action.type === actionTypes.removeBody) {
    const body = Object.assign({}, state.body);
    delete body[action.key];
    return Object.assign({}, state, {
      body
    });
  }

  return state;
}

export function relateReducerInit (settings) {
  Object.assign(defaultState, settings);
  return relateReducer;
}
