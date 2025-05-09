import type { Fn } from '@aileron/declare';

/**
 * 매크로태스크 스케줄링 함수 타입 정의
 * @template Id - 스케줄러가 반환하는 ID 타입
 */
type SchedulerFunctions<Id = any> = {
  /**
   * 매크로태스크 스케줄링 함수
   * @param callback - 실행할 콜백 함수
   * @returns scheduleMacrotask 함수가 반환하는 ID
   */
  scheduleMacrotask: Fn<[callback: Fn], Id>;
  /**
   * 예약된 매크로태스크 취소 함수
   * @param id - scheduleMacrotask 함수가 반환하는 ID
   */
  cancelMacrotask: Fn<[id: Id]>;
};

/**
 * 환경에 맞는 매크로태스크 스케줄러를 반환하는 함수
 * setImmediate가 지원되면 이를 우선 사용하고, 그렇지 않으면 setTimeout 사용
 * @returns 매크로태스크 스케줄링 및 취소 함수
 */
const getScheduleMacrotask = (): SchedulerFunctions => {
  if (typeof globalThis.setImmediate === 'function')
    return {
      scheduleMacrotask: globalThis.setImmediate.bind(globalThis),
      cancelMacrotask: globalThis.clearImmediate.bind(globalThis),
    } as const;
  return {
    scheduleMacrotask: globalThis.setTimeout.bind(globalThis),
    cancelMacrotask: globalThis.clearTimeout.bind(globalThis),
  } as const;
};

export const { scheduleMacrotask, cancelMacrotask } =
  getScheduleMacrotask() as SchedulerFunctions<number>;

/**
 * 취소 가능한 매크로태스크를 스케줄링하는 함수
 * @param callback - 실행할 콜백 함수
 * @returns 스케줄링된 태스크를 취소하는 함수
 */
export const scheduleCancelableMacrotask = (callback: Fn): Fn => {
  let canceled = false;
  const id = scheduleMacrotask(() => {
    if (!canceled) callback();
  });
  return () => {
    canceled = true;
    cancelMacrotask(id);
  };
};
