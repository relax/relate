---
layout: default
id: reducer
title: Reducer
prev: installation.html
next: root-data-connect.html
---

First thing to do is add the Relate reducer to your Redux reducers. This will assume you're using Redux's `combineReducers`. The process is really simple, in the file you're combining your reducers you just have to add `relateReducer` which comes from `relate-js`. We'll be using ES6 throughout the examples, but the same can be achieved with ES5. So, you'll have something like the following:

```js
import {combineReducers} from 'redux';
import {relateReducer} from 'relate-js';

const rootReducer = combineReducers({
  // ... other reducers you might have
  relateReducer
});

export default rootReducer;
```

Pretty simple right? You now have the Relate's reducer all setup. This will collect the queries and mutations and provide data connectors the data they requested for.
