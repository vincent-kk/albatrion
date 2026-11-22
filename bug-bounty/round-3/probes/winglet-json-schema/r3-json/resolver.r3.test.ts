import { describe, expect, it } from 'vitest';

import {
  JSONSchemaScanError,
  JSONSchemaScanner,
  JSONSchemaScannerAsync,
  createReferenceResolver,
  createReferenceResolverAsync,
} from '@/json-schema';
import type { ReferenceOutcome, UnknownSchema } from '@/json-schema';

// Round 3 json-schema probes. F = failure paths (a resolver or loader that throws), E = spelling variants.

const scanWith = (schema: any, resolver: any) => {
  const outcomes: ReferenceOutcome[] = [];
  const output = new JSONSchemaScanner({
    options: { resolveReference: resolver },
    visitor: { exit: (entry) => void outcomes.push(...(entry.references ?? [])) },
  })
    .scan(schema)
    .getValue();
  return { output, outcomes };
};

const codeOf = (run: () => unknown): string | undefined => {
  try {
    run();
  } catch (error) {
    return error instanceof JSONSchemaScanError ? error.code : String(error);
  }
  return undefined;
};

const codeOfAsync = async (run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (error) {
    return error instanceof JSONSchemaScanError ? error.code : String(error);
  }
  return undefined;
};

describe('F: a lookup that failed while indexing a document', () => {
  const root = {
    $id: 'https://ex.example/root.json',
    properties: { a: { $ref: 'types.json' } },
  };
  const brokenTypes = {
    type: 'string',
    $defs: {
      one: { $id: 'dup.json', type: 'number' },
      two: { $id: 'dup.json', type: 'boolean' },
    },
  };

  it('F1 sync resources: repeating a scan that threw duplicate-identifier on the same resolver throws again', () => {
    const resolver = createReferenceResolver(root, {
      resources: { 'https://ex.example/types.json': brokenTypes },
    });
    const first = codeOf(() => scanWith(root, resolver));
    const second = codeOf(() => scanWith(root, resolver));
    expect(first).toBe('duplicate-identifier');
    expect(second).toBe('duplicate-identifier');
  });

  it('F1d diagnostic: what the repeated scan returns after the failure', () => {
    const resolver = createReferenceResolver(root, {
      resources: { 'https://ex.example/types.json': brokenTypes },
    });
    expect(codeOf(() => scanWith(root, resolver))).toBe('duplicate-identifier');
    const { output, outcomes } = scanWith(root, resolver);
    // Expected: the repeated scan fails like the first one, so nothing is returned
    expect({ output, outcomes }).toBeUndefined();
  });

  it('F1b control: a fresh resolver throws every time', () => {
    const make = () =>
      createReferenceResolver(root, {
        resources: { 'https://ex.example/types.json': brokenTypes },
      });
    expect(codeOf(() => scanWith(root, make()))).toBe('duplicate-identifier');
    expect(codeOf(() => scanWith(root, make()))).toBe('duplicate-identifier');
  });

  it('F1c after the failure, an identifier declared only inside the rejected document resolves', () => {
    const host = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'types.json' }, b: { $ref: 'dup.json' } },
    };
    const resolver = createReferenceResolver(host, {
      resources: { 'https://ex.example/types.json': brokenTypes },
    });
    expect(codeOf(() => scanWith(host, resolver))).toBe('duplicate-identifier');
    const later = { $id: 'https://ex.example/root.json', $ref: 'dup.json' };
    const code = codeOf(() => scanWith(later, resolver));
    expect(code).toBe('duplicate-identifier');
  });

  it('F2 async load: a document rejected for a duplicate identifier is not served on the next explicit resolve', async () => {
    let calls = 0;
    const resolver = createReferenceResolverAsync(root, {
      load: async (uri) => {
        calls++;
        return uri === 'https://ex.example/types.json'
          ? (structuredClone(brokenTypes) as UnknownSchema)
          : undefined;
      },
    });
    const scan = () =>
      new JSONSchemaScannerAsync({ options: { resolveReference: resolver } }).scan(root);
    const first = await codeOfAsync(scan);
    const second = await codeOfAsync(scan);
    expect({ first, second, calls }).toEqual({
      first: 'duplicate-identifier',
      second: 'duplicate-identifier',
      calls: 2,
    });
  });

  it('F3 duplicate $anchor variant: repeating the lookup on the same resolver throws again', () => {
    const resolver = createReferenceResolver(root, {
      resources: {
        'https://ex.example/types.json': {
          type: 'string',
          $defs: { one: { $anchor: 'x' }, two: { $anchor: 'x' } },
        },
      },
    });
    const first = codeOf(() => scanWith(root, resolver));
    const second = codeOf(() => scanWith(root, resolver));
    expect([first, second]).toEqual(['duplicate-identifier', 'duplicate-identifier']);
  });

  it('F4 diagnostic: a miss that indexes every registered document, repeated, reports the same error', () => {
    const host = {
      $id: 'https://ex.example/root.json',
      properties: { a: { $ref: 'nowhere.json' } },
    };
    const resolver = createReferenceResolver(host, {
      resources: { 'https://ex.example/types.json': brokenTypes },
    });
    const messages: string[] = [];
    for (let i = 0; i < 2; i++)
      try {
        scanWith(host, resolver);
        messages.push('ok');
      } catch (error) {
        messages.push((error as Error).message);
      }
    expect(messages[1]).toBe(messages[0]);
  });
});

describe('B: numeric scan limits', () => {
  // A chain of 40 sole references at one position exceeds the default referenceChain (32)
  const chain = () => {
    const $defs: Record<string, any> = {};
    for (let i = 0; i < 40; i++) $defs['d' + i] = { $ref: '#/$defs/d' + (i + 1) };
    $defs.d40 = { type: 'string' };
    return { $defs, properties: { p: { $ref: '#/$defs/d0' } } };
  };
  const runWith = (limits: any) => {
    const schema = chain();
    return codeOf(() =>
      new JSONSchemaScanner({
        options: { resolveReference: createReferenceResolver(schema), limits },
      }).scan(schema),
    );
  };

  it('B1 control: the default chain limit throws reference-chain-limit', () => {
    expect(runWith(undefined)).toBe('reference-chain-limit');
  });

  it('B2 a NaN referenceChain does not silently disable the bound', () => {
    expect(runWith({ referenceChain: NaN })).toBe('reference-chain-limit');
  });
});

describe('E: spelling variants', () => {
  const inertPaths = (schema: any) => {
    const paths: string[] = [];
    new JSONSchemaScanner({
      visitor: { enter: (entry) => void (entry.inert && paths.push(entry.path)) },
    }).scan(schema);
    return paths;
  };

  it('E1 $schema with an upper-case scheme or host selects the same dialect', () => {
    const lower = inertPaths({
      $schema: 'http://json-schema.org/draft-04/schema#',
      contains: { type: 'string' },
    });
    const upperScheme = inertPaths({
      $schema: 'HTTP://json-schema.org/draft-04/schema#',
      contains: { type: 'string' },
    });
    const upperHost = inertPaths({
      $schema: 'http://JSON-SCHEMA.ORG/draft-04/schema#',
      contains: { type: 'string' },
    });
    expect(lower).toEqual(['#/contains']);
    expect(upperScheme).toEqual(lower);
    expect(upperHost).toEqual(lower);
  });

  it('E2 $id and $ref that differ only in percent-encoding hex case name the same resource', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      $defs: { A: { $id: 'a%2fb.json', type: 'string' } },
      properties: { p: { $ref: 'a%2Fb.json' } },
    };
    const { outcomes } = scanWith(schema, createReferenceResolver(schema));
    expect(outcomes.map((o) => o.resolved)).toEqual([true]);
  });

  it('E3 $id with a percent-encoded unreserved character and a $ref with the raw character', () => {
    const schema = {
      $id: 'https://ex.example/root.json',
      $defs: { A: { $id: '%7Euser.json', type: 'string' } },
      properties: { p: { $ref: '~user.json' } },
    };
    const { outcomes } = scanWith(schema, createReferenceResolver(schema));
    expect(outcomes.map((o) => o.resolved)).toEqual([true]);
  });

  it('E4 control: empty fragment, default port, dot segments and host case resolve alike', () => {
    const schema = {
      $id: 'https://ex.example/dir/root.json',
      $defs: { A: { $id: 'a.json', type: 'string' } },
      properties: {
        p1: { $ref: 'a.json#' },
        p2: { $ref: 'https://EX.example:443/dir/./a.json' },
        p3: { $ref: '../dir/a.json' },
        p4: { $ref: 'HTTPS://ex.example/dir/a.json#' },
      },
    };
    const { outcomes } = scanWith(schema, createReferenceResolver(schema));
    expect(outcomes.map((o) => o.resolved)).toEqual([true, true, true, true]);
  });
});
