import { classifyChangedFile } from "../selection/classifyChangedFile.mjs";
import { collectClosure } from "../selection/collectClosure.mjs";
import { createShard } from "./createShard.mjs";

/**
 * Produces conservative selection and independently executable matrix shards.
 * @param {object[]} workspaces Current named workspace graph and scripts.
 * @param {string[]} files Changed repository-relative paths.
 * @param {string|null} reason Nonempty fallback reason selects every workspace.
 * @param {string} tier Check policy, either pr or pre-release; other values throw.
 * @returns {object} JSON-serializable plan including changed, dependents, steps and shards.
 */
export function createCheckPlan(workspaces, files, reason = null, tier = "pr") {
  if (tier !== "pr" && tier !== "pre-release")
    throw new Error(`Invalid check tier: ${tier}`);
  if (tier === "pre-release")
    reason ??= "pre-release tier checks every workspace";
  const owners = files.map((file) => classifyChangedFile(file, workspaces));
  const changed =
    tier === "pre-release" || reason || owners.includes("global")
      ? workspaces.map(({ name }) => name).sort()
      : workspaces
          .filter(({ name }) => owners.includes(name))
          .map(({ name }) => name)
          .sort();
  const affected = collectClosure(
    changed,
    workspaces,
    true,
    "selectionDependencies",
  );
  const shards = [];
  const plugins = affected.filter(
    (name) =>
      name.startsWith("@canard/schema-form-") && name.endsWith("-plugin"),
  );
  const shared = affected.filter((name) =>
    ["@slats/agents-assets-sync", "@winglet/common-utils"].includes(name),
  );
  const main = affected.filter(
    (name) =>
      name !== "@canard/schema-form" &&
      !plugins.includes(name) &&
      !shared.includes(name),
  );
  if (main.length)
    shards.push(createShard("main", main, changed, workspaces, tier));
  if (affected.includes("@canard/schema-form")) {
    const schemaForm = ["@canard/schema-form"];
    if (tier === "pr") {
      // Run lint in the render job so neither unit job spends its time on lint.
      for (const index of [1, 2])
        shards.push(
          createShard(
            `schema-form-unit-${index}`,
            schemaForm,
            [],
            workspaces,
            tier,
            `${index}/2`,
          ),
        );
      shards.push(
        createShard(
          "schema-form-render",
          schemaForm,
          changed,
          workspaces,
          tier,
        ),
      );
    } else
      shards.push(
        createShard("schema-form", schemaForm, changed, workspaces, tier),
      );
  }
  const pluginGroups = [
    ["plugins-ajv", plugins.filter((name) => name.includes("-ajv"))],
    ["plugins-antd", plugins.filter((name) => /-antd[56]-plugin$/.test(name))],
    [
      "plugins-ui",
      plugins.filter(
        (name) => !name.includes("-ajv") && !/-antd[56]-plugin$/.test(name),
      ),
    ],
  ];
  for (const [name, members] of pluginGroups)
    if (members.length)
      shards.push(createShard(name, members, changed, workspaces, tier));
  if (shared.length)
    shards.push(createShard("shared", shared, changed, workspaces, tier));
  return {
    tier,
    changed,
    dependents: affected.filter((name) => !changed.includes(name)),
    affected,
    reason,
    any: affected.length > 0,
    browser: shards.some((shard) => shard.browser),
    steps: shards.flatMap((shard) => shard.steps),
    shards,
  };
}
