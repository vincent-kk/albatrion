import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { JSONScannerOptions, SchemaVisitor } from '../type';

/** Driver-independent constructor avoids intersecting private class state in shared tests. */
type ScannerConstructor = new (config: {
  options?: JSONScannerOptions;
  visitor?: SchemaVisitor;
}) => { scan(schema: UnknownSchema | boolean): unknown; getValue(): unknown };

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s dialect resources and roles', (_name, Scanner) => {
  it('recognizes normalized metaschema URIs only at resource roots and restores sibling dialects', async () => {
    const seen: Array<[string, boolean]> = [];
    const scanner = new Scanner({
      options: { defaultDialect: 'draft-07' },
      visitor: {
        enter: (e) => {
          if (e.keyword === 'if' || e.keyword === 'prefixItems')
            seen.push([e.path, !!e.inert]);
        },
      },
    });
    await scanner.scan({
      $schema: 'https://json-schema.org/draft-04/schema#',
      properties: {
        nonResource: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          if: {},
        },
        embedded: {
          id: 'child',
          $schema: 'http://json-schema.org/draft/2020-12/schema#',
          prefixItems: [{}],
        },
        inherited: { id: 'inherited', if: {} },
        unknown: {
          id: 'unknown',
          $schema: 'https://example.test/meta',
          if: {},
        },
        dollar: {
          $id: 'next',
          $schema: 'https://json-schema.org/draft-07/schema#',
          if: {},
        },
      },
    });
    expect(seen).toEqual([
      ['#/properties/nonResource/if', true],
      ['#/properties/embedded/prefixItems/0', false],
      ['#/properties/inherited/if', true],
      ['#/properties/unknown/if', true],
      ['#/properties/dollar/if', false],
    ]);
  });

  it('inherits inertness and records no output operations or reference calls there', async () => {
    const original = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      prefixItems: [
        {
          $id: 'child',
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          properties: { child: { $ref: '#/target' } },
        },
      ],
    };
    const seen: string[] = [];
    let resolves = 0;
    const scanner = new Scanner({
      options: {
        mutate: (e) =>
          e.inert
            ? {
                ...(typeof e.schema === 'object' ? e.schema : {}),
                title: 'inert replacement',
              }
            : undefined,
        resolveReference: () => {
          resolves++;
          return { type: 'null' };
        },
      },
      visitor: {
        enter: (e) => {
          if (e.inert) seen.push(e.path);
        },
      },
    });
    await scanner.scan(original);
    expect(seen).toEqual([
      '#/prefixItems/0',
      '#/prefixItems/0/properties/child',
    ]);
    expect(resolves).toBe(0);
    expect(scanner.getValue() === original).toBe(true);
  });

  it('derives definition role from actual keyword frames including custom maps and escaped lookalike names', async () => {
    const calls: string[] = [];
    const skips: Array<[string, unknown]> = [];
    const scanner = new Scanner({
      options: {
        additionalKeywords: [{ keyword: 'vendor', kind: 'schemaMap' }],
        resolveReference: (ref) => {
          calls.push(ref);
          return { type: 'null' };
        },
      },
      visitor: {
        exit: (e) => {
          if (e.hasReference) skips.push([e.path, e.referenceSkipped]);
        },
      },
    });
    await scanner.scan({
      definitions: { A: { properties: { deep: { $ref: '#definition' } } } },
      properties: {
        definitions: { $ref: '#property' },
        $defs: { $ref: '#dollar' },
      },
      vendor: {
        definitions: { properties: { deep: { $ref: '#vendor' } } },
        'a/b': { $ref: '#escaped' },
      },
    });
    expect(calls).toEqual(['#property', '#dollar', '#vendor', '#escaped']);
    expect(skips).toEqual([['#/definitions/A/properties/deep', 'definition']]);
  });

  it('replaces the vocabulary, appends overrides and escapes custom keyword path segments', async () => {
    const seen: Array<[string, string, unknown]> = [];
    const scanner = new Scanner({
      options: {
        keywords: [
          { keyword: 'x/a~b', kind: 'schemaMap', dialects: ['draft-04'] },
        ],
        additionalKeywords: [{ keyword: 'x/a~b', kind: 'objectMap' }],
      },
      visitor: {
        enter: (e) => {
          if (e.depth) seen.push([e.path, e.dataPath, e.variant]);
        },
      },
    });
    await scanner.scan({
      properties: { ignored: {} },
      'x/a~b': { 'c/d~': false },
    });
    expect(seen).toEqual([['#/x~1a~0b/c~1d~0', '/c~1d~0', 'c/d~']]);
  });
  it('supports an empty replacement vocabulary without discovering built-in children', async () => {
    const paths: string[] = [];
    const scanner = new Scanner({
      options: { keywords: [] },
      visitor: {
        enter: (e) => {
          paths.push(e.path);
        },
      },
    });
    await scanner.scan({ properties: { child: {} }, not: false });
    expect(paths).toEqual(['#']);
  });
});
