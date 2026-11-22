import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import * as filterByName from '@winglet/common-utils/filter';
import * as schedulerByName from '@winglet/common-utils/scheduler';

import * as filterSource from '../../../../common-utils/src/utils/filter/index';
import * as schedulerSource from '../../../../common-utils/src/utils/scheduler/index';
import { DataLoader } from '../../index';

describe('control: workspace dependencies resolve to source', () => {
  it('@winglet/common-utils subpaths are the src modules, not dist', () => {
    expect({
      isNil: filterByName.isNil === filterSource.isNil,
      isArrayLike: filterByName.isArrayLike === filterSource.isArrayLike,
      scheduleNextTick:
        schedulerByName.scheduleNextTick === schedulerSource.scheduleNextTick,
    }).toEqual({ isNil: true, isArrayLike: true, scheduleNextTick: true });
  });
});

const tick = () => new Promise<void>((done) => setTimeout(done, 0));
const settle = <T>(promise: Promise<T>) =>
  promise.then(
    (value) => ({ value }),
    (error: unknown) => ({
      error: error instanceof Error ? error.message : String(error),
    }),
  );

const repositoryRoot = resolve(__dirname, '../../../../../../');

/** Reads the option rows of the "Options" table of a documentation-site page. */
const readSiteOptionNames = (relativePath: string): string[] => {
  const page = readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
  const heading = page.includes('### Options') ? '### Options' : '### 옵션';
  const section = page.slice(page.indexOf(heading));
  const names: string[] = [];
  for (const line of section.split('\n').slice(1)) {
    if (line.startsWith('#')) break;
    const match = /^\| `([A-Za-z]+)` \|/.exec(line);
    if (match) names.push(match[1]);
  }
  return names;
};

describe('documentation site options table (documents/docs/winglet/data-loader/index.mdx)', () => {
  // Keys of DataLoaderOptions in src/type.ts.
  const realOptions = [
    'name',
    'cache',
    'batchScheduler',
    'cacheKeyFn',
    'maxBatchSize',
    'disableBatch',
  ];

  it('every documented option name is an option the loader reads (en and ko)', () => {
    const en = readSiteOptionNames('documents/docs/winglet/data-loader/index.mdx');
    const ko = readSiteOptionNames(
      'documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/data-loader/index.mdx',
    );
    expect(en.length).toBeGreaterThan(0);
    expect({
      en: en.filter((name) => !realOptions.includes(name)),
      ko: ko.filter((name) => !realOptions.includes(name)),
    }).toEqual({ en: [], ko: [] });
  });

  it('documented `scheduler` option controls batching timing', async () => {
    let scheduled = 0;
    const loader = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      // As documented: `scheduler` | `(fn) => void` | Controls batching timing.
      { scheduler: (fn: () => void) => (scheduled++, fn()) } as never,
    );
    await loader.load(1);
    expect(scheduled).toBe(1);
  });

  it('documented `cacheMap` option replaces the default Map', async () => {
    const calls = { get: 0, set: 0 };
    const backing = new Map<number, Promise<number>>();
    const cacheMap = {
      get: (key: number) => (calls.get++, backing.get(key)),
      set: (key: number, value: Promise<number>) => (
        calls.set++, backing.set(key, value)
      ),
      delete: (key: number) => backing.delete(key),
      clear: () => backing.clear(),
    };
    const loader = new DataLoader<number, number>(
      async (keys) => keys.map((key) => key * 10),
      // As documented: `cacheMap` | `MapLike` | Custom cache implementation.
      { cacheMap } as never,
    );
    await loader.load(1);
    expect(calls).toEqual({ get: 1, set: 1 });
  });

  it('documented `batch: false` disables request batching', async () => {
    const calls: number[][] = [];
    const loader = new DataLoader<number, number>(
      async (keys) => (calls.push([...keys]), keys.map((key) => key * 10)),
      // As documented: `batch` | `boolean` | `true` | Enable request batching.
      { batch: false } as never,
    );
    await Promise.all([loader.load(1), loader.load(2)]);
    expect(calls).toEqual([[1], [2]]);
  });

  it('documented `cache: true` (type boolean, default true) is accepted', () => {
    let thrown: string | null = null;
    try {
      new DataLoader<number, number>(
        async (keys) => keys.map((key) => key * 10),
        // As documented: `cache` | `boolean` | `true` | Enable promise caching.
        { cache: true } as never,
      );
    } catch (error) {
      thrown = (error as Error).message;
    }
    expect(thrown).toBeNull();
  });
});

describe('a custom cache whose set() throws (FP4, EQ10)', () => {
  const unhandled: unknown[] = [];
  const onUnhandled = (reason: unknown) => unhandled.push(reason);
  beforeEach(() => {
    unhandled.length = 0;
    process.on('unhandledRejection', onUnhandled);
  });
  afterEach(() => {
    process.off('unhandledRejection', onUnhandled);
  });

  /** A MapLike over a WeakMap: object keys are cached, a primitive key makes set() throw. */
  const createWeakCache = () => {
    let store = new WeakMap<object, Promise<string>>();
    return {
      get: (key: object | string) =>
        typeof key === 'object' ? store.get(key) : undefined,
      set: (key: object | string, value: Promise<string>) =>
        store.set(key as object, value),
      delete: (key: object | string) =>
        typeof key === 'object' ? store.delete(key) : false,
      clear: () => {
        store = new WeakMap();
      },
    };
  };

  it('control: a throwing first request leaves nothing in any batch', async () => {
    const calls: unknown[][] = [];
    const loader = new DataLoader<object | string, string>(
      async (keys) => (calls.push([...keys]), keys.map((key) => String(key))),
      { cache: createWeakCache() as never },
    );
    let thrown: string | null = null;
    try {
      loader.load('primitive');
    } catch (error) {
      thrown = (error as Error).constructor.name;
    }
    const objectKey = { id: 1 };
    await loader.load(objectKey);
    expect({ thrown, calls }).toEqual({ thrown: 'TypeError', calls: [[objectKey]] });
  });

  it('a load() that throws while a batch is open leaves nothing in that batch', async () => {
    const calls: unknown[][] = [];
    const loader = new DataLoader<object | string, string>(
      async (keys) => (calls.push([...keys]), keys.map((key) => String(key))),
      { cache: createWeakCache() as never },
    );
    const objectKey = { id: 1 };
    const first = loader.load(objectKey);
    let thrown: string | null = null;
    try {
      loader.load('primitive');
    } catch (error) {
      thrown = (error as Error).constructor.name;
    }
    await first;
    expect({ thrown, calls }).toEqual({ thrown: 'TypeError', calls: [[objectKey]] });
  });

  it('the thrown load() does not produce an unhandled rejection later', async () => {
    const loader = new DataLoader<object | string, string>(
      async (keys) =>
        keys.map((key) =>
          typeof key === 'string' ? new Error(`no ${key}`) : 'ok',
        ),
      { cache: createWeakCache() as never },
    );
    const first = loader.load({ id: 1 });
    try {
      loader.load('primitive');
    } catch {
      // The caller handled the synchronous failure.
    }
    await first;
    await tick();
    await tick();
    expect(unhandled.map((reason) => String(reason))).toEqual([]);
  });
});

describe('README "Error Handling and Retry" (README.md:339-370, README-ko_kr.md) (FP4, sibling of round-3 data-loader 3)', () => {
  /** A backend whose first request fails transiently and whose later requests succeed. */
  const createFlakyBackend = () => {
    let requests = 0;
    return {
      get requests() {
        return requests;
      },
      fetchUsersWithRetry: async (ids: ReadonlyArray<string>) => {
        requests++;
        if (requests === 1) throw new Error('ECONNRESET');
        return ids.map((id) => ({ id }));
      },
    };
  };

  it('control: a batch-wide rejection does not stick; the next load fetches again', async () => {
    const backend = createFlakyBackend();
    const userLoader = new DataLoader(async (userIds: ReadonlyArray<string>) =>
      backend.fetchUsersWithRetry(userIds),
    );
    const first = await settle(userLoader.load('u1'));
    const second = await settle(userLoader.load('u1'));
    expect({ first, second, requests: backend.requests }).toEqual({
      first: { error: 'ECONNRESET' },
      second: { value: { id: 'u1' } },
      requests: 2,
    });
  });

  it('the README pattern "If entire batch fails, return same error for each key" lets the next load retry', async () => {
    const backend = createFlakyBackend();
    // Copied from README.md "Error Handling and Retry".
    const userLoader = new DataLoader(async (userIds: ReadonlyArray<string>) => {
      try {
        const users = await backend.fetchUsersWithRetry(userIds);
        return users;
      } catch (error) {
        // If entire batch fails, return same error for each key
        return userIds.map(() => error as Error);
      }
    });
    const first = await settle(userLoader.load('u1'));
    const second = await settle(userLoader.load('u1'));
    expect({ first, second, requests: backend.requests }).toEqual({
      first: { error: 'ECONNRESET' },
      second: { value: { id: 'u1' } },
      requests: 2,
    });
  });

  it('README.md and README-ko_kr.md mention that per-key errors stay cached until clear(key)', () => {
    const readme = (name: string) =>
      readFileSync(resolve(repositoryRoot, 'packages/winglet/data-loader', name), 'utf8');
    const mentions = (text: string) => /clear\(\s*key\s*\)|clear\(id\)|clear\(userId/.test(text);
    expect({
      en: mentions(readme('README.md')),
      ko: mentions(readme('README-ko_kr.md')),
    }).toEqual({ en: true, ko: true });
  });
});

describe('numeric key spellings with the default cache (BS2)', () => {
  it('matches Map semantics: -0 and 0 share one entry, NaN dedupes, "1" and 1 differ', async () => {
    const calls: unknown[][] = [];
    const loader = new DataLoader<unknown, string>(async (keys) => {
      calls.push([...keys]);
      return keys.map((key) => `v:${Object.is(key, -0) ? '-0' : String(key)}`);
    });
    const results = await Promise.all(
      [0, -0, NaN, NaN, 1, '1'].map((key) => settle(loader.load(key))),
    );
    expect({ calls, results }).toEqual({
      calls: [[0, NaN, 1, '1']],
      results: [
        { value: 'v:0' },
        { value: 'v:0' },
        { value: 'v:NaN' },
        { value: 'v:NaN' },
        { value: 'v:1' },
        { value: 'v:1' },
      ],
    });
  });
});
