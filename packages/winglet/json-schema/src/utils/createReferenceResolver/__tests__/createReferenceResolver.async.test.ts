import { describe, expect, it, vi } from 'vitest';

import { JSONSchemaScannerAsync } from '../../JSONSchemaScanner/async';
import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';

describe('explicit asynchronous resource loading', () => {
  it('coalesces in-flight document requests and reuses completed results', async () => {
    const schema = { $id: 'https://e.test/root' },
      load = vi.fn(async () => ({
        $id: 'https://e.test/other',
        $defs: { T: { type: 'string' } },
      }));
    const r = createReferenceResolverAsync(schema, { load }),
      context = r.root(schema);
    const [a, b] = await Promise.all([
      r.resolve('other#/$defs/T', '$ref', context),
      r.resolve('other#/$defs/T', '$ref', context),
    ]);
    expect(a).toBe(b);
    await r.resolve('other#/$defs/T', '$ref', context);
    expect(load).toHaveBeenCalledExactlyOnceWith('https://e.test/other');
  });
  it('caches missing documents and keeps their written references', async () => {
    const schema = {
        $id: 'https://e.test/root',
        properties: { a: { $ref: 'missing' }, b: { $ref: 'missing' } },
      },
      load = vi.fn(async () => undefined);
    const scanner = new JSONSchemaScannerAsync({
      options: {
        resolveReference: createReferenceResolverAsync(schema, { load }),
      },
    });
    await scanner.scan(schema);
    expect(scanner.getValue()).toEqual(schema);
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('uses registered and embedded resources before load', async () => {
    const schema = {
        $id: 'https://e.test/root',
        $defs: { A: { $id: 'embedded', type: 'number' } },
      },
      load = vi.fn(async () => undefined);
    const r = createReferenceResolverAsync(schema, {
        resources: { 'https://e.test/registered': false },
        load,
      }),
      context = r.root(schema);
    expect(await r.resolve('embedded', '$ref', context)).toMatchObject({
      status: 'resolved',
      target: { type: 'number' },
    });
    expect(await r.resolve('registered', '$ref', context)).toMatchObject({
      status: 'resolved',
      target: false,
    });
    expect(load).not.toHaveBeenCalled();
  });
  it('has sync parity for static and dynamic target outcomes', async () => {
    const schema = {
      $id: 'https://e.test/root',
      $defs: {
        A: { $anchor: 'Static', type: 'string' },
        B: { $dynamicAnchor: 'Dynamic', type: 'number' },
      },
    };
    const sync = createReferenceResolver(schema),
      async = createReferenceResolverAsync(schema);
    for (const ref of ['#Static', '#Dynamic', '#missing'])
      expect(
        await async.resolve(ref, '$dynamicRef', async.root(schema)),
      ).toEqual(sync.resolve(ref, '$dynamicRef', sync.root(schema)));
  });
  it('propagates user loader failures without automatic retries', async () => {
    const schema = { $id: 'https://e.test/root' },
      load = vi.fn(async () => {
        throw new Error('load failed');
      }),
      r = createReferenceResolverAsync(schema, { load }),
      context = r.root(schema);
    await expect(r.resolve('missing', '$ref', context)).rejects.toThrow(
      'load failed',
    );
    await expect(r.resolve('missing', '$ref', context)).rejects.toThrow(
      'load failed',
    );
    expect(load).toHaveBeenCalledTimes(1);
  });
});
