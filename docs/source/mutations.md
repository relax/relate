---
layout: default
id: mutations
title: Mutations
prev: data-connect.html
next: server-side.html
---

In Relate mutations are created inside Redux actions. For this Relate provides `mutation` function which you can return in your actions. It will use the configuration you set as argument and make the request and processing for you.

Here's an example of an update mutation:

```js
import {mutation} from 'relate-js';

export function updatePageTitle (id, title) {
  return mutation({
    fragments: {
      updatePageTitle: {
        _id: 1,
        title: 1
      }
    },
    variables: {
      updatePageTitle: {
        _id: {
          value: id,
          type: 'ID!'
        },
        title: {
          value: title,
          type: 'String!'
        }
      }
    }
  });
}
```

Similar to `dataConnect` you define the mutation(s) in a fragments object type. You should, in the fragments, include everything that may change due to that mutation. You should also include always the `_id`, Relate will use this to update other connectors who might be listening for this node.

Opposed of what happens in `dataConnect` variables and variables types in a mutation are all defined together.

This mutation will produce a GraphQL mutation request like this:

```js
{
  query: `
    mutation ($id: ID!, title: String!) {
      updatePageTitle (id: $id, title: $title) {
        _id
      }
    }
  `,
  variables: {
    id: ...,
    title: ...
  }
}
```

## Remove Special Case

Since Relate is agnostic to your data scheme, it can differentiate a remove action from an update or add one. So in order for a remove action to properly work you also need to provide a `type` property set to 'REMOVE'. Here's an example:

```js
import {mutation} from 'relate-js';

export function removePage (id) {
  return mutation({
    fragments: {
      removePage: {
        _id: 1
      }
    },
    variables: {
      removePage: {
        _id: {
          value: id,
          type: 'ID!'
        }
      }
    },
    type: 'REMOVE'
  });
}
```

Also make sure you retrieve an `_id` from the operation, Relate will use it to identify the node to remove.
