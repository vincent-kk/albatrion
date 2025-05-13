/**
 * 두 배열의 교집합을 구하는 함수
 * 첫 번째 배열을 기준으로 두 번째 배열에도 존재하는 요소들만 반환함
 * @template Type - 배열 요소의 타입
 * @param source - 기준이 되는 원본 배열
 * @param target - 비교 대상 배열
 * @returns 두 배열에 모두 존재하는 요소들의 배열
 */
export const intersection = <Type>(source: Type[], target: Type[]): Type[] => {
  const result: Type[] = [];
  const targetSet = new Set(target);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(item)) result[result.length] = item;
  }
  return result;
};
