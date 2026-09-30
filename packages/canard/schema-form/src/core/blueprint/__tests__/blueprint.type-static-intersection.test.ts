import { isArray } from '@winglet/common-utils/filter';
import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract type-static-intersection
describe('blueprint static type conjunction', () => {
  it.each([
    [
      'E18',
      { type: ['string', 'number'], allOf: [{ type: 'string' }] },
      'string',
      'string',
      false,
    ],
    [
      'E19',
      { type: ['number', 'string'], allOf: [{ type: ['integer', 'string'] }] },
      'union',
      ['integer', 'string'],
      false,
    ],
    [
      'E20',
      { type: 'number', allOf: [{ type: 'integer' }] },
      'number',
      'integer',
      false,
    ],
    [
      'E21',
      { type: ['string', 'null'], allOf: [{ type: 'string' }] },
      'string',
      'string',
      false,
    ],
    [
      'E22',
      { type: 'string', anyOf: [{ type: 'null' }, { minLength: 1 }] },
      'string',
      'string',
      false,
    ],
    [
      'E24',
      { type: 'number', allOf: [{ type: ['number', 'string'] }] },
      'number',
      'number',
      false,
    ],
    [
      'E30',
      { type: ['string', 'null'], allOf: [{ type: ['number', 'null'] }] },
      'null',
      'null',
      true,
    ],
    [
      'E31',
      { type: ['string', 'number'], allOf: [{ type: ['string', 'boolean'] }] },
      'string',
      'string',
      false,
    ],
    [
      'E36',
      { type: 'integer', allOf: [{ type: 'number' }] },
      'number',
      'integer',
      false,
    ],
    [
      'E37',
      { type: 'string', allOf: [{ type: ['string', 'null'] }] },
      'string',
      'string',
      false,
    ],
    [
      'E38',
      {
        type: ['string', 'number', 'null'],
        allOf: [{ type: ['string', 'boolean', 'null'] }],
      },
      'string',
      'string',
      true,
    ],
  ] as const)('%s', (_id, schema, kind, schemaType, nullable) => {
    expect(blueprint(schema).root).toMatchObject({
      kind,
      schemaType,
      nullable,
      strategy: 'terminal',
    });
  });

  it('E23 rejects an empty static intersection', () => {
    expect(() =>
      blueprint({ type: 'string', allOf: [{ type: 'number' }] }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.AllOfTypeRedefinition,
      }),
    );
  });

  it('E39 preserves the result when allOf order is reversed', () => {
    const allOf = [{ type: ['string'] }, { type: ['string', 'number'] }];
    for (const declarations of [allOf, [...allOf].reverse()])
      expect(blueprint({ allOf: declarations }).root).toMatchObject({
        kind: 'string',
        schemaType: 'string',
        nullable: false,
        strategy: 'terminal',
      });
  });
  it('treats an all-null static conjunction as a null node', () => {
    expect(
      blueprint({ type: 'null', allOf: [{ type: 'null' }] }).root,
    ).toMatchObject({
      kind: 'null',
      schemaType: 'null',
      nullable: true,
      strategy: 'terminal',
    });
  });

  it('gives every declaration pair the same result in both orders', () => {
    const pairs: readonly [string, unknown, unknown][] = [
      ['E18', ['string', 'number'], 'string'],
      ['E19', ['number', 'string'], ['integer', 'string']],
      ['E20', 'number', 'integer'],
      ['E21', ['string', 'null'], 'string'],
      ['E23', 'string', 'number'],
      ['E24', 'number', ['number', 'string']],
      ['E30', ['string', 'null'], ['number', 'null']],
      ['E31', ['string', 'number'], ['string', 'boolean']],
      ['E36', 'integer', 'number'],
      ['E37', 'string', ['string', 'null']],
      ['E38', ['string', 'number', 'null'], ['string', 'boolean', 'null']],
    ];
    const outcome = (left: unknown, right: unknown) => {
      try {
        const { kind, schemaType, nullable } = blueprint({
          allOf: [{ type: left }, { type: right }],
        }).root;
        return {
          kind,
          nullable,
          schemaType: isArray(schemaType)
            ? [...schemaType].sort()
            : schemaType,
        };
      } catch (error: any) {
        return { error: error.specific };
      }
    };
    for (const [id, left, right] of pairs) {
      const forward = outcome(left, right);
      expect(outcome(right, left), id).toEqual(forward);
      if (id === 'E23')
        expect(forward).toEqual({
          error: BlueprintErrorCode.AllOfTypeRedefinition,
        });
      else expect(forward, id).not.toHaveProperty('error');
    }
  });
});
