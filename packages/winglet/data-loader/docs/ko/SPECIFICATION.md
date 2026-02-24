# @winglet/data-loader — 명세서

**버전**: 0.10.0
**패키지**: `@winglet/data-loader`
**설명**: GraphQL DataLoader에서 영감을 받은 비동기 데이터 패칭용 배칭 및 캐싱 유틸리티

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [아키텍처](#아키텍처)
4. [API 레퍼런스](#api-레퍼런스)
   - [DataLoader 클래스](#dataloader-클래스)
   - [DataLoaderOptions](#dataloaderoptions)
   - [BatchLoader](#batchloader)
   - [MapLike](#maplike)
   - [타입 정의](#타입-정의)
5. [사용 패턴](#사용-패턴)
   - [N+1 문제 해결](#n1-문제-해결)
   - [캐싱 전략](#캐싱-전략)
6. [고급 예제](#고급-예제)

---

## 설치

```bash
npm install @winglet/data-loader
yarn add @winglet/data-loader
pnpm add @winglet/data-loader
```

**요구 사항**: Node.js 14.0.0 이상 또는 ES2020을 지원하는 최신 브라우저.

---

## 빠른 시작

```typescript
import { DataLoader } from '@winglet/data-loader';

// 1. 배치 로더 함수 정의
async function batchLoadUsers(ids: ReadonlyArray<string>) {
  const users = await db.query('SELECT * FROM users WHERE id IN (?)', [[...ids]]);
  // 결과는 반드시 입력 키와 동일한 순서로 반환해야 합니다
  return ids.map(id => users.find(u => u.id === id) ?? new Error(`User ${id} not found`));
}

// 2. DataLoader 인스턴스 생성
const userLoader = new DataLoader(batchLoadUsers);

// 3. 개별 아이템 로드 — 자동으로 배칭됩니다
const [user1, user2, user3] = await Promise.all([
  userLoader.load('user-1'),
  userLoader.load('user-2'),
  userLoader.load('user-3'),
]);
// → 데이터베이스 쿼리는 단 1회만 실행됩니다
```

---

## 아키텍처

### 개요

`@winglet/data-loader`는 세 가지 관심사로 구조화됩니다:

| 레이어 | 파일 | 역할 |
|---|---|---|
| 공개 API | `DataLoader.ts`, `index.ts` | 사용자 대면 클래스 및 익스포트 |
| 설정 | `utils/prepare.ts` | 옵션 유효성 검사 및 기본값 처리 |
| 배치 실행 | `utils/dispatch.ts` | 배치 생명주기 및 오류 디스패치 |
| 오류 타입 | `utils/error.ts` | `DataLoaderError` 정의 |

### 배칭 메커니즘

배칭은 JavaScript 이벤트 루프를 활용합니다. `load(key)`가 호출되면:

1. 키가 **현재 배치**에 추가됩니다.
2. 스케줄러가 등록되지 않은 경우, 설정된 `batchScheduler`(기본값: `process.nextTick`)로 스케줄러를 등록합니다.
3. 동일 틱 내에서 동기적으로 발생하는 모든 `load()` 호출이 같은 배치에 누적됩니다.
4. 스케줄러가 실행되면 `__dispatchBatch__`가 누적된 모든 키로 `BatchLoader`를 호출합니다.

```
틱 N (동기):
  load('A') → 배치에 추가, nextTick 등록
  load('B') → 배치에 추가 (스케줄러 이미 등록됨)
  load('C') → 배치에 추가

틱 N+1 (nextTick):
  batchLoader(['A', 'B', 'C'])  ← 단일 호출
```

`await` 경계를 넘는 호출은 별도의 배치로 처리됩니다.

### 캐싱 메커니즘

- 캐시는 `cacheKeyFn(key)`의 결과를 키로 하여 `Promise<Value>` 항목을 저장합니다.
- **최초** `load(key)` 호출 시 Promise가 생성되어 캐시에 저장되고 배치에 추가됩니다.
- **이후** 동일 키에 대한 `load(key)` 호출 시 캐시된 Promise를 감싸는 새 Promise가 반환됩니다(**캐시 히트**). 배치에는 추가되지 않습니다.
- `prime(key, value)`는 배치 로드 없이 캐시에 직접 삽입합니다.

### 오류 전파

- `BatchLoader`가 동기적으로 예외를 발생시키거나 비-Promise를 반환하면 `failedDispatch`를 통해 배치의 모든 키가 거부되고 캐시 항목이 삭제됩니다.
- 반환된 배열의 길이가 키 배열과 다르면 모든 키가 `DataLoaderError`로 거부됩니다.
- 개별 결과가 `Error` 인스턴스인 경우 해당 키의 Promise가 그 오류로 거부됩니다.

---

## API 레퍼런스

### DataLoader 클래스

```typescript
class DataLoader<Key = string, Value = any, CacheKey = Key> {
  readonly name: string | null;

  constructor(
    batchLoader: BatchLoader<Key, Value>,
    options?: DataLoaderOptions<Key, Value, CacheKey>,
  );

  load(key: Key): Promise<Value>;
  loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>;
  clear(key: Key): this;
  clearAll(): this;
  prime(key: Key, value: Value | Promise<Value> | Error): this;
}
```

#### `load(key: Key): Promise<Value>`

단일 키의 값을 로드합니다. 자동으로 현재 배치에 합쳐지며 결과가 캐시됩니다.

- `key`가 `null` 또는 `undefined`이면 `DataLoaderError`(코드: `INVALID_KEY`)를 **즉시 throws**합니다.
- 동일 캐시 범위 내에서 같은 키에 대해 동일한 Promise를 반환합니다(중복 제거).

```typescript
const user = await userLoader.load('user-42');
```

#### `loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>`

여러 키의 값을 로드합니다. 키별 실패는 예외를 throw하는 대신 결과 배열의 `Error` 인스턴스로 반환되어 부분 성공이 기본 동작입니다.

- `keys`가 배열형 객체가 아니면 `DataLoaderError`(코드: `INVALID_KEYS`)를 **throws**합니다.
- 각 요소는 해결된 `Value` 또는 `Error`입니다.

```typescript
const results = await userLoader.loadMany(['user-1', 'user-2', 'missing']);
// results[2]는 Error 인스턴스이며 throw되지 않습니다
const users = results.filter((r): r is User => !(r instanceof Error));
```

#### `clear(key: Key): this`

지정된 키의 캐시 항목을 제거합니다. 메서드 체이닝을 위해 `this`를 반환합니다. 캐싱이 비활성화된 경우 no-op입니다.

```typescript
userLoader.clear('user-42'); // 변경 후 무효화
```

#### `clearAll(): this`

전체 캐시를 비웁니다. 메서드 체이닝을 위해 `this`를 반환합니다. 캐싱이 비활성화된 경우 no-op입니다.

```typescript
userLoader.clearAll(); // 예: 사용자 로그아웃 시
```

#### `prime(key: Key, value: Value | Promise<Value> | Error): this`

키에 대한 캐시를 수동으로 초기화합니다. 다음의 경우 no-op입니다:
- 캐싱이 비활성화된 경우(`cache: false`).
- 해당 키에 이미 캐시 항목이 존재하는 경우.

일반 값, Promise, 또는 Error를 허용합니다. 메서드 체이닝을 위해 `this`를 반환합니다.

```typescript
userLoader.prime('user-1', fetchedUser);              // 일반 값
userLoader.prime('user-2', somePromise);              // Promise
userLoader.prime('deleted', new Error('Not found'));   // Error
```

---

### DataLoaderOptions

```typescript
type DataLoaderOptions<Key, Value, CacheKey = Key> = {
  name?: string;
  cache?: MapLike<CacheKey, Promise<Value>> | false;
  batchScheduler?: (task: () => void) => void;
  cacheKeyFn?: (key: Key) => CacheKey;
} & (
  | { maxBatchSize?: number }
  | { disableBatch: true }
);
```

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `name` | `string` | `null` | 로더의 선택적 레이블. `loader.name`으로 접근 가능. 로깅 및 디버깅에 유용합니다. |
| `cache` | `MapLike<CacheKey, Promise<Value>> \| false` | `new Map()` | 커스텀 캐시 구현체. `false`를 전달하면 캐싱이 완전히 비활성화됩니다. |
| `batchScheduler` | `(task: () => void) => void` | `process.nextTick` | 배치 디스패치 시점을 제어합니다. `queueMicrotask`, `setTimeout`, `requestAnimationFrame`, 또는 즉시 실행을 위한 `fn => fn()`으로 교체 가능합니다. |
| `cacheKeyFn` | `(key: Key) => CacheKey` | identity (`k => k`) | 로더 키를 캐시 키로 변환합니다. 키가 객체인 경우(참조 동등성 실패) 필수입니다. |
| `maxBatchSize` | `number` | `Infinity` | 배치당 최대 키 수. 초과 시 새 배치가 자동으로 시작됩니다. 양의 정수여야 합니다. |
| `disableBatch` | `true` | — | 배칭 비활성화. 각 `load()` 호출이 즉시 디스패치됩니다(`maxBatchSize: 1`과 동일). `maxBatchSize`와 상호 배타적입니다. |

---

### BatchLoader

```typescript
type BatchLoader<Key, Value> = (
  keys: ReadonlyArray<Key>,
) => Promise<ReadonlyArray<Value | Error>>;
```

`DataLoader` 생성자의 첫 번째 인자로 전달하는 함수입니다.

**계약 조건**:
1. 읽기 전용 키 배열을 받습니다 — 입력 배열을 변경하지 마세요.
2. 배열로 resolve되는 `Promise`를 반환해야 합니다.
3. 반환된 배열의 길이는 입력 키 배열과 **정확히 동일**해야 합니다.
4. 인덱스 `i`의 값은 인덱스 `i`의 키에 대응해야 합니다.
5. 키별 실패는 throw하는 예외가 아닌 `Error` 인스턴스로 표현하세요.

규칙 3 또는 4를 위반하면 해당 배치의 모든 키가 `DataLoaderError`로 거부됩니다.

---

### MapLike

```typescript
type MapLike<Key, Value> = {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): any;
  delete(key: Key): any;
  clear(): any;
};
```

커스텀 캐시 구현체가 만족해야 하는 인터페이스입니다. 네이티브 `Map` 클래스는 이 인터페이스를 만족합니다. 이 네 가지 메서드를 구현하는 LRU 캐시, Redis 어댑터, 기타 스토어와 호환됩니다.

---

### 타입 정의

```typescript
// @winglet/data-loader에서 재익스포트
import type { DataLoaderOptions } from '@winglet/data-loader';

// 내부 타입 (익스포트되지 않음, 참고용)
type Batch<Key, Value> = {
  isResolved: boolean;
  keys: Array<Key>;
  promises: Array<{ resolve: (value: Value) => void; reject: (error: Error) => void }>;
  cacheHits?: Array<() => void>;
};
```

---

## 사용 패턴

### N+1 문제 해결

N+1 문제는 항목 목록에서 항목별로 관련 리소스를 로드할 때 발생합니다:

```typescript
// DataLoader 미사용 — N+1 쿼리 발생
async function getPosts() {
  const posts = await db.findAllPosts();           // 1개 쿼리
  return Promise.all(
    posts.map(post => db.findUser(post.authorId)), // N개 쿼리
  );
}

// DataLoader 사용 — N에 무관하게 총 2개 쿼리
const userLoader = new DataLoader(async (ids: ReadonlyArray<string>) => {
  const users = await db.findUsersByIds([...ids]);
  return ids.map(id => users.find(u => u.id === id) ?? new Error(`Not found: ${id}`));
});

async function getPosts() {
  const posts = await db.findAllPosts();                    // 1개 쿼리
  return Promise.all(
    posts.map(post => userLoader.load(post.authorId)),      // 1개 배치 쿼리
  );
}
```

#### GraphQL 리졸버 패턴

```typescript
// 교차 요청 캐시 오염을 방지하기 위해 요청별 로더를 생성합니다
function createLoaders() {
  return {
    users: new DataLoader(batchLoadUsers),
    posts: new DataLoader(batchLoadPosts),
  };
}

const resolvers = {
  Post: {
    author: (_post, _args, { loaders }) => loaders.users.load(_post.authorId),
  },
  User: {
    posts: (_user, _args, { loaders }) => loaders.posts.load(_user.id),
  },
};

// Express 미들웨어 — 요청별 새 로더
app.use('/graphql', (req, res, next) => {
  graphqlHTTP({ schema, context: { loaders: createLoaders() } })(req, res, next);
});
```

---

### 캐싱 전략

#### 기본 캐시 (Map — 무제한)

단기 요청 컨텍스트(예: GraphQL 리졸버, REST 핸들러)에 적합합니다. 캐시는 로더 인스턴스가 살아있는 동안만 유지됩니다.

```typescript
const loader = new DataLoader(batchLoad); // 내부적으로 new Map() 사용
```

#### 캐시 비활성화

데이터가 자주 변경되어 오래된 읽기가 허용되지 않을 때 사용합니다. 배칭은 여전히 동작하며, 중복 제거만 제거됩니다.

```typescript
const realtimeLoader = new DataLoader(batchLoad, { cache: false });
```

#### TTL 기반 캐시

```typescript
class TtlMap<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();
  constructor(private ttlMs: number) {}
  get(key: K) {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return undefined; }
    return e.value;
  }
  set(key: K, value: V) { this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs }); }
  delete(key: K) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const cachedLoader = new DataLoader(batchLoad, {
  cacheMap: new TtlMap(60_000), // 1분 TTL
});
```

#### 변경 후 캐시 일관성 유지

```typescript
async function updateUser(id: string, patch: Partial<User>) {
  const updated = await api.patch(`/users/${id}`, patch);
  // 오래된 항목을 무효화하고 새 데이터로 초기화
  userLoader.clear(id).prime(id, updated);
  return updated;
}
```

---

## 고급 예제

### 대용량 데이터셋을 위한 maxBatchSize

```typescript
// 데이터베이스 IN 절 한도 초과 방지
const userLoader = new DataLoader(batchLoadUsers, { maxBatchSize: 100 });
// 250개 동시 로드 → 3개 배치: 100 + 100 + 50
```

### 커스텀 스케줄러

```typescript
// 즉시 디스패치 — 테스트 또는 레이턴시 민감 코드에 유용
const testLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => fn(),
});

// 더 넓은 배칭 윈도우 — 배치당 더 많은 키
const timedLoader = new DataLoader(batchLoad, {
  batchScheduler: (fn) => setTimeout(fn, 10),
});
```

### cacheKeyFn을 사용한 객체 키

```typescript
interface SearchKey { term: string; page: number; limit: number }

const searchLoader = new DataLoader<SearchKey, SearchResult[], string>(
  async (queries) => Promise.all(queries.map(q => search(q))),
  {
    cacheKeyFn: ({ term, page, limit }) => `${term}:${page}:${limit}`,
  },
);
```

### loadMany를 사용한 오류 처리

```typescript
const results = await loader.loadMany(ids);

const { successes, failures } = results.reduce(
  (acc, result, i) => {
    if (result instanceof Error) {
      acc.failures.push({ id: ids[i], error: result });
    } else {
      acc.successes.push(result);
    }
    return acc;
  },
  { successes: [] as Value[], failures: [] as { id: string; error: Error }[] },
);
```

### 싱글톤 로더를 위한 배칭 비활성화

```typescript
// 각 load가 즉시 디스패치됩니다 — 병합 없음
const immediateLoader = new DataLoader(batchLoad, { disableBatch: true });
```
