import type { Fn } from '@aileron/declare';

/**
 * 함수 실행 컨텍스트를 저장하는 인터페이스
 * @template F - 함수 타입
 */
interface ExecutionContext<F extends Fn<any[]>> {
  /** 함수 실행 시 사용될 this 컨텍스트 */
  self: any;
  /** 함수 호출 시 전달할 인자들 */
  args: Parameters<F> | null;
}

/**
 * 함수 실행을 관리하고 스케줄링하는 클래스
 * debounce와 throttle 구현에 사용됨
 * @template F - 관리할 함수 타입
 */
export class FunctionContext<F extends Fn<any[]>> {
  /** 함수 실행 컨텍스트 */
  private __context__: ExecutionContext<F>;
  /** 타이머 ID */
  private __timer__: ReturnType<typeof setTimeout> | null = null;
  /** 관리 대상 함수 */
  private __function__: F;
  /** 실행 지연 시간 (밀리초) */
  private __delay__: number;

  /**
   * 현재 실행 대기 중인 타이머가 없는지 여부
   * @returns 타이머가 없으면 true, 있으면 false
   */
  get isIdle() {
    return this.__timer__ === null;
  }

  /**
   * FunctionContext 생성자
   * @param fn - 관리할 함수
   * @param ms - 실행 지연 시간(밀리초)
   */
  constructor(fn: F, ms: number) {
    this.__function__ = fn;
    this.__delay__ = ms;
    this.__context__ = {
      self: undefined,
      args: null,
    };
  }

  /**
   * 타이머와 컨텍스트를 초기화
   */
  clear() {
    this.__clearTimer__();
    this.__clearContext__();
  }

  /**
   * 함수 실행 컨텍스트 설정
   * @param self - 함수 실행 시 사용될 this 컨텍스트
   * @param args - 함수 호출 시 전달할 인자들
   */
  setArguments(self: any, args: Parameters<F>) {
    this.__context__.self = self;
    this.__context__.args = args;
  }

  /**
   * 현재 컨텍스트로 함수 실행
   */
  execute() {
    if (this.__context__.args === null) return;
    this.__function__.apply(this.__context__.self, this.__context__.args);
    this.__clearContext__();
  }

  /**
   * 지정된 시간 후에 함수 실행을 스케줄링
   * @param execute - 타이머 완료 시 함수 실행 여부
   */
  schedule(execute?: boolean) {
    if (this.__timer__ !== null) clearTimeout(this.__timer__);
    const timer = setTimeout(() => {
      this.__timer__ = null;
      if (execute) this.execute();
      this.clear();
    }, this.__delay__);
    this.__timer__ = timer;
  }

  /**
   * 타이머를 취소하고 함수 즉시 실행
   */
  manualExecute() {
    this.execute();
    this.__clearTimer__();
  }

  /**
   * 함수 실행 컨텍스트 초기화
   * @private
   */
  private __clearContext__() {
    this.__context__.self = undefined;
    this.__context__.args = null;
  }

  /**
   * 타이머 취소 및 초기화
   * @private
   */
  private __clearTimer__() {
    if (this.__timer__ === null) return;
    clearTimeout(this.__timer__);
    this.__timer__ = null;
  }
}
