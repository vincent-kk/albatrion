# CLAUDE.md

`@winglet/react-utils` — React 커스텀 훅, HOC, 유틸리티 라이브러리. Sub-path export 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + agents-hashes.json
yarn build:hashes      # docs/agents/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트 (jsdom)
yarn test --watch      # watch 모드
yarn lint              # ESLint
```

## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — `claude` 는 `.claude/{skills,rules,commands}`, `codex`/`agents` 는 `.agents/skills` + `AGENTS.md` 마커 블록(project scope 기준).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/agents-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

## Sub-path Exports

```typescript
import { useHandle } from '@winglet/react-utils/hook';
import { withPortal, Portal } from '@winglet/react-utils/portal';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { isReactComponent } from '@winglet/react-utils/filter';
```

## Key APIs

**Hooks** (`@winglet/react-utils/hook`):
- `useHandle` — 안정적인 이벤트 핸들러 (schema-form 플러그인에서 주로 사용)
- `useConstant` — 비싼 연산 메모이제이션
- `useLazyConstant` — factory 1회 실행 + identity 보장 (useMemo와 달리 재계산 불가 보장, 리소스 소유 인스턴스용)
- `useMemorize` — 향상된 memoization
- `useEffectUntil` / `useLayoutEffectUntil` — 조건부 effect
- `useWindowSize` — 브라우저 윈도우 크기 추적

**Portal System** (`@winglet/react-utils/portal`):
- `withPortal()` — 포털 컨텍스트 HOC
- `Portal.Anchor` — 포털 렌더링 위치 지정
- `Portal` — anchor 위치에 children 렌더링

**HOCs** (`@winglet/react-utils/hoc`):
- `withErrorBoundary()` — 에러 바운더리 래핑

## Peer Dependencies

React 16-19, React DOM 16-19
