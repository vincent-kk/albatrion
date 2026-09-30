import { isArray } from '@winglet/common-utils/filter';
import { describe, expect, it } from 'vitest';

// @ts-expect-error The original JavaScript corpus has no TypeScript declaration.
import { corpus } from '../../../../architecture/spikes/guard-cost/redteam3/corpus.mjs';
import { blueprint } from '../index';
import type { BlueprintSchema } from '../type';

/** Every E1–E42 schema that constructs; the erroring cells (E10, E14, E15, E23, E28) have no nodes. */
const TYPE_CELLS: readonly (readonly [string, BlueprintSchema])[] = [
  ['E1', { type: ['string', 'number'] }],
  ['E2', { type: ['number', 'string', 'null'] }],
  ['E3', { type: ['string', 'number'], nullable: true }],
  ['E4', { type: ['integer', 'number'] }],
  ['E5', { type: ['integer', 'string'] }],
  ['E6', { type: ['integer', 'null'] }],
  ['E7', { type: ['object', 'string'], properties: { a: { type: 'string' } } }],
  ['E8', { type: ['object', 'null'] }],
  ['E9', { type: ['null'] }],
  ['E11', { anyOf: [{ type: 'string' }, { type: 'number' }] }],
  [
    'E12',
    {
      anyOf: [
        { type: 'integer' },
        { type: 'string', minLength: 1 },
        { type: 'null' },
      ],
    },
  ],
  ['E13', { anyOf: [{ type: 'string' }, { type: 'null' }] }],
  ['E16', { oneOf: [{ type: 'object' }, { type: 'object' }] }],
  [
    'E17',
    {
      oneOf: [{ type: 'string' }, { type: 'number' }],
      anyOf: [{ type: 'number' }, { type: 'boolean' }],
    },
  ],
  ['E18', { type: ['string', 'number'], allOf: [{ type: 'string' }] }],
  [
    'E19',
    { type: ['number', 'string'], allOf: [{ type: ['integer', 'string'] }] },
  ],
  ['E20', { type: 'number', allOf: [{ type: 'integer' }] }],
  ['E21', { type: ['string', 'null'], allOf: [{ type: 'string' }] }],
  ['E22', { type: 'string', anyOf: [{ type: 'null' }, { minLength: 1 }] }],
  ['E24', { type: 'number', allOf: [{ type: ['number', 'string'] }] }],
  [
    'E25',
    {
      type: 'object',
      properties: { a: { type: ['string', 'number'] } },
      if: { required: ['flag'] },
      then: { properties: { a: { type: 'number' } } },
    },
  ],
  [
    'E26',
    {
      type: 'object',
      properties: { a: { type: 'number' } },
      if: { required: ['flag'] },
      then: { properties: { a: { type: ['number', 'string'] } } },
    },
  ],
  [
    'E27',
    {
      type: 'object',
      if: { required: ['flag'] },
      then: { properties: { a: { type: ['string', 'number'] } } },
      else: { properties: { a: { type: 'number' } } },
    },
  ],
  ['E29', { nullable: true, anyOf: [{ type: 'string' }, { type: 'number' }] }],
  ['E30', { type: ['string', 'null'], allOf: [{ type: ['number', 'null'] }] }],
  [
    'E31',
    { type: ['string', 'number'], allOf: [{ type: ['string', 'boolean'] }] },
  ],
  ['E32', { anyOf: [{ type: 'null' }] }],
  ['E33', { oneOf: [{ type: 'null' }], anyOf: [{ type: 'null' }] }],
  ['E34', { anyOf: [{ type: ['string', 'null'] }, { type: 'number' }] }],
  ['E35', { anyOf: [{ type: 'string', nullable: true }, { type: 'number' }] }],
  ['E36', { type: 'integer', allOf: [{ type: 'number' }] }],
  ['E37', { type: 'string', allOf: [{ type: ['string', 'null'] }] }],
  [
    'E38',
    {
      type: ['string', 'number', 'null'],
      allOf: [{ type: ['string', 'boolean', 'null'] }],
    },
  ],
  ['E39', { allOf: [{ type: ['string'] }, { type: ['string', 'number'] }] }],
  [
    'E40',
    {
      type: 'object',
      properties: { a: { type: ['string', 'number', 'boolean'] } },
      allOf: [
        {
          if: { required: ['x'] },
          then: { properties: { a: { type: 'string' } } },
        },
        {
          if: { required: ['y'] },
          then: { properties: { a: { type: 'boolean' } } },
        },
      ],
    },
  ],
  [
    'E41',
    {
      type: 'object',
      properties: { a: { type: 'number' } },
      if: { required: ['flag'] },
      then: { properties: { a: { type: 'integer' } } },
    },
  ],
  [
    'E42',
    {
      type: 'object',
      properties: { a: { type: ['string', 'number'] } },
      oneOf: [{ properties: { a: { type: 'string' } } }],
    },
  ],
];

const expectInvariant = (label: string, schema: BlueprintSchema) => {
  for (const node of blueprint(schema).nodes) {
    expect(
      isArray(node.schemaType),
      `${label} ${node.schemaPath}`,
    ).toBe(node.kind === 'union');
    if (isArray(node.schemaType))
      expect(
        Object.isFrozen(node.schemaType),
        `${label} ${node.schemaPath} frozen`,
      ).toBe(true);
  }
};

// filid:contract type-schema-type-invariant
describe('blueprint schemaType invariant on every corpus cell', () => {
  it('holds array schemaType only for union, and frozen, on every E1–E42 cell', () => {
    for (const [id, schema] of TYPE_CELLS) expectInvariant(id, schema);
  });

  it('holds array schemaType only for union, and frozen, on every generator corpus schema', () => {
    expect(corpus).toHaveLength(14);
    for (const sample of corpus) expectInvariant(sample.id, sample.root);
  });
});
