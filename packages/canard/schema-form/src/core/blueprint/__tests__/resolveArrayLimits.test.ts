import { describe, expect, it } from 'vitest';

import { blueprint, mergeEffectiveSchema, resolveArrayLimits } from '../index';

// filid:contract array-limits-and-slots
describe('resolveArrayLimits', () => {
  it('LANDING-085 defaults to zero and Infinity', () => {
    expect(resolveArrayLimits({ type: 'array' })).toEqual({
      min: 0,
      max: Infinity,
    });
  });

  it('LANDING-085 uses explicit item limits', () => {
    expect(resolveArrayLimits({ minItems: 2, maxItems: 7 })).toEqual({
      min: 2,
      max: 7,
    });
  });

  it('LANDING-085 bounds a closed tuple by its prefix length', () => {
    expect(
      resolveArrayLimits({
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        maxItems: 5,
      }),
    ).toEqual({ min: 0, max: 2 });
  });

  it('LANDING-085 leaves a tuple open when items is a schema', () => {
    expect(
      resolveArrayLimits({
        prefixItems: [{ type: 'string' }],
        items: { type: 'number' },
      }),
    ).toEqual({ min: 0, max: Infinity });
  });

  it('LANDING-085 bounds an items:false tuple while retaining minItems', () => {
    expect(
      resolveArrayLimits({
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: false,
        minItems: 2,
      }),
    ).toEqual({ min: 2, max: 2 });
  });

  it('LANDING-085 retains explicit limits for an open tuple', () => {
    expect(
      resolveArrayLimits({
        prefixItems: [{ type: 'string' }, { type: 'number' }],
        items: { type: 'boolean' },
        minItems: 2,
        maxItems: 5,
      }),
    ).toEqual({ min: 2, max: 5 });
  });

  it('LANDING-085 retains contradictory authored minItems and maxItems', () => {
    expect(resolveArrayLimits({ minItems: 5, maxItems: 3 })).toEqual({
      min: 5,
      max: 3,
    });
  });

  it('35C-04 reads allOf length constraints from the effective schema', () => {
    const node = blueprint({
      type: 'array',
      allOf: [{ minItems: 2, maxItems: 4 }],
    }).root;
    const effective = mergeEffectiveSchema(
      node,
      node.declarations.map((declaration) => declaration.id),
    );
    expect(resolveArrayLimits(effective.schema)).toEqual({ min: 2, max: 4 });
  });

  it('35C-04 reads selected gated length constraints', () => {
    const node = blueprint({
      type: 'array',
      if: { required: ['enabled'] },
      then: { minItems: 1, maxItems: 3 },
    }).root;
    const activeIds = node.declarations
      .filter((declaration) => declaration.gates.length)
      .map((declaration) => declaration.id);
    expect(resolveArrayLimits(mergeEffectiveSchema(node, activeIds).schema)).toEqual({
      min: 1,
      max: 3,
    });
  });
});
