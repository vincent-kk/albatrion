import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { ReferenceResolver, ReferenceStep } from '../type';

/** Explicit provider for engine-only protocol tests; it never depends on scanner entries. */
function provider(resolve: ReferenceResolver['resolve']): ReferenceResolver {
  return { root: () => null, dialect: () => '2020-12', resolve };
}

describe('reference provider protocol and limits', () => {
  it('enters lexical contexts once, compares identity, and restores independent siblings', () => {
    const root = {},
      nested = {},
      rootCall = vi.fn(() => root),
      child = vi.fn(
        (parent: unknown, _key: string, schema: UnknownSchema | boolean) =>
          typeof schema === 'object' && schema.$id ? nested : parent,
      ),
      dialect = vi.fn(() => '2020-12' as const);
    const resolve = vi.fn(
      (_ref: string, _key: string, context: unknown): ReferenceStep => ({
        status: 'resolved',
        uri: context === nested ? 'B' : 'A',
        target: { type: 'string' },
      }),
    );
    const schema = {
      properties: {
        a: { $id: 'nested', properties: { x: { $ref: 'x' } } },
        b: { $ref: 'x' },
      },
    };
    new JSONSchemaScanner({
      options: {
        resolveReference: { root: rootCall, child, dialect, resolve },
      },
    }).scan(schema);
    expect(rootCall).toHaveBeenCalledExactlyOnceWith(schema);
    expect(resolve.mock.calls.map((args) => args[2])).toEqual([nested, root]);
    expect(dialect).toHaveBeenCalledTimes(2);
    expect(child).toHaveBeenCalledTimes(3);
  });
  it('fixes the root context when child is omitted and never re-enters replacement targets', () => {
    const root = {},
      resolve = vi.fn((_r, _k, _context) => ({
        status: 'resolved' as const,
        uri: 'T',
        target: { $id: 'ignored', type: 'string' },
      }));
    new JSONSchemaScanner({
      options: {
        resolveReference: {
          root: () => root,
          dialect: () => '2020-12',
          resolve,
        },
      },
    }).scan({ properties: { x: { $ref: 'T' } } });
    expect(resolve.mock.calls[0][2]).toBe(root);
  });
  it.each([
    undefined,
    null,
    {},
    Promise.resolve({ status: 'skipped', reason: 'unresolved' }),
  ])('rejects invalid synchronous results %s', (result) => {
    expect(() =>
      new JSONSchemaScanner({
        options: { resolveReference: provider(() => result as any) },
      }).scan({ $ref: 'T' }),
    ).toThrowError(
      expect.objectContaining({ code: 'invalid-resolver-result' }),
    );
  });
  it('rejects the removed callback form at the public boundary', () => {
    expect(() =>
      new JSONSchemaScanner({
        options: { resolveReference: (() => undefined) as any },
      }).scan({}),
    ).toThrow(TypeError);
  });
  it('fails unresolved references only under the requested policy', () => {
    const resolver = provider(() => ({
      status: 'skipped',
      reason: 'unresolved',
    }));
    expect(
      new JSONSchemaScanner({ options: { resolveReference: resolver } })
        .scan({ $ref: 'missing' })
        .getValue(),
    ).toEqual({ $ref: 'missing' });
    expect(() =>
      new JSONSchemaScanner({
        options: { resolveReference: resolver, unresolvedReference: 'throw' },
      }).scan({ $ref: 'missing' }),
    ).toThrowError(expect.objectContaining({ code: 'unresolved-reference' }));
  });
  it('terminates a fresh-URI replacement chain at the configured limit', () => {
    let count = 0;
    const resolver = provider(() => ({
      status: 'resolved',
      uri: String(count++),
      target: { $ref: 'next' },
    }));
    expect(() =>
      new JSONSchemaScanner({
        options: { resolveReference: resolver, limits: { referenceChain: 3 } },
      }).scan({ $ref: 'start' }),
    ).toThrowError(expect.objectContaining({ code: 'reference-chain-limit' }));
    expect(count).toBe(4);
  });
  it('keeps the default replacement-chain budget finite', () => {
    let count = 0;
    const resolver = provider(() => ({
      status: 'resolved',
      uri: String(count++),
      target: { $ref: 'next' },
    }));
    expect(() =>
      new JSONSchemaScanner({ options: { resolveReference: resolver } }).scan({
        $ref: 'start',
      }),
    ).toThrowError(expect.objectContaining({ code: 'reference-chain-limit' }));
    expect(count).toBe(33);
  });
  it('terminates fresh-frame exponential expansion using the cumulative budget', () => {
    let count = 0;
    const resolver = provider(() => ({
      status: 'resolved',
      uri: String(count++),
      target: { allOf: [{ $ref: 'next' }, { $ref: 'next' }] },
    }));
    expect(() =>
      new JSONSchemaScanner({
        options: { resolveReference: resolver, limits: { inlinedNodes: 30 } },
      }).scan({ $ref: 'start' }),
    ).toThrowError(expect.objectContaining({ code: 'inlined-node-limit' }));
    expect(count).toBe(11);
  });
  it.each([
    '$id',
    'id',
    '$schema',
    '$anchor',
    '$dynamicAnchor',
    '$recursiveAnchor',
  ])('rejects mutate changes to %s', (key) => {
    expect(() =>
      new JSONSchemaScanner({
        options: { mutate: () => ({ [key]: 'new' }) },
      }).scan({}),
    ).toThrowError(expect.objectContaining({ code: 'identifier-mutation' }));
  });
  it('allows a static dynamicRef while preserving a dynamic target explicitly', () => {
    const calls: string[] = [];
    const resolver = provider((ref, key) => {
      calls.push(key);
      return ref === 'dynamic'
        ? { status: 'skipped', reason: 'dynamic' }
        : { status: 'resolved', uri: 'T', target: false };
    });
    expect(
      new JSONSchemaScanner({ options: { resolveReference: resolver } })
        .scan({ $ref: 'static', $dynamicRef: 'dynamic' })
        .getValue(),
    ).toEqual({ $dynamicRef: 'dynamic', allOf: [false] });
    expect(calls).toEqual(['$ref', '$dynamicRef']);
  });
  it('uses the provider dialect for a boolean root', () => {
    const inert: unknown[] = [];
    new JSONSchemaScanner({
      options: {
        resolveReference: {
          root: () => null,
          dialect: () => 'draft-04',
          resolve: () => ({ status: 'skipped', reason: 'unresolved' }),
        },
      },
      visitor: { enter: (e) => inert.push(e.inert) },
    }).scan(false);
    expect(inert).toEqual([true]);
  });
  it('resumes an async chain without repeating root, enter, or completed resolve calls', async () => {
    const enter = vi.fn(),
      root = vi.fn(() => null),
      calls: string[] = [];
    const scanner = new JSONSchemaScannerAsync({
      visitor: { enter },
      options: {
        resolveReference: {
          root,
          dialect: () => '2020-12',
          resolve: async (ref) => {
            calls.push(ref);
            return {
              status: 'resolved',
              uri: ref,
              target: ref === 'A' ? { $ref: 'B' } : false,
            };
          },
        },
      },
    });
    await scanner.scan({ $ref: 'A' });
    expect(scanner.getValue()).toBe(false);
    expect(calls).toEqual(['A', 'B']);
    expect(enter).toHaveBeenCalledTimes(1);
    expect(root).toHaveBeenCalledTimes(1);
  });
});
