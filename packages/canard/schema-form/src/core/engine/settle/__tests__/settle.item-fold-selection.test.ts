import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { createItemFoldTree } from '../../__tests__/fixtures/createItemFoldTree';
import { FieldNodeEventType } from '../../record';
import type { FieldNodeDelivery } from '../../record';
import { WriteOption } from '../../types/value';
import type { Validator } from '../../validation';
import {
  dispatchInsert,
  dispatchMount,
  dispatchPush,
  dispatchRemove,
  dispatchResetSubtree,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '../../write';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { interpretFieldNodeInput } from '../utils/input/interpretFieldNodeInput';
import { captureLiteralStarExit } from '../utils/literalStar/captureLiteralStarExit';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { readSourceTree } from '../utils/slots/readSourceTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

describe('array item fold selection', () => {
  it.each([
    { keyword: 'items', operation: 'same-position' },
    { keyword: 'prefixItems', operation: 'same-position' },
    { keyword: 'items', operation: 'whole-array' },
    { keyword: 'prefixItems', operation: 'whole-array' },
    { keyword: 'items', operation: 'insert' },
    { keyword: 'prefixItems', operation: 'insert' },
    { keyword: 'items', operation: 'remove' },
    { keyword: 'prefixItems', operation: 'remove' },
    { keyword: 'items', operation: 'push' },
    { keyword: 'prefixItems', operation: 'push' },
    { keyword: 'items', operation: 'reset' },
    { keyword: 'prefixItems', operation: 'reset' },
    { keyword: 'items', operation: 'snapshot-load' },
    { keyword: 'prefixItems', operation: 'snapshot-load' },
  ] satisfies readonly {
    keyword: 'items' | 'prefixItems';
    operation:
      | 'same-position'
      | 'whole-array'
      | 'insert'
      | 'remove'
      | 'push'
      | 'reset'
      | 'snapshot-load';
  }[])(
    '$keyword accepts $operation after restoring candidate-owned positions',
    ({ keyword, operation }) => {
      const { root } = createDispatchTree({
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          a: { type: 'boolean' },
          b: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '../open' },
            allOf: [
              {
                controls: { active: '../a' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'string' }
                    : [{ type: 'string' }, { type: 'string' }],
              },
              {
                controls: { active: '../b' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'number' }
                    : [{ type: 'number' }, { type: 'number' }],
              },
            ],
          },
        },
      });
      dispatchMount(root, { open: true, a: false, b: true, list: [50, 70] });
      dispatchSetValue(root.structure!.list, [5, 7]);
      const distributions = vi.spyOn(
        root.runtime.settlementScratch!.distributedInputs,
        'set',
      );
      dispatchSetValue(root.structure!.open, false);
      dispatchSetValue(root.structure!.open, true);
      const list = root.structure!.list;
      expect(list.local).toEqual([5, 7]);
      distributions.mockClear();
      let expected: number[];
      switch (operation) {
        case 'same-position':
          dispatchSetValue(list.structure!['1'], 37);
          expected = [5, 37];
          break;
        case 'whole-array':
          dispatchSetValue(list, [20, 37]);
          expected = [20, 37];
          break;
        case 'insert':
          expect(dispatchInsert(list, 0, 20)).toBe(3);
          expected = [20, 5, 7];
          break;
        case 'remove':
          expect(dispatchRemove(list, 0)).toBe(5);
          expected = [7];
          break;
        case 'push':
          expect(dispatchPush(list, 37)).toBe(3);
          expected = [5, 7, 37];
          break;
        case 'reset':
          dispatchResetSubtree(list);
          expected = [50, 70];
          break;
        case 'snapshot-load':
          dispatchMount(root, {
            open: true,
            a: false,
            b: true,
            list: [20, 37],
          });
          expected = [20, 37];
          expect(root.runtime.loadSnapshot).toMatchObject({ list: expected });
          break;
      }
      expect(root.structure!.list.local).toEqual(expected);
      expect(root.structure!.list.emit).toEqual(expected);
    },
  );

  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s single-candidate distributions never retain candidate-owned positions',
    (keyword) => {
      const { root } = createDispatchTree({
        type: 'object',
        properties: {
          open: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '../open' },
            [keyword]:
              keyword === 'items'
                ? { type: 'number' }
                : [{ type: 'number' }, { type: 'number' }],
          },
        },
      });
      dispatchMount(root, { open: true, list: [1, 2] });
      const distributions = vi.spyOn(
        root.runtime.settlementScratch!.distributedInputs,
        'set',
      );
      dispatchSetValue(root.structure!.open, false);
      dispatchSetValue(root.structure!.open, true);
      const list = root.structure!.list;
      expect(list.local).toEqual([1, 2]);
      distributions.mockClear();
      dispatchSetValue(list.structure!['0'], 3);
      expect(list.local).toEqual([3, 2]);
      dispatchSetValue(list, [4, 5]);
      expect(list.local).toEqual([4, 5]);
      dispatchPush(list, 6);
      expect(list.local).toEqual([4, 5, 6]);
      dispatchResetSubtree(list);
      expect(list.local).toEqual([1, 2, 6]);
      dispatchMount(root, { open: true, list: [7, 8] });
      expect(root.structure!.list.local).toEqual([7, 8]);
      const written = distributions.mock.calls.filter(
        ([host]) => host.path === '/list',
      );
      expect(written.length).toBeGreaterThan(0);
    },
  );

  it.each([false, true])(
    'skips candidate-only exit traversal for a single-candidate host, clear=%s',
    (clear) => {
      const { root } = createDispatchTree({
        type: 'array',
        items: { type: 'number' },
      });
      dispatchMount(root, [1, 2]);
      expect(root.blueprintNode.itemCandidates).toBeUndefined();
      expect(root.blueprintNode.prefixItemCandidates).toBeUndefined();
      const traversal = vi.spyOn(root.children!, Symbol.iterator);
      const scratch = getSettlementScratch(root.runtime);
      try {
        const context = createSettlementContext(
          root,
          'callerReplace',
          WriteOption.Overwrite,
          scratch,
        );
        captureLiteralStarExit(root, clear, context, true, []);
        expect(traversal).not.toHaveBeenCalled();
      } finally {
        releaseSettlementScratch(scratch);
      }
    },
  );

  it.each([
    { keyword: 'items', absentBeforeClose: true },
    { keyword: 'items', absentBeforeClose: false },
    { keyword: 'prefixItems', absentBeforeClose: true },
    { keyword: 'prefixItems', absentBeforeClose: false },
  ] satisfies readonly {
    keyword: 'items' | 'prefixItems';
    absentBeforeClose: boolean;
  }[])(
    '$keyword preserves candidate sources across host capture, absentBeforeClose=$absentBeforeClose',
    async ({ keyword, absentBeforeClose }) => {
      const validationInputs: unknown[] = [];
      const validator: Validator = {
        compile: () => (value) => {
          validationInputs.push(value);
          return null;
        },
        compileGuard: () => () => true,
      };
      const { root } = createDispatchTree(
        {
          type: 'object',
          properties: {
            open: { type: 'boolean' },
            a: { type: 'boolean' },
            b: { type: 'boolean' },
            list: {
              type: 'array',
              controls: { active: '../open' },
              allOf: [
                {
                  controls: { active: '../a' },
                  [keyword]:
                    keyword === 'items'
                      ? { type: 'string' }
                      : [{ type: 'string' }],
                },
                {
                  controls: { active: '../b' },
                  [keyword]:
                    keyword === 'items'
                      ? { type: 'number' }
                      : [{ type: 'number' }],
                },
              ],
            },
          },
        },
        undefined,
        validator,
      );
      dispatchMount(root, { open: true, a: true, b: false, list: ['A'] });
      expect(root.structure!.list.structure!['0'].raw).toBe('A');
      if (absentBeforeClose) dispatchSetValue(root.structure!.a, false);
      dispatchSetValue(root.structure!.open, false);
      if (!absentBeforeClose) dispatchSetValue(root.structure!.a, false);
      const events: FieldNodeDelivery[] = [];
      subscribeFieldNode(root, (event) => events.push(event));
      dispatchSetValue(root.structure!.b, true);
      dispatchSetValue(root.structure!.open, true);
      const list = root.structure!.list;
      expect(list.structure!['0'].blueprintNode.kind).toBe('number');
      expect(list.structure!['0'].raw).toBeUndefined();
      const later = { open: true, a: false, b: true, list: [null] };
      expect(root.local).toEqual(later);
      expect(root.emit).toEqual(later);
      expect(events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue]).toEqual({
        previous: {
          local: { open: false, a: false, b: true },
          emit: { open: false, a: false, b: true },
        },
        current: { local: later, emit: later },
      });
      await dispatchValidate(root);
      expect(validationInputs.at(-1)).toEqual(later);
      expect(root.runtime.loadSnapshot).toMatchObject({ list: ['A'] });
      dispatchSetValue(root.structure!.open, false);
      dispatchSetValue(root.structure!.b, false);
      dispatchSetValue(root.structure!.a, true);
      dispatchSetValue(root.structure!.open, true);
      expect(root.structure!.list.structure!['0'].blueprintNode.kind).toBe(
        'string',
      );
      expect(root.structure!.list.structure!['0'].raw).toBe('A');
      const earlier = { open: true, a: true, b: false, list: ['A'] };
      expect(root.local).toEqual(earlier);
      expect(root.emit).toEqual(earlier);
      expect(
        events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
      ).toMatchObject({
        current: { local: earlier, emit: earlier },
      });
      await dispatchValidate(root);
      expect(validationInputs.at(-1)).toEqual(earlier);
    },
  );

  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s mounts only the later fold and switches exclusively in both directions',
    (keyword) => {
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: false, b: true, list: [7] },
        WriteOption.Overwrite,
      );
      const list = root.structure!.list;
      expect(list.structure!['0'].blueprintNode.kind).toBe('number');
      expect(list.structure!['0'].raw).toBe(7);
      writeFieldNode(
        root,
        { a: true, b: false, list: ['first'] },
        'callerReplace',
        WriteOption.Overwrite,
      );
      expect(list.structure!['0'].blueprintNode.kind).toBe('string');
      expect(list.structure!['0'].raw).toBe('first');
      writeFieldNode(
        root,
        { a: false, b: true, list: [8] },
        'callerReplace',
        WriteOption.Overwrite,
      );
      expect(list.structure!['0'].blueprintNode.kind).toBe('number');
      expect(list.structure!['0'].raw).toBe(8);
      expect(list.children).toHaveLength(1);
      expect(root.runtime.diagnostics.status).toBe('stable');
    },
  );

  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s reads later-fold latent raw while the slot has no live node',
    (keyword) => {
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: false, b: true, list: [42] },
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.structure!.b,
        false,
        'callerReplace',
        WriteOption.Overwrite,
      );
      const scratch = getSettlementScratch(root.runtime);
      try {
        const context = createSettlementContext(
          root,
          'callerReplace',
          WriteOption.Overwrite,
          scratch,
        );
        expect(root.structure!.list.children).toHaveLength(0);
        expect(readSourceTree(root.structure!.list, context)).toEqual([42]);
        const list = root.structure!.list;
        expect(interpretFieldNodeInput(list.blueprintNode, [12])).toEqual([12]);
        context.distributedInputs.set(list, {
          input: [12],
          whole: false,
          automatic: false,
        });
        expect(readSourceTree(list, context)).toEqual([12]);
      } finally {
        releaseSettlementScratch(scratch);
      }
    },
  );

  it.each([
    { keyword: 'items', later: false },
    { keyword: 'items', later: true },
    { keyword: 'prefixItems', later: false },
    { keyword: 'prefixItems', later: true },
  ] satisfies readonly { keyword: 'items' | 'prefixItems'; later: boolean }[])(
    '$keyword keeps the earlier fold when both activate, starting with later=$later',
    ({ keyword, later }) => {
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: !later, b: later, list: [later ? 7 : 'first'] },
        WriteOption.Overwrite,
      );
      const survivor = root.structure!.list.blueprintNode;
      expect(() =>
        writeFieldNode(
          root.structure![later ? 'a' : 'b'],
          true,
          'callerReplace',
          WriteOption.Overwrite,
        ),
      ).toThrowError(
        expect.objectContaining({
          code: FormErrorCode.SharedNodeConflict,
          message: 'Active declarations conflict at /list/0',
          details: { path: '/list/0' },
        }),
      );
      const list = root.structure!.list;
      expect(list.blueprintNode).toBe(survivor);
      expect(list.structure!['0'].blueprintNode.kind).toBe('string');
      expect(list.children).toHaveLength(1);
      expect(root.runtime.diagnostics).toMatchObject({
        status: 'degraded',
        cause: 'sharedConflict',
      });
    },
  );

  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s restores A latent raw after B without handing A input to B',
    (keyword) => {
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: true, b: false, list: ['retained'] },
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.structure!.a,
        false,
        'callerReplace',
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.structure!.b,
        true,
        'callerReplace',
        WriteOption.Overwrite,
      );
      const list = root.structure!.list;
      expect(list.structure!['0'].blueprintNode.kind).toBe('number');
      expect(list.structure!['0'].raw).toBeUndefined();
      writeFieldNode(
        root.structure!.b,
        false,
        'callerReplace',
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.structure!.a,
        true,
        'callerReplace',
        WriteOption.Overwrite,
      );
      expect(list.structure!['0'].raw).toBe('retained');
    },
  );
});
