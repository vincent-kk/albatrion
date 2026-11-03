/**
 * Resolves ownership by directory boundary, including nested workspaces.
 * @param {string} file Repository-relative POSIX path.
 * @param {object[]} workspaces Named workspace directories.
 * @returns {object|undefined} Deepest containing workspace, when one exists.
 */
export function findWorkspaceOwner(file, workspaces) {
  return workspaces.filter(({ directory }) => file.startsWith(`${directory}/`))
    .sort((left, right) => right.directory.length - left.directory.length)[0];
}
