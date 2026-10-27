import { describe, expect, it } from 'vitest';

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
import { getDispatchNode } from './fixtures/getDispatchNode';

describe('candidate-owned latent descendant cleanup', () => {
  it.each([
    { slot: 'items', route: 'active-at-close' },
    { slot: 'items', route: 'absent-at-close' },
    { slot: 'items', route: 'direct' },
    { slot: 'prefixItems', route: 'active-at-close' },
    { slot: 'prefixItems', route: 'absent-at-close' },
    { slot: 'prefixItems', route: 'direct' },
    { slot: 'property', route: 'active-at-close' },
    { slot: 'property', route: 'absent-at-close' },
    { slot: 'property', route: 'direct' },
  ] satisfies readonly {
    slot: 'items' | 'prefixItems' | 'property';
    route: 'active-at-close' | 'absent-at-close' | 'direct';
  }[])(
    '$slot preserves object descendants through $route',
    async ({ slot, route }) => {
      const validationInputs: unknown[] = [];
      const validator: Validator = {
        compile: () => (value) => {
          validationInputs.push(value);
          return null;
        },
        compileGuard: () => () => true,
      };
      const { root } = createDispatchTree(
        candidateSchema(slot),
        undefined,
        validator,
      );
      const initial = {
        open: true,
        a: true,
        b: false,
        ...candidateValue(slot),
      };
      dispatchMount(root, initial);
      const path = slot === 'property' ? '/box/v/x' : '/list/0/x';
      const key = JSON.stringify([path, 'number']);
      const events: FieldNodeDelivery[] = [];
      subscribeFieldNode(root, (event) => events.push(event));
      if (route === 'absent-at-close')
        dispatchSetValue(getDispatchNode(root, 'a'), false);
      if (route !== 'direct')
        dispatchSetValue(getDispatchNode(root, 'open'), false);
      if (route !== 'absent-at-close')
        dispatchSetValue(getDispatchNode(root, 'a'), false);
      expect(root.runtime.latentRaw.get(key)).toBe(5);
      const metadata = root.runtime.latentRawMetadata?.get(key);
      expect(metadata?.path).toBe(path);
      dispatchSetValue(getDispatchNode(root, 'b'), true);
      if (route !== 'direct')
        dispatchSetValue(getDispatchNode(root, 'open'), true);
      dispatchSetValue(getDispatchNode(root, 'b'), false);
      expect(root.runtime.latentRaw.get(key)).toBe(5);
      expect(root.runtime.latentRawMetadata?.get(key)).toEqual(metadata);
      const absent = {
        open: true,
        a: false,
        b: false,
        ...(slot === 'property' ? {} : { list: [{}] }),
      };
      expect(root.local).toEqual(absent);
      expect(root.emit).toEqual(absent);
      expect(
        events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
      ).toMatchObject({
        current: { local: absent, emit: absent },
      });
      await dispatchValidate(root);
      expect(validationInputs.at(-1)).toEqual(absent);
      expect(root.runtime.loadSnapshot).toEqual(initial);
      dispatchSetValue(getDispatchNode(root, 'a'), true);
      const candidate =
        slot === 'property'
          ? getDispatchNode(root, 'box', 'v')
          : getDispatchNode(root, 'list', '0');
      expect(getDispatchNode(candidate, 'x').raw).toBe(5);
      expect(root.local).toEqual(initial);
      expect(root.emit).toEqual(initial);
      expect(
        events.at(-1)?.payload?.[FieldNodeEventType.UpdateValue],
      ).toMatchObject({
        current: { local: initial, emit: initial },
      });
      await dispatchValidate(root);
      expect(validationInputs.at(-1)).toEqual(initial);
      expect(root.runtime.loadSnapshot).toEqual(initial);
    },
  );
});

/**
 * Declare object and array candidates under one gated enclosing host.
 * @param slot - Named property, repeated item or tuple binding to exercise
 * @returns Schema whose candidate gates can be changed independently
 */
const candidateSchema = (
  slot: 'items' | 'prefixItems' | 'property',
): BlueprintSchema => {
  const object: BlueprintSchema = {
    type: 'object',
    properties: { x: { type: 'number' } },
  };
  const array: BlueprintSchema = { type: 'array', items: { type: 'number' } };
  const host: BlueprintSchema = {
    type: slot === 'property' ? 'object' : 'array',
    controls: { active: '../open' },
    allOf: [
      {
        controls: { active: '../a' },
        ...(slot === 'property'
          ? { properties: { v: object } }
          : slot === 'items'
            ? { items: object }
            : { prefixItems: [object] }),
      },
      {
        controls: { active: '../b' },
        ...(slot === 'property'
          ? { properties: { v: array } }
          : slot === 'items'
            ? { items: array }
            : { prefixItems: [array] }),
      },
    ],
  };
  return {
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      a: { type: 'boolean' },
      b: { type: 'boolean' },
      [slot === 'property' ? 'box' : 'list']: host,
    },
  };
};

/**
 * Bind the object candidate's initial value at the selected slot.
 * @param slot - Candidate binding style
 * @returns Initial enclosing-host source
 */
const candidateValue = (slot: 'items' | 'prefixItems' | 'property') =>
  slot === 'property' ? { box: { v: { x: 5 } } } : { list: [{ x: 5 }] };
