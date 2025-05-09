/**
 * 두 배열의 요소들을 동시에 순회하며 콜백 함수를 실행하는 함수
 * 두 배열 길이가 다를 경우 더 긴 배열 기준으로 순회하며, 짧은 배열의 범위를 벗어난 인덱스는 undefined로 전달됨
 * 콜백 함수가 false를 반환하면 순회를 중단함
 * @template Type1 - 첫 번째 배열 요소의 타입
 * @template Type2 - 두 번째 배열 요소의 타입
 * @param array1 - 첫 번째 배열
 * @param array2 - 두 번째 배열
 * @param callback - 각 요소 쌍에 대해 실행할 콜백 함수
 */
export const forEachDual = <Type1, Type2>(
  array1: Type1[],
  array2: Type2[],
  callback: (
    item1: Type1 | undefined,
    item2: Type2 | undefined,
    index: number,
    array1: Type1[],
    array2: Type2[],
  ) => boolean | void,
) => {
  const array1Length = array1.length;
  const array2Length = array2.length;
  const length = Math.max(array1Length, array2Length);
  for (let i = 0; i < length; i++) {
    const item1 = i < array1Length ? array1[i] : undefined;
    const item2 = i < array2Length ? array2[i] : undefined;
    if (callback(item1, item2, i, array1, array2) === false) break;
  }
};
