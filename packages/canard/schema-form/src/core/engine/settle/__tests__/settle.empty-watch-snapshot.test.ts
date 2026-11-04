import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import * as derived from '../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { readFieldNodeWatchValues } from '../utils/controls/readFieldNodeWatchValues';
import { captureDetachedFieldNodeReads } from '../utils/detached/captureDetachedFieldNodeReads';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-empty-watch-snapshot
describe('watch-free exit snapshots', () => {
  it('does not create a watch witness or value memo when the whole blueprint has no watch', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { field: { type: 'string' } },
    });
    loadFieldNodeAtMount(root, { field: 'kept' }, WriteOption.Overwrite);
    const field = root.structure!.field;
    expect(root.runtime.blueprint.capabilities.hasWatch).toBe(false);
    const lookup = vi.spyOn(derived, 'getHostDerived');
    captureDetachedFieldNodeReads(field, {
      schema: field.schema.schema,
      emit: root.emit,
    });
    expect(lookup.mock.calls.filter(([owner]) => owner === field)).toHaveLength(
      0,
    );
    expect(root.runtime.watchValuesMemo?.has(field) ?? false).toBe(false);
    expect(root.runtime.detachedReads?.has(field)).toBe(true);
    field.detached = true;
    const empty = readFieldNodeWatchValues(field);
    expect(empty).toEqual([]);
    expect(Object.isFrozen(empty)).toBe(true);
  });

  it('leaves an existing empty watch memo unchanged on a watch-free exit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: { field: { type: 'string' } },
    });
    loadFieldNodeAtMount(root, { field: 'kept' }, WriteOption.Overwrite);
    const field = root.structure!.field;
    const empty = readFieldNodeWatchValues(field);
    const memo = root.runtime.watchValuesMemo!.get(field);
    captureDetachedFieldNodeReads(field, {
      schema: field.schema.schema,
      emit: root.emit,
    });
    expect(root.runtime.watchValuesMemo!.get(field)).toBe(memo);
    field.detached = true;
    expect(readFieldNodeWatchValues(field)).toBe(empty);
  });

  it('replaces a previous nonempty memo when the committed snapshot watch list is empty', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'number' },
        field: { type: 'string', controls: { watch: ['../source'] } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 7, field: 'kept' },
      WriteOption.Overwrite,
    );
    const field = root.structure!.field;
    const previous = readFieldNodeWatchValues(field);
    expect(previous).toEqual([7]);
    expect(root.runtime.blueprint.capabilities.hasWatch).toBe(true);
    captureDetachedFieldNodeReads(field, {
      schema: { type: 'string', controls: { watch: [] } },
      emit: root.emit,
    });
    field.detached = true;
    expect(readFieldNodeWatchValues(field)).toEqual([]);
    expect(previous).toEqual([7]);
  });

  it('retains nonempty snapshot values after the live source changes', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'number' },
        field: { type: 'string', controls: { watch: ['../source'] } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 7, field: 'kept' },
      WriteOption.Overwrite,
    );
    const field = root.structure!.field;
    captureDetachedFieldNodeReads(field, {
      schema: field.schema.schema,
      emit: root.emit,
    });
    field.detached = true;
    const captured = readFieldNodeWatchValues(field);
    root.emit = { source: 19, field: 'next' };
    expect(readFieldNodeWatchValues(field)).toBe(captured);
    expect(captured).toEqual([7]);
    expect(Object.isFrozen(captured)).toBe(true);
  });
});
