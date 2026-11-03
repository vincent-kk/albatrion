/**
 * Expands a finite graph without assuming it is acyclic.
 * @param {string[]} seeds Initially selected workspace names.
 * @param {object[]} workspaces Named graph nodes.
 * @param {boolean} reverse Follow consumers instead of dependencies.
 * @param {string} edgeKey Property holding dependency names.
 * @returns {string[]} Sorted reachable names, including seeds.
 */
export function collectClosure(seeds, workspaces, reverse = false, edgeKey = 'dependencies') {
  const selected = new Set(seeds);
  const pending = [...seeds];
  for (const name of pending) {
    const neighbors = reverse
      ? workspaces.filter((workspace) => workspace[edgeKey].includes(name)).map((workspace) => workspace.name)
      : workspaces.find((workspace) => workspace.name === name)?.[edgeKey] ?? [];
    for (const neighbor of neighbors) {
      if (selected.has(neighbor)) continue;
      selected.add(neighbor);
      pending.push(neighbor);
    }
  }
  return [...selected].sort();
}
