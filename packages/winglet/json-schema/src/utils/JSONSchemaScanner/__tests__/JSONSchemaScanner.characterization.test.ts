import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { SchemaEntry, SchemaVisitor } from '../utils/type';

/** Structural test surface avoids combining the drivers' unrelated private state and explicit this types. */
type ScannerConstructor = new (config: { visitor: SchemaVisitor }) => {
  scan(schema: UnknownSchema): unknown;
};

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s scanner characterization', (_name, Scanner) => {
  it('passes the same distinct entry to enter and exit for every node', async () => {
    const entered = new Map<string, SchemaEntry>();
    const exited: string[] = [];
    const scanner = new Scanner({
      visitor: {
        enter: (entry) => {
          expect([...entered.values()]).not.toContain(entry);
          entered.set(entry.path, entry);
        },
        exit: (entry) => {
          expect(entry).toBe(entered.get(entry.path));
          exited.push(entry.path);
        },
      },
    });
    await scanner.scan({
      properties: {
        first: { properties: { leaf: { type: 'string' } } },
        second: { type: 'number' },
      },
    });
    expect(entered.size).toBe(4);
    expect(exited).toEqual([
      '#/properties/first/properties/leaf',
      '#/properties/first',
      '#/properties/second',
      '#',
    ]);
  });

  it('captures sibling objects after parent enter and before the first child enter', async () => {
    const original = { type: 'number' };
    const captured = { type: 'boolean' };
    const removed = { type: 'null' };
    const schema: UnknownSchema = {
      properties: {
        first: { type: 'string' },
        second: original,
        third: removed,
      },
    };
    const visited = new Map<string, UnknownSchema | boolean>();
    await new Scanner({
      visitor: {
        enter: (entry) => {
          visited.set(entry.path, entry.schema);
          if (entry.path === '#') schema.properties.second = captured;
          if (entry.path === '#/properties/first') {
            schema.properties.second = { type: 'integer' };
            delete schema.properties.third;
            schema.properties.late = { type: 'object' };
          }
        },
      },
    }).scan(schema);
    expect([...visited.keys()]).toEqual([
      '#',
      '#/properties/first',
      '#/properties/second',
      '#/properties/third',
    ]);
    expect(visited.get('#/properties/second')).toBe(captured);
    expect(visited.get('#/properties/second')).not.toBe(original);
    expect(visited.get('#/properties/third')).toBe(removed);
  });

  it('uses own property key order with numeric keys first and escaped paths', async () => {
    const properties = Object.assign(
      Object.create({ inherited: { type: 'null' } }),
      {
        z: { type: 'string' },
        '10': { type: 'number' },
        '2': { type: 'integer' },
        'a/b': { type: 'boolean' },
        'c~d': { type: 'object' },
        '01': { type: 'array' },
      },
    );
    const paths: string[] = [];
    await new Scanner({
      visitor: { enter: (entry) => paths.push(entry.path) },
    }).scan({ properties });
    expect(paths).toEqual([
      '#',
      '#/properties/2',
      '#/properties/10',
      '#/properties/z',
      '#/properties/a~1b',
      '#/properties/c~0d',
      '#/properties/01',
    ]);
  });
});
