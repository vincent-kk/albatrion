/**
 * 함수 실행 제어 옵션
 */
export type ExecutionOptions = {
  /** 함수 실행을 중단할 수 있는 AbortSignal */
  signal?: AbortSignal;
  /** 시작 시 함수 즉시 실행 여부 */
  leading?: boolean;
  /** 종료 시 함수 실행 여부 */
  trailing?: boolean;
};
