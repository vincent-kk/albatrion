# CLAUDE.md

`@winglet/common-utils` — 범용 TypeScript 유틸리티 라이브러리. 런타임 의존성 없음. Sub-path export로 tree-shaking 최적화.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (Node 환경)
yarn test --coverage   # 커버리지 포함
yarn lint              # ESLint
```

## Sub-path Exports

```typescript
import { chunk } from '@winglet/common-utils/array';
import { isArray, isObject } from '@winglet/common-utils/filter';
import { debounce, throttle } from '@winglet/common-utils/function';
import { delay, timeout } from '@winglet/common-utils/promise';
// 또는 전체: import { ... } from '@winglet/common-utils';
```

## Utility Categories

| 경로 | 주요 함수 |
|------|---------|
| `array` | `chunk`, `unique`, `groupBy`, `difference`, `intersection`, `forEach*` |
| `filter` | `isString/Number/Boolean/Object/Array/Nil/Date...` 타입 체크 |
| `object` | `clone`, `merge`, `equals`, `serializeObject`, `transformKeys` |
| `function` | `debounce`, `throttle`, `getTrackableHandler` |
| `promise` | `delay`, `timeout`, `withTimeout`, `waitAndExecute` |
| `scheduler` | `scheduleMicrotask`, `scheduleMacrotask`, `scheduleNextTick` |
| `hash` | Murmur3, Polynomial hash (base36) |
| `libs` | `cacheMapFactory`, `cacheWeakMapFactory`, `counterFactory`, `getRandomString` |

## Error Classes

`BaseError` → `AbortError` / `InvalidTypeError` / `TimeoutError`
