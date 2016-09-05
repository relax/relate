import expect from 'expect';

import Relate, {
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
  getDataDependencies
} from '../lib';

describe('Relate', () => {
  it('Exposes public interface', () => {
    expect(Relate).toBeAn(Object);
    expect(Relate).toEqual({
      dataConnect,
      rootDataConnect,
      relateReducer,
      relateReducerInit,
      removeHeader,
      setEndpoint,
      setHeader,
      actionTypes,
      mutation,
      mergeFragments,
      setBody,
      removeBody,
      getDataDependencies
    });

    expect(dataConnect).toBeA(Function);
    expect(rootDataConnect).toBeA(Function);
    expect(relateReducer).toBeA(Function);
    expect(relateReducerInit).toBeA(Function);
    expect(actionTypes).toBeA(Object);
    expect(mutation).toBeA(Function);
    expect(mergeFragments).toBeA(Function);
    expect(getDataDependencies).toBeA(Function);
  });
});
