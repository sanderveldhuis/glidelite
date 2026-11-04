export interface InfoMsg {
  id: number;
  author: string;
  version: string;
}

export function isInfoMsg(payload: object | null): payload is InfoMsg {
  return payload !== null &&
    'id' in payload && typeof payload.id === 'number' &&
    'author' in payload && typeof payload.author === 'string' &&
    'version' in payload && typeof payload.version === 'string';
}

export interface CounterMsg {
  value: number;
}

export function isCounterMsg(payload: object | null): payload is CounterMsg {
  return payload !== null &&
    'value' in payload && typeof payload.value === 'number';
}
