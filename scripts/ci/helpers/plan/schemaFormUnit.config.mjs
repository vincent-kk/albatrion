// Loaded by the schema-form PR unit shards; Vitest discovers the project files before sharding.
import { relative, sep } from "node:path";
import { mergeConfig } from "vitest/config";
import { BaseSequencer } from "vitest/node";

import config from "../../../../packages/canard/schema-form/vite.config.ts";
import { partitionSchemaFormUnitFiles } from "./helpers/partitionSchemaFormUnitFiles.mjs";

/** Applies the same cost-based division in every independent PR unit job. */
class SchemaFormUnitSequencer extends BaseSequencer {
  /**
   * @param {import("vitest/node").TestSpecification[]} files Unit project specifications discovered by Vitest.
   * @returns {Promise<import("vitest/node").TestSpecification[]>} This shard's files, heaviest first.
   */
  async shard(files) {
    const { root, shard } = this.ctx.config;
    const filesByPath = new Map(
      files.map((file) => [
        relative(root, file.moduleId).split(sep).join("/"),
        file,
      ]),
    );
    const partitions = partitionSchemaFormUnitFiles(
      [...filesByPath.keys()],
      shard.count,
    );
    return partitions[shard.index - 1].map((path) => filesByPath.get(path));
  }

  /**
   * @param {import("vitest/node").TestSpecification[]} files Specifications ordered by shard().
   * @returns {Promise<import("vitest/node").TestSpecification[]>} Files in dispatch order.
   */
  async sort(files) {
    return files;
  }
}

export default mergeConfig(config, {
  test: { sequence: { sequencer: SchemaFormUnitSequencer } },
});
