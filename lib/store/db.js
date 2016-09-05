import forEach from 'lodash.foreach';
import invariant from 'invariant';
import isArray from 'lodash.isarray';
import mergeWith from 'lodash.mergewith';

import iterateField from '../helpers/iterate-field';

/* eslint-disable consistent-return */
function mergeCustomizer (objVal, srcVal) {
  if (isArray(objVal)) {
    return srcVal;
  }
}
/* eslint-enable consistent-return */

// The store is responsible for holding and managing data
export default class DB {
  constructor () {
    // Local database
    // composed of data nodes, e.g.
    // {
    //   56d0583eb0dc646f07b05cf2: {...},
    //   568fc7d152e76bc604a74520: {...}
    // }
    this.db = {};
  }

  mergeChanges (changes) {
    mergeWith(this.db, changes, mergeCustomizer);
  }

  removeNode (id) {
    this.db[id] && delete this.db[id];
  }

  // XXX UNDOCUMENTED && UNTESTED
  performUserMutate ({nodeId, type, field}, nodes) {
    invariant(nodeId, 'Relate: mutate does not have a nodeId defined');
    invariant(type, 'Relate: mutate does not have a type defined');
    invariant(field, 'Relate: mutate does not have a field defined');
    let result = [];
    const nodeToMutate = this.db[nodeId];
    if (nodeToMutate) {
      iterateField(field, nodeToMutate, (dataField, parent, lastField) => {
        // add nodes to data field
        const nodeToMutateNodes = dataField.get();
        const nodesArr = nodes.constructor === Array ? nodes : [nodes];
        parent[lastField] = [...nodeToMutateNodes, ...nodesArr];
        result = [nodeId];
      });
    }
    return result;
  }

  getData (data, fragment) {
    const result = {};

    forEach(fragment, (frag, propertyName) => {
      let dataValue = data[propertyName];
      if (dataValue === undefined) dataValue = null;

      if (typeof frag === 'object' && dataValue) {
        const isList = dataValue && dataValue.constructor === Array;
        const isId = typeof dataValue !== 'object' && this.db[dataValue];

        if (isList) {
          const list = [];
          forEach(dataValue, (piece) => {
            const isPieceId = typeof piece !== 'object' && this.db[piece];
            list.push(this.getData(isPieceId ? this.db[piece] : piece, frag));
          });
          result[propertyName] = list;
        } else if (isId) {
          result[propertyName] = this.getData(this.db[dataValue], frag);
        } else {
          result[propertyName] = this.getData(dataValue, frag);
        }
      } else {
        result[propertyName] = dataValue;
      }
    });

    return result;
  }

  getNode (id) {
    return this.db[id];
  }
}
