import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { ObjectNode } from '../nodes/ObjectNode';
import {
  type CompositionCase,
  createSchema,
  expressDefault,
  standardDefault,
} from './BranchStrategy.composition.fixtures';

describe.each([
  ['oneOf', 'oneOf'],
  ['oneOf', 'anyOf'],
  ['anyOf', 'oneOf'],
  ['anyOf', 'anyOf'],
] as const satisfies readonly CompositionCase[])(
  'BranchStrategy nested composition %s → %s - setValue injection',
  (outerScope, innerScope) => {
    it('preserves explicit values injected before initial settlement', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      node.setValue({
        enabled: true,
        config: { mode: 'standard', cost: 12.5, days: 3 },
      });
      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'standard', cost: 12.5, days: 3 },
      });
    });

    it('fills nested defaults for a partial overwrite', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true, config: { mode: 'standard' } });
      await delay();

      expect(node.value).toEqual(standardDefault);
    });

    it('applies only the latest synchronous pre-settlement injection', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      node.setValue({
        enabled: true,
        config: { mode: 'standard', cost: 10, days: 2 },
      });
      node.setValue({
        enabled: true,
        config: { mode: 'express', expressCost: 25, hours: 8 },
      });
      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'express', expressCost: 25, hours: 8 },
      });
    });

    it('restores the active object when an overwrite omits it', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true });
      await delay();

      expect(node.value).toEqual(standardDefault);
    });

    it('fills defaults for a partial non-default inner branch', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true, config: { mode: 'express' } });
      await delay();

      expect(node.value).toEqual(expressDefault);
    });

    it('restores defaults after external deactivation and reactivation', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: false });
      await delay();
      expect(node.value).toEqual({ enabled: false });

      node.setValue({ enabled: true });
      await delay();

      expect(node.value).toEqual(standardDefault);
    });

    it('filters fields from an inactive inner branch', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({
        enabled: true,
        config: {
          mode: 'express',
          cost: 99,
          days: 99,
          expressCost: 20,
          hours: 12,
        },
      });
      await delay();

      expect(node.value).toEqual({
        enabled: true,
        config: { mode: 'express', expressCost: 20, hours: 12 },
      });
    });
  },
);
