/**
 * Resolve library tokens through known options or the original stored selection.
 * @param previous - Stored JSON values, including unknown values shown as removable tags.
 * @param tokens - Remaining tokens after the user's selection or explicit tag removal.
 * @param options - Tokens and original values for known enum choices.
 * @returns Selected JSON values in the library's order, preserving untouched identities.
 */
export const decodeEnumSelection = <T>(
  previous: readonly T[],
  tokens: readonly string[],
  options: readonly { value: string; rawValue: T }[],
): T[] => {
  const result: T[] = [];
  for (const token of tokens) {
    const option = options.find((option) => option.value === token);
    if (option) result.push(option.rawValue);
    else {
      const index = previous.findIndex(
        (value) => JSON.stringify(value) === token,
      );
      if (index >= 0) result.push(previous[index]);
    }
  }
  return result;
};
