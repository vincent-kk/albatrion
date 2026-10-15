/**
 * Assemble a group's codes without widening its keys or literal values.
 * @param group - Group preceding the dot separator.
 * @param specifics - Bare specific literals keyed by their canonical names.
 * @returns Group-qualified values with the specific table's keys and order.
 */
export const assembleCodeGroup = <
  Group extends string,
  Specifics extends Readonly<Record<string, string>>,
>(
  group: Group,
  specifics: Specifics,
) =>
  Object.fromEntries(
    Object.entries(specifics).map(([key, specific]) => [
      key,
      `${group}.${specific}`,
    ]),
  ) as { [Key in keyof Specifics]: `${Group}.${Specifics[Key]}` };
