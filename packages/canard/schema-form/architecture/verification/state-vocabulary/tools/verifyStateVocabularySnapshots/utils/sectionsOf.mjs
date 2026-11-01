/**
 * Independently reproduce the existing section partition for large-history hashes.
 * @param history - Complete captured observation history
 * @returns Ordered arrays for each original section
 */
export const sectionsOf = (history) => {
  const sections = { surface: history.surface };
  for (const { extra, ...fixed } of history.observations) {
    const { commits, ...effects } = extra;
    const row = {
      ...fixed,
      ...effects,
      commits: commits.map(({ pendingExitPaths, ...commit }) => commit),
      pendingExitPaths: commits.map((commit) => commit.pendingExitPaths),
    };
    for (const [key, value] of Object.entries(row))
      (sections[key] ??= []).push(value);
  }
  return sections;
};
