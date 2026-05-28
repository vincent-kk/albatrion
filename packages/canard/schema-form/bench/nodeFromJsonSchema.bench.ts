import { bench, describe } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * Pure schema → node tree construction. No React, no JSDOM.
 * This is the micro counterpart of "Form Rendering" in benchmark-form,
 * isolating schema-form's actual cost from React mount cost.
 */

const flatSchema: JsonSchema = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'A' },
    b: { type: 'number', default: 1 },
    c: { type: 'boolean', default: true },
    d: { type: 'string', default: 'D' },
    e: { type: 'number', default: 2 },
  },
};

const nestedSchema: JsonSchema = {
  type: 'object',
  properties: {
    personalInfo: {
      type: 'object',
      properties: {
        firstName: { type: 'string', default: 'John' },
        lastName: { type: 'string', default: 'Doe' },
        age: { type: 'number', default: 30 },
        email: { type: 'string', format: 'email', default: 'a@b.c' },
      },
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string', default: '123' },
        city: { type: 'string', default: 'X' },
        country: { type: 'string', default: 'Y' },
      },
    },
  },
};

const oneOfSchema: JsonSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['a', 'b'],
      default: 'a',
    },
  },
  oneOf: [
    {
      '&if': "./type === 'a'",
      properties: {
        fieldA1: { type: 'string', default: 'a1' },
        fieldA2: { type: 'number', default: 10 },
      },
    },
    {
      '&if': "./type === 'b'",
      properties: {
        fieldB1: { type: 'string', default: 'b1' },
        fieldB2: { type: 'number', default: 20 },
      },
    },
  ],
};

const computedSchema: JsonSchema = {
  type: 'object',
  properties: {
    trigger: { type: 'string', default: 'on' },
    a: {
      type: 'string',
      computed: { visible: '../trigger === "on"' },
      default: 'A',
    },
    b: {
      type: 'string',
      computed: { visible: '../trigger === "off"' },
      default: 'B',
    },
    derived: {
      type: 'string',
      computed: { derived: '../a + "/" + ../b' },
    },
  },
};

const noop = () => {};

describe('nodeFromJsonSchema', () => {
  bench('flat (5 props, terminal only)', () => {
    nodeFromJsonSchema({ jsonSchema: flatSchema, onChange: noop });
  });

  bench('nested (2 sub-objects, 7 terminals)', () => {
    nodeFromJsonSchema({ jsonSchema: nestedSchema, onChange: noop });
  });

  bench('oneOf (single branch active)', () => {
    nodeFromJsonSchema({ jsonSchema: oneOfSchema, onChange: noop });
  });

  bench('computed (visible + derived deps)', () => {
    nodeFromJsonSchema({ jsonSchema: computedSchema, onChange: noop });
  });
});
