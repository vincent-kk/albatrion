# InjectApp

## Purpose

주입 흐름의 주 Ink 화면입니다. 각 phase를 렌더하는 최상위 `InjectApp` React 컴포넌트와 이를 `ink.render`로 마운트하여 최종 종료 코드를 전달하는 `renderInjectApp`을 소유합니다. `Phase` 합집합은 `ui/types/`에, 그 reducer는 `ui/reducer/`에 두며 이 프랙탈은 둘을 소비합니다.

## Conventions

- useInjectSession이 제공하는 phase를 화면으로 투영하며, 전이 판단은 reducer에 남깁니다.
- 종료 코드는 summary phase에 기록된 결과를 읽어 Ink 컴포넌트 안에서 전달합니다.

## Boundaries

### Always do

- 종료 코드는 바깥이 아닌 `InjectApp` 안에서 `useExitApp`으로 전달합니다. reducer는 `summary` phase에 이를 기록하기만 합니다.
- 파이프라인 전이는 `useInjectSession` 훅으로 구동하고 이 프랙탈은 결과 phase만 소비합니다.

### Ask first

- 새 `Phase` 변형을 추가할 때. reducer·선택기·컴포넌트 분기를 함께 바꾸며 snapshot 시험이 무효해질 수 있습니다.
- 이 프랙탈 수준에 두 번째 Ink 루트(예: `ReportApp`)를 도입할 때. `ui/` 아래의 형제 프랙탈을 우선합니다.

### Never do

- `process.stdout`/`stderr`에 직접 쓰지 않습니다. 모든 출력은 Ink의 가상 DOM을 거칩니다.
- 이곳에 phase 전이 로직을 두지 않습니다. `ui/reducer/`가 이를 소유하며 프레임워크와 독립적으로 유지합니다.
