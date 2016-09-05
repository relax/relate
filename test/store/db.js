import expect from 'expect';

import DB from '../../lib/store/db';

describe('DB', () => {
  it('Starts an empty db object', () => {
    const db = new DB();
    expect(db.db).toEqual({});
  });

  const db = new DB();

  it('Adds a single node', () => {
    db.mergeChanges({
      a: {
        _id: 'a',
        title: 'something'
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      }
    });
  });

  it('Adds more nodes', () => {
    db.mergeChanges({
      b: {
        _id: 'b',
        title: 'something B'
      },
      c: {
        _id: 'c',
        title: 'something C'
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something B'
      },
      c: {
        _id: 'c',
        title: 'something C'
      }
    });
  });

  it('Makes changes to nodes', () => {
    db.mergeChanges({
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      }
    });
  });

  it('Adds nodes with nested structures', () => {
    db.mergeChanges({
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice'
        }
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      },
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice'
        }
      }
    });
  });

  it('Updates nodes with nested structures', () => {
    db.mergeChanges({
      d: {
        _id: 'd',
        nested: {
          changing: 'cool'
        }
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'something'
      },
      b: {
        _id: 'b',
        title: 'something about B'
      },
      c: {
        _id: 'c',
        title: 'something about C'
      },
      d: {
        _id: 'd',
        title: 'something about D',
        nested: {
          something: 'nice',
          changing: 'cool'
        }
      }
    });
  });

  it('Gets single node data', () => {
    const data = db.getData({
      page: 'a'
    }, {
      page: {
        _id: 1,
        title: 1
      }
    });
    expect(data).toEqual({
      page: {
        _id: 'a',
        title: 'something'
      }
    });
  });

  it('Gets single node data fragmented', () => {
    const data = db.getData({
      page: 'a'
    }, {
      page: {
        _id: 1
      }
    });
    expect(data).toEqual({
      page: {
        _id: 'a'
      }
    });
  });

  it('Gets null data', () => {
    const data = db.getData({page: null}, {
      page: {
        _id: 1,
        title: 1
      }
    });
    expect(data).toEqual({page: null});
  });

  it('Gets array of nodes', () => {
    const data = db.getData({
      pages: ['a', 'b']
    }, {
      pages: {
        _id: 1,
        title: 1
      }
    });
    expect(data).toEqual({
      pages: [
        {
          _id: 'a',
          title: 'something'
        },
        {
          _id: 'b',
          title: 'something about B'
        }
      ]
    });
  });

  it('Gets nested node', () => {
    const data = db.getData({
      page: {item: 'a'}
    }, {
      page: {
        item: {
          _id: 1,
          title: 1
        }
      }
    });
    expect(data).toEqual({
      page: {
        item: {
          _id: 'a',
          title: 'something'
        }
      }
    });
  });

  it('Gets nested array of node', () => {
    const data = db.getData({
      result: {
        item: ['a', 'b']
      }
    }, {
      result: {
        item: {
          _id: 1,
          title: 1
        }
      }
    });
    expect(data).toEqual({
      result: {
        item: [
          {
            _id: 'a',
            title: 'something'
          },
          {
            _id: 'b',
            title: 'something about B'
          }
        ]
      }
    });
  });

  it('Adds nodes with Link nodes', () => {
    // Clean up
    db.db = {};

    db.mergeChanges({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: 'a'
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: ['a', 'b']
      }
    });
    expect(db.db).toEqual({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: 'a'
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: ['a', 'b']
      }
    });
  });

  it('Gets data node with a Link', () => {
    const data = db.getData({
      page: 'b'
    }, {
      page: {
        _id: 1,
        title: 1,
        linked: {
          _id: 1,
          title: 1
        }
      }
    });
    expect(data).toEqual({
      page: {
        _id: 'b',
        title: 'B',
        linked: {
          _id: 'a',
          title: 'A'
        }
      }
    });
  });

  it('Gets data node with array of Links', () => {
    const data = db.getData({
      page: 'c'
    }, {
      page: {
        _id: 1,
        title: 1,
        linked: {
          _id: 1,
          title: 1,
          linked: {
            _id: 1,
            title: 1
          }
        }
      }
    });
    expect(data).toEqual({
      page: {
        _id: 'c',
        title: 'C',
        linked: [
          {
            _id: 'a',
            title: 'A',
            linked: null
          },
          {
            _id: 'b',
            title: 'B',
            linked: {
              _id: 'a',
              title: 'A'
            }
          }
        ]
      }
    });
  });

  it('Removes node', () => {
    // Clean up
    db.db = {};

    db.mergeChanges({
      a: {
        _id: 'a',
        title: 'A'
      },
      b: {
        _id: 'b',
        title: 'B',
        linked: 'a'
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: ['a', 'b']
      }
    });
    db.removeNode('a');
    expect(db.db).toEqual({
      b: {
        _id: 'b',
        title: 'B',
        linked: 'a'
      },
      c: {
        _id: 'c',
        title: 'C',
        linked: ['a', 'b']
      }
    });
    db.removeNode('b');
    expect(db.db).toEqual({
      c: {
        _id: 'c',
        title: 'C',
        linked: ['a', 'b']
      }
    });
  });
});
