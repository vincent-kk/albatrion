import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { KeywordDescriptor } from '../../../keyword';
import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { SchemaEntry, SchemaVisitor } from '../utils/type';

/** Shared driver surface for checking vocabulary order across bit-word boundaries. */
type ScannerConstructor = new (config: {
  visitor: SchemaVisitor;
  options: { additionalKeywords: KeywordDescriptor[] };
}) => { scan(schema: UnknownSchema): unknown };

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s scanner vocabulary ordering', (_name, Scanner) => {
  it('snapshots parent schema and path metadata before reading applicator getters', async () => {
    let parent: SchemaEntry;
    const trace: unknown[] = [];
    const schema: UnknownSchema = {
      get not() {
        // @ts-expect-error — malicious runtime mutation exercises capture stability beyond the readonly contract.
        parent.schema = { type: 'null' };
        parent.path = '#/changed';
        parent.dataPath = '/changed';
        parent.depth = 9;
        return { type: 'number' };
      },
      properties: { child: { type: 'string' } },
    };
    await new Scanner({
      options: { additionalKeywords: [] },
      visitor: {
        enter: (entry) => {
          trace.push([entry.path, entry.dataPath, entry.depth]);
          if (entry.depth === 0) parent = entry;
        },
      },
    }).scan(schema);
    expect(trace).toEqual([
      ['#', '', 0],
      ['#/not', '', 1],
      ['#/properties/child', '/child', 1],
    ]);
  });

  it('keeps descriptor order beyond 32 and 64 positions across sibling frames', async () => {
    const keywords: KeywordDescriptor[] = Array.from(
      { length: 70 },
      (_, index) => ({
        keyword: `x-${index}`,
        kind: 'schema',
      }),
    );
    const child: UnknownSchema = {};
    for (let index = 69; index >= 0; index--)
      child[`x-${index}`] = { type: 'string' };
    const paths: string[] = [];
    await new Scanner({
      options: { additionalKeywords: keywords },
      visitor: { enter: (entry) => paths.push(entry.path) },
    }).scan({ properties: { first: child, second: { type: 'number' } } });
    expect(paths).toEqual([
      '#',
      '#/properties/first',
      ...keywords.map(({ keyword }) => `#/properties/first/${keyword}`),
      '#/properties/second',
    ]);
  });

  it('visits an overridden keyword only once at its final descriptor position', async () => {
    const paths: string[] = [];
    await new Scanner({
      options: {
        additionalKeywords: [
          { keyword: 'properties', kind: 'schemaMap' },
          { keyword: 'x-first', kind: 'schema' },
          { keyword: 'properties', kind: 'schema' },
        ],
      },
      visitor: { enter: (entry) => paths.push(entry.path) },
    }).scan({ properties: { type: 'object' }, 'x-first': { type: 'string' } });
    expect(paths).toEqual(['#', '#/x-first', '#/properties']);
  });
});
