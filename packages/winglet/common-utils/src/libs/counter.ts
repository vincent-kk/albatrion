/**
 * 카운터 객체를 생성하는 팩토리 함수
 * 값을 증가, 감소, 초기화할 수 있는 카운터 제공
 * @param initialValue - 초기 값 (기본값: 0)
 * @returns 카운터 조작 기능을 포함한 객체
 */
export const counterFactory = (initialValue = 0) => {
  let value = initialValue;
  return {
    get value() {
      return value;
    },
    /**
     * 카운터 값을 1 증가시키고 증가된 값을 반환
     * @returns 증가된 카운터 값
     */
    increment: () => ++value,
    /**
     * 카운터 값을 1 감소시키고 감소된 값을 반환
     * @returns 감소된 카운터 값
     */
    decrement: () => --value,
    /**
     * 카운터 값을 초기값으로 재설정
     * @returns 초기화된 값
     */
    reset: () => (value = initialValue),
  };
};
