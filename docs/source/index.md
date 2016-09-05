---
layout: default
id: index
title: What is Relate
next: how-it-works.html
---

Relate is a library built to use together with Redux and GraphQL. You can think of it as an alternative to [Relay](https://github.com/facebook/relay) for Redux. It extends the [React Redux's](https://github.com/reactjs/react-redux) `connect()` function where you can additionally specify your container's data needs. Relate will resolve each container data needs automatically and provides it to each one the data they requested.

Relate follows a similar API to Relay, it isn't a replacement but an alternative to it with some more freedom which might be a better fit for some projects.

## Why Relate?

This project was made out of necessity due to a grow of data complexity in [Relax CMS](https://github.com/relax/relax). Redux is an awesome tool to handle an application data. The problem is when you get containers competing for the same resources, in Redux this can only be solved by scoping your reducers or creating more to accommodate all use cases and containers specifications. This doesn't scale well!

**Why not Relay to solve this?**

Relay is a great project which might fit perfectly for some projects. For us at Relax it had a lot of constraints we couldn't get around easily:

* **Strict schema definition** - you have to comply to a certain convention and build a static schema file. In Relax we generate schemas on runtime.
* **Client local store** - you can't edit an entry locally by calling a mutation. This was a major step back in our case since we manipulate data in sometimes complex ways.
* **Server side rendering** - still very fuzzy how to achieve isomorphism with Relay, I believe there's a way but we couldn't risk not having it.

If you identify with these problems, Relate might be a good option. If not, Relay is your pick.

## Differentiation Points

Relate tries to solve some of the problems mentioned above, which of course comes with some counterparts. What Relate solves:

* **Data agnostic** - you don't have to alter your schema to use it.
* **Uses Redux and extends React Redux** - if you use these techs in your project already, it'll be a perfect fit.
* **Capture queries and mutations in other reducers** - you can collect data that comes from queries or mutations in other reducers and handle them as you want.
* **Server side rendering** - (in progress)

It loose some capabilities over Relay that **can be worked out eventually**:

* **Cache queries** - Based on Relax CMS requirements (data always mutating) a cache mechanism wasn't made
* **Automatic pagination** - Relate doesn't have an automatic way of paginating, instead it's up to you to require the needed data from your schema to do this. You're free to implement it the way you want.
* **Optimistic updates** - Relate doesn't have a way of setting optimistic updates. Instead you can capture and mutate your data from another reducer.
