import { useMemo } from 'react';

/**
 * 입력값을 메모이제이션하여 처음 렌더링 될 때의 값을 계속 유지합니다.
 * useMemo 후크와 비슷하지만, 의존성 배열이 비어있어 처음 값만 유지합니다.
 * @typeParam T - 메모이제이션할 값의 타입
 * @param input - 메모이제이션할 값
 * @returns 메모이제이션된 값
 */
export const useMemorize = <T>(input: T) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => input, []);
};
