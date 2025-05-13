/**
 * 두 배열을 비교하여 첫 번째 배열에는 있지만 두 번째 배열에는 없는 요소를 반환하는 함수
 * 커스텀 비교 함수를 사용하여 요소들의 동등성을 판단함
 * @template Type1 - 첫 번째 배열 요소의 타입
 * @template Type2 - 두 번째 배열 요소의 타입
 * @param source - 기준이 되는 원본 배열
 * @param exclude - 제외할 요소가 있는 배열
 * @param isEqual - 두 요소가 동등한지 판단하는 비교 함수
 * @returns 첫 번째 배열에만 존재하는 요소들의 배열
 */
export const differenceWith = <Type1, Type2>(
  source: Type1[],
  exclude: Type2[],
  isEqual: (source: Type1, exclude: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isFound = false;
    for (let j = 0; j < exclude.length; j++)
      if (isEqual(item, exclude[j])) {
        isFound = true;
        break;
      }
    if (!isFound) result[result.length] = item;
  }
  return result;
};
