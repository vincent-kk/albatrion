/**
 * Constructs a Yarn-managed manifest ordering over explicit workspace names.
 * @param {string[]} names Build-capable workspace names.
 * @param {string} label Human-readable command group.
 * @returns {object} Serializable build step.
 */
export function createTopologicalBuild(names, label) {
  return {
    kind: "build",
    label,
    args: [
      "workspaces",
      "foreach",
      "--all",
      "--topological-dev",
      ...names.flatMap((name) => ["--include", name]),
      "run",
      "build",
    ],
  };
}
