import { isArray, isObject } from '@winglet/common-utils/filter';
import { getKeys, hasOwnProperty } from '@winglet/common-utils/lib';
import { getDataProperty } from '@winglet/common-utils/object';
import { escapeSegment } from '@/json/JSONPointer/utils/escape/escapeSegment';
import type { JSONRoot } from '@/json/type';
import { Operation, type Patch } from '../../../patchModel';
import { processValue } from './processValue';

/** A node comparison to execute at its original depth-first position. */
type CompareFrame = {
  /** Work discriminator. */
  kind: 'compare';
  /** Existing value. */
  source: JSONRoot;
  /** Desired value. */
  target: JSONRoot;
  /** Escaped pointer to this node. */
  path: string;
};
/** One suspended stage in the shallow comparator's original traversal order. */
type StepFrame = {
  /** Work discriminator. */
  kind: 'step';
  /** Executes one key or the final removal/addition stage. */
  run: () => void;
};

/**
 * Builds JSON Patch operations using a depth-first work stack.
 * @param source - Existing node
 * @param target - Desired node
 * @param patches - Output operations, appended in recursive traversal order
 * @param path - Escaped pointer to the compared node
 * @param strict - Whether replacements and removals include preceding tests
 * @param immutable - Whether emitted values are detached from caller data
 * @param serialize - The same toJSON reduction used by the shallow comparator
 * @returns Nothing; appends operations to patches
 */
export const compareDeep = (source: JSONRoot, target: JSONRoot, patches: Patch[], path: string, strict: boolean, immutable: boolean, serialize: (value: unknown) => unknown): void => {
  const pending: Array<CompareFrame | StepFrame> = [{ kind: 'compare', source, target, path }];
  while (pending.length) {
    const frame = pending.pop()!;
    if (frame.kind === 'step') {
      frame.run();
      continue;
    }
    const { source, target, path } = frame;
    if (source === target || (source !== source && target !== target)) continue;
    const sourceJSON = serialize(source), targetJSON = serialize(target);
    if (sourceJSON !== source || targetJSON !== target) {
      if (isObject(sourceJSON) && isObject(targetJSON)) pending.push({ kind: 'compare', source: sourceJSON, target: targetJSON, path });
      else if (sourceJSON !== targetJSON) {
        if (strict) patches.push({ op: Operation.TEST, path, value: processValue(sourceJSON, immutable) });
        patches.push({ op: Operation.REPLACE, path, value: processValue(targetJSON, immutable) });
      }
      continue;
    }
    const sourceKeys = getKeys(source), targetKeys = getKeys(target);
    const sourceIsArray = isArray(source), targetIsArray = isArray(target);
    if (sourceIsArray !== targetIsArray) {
      if (strict) patches.push({ op: Operation.TEST, path, value: processValue(source, immutable) });
      patches.push({ op: Operation.REPLACE, path, value: processValue(target, immutable) });
      continue;
    }
    let hasRemoved = false;
    const work: StepFrame[] = [];
    const removals: Patch[][] = [];
    for (const key of sourceKeys) work.push({ kind: 'step', run: () => {
      const sourceValue: unknown = getDataProperty(source, key);
      const targetPath = path + '/' + escapeSegment(key);
      if (hasOwnProperty(target, key)) {
        const targetValue: unknown = getDataProperty(target, key);
        if (sourceValue === targetValue || (sourceValue !== sourceValue && targetValue !== targetValue)) return;
        if (targetValue === undefined && sourceValue !== undefined && !targetIsArray) {
          if (strict) patches.push({ op: Operation.TEST, path: targetPath, value: processValue(sourceValue, immutable) });
          patches.push({ op: Operation.REMOVE, path: targetPath });
          hasRemoved = true;
        } else if ((isObject(sourceValue) && isObject(targetValue)) || (isArray(sourceValue) && isArray(targetValue))) {
          pending.push({ kind: 'compare', source: sourceValue, target: targetValue, path: targetPath });
        } else {
          if (strict) patches.push({ op: Operation.TEST, path: targetPath, value: processValue(sourceValue, immutable) });
          patches.push({ op: Operation.REPLACE, path: targetPath, value: processValue(targetValue, immutable) });
        }
      } else {
        const operations: Patch[] = [];
        if (strict) operations.push({ op: Operation.TEST, path: targetPath, value: processValue(sourceValue, immutable) });
        operations.push({ op: Operation.REMOVE, path: targetPath });
        if (sourceIsArray) removals.push(operations);
        else for (const operation of operations) patches.push(operation);
        hasRemoved = true;
      }
    } });
    work.push({ kind: 'step', run: () => {
      for (let index = removals.length - 1; index >= 0; index--) for (const operation of removals[index]) patches.push(operation);
      if (!hasRemoved && targetKeys.length === sourceKeys.length) return;
      for (const key of targetKeys) {
        const value = getDataProperty(target, key);
        if (hasOwnProperty(source, key) || value === undefined) continue;
        patches.push({ op: Operation.ADD, path: path + '/' + escapeSegment(key), value: processValue(value, immutable) });
      }
    } });
    for (let index = work.length - 1; index >= 0; index--) pending.push(work[index]);
  }
};
