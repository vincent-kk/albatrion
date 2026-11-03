import assert from "node:assert/strict";
import { test } from "node:test";

import { createCheckPlan } from "../helpers/plan/createCheckPlan.mjs";
import { createBuildSteps } from "../helpers/plan/createBuildSteps.mjs";
import { createShard } from "../helpers/plan/createShard.mjs";
import { runPlanSteps } from "../helpers/runner/runPlanSteps.mjs";
import { scanImportDependencies } from "../helpers/selection/scanImportDependencies.mjs";
import { readTrackedFiles } from "../helpers/workspaces/readTrackedFiles.mjs";
import { readWorkspaces } from "../helpers/workspaces/readWorkspaces.mjs";

/** Repository scripts drive plans dynamically, including future typecheck additions. */
const root = new URL("../../../", import.meta.url).pathname;
/** Shared tracked paths avoid filesystem enumeration. */
const files = readTrackedFiles(root);
/** Separate manifest and import edges model real selection cycles. */
const workspaces = scanImportDependencies(
  root,
  files,
  readWorkspaces(root, files),
);

test("lint runs only for changed owners while dependents still receive checks", () => {
  const plan = createCheckPlan(workspaces, [
    "packages/winglet/common-utils/src/index.ts",
  ]);
  assert.deepEqual(
    plan.steps.filter(({ kind }) => kind === "lint").map(({ args }) => args[1]),
    ["@winglet/common-utils"],
  );
  assert.ok(plan.dependents.includes("@canard/schema-form"));
});

test("build closure includes manifest prerequisites and Yarn topological-dev ordering", () => {
  const plan = createCheckPlan(workspaces, [
    "packages/winglet/style-utils/src/index.ts",
  ]);
  const build = plan.steps.find(
    ({ label }) => label === "Build workspace closure",
  );
  assert.ok(
    plan.steps.some(
      ({ kind, args }) =>
        kind === "build" && args.includes("@slats/agents-assets-sync"),
    ),
  );
  assert.ok(build.args.includes("--topological-dev"));
  assert.ok(
    !createBuildSteps(["@winglet/style-utils"], workspaces).some(({ label }) =>
      label.includes("Bootstrap"),
    ),
  );
});

test("schema-form closure bootstraps runtime and declarations before AJV and full builds", () => {
  const plan = createCheckPlan(workspaces, [
    "packages/canard/schema-form/src/index.ts",
  ]);
  for (const shard of plan.shards) {
    const labels = shard.steps.map(({ label }) => label);
    assert.ok(
      labels.indexOf("Bootstrap schema-form runtime") <
        labels.indexOf("Bootstrap schema-form declarations"),
    );
    assert.ok(
      labels.indexOf("Bootstrap schema-form declarations") <
        labels.indexOf("Build AJV declarations"),
    );
    assert.ok(
      labels.indexOf("Build AJV declarations") <
        labels.indexOf("Build workspace closure"),
    );
    const build = shard.steps.find(
      ({ label }) => label === "Build workspace closure",
    );
    assert.ok(build.args.includes("@canard/schema-form"));
    if (shard.name === "main")
      assert.ok(build.args.includes("@canard/schema-form-antd5-plugin"));
    for (const step of shard.steps.filter(({ label }) =>
      ["Build schema-form prerequisites", "Build AJV declarations"].includes(
        label,
      ),
    ))
      for (const [index, arg] of step.args.entries())
        if (arg === "--include")
          assert.ok(!build.args.includes(step.args[index + 1]));
  }
});

test("documents gets typecheck and never a site build", () => {
  const plan = createCheckPlan(workspaces, ["documents/src/index.ts"]);
  assert.ok(
    plan.steps.some(
      ({ kind, args }) =>
        kind === "typecheck" && args[1] === "@albatrion/documents",
    ),
  );
  assert.ok(
    !plan.steps.some(
      ({ kind, args }) =>
        kind === "build" && args.includes("@albatrion/documents"),
    ),
  );
});

test("production-testbed uses its manifest name and only builds when affected", () => {
  const plan = createCheckPlan(workspaces, [
    "packages/aileron/production-test/src/index.ts",
  ]);
  assert.deepEqual(plan.changed, ["@aileron/production-testbed"]);
  assert.ok(
    plan.steps.some(
      ({ kind, args }) =>
        kind === "build" && args.includes("@aileron/production-testbed"),
    ),
  );
});

test("default pr tier runs only schema-form unit tests without a browser", () => {
  const plan = createCheckPlan(workspaces, [
    "packages/canard/schema-form/src/index.ts",
  ]);
  assert.equal(plan.tier, "pr");
  assert.equal(plan.browser, false);
  assert.deepEqual(
    plan.shards.map(({ name }) => name),
    ["main", "schema-form"],
  );
  const schema = plan.shards.find(({ name }) => name === "schema-form");
  assert.equal(schema.browser, false);
  assert.equal(plan.shards[0].browser, false);
  assert.deepEqual(
    schema.steps.filter(({ kind }) => kind === "test"),
    [
      {
        kind: "test",
        label: "Test schema-form unit",
        args: [
          "workspace",
          "@canard/schema-form",
          "test",
          "--run",
          "--project",
          "unit",
        ],
      },
    ],
  );
});

test("pre-release tier isolates complete schema-form suites and browser installation", () => {
  const plan = createCheckPlan(workspaces, ["README.md"], null, "pre-release");
  assert.equal(plan.tier, "pre-release");
  assert.equal(plan.reason, "pre-release tier checks every workspace");
  assert.deepEqual(plan.changed, workspaces.map(({ name }) => name).sort());
  assert.deepEqual(plan.affected, plan.changed);
  assert.equal(plan.browser, true);
  assert.deepEqual(
    plan.shards.map(({ name }) => name),
    ["main", "schema-form"],
  );
  const schema = plan.shards.find(({ name }) => name === "schema-form");
  assert.equal(schema.browser, true);
  assert.equal(plan.shards[0].browser, false);
  assert.deepEqual(
    schema.steps
      .filter(({ kind }) => kind === "test")
      .map(({ label, args }) => ({ label, args })),
    [
      {
        label: "Test schema-form unit/render/React18/Storybook",
        args: [
          "workspace",
          "@canard/schema-form",
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
      },
      {
        label: "Verify schema-form",
        args: ["workspace", "@canard/schema-form", "test:verify", "--run"],
      },
      {
        label: "Test schema-form production bundles",
        args: ["workspace", "@canard/schema-form", "test:production"],
      },
    ],
  );
  assert.ok(
    !plan.shards[0].steps.some(
      ({ kind, args }) => kind === "test" && args[1] === "@canard/schema-form",
    ),
  );
});

test("pre-release preserves an explicit reason and other workspace checks", () => {
  const pr = createCheckPlan(workspaces, ["package.json"]);
  const preRelease = createCheckPlan(
    workspaces,
    [],
    "explicit pre-release",
    "pre-release",
  );
  assert.equal(preRelease.reason, "explicit pre-release");
  assert.deepEqual(
    createCheckPlan(workspaces, ["README.md"], "", "pre-release").changed,
    preRelease.changed,
  );
  assert.deepEqual(preRelease.shards[0], pr.shards[0]);
  assert.deepEqual(
    preRelease.shards[1].steps.filter(({ kind }) => kind !== "test"),
    pr.shards[1].steps.filter(({ kind }) => kind !== "test"),
  );
});

test("plan and shard reject unsupported tiers", () => {
  for (const tier of ["invalid", "release"]) {
    assert.throws(() => createCheckPlan(workspaces, [], null, tier), /tier/i);
    assert.throws(() => createShard("main", [], [], workspaces, tier), /tier/i);
  }
});

test("build steps keep leaf builds and omit an empty closure", () => {
  const graph = [
    { name: "leaf", dependencies: [], scripts: { build: "build" } },
  ];
  assert.deepEqual(createBuildSteps(["leaf"], graph), [
    {
      kind: "build",
      label: "Build workspace closure",
      args: [
        "workspaces",
        "foreach",
        "--all",
        "--topological-dev",
        "--include",
        "leaf",
        "run",
        "build",
      ],
    },
  ]);
  assert.deepEqual(createBuildSteps([], graph), []);
});

test("a leaf has one main shard and markdown-only changes have no steps", () => {
  const leaf = createCheckPlan(workspaces, [
    "packages/winglet/style-utils/src/index.ts",
  ]);
  assert.deepEqual(
    leaf.shards.map(({ name }) => name),
    ["main"],
  );
  assert.equal(leaf.browser, false);
  const markdown = createCheckPlan(workspaces, [
    "packages/winglet/style-utils/README.md",
  ]);
  assert.equal(markdown.any, false);
  assert.deepEqual(markdown.shards, []);
});

test("fallback reasons and unowned packages select every workspace", () => {
  for (const plan of [
    createCheckPlan(workspaces, [], "unreachable base"),
    createCheckPlan(workspaces, ["packages/aileron/common/x.d.ts"]),
  ])
    assert.equal(plan.changed.length, workspaces.length);
});

test("future standalone typecheck scripts are read dynamically", () => {
  const workspace = {
    name: "future",
    directory: "packages/future",
    dependencies: [],
    selectionDependencies: [],
    scripts: { typecheck: "tsc" },
  };
  assert.equal(
    createCheckPlan([workspace], ["packages/future/x.ts"]).steps[0].kind,
    "typecheck",
  );
});

test("build closure precedes lint and includes every linted workspace dependency", () => {
  const plan = createCheckPlan(workspaces, ["package.json"]);
  for (const shard of plan.shards) {
    const firstLint = shard.steps.findIndex(({ kind }) => kind === "lint");
    const lastBuild = shard.steps.findLastIndex(({ kind }) => kind === "build");
    if (firstLint >= 0) assert.ok(lastBuild < firstLint, shard.name);
    for (const lint of shard.steps.filter(({ kind }) => kind === "lint")) {
      const workspace = workspaces.find(({ name }) => name === lint.args[1]);
      for (const dependency of workspace.dependencies) {
        if (!workspaces.find(({ name }) => name === dependency).scripts.build)
          continue;
        assert.ok(
          shard.steps
            .slice(0, firstLint)
            .some(
              ({ kind, args }) => kind === "build" && args.includes(dependency),
            ),
          `${workspace.name} needs ${dependency}`,
        );
      }
    }
  }
});

test("every planned Vitest command receives a generous supported test timeout and passWithNoTests at execution", () => {
  const plan = createCheckPlan(workspaces, ["package.json"]);
  const outcome = runPlanSteps(plan.shards, {
    root,
    env: {},
    dryRun: true,
    log: () => {},
  });
  for (const step of outcome.results) {
    const expected = step.kind === "test" ? 1 : 0;
    assert.equal(
      step.args.filter((arg) => arg === "--testTimeout=120000").length,
      expected,
      step.label,
    );
    assert.equal(
      step.args.filter((arg) => arg === "--passWithNoTests").length,
      expected,
      step.label,
    );
    assert.equal(
      step.args.filter((arg) => arg === "--hookTimeout=120000").length,
      0,
      step.label,
    );
  }
});
