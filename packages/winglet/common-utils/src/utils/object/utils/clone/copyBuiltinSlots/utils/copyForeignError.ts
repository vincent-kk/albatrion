/** Native Error constructor source identifies its prototype lineage across realms. */
const ERROR_CONSTRUCTOR_SOURCE = Function.prototype.toString.call(Error);

/** Native AggregateError source identifies its argument layout independently of writable instance names. */
const AGGREGATE_ERROR_CONSTRUCTOR_SOURCE =
  /^function\s+AggregateError\s*\([^)]*\)\s*{\s*\[native code\]\s*}$/;

/**
 * Copies an Error whose native prototype lineage belongs to another realm.
 * @param value - Error-tagged object to validate before invoking its constructor
 * @returns An Error shell, or undefined when its prototype chain is ordinary
 */
export const copyForeignError = (value: object): object | undefined => {
  let errorPrototype = Object.getPrototypeOf(value);
  let aggregate = false;
  while (errorPrototype !== null) {
    const constructor = Object.getOwnPropertyDescriptor(
      errorPrototype,
      'constructor',
    )?.value;
    if (typeof constructor === 'function') {
      const source = Function.prototype.toString.call(constructor);
      if (source === ERROR_CONSTRUCTOR_SOURCE) break;
      if (AGGREGATE_ERROR_CONSTRUCTOR_SOURCE.test(source)) aggregate = true;
    }
    errorPrototype = Object.getPrototypeOf(errorPrototype);
  }
  if (errorPrototype === null) return undefined;
  const copy = Reflect.construct(
    value.constructor,
    aggregate
      ? [[], Reflect.get(value, 'message')]
      : [Reflect.get(value, 'message')],
  );
  Reflect.set(copy, 'stack', Reflect.get(value, 'stack'));
  if (Object.prototype.hasOwnProperty.call(value, 'name'))
    Reflect.set(copy, 'name', Reflect.get(value, 'name'));
  return copy;
};
