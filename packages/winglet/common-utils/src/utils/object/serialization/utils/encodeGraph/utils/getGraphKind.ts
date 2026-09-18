/** Classifies supported intrinsic prototypes without reading user getters. */
export function getGraphKind(value: object): string | undefined {
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null || prototype === Object.prototype) return 'object';
  if (prototype === Array.prototype && Array.isArray(value)) return 'array';
  if (prototype === Date.prototype) return 'date';
  if (prototype === Map.prototype) return 'map';
  if (prototype === Set.prototype) return 'set';
  if (prototype === RegExp.prototype) return 'regexp';
  return undefined;
}
