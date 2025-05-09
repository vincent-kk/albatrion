/**
 * 배열에서 주어진 인덱스의 요소 또는 요소들을 가져오는 함수
 * 음수 인덱스는 배열 끝에서부터 역순으로 계산됨 (-1은 마지막 요소)
 * @template Type - 배열 요소의 타입
 * @template Indexes - 가져올 인덱스 또는 인덱스들의 배열
 * @template Result - 반환 결과 타입 (단일 인덱스의 경우 Type, 배열 인덱스의 경우 Type[])
 * @param array - 대상 배열
 * @param indexes - 가져올 요소의 인덱스 또는 인덱스 배열
 * @returns 주어진 인덱스의 배열 요소 또는 요소들
 */
export const at = <
  Type,
  Indexes extends number[] | number,
  Result = Indexes extends number[] ? Type[] : Type,
>(
  array: readonly Type[],
  indexes: Indexes,
): Result => {
  if (typeof indexes === 'number') {
    const index = indexes < 0 ? indexes + array.length : indexes;
    return array[index] as unknown as Result;
  }
  const result = new Array<Type>(indexes.length);
  const length = array.length;
  for (let i = 0; i < indexes.length; i++) {
    let index = indexes[i];
    index = Number.isInteger(index) ? index : Math.trunc(index) || 0;
    if (index < 0) index += length;
    result[i] = array[index];
  }
  return result as Result;
};
