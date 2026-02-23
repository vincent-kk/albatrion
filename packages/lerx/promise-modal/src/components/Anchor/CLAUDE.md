# Anchor

## Purpose

모달이 렌더링될 DOM 앵커 포인트를 제공하는 React 컴포넌트. ModalManager의 앵커 엘리먼트와 연동.

## Structure

- `Anchor.tsx` — Anchor 컴포넌트 구현
- `index.ts` — Anchor 재export

## Conventions

- ModalManager.anchor()가 생성한 DOM 노드에 React Portal로 모달 렌더링
- BootstrapProvider 내부에서만 사용

## Boundaries

### Always do

- ModalManager.anchored 상태 확인 후 렌더링
- Portal 기반 렌더링으로 DOM 격리 유지

### Ask first

- 앵커 마운트 위치 변경 로직
- Portal 대신 다른 렌더링 전략 사용

### Never do

- Anchor 컴포넌트를 BootstrapProvider 외부에서 직접 사용
- 앵커 DOM 노드를 직접 생성/조작
