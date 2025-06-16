export const dataAttributes = (
  attrs: Record<string, boolean>,
): Record<string, true | undefined> => {
  const result: Record<string, true | undefined> = {};
  for (const key in attrs) if (attrs[key]) result[key] = true;
  return result;
};
