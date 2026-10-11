import { afterEach, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it('updates a still-empty mismatch row without clearing or reinserting the memo', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const memo = root.runtime.typeMismatchesMemo!;
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  const paths = memo.get('')!.paths;
  for (let index = 0; index < 2; index++) {
    const value = index === 0 ? 'first' : 'later';
    writeSchemaNode(root.structure!.value, value, 'input', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ value, sibling: 3 });
    expect(memo.get('')).toEqual({ commit: index + 2, paths: [] });
    expect(memo.get('')!.paths).toBe(paths);
    expect(root.runtime.typeMismatchRecords).toEqual([]);
    expect(root.runtime.diagnostics.status).toBe('stable');
  }
  expect(clear).not.toHaveBeenCalled();
  expect(set).not.toHaveBeenCalled();
});

it('clears ancestor rows on mismatch recovery and retains its warning and commit', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    group: { type: 'object', properties: { value: { type: ['string', 'boolean'] } } },
  } });
  loadSchemaNodeAtMount(root, { group: { value: 'before' } }, SetValueOption.Overwrite);
  const leaf = root.structure!.group.structure!.value;
  writeSchemaNode(leaf, { invalid: true }, 'input', SetValueOption.Overwrite);
  const memo = root.runtime.typeMismatchesMemo!;
  expect(memo.get('/group')?.paths).toEqual(['/group/value']);
  expect(root.runtime.typeMismatchRecords).toEqual([
    expect.objectContaining({ path: '/group/value', source: 'input' }),
  ]);
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  writeSchemaNode(leaf, 'recovered', 'input', SetValueOption.Overwrite);
  expect(clear).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledTimes(1);
  expect([...memo.keys()]).toEqual(['']);
  expect(memo.get('')).toEqual({ commit: 3, paths: [] });
  expect(root.runtime.typeMismatchRecords).toEqual([]);
  expect(root.runtime.typeMismatchPaths.size).toBe(0);
  expect(root.emit).toEqual({ group: { value: 'recovered' } });
});

it('resets additional subtree memo rows instead of keeping an older commit', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const memo = root.runtime.typeMismatchesMemo!;
  memo.set('/value', { commit: 1, paths: Object.freeze([]) });
  const clear = vi.spyOn(memo, 'clear');
  const set = vi.spyOn(memo, 'set');
  writeSchemaNode(root.structure!.value, 'after', 'input', SetValueOption.Overwrite);
  expect(clear).toHaveBeenCalledTimes(1);
  expect(set).toHaveBeenCalledTimes(1);
  expect([...memo.keys()]).toEqual(['']);
  expect(memo.get('')).toEqual({ commit: 2, paths: [] });
});
