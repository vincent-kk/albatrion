/**
 * Match a multiple Select option by its label or enum value.
 * @param query - Search text, which can use either canonical Unicode spelling.
 * @param option - The library option carrying the displayed label and original enum value.
 * @returns Whether either text contains the query after NFC and lowercase conversion.
 */
export const filterEnumOption = (
  query: string,
  option?: { label?: unknown; rawValue?: unknown },
): boolean => {
  if (!option) return false;
  const text = query.normalize('NFC').toLowerCase();
  return (
    String(option.label).normalize('NFC').toLowerCase().includes(text) ||
    String(option.rawValue).normalize('NFC').toLowerCase().includes(text)
  );
};
