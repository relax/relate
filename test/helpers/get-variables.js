import expect from 'expect';

import getVariables from '../../lib/helpers/get-variables';

describe('Get variables from query to props map helper', () => {
  it('Processes fragments with no variables', () => {
    const result = getVariables({
      fragments: {
        page: {
          _id: 1,
          title: 1
        }
      }
    });
    expect(result).toEqual({});
  });

  it('Ignores variables to non existing fragments', () => {
    const result = getVariables({
      fragments: {
        page: {
          _id: 1,
          title: 1
        }
      },
      variables: {
        user: {
          _id: 'something'
        }
      }
    });
    expect(result).toEqual({});
  });

  it('Calculates valid fragments and variables', () => {
    const result = getVariables({
      fragments: {
        page: {
          _id: 1,
          title: 1
        }
      },
      variablesTypes: {
        page: {
          _id: 'ID!'
        }
      },
      variables: {
        page: {
          _id: 'something'
        }
      }
    });
    expect(result).toEqual({
      page: {
        _id: {
          type: 'ID!',
          value: 'something'
        }
      }
    });
  });

  it('Throws an error if variables types is not defined a set of variables', () => {
    expect(() => {
      getVariables({
        fragments: {
          page: {
            _id: 1,
            title: 1
          }
        },
        variablesTypes: {
          user: {
            _id: 'ID!'
          }
        },
        variables: {
          page: {
            _id: 'something'
          }
        }
      });
    }).toThrow();
  });

  it('Throws an error if some variable does not have a type associated', () => {
    expect(() => {
      getVariables({
        fragments: {
          page: {
            _id: 1,
            title: 1
          }
        },
        variablesTypes: {
          page: {
            _id: 'ID!'
          }
        },
        variables: {
          page: {
            _id: 'something',
            name: 'some'
          }
        }
      });
    }).toThrow();
  });

  it('Throws an error if some required variable is not met', () => {
    expect(() => {
      getVariables({
        fragments: {
          page: {
            _id: 1,
            title: 1
          }
        },
        variablesTypes: {
          page: {
            _id: 'ID!',
            name: 'String!'
          }
        },
        variables: {
          page: {
            _id: 'something'
          }
        }
      });
    }).toThrow();
  });

  it('Does not include undefined non required variables', () => {
    const result = getVariables({
      fragments: {
        page: {
          _id: 1,
          title: 1
        }
      },
      variablesTypes: {
        page: {
          _id: 'ID!',
          name: 'String'
        }
      },
      variables: {
        page: {
          _id: 'something'
        }
      }
    });
    expect(result).toEqual({
      page: {
        _id: {
          type: 'ID!',
          value: 'something'
        }
      }
    });
  });

  it('Supports deep variables', () => {
    const result = getVariables({
      fragments: {
        user: {
          name: 1,
          page: {
            _id: 1,
            title: 1,
            posts: {
              date: 1
            }
          }
        }
      },
      variablesTypes: {
        user: {
          name: 'String!',
          page: {
            _id: 'ID!',
            posts: {
              date: 'Float!'
            }
          }
        }
      },
      variables: {
        user: {
          name: 'some',
          page: {
            _id: 'something',
            posts: {
              date: 12345
            }
          }
        }
      }
    });
    expect(result).toEqual({
      user: {
        name: {
          type: 'String!',
          value: 'some'
        },
        page: {
          _id: {
            type: 'ID!',
            value: 'something'
          },
          posts: {
            date: {
              type: 'Float!',
              value: 12345
            }
          }
        }
      }
    });
  });
});
