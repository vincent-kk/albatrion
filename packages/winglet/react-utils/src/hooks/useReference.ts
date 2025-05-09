import { useRef } from 'react';

/**
 * 입력값을 참조하는 ref 객체를 반환합니다. 값이 변경될 때마다 ref.current가 자동으로 업데이트됩니다.
 * 컴포넌트 내에서 항상 최신 값을 참조해야 하는 상황에서 유용합니다.
 * @typeParam T - 참조할 값의 타입
 * @param value - 참조할 값
 * @returns 값을 참조하는 ref 객체
 * @example
 * const callback = () => console.log(count);
 * const callbackRef = useReference(callback);
 * 
 * // 항상 최신 count 값을 로깅합니다
 * useEffect(() => {
 *   const timer = setInterval(() => callbackRef.current(), 1000);
 *   return () => clearInterval(timer);
 * }, []);
 */
export const useReference = <T>(value: T) => {
  const reference = useRef<T>(value);
  reference.current = value;
  return reference;
};
