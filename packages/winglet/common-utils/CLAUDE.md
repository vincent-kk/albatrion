# CLAUDE.md

`@winglet/common-utils` — 범용 TypeScript 유틸리티 라이브러리. 런타임 의존성 없음. Sub-path export로 tree-shaking 최적화.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + agents-hashes.json
yarn build:hashes      # docs/agents/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트 (Node 환경)
yarn test --coverage   # 커버리지 포함
yarn lint              # ESLint
```

## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — claude 는 `.claude/{skills,rules,commands}`, codex 는 `.codex/skills` + `AGENTS.md` 마커 블록.

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/agents-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

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
