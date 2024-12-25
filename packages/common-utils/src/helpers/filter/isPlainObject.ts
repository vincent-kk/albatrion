export function isPlainObject(
  value: unknown,
): value is Record<PropertyKey, any> {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;
  if (!hasObjectPrototype) return false;

  return Object.prototype.toString.call(value) === '[object Object]';
}
