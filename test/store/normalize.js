import expect from 'expect';

import normalize from '../../lib/store/normalize';

describe('Nodes normalization', () => {
  it('Single node', () => {
    const result = normalize({
      _id: 'a',
      title: 'A'
    }, {
      _id: 1,
      title: 1
    });

    expect(result).toEqual({
      relativeNodes: 'a',
      nodes: ['a'],
      changes: {
        a: {
          _id: 'a',
          title: 'A'
        }
      }
    });
  });

  it('Null node', () => {
    const result = normalize(null, {
      _id: 1,
      title: 1
    });

    expect(result).toEqual({
      relativeNodes: null,
      nodes: [],
      changes: {}
    });
  });

  it('Array node', () => {
    const result = normalize([
      {
        _id: 'a',
        title: 'A'
      },
      {
        _id: 'b',
        title: 'B'
      }
    ], {
      _id: 1,
      title: 1
    });

    expect(result).toEqual({
      relativeNodes: ['a', 'b'],
      nodes: ['a', 'b'],
      changes: {
        a: {
          _id: 'a',
          title: 'A'
        },
        b: {
          _id: 'b',
          title: 'B'
        }
      }
    });
  });

  it('Nested nodes', () => {
    const result = normalize([
      {
        _id: 'a',
        title: 'A',
        user: {
          _id: 'user1',
          username: 'User 1'
        }
      },
      {
        _id: 'b',
        title: 'B',
        user: {
          _id: 'user2',
          username: 'User 2'
        }
      },
      {
        _id: 'c',
        title: 'C',
        user: {
          _id: 'user1',
          username: 'User 1'
        }
      }
    ], {
      _id: 1,
      title: 1,
      user: {
        _id: 1,
        username: 1
      }
    });

    expect(result).toEqual({
      relativeNodes: ['a', 'b', 'c'],
      nodes: ['a', 'user1', 'b', 'user2', 'c'],
      changes: {
        a: {
          _id: 'a',
          title: 'A',
          user: 'user1'
        },
        b: {
          _id: 'b',
          title: 'B',
          user: 'user2'
        },
        c: {
          _id: 'c',
          title: 'C',
          user: 'user1'
        },
        user1: {
          _id: 'user1',
          username: 'User 1'
        },
        user2: {
          _id: 'user2',
          username: 'User 2'
        }
      }
    });
  });

  it('Deep nested nodes', () => {
    const result = normalize([
      {
        _id: 'a',
        title: 'A',
        user: {
          _id: 'user1',
          username: 'User 1',
          nested: {
            _id: 'nested1',
            something: 'something 1'
          }
        },
        list: [
          {
            _id: 'list1'
          },
          {
            _id: 'list2'
          }
        ]
      }
    ], {
      _id: 1,
      title: 1,
      user: {
        _id: 1,
        username: 1,
        nested: {
          _id: 1,
          something: 1
        }
      },
      list: {
        _id: 1
      }
    });

    expect(result).toEqual({
      relativeNodes: ['a'],
      nodes: ['a', 'user1', 'nested1', 'list1', 'list2'],
      changes: {
        a: {
          _id: 'a',
          title: 'A',
          user: 'user1',
          list: ['list1', 'list2']
        },
        user1: {
          _id: 'user1',
          username: 'User 1',
          nested: 'nested1'
        },
        nested1: {
          _id: 'nested1',
          something: 'something 1'
        },
        list1: {
          _id: 'list1'
        },
        list2: {
          _id: 'list2'
        }
      }
    });
  });

  it('Arbitrary structure nodes (without id)', () => {
    const result = normalize([
      {
        title: 'A',
        user: {
          _id: 'user1',
          username: 'User 1'
        }
      },
      {
        title: 'B',
        user: {
          _id: 'user1',
          username: 'User 1'
        }
      }
    ], {
      title: 1,
      user: {
        _id: 1,
        username: 1
      }
    });

    const result1 = normalize({
      items: [
        {
          _id: 'a',
          title: 'A',
          user: {
            _id: 'user1',
            username: 'User 1'
          }
        },
        {
          _id: 'b',
          title: 'B',
          user: {
            _id: 'user1',
            username: 'User 1'
          }
        }
      ],
      pagesCount: 2
    }, {
      items: {
        _id: 1,
        title: 1,
        user: {
          _id: 1,
          username: 1
        }
      },
      pagesCount: 1
    });

    expect(result).toEqual({
      relativeNodes: [
        {
          title: 'A',
          user: 'user1'
        }, {
          title: 'B',
          user: 'user1'
        }
      ],
      nodes: ['user1'],
      changes: {
        user1: {
          _id: 'user1',
          username: 'User 1'
        }
      }
    });

    expect(result1).toEqual({
      relativeNodes: {
        items: ['a', 'b'],
        pagesCount: 2
      },
      nodes: ['a', 'user1', 'b'],
      changes: {
        a: {
          _id: 'a',
          title: 'A',
          user: 'user1'
        },
        b: {
          _id: 'b',
          title: 'B',
          user: 'user1'
        },
        user1: {
          _id: 'user1',
          username: 'User 1'
        }
      }
    });
  });
});
