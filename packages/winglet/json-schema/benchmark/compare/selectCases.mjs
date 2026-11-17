/**
 * Select diagnostic groups and order without changing the default gate's cases or sampling.
 * @param {object[]} cases Deterministic cases in their canonical order.
 * @param {string|undefined} groups Comma-separated known groups; omitted selects every case.
 * @param {string|undefined} order Default order, reversed group order, or an explicit group permutation.
 * @returns {object[]} Selected cases; within-group order stays canonical.
 * @throws When a selection is empty, unknown, duplicated, or an order omits a selected group.
 */
export function selectCases(cases, groups, order) {
  const known = [...new Set(cases.map((item) => item.group))];
  const requested =
    groups === undefined ? known : groups.split(',').map((s) => s.trim());
  if (
    !requested.length ||
    new Set(requested).size !== requested.length ||
    requested.some((group) => !known.includes(group))
  )
    throw new Error(`Invalid --groups: ${groups}`);
  const selected = cases.filter((item) => requested.includes(item.group));
  if (order === undefined || order === 'default') return selected;
  const ordered =
    order === 'reverse'
      ? known.filter((group) => requested.includes(group)).reverse()
      : order.split(',').map((s) => s.trim());
  if (
    ordered.length !== requested.length ||
    new Set(ordered).size !== ordered.length ||
    ordered.some((group) => !requested.includes(group))
  )
    throw new Error(`Invalid --order: ${order}`);
  return ordered.flatMap((group) =>
    selected.filter((item) => item.group === group),
  );
}
