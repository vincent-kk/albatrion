# CLAUDE.md

`@winglet/style-utils` — 스코프 CSS 주입, CSS 압축, className 유틸리티. 런타임 의존성 없음, framework-agnostic.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (jsdom)
yarn lint              # ESLint
```

## Sub-path Exports

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
```

## Key APIs

**StyleManager** — 스코프 CSS 싱글톤 관리:
```typescript
const addStyle = styleManagerFactory('my-scope');
const removeStyles = addStyle('style-id', css);   // cleanup 함수 반환
destroyScope('my-scope');                          // 전체 scope 정리
// Shadow DOM: styleManagerFactory('scope', { shadowRoot: el.shadowRoot })
```

**ClassName**:
```typescript
cx('base', { active: isActive }, ['a', 'b'])   // 객체/배열 지원
cxLite('base', isActive && 'active', size)      // 경량 버전
```

## Key Details

- **CSS 스코핑**: `.scopeId .selector` 자동 prefix (`@rules`, `:root`, `:host` 제외)
- **DOM API**: `adoptedStyleSheets` (모던) / `<style>` 요소 (레거시) 자동 선택
- **배치 업데이트**: `requestAnimationFrame` 기반 DOM 업데이트 최적화
- **메모리**: `destroy()` 호출 시 AnimationFrame 취소, DOM 제거, 캐시 초기화

## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — `claude` 는 `.claude/{skills,rules,commands}`, `codex`/`agents` 는 `.agents/skills` + `AGENTS.md` 마커 블록(project scope 기준).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**
