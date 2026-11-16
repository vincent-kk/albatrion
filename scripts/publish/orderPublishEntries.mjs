/**
 * @typedef {object} Workspace
 * @property {string} location Path of the workspace from the repository root; `.` is the root itself.
 * @property {string} name Package name.
 * @property {string[]} workspaceDependencies Locations of the workspaces this one depends on.
 */

/**
 * Order workspaces so that each one comes after the workspaces it depends on.
 *
 * Publishing in this order means a package never reaches the registry before a
 * package it needs. Workspaces that do not depend on each other keep the order
 * they were listed in.
 *
 * @param {Workspace[]} workspaces Rows of `yarn workspaces list --json --verbose`.
 *   The root (`.`) is dropped, and a dependency on a workspace that is not in
 *   the list, such as a private one, is ignored.
 * @returns {Workspace[]} The workspaces to publish, dependencies first.
 * @throws {Error} When the listed workspaces depend on each other in a cycle;
 *   the message names them.
 */
export function orderPublishEntries(workspaces) {
  const pending = workspaces.filter((workspace) => workspace.location !== '.');
  const ordered = [];
  const placed = new Set();

  while (pending.length > 0) {
    const listed = new Set(pending.map((workspace) => workspace.location));
    const index = pending.findIndex((workspace) =>
      workspace.workspaceDependencies.every(
        (dependency) => placed.has(dependency) || !listed.has(dependency),
      ),
    );
    if (index === -1) {
      throw new Error(
        `Workspaces depend on each other in a cycle: ${[...listed].join(', ')}`,
      );
    }
    const [next] = pending.splice(index, 1);
    placed.add(next.location);
    ordered.push(next);
  }

  return ordered;
}
