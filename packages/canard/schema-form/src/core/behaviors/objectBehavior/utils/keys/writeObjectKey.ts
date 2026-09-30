/** Write a JSON property name without treating __proto__ as a setter. */
export const writeObjectKey = (
  target: Record<string, unknown>,
  name: string,
  value: unknown,
): void => {
  if (name === '__proto__')
    Object.defineProperty(target, name, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  else target[name] = value;
};
