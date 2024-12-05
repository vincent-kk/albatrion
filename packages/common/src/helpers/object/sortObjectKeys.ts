export const sortObjectKeys = <Dict extends Dictionary>(
  object: Nullish<Dict>,
  keys: string[] = [],
): Dict => {
  if (!object) return {} as Dict;

  const keysSet = new Set(keys);
  const orderedKeys = [
    ...keys,
    ...Object.keys(object).filter((key) => !keysSet.has(key)),
  ];

  return Object.fromEntries(
    orderedKeys.filter((key) => key in object).map((key) => [key, object[key]]),
  ) as Dict;
};
