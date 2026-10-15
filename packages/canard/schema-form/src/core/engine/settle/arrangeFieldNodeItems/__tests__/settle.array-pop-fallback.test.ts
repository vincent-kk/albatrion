import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchBatch,
  dispatchMount,
  dispatchPop,
  dispatchRemove,
  dispatchSetValue,
  dispatchVisitSubtree,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import type { ArrayPopProof } from '../../types/settlement';
import * as proofModule from '../../utils/compute/childSelection/canReuseTruncatedChildren';
import { canReuseTruncatedChildren } from '../../utils/compute/childSelection/canReuseTruncatedChildren';
import * as ids from '../../utils/compute/childSelection/staticIds';
import { getSettlementScratch } from '../../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../utils/settlement/createSettlementContext';
import { prepareArrayPop } from '../utils/arraySlots/prepareArrayPop';
import { compareArrayPop } from './fixtures/compareArrayPop';

afterEach(() => vi.restoreAllMocks());

/** Object items whose second field carries the given controls. */
const itemsWith = (controls: Record<string, unknown>): BlueprintSchema => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      key: { type: 'number' },
      field: { type: 'number', controls },
    },
  },
});

// filid:contract settle-array-pop-fallback
describe('pop admission declines and the general path settles', () => {
  it.each<[string, BlueprintSchema, unknown]>([
    [
      'gate',
      itemsWith({ active: '../flag' }),
      [{ flag: true, field: 1 }, { flag: true }],
    ],
    ['derive', itemsWith({ derived: '../key + 1' }), [{ key: 1 }, { key: 2 }]],
    ['watch', itemsWith({ watch: ['../key'] }), [{ key: 1 }, { key: 2 }]],
    ['expression', itemsWith({ readOnly: '../flag' }), [{ flag: true }, {}]],
    ['state', itemsWith({ disabled: true }), [{ key: 1 }, { key: 2 }]],
    [
      'injectTo',
      itemsWith({ injectTo: (value: unknown) => ({ '../key': value }) }),
      [{ field: 1 }, { field: 2 }],
    ],
    [
      'virtual',
      {
        type: 'array',
        items: {
          type: 'object',
          properties: { from: { type: 'string' }, to: { type: 'string' } },
          options: { virtual: { span: { fields: ['from', 'to'] } } },
        },
      },
      [{ from: 'a' }, { to: 'b' }],
    ],
    [
      'omitTrailing',
      {
        type: 'array',
        items: { type: 'number' },
        options: { omitTrailing: true },
      },
      [1, null],
    ],
    [
      'tuple position',
      {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
      },
      ['a', 1],
    ],
    [
      'untemplated position and extras',
      { type: 'array', prefixItems: [{ type: 'string' }], items: false },
      ['a', 'x', 'y'],
    ],
    [
      'terminal array',
      { type: 'array', items: { type: 'number' }, options: { terminal: true } },
      [1, 2],
    ],
  ])('%s', (_, schema, input) => {
    compareArrayPop(schema, input, [
      { apply: (root) => dispatchPop(root), pop: false },
      { apply: (root) => dispatchPop(root), pop: false },
    ]);
  });

  it('an empty array, a batch and a visit walk', () => {
    compareArrayPop(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3],
      [
        {
          apply: (root) => dispatchBatch(root, () => dispatchPop(root)),
          pop: false,
        },
        {
          apply: (root) =>
            dispatchVisitSubtree(root, (node) => {
              if (node === root) dispatchPop(root);
            }),
          pop: false,
        },
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchPop(root), pop: false },
        { apply: (root) => dispatchRemove(root, -1), pop: false },
      ],
    );
  });

  it('a detached array and a tree holding its latent write', () => {
    let popped: DispatchTestNode | undefined;
    compareArrayPop(
      {
        type: 'array',
        items: { type: 'array', items: { type: 'number' } },
      },
      [[1], [2, 3], [4]],
      [
        { apply: (root) => dispatchPop(root), pop: true },
        {
          apply: (root) => {
            popped = root.children![1];
            return dispatchPop(root);
          },
          pop: true,
        },
        { apply: () => dispatchPop(popped!), pop: false },
        {
          apply: (root) => {
            expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
            return dispatchPop(root);
          },
          pop: false,
        },
      ],
    );
  });

  it('a retained misfit and a wrong-kind host raw', () => {
    compareArrayPop(
      { type: 'array', items: { type: 'number' } },
      [1, 2, 3],
      [
        {
          apply: (root) =>
            dispatchSetValue(root.children![0], 'text', WriteOption.Overwrite),
          pop: false,
        },
        { apply: (root) => dispatchPop(root), pop: false },
        {
          apply: (root) => dispatchSetValue(root, null, WriteOption.Overwrite),
          pop: false,
        },
        { apply: (root) => dispatchPop(root), pop: false },
      ],
    );
  });

  it('a selection-time proof failure continues in the general selection and full assembly within the same settlement', () => {
    const proof = vi
      .spyOn(proofModule, 'canReuseTruncatedChildren')
      .mockReturnValue(false);
    const { candidate } = compareArrayPop(
      {
        type: 'array',
        items: { type: 'object', properties: { v: { type: 'number' } } },
      },
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      [
        { apply: (root) => dispatchPop(root), pop: true },
        { apply: (root) => dispatchRemove(root, 1), pop: true },
      ],
    );
    expect(proof).toHaveBeenCalled();
    expect(candidate.emit).toEqual([{ v: 1 }]);

    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchMount(root, [1, 2, 3, 4], WriteOption.Overwrite, {
      deferValidation: true,
    });
    const selected = vi.spyOn(ids, 'staticIds');
    expect(dispatchPop(root)).toBe(4);
    expect(selected.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(root.local).toEqual([1, 2, 3]);
  });
});

describe('the truncation proof reads only facts a later write could move', () => {
  it('admission requires the last live node at the end of both structure and children', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchMount(root, [1, 2, 3], WriteOption.Overwrite, {
      deferValidation: true,
    });
    const structure = root.structure!;
    expect(prepareArrayPop(root, { kind: 'pop' })?.count).toBe(3);
    root.structure = { ...structure, '2': structure['0'] };
    expect(prepareArrayPop(root, { kind: 'pop' })).toBeUndefined();
    root.structure = structure;
    expect(prepareArrayPop(root, { kind: 'remove', index: 2 })?.count).toBe(3);
  });

  it('accepts the published truncation and rejects each moved fact', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'number' },
    });
    dispatchMount(root, [1, 2, 3], WriteOption.Overwrite, {
      deferValidation: true,
    });
    const scratch = getSettlementScratch(root.runtime);
    try {
      const context = createSettlementContext(
        root,
        'callerReplace',
        WriteOption.Overwrite,
        scratch,
      );
      const prior = root.structure!;
      const proof: ArrayPopProof<DispatchTestNode> = {
        host: root,
        count: 4,
        plan: {
          kind: 'slots',
          slots: [],
          result: { source: 'removed', index: 3 },
        },
        local: root.local,
        children: root.children,
        valid: true,
      };
      const check = () =>
        canReuseTruncatedChildren(root, context, prior, proof);
      expect(check()).toBe(true);

      context.dirtyChildrenByParent.set(root.path, new Map([['0', '/0']]));
      expect(check()).toBe(false);
      context.dirtyChildrenByParent.set(root.path, new Map());
      expect(check()).toBe(true);

      expect(
        canReuseTruncatedChildren(root, context, { ...prior }, proof),
      ).toBe(false);
      proof.count = 3;
      expect(check()).toBe(false);
      proof.count = 4;
      proof.children = [...root.children!];
      expect(check()).toBe(false);
      proof.children = root.children;

      context.hasGates = true;
      expect(check()).toBe(false);
      context.hasGates = false;
      context.pathChanges.push({ node: root, previous: '/a', current: '/b' });
      expect(check()).toBe(false);
      context.pathChanges.length = 0;
      context.pendingExits.set('exit', root.children![0]);
      expect(check()).toBe(false);
      context.pendingExits.clear();
      context.distributedInputs.set(root, {
        input: [],
        whole: true,
        automatic: false,
      });
      expect(check()).toBe(false);
      context.distributedInputs.clear();
      expect(check()).toBe(true);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});
