/* eslint-disable @typescript-eslint/no-explicit-any */
// Documented-example conformance probe. Subpaths '@winglet/json-schema/scanner',
// '/async-scanner', '/filter' and '/keyword' are replaced by the '@/json-schema' root entry,
// which re-exports the same symbols.
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  DEFAULT_KEYWORDS,
  Dialect,
  JSONSchemaScanError,
  JSONSchemaScanErrorCode,
  JSONSchemaScanner,
  JSONSchemaScannerAsync,
  ReferenceSkipReason,
  createReferenceResolver,
  createReferenceResolverAsync,
  hasNullInType,
  isArraySchema,
  isBooleanSchema,
  isCompatibleSchemaType,
  isIdenticalSchemaType,
  isNonNullableArraySchema,
  isNonNullableBooleanSchema,
  isNonNullableNumberSchema,
  isNonNullableObjectSchema,
  isNonNullableStringSchema,
  isNullSchema,
  isNullableArraySchema,
  isNullableBooleanSchema,
  isNullableNumberSchema,
  isNullableObjectSchema,
  isNullableStringSchema,
  isNumberSchema,
  isObjectSchema,
  isStringSchema,
  resolveReference,
} from '@/json-schema';
import type {
  InferJSONSchema,
  InferValueType,
  KeywordDescriptor,
  ReferenceOutcome,
  ReferenceResolver,
  UnknownSchema,
} from '@/json-schema';

describe('README', () => {
  it('README:19 quick: resolveReference inlines boolean target and preserves input', () => {
    const schema = {
      $defs: { Allowed: false },
      properties: { value: { $ref: '#/$defs/Allowed' } },
    };
    const output: any = resolveReference(schema as any);
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(output.properties.value).toBe(false);
    expect(schema.properties.value.$ref).toBe('#/$defs/Allowed');
  });

  it('README:43 getValue returns the original when nothing is recorded', () => {
    const schema = { type: 'string' };
    expect(new JSONSchemaScanner().scan(schema).getValue()).toBe(schema);
  });
});

describe('SPECIFICATION', () => {
  it('SPEC:19 walk: dataPath order and identity of getValue', () => {
    const paths: string[] = [];
    const schema = { properties: { name: { type: 'string' }, denied: false } };
    const scanner = new JSONSchemaScanner({
      visitor: {
        enter(entry) {
          if (entry.keyword === 'properties') paths.push(entry.dataPath);
          if (typeof entry.schema === 'boolean') return;
          expect(typeof entry.schema).toBe('object');
        },
      },
    });
    expect(scanner.scan(schema as any).getValue()).toBe(schema);
    expect(paths.join(',')).toBe('/name,/denied');
  });

  it('SPEC:15 getValue before a successful scan returns undefined', () => {
    expect(new JSONSchemaScanner().getValue()).toBeUndefined();
  });

  it('SPEC:15 same instance scan/getValue during a scan throws scan-in-progress', () => {
    const codes: unknown[] = [];
    const scanner: JSONSchemaScanner = new JSONSchemaScanner({
      visitor: {
        enter() {
          try {
            scanner.scan({});
          } catch (e: any) {
            codes.push(e.code);
          }
          try {
            scanner.getValue();
          } catch (e: any) {
            codes.push(e.code);
          }
        },
      },
    });
    scanner.scan({ type: 'string' });
    expect(codes[0]).toBe('scan-in-progress');
    expect(codes[1]).toBe('scan-in-progress');
  });

  it('SPEC:15 getValue caches the result, including false', () => {
    const scanner = new JSONSchemaScanner({
      options: { mutate: () => false },
    });
    scanner.scan({ type: 'string' });
    expect(scanner.getValue()).toBe(false);
    expect(scanner.getValue()).toBe(false);
  });

  it('SPEC:45 mutate: replacement recorded, input untouched', () => {
    const schema = { properties: { name: { type: 'string' }, denied: false } };
    const before = structuredClone(schema);
    const output: any = new JSONSchemaScanner({
      options: {
        mutate(entry) {
          if (entry.inert || typeof entry.schema === 'boolean') return;
          if (entry.schema.type === 'string')
            return { ...entry.schema, minLength: 1 };
        },
      },
    })
      .scan(schema as any)
      .getValue();
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(output.properties.name.minLength).toBe(1);
    expect('minLength' in schema.properties.name).toBe(false);
    expect(schema).toEqual(before);
  });

  it('SPEC:41 mutation changing current node $id throws identifier-mutation', () => {
    const scanner = new JSONSchemaScanner({
      options: {
        mutate: (entry) =>
          typeof entry.schema === 'boolean'
            ? undefined
            : { ...entry.schema, $id: 'https://x.example/changed' },
      },
    });
    let code: unknown;
    try {
      scanner.scan({ $id: 'https://x.example/a', type: 'string' });
    } catch (e: any) {
      code = e.code;
    }
    expect(code).toBe(JSONSchemaScanErrorCode.IdentifierMutation);
  });

  it('SPEC:74 inline: cross-resource $ref resolved from resources', () => {
    const schema = {
      $id: 'https://schemas.example/root.json',
      properties: { name: { $ref: 'types.json#/$defs/Text' } },
    };
    const before = structuredClone(schema);
    const resolver = createReferenceResolver(schema as any, {
      resources: {
        'https://schemas.example/types.json': {
          $defs: { Text: { type: 'string' } },
        },
      },
    });
    const outcomes: ReferenceOutcome[] = [];
    const scanner = new JSONSchemaScanner({
      options: { resolveReference: resolver },
      visitor: { exit: (entry) => outcomes.push(...(entry.references ?? [])) },
    });
    const output: any = scanner.scan(schema as any).getValue();
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(output.properties.name.type).toBe('string');
    expect(outcomes.some((outcome) => outcome.resolved)).toBe(true);
    expect(schema.properties.name.$ref).toBe('types.json#/$defs/Text');
    expect(schema).toEqual(before);
  });

  it('SPEC:115 load: async loader called once for the shared URI', async () => {
    const schema = {
      $id: 'https://schemas.example/root.json',
      properties: {
        first: { $ref: 'deny.json' },
        second: { $ref: 'deny.json' },
      },
    };
    const documents: Record<string, UnknownSchema | boolean> = {
      'https://schemas.example/deny.json': false,
    };
    const requested: string[] = [];
    const resolver = createReferenceResolverAsync(schema as any, {
      load: async (uri) => {
        requested.push(uri);
        return documents[uri];
      },
    });
    const scanner = new JSONSchemaScannerAsync({
      options: { resolveReference: resolver },
    });
    await scanner.scan(schema as any);
    const output: any = scanner.getValue();
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(output.properties.first === false).toBe(true);
    expect(output.properties.second === false).toBe(true);
    expect(requested.join(',')).toBe('https://schemas.example/deny.json');
  });

  it('SPEC:107 rejected loader request is evicted; later resolve retries', async () => {
    const schema = {
      $id: 'https://schemas.example/root.json',
      $ref: 'a.json',
    };
    let calls = 0;
    const resolver = createReferenceResolverAsync(schema as any, {
      load: async () => {
        calls += 1;
        if (calls === 1) throw new Error('boom');
        return { type: 'string' };
      },
    });
    const run = async () => {
      const s = new JSONSchemaScannerAsync({
        options: { resolveReference: resolver },
      });
      await s.scan(schema as any);
      return s.getValue();
    };
    await expect(run()).rejects.toThrow('boom');
    const second: any = await run();
    expect(calls).toBe(2);
    expect(second.allOf).toEqual([{ type: 'string' }]);
  });

  it('SPEC:158 custom: custom resolver protocol inlines registry target', () => {
    const registry = new Map<string, UnknownSchema | boolean>([
      ['urn:example:Text', { type: 'string' }],
    ]);
    const resolver: ReferenceResolver<void> = {
      root: () => undefined,
      dialect: () => '2020-12',
      resolve(reference) {
        const target = registry.get(reference);
        return target === undefined
          ? { status: 'skipped', reason: 'unresolved' }
          : { status: 'resolved', uri: reference, target };
      },
    };
    const output: any = new JSONSchemaScanner({
      options: { resolveReference: resolver },
    })
      .scan({ $ref: 'urn:example:Text' })
      .getValue();
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(output.type).toBe('string');
  });

  it('SPEC:192 inert: draft-04 contains and boolean additionalProperties are inert', () => {
    const inactive: string[] = [];
    new JSONSchemaScanner({
      options: { defaultDialect: 'draft-04' },
      visitor: {
        enter: (entry) => {
          if (entry.inert) inactive.push(entry.path);
        },
      },
    }).scan({ contains: { type: 'string' }, additionalProperties: false });
    expect(inactive.includes('#/contains')).toBe(true);
    expect(inactive.includes('#/additionalProperties')).toBe(true);
  });

  it('SPEC:186 Dialect entries are the supported dialect strings (Draft04..Draft202012)', () => {
    expect(Dialect.Draft04).toBe('draft-04');
    expect(Dialect.Draft202012).toBe('2020-12');
    expect(Object.values(Dialect)).toEqual(
      expect.arrayContaining([
        'draft-04',
        'draft-06',
        'draft-07',
        '2019-09',
        '2020-12',
      ]),
    );
  });

  it('SPEC:216 keywords: custom keyword with escaped name', () => {
    const additionalKeywords: KeywordDescriptor[] = [
      { keyword: 'x/schema', kind: 'schema' },
    ];
    const schema = {
      'x/schema': { type: 'string' },
      properties: { value: { $ref: '#/x~1schema' } },
    };
    const resolver = createReferenceResolver(schema as any, {
      additionalKeywords,
    });
    const visited: string[] = [];
    const output: any = new JSONSchemaScanner({
      options: { additionalKeywords, resolveReference: resolver },
      visitor: { enter: (entry) => visited.push(entry.path) },
    })
      .scan(schema as any)
      .getValue();
    expect(output && typeof output !== 'boolean').toBe(true);
    expect(visited.includes('#/x~1schema')).toBe(true);
    expect(output.properties.value.type).toBe('string');
  });

  it('SPEC:210 DEFAULT_KEYWORDS is exported and non-empty', () => {
    expect(Array.isArray(DEFAULT_KEYWORDS)).toBe(true);
    expect(DEFAULT_KEYWORDS.length).toBeGreaterThan(0);
  });

  it('SPEC:267 relocation: draft-07 $ref with boolean sibling stays, reason relocation', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/Text',
      hidden: false,
      definitions: { Text: { type: 'string' } },
    };
    const reasons: string[] = [];
    const output = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema as any) },
      visitor: {
        exit: (entry) => {
          for (const outcome of entry.references ?? [])
            if (outcome.skipped) reasons.push(outcome.skipped);
        },
      },
    })
      .scan(schema as any)
      .getValue();
    expect(output === schema).toBe(true);
    expect(reasons.includes('relocation')).toBe(true);
    expect(ReferenceSkipReason.Relocation).toBe('relocation');
  });

  it('SPEC:263 draft-07 $ref with only droppable siblings and kept keys wraps in allOf', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/Text',
      title: 'dropped',
      definitions: { Text: { type: 'string' } },
    };
    const output: any = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema as any) },
    })
      .scan(schema as any)
      .getValue();
    expect(output.$schema).toBe(schema.$schema);
    expect(output.definitions).toEqual({ Text: { type: 'string' } });
    expect(output.allOf).toEqual([{ type: 'string' }]);
    expect('$ref' in output).toBe(false);
    expect('title' in output).toBe(false);
  });

  it('SPEC:263 draft-07 $ref without kept keys is replaced by target copy', () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: {
        a: { $ref: '#/definitions/Text', title: 'x' },
      },
      definitions: { Text: { type: 'string' } },
    };
    const output: any = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema as any) },
    })
      .scan(schema as any)
      .getValue();
    expect(output.properties.a).toEqual({ type: 'string' });
  });

  it('SPEC:297 2019-09 sole $ref replaces node; with siblings appends to allOf', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      $defs: { Text: { type: 'string' }, N: { minLength: 1 } },
      properties: {
        sole: { $ref: '#/$defs/Text' },
        sib: { $ref: '#/$defs/N', title: 'keep', allOf: [{ maxLength: 5 }] },
      },
    };
    const output: any = new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema as any) },
    })
      .scan(schema as any)
      .getValue();
    expect(output.properties.sole).toEqual({ type: 'string' });
    expect(output.properties.sib).toEqual({
      title: 'keep',
      allOf: [{ maxLength: 5 }, { minLength: 1 }],
    });
  });

  it('SPEC:297 non-array allOf preserves the reference as invalid', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      $defs: { Text: { type: 'string' } },
      properties: { a: { $ref: '#/$defs/Text', allOf: 5 } },
    };
    const reasons: string[] = [];
    new JSONSchemaScanner({
      options: { resolveReference: createReferenceResolver(schema as any) },
      visitor: {
        exit: (e) => {
          for (const o of e.references ?? [])
            if (o.skipped) reasons.push(o.skipped);
        },
      },
    }).scan(schema as any);
    expect(reasons).toContain('invalid');
  });

  it('SPEC:315 opaque: relative path against urn base resolves to urn:child.json', () => {
    const schema = { $ref: 'child.json' };
    const resolver = createReferenceResolver(schema as any, {
      baseURI: 'urn:example:root',
      resources: { 'urn:example:child.json': { type: 'string' } },
    });
    const context = resolver.root(schema as any);
    const relative: any = resolver.resolve('child.json', '$ref', context);
    const absolute: any = resolver.resolve(
      'urn:example:child.json',
      '$ref',
      context,
    );
    expect(relative.status === 'skipped' && relative.reason === 'unresolved').toBe(true);
    expect(relative.uri).toBe('urn:child.json');
    expect(absolute.status).toBe('resolved');
  });

  it('SPEC:311 empty reference names the current document under any base', () => {
    const schema = { type: 'string' };
    const resolver = createReferenceResolver(schema as any, {
      baseURI: 'urn:example:root',
    });
    const context = resolver.root(schema as any);
    const result: any = resolver.resolve('', '$ref', context);
    expect(result.status).toBe('resolved');
  });

  it('SPEC:352 errors: throw policy gives unresolved-reference code and clears state', () => {
    const scanner = new JSONSchemaScanner({
      options: { unresolvedReference: 'throw' },
    });
    let caught = false;
    try {
      scanner.scan({ $ref: '#/missing' });
    } catch (error) {
      if (!(error instanceof JSONSchemaScanError)) throw error;
      caught = true;
      expect(error.code).toBe(JSONSchemaScanErrorCode.UnresolvedReference);
    }
    expect(caught && scanner.getValue() === undefined).toBe(true);
  });

  it('SPEC:339 error code table strings match documented codes', () => {
    expect(JSONSchemaScanErrorCode.DuplicateIdentifier).toBe('duplicate-identifier');
    expect(JSONSchemaScanErrorCode.ReferenceChainLimit).toBe('reference-chain-limit');
    expect(JSONSchemaScanErrorCode.InlinedNodeLimit).toBe('inlined-node-limit');
    expect(JSONSchemaScanErrorCode.UnresolvedReference).toBe('unresolved-reference');
    expect(JSONSchemaScanErrorCode.InvalidResolverResult).toBe('invalid-resolver-result');
    expect(JSONSchemaScanErrorCode.IdentifierMutation).toBe('identifier-mutation');
    expect(JSONSchemaScanErrorCode.SchemaCycle).toBe('schema-cycle');
    expect(JSONSchemaScanErrorCode.ScanInProgress).toBe('scan-in-progress');
  });

  it('SPEC:346 physical ancestor cycle throws schema-cycle', () => {
    const schema: any = { properties: {} };
    schema.properties.self = schema;
    let code: unknown;
    try {
      new JSONSchemaScanner().scan(schema);
    } catch (e: any) {
      code = e.code;
    }
    expect(code).toBe('schema-cycle');
  });

  it('SPEC:345 sync resolver returning a thenable gives invalid-resolver-result', () => {
    const resolver: any = {
      root: () => undefined,
      dialect: () => '2020-12',
      resolve: () => Promise.resolve({ status: 'skipped', reason: 'unresolved' }),
    };
    let code: unknown;
    try {
      new JSONSchemaScanner({ options: { resolveReference: resolver } }).scan({
        $ref: 'x',
      });
    } catch (e: any) {
      code = e.code;
    }
    expect(code).toBe('invalid-resolver-result');
  });

  it('SPEC:343 inlinedNodes limit throws inlined-node-limit; chain limit throws reference-chain-limit', () => {
    const schema = {
      $defs: { A: { type: 'string' } },
      properties: { a: { $ref: '#/$defs/A' }, b: { $ref: '#/$defs/A' } },
    };
    let code: unknown;
    try {
      new JSONSchemaScanner({
        options: {
          resolveReference: createReferenceResolver(schema as any),
          limits: { inlinedNodes: 1 },
        },
      }).scan(schema as any);
    } catch (e: any) {
      code = e.code;
    }
    expect(code).toBe('inlined-node-limit');

    const chain: any = { $defs: {}, $ref: '#/$defs/D0' };
    for (let i = 0; i < 5; i++)
      chain.$defs[`D${i}`] = { $ref: `#/$defs/D${i + 1}` };
    chain.$defs.D5 = { type: 'string' };
    let code2: unknown;
    try {
      new JSONSchemaScanner({
        options: {
          resolveReference: createReferenceResolver(chain),
          limits: { referenceChain: 2 },
        },
      }).scan(chain);
    } catch (e: any) {
      code2 = e.code;
    }
    expect(code2).toBe('reference-chain-limit');
  });

  it('SPEC:383 guards: type guard and comparison examples', () => {
    expect(isStringSchema({ type: ['string', 'null'] })).toBe(true);
    expect(hasNullInType({ type: 'null' })).toBe(false);
    expect(
      isIdenticalSchemaType(
        { type: ['string', 'null'] },
        { type: 'string', nullable: true },
      ),
    ).toBe(true);
    expect(isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })).toBe(false);
    expect(isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })).toBe(true);
  });

  it('SPEC:379 nullable-only guards do not use OpenAPI nullable:true', () => {
    expect(isNullableStringSchema({ type: 'string', nullable: true })).toBe(false);
  });

  it('SPEC:407 types: runtime part of InferValueType/InferJSONSchema example', () => {
    const schema = {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
      additionalProperties: false,
    } as const;
    type Value = InferValueType<typeof schema>;
    const partial: Value = {};
    partial.id = 1;
    const nameSchema: InferJSONSchema<string> = { type: 'string', minLength: 1 };
    expect(nameSchema.type).toBe('string');
    expect(partial).toEqual({ id: 1 });
    expectTypeOf<Value>().toEqualTypeOf<Value>();
  });

  it('SPEC:427 tuple: runtime part of finite prefixItems example', () => {
    const schema = {
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number' }],
      items: false,
    } as const;
    type Pair = InferValueType<typeof schema>;
    const empty: Pair = [];
    const pair: Pair = ['name', 1];
    pair[0] = 'changed';
    expect(empty.length === 0 && pair[0] === 'changed').toBe(true);
  });
});

describe('SKILL / knowledge', () => {
  it('KNOW-scanner:25 custom: provider example inlines registry target', () => {
    const registry = new Map<string, UnknownSchema | boolean>([
      ['urn:example:Text', { type: 'string' }],
    ]);
    const resolver: ReferenceResolver<void> = {
      root: () => undefined,
      dialect: () => '2020-12',
      resolve(reference) {
        const target = registry.get(reference);
        return target === undefined
          ? { status: 'skipped', reason: 'unresolved' }
          : { status: 'resolved', uri: reference, target };
      },
    };
    const output: any = new JSONSchemaScanner({
      options: { resolveReference: resolver },
    })
      .scan({ $ref: 'urn:example:Text' })
      .getValue();
    expect(output.type).toBe('string');
  });

  it('KNOW-scanner:58 load: async loader example', async () => {
    const schema = {
      $id: 'https://schemas.example/root.json',
      properties: {
        first: { $ref: 'deny.json' },
        second: { $ref: 'deny.json' },
      },
    };
    const documents: Record<string, UnknownSchema | boolean> = {
      'https://schemas.example/deny.json': false,
    };
    const requested: string[] = [];
    const resolver = createReferenceResolverAsync(schema as any, {
      load: async (uri) => {
        requested.push(uri);
        return documents[uri];
      },
    });
    const scanner = new JSONSchemaScannerAsync({
      options: { resolveReference: resolver },
    });
    await scanner.scan(schema as any);
    const output: any = scanner.getValue();
    expect(output.properties.first === false).toBe(true);
    expect(output.properties.second === false).toBe(true);
    expect(requested.join(',')).toBe('https://schemas.example/deny.json');
  });

  it('KNOW-scanner:96 same entry reaches enter and exit', () => {
    const seen: unknown[] = [];
    new JSONSchemaScanner({
      visitor: {
        enter: (e) => seen.push(e),
        exit: (e) => seen.push(e),
      },
    }).scan({ type: 'string' });
    expect(seen).toHaveLength(2);
    expect(seen[0]).toBe(seen[1]);
  });

  it('KNOW-scanner:96 array containers are skipped, boolean leaves reach callbacks', () => {
    const paths: string[] = [];
    new JSONSchemaScanner({
      visitor: { enter: (e) => paths.push(e.path) },
    }).scan({ allOf: [{ type: 'string' }, false] });
    expect(paths).toEqual(['#', '#/allOf/0', '#/allOf/1']);
  });

  it('KNOW-type:13 types: example', () => {
    const schema = {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
      additionalProperties: false,
    } as const;
    type Value = InferValueType<typeof schema>;
    const partial: Value = {};
    partial.id = 1;
    const nameSchema: InferJSONSchema<string> = { type: 'string', minLength: 1 };
    expect(nameSchema.type).toBe('string');
  });

  it('KNOW-type:35 tuple: example', () => {
    const schema = {
      type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number' }],
      items: false,
    } as const;
    type Pair = InferValueType<typeof schema>;
    const empty: Pair = [];
    const pair: Pair = ['name', 1];
    pair[0] = 'changed';
    expect(empty.length === 0 && pair[0] === 'changed').toBe(true);
  });

  it('KNOW-type:54 number guards include integer; strict identity does not equate them', () => {
    expect(isNumberSchema({ type: 'integer' })).toBe(true);
    expect(isIdenticalSchemaType({ type: 'number' }, { type: 'integer' })).toBe(false);
    expect(isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })).toBe(true);
    expect(hasNullInType({ type: 'null' })).toBe(false);
  });
});

describe('JSDoc: scanners', () => {
  it('JSDOC:JSONSchemaScanner.ts:21 resolver + exit visitor + getValue', () => {
    const schema = {
      $defs: { T: { type: 'string' } },
      properties: { a: { $ref: '#/$defs/T' } },
    };
    const logs: unknown[][] = [];
    const resolver = createReferenceResolver(schema as any);
    const scanner = new JSONSchemaScanner({
      options: { resolveReference: resolver },
      visitor: { exit: (entry) => logs.push([entry.path, entry.references]) },
    });
    const output: any = scanner.scan(schema as any).getValue();
    expect(logs.length).toBeGreaterThan(0);
    expect(output.properties.a).toEqual({ type: 'string' });
  });

  it('JSDOC:JSONSchemaScanner.ts:90 getValue returns same schema when no ops, undefined before scan', () => {
    const scanner = new JSONSchemaScanner();
    expect(scanner.getValue()).toBeUndefined();
    const mySchema = { type: 'string' };
    expect(scanner.scan(mySchema).getValue()).toBe(mySchema);
  });

  it('JSDOC:JSONSchemaScannerAsync.ts:21 resolver + exit visitor + await scan', async () => {
    const schema = {
      $id: 'https://x.example/root.json',
      properties: { a: { $ref: 'other.json' } },
    };
    const load = async (_uri: string) => ({ type: 'string' });
    const resolver = createReferenceResolverAsync(schema as any, { load });
    const logs: unknown[][] = [];
    const scanner = new JSONSchemaScannerAsync({
      options: { resolveReference: resolver },
      visitor: { exit: (entry) => logs.push([entry.path, entry.references]) },
    });
    const output: any = (await scanner.scan(schema as any)).getValue();
    expect(logs.length).toBeGreaterThan(0);
    expect(output.properties.a).toEqual({ type: 'string' });
  });

  it('JSDOC:JSONSchemaScannerAsync.ts:90 getValue after await scan', async () => {
    const scanner = new JSONSchemaScannerAsync();
    expect(scanner.getValue()).toBeUndefined();
    const mySchema = { type: 'string' };
    const result = await scanner.scan(mySchema);
    expect(result.getValue()).toBe(mySchema);
  });
});

describe('JSDoc: filters', () => {
  it('JSDOC:isNumberSchema.ts:18 isNonNullableNumberSchema', () => {
    expect(isNonNullableNumberSchema({ type: 'number' })).toBe(true);
    expect(isNonNullableNumberSchema({ type: 'integer' })).toBe(true);
    expect(isNonNullableNumberSchema({ type: ['number', 'null'] })).toBe(false);
    expect(isNonNullableNumberSchema({ type: 'string' })).toBe(false);
  });
  it('JSDOC:isNumberSchema.ts:40 isNullableNumberSchema', () => {
    expect(isNullableNumberSchema({ type: ['number', 'null'] })).toBe(true);
    expect(isNullableNumberSchema({ type: ['integer', 'null'] })).toBe(true);
    expect(isNullableNumberSchema({ type: 'number' })).toBe(false);
    expect(isNullableNumberSchema({ type: ['string', 'null'] })).toBe(false);
  });
  it('JSDOC:isNumberSchema.ts:65 isNumberSchema', () => {
    expect(isNumberSchema({ type: 'number' })).toBe(true);
    expect(isNumberSchema({ type: 'integer' })).toBe(true);
    expect(isNumberSchema({ type: ['number', 'null'] })).toBe(true);
    expect(isNumberSchema({ type: 'string' })).toBe(false);
  });
  it('JSDOC:isObjectSchema.ts:18 isNonNullableObjectSchema', () => {
    expect(
      isNonNullableObjectSchema({
        type: 'object',
        properties: { name: { type: 'string' } },
      }),
    ).toBe(true);
    expect(isNonNullableObjectSchema({ type: ['object', 'null'] })).toBe(false);
    expect(isNonNullableObjectSchema({ type: 'array' })).toBe(false);
  });
  it('JSDOC:isObjectSchema.ts:38 isNullableObjectSchema', () => {
    expect(isNullableObjectSchema({ type: ['object', 'null'], properties: {} })).toBe(true);
    expect(isNullableObjectSchema({ type: 'object' })).toBe(false);
    expect(isNullableObjectSchema({ type: ['array', 'null'] })).toBe(false);
  });
  it('JSDOC:isObjectSchema.ts:61 isObjectSchema', () => {
    expect(
      isObjectSchema({
        type: 'object',
        properties: { name: { type: 'string' } },
      }),
    ).toBe(true);
    expect(isObjectSchema({ type: ['object', 'null'] })).toBe(true);
    expect(isObjectSchema({ type: 'array' })).toBe(false);
  });
  it('JSDOC:isCompatibleSchemaType.ts:26 compatible cases', () => {
    expect(isCompatibleSchemaType({ type: 'number' }, { type: 'integer' })).toBe(true);
    expect(isCompatibleSchemaType({ type: ['string', 'null'] }, { type: 'string' })).toBe(true);
    expect(isCompatibleSchemaType({ type: ['string'] }, { type: 'string' })).toBe(true);
    expect(isCompatibleSchemaType({ type: ['null'] }, { type: ['null'] })).toBe(true);
  });
  it('JSDOC:isCompatibleSchemaType.ts:33 incompatible cases', () => {
    expect(isCompatibleSchemaType({ type: [] }, { type: [] })).toBe(false);
    expect(isCompatibleSchemaType({ type: ['string', 'number'] }, { type: 'string' })).toBe(false);
    expect(isCompatibleSchemaType({ type: 'string' }, { type: 'number' })).toBe(false);
  });
  it('JSDOC:isNullSchema.ts:14 basic null schema detection', () => {
    expect(isNullSchema({ type: 'null' })).toBe(true);
    expect(isNullSchema({ anyOf: [{ type: 'string' }, { type: 'null' }] })).toBe(false);
  });
  it('JSDOC:isNullSchema.ts:46 union schemas: only the pure null schema matches', () => {
    const unionSchemas = [
      { type: 'null' },
      { anyOf: [{ type: 'string' }, { type: 'null' }] },
      { type: 'string', nullable: true },
    ];
    expect(unionSchemas.map((s) => isNullSchema(s as any))).toEqual([true, false, false]);
  });
  it('JSDOC:isNullSchema.ts:64 form validation: only explicitNull matches', () => {
    const formFieldSchemas = {
      requiredField: { type: 'string', minLength: 1 },
      optionalField: { anyOf: [{ type: 'string' }, { type: 'null' }] },
      explicitNull: { type: 'null' },
    };
    const must = Object.entries(formFieldSchemas)
      .filter(([, s]) => isNullSchema(s as any))
      .map(([k]) => k);
    expect(must).toEqual(['explicitNull']);
  });
  it('JSDOC:hasNullInType.ts:13', () => {
    expect(hasNullInType({ type: 'string' })).toBe(false);
    expect(hasNullInType({ type: ['string', 'null'] })).toBe(true);
    expect(hasNullInType({ type: ['number', 'null'] })).toBe(true);
    expect(hasNullInType({ type: 'null' })).toBe(false);
  });
  it('JSDOC:isIdenticalSchemaType.ts:14 simple comparison', () => {
    expect(isIdenticalSchemaType({ type: 'string' }, { type: 'string' })).toBe(true);
    expect(isIdenticalSchemaType({ type: 'string' }, { type: 'number' })).toBe(false);
  });
  it('JSDOC:isIdenticalSchemaType.ts:19 nullable equivalence', () => {
    expect(
      isIdenticalSchemaType(
        { type: ['string', 'null'] },
        { type: 'string', nullable: true },
      ),
    ).toBe(true);
  });
  it('JSDOC:isIdenticalSchemaType.ts:26 single-element array type', () => {
    expect(isIdenticalSchemaType({ type: ['string'] }, { type: 'string' })).toBe(true);
  });
  it('JSDOC:isArraySchema.ts:18 isNonNullableArraySchema', () => {
    expect(isNonNullableArraySchema({ type: 'array', items: { type: 'string' } })).toBe(true);
    expect(isNonNullableArraySchema({ type: ['array', 'null'] })).toBe(false);
    expect(isNonNullableArraySchema({ type: 'object' })).toBe(false);
  });
  it('JSDOC:isArraySchema.ts:38 isNullableArraySchema', () => {
    expect(isNullableArraySchema({ type: ['array', 'null'], items: { type: 'string' } })).toBe(true);
    expect(isNullableArraySchema({ type: 'array' })).toBe(false);
    expect(isNullableArraySchema({ type: ['object', 'null'] })).toBe(false);
  });
  it('JSDOC:isArraySchema.ts:61 isArraySchema', () => {
    expect(isArraySchema({ type: 'array', items: { type: 'string' } })).toBe(true);
    expect(isArraySchema({ type: ['array', 'null'] })).toBe(true);
    expect(isArraySchema({ type: 'object' })).toBe(false);
  });
  it('JSDOC:isBooleanSchema.ts:18 isNonNullableBooleanSchema', () => {
    expect(isNonNullableBooleanSchema({ type: 'boolean' })).toBe(true);
    expect(isNonNullableBooleanSchema({ type: ['boolean', 'null'] })).toBe(false);
    expect(isNonNullableBooleanSchema({ type: 'string' })).toBe(false);
  });
  it('JSDOC:isBooleanSchema.ts:38 isNullableBooleanSchema', () => {
    expect(isNullableBooleanSchema({ type: ['boolean', 'null'] })).toBe(true);
    expect(isNullableBooleanSchema({ type: 'boolean' })).toBe(false);
    expect(isNullableBooleanSchema({ type: ['string', 'null'] })).toBe(false);
  });
  it('JSDOC:isBooleanSchema.ts:61 isBooleanSchema', () => {
    expect(isBooleanSchema({ type: 'boolean' })).toBe(true);
    expect(isBooleanSchema({ type: ['boolean', 'null'] })).toBe(true);
    expect(isBooleanSchema({ type: 'string' })).toBe(false);
  });
  it('JSDOC:isStringSchema.ts:18 isNonNullableStringSchema', () => {
    expect(isNonNullableStringSchema({ type: 'string' })).toBe(true);
    expect(isNonNullableStringSchema({ type: ['string', 'null'] })).toBe(false);
    expect(isNonNullableStringSchema({ type: 'number' })).toBe(false);
  });
  it('JSDOC:isStringSchema.ts:38 isNullableStringSchema', () => {
    expect(isNullableStringSchema({ type: ['string', 'null'] })).toBe(true);
    expect(isNullableStringSchema({ type: 'string' })).toBe(false);
    expect(isNullableStringSchema({ type: ['number', 'null'] })).toBe(false);
  });
  it('JSDOC:isStringSchema.ts:61 isStringSchema', () => {
    expect(isStringSchema({ type: 'string' })).toBe(true);
    expect(isStringSchema({ type: ['string', 'null'] })).toBe(true);
    expect(isStringSchema({ type: 'number' })).toBe(false);
  });
});
