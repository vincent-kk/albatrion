import { useCallback, useState } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * React 렌더를 유발하는 version과 version을 업데이트하는 함수를 반환합니다.
 * 이는 컴포넌트의 강제 렌더링이 필요한 경우에 유용합니다.
 * @param {Function} callback - updateVersion 호출시에 실행할 callback 함수, optional
 * @returns [version, updateVersion] - 버전 번호와 버전을 업데이트하는 함수
 * @example
 * const [version, forceUpdate] = useVersion();
 * // 필요한 시점에 강제 렌더링
 * const handleRefresh = () => forceUpdate();
 */
export const useVersion = (callback?: Fn) => {
  const [version, setVersion] = useState(0);
  const callbackRef = useReference(callback);
  const update = useCallback(() => {
    callbackRef.current?.();
    setVersion((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [version, update] as const;
};
