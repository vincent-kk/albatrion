/**
 * 배열의 요소를 역순으로 순회하며 콜백 함수를 실행하는 함수
 * 콜백 함수가 false를 반환하면 순회를 중단함
 * @template Type - 배열 요소의 타입
 * @param array - 순회할 배열
 * @param callback - 각 요소에 대해 실행할 콜백 함수
 */
export const forEachReverse = <Type>(
  array: Type[],
  callback: (item: Type, index: number, array: Type[]) => boolean | void,
) => {
  for (let i = array.length - 1; i >= 0; i--)
    if (callback(array[i], i, array) === false) break;
};
