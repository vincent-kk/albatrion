import { describe, expect, it } from 'vitest';

import { find } from '@/schema-form/core/engine/navigation';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchClear,
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchWriteInput,
} from '@/schema-form/core/engine/write';
import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';

/**
 * Build the memo rows a fresh rebuild makes from the current misfit set.
 * @param paths - Current misfit paths
 * @returns Rows in build order: the root, then each ancestor in first-seen order
 */
const freshRows = (paths: Iterable<string>): [string, string[]][] => {
  const sorted = [...paths].sort();
  const rows = new Map<string, string[]>([['', sorted]]);
  for (const path of sorted)
    for (let at = path; at; at = at.slice(0, at.lastIndexOf($.Separator)))
      rows.set(at, [...(rows.get(at) ?? []), path]);
  return [...rows];
};

/**
 * Read the memo rows of a tree as path lists.
 * @param root - Tree whose misfit memo is read
 * @returns Rows in memo order
 */
const memoRows = (root: DispatchTestNode): [string, string[]][] =>
  [...(root.runtime.misfitsMemo ?? [])].map(([path, row]) => [
    path,
    [...row.paths],
  ]);

/**
 * Write one input to a live field.
 * @param root - Tree root
 * @param path - Absolute path of the field
 * @param value - Input value written with Overwrite
 */
const write = (root: DispatchTestNode, path: string, value: unknown) => {
  const node = find(root, path);
  if (!node) throw new Error(`No live field at ${path}`);
  dispatchWriteInput(node, value, WriteOption.Overwrite);
};

// filid:contract settle-misfit-memo-rebuild
describe('L2 (b) VALUE-037 the misfit memo is rebuilt only when the misfit set changed', () => {
  it('equals a fresh rebuild after every write and keeps path arrays only while unchanged', () => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        m: { type: 'number' },
        arr: { type: 'array', items: { type: 'number' } },
      },
    });
    dispatchMount(root, { m: 1, arr: [1, 'bad', 3] }, WriteOption.Overwrite);
    const arr = () => find(root, '/arr')!;
    const steps: [string, boolean, () => void][] = [
      ['misfit added', true, () => write(root, '/m', 'x')],
      ['misfit removed', true, () => write(root, '/m', 2)],
      ['moved by remove', true, () => dispatchRemove(arr(), 0)],
      ['moved by insert', true, () => dispatchInsert(arr(), 0, 5)],
      ['misfit added beside', true, () => write(root, '/m', 'y')],
      ['unchanged', false, () => write(root, '/arr/2', 4)],
      ['item misfit removed', true, () => write(root, '/arr/1', 9)],
      ['cleared beside a misfit', true, () => dispatchClear(arr())],
      ['unchanged after clear', false, () => write(root, '/arr', [])],
    ];
    expect(memoRows(root)).toEqual(freshRows(root.runtime.misfitPaths));
    for (const [label, changed, apply] of steps) {
      const before = root.runtime.misfitsMemo?.get('')?.paths;
      apply();
      expect(memoRows(root), label).toEqual(
        freshRows(root.runtime.misfitPaths),
      );
      const after = root.runtime.misfitsMemo?.get('')?.paths;
      if (changed) expect(after, label).not.toBe(before);
      else expect(after, label).toBe(before);
    }
    expect(memoRows(root)).toEqual([
      ['', ['/m']],
      ['/m', ['/m']],
    ]);
  });

  it('keeps every row and path array of a large unchanged set across settlements', () => {
    const properties: Record<string, { type: 'number' }> = {};
    const input: Record<string, unknown> = {};
    for (let index = 0; index < 50; index++) {
      properties[`k${index}`] = { type: 'number' };
      input[`k${index}`] = 'text';
    }
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        other: { type: 'number' },
        host: { type: 'object', properties },
      },
    });
    dispatchMount(root, { other: 0, host: input }, WriteOption.Overwrite);
    const rows = [...root.runtime.misfitsMemo!];
    expect(rows).toHaveLength(52);
    write(root, '/other', 1);
    write(root, '/other', 2);
    const after = [...root.runtime.misfitsMemo!];
    expect(after.map(([path]) => path)).toEqual(rows.map(([path]) => path));
    after.forEach(([, row], index) => {
      expect(row).toBe(rows[index][1]);
      expect(row.paths).toBe(rows[index][1].paths);
    });
  });
});
