import { expect, it, vi } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { FieldNodeEventType } from '../../record';
import type { FieldNodeDelivery } from '../../record';
import type { Validator } from '../../validation';
import {
  dispatchMount,
  dispatchSetValue,
  dispatchValidate,
  subscribeFieldNode,
} from '../../write';
import { selectCandidateOwnedLatent } from '../utils/transition/selectCandidateOwnedLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('V1 independent nested exit preserves a source shared with an enclosing sibling', async () => {
  // These assertions inspect the latent-store baseline directly.
  pinLatentBaseline();
  const a: BlueprintSchema = {
    type: 'object',
    allOf: [
      {
        controls: { active: '../inner' },
        properties: { '0': { type: 'array', items: { type: 'number' } } },
      },
      { controls: { active: false }, properties: { '0': { type: 'string' } } },
    ],
  };
  const b: BlueprintSchema = {
    type: 'array',
    allOf: [
      {
        controls: { active: true },
        items: { type: 'object', properties: { '0': { type: 'number' } } },
      },
      { controls: { active: false }, items: { type: 'string' } },
    ],
  };
  const inputs: unknown[] = [];
  const validator: Validator = {
    compile: () => (value) => {
      inputs.push(value);
      return null;
    },
    compileGuard: () => () => true,
  };
  const { root } = createDispatchTree(
    {
      type: 'object',
      properties: {
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        inner: { type: 'boolean' },
      },
      allOf: [
        { controls: { active: './a' }, properties: { v: a } },
        { controls: { active: './b' }, properties: { v: b } },
      ],
    },
    undefined,
    validator,
  );
  const initial = { a: false, b: true, inner: true, v: [{ '0': 5 }] };
  dispatchMount(root, initial);
  const events: FieldNodeDelivery[] = [];
  subscribeFieldNode(root, (event) => events.push(event));
  dispatchSetValue(getDispatchNode(root, 'b'), false);
  const key = JSON.stringify(['/v/0/0', 'number']);
  const metadata = root.runtime.latentRawMetadata?.get(key);
  expect(metadata).toBeDefined();
  expect(root.runtime.latentRaw.get(key)).toBe(5);
  dispatchSetValue(getDispatchNode(root, 'a'), true);
  dispatchSetValue(getDispatchNode(root, 'inner'), false);
  expect(root.runtime.latentRaw.get(key)).toBe(5);
  expect(root.runtime.latentRawMetadata?.get(key)).toEqual(metadata);
  dispatchSetValue(getDispatchNode(root, 'a'), false);
  dispatchSetValue(getDispatchNode(root, 'b'), true);
  const expected = { ...initial, inner: false };
  expect(getDispatchNode(root, 'v', '0', '0').raw).toBe(5);
  expect(root.local).toEqual(expected);
  expect(root.emit).toEqual(expected);
  expect(
    events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
  ).toMatchObject({
    current: { local: expected, emit: expected },
  });
  await dispatchValidate(root);
  expect(inputs.at(-1)).toEqual(expected);
  expect(root.runtime.loadSnapshot).toEqual(initial);
});

it('[control] V1 single-candidate graph does not walk enclosing parents', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      box: { type: 'object', properties: { v: { type: 'number' } } },
    },
  });
  dispatchMount(root, { box: { v: 1 } });
  const reads = vi.fn();
  const parent = new Proxy(getDispatchNode(root, 'box'), {
    get(target, property, receiver) {
      if (property === 'parent') reads();
      return Reflect.get(target, property, receiver);
    },
  });
  const node = new Proxy(getDispatchNode(root, 'box', 'v'), {
    get(target, property, receiver) {
      return property === 'parent'
        ? parent
        : Reflect.get(target, property, receiver);
    },
  });
  expect(selectCandidateOwnedLatent(node)).toBeUndefined();
  expect(reads).not.toHaveBeenCalled();
});
