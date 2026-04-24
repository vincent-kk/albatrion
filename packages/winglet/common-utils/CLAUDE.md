# CLAUDE.md

`@winglet/common-utils` — 범용 TypeScript 유틸리티 라이브러리. 런타임 의존성 없음. Sub-path export로 tree-shaking 최적화.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + claude-hashes.json
yarn build:hashes      # docs/claude/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트 (Node 환경)
yarn test --coverage   # 커버리지 포함
yarn lint              # ESLint
```

## Claude Docs Injector

`docs/claude/` 자산을 사용자 `.claude` 디렉터리로 주입하는 얇은 CLI 스텁. 엔진: `@slats/claude-assets-sync`.

```bash
npx claude-sync --scope=user                 # ~/.claude
npx claude-sync --scope=project              # cwd 에서 위로 탐색해 첫 기존 .claude
npx claude-sync --scope=user --dry-run       # 미리보기
npx claude-sync --scope=user --force         # 로컬 수정 덮어쓰기

npx -p @winglet/common-utils claude-sync --scope=user  # transitive-dep 환경
```

### Isolation Guardrails

- `src/**` 는 `bin/**`, `docs/**`, `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./bin/*` 를 추가하지 말 것.**
- `yarn depcheck` 로 CI 에서 격리 회귀 검증.

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
