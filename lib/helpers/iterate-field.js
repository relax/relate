import forEach from 'lodash.foreach';
import warning from 'warning';

function iterateFieldPath (fieldPath, data, callback) {
  const field = fieldPath.shift();
  const dataField = data[field]; // value from connector's data
  if (dataField) {
    // end of the line
    if (fieldPath.length === 0) {
      callback(dataField, data, field);
    } else {
      if (dataField.constructor === Array) { // is array, iterate through it
        forEach(dataField, (dataFieldIt) => {
          iterateFieldPath([...fieldPath], dataFieldIt, callback);
        });
      } else {
        iterateFieldPath([...fieldPath], dataField, callback);
      }
    }
  } else {
    warning(
      false,
      `Relate: Could not resolve a mutation action listener, field "${field}" not found`,
      field
    );
  }
}

// Iterates through a field setting
// field can be in format: String || Array of strings
// along the path an array might be encountered, it should iterate through each
export default (field, data, callback) => {
  const fieldPath = field.constructor === Array ? [...field] : [field];
  iterateFieldPath(fieldPath, data, callback);
};
