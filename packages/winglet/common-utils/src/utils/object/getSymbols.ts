const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

export const getSymbols = <Type extends object>(
  object: Type,
): Array<symbol> => {
  const symbols = Object.getOwnPropertySymbols(object);
  const result: Array<symbol> = [];
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    if (propertyIsEnumerable.call(object, symbol)) result.push(symbol);
  }
  return result;
};
