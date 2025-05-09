/**
 * 두 배열의 교집합을 반환하는 함수
 * 주어진 비교 함수를 사용하여 각 배열의 요소를 비교하고,
 * 교집합을 이루는 요소들을 배열로 반환함
 * @template Type1 - 첫 번째 배열의 요소 타입
 * @template Type2 - 두 번째 배열의 요소 타입
 * @param source - 첫 번째 배열
 * @param target - 두 번째 배열
 * @param isEqual - 요소 비교 함수
 * @returns 두 배열의 교집합을 이루는 요소들의 배열
 */
export const intersectionWith = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  isEqual: (source: Type1, target: Type2) => boolean,
): Type1[] => {
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    for (let j = 0; j < target.length; j++) {
      if (isEqual(item, target[j])) {
        result.push(item);
        break;
      }
    }
  }
  return result;
};
