/**
 * 배열에서 중복 요소를 제거하는 함수
 * 중복 요소를 제거하고 유니크한 요소만 반환함
 * @template Type - 배열 요소의 타입
 * @param source - 중복 요소를 제거할 원본 배열
 * @returns 중복 요소가 제거된 배열
 */
export const unique = <Type>(source: Type[]): Type[] =>
  Array.from(new Set(source));
