import { afterEach, expect, it, vi } from 'vitest';

import { FormErrorCode } from '../../../../errors';
import { blueprint } from '../blueprint';
import * as childTargets from '../validateChildTargets';

afterEach(() => vi.restoreAllMocks());

it.each([
  {
    name: 'flat',
    schema: { type: 'object', properties: { a: { type: 'string' } } },
  },
  {
    name: 'nested',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'object', properties: { b: { type: 'number' } } },
      },
    },
  },
  {
    name: 'oneOf without discriminator',
    schema: {
      type: 'object',
      oneOf: [{ properties: { a: { type: 'string' } } }],
    },
  },
  {
    name: 'recursive ref',
    schema: {
      type: 'array',
      $defs: { list: { type: 'array', items: { $ref: '#/$defs/list' } } },
      items: { $ref: '#/$defs/list' },
    },
  },
  {
    name: 'virtual fields without controls',
    schema: {
      type: 'object',
      properties: { a: { type: 'string' } },
      options: { virtual: { group: { fields: ['a'] } } },
    },
  },
])('skips child-target validation for $name', ({ schema }) => {
  const validate = vi.spyOn(childTargets, 'validateChildTargets');
  blueprint(schema);
  expect(validate).not.toHaveBeenCalled();
});

it.each([
  { name: 'root fields', schema: { type: 'object', controls: { fields: [] } } },
  {
    name: 'root discriminator',
    schema: {
      type: 'object',
      controls: { discriminator: 'tag' },
      oneOf: [{ properties: { tag: { type: 'string', const: 'a' } } }],
    },
  },
  {
    name: 'oneOf child fields',
    schema: {
      type: 'object',
      oneOf: [
        {
          controls: { active: true },
          properties: { a: { type: 'object', controls: { fields: [] } } },
        },
      ],
    },
  },
  {
    name: 'oneOf child discriminator',
    schema: {
      type: 'object',
      oneOf: [
        {
          controls: { active: true },
          properties: {
            a: {
              type: 'object',
              controls: { discriminator: 'tag' },
              oneOf: [{ properties: { tag: { type: 'string', const: 'a' } } }],
            },
          },
        },
      ],
    },
  },
  {
    name: 'referenced fields',
    schema: {
      $defs: { target: { type: 'object', controls: { fields: [] } } },
      $ref: '#/$defs/target',
    },
  },
  {
    name: 'referenced discriminator',
    schema: {
      $defs: {
        target: {
          type: 'object',
          controls: { discriminator: 'tag' },
          oneOf: [{ properties: { tag: { type: 'string', const: 'a' } } }],
        },
      },
      $ref: '#/$defs/target',
    },
  },
  {
    name: 'virtual fields controls',
    schema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      options: {
        virtual: {
          group: {
            fields: ['a'],
            controls: { fields: [{ targets: ['a'], controls: {} }] },
          },
        },
      },
    },
  },
  {
    name: 'virtual discriminator',
    schema: {
      type: 'object',
      properties: { tag: { type: 'string', const: 'a' } },
      options: {
        virtual: {
          group: {
            fields: ['tag'],
            controls: { discriminator: 'tag' },
            oneOf: [{ properties: { tag: { type: 'string', const: 'a' } } }],
          },
        },
      },
    },
  },
])('runs child-target validation once for $name', ({ schema }) => {
  const validate = vi.spyOn(childTargets, 'validateChildTargets');
  blueprint(schema);
  expect(validate).toHaveBeenCalledTimes(1);
});

it('rejects a missing fields target inside a gated oneOf child declaration', () => {
  const validate = vi.spyOn(childTargets, 'validateChildTargets');
  expect(() =>
    blueprint({
      type: 'object',
      oneOf: [
        {
          controls: { active: false },
          properties: {
            a: {
              type: 'object',
              controls: { fields: [{ targets: ['missing'], controls: {} }] },
            },
          },
        },
      ],
    }),
  ).toThrow(
    expect.objectContaining({
      code: FormErrorCode.ChildrenTargetNotFound,
      details: expect.objectContaining({
        target: 'missing',
        schemaPath: '#/oneOf/0/properties/a/controls/fields/0',
      }),
    }),
  );
  expect(validate).toHaveBeenCalledTimes(1);
});
