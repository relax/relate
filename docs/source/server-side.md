---
layout: default
id: server-side
title: Server Side Rendering with Relate
prev: mutations.html
next: settings.html
---

Relate provides a server side rendering function, that fetches data dependencies with a performant components tree trespasser. Let's see an example on how to use it:

```js
// ...
import {getDataDependencies} from 'relate-js';

// create redux store
// ...

// get component with redux store e.g.
const component = (
  <Provider store={store}>
    <ReduxRouter />
  </Provider>
);

// get relate js data dependencies
await getDataDependencies(component, async (request) => await graphql(
  schema,
  request.query,
  {
    isAuthenticated: true,
    user: req.user
  },
  request.variables
));

const state = store.getState();
const initialState = serialize(state); // needs to be inserted in your html result
const markup = renderToString(component);

// final render html
res.status(200).send(markup);
```

Seems complicated? It isn't really, if you're familiar with redux and ES7 this should be quite easy to follow. The only relevant and different part that is relative to Relate is the following:

```js
await getDataDependencies(component, async (request) => await graphql(
  schema,
  request.query,
  {
    isAuthenticated: true,
    user: req.user
  },
  request.variables
));
```

Let's break this down, Relate provides an async function `getDataDependencies`, which receives from arguments:

* __Component__ - a react component to be traversed to look for data dependencies.
* __Resolve function__ - a function to where the resulting GraphQL query is thrown.

The resolve function is quite simple, it makes a call to GraphQL to resolve the calculated data dependencies, this will return the result from the data the components need. Don't worry about store handling, it is all done internally by Relate. This resolve function takes up an object as argument with the following properties:

* __query__ - the GraphQL query string.
* __variables__ - the variables needed for the query string.

Simple right? Now, after this, just make sure to serialize the redux store state, and re hydrate the store on the client side with that value.
