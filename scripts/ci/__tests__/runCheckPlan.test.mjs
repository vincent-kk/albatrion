import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { formatPlanSummary } from "../helpers/runner/formatPlanSummary.mjs";
import { runPlanSteps } from "../helpers/runner/runPlanSteps.mjs";

test("dry runs print ordered command groups without executing", () => {
  const logs = [];
  const result = runPlanSteps(
    [
      {
        name: "main",
        steps: [{ label: "lint", args: ["workspace", "leaf", "lint"] }],
      },
    ],
    { root: "/", env: {}, dryRun: true, log: (line) => logs.push(line) },
  );
  assert.equal(result.exitCode, 0);
  assert.equal(result.results[0].status, "planned");
  assert.match(logs[0], /yarn workspace leaf lint/);
  assert.equal(logs[1], "::endgroup::");
});

test("runner stops on first failure and returns its code with skipped results", () => {
  const scratchRoot = join(tmpdir(), "ci-affected");
  mkdirSync(scratchRoot, { recursive: true });
  const scratch = mkdtempSync(join(scratchRoot, "runner-"));
  try {
    const yarn = join(scratch, "yarn");
    writeFileSync(yarn, "#!/bin/sh\nexit 7\n");
    chmodSync(yarn, 0o755);
    const steps = [
      { label: "first", args: ["first"] },
      { label: "second", args: ["second"] },
    ];
    const result = runPlanSteps([{ name: "main", steps }], {
      root: scratch,
      env: { PATH: scratch },
      dryRun: false,
      log: () => {},
    });
    assert.equal(result.exitCode, 7);
    assert.deepEqual(
      result.results.map(({ status }) => status),
      ["failed (7)", "skipped"],
    );
    assert.match(
      formatPlanSummary({ changed: ["a"], dependents: ["b"] }, result.results),
      /Changed: a[\s\S]*Dependents: b[\s\S]*failed \(7\)[\s\S]*skipped/,
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

test("only PR plans select bounded plugin ranges and pre-release clears inherited profiles", () => {
  const scratch = mkdtempSync(join(tmpdir(), "ci-plugin-range-"));
  try {
    const output = join(scratch, "environment.txt");
    const yarn = join(scratch, "yarn");
    writeFileSync(
      yarn,
      '#!/bin/sh\nprintf "%s" "${SCHEMA_FORM_TEST_PROFILE-unset}" > "$CI_ENV_OUTPUT"\n',
    );
    chmodSync(yarn, 0o755);
    for (const tier of ["pr", "pre-release"]) {
      const env = {
        PATH: scratch,
        CI_ENV_OUTPUT: output,
        SCHEMA_FORM_TEST_PROFILE: "inherited",
      };
      const result = runPlanSteps(
        [
          {
            name: "plugins",
            steps: [{ kind: "test", label: "ranges", args: ["test"] }],
          },
        ],
        {
          root: scratch,
          env,
          tier,
          dryRun: false,
          log: () => {},
        },
      );
      assert.equal(result.exitCode, 0);
      assert.equal(
        readFileSync(output, "utf8"),
        tier === "pr" ? "pr" : "unset",
      );
      assert.equal(env.SCHEMA_FORM_TEST_PROFILE, "inherited");
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
