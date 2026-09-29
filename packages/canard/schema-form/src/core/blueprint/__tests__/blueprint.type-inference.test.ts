import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract type-inference
describe('blueprint untyped primitive branches', () => {
  it.each([
    [
      'E11',
      { anyOf: [{ type: 'string' }, { type: 'number' }] },
      'union',
      ['string', 'number'],
      false,
    ],
    [
      'E12',
      {
        anyOf: [
          { type: 'integer' },
          { type: 'string', minLength: 1 },
          { type: 'null' },
        ],
      },
      'union',
      ['integer', 'string'],
      true,
    ],
    [
      'E13',
      { anyOf: [{ type: 'string' }, { type: 'null' }] },
      'string',
      'string',
      true,
    ],
    [
      'E17',
      {
        oneOf: [{ type: 'string' }, { type: 'number' }],
        anyOf: [{ type: 'number' }, { type: 'boolean' }],
      },
      'number',
      'number',
      false,
    ],
    [
      'E29',
      { nullable: true, anyOf: [{ type: 'string' }, { type: 'number' }] },
      'union',
      ['string', 'number'],
      false,
    ],
    ['E32', { anyOf: [{ type: 'null' }] }, 'null', 'null', true],
    [
      'E33',
      { oneOf: [{ type: 'null' }], anyOf: [{ type: 'null' }] },
      'null',
      'null',
      true,
    ],
    [
      'E34',
      { anyOf: [{ type: ['string', 'null'] }, { type: 'number' }] },
      'union',
      ['string', 'number'],
      true,
    ],
    [
      'E35',
      { anyOf: [{ type: 'string', nullable: true }, { type: 'number' }] },
      'union',
      ['string', 'number'],
      true,
    ],
    [
      'E16',
      { oneOf: [{ type: 'object' }, { type: 'object' }] },
      'object',
      'object',
      false,
    ],
  ] as const)('%s', (_id, schema, kind, schemaType, nullable) => {
    expect(blueprint(schema).root).toMatchObject({
      kind,
      schemaType,
      nullable,
      strategy: kind === 'object' ? 'branch' : 'terminal',
    });
  });

  it.each([
    ['E14', { anyOf: [{ const: 'a' }, { type: 'number' }] }],
    ['E15', { anyOf: [{ type: 'object' }, { type: 'string' }] }],
  ] as const)('%s requires explicit type guidance', (_id, schema) => {
    expect(() => blueprint(schema)).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
      }),
    );
  });
});
