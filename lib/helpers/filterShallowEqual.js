import find from 'lodash.find';

// Faster than filtering input first and then comparing
export default (objA, objB, keyNames) => {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  const len = keysA.length;
  if (len !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let i = 0; i < len; i++) {
    const key = keysA[i];
    if (find(keyNames, key)) {
      continue;
    }
    if (!bHasOwnProperty(key)) {
      return false;
    }
    const valueA = objA[key];
    const valueB = objB[key];
    if (valueA !== valueB) {
      return false;
    }
  }
  return true;
};
