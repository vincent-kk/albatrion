import { type DependencyList, useLayoutEffect, useRef } from 'react';

/**
 * @description 조건이 충족될 때까지 레이아웃 효과를 실행합니다.
 * @param effect - 조건 체크 함수
 * @param dependencies - 의존성 배열
 */
export const useLayoutEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies?: Dependencies,
) => {
  const isCompleted = useRef(false);
  useLayoutEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
  }, dependencies);
};
