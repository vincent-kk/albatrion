import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { ObjectNode } from '../nodes/ObjectNode';
import {
  type CompositionCase,
  createSchema,
  expressDefault,
} from './BranchStrategy.composition.fixtures';

describe.each([
  ['oneOf', 'oneOf'],
  ['oneOf', 'anyOf'],
  ['anyOf', 'oneOf'],
  ['anyOf', 'anyOf'],
] as const satisfies readonly CompositionCase[])(
  'BranchStrategy nested composition %s → %s - constructor defaultValue',
  (outerScope, innerScope) => {
    it('preserves an explicit constructor defaultValue', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        defaultValue: {
          enabled: true,
          config: { mode: 'standard', cost: 8.5, days: 2 },
        },
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'standard', cost: 8.5, days: 2 },
      });
    });

    it('fills nested defaults for a partial constructor defaultValue', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        defaultValue: {
          enabled: true,
          config: { mode: 'express' },
        },
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      expect(node.value).toEqual(expressDefault);
    });
  },
);
