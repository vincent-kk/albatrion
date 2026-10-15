import { afterEach, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

it('keeps a still-empty mismatch row as built, without clearing or reinserting the memo', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
      sibling: { type: 'number', default: 3 },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, WriteOption.Overwrite);
  const memo = root.runtime.misfitsMemo!;
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  const paths = memo.get('')!.paths;
  for (let index = 0; index < 2; index++) {
    const value = index === 0 ? 'first' : 'later';
    writeFieldNode(
      root.structure!.value,
      value,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect(memo.get('')).toEqual({ commit: 1, paths: [] });
    expect(memo.get('')!.paths).toBe(paths);
    expect(root.runtime.misfitRecords).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  }
  expect(clear).not.toHaveBeenCalled();
  expect(set).not.toHaveBeenCalled();
});

it('clears ancestor rows on mismatch recovery and retains its warning and commit', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      group: {
        type: 'object',
        properties: { value: { type: ['string', 'boolean'] } },
      },
    },
  });
  loadFieldNodeAtMount(
    root,
    { group: { value: 'before' } },
    WriteOption.Overwrite,
  );
  const leaf = root.structure!.group.structure!.value;
  writeFieldNode(leaf, { invalid: true }, 'input', WriteOption.Overwrite);
  const memo = root.runtime.misfitsMemo!;
  expect(memo.get('/group')?.paths).toEqual(['/group/value']);
  expect(root.runtime.misfitRecords).toEqual([
    expect.objectContaining({ path: '/group/value', source: 'input' }),
  ]);
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  writeFieldNode(leaf, 'recovered', 'input', WriteOption.Overwrite);
  expect(clear).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledTimes(1);
  expect([...memo.keys()]).toEqual(['']);
  expect(memo.get('')).toEqual({ commit: 3, paths: [] });
  expect(root.runtime.misfitRecords).toEqual([]);
  expect(root.runtime.misfitPaths.size).toBe(0);
  expect(root.emit).toEqual({ group: { value: 'recovered' } });
});

it('resets additional subtree memo rows instead of keeping an older commit', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, WriteOption.Overwrite);
  const memo = root.runtime.misfitsMemo!;
  memo.set('/value', { commit: 1, paths: Object.freeze([]) });
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  writeFieldNode(
    root.structure!.value,
    'after',
    'input',
    WriteOption.Overwrite,
  );
  expect(clear).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledTimes(1);
  expect([...memo.keys()]).toEqual(['']);
  expect(memo.get('')).toEqual({ commit: 2, paths: [] });
});
