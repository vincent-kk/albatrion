/**
 * Partition fixed, allowed-change and invariant records without reducing observations.
 * @param serialized - The complete encoded history returned by the observer
 * @returns Independently comparable sections, with pending path indexes isolated
 */
export const sectionGateTableObservation = (serialized: string) => {
  const history = JSON.parse(serialized);
  const sections: Record<string, unknown> = { surface: history.surface };
  for (const observation of history.observations) {
    const { extra, ...fixed } = observation;
    const { commits, ...effects } = extra;
    const row = {
      ...fixed,
      ...effects,
      commits: commits.map(
        ({ pendingExitPaths: _paths, ...commit }: Record<string, unknown>) =>
          commit,
      ),
      pendingExitPaths: commits.map(
        (commit: Record<string, unknown>) => commit.pendingExitPaths,
      ),
    };
    for (const [section, value] of Object.entries(row))
      ((sections[section] ??= []) as unknown[]).push(value);
  }
  return { fixture: history.fixture as string, sections };
};
