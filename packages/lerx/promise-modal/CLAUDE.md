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

`docs/claude/` 자산을 사용자 `.claude` 디렉터리로 주입하는 얇은 CLI 스텁. 엔진: `@slats/claude-assets-sync`.

```bash
npx claude-sync --scope=user                 # ~/.claude
npx claude-sync --scope=project              # cwd 에서 위로 탐색해 첫 기존 .claude
npx claude-sync --scope=local                # 동일 규칙, gitignored 영역
npx claude-sync --scope=user --dry-run       # 미리보기
npx claude-sync --scope=user --force         # 로컬 수정 덮어쓰기

npx -p @winglet/react-utils claude-sync --scope=user  # transitive-dep 환경
```

### Isolation Guardrails

- `src/**` 는 `bin/**`, `docs/**`, `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./bin/*` 를 추가하지 말 것.**
- `yarn depcheck` 로 CI 에서 격리 회귀 검증.

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
