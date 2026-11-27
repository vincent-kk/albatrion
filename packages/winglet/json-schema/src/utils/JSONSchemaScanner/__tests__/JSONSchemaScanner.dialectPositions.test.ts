import { describe, expect, it } from 'vitest';

import type { Dialect } from '../../../keyword';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { SchemaEntry } from '../utils/type';

/** Explicit dialect rows pin the complete vocabulary independently of descriptor masks. */
const positions = [
  ['$defs', 'schemaMap'],
  ['definitions', 'schemaMap'],
  ['additionalProperties', 'schema'],
  ['not', 'schema'],
  ['if', 'schema'],
  ['then', 'schema'],
  ['else', 'schema'],
  ['allOf', 'schemaList'],
  ['anyOf', 'schemaList'],
  ['oneOf', 'schemaList'],
  ['prefixItems', 'items'],
  ['items', 'items'],
  ['properties', 'objectMap'],
  ['patternProperties', 'schemaMap'],
  ['dependentSchemas', 'schemaMap'],
  ['propertyNames', 'schema'],
  ['contains', 'schema'],
  ['additionalItems', 'schema'],
  ['unevaluatedProperties', 'schema'],
  ['unevaluatedItems', 'schema'],
  ['contentSchema', 'schema'],
  ['dependencies', 'schemaMap'],
] as const;

describe.each<[Dialect, readonly string[]]>([
  [
    'draft-04',
    [
      '$defs',
      'if',
      'then',
      'else',
      'prefixItems',
      'dependentSchemas',
      'propertyNames',
      'contains',
      'unevaluatedProperties',
      'unevaluatedItems',
      'contentSchema',
    ],
  ],
  [
    'draft-06',
    [
      '$defs',
      'if',
      'then',
      'else',
      'prefixItems',
      'dependentSchemas',
      'unevaluatedProperties',
      'unevaluatedItems',
      'contentSchema',
    ],
  ],
  [
    'draft-07',
    [
      '$defs',
      'prefixItems',
      'dependentSchemas',
      'unevaluatedProperties',
      'unevaluatedItems',
      'contentSchema',
    ],
  ],
  ['2019-09', ['prefixItems']],
  ['2020-12', ['additionalItems']],
])('%s schema positions', (dialect, inactive) => {
  it('visits all 22 object positions with exact metadata and dialect inertness', () => {
    const schema: Record<string, unknown> = {};
    for (const [keyword, kind] of positions)
      schema[keyword] =
        kind === 'schemaMap' || kind === 'objectMap'
          ? { 'a/b~': {} }
          : kind === 'schemaList' || keyword === 'prefixItems'
            ? [{}]
            : {};
    const entries: SchemaEntry[] = [];
    new JSONSchemaScanner({
      options: { defaultDialect: dialect },
      visitor: {
        enter: (e) => {
          if (e.depth) entries.push(e);
        },
      },
    }).scan(schema);
    expect(
      entries.map((e) => ({
        path: e.path,
        dataPath: e.dataPath,
        keyword: e.keyword,
        variant: e.variant,
        depth: e.depth,
        inert: !!e.inert,
      })),
    ).toEqual(
      positions.map(([keyword, kind]) => {
        const map = kind === 'schemaMap' || kind === 'objectMap';
        const list = kind === 'schemaList' || keyword === 'prefixItems';
        return {
          path: '#/' + keyword + (map ? '/a~1b~0' : list ? '/0' : ''),
          dataPath:
            kind === 'objectMap'
              ? '/a~1b~0'
              : keyword === 'prefixItems'
                ? '/0'
                : '',
          keyword,
          variant: map ? 'a/b~' : list ? 0 : undefined,
          depth: 1,
          inert: inactive.includes(keyword),
        };
      }),
    );
  });

  it('marks tuple items by dialect and draft-04 boolean values as inert without visiting dependency arrays', () => {
    const seen: Array<[string, boolean]> = [];
    new JSONSchemaScanner({
      options: { defaultDialect: dialect },
      visitor: {
        enter: (e) => {
          if (e.depth) seen.push([e.path, !!e.inert]);
        },
      },
    }).scan({
      items: [false, {}],
      additionalProperties: false,
      additionalItems: true,
      dependencies: { object: {}, names: ['a'] },
      definitions: { D: {} },
    });
    expect(seen).toEqual([
      ['#/definitions/D', false],
      ['#/additionalProperties', dialect === 'draft-04'],
      ['#/items/0', dialect === 'draft-04' || dialect === '2020-12'],
      ['#/items/1', dialect === '2020-12'],
      ['#/additionalItems', dialect === 'draft-04' || dialect === '2020-12'],
      ['#/dependencies/object', false],
    ]);
  });
  it('visits boolean leaves in all union positions with dialect-specific inertness', () => {
    const schema: Record<string, unknown> = {};
    for (const [keyword, kind] of positions)
      schema[keyword] =
        kind === 'schemaMap' || kind === 'objectMap'
          ? { key: false }
          : kind === 'schemaList' || keyword === 'prefixItems'
            ? [false]
            : false;
    const seen: Array<[string | undefined, boolean]> = [];
    new JSONSchemaScanner({
      options: { defaultDialect: dialect },
      visitor: {
        enter: (e) => {
          if (e.depth) seen.push([e.keyword, !!e.inert]);
        },
      },
    }).scan(schema);
    expect(seen).toEqual(
      positions.map(([keyword]) => [
        keyword,
        dialect === 'draft-04' || inactive.includes(keyword),
      ]),
    );
  });
});
