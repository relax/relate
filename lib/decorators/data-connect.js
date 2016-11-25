import React, {Component, PropTypes} from 'react';

import {connect} from 'react-redux';
import forEach from 'lodash/forEach';
import {generateConnectorId} from '../helpers/connectors-ids';
import getVariables from '../helpers/get-variables';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';
import isEqual from 'lodash/isEqual';
import removeConnector from '../actions/remove-connector';

// getBundle is a function which receives the component props
// and retrieves a configuration set by the user
// e.g
// (props) => ({
//   fragments: {
//     pages: {
//       _id: 1,
//       title: 1
//     },
//     page: {
//       _id: 1,
//       title: 1,
//       user: {
//         _id: 1,
//         username: 1
//       }
//     }
//   },
//   variablesTypes: {
//     pages: {
//       order: 'String!',
//       sort: 'String!'
//     }
//   },
//   initialVariables: {
//     pages: {
//       order: 'asc',
//       sort: 'date'
//     }
//   },
//   mutations: {
//     addPage: [
//       {
//         type: 'APPEND', // INCREMENT || DECREMENT || APPEND || PREPEND
//         field: 'pages'
//       },
//       {
//         type: 'INCREMENT',
//         field: 'pagesCount'
//       },
//       {
//         type: 'INCREMENT',
//         field: ['pages', 'pagesCount']
//       }
//     ]
//   }
// })
export default function dataConnect (...args) {
  invariant(args.length, 'Relate: a dataConnect does not have arguments specified');

  const getReduxState = args.length > 1 && args[0];
  const getReduxDispatches = args.length > 2 && args[1];
  const getBundle = args[args.length - 1];

  return function wrapWithDataConnect (WrappedComponent) {
    class ConnectData extends Component {
      static propTypes = {
        relateConnectorData: PropTypes.object,
        CONNECTOR_ID: PropTypes.string.isRequired
      };

      static contextTypes = {
        fetchData: PropTypes.func.isRequired,
        store: PropTypes.any.isRequired,
        relate_ssr: PropTypes.func
      };

      static defaultProps = {
        relateConnectorData: {}
      };

      static relateIdentifier = 'DATA_CONNECT';

      constructor (props, context) {
        super(props, context);

        this.constructor.displayName = WrappedComponent.name;

        // Relate connector info
        this.relate = {
          setVariables: ::this.setVariables,
          refresh: ::this.refresh,
          loadMore: ::this.loadMore,
          variables: {},
          hasMore: true
        };

        // get bundle
        this.initialBundle = this.processBundle(this.props);

        if (!props.relateConnectorData || Object.keys(props.relateConnectorData).length === 0) {
          this.initialHasDataToFetch = !!(
            this.initialBundle &&
            this.hasDataToFetch(this.initialBundle.fragments)
          );

          // Set initial state
          this.state = {
            loading: this.initialHasDataToFetch,
            error: false
          };
        } else {
          this.state = {
            loading: false,
            error: false
          };
        }
      }

      componentWillMount () {
        if (this.initialBundle && this.initialHasDataToFetch) {
          this.fetchData({
            fragments: this.initialBundle.fragments,
            variables: this.initialBundle.initialVariables,
            mutations: this.initialBundle.mutations
          });
        }
      }

      shouldComponentUpdate (nextProps, nextState) {
        return (
          !this.state.loading ||
          this.state.loading && !nextState.loading ||
          this.state.error !== nextState.error
        );
      }

      componentWillUnmount () {
        this.context.store.dispatch(removeConnector(this.props.CONNECTOR_ID));
      }

      setVariables (variables) {
        const bundle = this.processBundle(this.props, variables);

        // Fetch data
        if (bundle) {
          this.setState({
            loading: true
          }, () => {
            this.fetchData({
              fragments: bundle.fragments,
              variables,
              mutations: bundle.mutations
            });
          });
        }
      }

      processBundle (props, variables) {
        const bundle = getBundle && getBundle(this.props);

        this.variablesTypes = bundle && bundle.variablesTypes || {};
        this.relate.variables = variables || bundle && bundle.initialVariables || {};

        return bundle;
      }

      loadMore (variables, loadMore, expected) {
        const bundle = this.processBundle(this.props, variables);

        // Fetch data
        if (bundle && !this.lock) {
          this.lock = true;
          this.setState({
            loading: true,
            loadingMore: true,
            loadingMoreProperty: loadMore,
            loadingMoreExpects: expected
          }, () => {
            this.fetchData({
              fragments: bundle.fragments,
              variables,
              mutations: bundle.mutations,
              loadMore
            });
          });
        }
      }

      refresh (props = this.props) {
        const bundle = this.processBundle(props);

        // Fetch data
        if (bundle) {
          this.setState({
            loading: true
          }, () => {
            this.fetchData({
              fragments: bundle.fragments,
              variables: bundle.initialVariables,
              mutations: bundle.mutations
            });
          });
        }
      }

      hasDataToFetch (fragments) {
        return typeof fragments === 'object' && Object.keys(fragments).length > 0;
      }

      fetchData ({fragments, variables, mutations, loadMore = false}) {
        const {fetchData} = this.context;

        if (fetchData && this.hasDataToFetch(fragments)) {
          const fetchOptions = {
            fragments,
            variables: getVariables({
              variables,
              variablesTypes: this.variablesTypes,
              fragments,
              displayName: typeof WrappedComponent !== 'undefined' && WrappedComponent.displayName
            }),
            ID: this.props.CONNECTOR_ID,
            mutations,
            loadMore
          };
          if (this.context.relate_ssr) {
            fetchData(fetchOptions);
          } else {
            fetchData(fetchOptions)
              .then((data) => {
                const {loadingMore, loadingMoreExpects, loadingMoreProperty} = this.state;
                let hasMore = true;

                if (loadingMore && loadingMoreExpects && data[loadingMoreProperty]) {
                  hasMore = data[loadingMoreProperty].length >= loadingMoreExpects;
                }

                this.relate.hasMore = hasMore;

                this.setState({
                  loading: false,
                  loadingMore: false,
                  error: false,
                  loadingMoreProperty: null,
                  loadingMoreExpects: null
                });

                this.lock = false;
              })
              .catch(() => {
                this.setState({
                  loading: false,
                  loadingMore: false,
                  error: true,
                  loadingMoreProperty: null,
                  loadingMoreExpects: null
                });
              });
          }
        } else {
          if (!this.context.relate_ssr) {
            this.setState({
              loading: false,
              loadingMore: false,
              error: false,
              loadingMoreProperty: null,
              loadingMoreExpects: null
            });
          }
        }
      }

      render () {
        const {relateConnectorData, ...otherProps} = this.props;
        const {loading, loadingMore} = this.state;
        return (
          <WrappedComponent
            {...otherProps}
            {...relateConnectorData}
            relate={this.relate}
            loading={loading && !loadingMore}
            loadingMore={loadingMore}
          />
        );
      }
    }

    const Connected = connect(
      () => function map (state, props) {
        if (!this.CONNECTOR_ID) {
          if (state.relateReducer.server) {
            const finalProps = Object.assign({}, props, getReduxState && getReduxState(state, props));
            const initialBundle = getBundle(finalProps);
            const thisCompare = {
              fragments: initialBundle.fragments,
              variables: getVariables({
                variables: initialBundle.initialVariables,
                variablesTypes: initialBundle.variablesTypes,
                fragments: initialBundle.fragments
              })
            };

            forEach(state.relateReducer.server, (compare, id) => {
              if (isEqual(compare, thisCompare)) {
                this.CONNECTOR_ID = id;
                return false;
              }
              return true;
            });

            if (!this.CONNECTOR_ID) {
              this.CONNECTOR_ID = generateConnectorId();
            }
          } else {
            this.CONNECTOR_ID = generateConnectorId();
          }
        }

        return Object.assign(
          getReduxState && getReduxState(state, props) || {},
          {
            relateConnectorData: state.relateReducer[this.CONNECTOR_ID],
            CONNECTOR_ID: this.CONNECTOR_ID
          }
        );
      },
      (dispatch) => Object.assign(
        getReduxDispatches && getReduxDispatches(dispatch) || {},
        {
          removeConnector: dispatch(removeConnector)
        }
      )
    )(ConnectData);

    return hoistStatics(Connected, WrappedComponent, {
      relateIdentifier: true
    });
  };
}
