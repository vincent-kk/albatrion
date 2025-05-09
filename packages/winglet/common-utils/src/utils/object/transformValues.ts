/**
 * 객체의 모든 값을 변환하여 새로운 객체를 만듭니다.
 * 객체의 구조는 유지하면서 값만 변환합니다.
 *
 * @template Type - 입력 객체 타입
 * @template Key - 객체 키 타입
 * @template Value - 변환된 값 타입
 * @param object - 변환할 객체
 * @param getValue - 각 값을 변환하는 함수
 * @returns 변환된 값을 가진 새로운 객체
 *
 * @example
 * transformValues({a: 1, b: 2}, (value) => value * 2); // {a: 2, b: 4}
 * transformValues({a: 'hello', b: 'world'}, (value) => value.toUpperCase()); // {a: 'HELLO', b: 'WORLD'}
 */
export const transformValues = <
  Type extends object,
  Key extends keyof Type,
  Value,
>(
  object: Type,
  getValue: (value: Type[Key], key: Key, object: Type) => Value,
): Record<Key, Value> => {
  const result = {} as Record<Key, Value>;
  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as Key;
    const value = object[key];
    result[key] = getValue(value, key, object);
  }
  return result;
};
