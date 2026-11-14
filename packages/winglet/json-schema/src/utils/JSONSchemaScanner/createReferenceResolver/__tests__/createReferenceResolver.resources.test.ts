import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { assertEquivalent } from './fixtures/assertEquivalent';
import { scan } from './fixtures/scan';

describe('resource scopes and reference keyword dialects', () => {
  it('resolves the Core 8.2.1 base cases from root and nested identifiers', () => {
    const schema = {
      $id: 'https://example.com/root.json',
      $defs: {
        A: { $id: 'other.json', $anchor: 'bar', type: 'string' },
        B: { $id: 'https://example.com/another.json', type: 'number' },
      },
      properties: {
        a: { $ref: 'other.json#bar' },
        b: { $ref: 'another.json' },
      },
    };
    const { output } = scan(schema);
    expect(output.properties.a.type).toBe('string');
    expect(output.properties.b.type).toBe('number');
    assertEquivalent(schema, output, [
      { a: 'a', b: 2 },
      { a: 2, b: 'a' },
    ]);
  });
  it('recognizes draft-04 id fragments within the correct nested base', () => {
    const schema = {
      id: 'https://e.test/root',
      definitions: {
        A: {
          id: 'child',
          definitions: { T: { id: '#Node', type: 'string' } },
          properties: { x: { $ref: '#Node' } },
        },
      },
      properties: { a: { $ref: 'child' } },
    };
    expect(
      scan(schema, {}, { defaultDialect: 'draft-04' }).output.properties.a
        .properties.x,
    ).toEqual({ type: 'string' });
  });
  it('rejects identifier collisions regardless of integer-key construction order', () => {
    for (const keys of [
      ['2', '1'],
      ['1', '2'],
    ]) {
      const $defs = Object.fromEntries(
        keys.map((key) => [key, { $id: 'https://e.test/duplicate' }]),
      );
      expect(() => createReferenceResolver({ $defs })).toThrowError(
        expect.objectContaining({
          code: 'duplicate-identifier',
          message: expect.stringMatching(/\$defs\/1.*\$defs\/2/),
        }),
      );
    }
  });
  it('rejects one identifier declared at two paths even when the input objects alias', () => {
    const target = { $id: 'https://e.test/duplicate', type: 'string' };
    expect(() =>
      createReferenceResolver({ $defs: { A: target, B: target } }),
    ).toThrowError(
      expect.objectContaining({
        code: 'duplicate-identifier',
        message: expect.stringMatching(/\$defs\/A.*\$defs\/B/),
      }),
    );
  });
  it('does not index identifiers below a dialect-inert applicator', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      id: 'https://e.test/root',
      contains: { id: 'https://e.test/hidden', type: 'string' },
      properties: { a: { $ref: 'https://e.test/hidden' } },
    };
    expect(scan(schema).outcomes.get('#/properties/a')).toMatchObject([
      { skipped: 'unresolved' },
    ]);
  });
  it('accepts same-location static and dynamic aliases but preserves a dynamic lookup', () => {
    const schema = {
        $defs: {
          T: { $anchor: 'Node', $dynamicAnchor: 'Node', type: 'string' },
        },
      },
      r = createReferenceResolver(schema),
      context = r.root(schema);
    expect(r.resolve('#Node', '$ref', context)).toMatchObject({
      status: 'resolved',
      uri: '#/$defs/T',
    });
    expect(r.resolve('#Node', '$dynamicRef', context)).toMatchObject({
      status: 'skipped',
      reason: 'dynamic',
      uri: '#/$defs/T',
    });
  });
  it('inlines a static dynamicRef target and retains a recursive dynamic target', () => {
    const schema = {
      $defs: { T: { $anchor: 'Node', type: 'string' } },
      properties: { a: { $dynamicRef: '#Node' } },
    };
    const { output } = scan(schema);
    expect(output.properties.a).toEqual({ type: 'string' });
    expect(new Ajv2020({ strict: false }).compile(output)({ a: 1 })).toBe(
      false,
    );
    // Ajv falls back to the root for static $dynamicRef; the static-$ref oracle follows Core 8.2.3.2.
    assertEquivalent(
      { ...schema, properties: { a: { $ref: '#Node' } } },
      output,
      [{ a: 's' }, { a: 1 }],
    );
    const recursive = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      $recursiveAnchor: true,
      properties: { a: { $recursiveRef: '#' } },
    };
    expect(scan(recursive).outcomes.get('#/properties/a')).toMatchObject([
      { skipped: 'dynamic' },
    ]);
  });
  it('reuses target/host templates while isolating each materialized occurrence', () => {
    const schema = {
        $defs: { T: { type: 'object' } },
        properties: { a: { $ref: '#/$defs/T' }, b: { $ref: '#/$defs/T' } },
      },
      r = createReferenceResolver(schema),
      context = r.root(schema);
    expect(r.resolve('#/$defs/T', '$ref', context)).toBe(
      r.resolve('#/$defs/T', '$ref', context),
    );
    const { output } = scan(schema);
    expect(output.properties.a).not.toBe(output.properties.b);
    expect(output.properties.a).not.toBe(schema.$defs.T);
  });
});
