---
layout: default
id: root-data-connect
title: Root Data Connect
prev: reducer.html
next: fragments.html
---

Next thing to do is add the root data connector. This is responsible for collecting all data connectors' requests and bundle them to make a single request with GraphQL. This passes down a `fetchData` function through context, so it should be inserted into the entry component of your App. Here's how to:

**With ES7 decorator**

```js
import React, {Component} from 'react';
import {rootDataConnect} from 'relate-js';

@rootDataConnect()
export default class App extends Component {
  render () {
    return (
      ...
    );
  }
}
```

**With ES6**

```js
import React, {Component} from 'react';
import {rootDataConnect} from 'relate-js';

class App extends Component {
  render () {
    return (
      ...
    );
  }
}

export default rootDataConnect()(App);
```

Your App is now ready to collect data requirements and request them in a single request. Nice! In the next page let's see how to declare those data requirements with fragments.
