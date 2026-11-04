/**
 * Encode ordered contents without imposing cross-tree reference identities.
 * @param value - Public channel value, including sparse arrays and own undefined.
 * @param ancestors - Current traversal lineage used only to reject cycles.
 * @returns Typed contents; repeated aliases are encoded by value at each position.
 */
export function encodeValue(
  value: unknown,
  ancestors: readonly object[] = [],
): unknown {
  if (value === undefined) return ['undefined'];
  if (typeof value === 'number' && !Number.isFinite(value))
    return ['number', String(value)];
  if (typeof value === 'function') return ['function', String(value)];
  if (value === null || typeof value !== 'object') return value;
  if (ancestors.includes(value)) throw new Error('CYCLIC_OBSERVATION');
  const lineage = [...ancestors, value];
  if (value instanceof Error)
    return [
      'error',
      value.name,
      value.message,
      encodeValue(Reflect.get(value, 'code'), lineage),
      encodeValue(Reflect.get(value, 'details'), lineage),
      encodeValue(Reflect.get(value, 'cause'), lineage),
    ];
  return [
    Array.isArray(value) ? 'array' : 'object',
    Array.isArray(value) ? value.length : null,
    Object.keys(value).map((key) => [
      key,
      encodeValue(Reflect.get(value, key), lineage),
    ]),
  ];
}
