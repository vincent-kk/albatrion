import type { Fn } from '@aileron/declare';

import { noopFunction } from '@/common-utils/constant';
import { InvalidTypeError } from '@/common-utils/errors/InvalidTypeError';
import { isArrayLike } from '@/common-utils/utils/filter/isArrayLike';
import { isFunction } from '@/common-utils/utils/filter/isFunction';
import { isNil } from '@/common-utils/utils/filter/isNil';

import type { Batch, BatchLoader, DataLoaderOptions, MapLike } from './type';
import {
  createBatch,
  failedDispatch,
  resolveCacheHits,
} from './utils/dispatch';
import {
  prepareBatchLoader,
  prepareBatchScheduler,
  prepareCacheKeyFn,
  prepareCacheMap,
  prepareMaxBatchSize,
} from './utils/prepare';

/**
 * 데이터 로딩 및 캐싱을 관리하는 클래스
 * 일관된 패턴을 사용하여 데이터를 배치로 로딩하고 캐싱하는 기능 제공
 * @template Key - 데이터 로딩을 위한 키 타입
 * @template Value - 로딩될 값의 타입
 * @template CacheKey - 캐시에 사용되는 키 타입
 */
export class DataLoader<Key = string, Value = any, CacheKey = Key> {
  /** DataLoader의 이름 */
  public readonly name: string | null = null;

  /** 배치 로더 함수 - 키 집합을 값 집합으로 변환 */
  readonly #batchLoader: BatchLoader<Key, Value>;
  /** 한 배치에서 처리할 최대 키 개수 */
  readonly #maxBatchSize: number;
  /** 배치 실행을 스케줄링하는 함수 */
  readonly #batchScheduler: Fn<[task: Fn]>;
  /** 캐시 맵 객체 - 캐싱이 비활성화된 경우 null */
  readonly #cacheMap: MapLike<CacheKey, Promise<Value>> | null;
  /** 로더 키를 캐시 키로 변환하는 함수 */
  readonly #cacheKeyFn: Fn<[key: Key], CacheKey>;

  /** 현재 처리 중인 배치 */
  #currentBatch: Batch<Key, Value> | null = null;

  /**
   * 현재 배치를 가져오거나 새 배치를 생성하는 getter
   * @returns 현재 사용 가능한 배치 혹은 새로 생성된 배치
   */
  get #batch(): Batch<Key, Value> {
    const batch = this.#currentBatch;
    if (batch && !batch.isResolved && batch.keys.length < this.#maxBatchSize)
      return batch;
    const nextBatch = createBatch<Key, Value>();
    this.#currentBatch = nextBatch;
    this.#batchScheduler(() => {
      this.#dispatchBatch(nextBatch);
    });
    return nextBatch;
  }

  /**
   * DataLoader 생성자
   * @param batchLoader - 배치 로딩을 수행하는 함수
   * @param options - DataLoader 구성 옵션
   */
  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  ) {
    // 반드시 비동기 배치 로더 함수가 제공되어야 함
    this.#batchLoader = prepareBatchLoader(batchLoader);
    // 최대 배치 크기 설정 (기본값: Infinity)
    this.#maxBatchSize = prepareMaxBatchSize(options);
    // 배치 스케줄러 설정 (기본값: nextTick)
    this.#batchScheduler = prepareBatchScheduler(options?.batchScheduler);
    // 캐싱 맵 설정 (비활성화된 경우: null)
    this.#cacheMap = prepareCacheMap(options?.cache);
    // 캐시 키 함수 설정 (기본값: 정체성 함수)
    this.#cacheKeyFn = prepareCacheKeyFn(options?.cacheKeyFn);
    // 선택적 이름 설정
    this.name = options?.name ?? null;
  }

  /**
   * 단일 키에 해당하는 값을 로드함
   * 배치와 캐싱을 활용하여 효율적으로 데이터 로드
   * @param key - 로드할 값의 키
   * @returns 로드된 값의 Promise
   * @throws {InvalidTypeError} 키가 null 또는 undefined인 경우
   */
  load(key: Key): Promise<Value> {
    if (isNil(key))
      throw new InvalidTypeError(
        'INVALID_KEY',
        `DataLoader > load's key must be a non-nil value: ${key}`,
        { key },
      );
    const batch = this.#batch;
    const cacheMap = this.#cacheMap;
    const cacheKey = cacheMap ? this.#cacheKeyFn(key) : null;
    if (cacheMap && cacheKey) {
      const cachedPromise = cacheMap.get(cacheKey);
      if (cachedPromise) {
        const cacheHits = batch.cacheHits || (batch.cacheHits = []);
        return new Promise((resolve) => {
          cacheHits.push(() => {
            resolve(cachedPromise);
          });
        });
      }
    }
    batch.keys.push(key);
    const promise = new Promise<Value>((resolve, reject) => {
      batch.promises.push({ resolve, reject });
    });
    if (cacheMap && cacheKey) cacheMap.set(cacheKey, promise);
    return promise;
  }

  /**
   * 여러 키에 해당하는 값들을 로드함
   * 하나의 키가 실패해도 다른 값들은 정상적으로 수집함
   * @param keys - 로드할 값의 키 배열
   * @returns 각 키에 해당하는 값 또는 오류의 배열 Promise
   * @throws {InvalidTypeError} keys가 배열 형태가 아닌 경우
   */
  loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>> {
    if (!isArrayLike(keys))
      throw new InvalidTypeError(
        'INVALID_KEYS',
        `DataLoader > loadMany's keys must be an array-like object: ${keys}`,
        { keys },
      );
    const loadPromises = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      loadPromises[i] = this.load(keys[i]).catch((error) => error);
    }
    return Promise.all(loadPromises);
  }

  /**
   * 지정된 키를 캐시에서 삭제
   * @param key - 캐시에서 삭제할 키
   * @returns 메서드 체이닝을 위한 this 객체
   */
  clear(key: Key): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      cacheMap.delete(cacheKey);
    }
    return this;
  }

  /**
   * 모든 키를 캐시에서 삭제
   * @returns 메서드 체이닝을 위한 this 객체
   */
  clearAll(): this {
    this.#cacheMap?.clear();
    return this;
  }

  /**
   * 주어진 키에 값을 갱신하여 프로그래밍 방식으로 캐싱
   * @param key - 값을 연결할 키
   * @param value - 상해할 값, Promise 혹은 오류
   * @returns 메서드 체이닝을 위한 this 객체
   */
  prime(key: Key, value: Value | Promise<Value> | Error): this {
    const cacheMap = this.#cacheMap;
    if (cacheMap) {
      const cacheKey = this.#cacheKeyFn(key);
      if (cacheMap.get(cacheKey) === undefined) {
        let promise: Promise<Value>;
        if (value instanceof Error) {
          promise = Promise.reject(value);
          promise.catch(noopFunction);
        } else {
          promise = Promise.resolve(value);
        }
        cacheMap.set(cacheKey, promise);
      }
    }
    return this;
  }

  /**
   * 배치를 처리하는 내부 메서드
   * 배치 로더를 통해 값을 로드하고 해당 값을 제공된
   * Promise에 전달
   * @param batch - 처리할 배치 객체
   */
  #dispatchBatch(batch: Batch<Key, Value>): void {
    batch.isResolved = true;
    if (!batch.keys.length) return resolveCacheHits(batch);
    const batchPromise = this.#stableBatchLoader(batch.keys);
    if (batchPromise instanceof Error)
      return failedDispatch(this, batch, batchPromise);
    if (!isFunction(batchPromise?.then))
      return failedDispatch(
        this,
        batch,
        new InvalidTypeError(
          'INVALID_BATCH_LOADER',
          'DataLoader > batchLoader must be a function that returns a Promise<Array<value>>.',
          { batchPromise },
        ),
      );
    batchPromise
      .then((values) => {
        if (!isArrayLike(values))
          throw new InvalidTypeError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned a non-array value: ${values}`,
            { values },
          );
        if (values.length !== batch.keys.length)
          throw new InvalidTypeError(
            'INVALID_BATCH_LOADER',
            `DataLoader > batchLoader must be a function that returns a Promise<Array<value>>, but it returned an array with a length of ${values.length} while the batch had a length of ${batch.keys.length}`,
            { values, keys: batch.keys },
          );
        resolveCacheHits(batch);
        for (let i = 0; i < batch.promises.length; i++) {
          const value = values[i];
          if (value instanceof Error) batch.promises[i].reject(value);
          else batch.promises[i].resolve(value);
        }
      })
      .catch((error) => {
        failedDispatch(this, batch, error);
      });
  }

  /**
   * 안정적인 배치 로딩 실행을 위한 래퍼 함수
   * 배치 로더 실행 중 발생하는 예외를 캐치하여 처리
   * @param keys - 로드할 키 배열
   * @returns 배치 로더의 결과 또는 오류
   */
  #stableBatchLoader(
    keys: ReadonlyArray<Key>,
  ): ReturnType<BatchLoader<Key, Value>> | Error {
    try {
      return this.#batchLoader(keys);
    } catch (error: any) {
      return error;
    }
  }
}
