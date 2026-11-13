/**
 * Summarize case ratios without hiding an individual case's regression.
 * @param {object[]} cases Nonempty measured cases with positive ratios and group names.
 * @returns {object} Group names mapped to geometric mean ratios.
 */
export function summarizeGroups(cases) {
  const groups = {};
  for (const item of cases) (groups[item.group] ??= []).push(item.ratio);
  return Object.fromEntries(
    Object.entries(groups).map(([name, ratios]) => [
      name,
      Math.exp(
        ratios.reduce((sum, ratio) => sum + Math.log(ratio), 0) / ratios.length,
      ),
    ]),
  );
}
