import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

/**
 * 스로틀된 함수의 인터페이스
 * @template F - 원본 함수 타입
 */
export interface ThrottledFn<F extends Fn<any[]>> {
  /**
   * 스로틀된 함수 호출
   * @param args - 원본 함수에 전달할 인자들
   */
  (...args: Parameters<F>): void;
  /** 스로틀 타이머를 무시하고 즉시 함수 실행 */
  execute: Fn;
  /** 예약된 함수 실행을 취소하고 타이머 초기화 */
  clear: Fn;
}

/**
 * 함수 호출 빈도를 제한하는 스로틀 함수를 생성
 * 지정된 시간 내에 여러 번 호출되더라도 첫 번째 호출 이후 특정 간격으로만 함수를 실행
 *
 * @template F - 스로틀할 함수 타입
 * @param fn - 스로틀할 원본 함수
 * @param ms - 스로틀 간격(밀리초)
 * @param options - 스로틀 옵션
 * @param options.signal - 스로틀을 중단할 수 있는 AbortSignal
 * @param options.leading - true일 경우 스로틀 시작 시 함수 즉시 실행 (기본값: true)
 * @param options.trailing - true일 경우 스로틀 종료 시 함수 실행 (기본값: true)
 * @returns 스로틀된 함수
 */
export const throttle = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  { signal, leading = true, trailing = true }: ExecutionOptions = {},
): ThrottledFn<F> => {
  const context = new FunctionContext(fn, ms);

  let previous = 0;
  const throttled = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;
    const immediately = leading && context.isIdle;
    const current = Date.now();

    context.setArguments(this, args);

    if (current - previous > ms) {
      previous = current;
      context.schedule(trailing);
    }

    if (immediately) context.execute();
  };

  throttled.execute = () => context.execute();
  throttled.clear = () => context.clear();

  signal?.addEventListener('abort', () => context.clear(), {
    once: true,
  });

  return throttled;
};
