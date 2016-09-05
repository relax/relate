---
layout: default
id: fragments
title: Fragments
prev: root-data-connect.html
next: data-connect.html
---

Before diving into the data connect, let's see how to define fragments in Relate. Instead of setting up GraphQL fragments as you do in Relay, in Relate fragments are defined as a simple, plain JavaScript object. You do this by attributing the properties you want with a truthy value, can be `1` or `true`. For example:

```js
{
  pages: {
    _id: 1,
    title: 1,
    date: 1
  }
}
```

You can also define nested fragments like so:

```js
{
  pages: {
    _id: 1,
    title: 1,
    date: 1,
    user: {
      _id: 1,
      username: 1
    }
  }
}
```

Relate also ships with a function to merge fragments with which you can grab in fragments that come from children components and merge them together.

Let's see an example. Suppose we want to create a component that displays an user profile picture and his name and email on the side. Let's not worry with data connect and passing props for now, just fragments build:

```js
import React, {Component} from 'react';
import {mergeFragments} from 'relate-js';

export default class User extends Component {
  static fragments = mergeFragments(
    UserPicture.fragments,
    UserInfo.fragments
  );

  render () {
    return (
      <div>
        <UserPicture />
        <UserInfo />
      </div>
    );
  }
}
```

Pretty clean, you're merging the fragments from the components the `User` component is rendering. Let's suppose that `UserPicture` and `UserInfo` have the following fragments:

```js
import React, {Component} from 'react';

export default class UserPicture extends Component {
  static fragments = {
    user: {
      profile_pic: 1
    }
  };

  render () {
    const {user} = this.props;
    return (
      <img src={user.profile_pic} />
    );
  }
}
```

```js
import React, {Component} from 'react';

export default class UserInfo extends Component {
  static fragments = {
    user: {
      name: 1,
      email: 1
    }
  };

  render () {
    const {user} = this.props;
    return (
      <div>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
    );
  }
}
```

Simple example just to demonstrate two things, first the component will receive through props the data they asked for, secondly the `mergeFragments` will merge the two fragments into:

```js
{
  user: {
    name: 1,
    email: 1,
    profile_pic: 1
  }
}
```

Static fragments should be placed in presentational components which require data from the server. Your container components will be responsible for handling variables and is where the data connect comes to action as we'll demonstrate in the next page.
