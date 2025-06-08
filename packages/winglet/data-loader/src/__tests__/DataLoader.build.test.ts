import { DataLoader } from '@winglet/data-loader';
import { describe, expect, it, vi } from 'vitest';

import type { DataLoaderOptions } from '../type';

function getIdentityLoader<K, C = K>(
  options?: DataLoaderOptions<K, K, C>,
): [DataLoader<K, K, C>, Array<ReadonlyArray<K>>] {
  const loadCalls: Array<ReadonlyArray<K>> = [];
  const identityLoader = new DataLoader((keys) => {
    loadCalls.push(keys);
    return Promise.resolve(keys);
  }, options);
  return [identityLoader, loadCalls];
}

describe('DataLoader primary api', () => {
  describe('기본 기능 테스트', () => {
    it('단일 키 로드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataLoader = new DataLoader(batchLoader);

      const result = await dataLoader.load('key1');
      expect(result).toBe('value1');
      expect(batchLoader).toHaveBeenCalledWith(['key1']);
    });

    it('여러 키 동시 로드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1', 'value2']);
      const dataLoader = new DataLoader(batchLoader);

      const [result1, result2] = await Promise.all([
        dataLoader.load('key1'),
        dataLoader.load('key2'),
      ]);

      expect(result1).toBe('value1');
      expect(result2).toBe('value2');
      expect(batchLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('캐시 기능 테스트', () => {
    it('캐시된 값 재사용 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataLoader = new DataLoader(batchLoader);

      const result1 = await dataLoader.load('key1');
      const result2 = await dataLoader.load('key1');

      expect(result1).toBe('value1');
      expect(result2).toBe('value1');
      expect(batchLoader).toHaveBeenCalledTimes(1);
    });

    it('clear 메서드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataLoader = new DataLoader(batchLoader);

      await dataLoader.load('key1');
      dataLoader.clear('key1');
      await dataLoader.load('key1');

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });

    it('clearAll 메서드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1', 'value2']);
      const dataLoader = new DataLoader(batchLoader);

      await Promise.all([dataLoader.load('key1'), dataLoader.load('key2')]);
      dataLoader.clearAll();
      await Promise.all([dataLoader.load('key1'), dataLoader.load('key2')]);

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });
  });

  describe('에러 처리 테스트', () => {
    it('로더 에러 처리 테스트', async () => {
      const error = new Error('로드 실패');
      const batchLoader = vi.fn().mockRejectedValue(error);
      const dataLoader = new DataLoader(batchLoader);

      await expect(dataLoader.load('key1')).rejects.toThrow('로드 실패');
    });

    it('loadMany 에러 처리 테스트', async () => {
      const error = new Error('로드 실패');
      const batchLoader = vi.fn().mockRejectedValue(error);
      const dataLoader = new DataLoader(batchLoader);

      const results = await dataLoader.loadMany(['key1', 'key2']);
      expect(results).toEqual([error, error]);
    });
  });

  describe('배치 크기 제한 테스트', () => {
    it('maxBatchSize 옵션 테스트', async () => {
      const batchLoader = vi
        .fn()
        .mockResolvedValueOnce(['value1', 'value2'])
        .mockResolvedValueOnce(['value3']);

      const dataLoader = new DataLoader(batchLoader, { maxBatchSize: 2 });

      await Promise.all([
        dataLoader.load('key1'),
        dataLoader.load('key2'),
        dataLoader.load('key3'),
      ]);

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });
  });

  describe('prime 메서드 테스트', () => {
    it('값 미리 설정 테스트', async () => {
      const batchLoader = vi.fn();
      const dataLoader = new DataLoader(batchLoader);

      dataLoader.prime('key1', 'value1');
      const result = await dataLoader.load('key1');

      expect(result).toBe('value1');
      expect(batchLoader).not.toHaveBeenCalled();
    });

    it('에러 미리 설정 테스트', async () => {
      const batchLoader = vi.fn();
      const dataLoader = new DataLoader(batchLoader);
      const error = new Error('미리 설정된 에러');

      dataLoader.prime('key1', error);
      await expect(dataLoader.load('key1')).rejects.toThrow('미리 설정된 에러');
      expect(batchLoader).not.toHaveBeenCalled();
    });
  });
});

describe('It is resilient to job queue ordering', () => {
  it('afterAsyncTask 사용으로, 모든 promise 처리 후 로드 호출', async () => {
    const [identityLoader, loadCalls] = getIdentityLoader<string>();

    await Promise.all([
      identityLoader.load('A'),
      Promise.resolve()
        .then(() => Promise.resolve())
        .then(() => {
          identityLoader.load('B');
          Promise.resolve()
            .then(() => Promise.resolve())
            .then(() => {
              identityLoader.load('C');
              Promise.resolve()
                .then(() => Promise.resolve())
                .then(() => {
                  identityLoader.load('D');
                });
            });
        }),
    ]);

    expect(loadCalls).toEqual([['A', 'B', 'C', 'D']]);
  });
});

describe('DataLoader with throw error', () => {
  it('Loader creation requires a function', () => {
    expect(() => {
      // @ts-expect-error : allow error for test
      new DataLoader();
    }).toThrow('DataLoader > batchLoader must be a function: undefined');

    expect(() => {
      // @ts-expect-error : allow error for test
      new DataLoader({});
    }).toThrow('DataLoader > batchLoader must be a function: [object Object]');
  });

  it('Load function requires an key', () => {
    const identityLoader = new DataLoader<number, number>(async (keys) => keys);

    expect(() => {
      // @ts-expect-error : allow error for test
      identityLoader.load();
    }).toThrow("DataLoader > load's key must be a non-nil value: undefined");

    expect(() => {
      // @ts-expect-error : allow error for test
      identityLoader.load(null);
    }).toThrow("DataLoader > load's key must be a non-nil value: null");
    expect(() => {
      identityLoader.load(0);
    }).not.toThrow();
  });

  it('LoadMany function requires a list of key', () => {
    const identityLoader = new DataLoader<number, number>(async (keys) => keys);

    expect(() => {
      // @ts-expect-error : allow error for test
      identityLoader.loadMany();
    }).toThrow(
      "DataLoader > loadMany's keys must be an array-like object: undefined",
    );

    expect(() => {
      // @ts-expect-error : allow error for test
      identityLoader.loadMany(1, 2, 3);
    }).toThrow("DataLoader > loadMany's keys must be an array-like object: 1");

    expect(() => {
      identityLoader.loadMany([]);
    }).not.toThrow();
  });

  it('Batch function must return a Promise, not null', async () => {
    // @ts-expect-error : allow error for test
    const badLoader = new DataLoader<number, number>(() => null);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>.',
    );
  });

  it('Batch function must return a Promise, not error synchronously', async () => {
    const badLoader = new DataLoader<number>(() => {
      throw new Error('Mock Synchronous Error');
    });

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe('Mock Synchronous Error');
  });

  it('Batch function must return a Promise, not a value', async () => {
    // Note: this is returning the keys directly, rather than a promise to keys.
    // @ts-expect-error : allow error for test
    const badLoader = new DataLoader<number, number>((keys) => keys);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>.',
    );
  });

  it('Batch function must return a Promise of an Array, not null', async () => {
    // Note: this resolves to undefined
    //@ts-expect-error : asd
    const badLoader = new DataLoader<number, number>(async () => null);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned a non-array value: null',
    );
  });

  it('Batch function must promise an Array of correct length', async () => {
    // Note: this resolves to empty array
    const badLoader = new DataLoader<number, number>(async () => []);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned an array with a length of 0 while the batch had a length of 1',
    );
  });

  it('Cache should have get, set, delete, and clear methods', async () => {
    class IncompleteMap {
      get() {}
    }

    expect(() => {
      const incompleteMap = new IncompleteMap();
      const options = { cache: incompleteMap };
      // @ts-expect-error : allow error for test
      new DataLoader(async (keys) => keys, options);
    }).toThrow(
      'DataLoaderOptions > cache must additionally implement the following methods: set, delete, clear',
    );
  });

  it('Requires a number for maxBatchSize', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new DataLoader(async (keys) => keys, { maxBatchSize: null }),
    ).toThrow(
      'DataLoaderOptions > maxBatchSize must be a positive integer : null',
    );
  });

  it('Requires a positive number for maxBatchSize', () => {
    expect(
      () => new DataLoader(async (keys) => keys, { maxBatchSize: 0 }),
    ).toThrow(
      'DataLoaderOptions > maxBatchSize must be a positive integer : 0',
    );
  });

  it('Requires a function for cacheKeyFn', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new DataLoader(async (keys) => keys, { cacheKeyFn: null }),
    ).toThrow('cacheKeyFn must be a function: null');
  });

  it('Requires a function for batchScheduleFn', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new DataLoader(async (keys) => keys, { batchScheduler: null }),
    ).toThrow('DataLoaderOptions > batchScheduler must be a function: null');
  });
});
