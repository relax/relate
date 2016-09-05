---
layout: default
id: data-connect
title: Data Connect
prev: fragments.html
next: mutations.html
---

Data connect is where all the fancy stuff happens. Relate's `dataConnect` is an extension of React Redux's `connect`, so it has the following parameters:

```js
dataConnect([mapStateToProps], [mapDispatchToProps], [RelateConfig])
```

If you don't want to map anything from the state and the dispatch, you also just:

```js
dataConnect([RelateConfig])
```

Relate handles the fragments you requested from the server automatically into the wrapped component props so you don't need to fetch nothing from the Relate's reducer.

Let's see an example on how to configure our `dataConnect` to fetch a list of pages:

```js
import React, {PropTypes, Component} from 'react';
import {dataConnect} from 'relate-js';

@dataConnect(
  (state) => ({
    sort: state.router.location.query.sort || '_id',
    order: state.router.location.query.order || 'desc'
  }),
  null,
  (props) => ({
    fragments: {
      pages: {
        _id: 1,
        title: 1,
        state: 1
      }
    },
    variablesTypes: {
      pages: {
        sort: 'String',
        order: 'String'
      }
    },
    initialVariables: {
      pages: {
        sort: props.sort,
        order: props.order
      }
    },
    mutations: {
      addPage: [
        {
          type: 'PREPEND',
          field: 'pages'
        }
      ]
    }
  })
)
export default class PagesContainer extends Component {
  static propTypes = {
    pages: PropTypes.array,
    sort: PropTypes.string.isRequired,
    order: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired
  };

  static defaultProps = {
    pages: []
  };

  componentWillReceiveProps (nextProps) {
    if (nextProps.sort !== this.props.sort || nextProps.order !== this.props.order) {
      this.props.relate.setVariables({
        pages: {
          sort: nextProps.sort,
          order: nextProps.order
        }
      });
    }
  }

  render () {
    let result;
    if (this.props.loading) {
      result = (
        <div>loading</div>
      );
    } else {
      result = (
        <div> ... </div>
      );
    }
    return result;
  }
}
```

The example is a bit extensive to show every part of it. Let's go through what's happening in the `dataConnect` first. The first two arguments are related to Redux React `connect`. First we fetch two values from the state that we'll use to add as variables in our query. The second is the dispatch map, since we'll use none, it's set `null`.

Now the special part comes in the third argument of `dataConnect` where we have:

```js
(props) => ({
  fragments: {
    pages: {
      _id: 1,
      title: 1,
      state: 1
    }
  },
  variablesTypes: {
    pages: {
      sort: 'String',
      order: 'String'
    }
  },
  initialVariables: {
    pages: {
      sort: props.sort,
      order: props.order
    }
  },
  mutations: {
    addPage: [
      {
        type: 'PREPEND',
        field: 'pages'
      }
    ]
  }
})
```

This is where we "tell" Relate the data dependencies of this container.

## Fragments

So, first thing to do is define the `fragments`. Usually these come from a presentational component static fragments that your container renders, but to keep it simple we've put it directly here. With these fragments we're requesting `pages` with a set of fields but we want to send some variables to the query as well.

## Variables Types

To include variables, we first need to define which types of variables we'll be sending. This is done in the `variablesTypes`, you can specify here every variables types it can have, even if you don't include them. You can also define some as mandatory like the following:

```js
variablesTypes: {
  pages: {
    sort: 'String!',
    order: 'String!',
    search: 'String'
  }
}
```

In the above we're defining that when querying for pages there needs to be a `sort` and `order` variables, and an optional `search` one. If you're familiar with GraphQL this should be pretty straightforward.

## Initial Variables

Now we're just missing how to set this variables. This is done in the `initialVariables` property, and since we have access to the props (including the ones mapped from redux state) we can define them based on them, thus:

```js
initialVariables: {
  pages: {
    sort: props.sort,
    order: props.order
  }
}
```

Relate will use this variables to calculate the initial query variables. You can set variables mid component's lifecycle, but we'll get to that in a bit.

## Mutations

Since we're defining an `_id` in our `pages` fragments, Relate will take them as nodes. Any update or change to that node will automatically be reflected in this list. So for example, if in a component far far away we make a mutation to node with the same `_id` as one of the ones included in the list of pages retrieved here. The list will be updated to reflect that change. Pretty huh? Let's see an example, if the result from this query to pages we receive the following:

```js
[
  {
    _id: 'a',
    title: 'Page A',
    state: 'draft'
  },
  {
    _id: 'b',
    title: 'Page B',
    state: 'draft'
  }
]
```

If in some mutation, for example, `updatePageState` we mutate the page with `_id` b and set the state to published. This list will be updated to reflect that change:

```js
[
  {
    _id: 'a',
    title: 'Page A',
    state: 'draft'
  },
  {
    _id: 'b',
    title: 'Page B',
    state: 'published'
  }
]
```

Pretty cool, what about removes? Removes are also automatically handled by Relate. If some remove mutation is done to a page that is in this list, the list will be updated as well.

Now only missing adds right? Since Relate is agnostic to your data schema it can't really know that an `addPage` result should come into this list. And shouldn't you be in charge on where to add it? So, for this you can configure a mutations property:

```js
mutations: {
  addPage: [
    {
      type: 'PREPEND',
      field: 'pages'
    }
  ]
}
```

What's happening here? We're telling Relate that when a mutation `addPage` is triggered it should prepend it to this container's `pages` field. This has its advantages since we can make something like the following:

```js
mutations: {
  addPage: [
    {
      type: props.order === 'asc' ? 'PREPEND' : 'APPEND',
      field: 'pages'
    }
  ]
}
```

We can make one of the following operations types:

* **PREPEND** - prepends an entry or an array of entries to a list.
* **APPEND** - appends an entry or an array of entries to a list.
* **INCREMENT** - increments a number.
* **DECREMENT** - increments a number.

So for example, if we have a pagesCount in our fragments as well, we can set an increment operation for it:

```js
mutations: {
  addPage: [
    {
      type: props.order === 'asc' ? 'PREPEND' : 'APPEND',
      field: 'pages'
    },
    {
      type: 'INCREMENT',
      field: 'pagesCount'
    }
  ]
}
```

## Relate Props

We might want to update something during the component lifecycle, being it some new props arrived or from an user interaction. When you use `dataConnect` your wrapped component will receive the following as props from relate:

* **loading** - boolean value, true when your container is waiting for data.
* **relate** - an object containing the following:
  * **setVariables** - function for setting new variables
  * **variables** - the current in use variables

We can use the loading prop to set a loading state as we have in the render function:

```js
render () {
  let result;
  if (this.props.loading) {
    result = (
      <div>loading</div>
    );
  } else {
    result = (
      <div> ... </div>
    );
  }
  return result;
}
```

When `loading` is set to false, your data was received and processed so you can render in this example's case the pages list.

You can also use `setVariables` to trigger a new fetch with different variables for your connector. In this example we do this when the prop `order` or `sort` has changed:

```js
componentWillReceiveProps (nextProps) {
  if (nextProps.sort !== this.props.sort || nextProps.order !== this.props.order) {
    this.props.relate.setVariables({
      pages: {
        sort: nextProps.sort,
        order: nextProps.order
      }
    });
  }
}
```

That's all for the data connect. Let's see how to make Relate mutations in the next page.
