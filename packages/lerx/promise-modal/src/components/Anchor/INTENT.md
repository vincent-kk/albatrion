# Anchor

## Purpose

모달이 렌더링될 DOM 앵커 포인트를 제공하는 React 컴포넌트. ModalManager의 앵커 엘리먼트와 연동.

## Conventions

- 앵커 정체를 유지하여 root 이동에도 열린 입력과 Promise를 보존합니다.

- ModalManager.anchor()가 생성한 DOM 노드에 React Portal로 모달 렌더링
- BootstrapProvider 내부에서만 사용

## Boundaries

### Always do

- 매니저가 제공한 앵커의 포털 안에서만 렌더링하여 DOM 소유권을 유지
- Portal 기반 렌더링으로 DOM 격리 유지

### Ask first

- 앵커 마운트 위치 변경 로직
- Portal 대신 다른 렌더링 전략 사용

### Never do

- Anchor 컴포넌트를 BootstrapProvider 외부에서 직접 사용
- 앵커 DOM 노드를 직접 생성/조작
