/**
 * Change only known options while retaining every untouched stored JSON value.
 * @param previous - Current form selection, including values outside the enum.
 * @param selectedTokens - Library selection encoded by the plugin's options.
 * @param options - Tokens and their original JSON values.
 * @returns The existing order with deselected options removed and new selections appended.
 */
export const mergeEnumSelection = <T>(
  previous: readonly T[],
  selectedTokens: readonly (string | number)[],
  options: readonly { value: string; rawValue: T }[],
): T[] => {
  const selected = options.filter(option => selectedTokens.includes(option.value)).map(option => option.rawValue);
  return [
    ...previous.filter(value => !options.some(option => option.rawValue === value) || selected.includes(value)),
    ...selected.filter(value => !previous.includes(value)),
  ];
};
