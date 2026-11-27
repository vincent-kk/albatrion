/**
 * Count concrete records in a complete checkpoint history for manifest diagnostics.
 * @param serialized - Full observer JSON, before sectioning
 * @returns Observation, node, delivery, surface, dirty-call and revival cardinalities
 */
export const countGateTableObservation = (serialized: string) => {
  const { observations, surface } = JSON.parse(serialized);
  return {
    observations: observations.length,
    nodesPerObservation: observations.map(
      (row: { nodes: unknown[] }) => row.nodes.length,
    ),
    deliveries: observations.reduce(
      (count: number, row: { deliveries: unknown[] }) =>
        count + row.deliveries.length,
      0,
    ),
    surfaceEvents: surface.reduce(
      (count: number, row: [string, unknown[]][]) =>
        count + (row.find(([key]) => key === 'events')?.[1].length ?? 0),
      0,
    ),
    dirtyChildrenCalls: observations.reduce(
      (count: number, row: { extra: { dirtyChildren: unknown[] } }) =>
        count + row.extra.dirtyChildren.length,
      0,
    ),
    revivals: observations.reduce(
      (count: number, row: { extra: { revivals: unknown[] } }) =>
        count + row.extra.revivals.length,
      0,
    ),
  };
};
