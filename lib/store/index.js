import forEach from 'lodash/foreach';
import union from 'lodash/union';
import warning from 'warning';

import iterateNode from '../helpers/iterate-node';
import normalize from './normalize';
import Connectors from './connectors';
import DB from './db';

export default class Store {
  constructor () {
    // Database interface
    this.db = new DB();
    // Connectors interface
    this.connectors = new Connectors();
  }

  // Processes a Graphql query/mutation
  // Parameters
  //
  // #data - data result from the request e.g
  // {
  //   pages: [{...}, {...}],
  //   page: {...}
  // }
  //
  // #fragments - total fragments requested e.g
  // {
  //   pages: {_id: 1, title: 1}
  //   page: {_id: 1, title: 1}
  // }
  //
  // #connectors - connectors that requested the data e.g
  // {
  //   connector_0: {
  //     fragments: {}, // fragments this connector requested
  //     mutations: {}, // mutations this connector wants to listen for
  //     scopes: {} // when there are query names colisions scopes are created
  //   }
  // }
  //
  // #mutates - a mutation might bring a mutates configuration which will
  // trigger an action with the result e.g.
  // {
  //   nodeId: domainId,
  //   type: 'APPEND',
  //   field: 'pages'
  // }
  //
  // #isMutation - Boolean
  // #isRemoveMutation - Boolean
  processIncoming ({data, fragments, connectors, mutates, isMutation, isRemoveMutation}) {
    let connectorsToUpdate = connectors && Object.keys(connectors) || [];
    let allNodes = [];

    if (isRemoveMutation) {
      // Remove nodes
      forEach(fragments, (fragment, queryName) => {
        if (fragment._id) {
          const queryData = data[queryName];

          iterateNode(queryData, (item) => {
            if (item._id) {
              // Remove from db
              this.db.removeNode(item._id);

              // Remove from connectors
              connectorsToUpdate = this.connectors.removeNode(item._id);

              // Check connectors listening to this mutation
              connectorsToUpdate = union(
                connectorsToUpdate,
                this.connectors.checkMutationListeners(queryName, [], [], this.db)
              );
            } else {
              warning(false, 'RELATE: Remove action failed');
              // TODO handle error in some way?
            }
          });
        }
      });
    } else {
      forEach(fragments, (fragment, _queryName) => {
        const queryName =
          _queryName.indexOf(':') !== -1 ?
          _queryName.split(':')[0] :
          _queryName;

        // Normalize data
        //  relativeNodes - root nodes (Array || Object)
        //  nodes - all nodes added (Array)
        //  changes - changes to make to db (Object)
        const {relativeNodes, nodes, changes} = normalize(data[queryName], fragment);

        // Make changes in local DB
        this.db.mergeChanges(changes);

        // Save nodes changed to later check which connectors to update
        allNodes = union(allNodes, nodes);

        // Check if is mutation and brings a mutates field
        if (isMutation && mutates) {
          allNodes = union(
            nodes,
            this.db.performUserMutate(mutates, relativeNodes)
          );
        }

        // Process data to connectors
        if (connectors) {
          this.connectors.processConnectors(
            connectors,
            queryName,
            relativeNodes,
            nodes
          );
        }

        // If mutation check if some connector is listening
        if (isMutation) {
          connectorsToUpdate = union(
            connectorsToUpdate,
            this.connectors.checkMutationListeners(queryName, relativeNodes, nodes, this.db)
          );
        }
      });
    }

    // Check more connectors than need to update
    connectorsToUpdate = connectorsToUpdate.concat(
      this.connectors.getConnectorsToUpdate(allNodes, connectorsToUpdate)
    );

    // Calculate connectors that need to be changed
    const changes = {};
    forEach(connectorsToUpdate, (connectorId) => {
      if (this.connectors.connectorExists(connectorId)) {
        changes[connectorId] = this.connectors.generateConnectorData(connectorId, this.db);
      }
    });

    return changes;
  }

  // Remove a data connector
  deleteConnector (connectorId) {
    this.connectors.deleteConnector(connectorId);
  }
}
