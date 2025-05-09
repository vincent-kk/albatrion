/**
 * 배열의 각 요소에 콜백 함수를 적용하는 함수
 * 콜백이 false를 반환하면 반복을 중단함
 * @template Type - 배열 요소의 타입
 * @param array - 반복할 배열
 * @param callback - 각 요소에 적용할 콜백 함수. false를 반환하면 반복 중단
 */
export const forEach = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = 0; i < array.length; i++)
    if (callback(array[i], i, array) === false) break;
};
