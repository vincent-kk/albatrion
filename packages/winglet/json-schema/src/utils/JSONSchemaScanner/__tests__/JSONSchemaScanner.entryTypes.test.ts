import { expect, expectTypeOf, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import type { Dialect, KeywordDescriptor } from '../../../keyword';
import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type {
  JSONScannerOptions,
  JSONScannerOptionsAsync,
  SchemaEntry,
} from '../utils/type';

it('exposes a read-only object-or-boolean schema and custom keyword/variant types', () => {
  expectTypeOf<Pick<SchemaEntry, 'schema'>>().toEqualTypeOf<{
    readonly schema: UnknownSchema | boolean;
  }>();
  expectTypeOf<SchemaEntry['keyword']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<SchemaEntry['variant']>().toEqualTypeOf<
    string | number | undefined
  >();
  expectTypeOf<SchemaEntry['inert']>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<SchemaEntry<{ type: 'string' }>['schema']>().toEqualTypeOf<
    { type: 'string' } | boolean
  >();
});

it('includes boolean in the default output type without an explicit generic argument', () => {
  const value = new JSONSchemaScanner().scan(false).getValue();
  expectTypeOf(value).toEqualTypeOf<UnknownSchema | boolean | undefined>();
  expect(value).toBe(false);
});

it('accepts readonly vocabularies, dialect restrictions and boolean mutation results in both drivers', async () => {
  const dialect: Dialect = 'draft-06';
  const keywords = [
    { keyword: 'custom', kind: 'schema', dialects: [dialect] },
  ] as const satisfies readonly KeywordDescriptor[];
  const syncOptions: JSONScannerOptions = {
    keywords,
    defaultDialect: dialect,
    mutate: () => false,
  };
  const asyncOptions: JSONScannerOptionsAsync = {
    keywords,
    defaultDialect: dialect,
    mutate: async () => false,
  };
  const sync = new JSONSchemaScanner({ options: syncOptions }).scan(true);
  const asyncScanner = new JSONSchemaScannerAsync({ options: asyncOptions });
  await asyncScanner.scan(true);
  expect(sync.getValue<boolean>()).toBe(false);
  expect(asyncScanner.getValue<boolean>()).toBe(false);
});

it('awaits asynchronous filter, mutate and visitor callbacks on boolean leaves', async () => {
  const calls: string[] = [];
  const scanner = new JSONSchemaScannerAsync({
    options: {
      filter: async (e) => {
        await Promise.resolve();
        calls.push('filter:' + e.path);
        return true;
      },
      mutate: async (e) => {
        await Promise.resolve();
        calls.push('mutate:' + e.path);
      },
    },
    visitor: {
      enter: async (e) => {
        await Promise.resolve();
        calls.push('enter:' + e.path);
      },
      exit: async (e) => {
        await Promise.resolve();
        calls.push('exit:' + e.path);
      },
    },
  });
  await scanner.scan(false);
  expect(calls).toEqual(['filter:#', 'mutate:#', 'enter:#', 'exit:#']);
});
