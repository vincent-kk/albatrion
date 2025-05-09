import { cancelMacrotask, scheduleMacrotask } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

/**
 * 마크로태스크를 한 번만 실행하는 함수를 만듭니다.
 * 함수가 여러 번 호출되면 이전 태스크를 취소하고 새로운 태스크를 스케줄링합니다.
 * @param handler - 마크로태스크로 실행할 함수
 * @returns 호출될 때마다 이전 태스크를 취소하고 새 태스크를 스케줄링하는 함수
 */
export const afterMicrotask = (handler: Fn): Fn => {
  let id: number | undefined;
  const callback = () => {
    handler();
    id = undefined;
  };
  return () => {
    if (id) cancelMacrotask(id);
    id = scheduleMacrotask(callback);
  };
};
