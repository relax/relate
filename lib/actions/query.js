import q from 'q';
import warning from 'warning';

import actionTypes from './types';
import request from '../helpers/request';

export default function graphql (
  {query, variables},
  fragments,
  connectors,
  scopes,
  config,
  relateSSR = false
) {
  return (dispatch, getState) => {
    let result;

    if (relateSSR) {
      result = q()
        .then(() => relateSSR({
          query,
          variables
        }))
        .then(({data, errors}) => {
          dispatch({
            type: actionTypes.query,
            data,
            errors,
            variables,
            connectors,
            scopes,
            fragments,
            isIntrospection: true
          });
        })
        .catch((err) => {
          warning(false, err);
        });
    } else {
      const {headers, endpoint, body} = getState().relateReducer;
      result = request({
        dispatch,
        type: actionTypes.query,
        query,
        variables,
        connectors,
        scopes,
        fragments,
        headers: config && config.headers || headers,
        body: config && config.body || body,
        endpoint: config && config.endpoint || endpoint,
        logging: config && config.logging
      });
    }

    return result;
  };
}
