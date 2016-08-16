import expect from 'expect';

import {relateReducer, relateReducerInit, actionTypes} from '../../lib';


describe('Reducer', () => {
  it('Does not alter state if not a Relate action', () => {
    const state = {something: 1};
    const newState = relateReducer(state, {type: 'not'});
    expect(newState).toBe(state);
    expect(newState).toEqual(state);
  });

  it('Reducer init returns with merged settings', () => {
    const reducer = relateReducerInit({endpoint: '/test'});
    const newState = reducer();
    expect(newState).toEqual({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {},
      endpoint: '/test'
    });
    const reducer1 = relateReducerInit({headers: {test: 1}});
    const newState1 = reducer1();
    expect(newState1).toEqual({
      headers: {
        test: 1
      },
      body: {},
      endpoint: '/test'
    });

    // revert
    const reducer2 = relateReducerInit({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      endpoint: '/graphql'
    });
    const newState2 = reducer2();
    expect(newState2).toEqual({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: {},
      endpoint: '/graphql'
    });
  });

  it('Does not alter state if query action does not have data or fragments', () => {
    const state = {something: 1};
    const newState = relateReducer(state, {type: actionTypes.query});
    const newState1 = relateReducer(state, {type: actionTypes.query, data: {}});
    expect(newState).toBe(state);
    expect(newState).toEqual(state);
    expect(newState1).toBe(state);
    expect(newState1).toEqual(state);
  });

  it('State returns connectors data from what was requested', () => {
    const state = {};
    const newState = relateReducer(state, {
      type: actionTypes.query,
      data: {
        pages: [{_id: 'a', title: 'some'}, {_id: 'b', title: 'another'}],
        page: {_id: 'c', title: 'other'},
        root: {
          list: [{_id: 123, title: 'd entry'}, {_id: 1234, title: 'e entry'}]
        }
      },
      fragments: {
        pages: {
          _id: 1,
          title: 1
        },
        page: {
          _id: 1,
          title: 1
        },
        root: {
          list: {
            _id: 1,
            title: 1
          }
        }
      },
      connectors: {
        connector1: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            }
          }
        },
        connector2: {
          fragments: {
            pages: {
              _id: 1,
              title: 1
            },
            page: {
              _id: 1,
              title: 1
            }
          }
        },
        connector3: {
          fragments: {
            root: {
              list: {
                _id: 1,
                title: 1
              }
            }
          }
        }
      }
    });
    expect(newState).toNotBe(state);
    expect(newState).toEqual({
      connector1: {
        pages: [
          {
            _id: 'a',
            title: 'some'
          },
          {
            _id: 'b',
            title: 'another'
          }
        ]
      },
      connector2: {
        pages: [
          {
            _id: 'a',
            title: 'some'
          },
          {
            _id: 'b',
            title: 'another'
          }
        ],
        page: {_id: 'c', title: 'other'}
      },
      connector3: {
        root: {
          list: [
            {
              _id: 123,
              title: 'd entry'
            },
            {
              _id: 1234,
              title: 'e entry'
            }
          ]
        }
      }
    });
  });
});
