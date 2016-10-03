import expect from 'expect';

import capture from '../../lib/helpers/capture';

describe('Capture queries and mutations helper', () => {
  it('returns null when no respective data', () => {
    const action = {
      data: {
        setting: {id: 'set1'},
        something: [{id: 'set1'}, {id: 'set2'}],
        relate_0: [{id: 'set3'}, {id: 'set4'}]
      },
      scopes: {
        relate_0: 'something'
      }
    };
    const result = capture(action, 'settings');

    expect(result).toBe(null);
  });

  it('captures from data and scoped data', () => {
    const action = {
      data: {
        settings: [{id: 'set1'}, {id: 'set2'}],
        relate_0: [{id: 'set3'}, {id: 'set4'}]
      },
      scopes: {
        relate_0: 'settings'
      }
    };
    const result = capture(action, 'settings');

    expect(result).toEqual([
      {id: 'set1'}, {id: 'set2'},
      {id: 'set3'}, {id: 'set4'}
    ]);
  });
});
