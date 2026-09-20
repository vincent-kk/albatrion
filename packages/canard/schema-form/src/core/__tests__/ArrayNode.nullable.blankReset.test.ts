import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectValue } from '../../types';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/**
 * `__resetToBlank__` seen from the edges the blank reset touches: the `minItems` fill must not
 * fire the array's own `injectTo`, a derived value must stay the final winner over that fill, and
 * an array parked behind `computed.active: false` must come back holding the same value a freshly
 * built, always-active form holds.
 */
const buildForm = (arraySchema: JSONSchema, enabled: boolean) => {
  const root = nodeFromJSONSchema({
    onChange: () => {},
    jsonSchema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: enabled },
        group: {
          type: ['object', 'null'],
          properties: { list: arraySchema },
        },
      },
    } as JSONSchema,
  }) as ObjectNode;
  return root;
};

describe('ArrayNode blank reset — injectTo on the minItems fill', () => {
  it('should not run the injectTo of a minItems array child when its parent becomes null', async () => {
    const injectTo = vi.fn(() => ({ '/marker': 'injected' }));
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          marker: { type: 'string' },
          group: {
            type: ['object', 'null'],
            properties: {
              list: {
                type: 'array',
                minItems: 2,
                items: { type: 'string', default: 'S' },
                injectTo,
              },
            },
          },
        },
      } as JSONSchema,
    }) as ObjectNode;
    await delay(10);

    (root.find('marker') as StringNode).setValue('written by the user');
    await delay(10);
    const callsAfterCreation = injectTo.mock.calls.length;

    (root.find('group') as ObjectNode).setValue(null);
    await delay(10);

    expect(injectTo.mock.calls.length).toBe(callsAfterCreation);
    expect((root.value as ObjectValue)?.marker).toBe('written by the user');
  });
});

describe.each([false, true])(
  'ArrayNode blank reset — a derived value shorter than minItems (terminal=%s)',
  (terminal) => {
    const derivedList = (): JSONSchema =>
      ({
        type: 'object',
        properties: {
          seed: { type: 'string', default: 'a' },
          group: {
            type: ['object', 'null'],
            properties: {
              list: {
                type: 'array',
                terminal,
                minItems: 3,
                items: { type: 'string', default: 'S' },
                computed: { derived: '[../../seed]' },
              },
            },
          },
        },
      }) as JSONSchema;

    it('should hold the derived value alone, as a freshly built form does', async () => {
      const fresh = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: derivedList(),
      }) as ObjectNode;
      await delay(10);
      const baseline = (fresh.find('group/list') as ArrayNode).value;
      expect(baseline).toEqual(['a']);

      (fresh.find('group') as ObjectNode).setValue(null);
      await delay(10);

      expect((fresh.find('group/list') as ArrayNode).value).toEqual(baseline);
    });
  },
);

const listSchemas = {
  'default only': {
    type: 'array',
    items: { type: 'string' },
    default: ['x'],
  },
  'minItems only': {
    type: 'array',
    minItems: 2,
    items: { type: 'string', default: 'S' },
  },
  'default and minItems (branch)': {
    type: 'array',
    minItems: 2,
    items: { type: 'string', default: 'S' },
    default: ['x'],
  },
  'default and minItems (terminal)': {
    type: 'array',
    terminal: true,
    minItems: 2,
    items: { type: 'string', default: 'S' },
    default: ['x'],
  },
} satisfies Record<string, JSONSchema>;

describe.each(Object.keys(listSchemas) as (keyof typeof listSchemas)[])(
  'ArrayNode blank reset — inactive restore value (%s)',
  (variant) => {
    const withActive = (schema: JSONSchema): JSONSchema => ({
      ...schema,
      computed: { active: '(../../enabled) === true' },
    });

    it('should restore the value a freshly built, always-active form holds', async () => {
      const baselineRoot = buildForm(withActive(listSchemas[variant]), true);
      await delay(10);
      const baseline = (baselineRoot.find('group/list') as ArrayNode).value;

      const root = buildForm(withActive(listSchemas[variant]), true);
      await delay(10);

      (root.find('enabled') as BooleanNode).setValue(false);
      await delay(10);
      (root.find('group') as ObjectNode).setValue(null);
      await delay(10);
      (root.find('enabled') as BooleanNode).setValue(true);
      await delay(10);

      expect((root.find('group/list') as ArrayNode).value).toEqual(baseline);
    });
  },
);
