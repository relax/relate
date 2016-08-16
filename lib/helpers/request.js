import request from 'superagent';
import errorParser from '../helpers/errorParser';
import Q from 'q';

export default function doRequest (
  {
    dispatch,
    query,
    variables,
    type,
    endpoint,
    headers,
    body,
    logging,
    ...params
  }
) {
  return new Q()
    .then(() => {
      const deferred = Q.defer();
      let promise = deferred.promise;
      const dataObj = {query, variables, ...body};
      const payload =
        headers['Content-Type'] === 'text/plain' ?
        JSON.stringify(dataObj) :
        dataObj;

      const req = request
        .post(endpoint || '/graphql')
        .set(headers)
        .send(payload);

      req
        .end((error, res) => {
          if (error) {
            logging && logging({errors: errorParser(error)}, dispatch);
            deferred.reject(error);
          } else {
            deferred.resolve(res.body);
          }
        });

      if (dispatch) {
        promise = promise.then(({data, errors}) => {
          logging && logging({data, errors}, dispatch);
          dispatch({type, data, errors, ...params});
          return {data, errors};
        });
      }

      return promise;
    });
}
