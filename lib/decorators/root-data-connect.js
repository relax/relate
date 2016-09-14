import debounce from 'lodash.debounce';
import forEach from 'lodash.foreach';
import hoistStatics from 'hoist-non-react-statics';
import isEqual from 'lodash.isequal';
import warning from 'warning';
import Q from 'q';
import React, {Component, PropTypes} from 'react';
import {mergeFragments, buildQueryAndVariables} from 'relax-fragments';

import queryAction from '../actions/query';

export default function rootDataConnect (config) {
  return function wrapWithDataConnect (WrappedComponent) {
    class RootConnectData extends Component {
      static contextTypes = {
        store: PropTypes.any.isRequired,
        relate_ssr: PropTypes.func
      };

      static childContextTypes = {
        fetchData: PropTypes.func.isRequired
      };

      static relateIdentifier = 'ROOT_DATA_CONNECT';

      constructor (props, context) {
        super(props, context);
        this.bundle = {};
        this.childFetchDataBind = ::this.childFetchData;
        this.fetchDebounce = debounce(::this.fetchData, 10);
        this.scopeID = 0;
      }

      getChildContext () {
        return {
          fetchData: this.childFetchDataBind
        };
      }

      componentDidMount () {
        this.mounted = true;
        if (this.bundle && this.bundle.fragments) {
          this.fetchData();
        }
      }

      childFetchData ({fragments, variables = {}, ID, mutations, loadMore = false}) {
        // Check for same query with different variables
        const scopes = {};
        const resultFragments = Object.assign({}, fragments || {});
        const resultVariables = Object.assign({}, variables || {});

        if (this.bundle.fragments) {
          forEach(fragments, (fragment, queryName) => {
            if (this.bundle.fragments[queryName]) {
              // Same query name detected, will have to check if variables are the same
              const sameVariables = isEqual(
                variables && variables[queryName],
                this.bundle.variables && this.bundle.variables[queryName]
              );

              if (!sameVariables) {
                // Will have to scope it
                const scope = `relate_${this.scopeID++}`;
                const newQueryName = `${scope}: ${queryName}`;
                resultFragments[newQueryName] = Object.assign({}, fragments[queryName]);
                scopes[scope] = queryName;
                delete resultFragments[queryName];

                if (resultVariables[queryName]) {
                  resultVariables[newQueryName] = Object.assign({}, variables[queryName]);
                  delete resultVariables[queryName];
                }
              }
            }
          });
        }

        this.bundle = {
          fragments: mergeFragments(this.bundle.fragments || {}, resultFragments),
          variables: Object.assign(this.bundle.variables || {}, resultVariables),
          connectors: Object.assign(this.bundle.connectors || {}, {
            [ID]: {fragments, variables, mutations, scopes, loadMore}
          }),
          scopes: Object.assign(this.bundle.scopes || {}, scopes)
        };

        let result = null;
        if (!this.context || !this.context.relate_ssr) {
          if (this.fetchingData && this.deferred) {
            if (!this.nextDeferred) {
              this.nextDeferred = Q.defer();

              this.deferred.promise.fin(() => {
                this.deferred = this.nextDeferred;
                this.nextDeferred = null;
                this.fetchData();
              });
            }

            result = this.nextDeferred.promise;
          } else {
            if (this.mounted) {
              this.fetchDebounce();
            }

            this.deferred = this.deferred || Q.defer();
            result = this.deferred.promise;
          }
        }

        return result;
      }

      fetchData () {
        const {store, relate_ssr} = this.context;
        const {dispatch} = store;
        const {fragments, variables, connectors, scopes} = this.bundle;
        this.bundle = {};
        this.deferred = this.deferred || Q.defer();

        if (fragments && Object.keys(fragments).length) {
          this.fetchingData = true;
          dispatch(
            queryAction(
              buildQueryAndVariables(fragments, variables),
              fragments,
              connectors,
              scopes,
              typeof config === 'function' ? config(this.props) : config,
              relate_ssr
            )
          ).then((data) => {
            this.deferred.resolve(data);
          }).catch((err) => {
            warning(false, err);
            this.deferred.reject();
          }).fin(() => {
            this.deferred = null;
            this.fetchingData = false;
          });
        } else {
          this.deferred.resolve();
          this.fetchingData = false;
        }

        return this.deferred.promise;
      }

      render () {
        return <WrappedComponent {...this.props} />;
      }
    }

    return hoistStatics(RootConnectData, WrappedComponent, {
      relateIdentifier: true
    });
  };
}
