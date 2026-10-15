/**
 * Derive a group's table without changing canonical keys, literals, or order.
 * @param codes - Canonical table of group-qualified code strings.
 * @param group - Exact group name preceding the dot separator.
 * @returns Only entries with that group prefix, retaining their literal types.
 */
export const filterCodeGroup = <
  Codes extends Readonly<Record<string, string>>,
  Group extends string,
>(
  codes: Codes,
  group: Group,
) =>
  Object.fromEntries(
    Object.entries(codes).filter(([, code]) => code.startsWith(`${group}.`)),
  ) as {
    [Key in keyof Codes as Codes[Key] extends `${Group}.${string}`
      ? Key
      : never]: Codes[Key];
  };
