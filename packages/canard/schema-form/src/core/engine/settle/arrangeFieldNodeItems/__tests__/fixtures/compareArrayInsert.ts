import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { defaultsOf } from './defaultsOf';
import { runArrayWrite } from './runArrayWrite';
import type { ArrayWriteRun } from './runArrayWrite';
import { slotsOf } from './slotsOf';

/**
 * Apply insert(index, value) on one tree and the same resulting array as a whole write on another.
 * @param schema - Authored declarations shared by both trees
 * @param input - Root array source mounted before the write
 * @param index - Insert position under test
 * @param value - Value of the inserted item
 * @returns The insert run, the whole-write run, the observations both must share, the insert tree's default sources and the resulting array
 * @remarks Default sources are not shared: a whole write keeps the snapshot (WRITE-085) while insert snapshots its creation value (WRITE-099).
 */
export const compareArrayInsert = (
  schema: BlueprintSchema,
  input: readonly unknown[],
  index: number,
  value: unknown,
) => {
  const next = [...input];
  next.splice(index, 0, value);
  const inserted = runArrayWrite(schema, input, (root) =>
    dispatchInsert(root, index, value),
  );
  const whole = runArrayWrite(schema, input, (root) =>
    dispatchSetValue(root, next, WriteOption.Overwrite),
  );
  const observe = (run: ArrayWriteRun) => ({
    local: slotsOf(run.root.local),
    emit: slotsOf(run.root.emit),
    deliveredPaths: run.deliveredPaths,
    changes: run.changes,
  });
  return {
    inserted,
    whole,
    observe,
    defaults: defaultsOf(inserted.root),
    next,
  };
};
