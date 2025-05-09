/**
 * 배열에서 중복 요소를 제거하는 함수
 * 변환 함수를 통해 비교 기준이 되는 값을 추출하여 중복을 판단함
 * 같은 비교값을 가진 요소 중 가장 먼저 나오는 요소만 유지됨
 * @template Type - 배열 요소의 타입
 * @template SubType - 비교 기준 값의 타입
 * @param source - 중복을 제거할 원본 배열
 * @param mapper - 요소에서 비교 기준 값을 추출하는 함수
 * @returns 중복이 제거된 배열
 */
export const uniqueBy = <Type, SubType>(
  source: Type[],
  mapper: (item: Type) => SubType,
): Type[] => {
  const map = new Map<SubType, Type>();
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    const key = mapper(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};
