/**
 * 배열의 요소를 지정된 키를 기준으로 그룹화하는 함수
 * 각 요소에 키 함수를 적용해 그룹화 키를 결정함
 * @template Type - 배열 요소의 타입
 * @template Key - 그룹화 키의 타입 (PropertyKey - 문자열, 숫자, 심볼)
 * @param array - 그룹화할 배열
 * @param getKey - 각 요소에서 그룹화 키를 추출하는 함수
 * @returns 키별로 그룹화된 요소들을 포함하는 객체
 */
export const groupBy = <Type, Key extends PropertyKey>(
  array: Type[],
  getKey: (item: Type) => Key,
): Record<Key, Type[]> => {
  const result = {} as Record<Key, Type[]>;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const key = getKey(item);
    if (key in result) result[key].push(item);
    else result[key] = [item];
  }
  return result;
};
