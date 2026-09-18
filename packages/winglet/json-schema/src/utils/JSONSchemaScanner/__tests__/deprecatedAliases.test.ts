// Deprecated alias coverage — Removed in 0.16.0 together with the aliases.
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { JSONSchema, JsonSchema } from '@/json-schema/types/jsonSchema';

import {
  type JSONScannerOptions as RootJSONScannerOptions,
  type JSONScannerOptionsAsync as RootJSONScannerOptionsAsync,
  JSONSchemaScanner as RootJSONSchemaScanner,
  JSONSchemaScannerAsync as RootJSONSchemaScannerAsync,
  type JsonScannerOptions as RootJsonScannerOptions,
  type JsonScannerOptionsAsync as RootJsonScannerOptionsAsync,
  JsonSchemaScanner as RootJsonSchemaScanner,
  JsonSchemaScannerAsync as RootJsonSchemaScannerAsync,
} from '../../../index';
import {
  type JSONScannerOptionsAsync,
  JSONSchemaScannerAsync,
  type JsonScannerOptionsAsync,
  JsonSchemaScannerAsync,
} from '../async';
import {
  type JSONScannerOptions,
  JSONSchemaScanner,
  type JsonScannerOptions,
  JsonSchemaScanner,
} from '../sync';

describe('deprecated aliases', () => {
  it('JsonSchemaScanner is the same reference as JSONSchemaScanner', () => {
    expect(JsonSchemaScanner).toBe(JSONSchemaScanner);
    expect(RootJsonSchemaScanner).toBe(RootJSONSchemaScanner);
  });

  it('JsonSchemaScannerAsync is the same reference as JSONSchemaScannerAsync', () => {
    expect(JsonSchemaScannerAsync).toBe(JSONSchemaScannerAsync);
    expect(RootJsonSchemaScannerAsync).toBe(RootJSONSchemaScannerAsync);
  });

  it('JsonSchema is bidirectionally assignable with JSONSchema', () => {
    expectTypeOf<JsonSchema>().toExtend<JSONSchema>();
    expectTypeOf<JSONSchema>().toExtend<JsonSchema>();
  });

  it('JsonScannerOptions is bidirectionally assignable with JSONScannerOptions', () => {
    expectTypeOf<JsonScannerOptions>().toExtend<JSONScannerOptions>();
    expectTypeOf<JSONScannerOptions>().toExtend<JsonScannerOptions>();
    expectTypeOf<RootJsonScannerOptions>().toExtend<RootJSONScannerOptions>();
    expectTypeOf<RootJSONScannerOptions>().toExtend<RootJsonScannerOptions>();
  });

  it('JsonScannerOptionsAsync is bidirectionally assignable with JSONScannerOptionsAsync', () => {
    expectTypeOf<JsonScannerOptionsAsync>().toExtend<JSONScannerOptionsAsync>();
    expectTypeOf<JSONScannerOptionsAsync>().toExtend<JsonScannerOptionsAsync>();
    expectTypeOf<RootJsonScannerOptionsAsync>().toExtend<RootJSONScannerOptionsAsync>();
    expectTypeOf<RootJSONScannerOptionsAsync>().toExtend<RootJsonScannerOptionsAsync>();
  });
});
