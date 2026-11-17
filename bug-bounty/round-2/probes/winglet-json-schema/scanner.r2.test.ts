import { describe, expect, it } from 'vitest';

import {
  JSONSchemaScanError,
  JSONSchemaScanErrorCode,
  JSONSchemaScanner,
  JSONSchemaScannerAsync,
  createReferenceResolver,
  createReferenceResolverAsync,
  resolveReference,
} from '../../index';

const N = 10000;
const deepProps = (n: number, leaf: any = { type: 'string' }) => {
  let v: any = leaf;
  for (let i = 0; i < n; i++) v = { properties: { k: v } };
  return v;
};
const deepAllOf = (n: number, leaf: any = { type: 'string' }) => {
  let v: any = leaf;
  for (let i = 0; i < n; i++) v = { allOf: [v] };
  return v;
};
const leafOf = (v: any, n: number) => {
  for (let i = 0; i < n; i++) v = v.properties.k;
  return v;
};
const time = (fn: () => void) => {
  const t = performance.now();
  fn();
  return performance.now() - t;
};
const codeOf = (fn: () => unknown) => {
  try {
    fn();
    return 'ok';
  } catch (e: any) {
    return e instanceof JSONSchemaScanError ? e.code : `${e?.name}: ${e?.message}`;
  }
};

describe('r2-json @winglet/json-schema scanner', () => {
  it('K1 deep 10k properties: plain scan with enter', () => {
    const schema = deepProps(N);
    let count = 0;
    const scanner = new JSONSchemaScanner({ visitor: { enter: () => void count++ } });
    expect(codeOf(() => scanner.scan(schema))).toBe('ok');
    expect(count).toBe(N + 1);
    expect(scanner.getValue()).toBe(schema);
  });

  it('K2 deep 10k properties: mutate at leaf forces a 10k-deep copy', () => {
    const schema = deepProps(N);
    const scanner = new JSONSchemaScanner({
      options: {
        mutate: (entry) =>
          entry.depth === N ? { type: 'number' } : undefined,
      },
    });
    expect(codeOf(() => scanner.scan(schema).getValue())).toBe('ok');
    expect(leafOf(scanner.getValue(), N)).toEqual({ type: 'number' });
  });

  it('K3 deep 10k properties: createReferenceResolver + scan', () => {
    const schema = deepProps(N);
    expect(
      codeOf(() =>
        new JSONSchemaScanner({ options: { resolveReference: createReferenceResolver(schema) } }).scan(schema),
      ),
    ).toBe('ok');
  });

  it('K4 deep 10k properties with a leaf $ref: resolveReference', () => {
    const schema = deepProps(N, { $ref: '#/$defs/A' });
    schema.$defs = { A: { type: 'string' } };
    let out: any;
    expect(codeOf(() => (out = resolveReference(schema)))).toBe('ok');
    expect(leafOf(out, N)).toEqual({ type: 'string' });
  });

  it('K5 deep 10k target in the same resource is inlined', () => {
    const schema = { $ref: '#/$defs/Deep', $defs: { Deep: deepProps(N) } };
    expect(codeOf(() => resolveReference(schema))).toBe('ok');
  });

  it('K5b deep 10k cross-resource target with a relative leaf $ref (template scan + rewrite)', () => {
    const deep = deepProps(N, { $ref: 'other.json' });
    deep.$id = 'https://ex.example/lib/deep.json';
    const root = { $id: 'https://ex.example/app/root.json', $ref: 'https://ex.example/lib/deep.json' };
    let out: any;
    expect(
      codeOf(() => (out = resolveReference(root, { resources: { 'https://ex.example/lib/deep.json': deep } } as any))),
    ).toBe('ok');
    expect(new URL(leafOf(out.allOf?.[0] ?? out, N).$ref, 'https://ex.example/app/root.json').href).toBe('https://ex.example/lib/other.json');
  });

  it('K6 deep 10k allOf nesting: scan + mutate copy', () => {
    const schema = deepAllOf(N);
    const scanner = new JSONSchemaScanner({
      options: { mutate: (entry) => (entry.depth === N ? { type: 'number' } : undefined) },
    });
    expect(codeOf(() => scanner.scan(schema).getValue())).toBe('ok');
  });

  it('K7 wide: 10k vs 40k properties referencing one definition scale near-linearly', () => {
    const wide = (n: number) => {
      const properties: any = {};
      for (let i = 0; i < n; i++) properties['p' + i] = { $ref: '#/$defs/A' };
      return { properties, $defs: { A: { type: 'string', properties: { x: { type: 'number' } } } } };
    };
    resolveReference(wide(1000));
    const t1 = time(() => resolveReference(wide(10000)));
    const t4 = time(() => resolveReference(wide(40000)));
    expect(t4 / t1).toBeLessThan(10);
  });

  it('K7b wide: 10k vs 40k distinct definitions scale near-linearly', () => {
    const wide = (n: number) => {
      const properties: any = {};
      const $defs: any = {};
      for (let i = 0; i < n; i++) {
        properties['p' + i] = { $ref: '#/$defs/D' + i };
        $defs['D' + i] = { type: 'string' };
      }
      return { properties, $defs };
    };
    resolveReference(wide(1000));
    const t1 = time(() => resolveReference(wide(10000)));
    const t4 = time(() => resolveReference(wide(40000)));
    expect(t4 / t1).toBeLessThan(10);
  });

  it('K7c wide: 10k vs 40k plain properties scan with resolver', () => {
    const wide = (n: number) => {
      const properties: any = {};
      for (let i = 0; i < n; i++) properties['p' + i] = { type: 'string', $id: 'p' + i + '.json' };
      return { $id: 'https://ex.example/root.json', properties };
    };
    const run = (s: any) =>
      new JSONSchemaScanner({ options: { resolveReference: createReferenceResolver(s) } }).scan(s);
    run(wide(1000));
    const t1 = time(() => run(wide(10000)));
    const t4 = time(() => run(wide(40000)));
    expect(t4 / t1).toBeLessThan(10);
  });

  it('K8 enter/exit nesting order and same entry object', () => {
    const log: string[] = [];
    const seen = new Map<string, object>();
    new JSONSchemaScanner({
      visitor: {
        enter: (e) => {
          log.push('enter ' + e.path);
          seen.set(e.path, e);
        },
        exit: (e) => {
          log.push('exit ' + e.path);
          expect(seen.get(e.path)).toBe(e);
        },
      },
    }).scan({ properties: { a: { items: { type: 'string' } }, b: false }, allOf: [{}, true] });
    expect(log).toEqual([
      'enter #',
      'enter #/allOf/0',
      'exit #/allOf/0',
      'enter #/allOf/1',
      'exit #/allOf/1',
      'enter #/properties/a',
      'enter #/properties/a/items',
      'exit #/properties/a/items',
      'exit #/properties/a',
      'enter #/properties/b',
      'exit #/properties/b',
      'exit #',
    ]);
  });

  it('K9 maxDepth is inclusive with root at zero', () => {
    const visit = (maxDepth: number) => {
      const paths: string[] = [];
      new JSONSchemaScanner({
        options: { maxDepth },
        visitor: { enter: (e) => void paths.push(e.path) },
      }).scan({ properties: { a: { properties: { b: {} } } } });
      return paths;
    };
    expect(visit(0)).toEqual(['#']);
    expect(visit(1)).toEqual(['#', '#/properties/a']);
  });

  it('K10 a re-entrant scan on the running instance throws and leaves the outer scan intact', () => {
    let inner: unknown;
    const scanner: JSONSchemaScanner = new JSONSchemaScanner({
      options: {
        mutate: (e) => (e.path === '#/properties/a' ? { type: 'number' } : undefined),
      },
      visitor: {
        enter: (e) => {
          if (e.path !== '#/properties/a') return;
          inner = codeOf(() => scanner.scan({ type: 'boolean' }));
        },
      },
    });
    const out: any = scanner.scan({ properties: { a: { type: 'string' } } }).getValue();
    expect(inner).toBe(JSONSchemaScanErrorCode.ScanInProgress);
    expect(out).toEqual({ properties: { a: { type: 'number' } } });
  });

  it('K11 async: concurrent scans on one instance; the second rejects, the first completes', async () => {
    const scanner = new JSONSchemaScannerAsync({
      options: {
        mutate: async (e) => {
          await new Promise((r) => setTimeout(r, 5));
          return e.path === '#/properties/a' ? { type: 'number' } : undefined;
        },
      },
    });
    const first = scanner.scan({ properties: { a: { type: 'string' } } } as any);
    const second = scanner.scan({ type: 'boolean' } as any);
    await expect(second).rejects.toMatchObject({ code: JSONSchemaScanErrorCode.ScanInProgress });
    await first;
    expect(scanner.getValue()).toEqual({ properties: { a: { type: 'number' } } });
  });

  it('K12 async: a rejecting loader propagates; the scanner is reusable; a fresh scan may retry the load', async () => {
    let calls = 0;
    const schema = { $id: 'https://ex.example/root.json', properties: { a: { $ref: 'dep.json' } } };
    const resolver = createReferenceResolverAsync(schema, {
      load: async () => {
        calls++;
        if (calls === 1) throw new Error('network down');
        return { type: 'string' };
      },
    });
    const scanner = new JSONSchemaScannerAsync({ options: { resolveReference: resolver } });
    await expect(scanner.scan(schema)).rejects.toThrow('network down');
    expect(scanner.getValue()).toBeUndefined();
    let second: unknown;
    try {
      await scanner.scan(schema);
      second = 'ok';
    } catch (e: any) {
      second = e?.message;
    }
    expect({ second, calls }).toEqual({ second: 'ok', calls: 2 });
    expect((scanner.getValue() as any).properties.a).toEqual({ type: 'string' });
  });

  it('K12b async: a throwing async enter callback leaves the instance reusable', async () => {
    let fail = true;
    const scanner = new JSONSchemaScannerAsync({
      visitor: {
        enter: async () => {
          if (fail) throw new Error('boom');
        },
      },
    });
    await expect(scanner.scan({ type: 'string' })).rejects.toThrow('boom');
    fail = false;
    await scanner.scan({ type: 'number' });
    expect(scanner.getValue()).toEqual({ type: 'number' });
  });

  it('K13 cyclic $ref chain across three resources terminates with a cycle outcome', () => {
    const resources = {
      'https://ex.example/a.json': { $id: 'https://ex.example/a.json', $ref: 'b.json' },
      'https://ex.example/b.json': { $id: 'https://ex.example/b.json', $ref: 'c.json' },
      'https://ex.example/c.json': { $id: 'https://ex.example/c.json', properties: { x: { $ref: 'a.json' } } },
    };
    const root = { $id: 'https://ex.example/root.json', $ref: 'a.json' };
    const reasons: string[] = [];
    let threw = 'ok';
    try {
      new JSONSchemaScanner({
        options: { resolveReference: createReferenceResolver(root, { resources }) },
        visitor: { exit: (e) => e.references?.forEach((o) => o.skipped && reasons.push(o.skipped)) },
      })
        .scan(root)
        .getValue();
    } catch (e: any) {
      threw = e?.code ?? e?.message;
    }
    expect(threw).toBe('ok');
    expect(reasons).toContain('cycle');
  });

  it('K13b mutual property recursion across resources terminates (sync and async)', async () => {
    const resources: Record<string, any> = {
      'https://ex.example/a.json': { $id: 'https://ex.example/a.json', properties: { b: { $ref: 'b.json' } } },
      'https://ex.example/b.json': { $id: 'https://ex.example/b.json', properties: { a: { $ref: 'a.json' } } },
    };
    const root = { $id: 'https://ex.example/root.json', properties: { start: { $ref: 'a.json' } } };
    expect(codeOf(() => resolveReference(root, { resources } as any))).toBe('ok');
    const resolver = createReferenceResolverAsync(root, { load: async (uri) => resources[uri] });
    const scanner = new JSONSchemaScannerAsync({ options: { resolveReference: resolver } });
    await scanner.scan(root);
    expect(scanner.getValue()).toBeTruthy();
  });

  it('K14 physical cycle in a data keyword under a forced copy errors instead of hanging', () => {
    const data: any = { v: 1 };
    data.self = data;
    const schema: any = { const: data, properties: { a: { type: 'string' } } };
    const scanner = new JSONSchemaScanner({
      options: { mutate: (e) => (e.path === '#/properties/a' ? { type: 'number' } : undefined) },
    });
    const code = codeOf(() => scanner.scan(schema).getValue());
    expect([JSONSchemaScanErrorCode.SchemaCycle, 'ok']).toContain(code);
  });

  it('K14b physical cycle among schema positions errors with schema-cycle', () => {
    const s: any = { properties: {} };
    s.properties.x = s;
    expect(codeOf(() => new JSONSchemaScanner({ visitor: { enter: () => {} } }).scan(s))).toBe(
      JSONSchemaScanErrorCode.SchemaCycle,
    );
  });

  it('K15 mutate returning false at the root is cached as false', () => {
    const scanner = new JSONSchemaScanner({ options: { mutate: (e) => (e.depth === 0 ? false : undefined) } });
    expect(scanner.scan({ type: 'string' }).getValue()).toBe(false);
    expect(scanner.getValue()).toBe(false);
  });

  it('K16 a second scan replaces the cached output even when getValue was not called in between', () => {
    const scanner = new JSONSchemaScanner({
      options: { mutate: (e) => (e.depth === 0 && typeof e.schema === 'object' && e.schema.type === 'string' ? { type: 'number' } : undefined) },
    });
    scanner.scan({ type: 'string' });
    const second = { type: 'boolean' };
    expect(scanner.scan(second as any).getValue()).toBe(second);
  });
});
