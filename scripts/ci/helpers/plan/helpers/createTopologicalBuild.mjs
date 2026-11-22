/**
 * Constructs a Yarn-managed manifest ordering over explicit workspace names.
 * @param {string[]} names Build-capable workspace names.
 * @param {string} label Human-readable command group.
 * @param {number} [parallelJobs] Maximum concurrent workspace builds, respecting dependency order.
 * @returns {object} Serializable build step.
 */
export function createTopologicalBuild(names, label, parallelJobs) {
  return {
    kind: "build",
    label,
    args: [
      "workspaces",
      "foreach",
      "--all",
      "--topological-dev",
      ...(parallelJobs ? ["--parallel", "--jobs", String(parallelJobs)] : []),
      ...names.flatMap((name) => ["--include", name]),
      "run",
      "build",
    ],
  };
}
