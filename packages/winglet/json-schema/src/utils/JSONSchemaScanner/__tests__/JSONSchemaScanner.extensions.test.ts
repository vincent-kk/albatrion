import { getValue } from '@winglet/json/pointer';
import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import { createTestResolver } from './fixtures/createTestResolver';

describe('JSONSchemaScanner - extensions', () => {
  describe('built-in and custom vocabulary', () => {
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
      new JSONSchemaScanner({
        visitor: { enter: (e) => paths.push(e.path) },
        options,
      }).scan(schema);
      return paths;
    };

    it('traverses the union vocabulary by default', () => {
      const paths = visitedPaths();
      expect(paths).toEqual([
        '#',
        '#/properties/a',
        '#/patternProperties/^x-',
        '#/dependentSchemas/a',
        '#/propertyNames',
        '#/contains',
        '#/unevaluatedProperties',
      ]);
    });

    it('uses keywords to replace the built-in vocabulary', () => {
      const paths = visitedPaths({
        keywords: [{ keyword: 'properties', kind: 'objectMap' }],
      });
      expect(paths).toEqual(['#', '#/properties/a']);
    });

    it('supports a custom vendor keyword descriptor', () => {
      const seen: Array<{ path: string; keyword: unknown }> = [];
      new JSONSchemaScanner({
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
      const paths = visitedPaths({
        additionalKeywords: [{ keyword: 'vendor', kind: 'schema' }],
      });
      expect(paths[0]).toBe('#');
      expect(paths).toContain('#/properties/a');
    });
  });

  describe('custom provider calls', () => {
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
      new JSONSchemaScanner({
        options: {
          resolveReference: createTestResolver((ref) => {
            calls++;
            return getValue(schema, ref);
          }),
        },
      })
        .scan(schema)
        .getValue();
      expect(calls).toBe(3);
    });

    it('calls each custom occurrence while keeping output unaliased', () => {
      let calls = 0;
      const out = new JSONSchemaScanner({
        options: {
          resolveReference: createTestResolver((ref) => {
            calls++;
            return getValue(schema, ref);
          }),
        },
      })
        .scan(schema)
        .getValue<UnknownSchema>()!;
      expect(calls).toBe(3);
      expect(out.properties.x).toEqual({ type: 'string' });
      expect(out.properties.x).not.toBe(out.properties.y);
    });

    it('calls each custom async occurrence', async () => {
      let calls = 0;
      const scanner = new JSONSchemaScannerAsync({
        options: {
          resolveReference: createTestResolver(async (ref) => {
            calls++;
            return getValue(schema, ref);
          }),
        },
      });
      await scanner.scan(schema);
      expect(calls).toBe(3);
    });
  });

  describe('reference preservation reasons (E3)', () => {
    it('marks a $ref with no resolver configured as "unresolved" (not "definition")', () => {
      const reasons: Array<[string, unknown]> = [];
      new JSONSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.references?.some((outcome) => !outcome.resolved))
              reasons.push([e.path, e.references?.slice(-1)[0]?.skipped]);
          },
        },
      }).scan({ type: 'object', properties: { x: { $ref: '#/whatever' } } });
      expect(reasons).toContainEqual(['#/properties/x', 'unresolved']);
    });

    it('marks a resolver-returned-nothing skip as "unresolved"', () => {
      const reasons: Array<[string, unknown]> = [];
      new JSONSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.references?.some((outcome) => !outcome.resolved))
              reasons.push([e.path, e.references?.slice(-1)[0]?.skipped]);
          },
        },
        options: { resolveReference: createTestResolver(() => undefined) },
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
      new JSONSchemaScanner({
        visitor: {
          exit: (e) => {
            if (e.references?.some((outcome) => !outcome.resolved))
              reasons.set(e.path, e.references?.slice(-1)[0]?.skipped);
          },
        },
        options: {
          resolveReference: createTestResolver((ref) => getValue(schema, ref)),
        },
      }).scan(schema);
      // The $ref inside definitions is intentionally left as a definition,
      // while the inlined copy that re-references A is a cycle.
      expect(reasons.get('#/definitions/A/properties/self')).toBe('definition');
      expect(reasons.get('#/properties/x/properties/self')).toBe('cycle');
    });
  });
});
