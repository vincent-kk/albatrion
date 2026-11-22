import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../index';

type SchemaValue = Parameters<typeof createReferenceResolver>[0];

const root = { $id: 'https://ex.example/root.json' };
const embedding = {
  $id: 'https://ex.example/a.json',
  $defs: { B: { $id: 'https://ex.example/b.json', type: 'string' } },
};

/** Run one lookup and return its thrown message, or undefined when it does not throw. */
const failure = (lookup: () => unknown) => {
  try {
    lookup();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return undefined;
};

describe('a failed registration check on one resolver', () => {
  it('checks a registered key whose trailing line feed is encoded in its address', () => {
    const document = {
      ...root,
      $defs: {
        embedded: { $id: 'https://ex.example/b.json%0A', type: 'string' },
      },
    };
    const resolver = createReferenceResolver(document, {
      resources: { 'https://ex.example/b.json\n': { type: 'number' } },
    });
    expect(() =>
      resolver.resolve('b.json%0A', '$ref', resolver.root(document)),
    ).toThrow('https://ex.example/b.json%0A declared at');
  });

  it.each([
    [
      'canonical key',
      { 'https://ex.example/b.json': { $id: 'https://ex.example/b.json' } },
    ],
    [
      'upper-case key',
      { 'https://EX.example/b.json': { $id: 'https://ex.example/b.json' } },
    ],
    [
      'two spellings of one address with different documents',
      {
        'https://EX.example/b.json': { type: 'number' },
        'https://ex.EXAMPLE/b.json': { type: 'boolean' },
      },
    ],
  ] as Array<[string, Record<string, SchemaValue>]>)(
    'fails the same way when the lookup is repeated: %s',
    (_shape, colliding) => {
      const resolver = createReferenceResolver(root, {
        resources: { 'https://ex.example/a.json': embedding, ...colliding },
      });
      const context = resolver.root(root);
      expect(resolver.resolve('a.json', '$ref', context)).toMatchObject({
        status: 'resolved',
      });
      const first = failure(() => resolver.resolve('b.json', '$ref', context));
      expect(first).toMatch(/declared at/);
      expect(failure(() => resolver.resolve('b.json', '$ref', context))).toBe(
        first,
      );
    },
  );

  it('still rejects a later collision after a successful lookup', () => {
    const resolver = createReferenceResolver(root, {
      resources: {
        'https://ex.example/a.json': embedding,
        'https://ex.example/b.json': { $id: 'https://ex.example/b.json' },
        'https://ex.example/c.json': { type: 'null' },
      },
    });
    const context = resolver.root(root);
    expect(resolver.resolve('c.json', '$ref', context)).toMatchObject({
      status: 'resolved',
    });
    expect(resolver.resolve('a.json', '$ref', context)).toMatchObject({
      status: 'resolved',
    });
    expect(() => resolver.resolve('b.json', '$ref', context)).toThrow(
      'https://ex.example/b.json declared at',
    );
  });
});
