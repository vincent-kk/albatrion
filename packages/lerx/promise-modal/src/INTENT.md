# src

## Purpose

`@lerx/promise-modal`의 소스 루트. Promise 기반 모달 인터랙션(alert, confirm, prompt)을 React 컴포넌트 내외부에서 사용할 수 있는 라이브러리.

## Structure

- `app/` — ModalManager 싱글톤 (전역 상태, DOM 앵커, 스타일 관리)
- `core/` — handle(alert/confirm/prompt API) + node(모달 노드 팩토리/구현)
- `bootstrap/` — BootstrapProvider (ModalProvider로 export)
- `providers/` — Context providers (Configuration, ModalManager, UserDefined)
- `components/` — UI 컴포넌트 (Anchor, Background, Foreground, Presenter, Fallback)
- `hooks/` — 공용 React hooks (useModal, useActiveModalCount 등)
- `types/` — 공유 타입 정의
- `helpers/` — 유틸리티 함수

## Conventions

- TypeScript + React, ES2022 타겟
- 경로 별칭: `@/promise-modal` → `./src`
- Promise 기반 API: 모달 함수는 Promise를 반환하여 사용자 인터랙션 결과를 resolve
- Provider 패턴: 설정/상태를 Context로 분리
- `@winglet/*` 유틸리티 의존 (common-utils, react-utils, style-utils)

## Boundaries

### Always do

- 새 모달 타입 추가 시 core/node에 노드 클래스, core/handle에 핸들러 함수 구현
- 공개 API 변경 시 `src/index.ts` export 업데이트
- `yarn test`, `yarn lint`, `yarn typecheck` 통과 확인

### Ask first

- 공개 API 시그니처 변경 (breaking change 가능)
- ModalManager 싱글톤 패턴 변경
- 새 Context Provider 추가

### Never do

- organ 디렉토리(hooks, types, helpers, components)에 INTENT.md 생성
- `@winglet/*` 의존성을 직접 인라인으로 대체
- React peer dependency 버전 범위 축소
