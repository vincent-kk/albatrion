import { vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchInsert,
  dispatchMount,
  dispatchSetValue,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { defaultsOf } from './defaultsOf';
import { slotsOf } from './slotsOf';

/** One tree after a public write, with what it delivered and what it held before. */
export interface InsertRun {
  /** Root of the tree the write was applied to. */
  root: DispatchTestNode;
  /** Synchronous return value of the write. */
  result: unknown;
  /** Items of the root array before the write, in position order. */
  before: readonly DispatchTestNode[];
  /** Item keys before the write, by position. */
  keys: readonly (number | null)[];
  /** Load snapshot reference published before the write. */
  snapshot: unknown;
  /** Paths that received an event during the write, sorted and unique. */
  deliveredPaths: readonly string[];
  /** Number of onChange calls the write made. */
  changes: number;
}

/**
 * Mount the same source on a fresh tree, then apply one write and record its effects.
 * @param schema - Authored declarations for an independently owned tree
 * @param input - Source mounted through the public chain before the write
 * @param write - Public write applied to the mounted root
 * @returns Root, return value, prior items and keys, prior snapshot, delivered paths and onChange count
 */
export const runArrayWrite = (
  schema: BlueprintSchema,
  input: unknown,
  write: (root: DispatchTestNode) => unknown,
): InsertRun => {
  const { root } = createDispatchTree(schema);
  const delivered = new Set<string>();
  const onChange = vi.fn();
  root.runtime.validationMode = 0;
  root.runtime.errorReporter = { hasConsumer: () => true, report: vi.fn() };
  const listen = (node: DispatchTestNode) =>
    subscribeFieldNode(node, () => {
      delivered.add(node.path);
    });
  const visit = (node: DispatchTestNode) => {
    listen(node);
    for (const child of node.children ?? []) visit(child);
  };
  const factory = root.runtime.nodeFactory;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    const node = factory(entry, parent, runtime);
    listen(node);
    return node;
  };
  dispatchMount(root, input, WriteOption.Overwrite, { deferValidation: true });
  visit(root);
  root.runtime.onChange = onChange;
  delivered.clear();
  const before = [...(root.children ?? [])];
  const keys = before.map((item) => item.itemKey);
  const snapshot = root.runtime.loadSnapshot;
  const result = write(root);
  return {
    root,
    result,
    before,
    keys,
    snapshot,
    deliveredPaths: [...delivered].sort(),
    changes: onChange.mock.calls.length,
  };
};

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
  const observe = (run: InsertRun) => ({
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
