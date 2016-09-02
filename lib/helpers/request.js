import request from 'superagent';
import Q from 'q';

export default function doRequest ({dispatch, query, variables, type, endpoint, headers, body, ...params}) {
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

      if (params.withCredentials) {
        req.withCredentials();
      }

      req
        .end((error, res) => {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve(res.body);
          }
        });

      if (dispatch) {
        promise = promise.then(({data, errors}) => {
          dispatch({type, data, errors, ...params});
          return data;
        });
      }

      return promise;
    });
}
