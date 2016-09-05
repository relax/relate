![Relate logo](http://relax.github.io/relate/images/logo_image.png)

[![build status](https://img.shields.io/travis/relax/relate/master.svg?style=flat-square)](https://travis-ci.org/relax/relate) [![npm version](https://img.shields.io/npm/v/relate-js.svg?style=flat-square)](https://www.npmjs.com/package/relate-js) [![Coverage Status](https://img.shields.io/coveralls/relax/relate/master.svg?style=flat-square)](https://coveralls.io/github/relax/relate?branch=master)

Relate is a library built to use together with Redux and GraphQL. You can think of it as an alternative to [Relay](https://github.com/facebook/relay) for Redux. It extends the [React Redux's](https://github.com/reactjs/react-redux) `connect` where you can additionally specify your container's data needs. Relate will resolve each container data needs automatically and provides it to each one the data they requested.

Relate follows a similar API to Relay, it isn't a replacement but an alternative to it with some more liberty which might be a better fit for some projects.

## Documentation

http://relax.github.io/relate

## Usage Example

Relate let's you declare data needs at a component level. Example:

```js
@dataConnect(
  (state) => ({
    sort: state.router.location.query.sort || '_id',
    order: state.router.location.query.order || 'desc'
  }),
  (dispatch) => yourReduxDispatchMap...,
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
    }
  })
)
export default class PagesContainer extends Component {
  render () {
    // pages will be available through this.props.pages
    // ...
  }
}
```

You can use props mapped from your redux state to build the initial query. You can also set variables mid lifecycle that will trigger a new fetch:

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

Relate will handle updates and removed nodes for you and update the connectors listening to them :)
