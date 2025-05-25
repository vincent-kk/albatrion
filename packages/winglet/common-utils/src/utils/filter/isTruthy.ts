/**
 * @description Truthy value check, same functionality as Boolean check
 * @param value - Value to check
 * @returns true if value is truthy, false otherwise
 */
export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => !!value;

export type Falsy = false | null | undefined | '' | 0;
