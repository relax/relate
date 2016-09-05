import expect from 'expect';
import {createStore} from 'redux';

import {relateReducer, setHeader, removeHeader, setEndpoint} from '../../lib';

describe('Settings', () => {
  it('Default headers and endpoint are correctly set', () => {
    const expectedState = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {},
      endpoint: '/graphql'
    };

    expect(relateReducer()).toEqual(expectedState);
  });

  it('Redux store initialState applied', () => {
    const initialState = {
      endpoint: '/test'
    };
    const store = createStore(relateReducer, initialState);

    expect(store.getState().endpoint).toEqual('/test');
    expect(store.getState().headers).toNotExist();
  });

  it('setHeader action correctly adds header', () => {
    const state = relateReducer(undefined, setHeader('foo', 'bar'));

    expect(state.headers.foo).toEqual('bar');
  });

  it('Duplicate setHeader overwrites the previous header', () => {
    const state1 = relateReducer(undefined, setHeader('foo', 'bar'));
    const state2 = relateReducer(state1, setHeader('foo', 'bar2'));

    expect(state2.headers.foo).toEqual('bar2');
  });

  it('removeHeader correctly removes header', () => {
    const state1 = relateReducer(undefined, setHeader('foo', 'bar'));
    const state2 = relateReducer(state1, removeHeader('foo'));

    expect(state2.headers.foo).toNotExist();
  });

  it('setEndpoint correctly sets endpoint', () => {
    const state = relateReducer(undefined, setEndpoint('/test'));

    expect(state.endpoint).toEqual('/test');
  });
});
