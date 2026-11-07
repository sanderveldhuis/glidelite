export function isInfoMsg(payload) {
  return payload !== null &&
    'id' in payload && typeof payload.id === 'number' &&
    'author' in payload && typeof payload.author === 'string' &&
    'version' in payload && typeof payload.version === 'string';
}

export function isCounterMsg(payload) {
  return payload !== null &&
    'value' in payload && typeof payload.value === 'number';
}
