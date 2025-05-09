/**
 * 배열의 각 요소에 콜백 함수를 적용하여 새로운 배열을 만드는 함수
 * @template Type - 입력 배열 요소의 타입
 * @template Result - 결과 배열 요소의 타입
 * @param array - 변환할 원본 배열
 * @param callback - 각 요소에 적용할 변환 함수
 * @returns 변환된 새 배열
 */
export const map = <Type, Result = Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => Result,
): Result[] => {
  const result = new Array<Result>(array.length);
  for (let index = 0; index < array.length; index++)
    result[index] = callback(array[index], index, array);
  return result;
};
