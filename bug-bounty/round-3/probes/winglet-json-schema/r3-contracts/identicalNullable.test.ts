import { describe, expect, it } from 'vitest';

import { isIdenticalSchemaType } from '../../index';

/** `nullable: true` is the OpenAPI spelling of adding 'null' to the type array (JSDoc lines 6-8). */
describe('r3-contracts json-schema isIdenticalSchemaType normalizes nullable: true', () => {
  it('control: a null-bearing type array differs from the non-nullable type', () => {
    expect(isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string' })).toBe(false);
  });

  it('control: the two nullable spellings are identical', () => {
    expect(isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string', nullable: true })).toBe(true);
  });

  it('a nullable: true string differs from the non-nullable string, like its type-array spelling does', () => {
    const results = {
      singleType: isIdenticalSchemaType({ type: 'string', nullable: true }, { type: 'string' }),
      reversed: isIdenticalSchemaType({ type: 'string' }, { type: 'string', nullable: true }),
      oneElementArray: isIdenticalSchemaType({ type: ['string'], nullable: true }, { type: 'string' }),
      sameArrayReference: (() => {
        const type = ['string', 'number'];
        return isIdenticalSchemaType({ type, nullable: true }, { type });
      })(),
    };
    expect(results).toEqual({
      singleType: false,
      reversed: false,
      oneElementArray: false,
      sameArrayReference: false,
    });
  });
});
