import type { Fn } from '@aileron/declare';

/** Function that always returns void 0 (undefined) */
export const voidFunction: Fn = Object.freeze(() => void 0);

/** Function that always returns null */
export const nullFunction: Fn<[], null> = Object.freeze(() => null);

/** Function that always returns false */
export const falseFunction: Fn<[], false> = Object.freeze(() => false);

/** Function that always returns true */
export const trueFunction: Fn<[], true> = Object.freeze(() => true);

/**
 * Identity function that returns the input value as-is
 * @param value - The value to return
 * @returns The input value unchanged
 */
export const identityFunction = Object.freeze(<T>(value: T): T => value);

/** Function that performs no operation (no-op) */
export const noopFunction = voidFunction;
