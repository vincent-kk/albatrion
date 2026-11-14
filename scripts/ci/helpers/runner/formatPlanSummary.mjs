/**
 * Formats selection and command results for a GitHub Markdown step summary.
 * @param {object} plan Changed owners and transitive dependents.
 * @param {object[]} results Commands with statuses and elapsed seconds.
 * @returns {string} Escaped Markdown table and selection description.
 */
export function formatPlanSummary(plan, results) {
  return [
    "## Affected workspace checks",
    "",
    `Changed: ${plan.changed.join(", ") || "(none)"}`,
    "",
    `Dependents: ${plan.dependents.join(", ") || "(none)"}`,
    "",
    "| Shard | Command | Result | Seconds |",
    "| --- | --- | --- | --- |",
    ...results.map(
      (result) =>
        `| ${result.shard} | \`yarn ${result.args.join(" ").replaceAll("|", "\\|").replaceAll("`", "\\`")}\` | ${result.status} | ${result.seconds.toFixed(2)} |`,
    ),
    "",
  ].join("\n");
}
