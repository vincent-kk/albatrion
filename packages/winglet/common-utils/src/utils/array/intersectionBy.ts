import { map } from './map';

/**
 * 두 배열의 교집합을 반환하는 함수
 * 주어진 매핑 함수를 사용하여 각 배열의 요소를 비교하고,
 * 교집합을 이루는 요소들을 배열로 반환함
 * @template Type1 - 첫 번째 배열의 요소 타입
 * @template Type2 - 두 번째 배열의 요소 타입
 * @param source - 첫 번째 배열
 * @param target - 두 번째 배열
 * @param mapper - 요소를 비교 가능한 값으로 변환하는 함수
 * @returns 두 배열의 교집합을 이루는 요소들의 배열
 */
export const intersectionBy = <Type1, Type2>(
  source: Type1[],
  target: Type2[],
  mapper: (item: Type1 | Type2) => unknown,
): Type1[] => {
  const targetSet = new Set(map(target, mapper));
  const result: Type1[] = [];
  for (let i = 0; i < source.length; i++) {
    const item = source[i];
    if (targetSet.has(mapper(item))) result.push(item);
  }
  return result;
};
