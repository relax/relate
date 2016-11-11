import forEach from 'lodash/foreach';
import invariant from 'invariant';

export default function getVariables ({variables, fragments, variablesTypes, displayName}) {
  const resultVariables = {};
  if (variables) {
    forEach(variables, (vars, queryName) => {
      if (fragments[queryName]) { // if not in fragments, ignore
        resultVariables[queryName] = {};
        const queryVariablesTypes = variablesTypes[queryName];

        // No variables types defined for this query
        invariant(
          queryVariablesTypes,
          'Relate: Query to %s doesn\'t have variables types defined in %s!',
          queryName,
          displayName || 'a component'
        );

        // Check if every variable has a type
        forEach(vars, (value, variable) => {
          invariant(
            queryVariablesTypes[variable],
            'Relate: Query to %s does not have variable "%s" type defined in %s!',
            queryName,
            variable,
            displayName || 'a component'
          );

          // add variable prepared for query e.g. {type: 'String', value: 'something'}
          const type = queryVariablesTypes[variable];

          if (typeof type === 'object') {
            // deep query
            Object.assign(resultVariables[queryName], getVariables({
              variables: {[variable]: value},
              fragments: {[variable]: fragments[queryName]},
              variablesTypes: {[variable]: type}
            }));
          } else {
            resultVariables[queryName][variable] = {
              type: queryVariablesTypes[variable],
              value
            };
          }
        });

        // Check if every required variable type is met
        forEach(queryVariablesTypes, (type, variable) => {
          if (typeof type !== 'object') {
            invariant(
              type.slice(-1) !== '!' || vars[variable] || (type === 'Boolean!' && vars[variable] === false),
              'Relate: Query to %s requires the variable "%s" in %s!',
              queryName,
              variable,
              displayName || 'a component'
            );
          }
        });
      }
    });
  }
  return resultVariables;
}
