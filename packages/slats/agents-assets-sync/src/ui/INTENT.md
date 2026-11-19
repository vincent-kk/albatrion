# ui

## Purpose

TTY 실행에서 사용하는 React·Ink UI를 소유합니다. renderInjectApp은 에이전트·스코프 선택, 대상별 계획, 강제 적용 확인, 실행 결과를 하나의 화면 흐름으로 연결하고 종료 코드를 반환합니다. CLI의 renderOrFallback이 대화형 경로를 선택한 경우에만 동적으로 로드하며, 공개 패키지 서브패스로 노출하지 않습니다.

## Structure

상태 전이 규칙은 UI 프레임워크에 의존하지 않는 reducer가 소유합니다. 화면 컴포넌트와 파이프라인 훅은 그 상태를 소비하며, 렌더링 계층에 전이 규칙을 복제하지 않습니다.

## Conventions

- 계획과 결과는 core가 한 번 계산하며 일반·JSON·터미널은 그 모델을 표시합니다. 입력 화면은 누락된 인자와 확인 응답만 전달하고 같은 코어 실행 경로를 사용합니다.
- 각 단위의 key는 agent와 package를 결합한 코어 식별자입니다. 공유 스킬 네임스페이스의 관리 경로는 실행 전체에서 합쳐 다른 참여 패키지 파일을 고아로 삭제하지 않습니다.
- 일반 목적 orchestrator 객체와 렌더러별 기본 연산 조립은 금지합니다. 출력 방식에 따른 판정 차이를 막기 위해 작은 준비 함수·순수 계획 병합·결과 모델·단일 적용기만 사용합니다.


- 파이프라인 단계마다 훅 하나(`useResolveStep`, `usePlanStep`, `useForceConfirmStep`, `useApplyStep`)를 두고 `useInjectSession`으로 구동합니다. 진행 상황은 타이머가 아니라 완료된 액션마다 보고합니다.

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
