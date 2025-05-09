const __hasOwnProperty__ = Object.prototype.hasOwnProperty;

/**
 * 객체가 직접 소유한 프로퍼티인지 확인하는 함수
 * 상속된 프로퍼티가 아닌 직접 정의된 프로퍼티만 true 반환
 * @template Value - 대상 값의 타입
 * @param value - 확인할 객체 또는 값
 * @param key - 확인할 프로퍼티 키
 * @returns 해당 객체가 프로퍼티를 직접 소유하는지 여부
 */
export const hasOwnProperty = <Value>(value: Value, key: string) =>
  __hasOwnProperty__.call(value, key);
