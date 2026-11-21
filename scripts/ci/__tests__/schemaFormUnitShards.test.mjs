import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { partitionSchemaFormUnitFiles } from "../helpers/plan/helpers/partitionSchemaFormUnitFiles.mjs";
import { readTrackedFiles } from "../helpers/workspaces/readTrackedFiles.mjs";

/** This superset keeps the selection job install-free. Vitest supplies actual project membership at runtime. */
const candidates = readTrackedFiles(
  fileURLToPath(new URL("../../../", import.meta.url)),
)
  .filter((path) =>
    /^packages\/canard\/schema-form\/.*\.(?:spec|test)\.ts$/.test(path),
  )
  .map((path) => path.slice("packages/canard/schema-form/".length));

test("every tracked schema-form unit candidate belongs to exactly one deterministic shard", () => {
  assert.ok(candidates.length > 800);
  const shards = partitionSchemaFormUnitFiles(candidates, 3);
  assert.equal(shards.length, 3);
  assert.ok(shards.every((shard) => shard.length > 0));
  assert.deepEqual(shards.flat().sort(), [...candidates].sort());
  assert.deepEqual(
    shards,
    partitionSchemaFormUnitFiles(candidates.toReversed(), 3),
  );
});

test("three model-heavy files land in different shards", () => {
  const models = [
    "src/core/engine/__tests__/batchDeclarativeWrites.test.ts",
    "src/core/engine/__tests__/batchCallerReviewModel.test.ts",
    "src/core/engine/settle/__tests__/settle.presence-index.test.ts",
  ];
  assert.ok(models.every((path) => candidates.includes(path)));
  const shards = partitionSchemaFormUnitFiles(candidates, 3);
  assert.deepEqual(
    shards.map((shard) => models.filter((path) => shard.includes(path)).length),
    [1, 1, 1],
  );
});

test(
  "the CI sequencer partitions every file discovered by the unchanged unit project",
  {
    skip: existsSync(
      new URL("../../../node_modules/vitest/package.json", import.meta.url),
    )
      ? false
      : "Vitest is unavailable in the install-free selection job",
  },
  async () => {
    const { createVitest } = await import("vitest/node");
    const root = fileURLToPath(
      new URL("../../../packages/canard/schema-form/", import.meta.url),
    );
    const config = fileURLToPath(
      new URL("../helpers/plan/schemaFormUnit.config.mjs", import.meta.url),
    );
    const partitions = [];
    let expected;
    for (const shard of [undefined, "1/3", "2/3", "3/3"]) {
      const vitest = await createVitest("test", {
        root,
        project: ["unit"],
        watch: false,
        ...(shard ? { shard, config } : {}),
      });
      try {
        const files = await vitest.globTestSpecifications();
        if (shard) {
          assert.equal(vitest.config.maxWorkers, 4);
          const Sequencer = vitest.config.sequence.sequencer;
          const selected = await new Sequencer(vitest).shard(files);
          assert.ok(selected.length > 0);
          partitions.push(selected.map(({ moduleId }) => moduleId));
        } else {
          expected = files.map(({ moduleId }) => moduleId).sort();
        }
      } finally {
        await vitest.close();
      }
    }
    assert.ok(expected.length > 800);
    assert.deepEqual(partitions.flat().sort(), expected);
  },
);
