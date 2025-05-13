/**
 * 하나의 배열에서 다른 배열에 존재하는 요소를 제외한 배열을 반환하는 함수
 * 원본 배열에서 제외할 배열에 있는 요소를 제외함
 * @template Type - 배열 요소의 타입
 * @param source - 원본 배열
 * @param exclude - 제외할 요소를 포함한 배열
 * @returns 원본 배열에서 제외 배열의 요소를 제외한 새 배열
 */
export const difference = <Type>(source: Type[], exclude: Type[]): Type[] => {
  const result: Type[] = [];
  const excludeSet = new Set(exclude);
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (!excludeSet.has(item)) result[result.length] = item;
  }
  return result;
};
