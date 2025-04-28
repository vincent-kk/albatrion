const __hasOwnProperty__ = Object.prototype.hasOwnProperty;

export const hasOwnProperty = <Value>(value: Value, key: string) =>
  __hasOwnProperty__.call(value, key);
