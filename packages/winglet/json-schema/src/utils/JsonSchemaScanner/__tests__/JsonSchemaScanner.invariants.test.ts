import { getValue } from '@winglet/json/pointer';
import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../sync/JsonSchemaScanner';

/**
 * Resolver that returns the ORIGINAL subtree by reference — the real-world
 * pattern used by @canard/schema-form. Exercises the original-mutation /
 * aliasing surface that R1 (clone-at-inline) closes.
 */
const originalRefResolver = (root: UnknownSchema) => (ref: string) =>
  getValue(root, ref);

describe('JsonSchemaScanner - invariants', () => {
  describe('reference isolation (R1)', () => {
    it('does not mutate the original schema after scan + getValue', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: {
          A: { type: 'object', properties: { b: { $ref: '#/definitions/B' } } },
          B: { type: 'string' },
        },
      };
      const before = JSON.stringify(schema);
      new JsonSchemaScanner({
        options: { resolveReference: originalRefResolver(schema) },
      })
        .scan(schema)
        .getValue();
      expect(JSON.stringify(schema)).toBe(before);
    });

    it('output does not share references with the original definitions', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: {
          A: { type: 'object', properties: { n: { type: 'string' } } },
        },
      };
      const out = new JsonSchemaScanner({
        options: { resolveReference: originalRefResolver(schema) },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(out.properties.x).not.toBe(schema.definitions.A);
    });

    it('multiple occurrences of the same $ref are not aliased in the output', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: {
          x: { $ref: '#/definitions/A' },
          y: { $ref: '#/definitions/A' },
        },
        definitions: { A: { type: 'object' } },
      };
      const out = new JsonSchemaScanner({
        options: { resolveReference: originalRefResolver(schema) },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(out.properties.x).not.toBe(out.properties.y);
    });

    it('cloneResolvedSchema:false opts out of cloning (shares the resolver result)', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: { A: { type: 'object' } },
      };
      const out = new JsonSchemaScanner({
        options: {
          cloneResolvedSchema: false,
          resolveReference: originalRefResolver(schema),
        },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(out.properties.x).toBe(schema.definitions.A);
    });
  });

  describe('RFC 6901 escaping of definition keys (R3)', () => {
    it('escapes "/" and "~" in $defs / definitions keys', () => {
      const schema: UnknownSchema = {
        $defs: { 'a/b': { type: 'string' } },
        definitions: { 'c~d': { type: 'number' } },
      };
      const paths: string[] = [];
      new JsonSchemaScanner({
        visitor: { enter: (e) => paths.push(e.path) },
      }).scan(schema);
      expect(paths).toContain('#/$defs/a~1b');
      expect(paths).toContain('#/definitions/c~0d');
    });

    it('round-trips an escaped definition-key path through getValue (no spurious nesting)', () => {
      const schema: UnknownSchema = {
        $defs: { 'a/b': { type: 'string' }, 'c~d': { type: 'number' } },
      };
      const out = new JsonSchemaScanner({
        options: {
          mutate: (e) => {
            if (e.path === '#/$defs/a~1b')
              return { ...e.schema, title: 'SLASH' };
            if (e.path === '#/$defs/c~0d')
              return { ...e.schema, title: 'TILDE' };
            return undefined;
          },
        },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      // setValue must unescape ~1/~0 back to the ORIGINAL keys, not create a.b nesting.
      expect(out.$defs['a/b']).toEqual({ type: 'string', title: 'SLASH' });
      expect(out.$defs['c~d']).toEqual({ type: 'number', title: 'TILDE' });
      expect(out.$defs.a).toBeUndefined();
    });
  });

  describe('failed scan resets state (R4)', () => {
    it('re-throws and leaves getValue() === undefined', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: { A: { type: 'string' } },
      };
      const scanner = new JsonSchemaScanner({
        options: {
          resolveReference: () => {
            throw new Error('boom');
          },
        },
      });
      expect(() => scanner.scan(schema)).toThrow('boom');
      expect(scanner.getValue()).toBeUndefined();
    });

    it('a fresh scan works after a failed one', () => {
      const scanner = new JsonSchemaScanner();
      expect(scanner.scan({ type: 'string' }).getValue()).toEqual({
        type: 'string',
      });
    });
  });

  describe('subschema guards — object-only policy (R5)', () => {
    it('does not visit boolean items:false as a garbage node', () => {
      const visited: string[] = [];
      new JsonSchemaScanner({
        visitor: { enter: (e) => visited.push(e.path) },
      }).scan({ type: 'array', items: false });
      expect(visited).toEqual(['#']);
    });

    it('does not explode a non-object properties value into index entries', () => {
      const visited: string[] = [];
      new JsonSchemaScanner({
        visitor: { enter: (e) => visited.push(e.path) },
      }).scan({
        type: 'object',
        properties: 'abc',
      } as unknown as UnknownSchema);
      expect(visited).toEqual(['#']);
    });

    it('skips non-object composition elements but keeps object ones', () => {
      const visited: string[] = [];
      new JsonSchemaScanner({
        visitor: { enter: (e) => visited.push(e.path) },
      }).scan({
        allOf: [{ type: 'string' }, false, 'x'],
      } as unknown as UnknownSchema);
      expect(visited).toEqual(['#', '#/allOf/0']);
    });

    it('does not crash on null / primitive property values', () => {
      const visited: string[] = [];
      expect(() =>
        new JsonSchemaScanner({
          visitor: { enter: (e) => visited.push(e.path) },
        }).scan({
          type: 'object',
          properties: { a: null, b: 5, c: { type: 'string' } },
        } as unknown as UnknownSchema),
      ).not.toThrow();
      expect(visited).toEqual(['#', '#/properties/c']);
    });

    it('honors a mutate that returns a valid falsy schema (false)', () => {
      const out = new JsonSchemaScanner({
        options: {
          mutate: (e) => (e.path === '#/properties/a' ? false : undefined),
        },
      })
        .scan({ type: 'object', properties: { a: { type: 'string' } } })
        .getValue<UnknownSchema>()!;
      expect(out.properties.a).toBe(false);
    });
  });

  describe('documented reference behaviors (E4)', () => {
    it('resolves a $ref at the maxDepth boundary and inlines it whole', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: {
          A: { type: 'object', properties: { deep: { type: 'string' } } },
        },
      };
      let calls = 0;
      const out = new JsonSchemaScanner({
        options: {
          maxDepth: 1,
          resolveReference: (ref) => {
            calls++;
            return getValue(schema, ref);
          },
        },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(calls).toBe(1);
      expect(out.properties.x.properties.deep).toEqual({ type: 'string' });
    });

    it('unfolds a self-recursive schema one level and keeps the inner $ref', () => {
      const schema: UnknownSchema = {
        type: 'object',
        properties: { x: { $ref: '#/definitions/A' } },
        definitions: {
          A: {
            type: 'object',
            properties: { self: { $ref: '#/definitions/A' } },
          },
        },
      };
      const out = new JsonSchemaScanner({
        options: { resolveReference: (ref) => getValue(schema, ref) },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(out.properties.x.properties.self).toEqual({
        $ref: '#/definitions/A',
      });
    });
  });
});
