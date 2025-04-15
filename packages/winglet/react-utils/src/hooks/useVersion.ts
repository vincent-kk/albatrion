import { useCallback, useState } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * @description React Render를 유발하는 version과 version을 업데이트하는 함수를 반환합니다.
 * @param {Function} callback - updateVersion 호출시에 실행할 callback 함수, optional
 * @returns [version, updateVersion]
 */
export const useVersion = (callback?: Fn) => {
  const [version, setVersion] = useState(0);
  const callbackRef = useReference(callback);
  const update = useCallback(() => {
    callbackRef.current?.();
    setVersion((prev) => prev + 1);
  }, []);
  return [version, update] as const;
};
