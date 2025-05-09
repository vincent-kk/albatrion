import type { Fn } from '@aileron/declare';

/** 항상 void 0(undefined)를 반환하는 함수 */
export const voidFunction: Fn = () => void 0;

/** 항상 undefined를 명시적으로 반환하는 함수 */
export const undefinedFunction: Fn<[], undefined> = () => undefined;

/** 항상 null을 반환하는 함수 */
export const nullFunction: Fn<[], null> = () => null;

/** 항상 false를 반환하는 함수  */
export const falseFunction: Fn<[], false> = () => false;

/** 항상 true를 반환하는 함수 */
export const trueFunction: Fn<[], true> = () => true;

/**
 * 입력값을 그대로 반환하는 항등 함수
 * @param value - 반환할 값
 * @returns 입력된 값을 그대로 반환
 */
export const identityFunction = <T>(value: T): T => value;

/** 아무 작업도 수행하지 않는 함수 (no operation) */
export const noopFunction = () => void 0;
