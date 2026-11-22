/**
 * Compare primitive SameValueZero or object identity without inspecting contents.
 * @param left - Captured emitted input or commit baseline.
 * @param right - Current emitted input.
 * @returns Whether references or primitive values agree, including NaN with itself.
 */
export const sameValueZero = (left: unknown, right: unknown): boolean =>
  left === right || (left !== left && right !== right);
