# CLAUDE.md

`@lerx/promise-modal` — Promise 기반 React 모달 유틸리티. `alert`, `confirm`, `prompt`를 React 컴포넌트 내외부에서 모두 사용 가능.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (jsdom)
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
yarn size-limit        # 번들 크기 확인
```

## Claude Docs Injector

`docs/claude/**` 자산을 사용자 `.claude/` 에 주입. 엔진: `@slats/claude-assets-sync` (bin: `inject-claude-settings`).

```bash
# universal — 모든 PM (pnpm strict / yarn-berry PnP 포함)
npx -p @slats/claude-assets-sync inject-claude-settings --package=@lerx/promise-modal --scope=user
npx -p @slats/claude-assets-sync inject-claude-settings --package=@lerx/promise-modal --scope=project
npx -p @slats/claude-assets-sync inject-claude-settings --package=@lerx/promise-modal --scope=user --dry-run
npx -p @slats/claude-assets-sync inject-claude-settings --package=@lerx/promise-modal --scope=user --force

# 간편 — npm / yarn-classic 에서만 (transitive bin hoist 기반)
npx inject-claude-settings --package=@lerx/promise-modal --scope=user
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

## Architecture

```
src/
├── index.ts                      # Public API
├── core/handle/                  # alert / confirm / prompt 함수
├── core/node/                    # AbstractNode, AlertNode, ConfirmNode, PromptNode
├── app/ModalManager.ts           # 싱글톤 — 모달 생명주기, DOM 앵커, 스타일 주입
├── bootstrap/BootstrapProvider/  # ModalProvider 컴포넌트
├── providers/                    # Context 분리 (설정, 모달 관리, 사용자 데이터)
└── components/                   # Anchor, Background, Foreground 등 UI
```

## Key Design
- **Promise API**: 모달 함수가 Promise 반환 → 사용자 인터랙션으로 resolve
- **Singleton**: `ModalManager`가 전역 상태 관리
- **Styling**: `@winglet/style-utils`로 런타임 CSS 주입 (polynomial hashing 스코핑)

## Dependencies
`@winglet/common-utils`, `@winglet/react-utils`, `@winglet/style-utils`, React 18-19 (peer)
