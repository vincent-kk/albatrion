/**
 * Decide whether a caller's virtual tuple writes a constituent.
 * @param name - Declared constituent name in tuple order.
 * @param index - Position in the declared tuple.
 * @param values - Caller tuple when it is an array.
 * @param isPresent - Whether the constituent is live when the caller enters.
 * @param admittedFields - The names captured at entry when replaying a marked write.
 * @returns Whether composing the value or recording its origin should visit this field.
 */
export const isVirtualWriteFieldAdmitted = (
  name: string,
  index: number,
  values: readonly unknown[] | undefined,
  isPresent: boolean,
  admittedFields?: readonly string[],
): boolean =>
  admittedFields !== undefined
    ? admittedFields.includes(name)
    : isPresent || values?.[index] !== undefined;
