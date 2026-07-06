import { getValue } from '@winglet/json/pointer';
import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScannerAsync } from '../async/JsonSchemaScannerAsync';
import { JsonSchemaScanner } from '../sync/JsonSchemaScanner';
import { EXTENDED_KEYWORDS } from '../utils/keywordDescriptors';

describe('JsonSchemaScanner - extensions', () => {
  describe('additionalKeywords (E1) — opt-in, non-breaking', () => {
    const schema: UnknownSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      patternProperties: { '^x-': { type: 'number' } },
      propertyNames: { pattern: '^[a-z]+$' },
      contains: { type: 'boolean' },
      dependentSchemas: { a: { required: ['b'] } },
      unevaluatedProperties: { type: 'null' },
    };

    const visitedPaths = (options?: object) => {
      const paths: string[] = [];
      new JsonSchemaScanner({
        visitor: { enter: (e) => paths.push(e.path) },
        options,
      }).scan(schema);
      return paths;
    };

    it('does NOT traverse extended keywords by default', () => {
      const paths = visitedPaths();
      expect(paths).toEqual(['#', '#/properties/a']);
    });

    it('traverses extended keywords when EXTENDED_KEYWORDS is opted in', () => {
      const paths = visitedPaths({ additionalKeywords: EXTENDED_KEYWORDS });
      expect(paths).toContain('#/patternProperties/^x-');
      expect(paths).toContain('#/propertyNames');
      expect(paths).toContain('#/contains');
      expect(paths).toContain('#/dependentSchemas/a');
      expect(paths).toContain('#/unevaluatedProperties');
    });

    it('supports a custom vendor keyword descriptor', () => {
      const seen: Array<{ path: string; keyword: unknown }> = [];
      new JsonSchemaScanner({
        visitor: {
          enter: (e) => seen.push({ path: e.path, keyword: e.keyword }),
        },
        options: {
          additionalKeywords: [{ keyword: 'x-widget', kind: 'schema' }],
        },
      }).scan({
        type: 'object',
        'x-widget': { format: 'slider' },
      } as unknown as UnknownSchema);
      expect(seen).toContainEqual({ path: '#/x-widget', keyword: 'x-widget' });
    });

    it('keeps default properties traversal unchanged when extending', () => {
      const paths = visitedPaths({ additionalKeywords: EXTENDED_KEYWORDS });
      expect(paths[0]).toBe('#');
      expect(paths).toContain('#/properties/a');
    });
  });

  describe('cacheResolvedReference (P3) — opt-in memoization', () => {
    const schema: UnknownSchema = {
      type: 'object',
      properties: {
        x: { $ref: '#/definitions/A' },
        y: { $ref: '#/definitions/A' },
        z: { $ref: '#/definitions/A' },
      },
      definitions: { A: { type: 'string' } },
    };

    it('calls the resolver once per occurrence by default', () => {
      let calls = 0;
      new JsonSchemaScanner({
        options: {
          resolveReference: (ref) => {
            calls++;
            return getValue(schema, ref);
          },
        },
      })
        .scan(schema)
        .getValue();
      expect(calls).toBe(3);
    });

    it('memoizes repeated references when enabled, output still un-aliased', () => {
      let calls = 0;
      const out = new JsonSchemaScanner({
        options: {
          cacheResolvedReference: true,
          resolveReference: (ref) => {
            calls++;
            return getValue(schema, ref);
          },
        },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(calls).toBe(1);
      expect(out.properties.x).toEqual({ type: 'string' });
      expect(out.properties.x).not.toBe(out.properties.y);
    });

    it('deduplicates the resolver under async too', async () => {
      let calls = 0;
      const scanner = new JsonSchemaScannerAsync({
        options: {
          cacheResolvedReference: true,
          resolveReference: async (ref) => {
            calls++;
            return getValue(schema, ref);
          },
        },
      });
      await scanner.scan(schema);
      expect(calls).toBe(1);
    });
  });

  describe('referenceSkipped reason (E3)', () => {
    it('marks a $ref with no resolver configured as "unresolved" (not "definition")', () => {
      const reasons: Array<[string, unknown]> = [];
      new JsonSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.hasReference) reasons.push([e.path, e.referenceSkipped]);
          },
        },
      }).scan({ type: 'object', properties: { x: { $ref: '#/whatever' } } });
      expect(reasons).toContainEqual(['#/properties/x', 'unresolved']);
    });

    it('marks a resolver-returned-nothing skip as "unresolved"', () => {
      const reasons: Array<[string, unknown]> = [];
      new JsonSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.hasReference) reasons.push([e.path, e.referenceSkipped]);
          },
        },
        options: { resolveReference: () => undefined },
      }).scan({ type: 'object', properties: { x: { $ref: '#/nope' } } });
      expect(reasons).toContainEqual(['#/properties/x', 'unresolved']);
    });

    it('marks an in-definitions $ref as "definition" and a cycle as "cycle"', () => {
      const reasons = new Map<string, unknown>();
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
      new JsonSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.hasReference) reasons.set(e.path, e.referenceSkipped);
          },
        },
        options: { resolveReference: (ref) => getValue(schema, ref) },
      }).scan(schema);
      // The $ref inside definitions is intentionally left as a definition,
      // while the inlined copy that re-references A is a cycle.
      expect(reasons.get('#/definitions/A/properties/self')).toBe('definition');
      expect(reasons.get('#/properties/x/properties/self')).toBe('cycle');
    });
  });
});
