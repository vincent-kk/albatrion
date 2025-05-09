import type { Fn } from '@aileron/declare';

/**
 * 환경에 맞는 nextTick 스케줄러를 반환하는 함수
 * 플랫폼에 따라 다음 우선순위로 구현:
 * 1. Node.js: process.nextTick + Promise
 * 2. 브라우저(지원 시): setImmediate
 * 3. 기타 환경: setTimeout(0)
 * @returns nextTick 스케줄링 함수
 */
const getScheduleNextTick = (): Fn<[task: Fn]> => {
  try {
    if (typeof process?.nextTick === 'function') {
      const resolve = Promise.resolve();
      return (task: Fn) => {
        resolve.then(() => process.nextTick(task));
      };
    }
  } catch {
    // NOTE: In a Browser environment, accessing `process` may throw an error.
  }
  if (typeof setImmediate === 'function')
    return (task: Fn) => {
      setImmediate(task);
    };
  return (task: Fn) => {
    setTimeout(task, 0);
  };
};

/**
 * 다음 이벤트 루프 틱에서 태스크를 실행하는 함수
 * 환경에 따라 최적의 구현을 자동 선택함
 * @param task - 다음 틱에 실행할 함수
 */
export const scheduleNextTick = getScheduleNextTick();
