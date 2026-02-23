# bootstrap

## Purpose

라이브러리 초기화를 담당하는 부트스트랩 레이어. BootstrapProvider를 통해 모달 시스템을 React 트리에 마운트.

## Structure

- `BootstrapProvider/` — 메인 프로바이더 컴포넌트 (ModalProvider로 export)
- `index.ts` — BootstrapProvider, useBootstrap, 타입 재export

## Conventions

- BootstrapProvider는 외부에서 `ModalProvider`로 이름을 바꿔 export
- useBootstrap 훅은 `useInitializeModal`로 외부 export
- Handle/Props 타입은 BootstrapProvider 내부 type.ts에 정의

## Boundaries

### Always do

- BootstrapProvider에서 모든 하위 Context Provider 올바른 순서로 래핑
- 초기화 로직은 useBootstrap 훅에 캡슐화

### Ask first

- Provider 래핑 순서 변경
- 초기화 시점 또는 생명주기 변경

### Never do

- bootstrap 외부에서 직접 초기화 로직 실행
- BootstrapProvider의 public API 이름 변경 없이 시그니처 변경
