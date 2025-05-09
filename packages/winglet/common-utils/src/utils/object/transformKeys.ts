/**
 * 객체의 모든 키를 변환하여 새로운 객체를 만듭니다.
 * 객체의 값은 유지하면서 키만 변환합니다.
 *
 * @template Type - 입력 객체 타입
 * @template Key - 변환된 키 타입
 * @param object - 변환할 객체
 * @param getKey - 각 키를 변환하는 함수
 * @returns 변환된 키를 가진 새로운 객체
 *
 * @example
 * transformKeys({a: 1, b: 2}, (_, key) => key + '_new'); // {a_new: 1, b_new: 2}
 * transformKeys({a: 1, b: 2}, (_, key) => key.toUpperCase()); // {A: 1, B: 2}
 */
export const transformKeys = <
  Type extends Record<PropertyKey, any>,
  Key extends PropertyKey,
>(
  object: Type,
  getKey: (value: Type[keyof Type], key: keyof Type, object: Type) => Key,
): Record<Key, Type[keyof Type]> => {
  const result = {} as Record<Key, Type[keyof Type]>;
  const keys = Object.keys(object) as Array<keyof Type>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = object[key];
    result[getKey(value, key, object)] = value;
  }
  return result;
};
