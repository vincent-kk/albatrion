# ui

## Purpose

TTY의 입력 화면과 결과 표시를 소유합니다. 누락된 agent·scope 및 force 확인 응답만 코어에 전달하며 검증·계획·쓰기·종료 코드 판정은 코어가 수행합니다.

## Structure

상태 전이 규칙은 UI 프레임워크에 의존하지 않는 reducer가 소유합니다. 화면 컴포넌트와 파이프라인 훅은 그 상태를 소비하며, 렌더링 계층에 전이 규칙을 복제하지 않습니다.

## Conventions

- 입력과 결과의 계약은 core/injectDocs가 소유하며 화면은 그 값을 reducer에 전달합니다.

## Boundaries

### Always do

- 최종 종료 코드를 `useExitApp`으로 전달하여 `renderInjectApp`이 `number`로 이행되게 합니다.

### Ask first

- `renderInjectApp` 외의 Ink 진입점을 추가할 때.
- 전역 UI 저장소를 도입할 때. 훅별 `useReducer` 패턴을 사용합니다.

### Never do

- `process.stdout`/`stderr`에 직접 쓰지 않습니다. 모든 출력은 Ink의 가상 DOM을 거칩니다.
- `commands/**`에서 가져오지 않습니다.
- `package.json`을 읽거나 `node_modules`를 순회하지 않습니다. 호출자가 제공한 `ConsumerPackage[]`를 소비합니다.
