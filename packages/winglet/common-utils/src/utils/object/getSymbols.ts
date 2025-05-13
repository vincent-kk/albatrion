const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

/**
 * 객체의 열거 가능한(enumerable) Symbol 속성 키들을 배열로 반환합니다.
 *
 * @template Type - 심볼 속성을 가진 객체 타입
 * @param object - 심볼 속성을 추출할 객체
 * @returns 열거 가능한 심볼 속성 키 배열
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
