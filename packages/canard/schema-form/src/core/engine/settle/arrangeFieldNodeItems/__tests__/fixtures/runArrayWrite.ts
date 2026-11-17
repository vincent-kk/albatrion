import { vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';

/** One tree after a public write, with what it delivered and what it held before. */
export interface ArrayWriteRun {
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
): ArrayWriteRun => {
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
