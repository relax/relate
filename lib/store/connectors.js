import filter from 'lodash/filter';
import forEach from 'lodash/foreach';
import get from 'lodash/get';
import intersection from 'lodash/intersection';
import invariant from 'invariant';
import set from 'lodash/set';
import union from 'lodash/union';
import values from 'lodash/values';
import warning from 'warning';

import iterateField from '../helpers/iterate-field';

export default class Connectors {
  constructor () {
    // Connectors info
    // composed of connectors and their info, e.g
    // {
    //   connector_1: {
    //     data: {
    //       pages: ['56d0583eb0dc646f07b05cf2', '568fc7d152e76bc604a74520']
    //     },
    //     listens: {
    //       pages: ['56d0583eb0dc646f07b05cf2', '568fc7d152e76bc604a74520', ...]
    //     },
    //     fragments: {
    //       pages: {
    //         _id: 1,
    //         title: 1
    //       }
    //     }
    //     mutations: {
    //       addPage: [
    //         {
    //           type: 'APPEND', // INCREMENT || DECREMENT || APPEND || PREPEND
    //           field: 'pages'
    //         },
    //         {
    //           type: 'INCREMENT',
    //           field: ['pages', 'pagesCount']
    //         }
    //       ]
    //     }
    //   }
    // }
    this.connectors = {};
  }

  connectorExists (connectorId) {
    return this.connectors[connectorId] && true;
  }

  generateConnectorData (connectorId, db) {
    const connector = this.connectors[connectorId];
    return db.getData(connector.data, connector.fragments);
  }

  // Process a query through the connectors that requested it
  processConnectors (queryConnectors, queryName, relativeNodes, nodes) {
    forEach(queryConnectors, (connectorQuery, connectorId) => {
      // Check if queryName is a scoped one
      const actualQueryName = connectorQuery.scopes && connectorQuery.scopes[queryName] || queryName;
      const isInConnectorFragments = connectorQuery.fragments[actualQueryName] && true;
      const isScopedQuery = actualQueryName !== queryName;
      const scopedOther =
        !isScopedQuery && // is not a scoped query
        connectorQuery.scopes && // has scopes
        values(connectorQuery.scopes).indexOf(actualQueryName) !== -1; // query has not been scoped

      // check if query was triggered by this connector
      // 1st case for scoped queries
      // 2nd case for non scope queries (they cannot be a value in scope)
      if ((isInConnectorFragments && isScopedQuery) ||
          (isInConnectorFragments && !isScopedQuery && !scopedOther)) {
        this.connectors[connectorId] = this.connectors[connectorId] || {
          data: {},
          listens: {},
          fragments: {},
          mutations: {}
        };
        const conn = this.connectors[connectorId];
        const isLoadMore =
          connectorQuery.loadMore === actualQueryName &&
          conn.data[actualQueryName] &&
          conn.data[actualQueryName].constructor === Array;


        // Add query data
        Object.assign(conn.data, {
          [actualQueryName]:
            isLoadMore ?
            [...conn.data[actualQueryName], ...relativeNodes] :
            relativeNodes
        });

        // Add listeners data
        Object.assign(conn.listens, {
          [actualQueryName]:
            isLoadMore ?
            [...conn.data[actualQueryName], ...nodes] :
            nodes
        });

        // fragments
        Object.assign(conn.fragments, {
          [actualQueryName]: connectorQuery.fragments[actualQueryName]
        });

        // mutations listeners
        conn.mutations = connectorQuery.mutations || {};
      }
    });
  }

  // Calculates which connectors need to update based on an input of nodes and an exlude list
  getConnectorsToUpdate (nodes, exclude = []) {
    const connsToUpdate = [];
    forEach(this.connectors, (connector, connectorId) => {
      if (exclude.indexOf(connectorId) === -1) {
        forEach(connector.listens, (listenIds) => {
          if (intersection(nodes, listenIds).length !== 0) {
            connsToUpdate.push(connectorId);
            return false;
          }
          return true;
        });
      }
    });
    return connsToUpdate;
  }

  // Check if any connector is listening to the mutation passed as argument
  checkMutationListeners (mutationName, relativeNodes, nodes, db) {
    const connsToUpdate = [];
    forEach(this.connectors, (connector, connectorId) => {
      const mutation = connector.mutations && connector.mutations[mutationName];
      if (mutation && mutation.constructor === Array) {
        // Connector was listening to this mutation
        connsToUpdate.push(connectorId);

        // make transformations
        forEach(mutation, (action) => {
          invariant(action.type, 'Relate: Mutation listener action type must be defined');
          invariant(action.field, 'Relate: Mutation listener action field must be defined');
          warning(
            (['INCREMENT', 'DECREMENT', 'APPEND', 'PREPEND']).indexOf(action.type) !== -1,
            `Relate: Mutation listener action invalid action type '${action.type}'`
          );

          if (action.type === 'INCREMENT' || action.type === 'DECREMENT') {
            const value = get(connector.data, action.field);

            if (typeof value === 'number') {
              set(
                connector.data,
                action.field,
                action.type === 'INCREMENT' ? value + 1 : value - 1
              );
            } else {
              warning(
                false,
                'Relate: Could not resolve a mutation listener, value not found in connector %s',
                action.field
              );
            }
          } else if (action.type === 'APPEND' || action.type === 'PREPEND') {
            let nodesToAdd = [];

            if (relativeNodes) {
              if (action.select) {
                nodesToAdd =
                  relativeNodes[action.select].constructor === Array ?
                  relativeNodes[action.select] :
                  [relativeNodes[action.select]];
              } else {
                nodesToAdd =
                  relativeNodes.constructor === Array ?
                  relativeNodes :
                  [relativeNodes];
              }
            }

            if (action.accept) {
              invariant(
                typeof action.accept === 'function',
                'Relate: Mutation listener accept field must be a function'
              );
              nodesToAdd = filter(
                nodesToAdd,
                (item) => action.accept(db.getNode(item))
              );
            }

            if (nodesToAdd.length > 0) {
              iterateField(action.field, connector.data, (dataField, parent, field) => {
                if (dataField.constructor === Array) {
                  parent[field] =
                    action.type === 'APPEND' ?
                    [...dataField, ...nodesToAdd] :
                    [...nodesToAdd, ...dataField];

                  // add new nodes to listen for
                  const listensPath = action.field.constructor === Array ? action.field[0] : action.field;
                  set(
                    connector.listens,
                    listensPath,
                    union(get(connector.listens, listensPath), nodes)
                  );
                } else {
                  warning(
                    false,
                    'Relate: Could not resolve a mutation action listener, array not found in %s',
                    field
                  );
                }
              });
            }
          }
        });
      }
    });
    return connsToUpdate;
  }

  // Removes a node from all the connectors who have it
  // return connectors to update
  removeNode (nodeId) {
    const connsToUpdate = [];
    forEach(this.connectors, (connector, connectorId) => {
      forEach(connector.listens, (listenIds, name) => {
        const ind = listenIds.indexOf(nodeId);
        if (ind !== -1) {
          connsToUpdate.indexOf(connectorId) === -1 && connsToUpdate.push(connectorId);
          listenIds.splice(ind, 1);

          // Check data as well
          const nameData = connector.data[name];
          if (nameData && nameData.constructor === Array) {
            const indData = nameData.indexOf(nodeId);
            if (indData !== -1) {
              nameData.splice(indData, 1);
            }
          } else if (nameData === nodeId) {
            this.connectors[connectorId].data[name] = null; // Singleton mark as dirty
          }
        }
      });
    });
    return connsToUpdate;
  }

  deleteConnector (connectorId) {
    this.connectors[connectorId] && delete this.connectors[connectorId];
  }
}
