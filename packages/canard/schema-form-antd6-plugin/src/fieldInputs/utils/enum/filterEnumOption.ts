/**
 * Match a select option's visible text or its raw identity.
 * @param query - Search text entered by the user.
 * @param option - Ant Design option whose children contain the display label.
 * @returns Whether the label or original enum identity contains the query, ignoring case and canonical Unicode spelling.
 */
export const filterEnumOption = (
  query: string,
  option?: { children?: unknown; value?: unknown },
): boolean => {
  const text = query.normalize('NFC').toLowerCase();
  return (
    String(option?.children ?? '')
      .normalize('NFC').toLowerCase()
      .includes(text) ||
    String(option?.value ?? '')
      .normalize('NFC').toLowerCase()
      .includes(text)
  );
};
