---
layout: default
id: settings
title: Changing requests endpoint and headers
prev: mutations.html
next: intersect.html
---

It is often necessary to set additional headers on the GraphQL requests or change the endpoint to where the requests are made. By default Relate has the following configuration:

```js
{
  endpoint: '/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
```

You can change these defaults in two ways: using a reducer factory method or sending them in the initial state of the reducer.

## Reducer Factory

This is a helper method to include your reducer, to which you can pass a settings which is merged with the defaults above. To do this, **instead of** including the reducer in your combine reducers like this:

```js
import {combineReducers} from 'redux';
import {relateReducer} from 'relate-js';

export default combineReducers({
  // ... other reducers you might have
  relateReducer
});
```

You do it with the reducer factory, like so:

```js
import {combineReducers} from 'redux';
import {relateReducerInit} from 'relate-js';

export default combineReducers({
  // ... other reducers you might have
  relateReducer: relateReducerInit({
    endpoint: 'http://anotherserver/graphql'
  })
});
```

In the example above we're changing the default endpoint but the headers remain the default ones. But if you change the headers it won't merge with the defaults. So if you do this:

```js
relateReducerInit({
  headers: {
    something: true
  }
})
```

Your final configuration will be like this:

```js
{
  endpoint: '/graphql',
  headers: {
    something: 1
  }
}
```

## Changing Reducer Initial State

You can also define your configuration when creating the Redux store by passing configuration through the `initialState`.

```js
const initialState = {
  relateReducer: {
    endpoint: '/graphql',
    headers: {
      'x-important-header': 'foo'
    }
  }
};
const store = configureStore(intialState);
```

Note that none of the values are merged with the defaults. So if you **only** want to change the endpoint you'd have to set the initial state to:

```js
const initialState = {
  relateReducer: {
    endpoint: 'http://anotherserver/graphql',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};
```

## Mutating Headers and Endpoint

You also might want to set new headers or change the endpoint for different resources. Relate allows you to modify these using standard Redux actions from anywhere in your application.

Here's an example of setting an authorization header (for example, setting a bearer token after successfully logging in).

```js
import {setHeader} from 'relate-js';
dispatch(setHeader('Authorization', 'Bearer 123456'));
```

If no longer needed, a header can be removed:

```js
import {removeHeader} from 'relate-js';
dispatch(removeHeader('Authorization'));
```

You can also change the endpoint:

```js
import {setEndpoint} from 'relate-js';
dispatch(setEndpoint('/different-graphql-endpoint'));
```
