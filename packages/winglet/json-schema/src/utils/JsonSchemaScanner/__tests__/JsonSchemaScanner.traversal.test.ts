import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../sync/JsonSchemaScanner';
import { EXTENDED_KEYWORDS } from '../utils/keywordDescriptors';

/**
 * Guards for the keyword-map / own-key traversal strategy. Each test targets a
 * concrete hazard the strategy could reintroduce, so a regression trips here.
 */
describe('JsonSchemaScanner - traversal strategy invariants', () => {
  const depth1Keywords = (
    schema: UnknownSchema,
    options?: object,
  ): string[] => {
    const keywords: string[] = [];
    new JsonSchemaScanner({
      visitor: {
        enter: (e) => {
          if (e.depth === 1 && e.keyword) keywords.push(e.keyword);
        },
      },
      options,
    }).scan(schema);
    return keywords;
  };
  const visitedPaths = (schema: UnknownSchema, options?: object): string[] => {
    const paths: string[] = [];
    new JsonSchemaScanner({
      visitor: { enter: (e) => paths.push(e.path) },
      options,
    }).scan(schema);
    return paths;
  };

  it('R-A: emits children in descriptor order regardless of key insertion order', () => {
    // Keys inserted roughly REVERSE of descriptor order; sort must restore it.
    const schema: UnknownSchema = {
      properties: { pp: { type: 'string' } },
      items: { type: 'number' },
      oneOf: [{ type: 'boolean' }],
      anyOf: [{ type: 'null' }],
      allOf: [{ type: 'integer' }],
      else: { type: 'string' },
      then: { type: 'string' },
      if: { type: 'object' },
      not: { type: 'array' },
      additionalProperties: { type: 'string' },
      definitions: { D: { type: 'string' } },
      $defs: { E: { type: 'string' } },
    };
    expect(depth1Keywords(schema)).toEqual([
      '$defs',
      'definitions',
      'additionalProperties',
      'not',
      'if',
      'then',
      'else',
      'allOf',
      'anyOf',
      'oneOf',
      'items',
      'properties',
    ]);
  });

  it('R-A: two applicators alone still respect descriptor order (properties last)', () => {
    // properties (order 12) inserted first, allOf (order 7) second → allOf wins.
    const schema: UnknownSchema = {
      properties: { a: { type: 'string' } },
      allOf: [{ type: 'object' }],
    };
    expect(depth1Keywords(schema)).toEqual(['allOf', 'properties']);
  });

  it('R-B: inherited enumerable applicator keys are NOT traversed (own-only)', () => {
    const proto = { properties: { fromProto: { type: 'string' } } };
    const schema = Object.create(proto) as UnknownSchema;
    schema.type = 'object';
    schema.items = { type: 'number' };
    const paths = visitedPaths(schema);
    expect(paths).toContain('#/items');
    expect(paths).not.toContain('#/properties/fromProto');
  });

  it('R-C: non-enumerable own applicator keys are not traversed (cannot occur in JSON)', () => {
    const schema: UnknownSchema = { type: 'object' };
    Object.defineProperty(schema, 'properties', {
      value: { hidden: { type: 'string' } },
      enumerable: false,
    });
    expect(visitedPaths(schema)).not.toContain('#/properties/hidden');
  });

  it('R-D: a keyword re-declared via additionalKeywords is traversed once, not twice', () => {
    const paths = visitedPaths(
      { type: 'object', properties: { a: { type: 'string' } } },
      { additionalKeywords: [{ keyword: 'properties', kind: 'objectMap' }] },
    );
    expect(paths.filter((p) => p === '#/properties/a')).toHaveLength(1);
  });

  it('R-E: opted-in extended keywords are ordered after the built-in ones', () => {
    const order = depth1Keywords(
      {
        properties: { a: { type: 'string' } },
        patternProperties: { '^x': { type: 'number' } },
        contains: { type: 'string' },
      },
      { additionalKeywords: EXTENDED_KEYWORDS },
    );
    expect(order.indexOf('properties')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('properties')).toBeLessThan(
      order.indexOf('patternProperties'),
    );
    expect(order.indexOf('patternProperties')).toBeLessThan(
      order.indexOf('contains'),
    );
  });

  it('R-F: sibling nodes with multiple applicators do not contaminate each other', () => {
    const schema: UnknownSchema = {
      properties: {
        left: {
          allOf: [{ type: 'string' }],
          properties: { l: { type: 'string' } },
        },
        right: {
          properties: { r: { type: 'number' } },
          allOf: [{ type: 'object' }],
        },
      },
    };
    const paths = visitedPaths(schema);
    // both subtrees fully and independently visited, allOf before properties in each
    expect(paths).toContain('#/properties/left/allOf/0');
    expect(paths).toContain('#/properties/left/properties/l');
    expect(paths).toContain('#/properties/right/allOf/0');
    expect(paths).toContain('#/properties/right/properties/r');
    expect(paths.indexOf('#/properties/left/allOf/0')).toBeLessThan(
      paths.indexOf('#/properties/left/properties/l'),
    );
  });

  it('numeric property keys visit in Object.keys (numeric-ascending) order', () => {
    const schema: UnknownSchema = {
      type: 'object',
      properties: {
        '10': { type: 'string' },
        '2': { type: 'string' },
        '1': { type: 'string' },
      },
    };
    const paths = visitedPaths(schema).filter((p) =>
      p.startsWith('#/properties/'),
    );
    expect(paths).toEqual([
      '#/properties/1',
      '#/properties/2',
      '#/properties/10',
    ]);
  });

  it('an array subschema value is visited as a leaf without crashing', () => {
    const schema = {
      type: 'object',
      properties: { a: [1, 2, 3] },
    } as unknown as UnknownSchema;
    let paths: string[] = [];
    expect(() => {
      paths = visitedPaths(schema);
    }).not.toThrow();
    expect(paths).toContain('#/properties/a');
  });

  it('a boolean / primitive root schema is visited once with no children', () => {
    const enter = vi.fn();
    expect(() =>
      new JsonSchemaScanner({ visitor: { enter } }).scan(
        false as unknown as UnknownSchema,
      ),
    ).not.toThrow();
    expect(enter).toHaveBeenCalledTimes(1);
  });
});
