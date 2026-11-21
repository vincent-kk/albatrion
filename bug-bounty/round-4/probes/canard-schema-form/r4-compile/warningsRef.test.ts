import { describe, expect, it } from 'vitest';

import { blueprint } from '../../core/engine/blueprint';

const codes = (schema: any) => {
  const seen: string[] = [];
  try {
    blueprint(schema, { collect: (d: any) => seen.push(`${d.code}:${d.details?.keyword ?? ''}`) });
  } catch (error) {
    seen.push(`throw:${(error as any)?.code ?? error}`);
  }
  return seen.filter((code) => !code.startsWith('throw') || true).sort();
};

const host = (part: any, defs?: any) => ({
  type: 'object',
  properties: { a: { type: 'string' } },
  allOf: [part],
  ...(defs ? { $defs: defs } : {}),
});

describe('round 2 item 9 W1, exact shape', () => {
  it('W1 allOf branch via $ref with not warns like the inline branch', () => {
    const inline = codes({
      type: 'object',
      properties: { a: { type: 'string' } },
      allOf: [{ not: { required: ['a'] } }],
    });
    const viaRef = codes({
      type: 'object',
      properties: { a: { type: 'string' } },
      allOf: [{ $ref: '#/$defs/N' }],
      $defs: { N: { not: { required: ['a'] } } },
    });
    expect([inline, viaRef]).toEqual([
      ['SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM:not'],
      ['SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM:not'],
    ]);
  });
});

describe('diagnostic: declarations of the root node', () => {
  it('lists the schema paths and fragment ids of every root declaration', () => {
    const result = blueprint({
      type: 'object',
      properties: { a: { type: 'string' } },
      allOf: [{ $ref: '#/$defs/N' }],
      $defs: { N: { not: { required: ['a'] } } },
    } as any);
    const root = result.nodes[0] as any;
    expect(
      root.declarations.map((d: any) => [d.schemaPath, d.role, d.scope, d.fragmentId]),
    ).toEqual([
      ['#', 'declaration', 'node', 0],
      ['#/allOf/0', 'overlay', 'fragment', 1],
      // The keyword-bearing overlay keeps the target location, which does not end in allOf/<n>.
      ['#/$defs/N', 'overlay', 'fragment', 2],
    ]);
  });
});

describe('AllOfKeywordIgnoredForForm through $ref (round 2 item 9, W1 neighbors)', () => {
  for (const keyword of ['not', 'contains', 'dependentRequired', 'unevaluatedProperties']) {
    const value =
      keyword === 'not'
        ? { required: ['a'] }
        : keyword === 'contains'
          ? { type: 'string' }
          : keyword === 'dependentRequired'
            ? { a: ['b'] }
            : false;
    const body = { properties: { b: { type: 'string' } }, [keyword]: value };
    it(`allOf branch written as $ref whose target has ${keyword}`, () => {
      const inline = codes(host(body));
      expect(inline.some((code) => code.includes('ALL_OF_KEYWORD_IGNORED'))).toBe(true);
      expect(codes(host({ $ref: '#/$defs/X' }, { X: body }))).toEqual(inline);
    });
  }
});
