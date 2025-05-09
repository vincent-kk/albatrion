import type { Fn } from '@aileron/declare';

/**
 * 환경에 맞는 마이크로태스크 스케줄러를 반환하는 함수
 * queueMicrotask가 지원되면 이를 사용하고, 그렇지 않으면 Promise를 통해 구현
 * @returns 마이크로태스크 스케줄링 함수
 */
const getScheduleMicrotask = (): Fn<[task: Fn]> => {
  if (typeof queueMicrotask === 'function') return queueMicrotask;
  const resolve = Promise.resolve();
  return (task: Fn) => resolve.then(task);
};

/**
 * 마이크로태스크 큐에 태스크를 스케줄링하는 함수
 * 현재 실행 컨텍스트 이후, 다음 이벤트 루프 틱 전에 태스크 실행
 * @param task - 스케줄링할 함수
 */
export const scheduleMicrotask = getScheduleMicrotask();
