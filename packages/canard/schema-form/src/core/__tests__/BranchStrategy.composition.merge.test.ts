import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJsonSchema } from '@/schema-form/core';

import type { ObjectNode } from '../nodes/ObjectNode';
import {
  type CompositionCase,
  createSchema,
} from './BranchStrategy.composition.fixtures';

describe.each([
  ['oneOf', 'oneOf'],
  ['oneOf', 'anyOf'],
  ['anyOf', 'oneOf'],
  ['anyOf', 'anyOf'],
] as const satisfies readonly CompositionCase[])(
  'BranchStrategy nested composition %s → %s - Merge',
  (outerScope, innerScope) => {
    it('preserves root fields during a nested Merge', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue(
        { config: { mode: 'standard', cost: 10, days: 1 } },
        SetValueOption.Merge,
      );
      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'standard', cost: 10, days: 1 },
      });
    });

    it('preserves nested values during a selector-only Merge', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({
        enabled: true,
        config: { mode: 'standard', cost: 10, days: 1 },
      });
      await delay();

      node.setValue({ enabled: true }, SetValueOption.Merge);
      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'standard', cost: 10, days: 1 },
      });
    });
  },
);
