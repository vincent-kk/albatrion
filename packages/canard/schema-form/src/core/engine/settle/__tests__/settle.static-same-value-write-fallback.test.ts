import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchBatch,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchSetValue,
  dispatchVisitSubtree,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import * as admission from '../utils/input/utils/admitsSameValueWrite';
import { compareSameValueWrite } from './fixtures/compareSameValueWrite';

afterEach(() => vi.restoreAllMocks());

/**
 * Root holding a host `h` whose `field` carries the given controls, beside a sibling leaf.
 * @param controls - Controls of the host's `field`; empty for a static form
 * @returns Authored schema
 */
const hostWith = (controls: Record<string, unknown>): BlueprintSchema => ({
  type: 'object',
  properties: {
    h: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        key: { type: 'number' },
        field: { type: 'number', controls },
      },
    },
    s: { type: 'string' },
    rows: {
      type: 'array',
      items: { type: 'array', items: { type: 'number' } },
    },
  },
});

/** Two sibling hosts, `a` holding an array of arrays, so latent raw and misfits can sit inside or outside the written host. */
const SCOPED: BlueprintSchema = {
  type: 'object',
  properties: {
    a: {
      type: 'object',
      properties: {
        v: { type: 'number' },
        rows: {
          type: 'array',
          items: { type: 'array', items: { type: 'number' } },
        },
      },
    },
    b: { type: 'object', properties: { w: { type: 'number' } } },
  },
};

/** Mounted source of `SCOPED`. */
const SCOPED_INPUT = { a: { v: 1, rows: [[1], [2]] }, b: { w: 2 } };

/** Mounted source of `hostWith`. */
const INPUT = { h: { flag: true, key: 1, field: 2 }, s: 's', rows: [[1], [2]] };

/**
 * Read the host `h`.
 * @param root - Root of a `hostWith` tree
 * @returns The host record
 */
const hostOf = (root: DispatchTestNode): DispatchTestNode => root.structure!.h;

// filid:contract settle-static-same-value-write-fallback
describe('same-value admission declines and the general path settles', () => {
  it.each<[string, Record<string, unknown>]>([
    ['gate', { active: '../flag' }],
    ['expression', { readOnly: '../flag' }],
    ['derive', { derived: '../key + 1' }],
    ['watch', { watch: ['../key'] }],
  ])('%s', async (_, controls) => {
    await compareSameValueWrite(hostWith(controls), INPUT, [
      {
        apply: (root) => dispatchSetValue(hostOf(root), hostOf(root).emit),
        skip: false,
      },
    ]);
  });

  it('a static control form admits the same write', async () => {
    await compareSameValueWrite(hostWith({}), INPUT, [
      {
        apply: (root) => dispatchSetValue(hostOf(root), hostOf(root).emit),
        skip: true,
      },
    ]);
  });

  it('latent raw under the written host declines; latent raw outside it does not once its change is published', async () => {
    let popped: DispatchTestNode | undefined;
    await compareSameValueWrite(SCOPED, SCOPED_INPUT, [
      {
        apply: (root) => {
          const rows = root.structure!.a.structure!.rows;
          popped = rows.children![1];
          return dispatchPop(rows);
        },
        skip: false,
      },
      { apply: () => dispatchPush(popped!, 5), skip: false },
      {
        apply: (root) => dispatchSetValue(root.structure!.b.structure!.w, 3),
        skip: false,
      },
      {
        apply: (root) => {
          expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
          expect(root.runtime.misfitPaths.size).toBe(0);
          return dispatchSetValue(root.structure!.b, root.structure!.b.emit);
        },
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(root.structure!.a, { v: 1 }, WriteOption.Merge),
        skip: false,
      },
    ]);
  });

  it('a root setValue(getValue()) turns the latent raw under it into none and falls back, its prune marking a pending latent change (18C-96)', async () => {
    let popped: DispatchTestNode | undefined;
    await compareSameValueWrite(SCOPED, SCOPED_INPUT, [
      {
        apply: (root) => {
          const rows = root.structure!.a.structure!.rows;
          popped = rows.children![1];
          return dispatchPop(rows);
        },
        skip: false,
      },
      { apply: () => dispatchPush(popped!, 5), skip: false },
      {
        apply: (root) => dispatchSetValue(root.structure!.b.structure!.w, 3),
        skip: false,
      },
      {
        apply: (root) => {
          expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
          dispatchSetValue(root, root.emit);
          expect(root.runtime.latentRaw.size).toBe(0);
        },
        skip: false,
      },
    ]);
  });

  it('a misfit under the written host declines; a misfit outside it does not', async () => {
    await compareSameValueWrite(SCOPED, { ...SCOPED_INPUT, b: { w: 'text' } }, [
      {
        apply: (root) => {
          expect(root.runtime.misfitPaths.size).toBeGreaterThan(0);
          return dispatchSetValue(root.structure!.a, root.structure!.a.emit);
        },
        skip: true,
      },
      {
        apply: (root) =>
          dispatchSetValue(root.structure!.b, root.structure!.b.emit),
        skip: false,
      },
      {
        apply: (root) => dispatchSetValue(root, root.emit),
        skip: false,
      },
    ]);
  });

  it('a load, a multi-write batch and a visit walk with two writes', async () => {
    await compareSameValueWrite(hostWith({}), INPUT, [
      {
        apply: (root) => dispatchMount(root, root.emit),
        skip: false,
      },
      {
        apply: (root) =>
          dispatchBatch(root, () => {
            dispatchSetValue(hostOf(root), hostOf(root).emit);
            dispatchSetValue(root.structure!.s, 't');
          }),
        skip: false,
      },
      {
        apply: (root) =>
          dispatchVisitSubtree(root, (node) => {
            if (node !== root) return;
            dispatchSetValue(hostOf(root), hostOf(root).emit);
            dispatchSetValue(root.structure!.s, 'u');
          }),
        skip: false,
      },
    ]);
  });

  it('a detached host and a changed key set', async () => {
    let detached: DispatchTestNode | undefined;
    await compareSameValueWrite(
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { v: { type: 'number' }, w: { type: 'string' } },
        },
      },
      [
        { v: 1, w: 'a' },
        { v: 2, w: 'b' },
      ],
      [
        {
          apply: (root) => {
            detached = root.children![1];
            return dispatchPop(root);
          },
          skip: false,
        },
        {
          apply: () => dispatchSetValue(detached!, { v: 2, w: 'b' }),
          skip: false,
        },
        {
          apply: (root) => dispatchSetValue(root.children![0], { v: 1 }),
          skip: false,
        },
      ],
    );
  });

  it('automatic fills never take the admission', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: {
        type: 'object',
        default: { v: 7 },
        properties: { v: { type: 'number' } },
      },
    });
    dispatchMount(root, [{ v: 1 }], WriteOption.Overwrite, {
      deferValidation: true,
    });
    const admit = admission.admitsSameValueWrite;
    const automatic: boolean[] = [];
    vi.spyOn(admission, 'admitsSameValueWrite').mockImplementation(
      (node, context) => {
        const admitted = admit(node, context);
        if (context.automatic) automatic.push(admitted);
        return admitted;
      },
    );
    dispatchPush(root);
    expect(root.emit).toEqual([{ v: 1 }, { v: 7 }]);
    expect(automatic.length).toBeGreaterThan(0);
    expect(automatic.every((admitted) => !admitted)).toBe(true);
  });
});
