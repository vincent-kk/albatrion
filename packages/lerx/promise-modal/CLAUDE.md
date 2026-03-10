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
