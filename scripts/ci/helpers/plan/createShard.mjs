import { createBuildSteps } from "./createBuildSteps.mjs";

/**
 * Assembles one independently installable shard in build/lint/typecheck/test order.
 * @param {string} name Matrix shard identifier.
 * @param {string[]} affected Workspaces checked in this shard.
 * @param {string[]} changed Workspaces whose sources changed.
 * @param {object[]} workspaces Manifest scripts and build edges.
 * @param {string} tier Check policy, either pr or pre-release; other values throw.
 * @param {object} [options] PR-only build or unit-test partition.
 * @param {string} [options.schemaFormUnitShard] Vitest file partition; the PR render job omits it.
 * @param {boolean} [options.bootstrapSchemaForm] Another shard already runs schema-form's full build.
 * @returns {object} Named shard with browser requirement and serial steps.
 */
export function createShard(
  name,
  affected,
  changed,
  workspaces,
  tier = "pr",
  { schemaFormUnitShard, bootstrapSchemaForm } = {},
) {
  if (tier !== "pr" && tier !== "pre-release")
    throw new Error(`Invalid check tier: ${tier}`);
  const selected = workspaces.filter((workspace) =>
    affected.includes(workspace.name),
  );
  const lint = selected
    .filter(
      (workspace) => changed.includes(workspace.name) && workspace.scripts.lint,
    )
    .map((workspace) => ({
      kind: "lint",
      label: `Lint ${workspace.name}`,
      args: ["workspace", workspace.name, "lint"],
    }));
  const builds = createBuildSteps(affected, workspaces, tier, {
    bootstrapSchemaForm,
    parallelJobs: schemaFormUnitShard || bootstrapSchemaForm ? 3 : undefined,
  });
  // ESLint import/no-unresolved resolves workspace dist exports, which clean checkouts must build first.
  const steps = [...builds, ...lint];
  for (const workspace of selected) {
    const built = builds.some((step) => step.args.includes(workspace.name));
    if (workspace.scripts.typecheck && !built)
      steps.push({
        kind: "typecheck",
        label: `Typecheck ${workspace.name}`,
        args: ["workspace", workspace.name, "typecheck"],
      });
  }
  for (const workspace of selected.filter(
    (workspace) => workspace.scripts.test,
  )) {
    if (
      workspace.name === "@canard/schema-form" &&
      tier === "pr" &&
      schemaFormUnitShard
    ) {
      steps.push({
        kind: "test",
        label: "Test schema-form unit",
        args: [
          "workspace",
          workspace.name,
          "test",
          "--run",
          "--project",
          "unit",
          "--config",
          "../../../scripts/ci/helpers/plan/schemaFormUnit.config.mjs",
          `--shard=${schemaFormUnitShard}`,
        ],
      });
    } else if (workspace.name === "@canard/schema-form" && tier === "pr") {
      steps.push({
        kind: "test",
        label: "Test schema-form input lifetime regressions on React19/React18",
        args: [
          "workspace",
          workspace.name,
          "test",
          "--run",
          "--project",
          "render",
          "--project",
          "react18",
          "src/__tests__/e2e/controlledCallbackLifetime.test.tsx",
          "src/__tests__/e2e/controlledSelectionLifetime.test.tsx",
          "src/__tests__/e2e/inputCallbackLocks.test.tsx",
          "src/__tests__/e2e/inputCallbackLocks.lifecycle.test.tsx",
          "src/__tests__/e2e/fileCallbackLocks.test.tsx",
          "src/helpers/fieldInputDefinition/__tests__/inputBoundaryLayer.test.tsx",
          "src/components/FieldProxy/__tests__/rendererBoundary.test.tsx",
        ],
      });
    } else if (workspace.name === "@canard/schema-form") {
      steps.push({
        kind: "test",
        label: "Test schema-form unit/render/React18/Storybook",
        args: [
          "workspace",
          workspace.name,
          "test",
          "--run",
          "--project",
          "unit",
          "--project",
          "render",
          "--project",
          "react18",
          "--project",
          "storybook",
        ],
      });
      steps.push({
        kind: "test",
        label: "Verify schema-form",
        args: ["workspace", workspace.name, "test:verify", "--run"],
      });
      steps.push({
        kind: "test",
        label: "Test schema-form production bundles",
        args: ["workspace", workspace.name, "test:production"],
      });
    } else
      steps.push({
        kind: "test",
        label: `Test ${workspace.name}`,
        args: ["workspace", workspace.name, "test", "--run"],
      });
  }
  return {
    name,
    affected,
    browser: tier === "pre-release" && affected.includes("@canard/schema-form"),
    steps,
  };
}
