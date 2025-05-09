/**
 * 배열의 각 요소에 콜백 함수를 적용하여 새로운 배열을 만드는 함수
 * @template Type - 입력 배열 요소의 타입
 * @param array - 필터링할 원본 배열
 * @param callback - 각 요소에 적용할 필터링 함수
 * @returns 필터링된 새 배열
 */
export const filter = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean,
): Type[] => {
  const result = new Array<Type>();
  for (let index = 0; index < array.length; index++)
    if (callback(array[index], index, array))
      result[result.length] = array[index];
  return result;
};
