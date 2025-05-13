/**
 * 배열에서 중복 요소를 제거하는 함수
 * 커스텀 비교 함수를 사용하여 요소들의 동등성을 판단함
 * 동등하다고 판단되는 요소 중 가장 먼저 나오는 요소만 유지됨
 * @template Type - 배열 요소의 타입
 * @param source - 중복을 제거할 원본 배열
 * @param isEqual - 두 요소가 동등한지 판단하는 비교 함수
 * @returns 중복이 제거된 배열
 */
export const uniqueWith = <Type>(
  source: Type[],
  isEqual: (item1: Type, item2: Type) => boolean,
): Type[] => {
  const result: Type[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++)
      if (isEqual(item, result[j])) {
        isDuplicate = true;
        break;
      }
    if (!isDuplicate) result[result.length] = item;
  }
  return result;
};
