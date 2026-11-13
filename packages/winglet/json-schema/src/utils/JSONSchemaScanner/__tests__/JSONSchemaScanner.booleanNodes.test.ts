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
])('%s boolean leaves', (_name, Scanner) => {
  it('visits booleans in single, list, items and map positions but never arrays as schemas', async () => {
    const paths: string[] = [];
    const scanner = new Scanner({
      visitor: {
        enter: (e) => {
          paths.push(e.path);
        },
      },
    });
    await scanner.scan({
      not: false,
      allOf: [true, [], null, 3],
      prefixItems: [false],
      items: true,
      properties: { yes: true, no: false, junk: [] },
      dependencies: { schema: false, names: ['a'] },
    } as unknown as UnknownSchema);
    expect(paths).toEqual([
      '#',
      '#/not',
      '#/allOf/0',
      '#/prefixItems/0',
      '#/items',
      '#/properties/yes',
      '#/properties/no',
      '#/dependencies/schema',
    ]);
  });

  it('runs all four callbacks in order for a boolean leaf', async () => {
    const calls: string[] = [];
    const scanner = new Scanner({
      options: {
        filter: (e) => {
          calls.push('filter:' + e.path);
          return true;
        },
        mutate: (e) => {
          calls.push('mutate:' + e.path);
        },
      },
      visitor: {
        enter: (e) => {
          calls.push('enter:' + e.path);
        },
        exit: (e) => {
          calls.push('exit:' + e.path);
        },
      },
    });
    await scanner.scan({ items: false });
    expect(calls).toEqual([
      'filter:#',
      'mutate:#',
      'enter:#',
      'filter:#/items',
      'mutate:#/items',
      'enter:#/items',
      'exit:#/items',
      'exit:#',
    ]);
  });

  it('allows boolean mutation results and filters boolean nodes before other callbacks', async () => {
    const seen: string[] = [];
    const scanner = new Scanner({
      options: {
        filter: (e) => e.schema !== true,
        mutate: (e) => (e.schema === false ? { type: 'null' } : undefined),
      },
      visitor: {
        enter: (e) => {
          seen.push(e.path);
        },
      },
    });
    await scanner.scan({ properties: { yes: true, no: false } });
    expect(seen).toEqual(['#', '#/properties/no']);
    expect(scanner.getValue()).toEqual({
      properties: { yes: true, no: { type: 'null' } },
    });
  });

  it('accepts a boolean root and preserves its cached output', async () => {
    const seen: boolean[] = [];
    const scanner = new Scanner({
      visitor: {
        enter: (e) => {
          if (typeof e.schema === 'boolean') seen.push(e.schema);
        },
      },
    });
    await scanner.scan(false);
    expect(seen).toEqual([false]);
    expect(scanner.getValue()).toBe(false);
    expect(scanner.getValue()).toBe(false);
  });
});
