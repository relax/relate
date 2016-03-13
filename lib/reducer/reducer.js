import forEach from 'lodash.foreach';
import merge from 'lodash.merge';
import union from 'lodash.union';
import warning from 'warning';

import actionTypes from '../actions/types';
import connectors from './connectors';
import processNode from './process-node';
import store from './store';

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
  settings: {}
};

export default function graphqlReducer (state = defaultState, action = {}) {
  if ((action.type === actionTypes.query || action.type === actionTypes.mutation) && action.data && action.fragments) {
    const isMutation = action.type === actionTypes.mutation;
    const isRemoveMutation = isMutation && action.mutationType === 'REMOVE';
    let connectorsToUpdate = action.connectors && Object.keys(action.connectors) || [];
    let nodes = [];

    if (isRemoveMutation) {
      forEach(action.fragments, (fragment, queryName) => {
        if (fragment._id) {
          const queryData = action.data[queryName];
          if (queryData && queryData._id) {
            // Remove from store
            store.removeNode(queryData._id);

            // Remove from connectors
            connectorsToUpdate = connectors.removeNode(queryData._id);

            // Check connectors listening to this mutation
            connectorsToUpdate = union(connectorsToUpdate, connectors.checkMutationListeners(queryName, [], []));
          } else {
            warning(false, 'RELATE: Remove action failed');
            // TODO handle error in some way?
          }
        }
      });
    } else {
      forEach(action.fragments, (fragment, queryName) => {
        const nodesProcessed = processNode(action.data[queryName], fragment, queryName); // { relativeNodes: [], nodes: [], changes: {} }

        // DB changes
        store.updateNodes(nodesProcessed.changes);

        // Save nodes changed to later check which connectors to update
        nodes = union(nodes, nodesProcessed.nodes);

        // Connectors
        if (action.connectors) {
          connectors.processConnectors(action.connectors, queryName, nodesProcessed.relativeNodes, nodesProcessed.nodes);
        }

        // Mutations
        if (isMutation) {
          connectorsToUpdate = union(connectorsToUpdate, connectors.checkMutationListeners(queryName, nodesProcessed.relativeNodes, nodesProcessed.nodes));
        }
      });
    }

    // Check more connectors than need to update
    connectorsToUpdate = connectorsToUpdate.concat(connectors.getConnectorsToUpdate(nodes, connectorsToUpdate));

    // Calculate connectors data
    const changes = {};
    forEach(connectorsToUpdate, (connectorId) => {
      changes[connectorId] = connectors.generateConnectorData(connectorId);
    });

    return merge({}, state, changes);
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    connectors.deleteConnector(action.id);
    // TODO Delete no longer needed data from state? or maintain for future cache?
    return newState;
  }
  
  if (action.type === actionTypes.setHeader) {
    const newState = merge({}, state, {settings: { headers: {[action.key]:action.value}}})
    console.log(newState)
    return newState
  }
  
  if (action.type === actionTypes.removeHeader) {
    const newState = Object.assign({}, state)
    delete newState['settings']['headers'][action.key]
    return newState
  }
  
  if (action.type === actionTypes.setEndpoint) {
    const newState = merge({}, state, {settings: { endpoint:action.endpoint }})
    return newState
  }

  return state;
}
