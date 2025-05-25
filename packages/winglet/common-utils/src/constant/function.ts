import type { Fn } from '@aileron/declare';

/** Function that always returns void 0 (undefined) */
export const voidFunction: Fn = () => void 0;

/** Function that always explicitly returns undefined */
export const undefinedFunction: Fn<[], undefined> = () => undefined;

/** Function that always returns null */
export const nullFunction: Fn<[], null> = () => null;

/** Function that always returns false */
export const falseFunction: Fn<[], false> = () => false;

/** Function that always returns true */
export const trueFunction: Fn<[], true> = () => true;

/**
 * Identity function that returns the input value as-is
 * @param value - The value to return
 * @returns The input value unchanged
 */
export const identityFunction = <T>(value: T): T => value;

/** Function that performs no operation (no-op) */
export const noopFunction = () => void 0;
