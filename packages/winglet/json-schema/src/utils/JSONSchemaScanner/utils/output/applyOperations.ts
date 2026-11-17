import { isArrayIndex } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { clone } from '@winglet/common-utils/object';

import { cloneSchema } from '../schemaCopy/cloneSchema';
import { writeProperty } from '../schemaCopy/writeProperty';
import type { OperationNode, OutputOperation } from './type';
import { buildOperationTree } from './utils/buildOperationTree';

/** One output-owned continuation; input values and overlays stay read-only. */
interface CopyTask {
  /** Source value before any replacement at this overlay node. */
  value: unknown;
  /** Remaining operations beneath this exact source position. */
  overlay: OperationNode;
  /** Whether untouched values are already privately owned. */
  borrow: boolean;
  /** Output-owned container that receives this task's result. */
  parent: Record<string, unknown>;
  /** Reserved insertion slot in the output parent. */
  key: string;
}

/**
 * Apply recorded replacements by copying addressed containers and cloning untouched caller subtrees.
 * @param original Input root, returned by identity when there are no operations.
 * @param operations Ordered replacement records with explicit value ownership.
 * @returns Isolated output whenever an operation is recorded.
 * @throws Clone cycle errors or invalid pointer errors; never writes to inputs or targets.
 */
export function applyOperations(
  original: unknown,
  operations: readonly OutputOperation[],
): unknown {
  if (operations.length === 0) return original;
  const holder: Record<string, unknown> = {};
  const tasks: CopyTask[] = [
    {
      value: original,
      overlay: buildOperationTree(operations),
      borrow: false,
      parent: holder,
      key: 'value',
    },
  ];
  while (tasks.length) {
    const task = tasks.pop()!;
    const operation = task.overlay.replacement;
    const value = operation === undefined ? task.value : operation.value;
    const borrow = operation === undefined ? task.borrow : !operation.copy;
    const children = task.overlay.children;
    if (children === undefined || children.size === 0) {
      writeProperty(task.parent, task.key, borrow ? value : cloneSchema(value));
      continue;
    }
    const source = (value == null ? {} : value) as Record<string, unknown>;
    const prototype = Object.getPrototypeOf(source);
    const firstKey = children.keys().next().value!;
    const target = (
      Array.isArray(value)
        ? new Array(value.length)
        : value == null && isArrayIndex(firstKey)
          ? []
          : prototype === null
            ? Object.create(null)
            : prototype === Object.prototype
              ? {}
              : clone(value)
    ) as Record<string, unknown>;
    writeProperty(task.parent, task.key, target);
    const keys = Object.keys(source);
    for (const key of children.keys())
      if (!hasOwnProperty(source, key)) keys.push(key);
    for (const key of keys) {
      const child = children.get(key);
      const childValue = hasOwnProperty(source, key) ? source[key] : undefined;
      if (child === undefined)
        writeProperty(
          target,
          key,
          borrow ? childValue : cloneSchema(childValue),
        );
      else {
        writeProperty(target, key, undefined);
        tasks.push({
          value: childValue,
          overlay: child,
          borrow,
          parent: target,
          key,
        });
      }
    }
  }
  return holder.value;
}
