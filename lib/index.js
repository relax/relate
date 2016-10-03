import {mergeFragments} from 'relax-fragments';

import actionTypes from './actions/types';
import capture from './helpers/capture';
import dataConnect from './decorators/data-connect';
import getDataDependencies from './server/get-data-dependencies';
import mutation from './actions/mutation';
import rootDataConnect from './decorators/root-data-connect';
import {setHeader, removeHeader, setEndpoint, setBody, removeBody} from './actions/settings';
import {relateReducer, relateReducerInit} from './reducer/reducer';

export {
  dataConnect,
  rootDataConnect,
  relateReducer,
  relateReducerInit,
  actionTypes,
  mutation,
  mergeFragments,
  setHeader,
  removeHeader,
  setEndpoint,
  setBody,
  removeBody,
  getDataDependencies,
  capture
};

export default {
  dataConnect,
  rootDataConnect,
  relateReducer,
  relateReducerInit,
  actionTypes,
  mutation,
  mergeFragments,
  setHeader,
  removeHeader,
  setEndpoint,
  setBody,
  removeBody,
  getDataDependencies,
  capture
};
