import assert from "node:assert/strict";
import { test } from "node:test";
import { createCheckPlan } from "../helpers/plan/createCheckPlan.mjs";
import { readTrackedFiles } from "../helpers/workspaces/readTrackedFiles.mjs";
import { readWorkspaces } from "../helpers/workspaces/readWorkspaces.mjs";
import { scanImportDependencies } from "../helpers/selection/scanImportDependencies.mjs";
const root = new URL("../../../", import.meta.url).pathname;
const files = readTrackedFiles(root);
const workspaces = scanImportDependencies(
  root,
  files,
  readWorkspaces(root, files),
);
for (const tier of ["pr", "pre-release"])
  test(`${tier} isolates all plugins without dropping a workspace test`, () => {
    const plan = createCheckPlan(workspaces, ["package.json"], null, tier);
    const plugins = workspaces
      .filter(
        (w) =>
          w.name.startsWith("@canard/schema-form-") &&
          w.name.endsWith("-plugin"),
      )
      .map((w) => w.name)
      .sort();
    const shards = plan.shards.filter((s) => s.name.startsWith("plugins-"));
    assert.deepEqual(
      shards.map((s) => s.name),
      ["plugins-ajv", "plugins-antd", "plugins-ui"],
    );
    assert.deepEqual(shards.flatMap((s) => s.affected).sort(), plugins);
    for (const shard of shards) assert.equal(shard.browser, false);
    assert.deepEqual(
      shards[0].affected,
      plugins.filter((name) => name.includes("-ajv")),
    );
    assert.deepEqual(
      shards[1].affected,
      plugins.filter((name) => /-antd[56]-plugin$/.test(name)),
    );
    assert.deepEqual(
      shards[2].affected,
      plugins.filter(
        (name) => !name.includes("-ajv") && !/-antd[56]-plugin$/.test(name),
      ),
    );
    const main = plan.shards.find((s) => s.name === "main");
    assert.ok(main.affected.every((name) => !plugins.includes(name)));
    for (const plugin of plugins)
      assert.equal(
        plan.steps.filter((s) => s.kind === "test" && s.args[1] === plugin)
          .length,
        1,
      );
    for (const workspace of workspaces.filter(
      (w) => w.scripts.test && w.name !== "@canard/schema-form",
    ))
      assert.equal(
        plan.steps.filter(
          (s) => s.kind === "test" && s.args[1] === workspace.name,
        ).length,
        1,
        workspace.name,
      );
    assert.deepEqual(
      plan.shards.find((s) => s.name === "schema-form").affected,
      ["@canard/schema-form"],
    );
  });

for (const tier of ["pr", "pre-release"])
  test(`${tier} isolates shared utility tests from the remaining main budget`, () => {
    const plan = createCheckPlan(workspaces, ["package.json"], null, tier);
    const shared = ["@slats/agents-assets-sync", "@winglet/common-utils"];
    assert.deepEqual(
      plan.shards.find((s) => s.name === "shared").affected,
      shared,
    );
    assert.ok(
      plan.shards
        .find((s) => s.name === "main")
        .affected.every((name) => !shared.includes(name)),
    );
    assert.equal(plan.shards.find((s) => s.name === "shared").browser, false);
    for (const name of shared)
      assert.equal(
        plan.steps.filter((s) => s.kind === "test" && s.args[1] === name)
          .length,
        1,
      );
    assert.equal(plan.shards[1].name, "schema-form");
  });
