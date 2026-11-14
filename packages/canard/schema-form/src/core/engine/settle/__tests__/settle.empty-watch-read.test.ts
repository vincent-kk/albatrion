import { afterEach, expect, it, vi } from 'vitest';

import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import * as derived from '../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { readFieldNodeWatchValues } from '../utils/controls/readFieldNodeWatchValues';

afterEach(() => vi.restoreAllMocks());

it('allocates no memo or witness for repeated empty live reads', () => {
  const { root } = createTestTree({ type: 'string' });
  loadFieldNodeAtMount(root, 'value', WriteOption.Overwrite);
  const lookup = vi.spyOn(derived, 'getHostDerived');
  for (let index = 0; index < 100; index++)
    expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  expect(lookup).not.toHaveBeenCalled();
  expect(root.runtime.watchValuesMemo).toBeUndefined();
  root.detached = true;
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
});

it('clears real watch values before reusing an empty memo and detaching', () => {
  const { root } = createTestTree({ type: 'string' });
  loadFieldNodeAtMount(root, 'value', WriteOption.Overwrite);
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  root.schema = {
    ...root.schema,
    schema: { type: 'string', controls: { watch: ['@'] } },
  };
  root.runtime.context = { watched: true };
  const watched = readFieldNodeWatchValues(root);
  expect(watched).toEqual([root.runtime.context]);
  expect(readFieldNodeWatchValues(root)).toBe(watched);
  root.schema = { ...root.schema, schema: { type: 'string' } };
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  const memo = root.runtime.watchValuesMemo!.get(root);
  const lookup = vi.spyOn(derived, 'getHostDerived');
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  expect(root.runtime.watchValuesMemo!.get(root)).toBe(memo);
  expect(lookup).not.toHaveBeenCalled();
  root.detached = true;
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  expect(watched).toEqual([root.runtime.context]);
});

it('retains snapshot memo writes and restores empty live reads', () => {
  const { root } = createTestTree({ type: 'string' });
  loadFieldNodeAtMount(root, 'value', WriteOption.Overwrite);
  const snapshot = {
    schema: { type: 'string' as const, controls: { watch: ['@'] } },
    context: { prior: true },
    emit: 'value',
  };
  expect(readFieldNodeWatchValues(root, snapshot)).toEqual([snapshot.context]);
  expect(readFieldNodeWatchValues(root)).toBe(EMPTY_ARRAY);
  const empty = { ...snapshot, schema: { type: 'string' as const } };
  expect(readFieldNodeWatchValues(root, empty)).toBe(EMPTY_ARRAY);
  expect(root.runtime.watchValuesMemo!.get(root)!.values).toBe(EMPTY_ARRAY);
});
