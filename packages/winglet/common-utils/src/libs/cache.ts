/**
 * WeakMap 기반의 캐시 또는 멤오이제이션 객체를 생성하는 팩토리 함수
 * 객체 키를 사용하여 값을 저장하고 회수하는 기능 제공
 * @template V - 저장될 값의 타입
 * @template K - 키 객체의 타입 (반드시 객체여야 함)
 * @param defaultValue - 초기화를 위한 기본 WeakMap
 * @returns 캐시 관리 함수를 포함하는 객체
 */
export const weakMapCacheFactory = <V, K extends object = object>(
  defaultValue?: WeakMap<K, V>,
) => {
  // 기본값이 제공되지 않으면 새로운 WeakMap 생성
  const cache = defaultValue ?? (new WeakMap() as WeakMap<K, V>);
  return {
    /**
     * 원래 WeakMap 객체를 반환
     */
    get raw() {
      return cache;
    },
    /**
     * 주어진 키가 캐시에 존재하는지 확인
     * @param key - 확인할 키
     * @returns 키 존재 여부
     */
    has: (key: K) => cache.has(key),
    /**
     * 주어진 키에 해당하는 값을 가져옴
     * @param key - 값을 찾기 위한 키
     * @returns 키에 해당하는 값 또는 undefined
     */
    get: (key: K) => cache.get(key),
    /**
     * 주어진 키에 값을 저장
     * @param key - 저장할 키
     * @param value - 저장할 값
     * @returns 콤 체이닝을 위한 캐시 객체 자신
     */
    set: (key: K, value: V) => cache.set(key, value),
    /**
     * 캐시에서 키와 해당 값을 삭제
     * @param key - 삭제할 키
     * @returns 삭제 성공 여부
     */
    delete: (key: K) => cache.delete(key),
  };
};

/**
 * Map 기반의 캐시 객체를 생성하는 팩토리 함수
 * 문자열 키를 사용하여 값을 저장하고 관리하는 기능 제공
 * @template M - Map 타입
 * @param defaultValue - 초기화를 위한 기본 Map 객체 또는 엔트리
 * @returns 캐시 관리 함수를 포함하는 객체
 */
export const mapCacheFactory = <M extends Map<string, any>>(
  defaultValue?: M | ReturnType<M['entries']>,
) => {
  // 기본값이 Map 인스턴스라면 그대로 사용, 아니면 새 Map 생성
  const cache =
    defaultValue instanceof Map ? defaultValue : new Map(defaultValue || []);
  return {
    /**
     * 원래 Map 객체를 반환
     */
    get raw() {
      return cache;
    },
    /**
     * 주어진 키에 값을 저장
     * @param key - 저장할 키
     * @param value - 저장할 값
     * @returns 콤 체이닝을 위한 캐시 객체 자신
     */
    set: (key: Parameters<M['set']>[0], value: Parameters<M['set']>[1]) =>
      cache.set(key, value),
    /**
     * 주어진 키가 캐시에 존재하는지 확인
     * @param key - 확인할 키
     * @returns 키 존재 여부
     */
    has: (key: Parameters<M['has']>[0]) => cache.has(key),
    /**
     * 주어진 키에 해당하는 값을 가져옴
     * @param key - 값을 찾기 위한 키
     * @returns 키에 해당하는 값 또는 undefined
     */
    get: (key: Parameters<M['get']>[0]) => cache.get(key),
    /**
     * 캐시에서 키와 해당 값을 삭제
     * @param key - 삭제할 키
     * @returns 삭제 성공 여부
     */
    delete: (key: Parameters<M['delete']>[0]) => cache.delete(key),
    /**
     * 캐시에 저장된 요소 수 반환
     * @returns 요소 수
     */
    size: () => cache.size,
    /**
     * 캐시의 모든 키 반환
     * @returns 키 반복자
     */
    keys: () => cache.keys(),
    /**
     * 캐시의 모든 값 반환
     * @returns 값 반복자
     */
    values: () => cache.values(),
    /**
     * 캐시의 모든 키-값 쌍 반환
     * @returns 키-값 쌍 반복자
     */
    entries: () => cache.entries(),
    /**
     * 캐시의 모든 요소 삭제
     */
    clear: () => cache.clear(),
  };
};
