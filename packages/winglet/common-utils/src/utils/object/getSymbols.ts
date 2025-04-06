export const getSymbols = <Type extends object>(
  object: Type,
): Array<symbol> => {
  const symbols = Object.getOwnPropertySymbols(object);
  const result: Array<symbol> = [];
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    if (Object.prototype.propertyIsEnumerable.call(object, symbol))
      result.push(symbol);
  }
  return result;
};
