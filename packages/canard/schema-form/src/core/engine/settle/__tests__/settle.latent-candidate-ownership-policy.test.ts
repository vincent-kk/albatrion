import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { dispatchMount, dispatchPush, dispatchSetValue } from '../../write';
import { captureLiteralStarExit } from '../utils/literalStar/captureLiteralStarExit';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { selectCandidateOwnedLatent } from '../utils/transition/selectCandidateOwnedLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';
import {
  hasRetainedSlotOwnSource,
  readRetainedSlotRaw,
} from './fixtures/readRetainedSlotRaw';

afterEach(() => vi.restoreAllMocks());

describe('candidate exit policy ownership', () => {
  it('a terminal sibling clear cannot apply its policy to an object candidate', () => {
    const { root } = createDispatchTree(
      propertySchema(
        { type: 'object', properties: { x: { type: 'number' } } },
        { type: 'string', controls: { unsetOnInactive: true } },
      ),
    );
    dispatchMount(root, { a: true, b: false, v: { x: 5 } });
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    dispatchSetValue(getDispatchNode(root, 'b'), false);
    expect(readRetainedSlotRaw(root, '/v/x', 'number')).toBe(5);
    dispatchSetValue(getDispatchNode(root, 'a'), true);
    expect(getDispatchNode(root, 'v').local).toEqual({ x: 5 });
  });

  it('array clearing isolates siblings and honors owned latent retain overrides', () => {
    const { root } = createDispatchTree(
      propertySchema(
        { type: 'object', properties: { x: { type: 'number' } } },
        {
          type: 'array',
          controls: { unsetOnInactive: true },
          items: {
            type: 'object',
            properties: {
              show: { type: 'boolean' },
              drop: { type: 'number', controls: { active: '../show' } },
              keep: {
                type: 'number',
                controls: { active: '../show', unsetOnInactive: false },
              },
            },
          },
        },
      ),
    );
    dispatchMount(root, { a: true, b: false, v: { x: 5 } });
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    const array = getDispatchNode(root, 'v');
    dispatchPush(array, { show: true, drop: 11, keep: 12 });
    dispatchSetValue(getDispatchNode(array, '0', 'show'), false);
    expect(readRetainedSlotRaw(root, '/v/0/drop', 'number')).toBe(11);
    expect(readRetainedSlotRaw(root, '/v/0/keep', 'number')).toBe(12);
    dispatchSetValue(getDispatchNode(root, 'b'), false);
    expect(readRetainedSlotRaw(root, '/v/x', 'number')).toBe(5);
    expect(hasRetainedSlotOwnSource(root, '/v/0/drop', 'number')).toBe(false);
    expect(readRetainedSlotRaw(root, '/v/0/keep', 'number')).toBe(12);
  });

  it.each([false, true])(
    'shared path/token survives an array candidate exit, clear=%s',
    (clear) => {
      const { root } = createDispatchTree(
        propertySchema(
          { type: 'object', properties: { '0': { type: 'number' } } },
          {
            type: 'array',
            items: { type: 'number' },
            controls: { unsetOnInactive: clear },
          },
        ),
      );
      dispatchMount(root, { a: true, b: false, v: { '0': 5 } });
      dispatchSetValue(getDispatchNode(root, 'a'), false);
      dispatchSetValue(getDispatchNode(root, 'b'), true);
      dispatchSetValue(getDispatchNode(root, 'b'), false);
      expect(readRetainedSlotRaw(root, '/v/0', 'number')).toBe(5);
      dispatchSetValue(getDispatchNode(root, 'a'), true);
      expect(getDispatchNode(root, 'v', '0').raw).toBe(5);
      expect(getDispatchNode(root, 'v').local).toEqual({ '0': 5 });
    },
  );

  it.each([
    { host: 'object', clear: false },
    { host: 'object', clear: true },
    { host: 'array', clear: false },
    { host: 'array', clear: true },
  ] satisfies readonly { host: 'object' | 'array'; clear: boolean }[])(
    '[control] single-candidate $host clear=$clear skips ownership selection and child-entry traversal',
    ({ host, clear }) => {
      const { root } = createDispatchTree({
        type: host,
        ...(host === 'array'
          ? { items: { type: 'array', items: { type: 'number' } } }
          : {
              properties: { v: { type: 'array', items: { type: 'number' } } },
            }),
      });
      dispatchMount(root, host === 'array' ? [[5]] : { v: [5] });
      const child = getDispatchNode(root, host === 'array' ? '0' : 'v');
      const reads = vi.fn();
      const template = new Proxy(root.blueprintNode, {
        get(target, property, receiver) {
          if (property === 'childEntries') reads();
          return Reflect.get(target, property, receiver);
        },
      });
      const parent = new Proxy(root, {
        get(target, property, receiver) {
          return property === 'blueprintNode'
            ? template
            : Reflect.get(target, property, receiver);
        },
      });
      const departing = new Proxy(child, {
        get(target, property, receiver) {
          return property === 'parent'
            ? parent
            : Reflect.get(target, property, receiver);
        },
      });
      const scratch = getSettlementScratch(root.runtime);
      try {
        expect(selectCandidateOwnedLatent(departing)).toBeUndefined();
        captureLiteralStarExit(
          departing,
          clear,
          createSettlementContext(
            root,
            'callerReplace',
            WriteOption.Overwrite,
            scratch,
          ),
          true,
          [0],
        );
        expect(reads).not.toHaveBeenCalled();
        expect(
          root.runtime.literalStarRaw?.has(
            JSON.stringify([child.path, 'array']),
          ),
        ).toBe(!clear);
        expect(root.local).toEqual(host === 'array' ? [[5]] : { v: [5] });
      } finally {
        releaseSettlementScratch(scratch);
      }
    },
  );
});

/**
 * Bind two independently gated candidates to one property.
 * @param a - Earlier candidate and its child contract
 * @param b - Later candidate and its exit policy
 * @returns Root schema with independent candidate switches
 */
const propertySchema = (
  a: BlueprintSchema,
  b: BlueprintSchema,
): BlueprintSchema => ({
  type: 'object',
  properties: { a: { type: 'boolean' }, b: { type: 'boolean' } },
  allOf: [
    { controls: { active: './a' }, properties: { v: a } },
    { controls: { active: './b' }, properties: { v: b } },
  ],
});
