const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

/**
 * Returns an array of enumerable Symbol property keys from an object.
 *
 * @template Type - Object type with symbol properties
 * @param object - Object to extract symbol properties from
 * @returns Array of enumerable symbol property keys
 *
 * @example
 * const sym1 = Symbol('sym1');
 * const sym2 = Symbol('sym2');
 * const obj = { [sym1]: 1, [sym2]: 2 };
 * getSymbols(obj); // [Symbol(sym1), Symbol(sym2)]
 */
export const getSymbols = <Type extends object>(
  object: Type,
): Array<symbol> => {
  const symbols = Object.getOwnPropertySymbols(object);
  const result: Array<symbol> = [];
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    if (propertyIsEnumerable.call(object, symbol))
      result[result.length] = symbol;
  }
  return result;
};
