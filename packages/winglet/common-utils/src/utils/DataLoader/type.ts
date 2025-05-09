import type { Fn } from '@aileron/declare';

/**
 * 배치로 데이터를 로드하는 함수 타입
 * @template Key - 로드할 값의 키 타입
 * @template Value - 반환할 값의 타입
 */
export type BatchLoader<Key, Value> = (
  /** 로드할 키 배열 */
  keys: ReadonlyArray<Key>,
  /** 로드된 값 또는 오류 배열의 Promise */
) => Promise<ReadonlyArray<Value | Error>>;

/**
 * DataLoader 구성 옵션
 * @template Key - 로드할 키의 타입
 * @template Value - 반환할 값의 타입
 * @template CacheKey - 캐시 키의 타입 (기본값: Key)
 */
export type DataLoaderOptions<Key, Value, CacheKey = Key> = {
  /** 로더의 이름 */
  name?: string;
  /** 캐시 맵 객체 또는 false(비활성화) */
  cache?: MapLike<CacheKey, Promise<Value>> | false;
  /** 배치 실행 스케줄링 함수 */
  batchScheduler?: Fn<[task: Fn]>;
  /** 로더 키를 캐시 키로 변환하는 함수 */
  cacheKeyFn?: Fn<[key: Key], CacheKey>;
} & (
  | {
      /** 한 번에 처리할 최대 배치 크기 */
      maxBatchSize?: number;
    }
  | {
      /** 배치 처리 비활성화 옵션 */
      disableBatch: true;
    }
);

/**
 * Map 인터페이스를 따르는 캐싱 저장소 타입
 * @template Key - 캐시 키 타입
 * @template Value - 캐시 값 타입
 */
export type MapLike<Key, Value> = {
  /** 키에 해당하는 값을 가져오거나 undefined 반환 */
  get(key: Key): Value | undefined;
  /** 키에 값을 설정 */
  set(key: Key, value: Value): any;
  /** 키와 해당 값을 삭제 */
  delete(key: Key): any;
  /** 모든 키-값 삭제 */
  clear(): any;
};

/**
 * 배치 크기만큼 로드 작업을 그룹화하는 타입
 * @template Key - 로드할 키 타입
 * @template Value - 로드될 값 타입
 */
export type Batch<Key, Value> = {
  /** 배치가 처리되었는지 여부 */
  isResolved: boolean;
  /** 로드할 키 배열 */
  keys: Array<Key>;
  /** 각 키에 해당하는 Promise의 resolve/reject 함수 */
  promises: Array<{
    resolve: Fn<[value: Value]>;
    reject: Fn<[error: Error]>;
  }>;
  /** 캐시 히트 처리를 위한 콜백 함수 배열 */
  cacheHits?: Array<Fn>;
};
