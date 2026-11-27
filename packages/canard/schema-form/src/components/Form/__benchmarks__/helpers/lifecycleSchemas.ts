import type { JSONSchema } from '@/schema-form/types';

/** A flat root with exactly one thousand terminal text fields. */
export const flatSchema: JSONSchema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: 1000 }, (_, i) => [
      `f${i}`,
      { type: 'string', default: 'value' },
    ]),
  ),
};

/** Default eagerCount leaves exactly 980 of these array entries deferred. */
export const arraySchema: JSONSchema = {
  type: 'array',
  items: { type: 'string' },
  default: Array.from({ length: 1000 }, () => 'value'),
};

/** Three late branches require three natural reveal commits to reach the target. */
export const nestedSchema: JSONSchema = {
  type: 'object',
  properties: {
    first: { type: 'string' },
    outer: {
      type: 'object',
      properties: {
        first: { type: 'string' },
        middle: {
          type: 'object',
          properties: {
            first: { type: 'string' },
            inner: {
              type: 'object',
              properties: { target: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};

/** Object entries expose labeled children whose paths shift after a leading removal. */
export const labeledArraySchema: JSONSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', title: 'Email' },
    },
  },
  default: Array.from({ length: 300 }, (_, index) => ({
    name: `Name ${index}`,
    email: `email${index}@example.com`,
  })),
};
