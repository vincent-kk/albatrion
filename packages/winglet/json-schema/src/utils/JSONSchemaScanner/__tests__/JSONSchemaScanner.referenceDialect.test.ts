import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { createReferenceResolver } from '../createReferenceResolver';
import { visitPaths } from './fixtures/visitPaths';

describe('dialect-independent reference visitation', () => {
  it('discovers not beneath a retained reference in both active and inert contains', () => {
    const schema = { contains: { $ref: '#/x', not: { type: 'string' } } };
    const old = visitPaths({
        $schema: 'http://json-schema.org/draft-04/schema#',
        ...schema,
      }),
      modern = visitPaths(schema);
    expect(old.sequence).toEqual(modern.sequence);
    expect(modern.sequence).toContain('+#/contains/not');
    expect(old.inert.get('#/contains/not')).toBe(true);
    expect(modern.inert.get('#/contains/not')).toBe(false);
  });
  it('keeps definition address containers active beside a retained old reference', () => {
    const { inert } = visitPaths({
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#missing',
      definitions: { A: { not: { type: 'string' } } },
      $defs: { B: { type: 'number' } },
      properties: { a: { type: 'boolean' } },
    });
    expect(inert.get('#/definitions/A/not')).toBe(false);
    expect(inert.get('#/$defs/B')).toBe(false);
    expect(inert.get('#/properties/a')).toBe(true);
  });
  it('does not activate a metaschema beside an ignored old-dialect identifier', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: {
        x: {
          $id: 'ignored',
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          $ref: '#missing',
          prefixItems: [{ type: 'string' }],
        },
      },
    };
    const ordinary = visitPaths(schema),
      contextual = visitPaths(schema, {
        resolveReference: createReferenceResolver(schema),
      });
    expect(ordinary.inert.get('#/properties/x/prefixItems/0')).toBe(true);
    expect([...ordinary.inert]).toEqual([...contextual.inert]);
  });
  it('keeps enter/exit paths identical over 200 seeded reference-bearing schema pairs', () => {
    let state = 0x64a2b71;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state;
    };
    const dialects = [
      'http://json-schema.org/draft-04/schema#',
      'http://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-07/schema#',
      'https://json-schema.org/draft/2019-09/schema',
      'https://json-schema.org/draft/2020-12/schema',
    ];
    const build = (depth: number): UnknownSchema => {
      if (!depth)
        return random() % 2 ? { type: 'string' } : { $ref: '#missing' };
      const child = build(depth - 1);
      switch (random() % 5) {
        case 0:
          return {
            $ref: '#missing',
            not: child,
            definitions: { A: build(depth - 1) },
          };
        case 1:
          return { contains: child, additionalProperties: false };
        case 2:
          return { prefixItems: [child], items: [build(depth - 1)] };
        case 3:
          return { properties: { a: child }, $defs: { B: build(depth - 1) } };
        default:
          return { allOf: [child, build(depth - 1)], $dynamicRef: '#missing' };
      }
    };
    for (let index = 0; index < 200; index++) {
      const schema = build(3);
      expect(
        visitPaths({ ...schema, $schema: dialects[index % 5] }).sequence,
      ).toEqual(visitPaths(schema).sequence);
    }
  });
});
