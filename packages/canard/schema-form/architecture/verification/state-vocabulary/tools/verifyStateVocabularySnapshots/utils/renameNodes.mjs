/**
 * Rename only observed node-record keys; authored schemas and output objects remain exact.
 * @param history - A complete encoded history
 * @param mapping - Exact forward or inverse vocabulary mapping
 * @returns The same history with only its node-record keys replaced
 */
export const renameNodes = (history, mapping) => {
  for (const observation of history.observations ?? [])
    observation.nodes = observation.nodes.map((node) =>
      Object.fromEntries(
        Object.entries(node).map(([key, value]) => [
          mapping[key] ?? key,
          value,
        ]),
      ),
    );
  return history;
};
