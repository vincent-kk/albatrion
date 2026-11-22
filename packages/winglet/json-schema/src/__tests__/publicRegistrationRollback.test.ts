import { expect, it } from 'vitest';

import {
  createReferenceResolver,
  createReferenceResolverAsync,
} from '../index';

type SchemaValue = Parameters<typeof createReferenceResolver>[0];

const root = Object.freeze({ $id: 'https://ex.example/root.json' });
const invalid: SchemaValue[] = [
  { $defs: { one: { $id: 'dup.json' }, two: { $id: 'dup.json' } } },
  { $defs: { one: { $anchor: 'x' }, two: { $anchor: 'x' } } },
  { $id: 'different.json', $defs: { one: { $id: 'types.json' } } },
];
/** Capture the whole error so the failed transaction must retain its original diagnostics. */
function failure(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return undefined;
}
/** Await one explicit lookup, retaining its rejection diagnostics. */
async function asyncFailure(run: () => unknown): Promise<string | undefined> {
  try {
    await run();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return undefined;
}

it('round-3 json-schema 1: retries direct, lookup-miss and rejected-document aliases like a fresh store', () => {
  for (const document of invalid) {
    const resources = {
      'https://ex.example/types.json': document,
      'https://ex.example/good.json': { type: 'number' },
    };
    for (const reference of ['types.json', 'missing.json']) {
      const fresh = createReferenceResolver(root, { resources });
      const expected = failure(() =>
        fresh.resolve(reference, '$ref', fresh.root(root)),
      );
      expect(expected).toContain('declared at');
      const reused = createReferenceResolver(root, { resources });
      const context = reused.root(root);
      const good = reused.resolve('good.json', '$ref', context);
      for (let attempt = 0; attempt < 3; attempt++)
        expect(failure(() => reused.resolve(reference, '$ref', context))).toBe(
          expected,
        );
      expect(reused.resolve('good.json', '$ref', context)).toEqual(good);
      const aliasFresh = createReferenceResolver(root, { resources });
      expect(failure(() => reused.resolve('dup.json', '$ref', context))).toBe(
        failure(() =>
          aliasFresh.resolve('dup.json', '$ref', aliasFresh.root(root)),
        ),
      );
    }
  }
});

it('round-3 json-schema 1: a rejected loaded index is retried instead of serving partial resources', async () => {
  for (const document of invalid) {
    let calls = 0;
    const resolver = createReferenceResolverAsync(root, {
      load: async () => {
        calls++;
        return document;
      },
    });
    const context = resolver.root(root);
    const first = await asyncFailure(() =>
      resolver.resolve('types.json', '$ref', context),
    );
    expect(first).toContain('declared at');
    for (let attempt = 0; attempt < 2; attempt++)
      expect(
        await asyncFailure(() =>
          resolver.resolve('types.json', '$ref', context),
        ),
      ).toBe(first);
    expect(calls).toBe(3);
  }
});
