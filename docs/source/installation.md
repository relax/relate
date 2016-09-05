---
layout: default
id: installation
title: Installation
prev: how-it-works.html
next: reducer.html
---

To use Relate your project needs to have three modules already installed:

* [React](https://github.com/facebook/react)
* [Redux](https://github.com/reactjs/redux)
* [React Redux](https://github.com/reactjs/react-redux)

Having these you can then proceed to install Relate, by running:

```bash
npm install --save relate-js
```

This will install Relate in your project and save the dependency into your `package.json`.

If you come across unmet peer dependencies issues, and it is because you're using a lower version than the requested you can update the lib in question. If not [open an issue](https://github.com/relax/relate/issues/new) or make a pull request for Relate to support it :-)

You also need a GraphQL server, we recommend [express-graphql](https://github.com/graphql/express-graphql). Here's an article about [GraphQL and how to create a GraphQL server with Node.js](http://www.sitepoint.com/creating-graphql-server-nodejs-mongodb/).

You're then ready to go and apply Relate to your project!
