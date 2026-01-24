# @winglet/data-loader

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Batching](https://img.shields.io/badge/batching-support-green.svg)]()
[![Caching](https://img.shields.io/badge/caching-support-blue.svg)]()

---

## 개요

`@winglet/data-loader`는 비동기 데이터 가져오기를 위한 일괄 처리(batching)와 캐싱(caching) 유틸리티입니다.

이 구현은 2010년 Facebook의 [@schrockn](https://github.com/schrockn)이 개발한 원래 "Loader" API에서 영감을 받았으며, 다양한 키-값 저장소 백엔드 API를 단순화하고 통합하기 위해 설계되었습니다.

[GraphQL DataLoader](https://github.com/graphql/dataloader)를 개념적으로 기반으로 하되, 성능 최적화, 타입 안정성, 특정 런타임 요구사항에 적응하는 데 중점을 둔 완전히 새로운 구현입니다.

### 주요 특징

- **일괄 처리**: 여러 개별 요청을 효율적인 배치로 자동 그룹화
- **캐싱**: 중복 요청을 방지하는 내장 캐시 시스템
- **타입 안정성**: 완전한 TypeScript 지원으로 컴파일 타임 타입 검증
- **유연성**: 사용자 정의 캐시 구현 및 배치 스케줄링 지원
- **성능**: 최적화된 알고리즘으로 높은 처리량 달성

---

## 설치 방법

```bash
# npm 사용
npm install @winglet/data-loader

# yarn 사용
yarn add @winglet/data-loader

# pnpm 사용
pnpm add @winglet/data-loader
```

---

## 호환성 안내

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 기본 사용법

### 간단한 예제

```typescript
import { DataLoader } from '@winglet/data-loader';

// 사용자 정보를 일괄로 가져오는 함수
const userBatchLoader = async (userIds: ReadonlyArray<string>) => {
  // 실제로는 데이터베이스나 API에서 데이터를 가져옵니다
  const users = await fetchUsersFromDatabase(userIds);
  return users;
};

// DataLoader 인스턴스 생성
const userLoader = new DataLoader(userBatchLoader);

// 개별 사용자 로드 (자동으로 배치 처리됨)
const user1Promise = userLoader.load('user1');
const user2Promise = userLoader.load('user2');
const user3Promise = userLoader.load('user3');

// 모든 요청이 하나의 배치로 처리됩니다
const [user1, user2, user3] = await Promise.all([
  user1Promise,
  user2Promise,
  user3Promise,
]);
```

### 여러 키 동시 로드

```typescript
const userIds = ['user1', 'user2', 'user3', 'user4'];
const usersOrErrors = await userLoader.loadMany(userIds);

// 각 결과는 값 또는 에러입니다
usersOrErrors.forEach((userOrError, index) => {
  if (userOrError instanceof Error) {
    console.error(`사용자 ${userIds[index]} 로드 실패:`, userOrError);
  } else {
    console.log(`사용자 정보:`, userOrError);
  }
});
```

---

## 고급 설정

### 캐시 설정

```typescript
// 기본 Map을 사용한 캐싱 (기본값)
const userLoader = new DataLoader(userBatchLoader);

// 사용자 정의 캐시 구현
const customCache = new Map<string, Promise<User>>();
const userLoaderWithCustomCache = new DataLoader(userBatchLoader, {
  cache: customCache,
});

// 캐싱 비활성화
const userLoaderNoCache = new DataLoader(userBatchLoader, {
  cache: false,
});
```

### 배치 크기 제한

```typescript
const userLoader = new DataLoader(userBatchLoader, {
  maxBatchSize: 50, // 한 번에 최대 50개까지만 배치 처리
});
```

### 사용자 정의 캐시 키 함수

```typescript
interface UserKey {
  id: string;
  version: number;
}

const userLoader = new DataLoader<UserKey, User, string>(userBatchLoader, {
  // 복합 키를 문자열로 변환
  cacheKeyFn: (key: UserKey) => `${key.id}:${key.version}`,
});
```

### 사용자 정의 배치 스케줄러

```typescript
const userLoader = new DataLoader(userBatchLoader, {
  // setTimeout을 사용한 지연 실행
  batchScheduler: (callback) => {
    setTimeout(callback, 10);
  },
});
```

---

## API 참조

### DataLoader 클래스

#### 생성자

```typescript
constructor(
  batchLoader: BatchLoader<Key, Value>,
  options?: DataLoaderOptions<Key, Value, CacheKey>
)
```

- `batchLoader`: 키 배열을 받아 값 배열을 반환하는 비동기 함수
- `options`: 선택적 설정 객체

#### 메서드

##### `load(key: Key): Promise<Value>`

단일 키에 대한 값을 로드합니다. 자동으로 배치 처리되고 캐시됩니다.

```typescript
const user = await userLoader.load('user123');
```

##### `loadMany(keys: ReadonlyArray<Key>): Promise<Array<Value | Error>>`

여러 키에 대한 값들을 동시에 로드합니다. 개별 키가 실패해도 다른 값들은 정상적으로 수집됩니다.

```typescript
const results = await userLoader.loadMany(['user1', 'user2', 'user3']);
```

##### `clear(key: Key): this`

특정 키를 캐시에서 제거합니다.

```typescript
userLoader.clear('user123'); // 'user123' 캐시 제거
```

##### `clearAll(): this`

모든 캐시를 지웁니다.

```typescript
userLoader.clearAll(); // 전체 캐시 초기화
```

##### `prime(key: Key, value: Value | Promise<Value> | Error): this`

특정 키에 대한 값을 프로그래밍 방식으로 캐시에 추가합니다.

```typescript
// 미리 알고 있는 값 캐시
userLoader.prime('user123', userData);

// Promise로 캐시
userLoader.prime('user456', fetchUserPromise);

// 에러 상태 캐시
userLoader.prime('invalidUser', new Error('사용자를 찾을 수 없음'));
```

---

## 설정 옵션

### DataLoaderOptions

```typescript
interface DataLoaderOptions<Key, Value, CacheKey = Key> {
  /** 로더의 이름 (디버깅용) */
  name?: string;

  /** 캐시 Map 객체 또는 false (비활성화) */
  cache?: MapLike<CacheKey, Promise<Value>> | false;

  /** 배치 실행 스케줄링 함수 */
  batchScheduler?: (task: () => void) => void;

  /** 로더 키를 캐시 키로 변환하는 함수 */
  cacheKeyFn?: (key: Key) => CacheKey;

  /** 한 번에 처리할 최대 배치 크기 */
  maxBatchSize?: number;
}
```

### BatchLoader 함수

```typescript
type BatchLoader<Key, Value> = (
  keys: ReadonlyArray<Key>,
) => Promise<ReadonlyArray<Value | Error>>;
```

배치 로더 함수는 다음을 보장해야 합니다:

- 입력 키 배열과 같은 길이의 결과 배열 반환
- 각 키에 대해 값 또는 Error 객체 반환
- 키의 순서와 결과의 순서가 일치

---

## 사용 예제

### 데이터베이스 쿼리 최적화

```typescript
import { DataLoader } from '@winglet/data-loader';

// N+1 쿼리 문제 해결
class UserService {
  private userLoader: DataLoader<string, User>;
  private postLoader: DataLoader<string, Post[]>;

  constructor() {
    this.userLoader = new DataLoader(this.batchLoadUsers.bind(this));
    this.postLoader = new DataLoader(this.batchLoadPostsByUserId.bind(this));
  }

  private async batchLoadUsers(userIds: ReadonlyArray<string>) {
    const users = await db.users.findMany({
      where: { id: { in: [...userIds] } },
    });

    // 키 순서에 맞게 결과 정렬
    return userIds.map(
      (id) =>
        users.find((user) => user.id === id) ||
        new Error(`사용자 ${id}를 찾을 수 없음`),
    );
  }

  private async batchLoadPostsByUserId(userIds: ReadonlyArray<string>) {
    const posts = await db.posts.findMany({
      where: { authorId: { in: [...userIds] } },
    });

    return userIds.map((userId) =>
      posts.filter((post) => post.authorId === userId),
    );
  }

  async getUser(id: string): Promise<User> {
    return this.userLoader.load(id);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.postLoader.load(userId);
  }
}
```

### GraphQL Resolver에서 사용

```typescript
// GraphQL 컨텍스트에 DataLoader 추가
interface Context {
  loaders: {
    user: DataLoader<string, User>;
    posts: DataLoader<string, Post[]>;
  };
}

// Resolver에서 사용
const resolvers = {
  Post: {
    author: async (post: Post, args: any, { loaders }: Context) => {
      return loaders.user.load(post.authorId);
    },
  },
  User: {
    posts: async (user: User, args: any, { loaders }: Context) => {
      return loaders.posts.load(user.id);
    },
  },
};
```

### 에러 처리 및 재시도

```typescript
const userLoader = new DataLoader(async (userIds: ReadonlyArray<string>) => {
  try {
    const users = await fetchUsersWithRetry(userIds);
    return users;
  } catch (error) {
    // 전체 배치가 실패한 경우, 각 키에 대해 동일한 에러 반환
    return userIds.map(() => error);
  }
});

// 특정 사용자만 실패한 경우
const userLoaderPartialFailure = new DataLoader(
  async (userIds: ReadonlyArray<string>) => {
    const results = await Promise.allSettled(
      userIds.map((id) => fetchSingleUser(id)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return new Error(
          `사용자 ${userIds[index]} 로드 실패: ${result.reason}`,
        );
      }
    });
  },
);
```

---

## 성능 고려사항

- **배치 크기**: `maxBatchSize`를 적절히 설정하여 메모리 사용량과 처리 효율성의 균형을 맞추세요
- **캐시 전략**: 장기 실행 애플리케이션에서는 메모리 누수를 방지하기 위해 주기적으로 `clearAll()`을 호출하거나 TTL이 있는 캐시를 구현하세요
- **배치 스케줄러**: 기본 `process.nextTick` 대신 사용자 정의 스케줄러를 사용하여 배치 타이밍을 조절할 수 있습니다

---

## 감사의 말씀

이 구현은 Facebook의 [@schrockn](https://github.com/schrockn)이 2010년에 개발한 원래 "Loader" API와 [GraphQL DataLoader](https://github.com/graphql/dataloader) 프로젝트에서 영감을 받았습니다. 이러한 뛰어난 오픈소스 프로젝트들이 제공한 개념과 아이디어에 깊은 감사를 표합니다.

---

## 라이선스

이 저장소는 MIT 라이선스로 제공됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

이 프로젝트에 관한 질문이나 제안이 있으시면 GitHub 이슈를 생성해 주세요.
