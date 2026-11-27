// Loaded by CI and local Node invocations; tier and commit arguments determine the check plan.
import { appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createCheckPlan } from "./helpers/plan/createCheckPlan.mjs";
import { readChangedFiles } from "./helpers/selection/readChangedFiles.mjs";
import { scanImportDependencies } from "./helpers/selection/scanImportDependencies.mjs";
import { readTrackedFiles } from "./helpers/workspaces/readTrackedFiles.mjs";
import { readWorkspaces } from "./helpers/workspaces/readWorkspaces.mjs";

/** Checkout root is fixed relative to this CLI so callers need no cwd convention. */
const root = fileURLToPath(new URL("../../", import.meta.url));
/** Named CLI flags; absent base in the pr tier requests the conservative fallback. */
const options = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const position = process.argv.indexOf(arg, 2);
      return [arg, process.argv[position + 1]];
    }),
);
/** Pre-release checks every workspace independently of the compared commits. */
const tier = options.get("--tier") ?? "pr";
/** Tracked paths are shared by discovery and source scanning. */
const files = readTrackedFiles(root);
/** Manifest and import graphs remain distinct to allow selection cycles. */
const workspaces = scanImportDependencies(
  root,
  files,
  readWorkspaces(root, files),
);
/** Pre-release bypasses Git diff; unavailable pr bases never suppress checks. */
const changes =
  tier === "pre-release"
    ? { files: [], reason: "pre-release tier checks every workspace" }
    : readChangedFiles(
        root,
        options.get("--base"),
        options.get("--head") ?? "HEAD",
      );
/** Printed JSON is also the workflow runner's immutable command input. */
const plan = createCheckPlan(workspaces, changes.files, changes.reason, tier);
console.log(JSON.stringify(plan, null, 2));
if (plan.reason) console.error(plan.reason);
if (options.get("--output"))
  writeFileSync(
    resolve(options.get("--output")),
    `${JSON.stringify(plan, null, 2)}\n`,
  );
if (process.env.GITHUB_OUTPUT)
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `plan=${JSON.stringify(plan)}\nany=${plan.any}\nshards=${JSON.stringify(plan.shards)}\n`,
  );
