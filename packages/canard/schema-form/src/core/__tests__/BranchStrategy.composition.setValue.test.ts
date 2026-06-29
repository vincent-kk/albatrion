import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

type CompositionScope = 'oneOf' | 'anyOf';
type CompositionCase = [outer: CompositionScope, inner: CompositionScope];

const compositionCases: CompositionCase[] = [
  ['oneOf', 'oneOf'],
  ['oneOf', 'anyOf'],
  ['anyOf', 'oneOf'],
  ['anyOf', 'anyOf'],
];

const createSchema = (
  outerScope: CompositionScope,
  innerScope: CompositionScope,
): JsonSchema => ({
  type: 'object',
  properties: {
    enabled: { type: 'boolean', default: true },
  },
  [outerScope]: [
    {
      '&if': './enabled === true',
      properties: {
        config: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['standard', 'express'],
              default: 'standard',
            },
          },
          [innerScope]: [
            {
              '&if': "./mode === 'standard'",
              properties: {
                cost: { type: 'number', default: 5.99 },
                days: { type: 'number', default: 7 },
              },
            },
            {
              '&if': "./mode === 'express'",
              properties: {
                expressCost: { type: 'number', default: 15.99 },
                hours: { type: 'number', default: 24 },
              },
            },
          ],
        },
      },
    },
  ],
});

const standardDefault = {
  enabled: true,
  config: { mode: 'standard', cost: 5.99, days: 7 },
};

const expressDefault = {
  enabled: true,
  config: { mode: 'express', expressCost: 15.99, hours: 24 },
};

describe('BranchStrategy nested composition - external value injection', () => {
  it.each(compositionCases)(
    '%s → %s preserves explicit values injected before initial settlement',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s fills nested defaults for a partial overwrite',
    async (outerScope, innerScope) => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true, config: { mode: 'standard' } });
      await delay();

      expect(node.value).toEqual(standardDefault);
    },
  );

  it.each(compositionCases)(
    '%s → %s applies only the latest synchronous pre-settlement injection',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s restores the active object when an overwrite omits it',
    async (outerScope, innerScope) => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true });
      await delay();

      expect(node.value).toEqual(standardDefault);
    },
  );

  it.each(compositionCases)(
    '%s → %s fills defaults for a partial non-default inner branch',
    async (outerScope, innerScope) => {
      const node = nodeFromJsonSchema({
        jsonSchema: createSchema(outerScope, innerScope),
        onChange: () => {},
      }) as ObjectNode;

      await delay();
      node.setValue({ enabled: true, config: { mode: 'express' } });
      await delay();

      expect(node.value).toEqual(expressDefault);
    },
  );

  it.each(compositionCases)(
    '%s → %s restores defaults after external deactivation and reactivation',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s preserves an explicit constructor defaultValue',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s fills nested defaults for a partial constructor defaultValue',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s filters fields from an inactive inner branch',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s preserves root fields during a nested Merge',
    async (outerScope, innerScope) => {
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
    },
  );

  it.each(compositionCases)(
    '%s → %s preserves nested values during a selector-only Merge',
    async (outerScope, innerScope) => {
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
    },
  );
});
