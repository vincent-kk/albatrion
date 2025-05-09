import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

/**
 * 디바운스된 함수의 인터페이스
 * @template F - 원본 함수 타입
 */
export interface DebouncedFn<F extends Fn<any[]>> {
  /**
   * 디바운스된 함수 호출
   * @param args - 원본 함수에 전달할 인자들
   */
  (...args: Parameters<F>): void;
  /** 디바운스 타이머를 무시하고 즉시 함수 실행 */
  execute: Fn;
  /** 예약된 함수 실행을 취소하고 타이머 초기화 */
  clear: Fn;
}

/**
 * 함수 호출을 특정 시간 동안 지연시키는 디바운스 함수를 생성
 * 연속적인 호출이 발생할 경우, 마지막 호출 후 지정된 시간이 경과한 후에만 함수를 실행
 *
 * @template F - 디바운스할 함수 타입
 * @param fn - 디바운스할 원본 함수
 * @param ms - 디바운스 시간(밀리초)
 * @param options - 디바운스 옵션
 * @param options.signal - 디바운스를 중단할 수 있는 AbortSignal
 * @param options.leading - true일 경우 디바운스 시작 시 함수 즉시 실행 (기본값: false)
 * @param options.trailing - true일 경우 디바운스 종료 시 함수 실행 (기본값: true)
 * @returns 디바운스된 함수
 */
export const debounce = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  { signal, leading = false, trailing = true }: ExecutionOptions = {},
): DebouncedFn<F> => {
  const context = new FunctionContext(fn, ms);

  const debounced = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;
    const immediately = leading && context.isIdle;

    context.setArguments(this, args);
    context.schedule(trailing);

    if (immediately) context.execute();
  };

  debounced.execute = () => context.manualExecute();
  debounced.clear = () => context.clear();

  signal?.addEventListener('abort', () => context.clear(), {
    once: true,
  });

  return debounced;
};
