let ID_COUNTER = 0;
let PREFIX = '';

export function generateConnectorId () {
  return `${PREFIX}connector_${ID_COUNTER++}`;
}

export function resetConnectorsIds (prefix = '') {
  PREFIX = prefix;
  ID_COUNTER = 0;
}
