import { isArray } from '@winglet/common-utils/filter';
import { describe, expect, it } from 'vitest';

import { blueprint } from '../index';
import { BlueprintErrorCode } from '../utils/diagnostics/constant';

// filid:contract type-syntax
describe('blueprint explicit type syntax', () => {
  it.each([
    [
      'E1',
      { type: ['string', 'number'] },
      'union',
      ['string', 'number'],
      false,
      'terminal',
    ],
    [
      'E2',
      { type: ['number', 'string', 'null'] },
      'union',
      ['number', 'string'],
      true,
      'terminal',
    ],
    [
      'E3',
      { type: ['string', 'number'], nullable: true },
      'union',
      ['string', 'number'],
      true,
      'terminal',
    ],
    [
      'E4',
      { type: ['integer', 'number'] },
      'number',
      'number',
      false,
      'terminal',
    ],
    [
      'E5',
      { type: ['integer', 'string'] },
      'union',
      ['integer', 'string'],
      false,
      'terminal',
    ],
    [
      'E6',
      { type: ['integer', 'null'] },
      'number',
      'integer',
      true,
      'terminal',
    ],
    [
      'E7',
      { type: ['object', 'string'], properties: { a: { type: 'string' } } },
      'union',
      ['object', 'string'],
      false,
      'terminal',
    ],
    ['E8', { type: ['object', 'null'] }, 'object', 'object', true, 'branch'],
    ['E9', { type: ['null'] }, 'null', 'null', true, 'terminal'],
  ] as const)('%s', (_id, schema, kind, schemaType, nullable, strategy) => {
    const node = blueprint(schema).root;
    expect(node).toMatchObject({ kind, schemaType, nullable, strategy });
    expect(isArray(node.schemaType)).toBe(kind === 'union');
    if (isArray(node.schemaType))
      expect(Object.isFrozen(node.schemaType)).toBe(true);
  });

  it('E10 rejects invalid, empty and duplicated explicit types', () => {
    for (const type of [['null', 'null'], [], ['string', 'foo']])
      expect(() => blueprint({ type })).toThrow(
        expect.objectContaining({
          specific: BlueprintErrorCode.UnknownJsonSchema,
        }),
      );
  });

  it('E28 rejects branch strategy for a union', () => {
    expect(() =>
      blueprint({ type: ['string', 'number'], options: { terminal: false } }),
    ).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.TerminalOptionUnsupported,
      }),
    );
  });
});
