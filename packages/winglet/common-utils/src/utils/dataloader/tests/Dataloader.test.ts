import { describe, expect, it, vi } from 'vitest';

import { Dataloader } from '../Dataloader';

describe('Dataloader primary api', () => {
  describe('기본 기능 테스트', () => {
    it('단일 키 로드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataloader = new Dataloader(batchLoader);

      const result = await dataloader.load('key1');
      expect(result).toBe('value1');
      expect(batchLoader).toHaveBeenCalledWith(['key1']);
    });

    it('여러 키 동시 로드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1', 'value2']);
      const dataloader = new Dataloader(batchLoader);

      const [result1, result2] = await Promise.all([
        dataloader.load('key1'),
        dataloader.load('key2'),
      ]);

      expect(result1).toBe('value1');
      expect(result2).toBe('value2');
      expect(batchLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('캐시 기능 테스트', () => {
    it('캐시된 값 재사용 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataloader = new Dataloader(batchLoader);

      const result1 = await dataloader.load('key1');
      const result2 = await dataloader.load('key1');

      expect(result1).toBe('value1');
      expect(result2).toBe('value1');
      expect(batchLoader).toHaveBeenCalledTimes(1);
    });

    it('clear 메서드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1']);
      const dataloader = new Dataloader(batchLoader);

      await dataloader.load('key1');
      dataloader.clear('key1');
      await dataloader.load('key1');

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });

    it('clearAll 메서드 테스트', async () => {
      const batchLoader = vi.fn().mockResolvedValue(['value1', 'value2']);
      const dataloader = new Dataloader(batchLoader);

      await Promise.all([dataloader.load('key1'), dataloader.load('key2')]);
      dataloader.clearAll();
      await Promise.all([dataloader.load('key1'), dataloader.load('key2')]);

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });
  });

  describe('에러 처리 테스트', () => {
    it('로더 에러 처리 테스트', async () => {
      const error = new Error('로드 실패');
      const batchLoader = vi.fn().mockRejectedValue(error);
      const dataloader = new Dataloader(batchLoader);

      await expect(dataloader.load('key1')).rejects.toThrow('로드 실패');
    });

    it('loadMany 에러 처리 테스트', async () => {
      const error = new Error('로드 실패');
      const batchLoader = vi.fn().mockRejectedValue(error);
      const dataloader = new Dataloader(batchLoader);

      const results = await dataloader.loadMany(['key1', 'key2']);
      expect(results).toEqual([error, error]);
    });
  });

  describe('배치 크기 제한 테스트', () => {
    it('maxBatchSize 옵션 테스트', async () => {
      const batchLoader = vi
        .fn()
        .mockResolvedValueOnce(['value1', 'value2'])
        .mockResolvedValueOnce(['value3']);

      const dataloader = new Dataloader(batchLoader, { maxBatchSize: 2 });

      await Promise.all([
        dataloader.load('key1'),
        dataloader.load('key2'),
        dataloader.load('key3'),
      ]);

      expect(batchLoader).toHaveBeenCalledTimes(2);
    });
  });

  describe('prime 메서드 테스트', () => {
    it('값 미리 설정 테스트', async () => {
      const batchLoader = vi.fn();
      const dataloader = new Dataloader(batchLoader);

      dataloader.prime('key1', 'value1');
      const result = await dataloader.load('key1');

      expect(result).toBe('value1');
      expect(batchLoader).not.toHaveBeenCalled();
    });

    it('에러 미리 설정 테스트', async () => {
      const batchLoader = vi.fn();
      const dataloader = new Dataloader(batchLoader);
      const error = new Error('미리 설정된 에러');

      dataloader.prime('key1', error);
      await expect(dataloader.load('key1')).rejects.toThrow('미리 설정된 에러');
      expect(batchLoader).not.toHaveBeenCalled();
    });
  });
});

describe('Dataloader with throw error', () => {
  it('Loader creation requires a function', () => {
    expect(() => {
      // @ts-expect-error : allow error for test
      new Dataloader();
    }).toThrow('Dataloader > batchLoader must be a function: undefined');

    expect(() => {
      // @ts-expect-error : allow error for test
      new Dataloader({});
    }).toThrow('Dataloader > batchLoader must be a function: [object Object]');
  });

  it('Load function requires an key', () => {
    const idLoader = new Dataloader<number, number>(async (keys) => keys);

    expect(() => {
      // @ts-expect-error : allow error for test
      idLoader.load();
    }).toThrow('The key must be a non-nil value: undefined');

    expect(() => {
      // @ts-expect-error : allow error for test
      idLoader.load(null);
    }).toThrow('The key must be a non-nil value: null');
    expect(() => {
      idLoader.load(0);
    }).not.toThrow();
  });

  it('LoadMany function requires a list of key', () => {
    const idLoader = new Dataloader<number, number>(async (keys) => keys);

    expect(() => {
      // @ts-expect-error : allow error for test
      idLoader.loadMany();
    }).toThrow('The keys must be an array-like object: undefined');

    expect(() => {
      // @ts-expect-error : allow error for test
      idLoader.loadMany(1, 2, 3);
    }).toThrow('The keys must be an array-like object: 1');

    expect(() => {
      idLoader.loadMany([]);
    }).not.toThrow();
  });

  it('Batch function must return a Promise, not null', async () => {
    // @ts-expect-error : allow error for test
    const badLoader = new Dataloader<number, number>(() => null);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'Dataloader > batchLoader must be a function that returns a Promise<Array<value>>.',
    );
  });

  it('Batch function must return a Promise, not error synchronously', async () => {
    const badLoader = new Dataloader<number, number>(() => {
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
    const badLoader = new Dataloader<number, number>((keys) => keys);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'Dataloader > batchLoader must be a function that returns a Promise<Array<value>>.',
    );
  });

  it('Batch function must return a Promise of an Array, not null', async () => {
    // Note: this resolves to undefined
    //@ts-expect-error : asd
    const badLoader = new Dataloader<number, number>(async () => null);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'Dataloader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned a non-array value: null',
    );
  });

  it('Batch function must promise an Array of correct length', async () => {
    // Note: this resolves to empty array
    const badLoader = new Dataloader<number, number>(async () => []);

    let caughtError;
    try {
      await badLoader.load(1);
    } catch (error) {
      caughtError = error;
    }
    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as any).message).toBe(
      'Dataloader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned an array with a length of 0 while the batch had a length of 1',
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
      new Dataloader(async (keys) => keys, options);
    }).toThrow(
      'DataloaderOptions > cache must additionally implement the following methods: set, delete, clear',
    );
  });

  it('Requires a number for maxBatchSize', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new Dataloader(async (keys) => keys, { maxBatchSize: null }),
    ).toThrow(
      'DataloaderOptions > maxBatchSize must be a positive integer : null',
    );
  });

  it('Requires a positive number for maxBatchSize', () => {
    expect(
      () => new Dataloader(async (keys) => keys, { maxBatchSize: 0 }),
    ).toThrow(
      'DataloaderOptions > maxBatchSize must be a positive integer : 0',
    );
  });

  it('Requires a function for cacheKeyFn', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new Dataloader(async (keys) => keys, { cacheKeyFn: null }),
    ).toThrow('cacheKeyFn must be a function: null');
  });

  it('Requires a function for batchScheduleFn', () => {
    expect(
      () =>
        // @ts-expect-error : allow error for test
        new Dataloader(async (keys) => keys, { batchScheduler: null }),
    ).toThrow('DataloaderOptions > batchScheduler must be a function: null');
  });
});
