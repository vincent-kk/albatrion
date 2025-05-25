import type { Fn } from '@aileron/declare';

/**
 * Function to check if a value is a function
 * @template T - Function type
 * @param value - Value to check
 * @returns true if the value is a function, false otherwise
 */
export const isFunction = <T extends Fn<any[], any>>(
  value: unknown,
): value is T => typeof value === 'function';
