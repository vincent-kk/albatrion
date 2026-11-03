import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyChangedFile } from "../helpers/selection/classifyChangedFile.mjs";
import { collectClosure } from "../helpers/selection/collectClosure.mjs";
import { findWorkspaceOwner } from "../helpers/selection/findWorkspaceOwner.mjs";
import { readChangedFiles } from "../helpers/selection/readChangedFiles.mjs";
import { scanImportDependencies } from "../helpers/selection/scanImportDependencies.mjs";
import { readTrackedFiles } from "../helpers/workspaces/readTrackedFiles.mjs";
import { readWorkspaces } from "../helpers/workspaces/readWorkspaces.mjs";
import { spawnSync } from "node:child_process";

/** Repository fixtures are read without package installation. */
const root = new URL("../../../", import.meta.url).pathname;
/** Tracked paths keep discovery independent of node_modules. */
const files = readTrackedFiles(root);
/** Actual workspaces validate the undeclared import cases from the design. */
const workspaces = scanImportDependencies(
  root,
  files,
  readWorkspaces(root, files),
);

test("unowned package inputs affect every workspace", () => {
  assert.equal(
    classifyChangedFile("packages/aileron/common/x.d.ts", []),
    "global",
  );
});

test(
  "tracked workspace discovery matches Yarn locally",
  {
    skip:
      process.env.GITHUB_ACTIONS === "true"
        ? "Yarn parity runs locally; affected CI has no install or Corepack activation"
        : false,
  },
  () => {
    const result = spawnSync("yarn", ["workspaces", "list", "--json"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const yarn = result.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))
      .filter(({ location }) => location !== ".");
    assert.deepEqual(
      workspaces.map(({ name }) => name).sort(),
      yarn.map(({ name }) => name).sort(),
    );
  },
);

test("workspace ownership uses the deepest directory and exact path boundaries", () => {
  assert.equal(
    findWorkspaceOwner(
      "packages/canard/schema-form-ajv8-plugin/src/index.ts",
      workspaces,
    ).name,
    "@canard/schema-form-ajv8-plugin",
  );
  const nested = [
    { name: "parent", directory: "p" },
    { name: "child", directory: "p/nested" },
  ];
  assert.equal(findWorkspaceOwner("p/nested/x.ts", nested).name, "child");
});

test("root inputs and selector changes are global while unrelated tooling is ignored", () => {
  for (const path of [
    "package.json",
    "yarn.lock",
    ".yarnrc.yml",
    ".nvmrc",
    "tsconfig.base.json",
    "eslint.config.mjs",
    "eslint/rules.js",
    "vitest.workspace.ts",
    ".yarn/releases/x.cjs",
    ".github/workflows/ci.yml",
    "scripts/ci/helpers/x.mjs",
  ])
    assert.equal(classifyChangedFile(path, workspaces), "global", path);
  for (const path of [
    "README.md",
    ".github/workflows/other.yml",
    "scripts/test-package-import.sh",
    ".claude/rules/x.md",
    ".seiri/x.json",
    ".filid/x.json",
    ".changeset/x.md",
  ])
    assert.equal(classifyChangedFile(path, workspaces), "ignored", path);
});

test("agent assets and test-read markdown select owners; other markdown does not", () => {
  for (const path of [
    "packages/canard/schema-form/docs/agents/skills/x.md",
    "packages/canard/schema-form/architecture/ledger/error.md",
    "packages/canard/schema-form/src/core/surface/DETAIL.md",
  ])
    assert.equal(
      classifyChangedFile(path, workspaces),
      "@canard/schema-form",
      path,
    );
  assert.equal(
    classifyChangedFile("packages/canard/schema-form/README.md", workspaces),
    "ignored",
  );
});

test("selection graph includes test imports and undeclared UI imports", () => {
  const schema = workspaces.find(({ name }) => name === "@canard/schema-form");
  for (const version of [6, 7, 8])
    assert.ok(
      schema.selectionDependencies.includes(
        `@canard/schema-form-ajv${version}-plugin`,
      ),
    );
  assert.ok(
    workspaces
      .find(({ name }) => name === "@canard/schema-form-antd5-plugin")
      .selectionDependencies.includes("@winglet/json-schema"),
  );
  assert.ok(
    workspaces
      .find(({ name }) => name === "@canard/schema-form-ajv6-plugin")
      .selectionDependencies.includes("@winglet/json"),
  );
});

test("reverse closure selects common-utils consumers and leaves a leaf alone", () => {
  const common = collectClosure(
    ["@winglet/common-utils"],
    workspaces,
    true,
    "selectionDependencies",
  );
  assert.ok(common.includes("@canard/schema-form"));
  assert.ok(common.includes("@albatrion/documents"));
  const graph = [{ name: "leaf", dependencies: [], selectionDependencies: [] }];
  assert.deepEqual(
    collectClosure(["leaf"], graph, true, "selectionDependencies"),
    ["leaf"],
  );
});

test("selection cycles terminate and include both directions transitively", () => {
  const graph = [
    { name: "a", dependencies: ["b"] },
    { name: "b", dependencies: ["a"] },
  ];
  assert.deepEqual(collectClosure(["a"], graph), ["a", "b"]);
});

test("missing, zero, and unreachable bases conservatively select all", () => {
  for (const base of [
    undefined,
    "0000000000000000000000000000000000000000",
    "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  ])
    assert.ok(readChangedFiles(root, base, "HEAD").reason);
  assert.deepEqual(readChangedFiles(root, "HEAD", "HEAD"), {
    files: [],
    reason: null,
  });
});
