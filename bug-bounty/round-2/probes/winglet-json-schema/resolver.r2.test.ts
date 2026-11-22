import { describe, expect, it } from 'vitest';

import {
  JSONSchemaScanner,
  JSONSchemaScannerAsync,
  createReferenceResolver,
  createReferenceResolverAsync,
  resolveReference,
} from '../../index';
import type { ReferenceOutcome } from '../../index';

const outcomesOf = (schema: any, options: any = {}) => {
  const outcomes: ReferenceOutcome[] = [];
  const output = new JSONSchemaScanner({
    options: { resolveReference: createReferenceResolver(schema, options) },
    visitor: { exit: (e) => void outcomes.push(...(e.references ?? [])) },
  })
    .scan(schema)
    .getValue();
  return { outcomes, output };
};
const time = (fn: () => void) => {
  const t = performance.now();
  fn();
  return performance.now() - t;
};

describe('r2-json @winglet/json-schema resolver', () => {
  it('R1 canonical uri of a pointer into an embedded resource is relative to that resource', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      $defs: { E: { $id: 'e.json', $defs: { X: { type: 'string' } } } },
      properties: { a: { $ref: 'e.json#/$defs/X' } },
    };
    const { outcomes } = outcomesOf(schema);
    expect(outcomes.map((o) => o.uri)).toEqual(['https://ex.example/e.json#/$defs/X']);
  });

  it('R1b anchor and pointer aliases share one canonical uri', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      $defs: { E: { $id: 'e.json', $defs: { X: { $anchor: 'x', type: 'string' } } } },
      properties: { a: { $ref: 'e.json#/$defs/X' }, b: { $ref: 'e.json#x' } },
    };
    const { outcomes } = outcomesOf(schema);
    expect(new Set(outcomes.map((o) => o.uri)).size).toBe(1);
  });

  it('R2 cross-resource target preparation scales near-linearly with data keywords beside references', () => {
    const make = (n: number) => {
      const properties: any = {};
      for (let i = 0; i < n; i++) properties['p' + i] = { default: i, $ref: 'other.json' };
      const lib = { $id: 'https://ex.example/lib/lib.json', properties };
      const root = { $id: 'https://ex.example/app/root.json', properties: { x: { $ref: 'https://ex.example/lib/lib.json' } } };
      return () =>
        resolveReference(root, {
          resources: { 'https://ex.example/lib/lib.json': lib, 'https://ex.example/lib/other.json': { type: 'string' } },
        } as any);
    };
    make(200)();
    const t1 = time(make(2500));
    const t4 = time(make(10000));
    expect({ t1: Math.round(t1), t4: Math.round(t4), ratio: +(t4 / t1).toFixed(1) }).toMatchObject({ ratio: expect.any(Number) });
    expect(t4 / t1).toBeLessThan(8);
  });

  it('R3 same reference written in two resources resolves against each base (request cache keyed per host)', () => {
    const schema = {
      $id: 'https://ex.example/a/root.json',
      $defs: {
        B: { $id: 'https://ex.example/b/b.json', properties: { q: { $ref: 'x.json' } } },
        AX: { $id: 'https://ex.example/a/x.json', type: 'string' },
        BX: { $id: 'https://ex.example/b/x.json', type: 'number' },
      },
      properties: { p: { $ref: 'x.json' }, b: { $ref: 'https://ex.example/b/b.json' } },
    };
    const out: any = resolveReference(schema);
    expect(out.properties.p).toEqual({ type: 'string' });
    expect(JSON.stringify(out.properties.b)).toContain('"number"');
  });

  it('R5 async load is never called for a relative document address or a registered resource', async () => {
    const requested: string[] = [];
    const anon = { properties: { a: { $ref: 'other.json' } } };
    const r1 = createReferenceResolverAsync(anon, { load: async (uri) => void requested.push(uri) });
    await new JSONSchemaScannerAsync({ options: { resolveReference: r1 } }).scan(anon);
    const reg = { $id: 'https://ex.example/root.json', properties: { a: { $ref: 'dep.json' } } };
    const r2 = createReferenceResolverAsync(reg, {
      resources: { 'https://ex.example/dep.json': { type: 'string' } },
      load: async (uri) => void requested.push(uri),
    });
    const s2 = new JSONSchemaScannerAsync({ options: { resolveReference: r2 } });
    await s2.scan(reg);
    expect(requested).toEqual([]);
    expect((s2.getValue() as any).properties.a).toEqual({ type: 'string' });
  });

  it('R6 a registered document whose $id differs from its retrieval key is reachable by the key', () => {
    const root = { $id: 'https://ex.example/root.json', properties: { a: { $ref: 'dep.json' } } };
    const out: any = resolveReference(root, {
      resources: { 'https://ex.example/dep.json': { $id: 'https://ex.example/real.json', type: 'string' } },
    } as any);
    expect(out.properties.a).not.toHaveProperty('$ref');
  });

  it('R6b the same through an async load', async () => {
    const root = { $id: 'https://ex.example/root.json', properties: { a: { $ref: 'dep.json' } } };
    const resolver = createReferenceResolverAsync(root, {
      load: async () => ({ $id: 'https://ex.example/real.json', type: 'string' }),
    });
    const scanner = new JSONSchemaScannerAsync({ options: { resolveReference: resolver } });
    await scanner.scan(root);
    expect((scanner.getValue() as any).properties.a).not.toHaveProperty('$ref');
  });

  it('R4 same target reached from two hosts in different order yields the same decisions', () => {
    const lib = { $id: 'https://ex.example/lib.json', $defs: { T: { $id: 'inner.json', type: 'string' } } };
    const mk = (order: string[]) => {
      const properties: any = {};
      for (const k of order) properties[k] = { $ref: 'https://ex.example/lib.json#/$defs/T' };
      return { $id: 'https://ex.example/root.json', properties, $defs: { L: lib } };
    };
    const a: any = resolveReference(mk(['x', 'y']));
    const b: any = resolveReference(mk(['y', 'x']));
    expect(a.properties.x).toEqual(b.properties.x);
  });
});
