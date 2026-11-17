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
  const main = affected.filter((name) => name !== "@canard/schema-form");
  if (main.length)
    shards.push(createShard("main", main, changed, workspaces, tier));
  if (affected.includes("@canard/schema-form"))
    shards.push(
      createShard(
        "schema-form",
        ["@canard/schema-form"],
        changed,
        workspaces,
        tier,
      ),
    );
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
