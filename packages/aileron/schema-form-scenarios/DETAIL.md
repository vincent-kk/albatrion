# Schema Form Scenarios contract

## Requirements

TEST-008, TEST-010, TEST-011, TEST-022, TEST-023, TEST-024, TEST-077 및 LANDING-090이 이 비공개 검증 패키지의 범위를 정한다. 값·정착·채움·나감·union·derive·controls 부류의 엔진 시나리오는 같은 데이터로 코어 러너와 후속 렌더 실행기가 소비한다(TEST-011·016·019·023).

시나리오 데이터는 React, 테스트 러너, 폼 엔진과 독립적이다. 어댑터는 실행 환경별 의존성을 사용할 수 있지만, 이 패키지는 타입 전용으로도 `@canard/schema-form`을 가져오지 않는다. 그래야 schema-form 테스트가 공유 시나리오를 소비할 때 의존성 순환이 생기지 않는다.

시나리오 데이터의 기대값은 현재 PR의 노드 트리에서 관찰할 수 있는 범위만 기록한다. 렌더링, 통지, 배열 아이템, 제출의 기대값은 해당 기제가 도입되는 PR의 실행기가 검증한다.

## API Contracts

`FormScenario`는 이름, 구조적 스키마, 선택적 초기 값, 순서 있는 단계를 기술한다(TEST-011·023). 단계는 `setValue`, `clear`, `push`, `pop`, `remove`, `update`, `submit`, `reset`, `batch`, `resetSubtree` 중 하나이며 `update`는 배열 색인과 값을 받고 `resetSubtree`는 `{ action: 'resetSubtree', path }`로 해당 하위 트리만 로드한다(TEST-011·023, SETTLE-049, I19). 배열 동사의 결과, 단계 전후 노드 동일성과 키, 스냅숏 기본값, 자리별 청사진 종류, 청사진 없는 꼬리의 `extras`도 구조적 기대값으로 기술한다(TEST-018, NODE-051·052, WRITE-095·099). `ScenarioExpectation.states?: Record<경로, { visible?: boolean; readOnly?: boolean; disabled?: boolean; enabled?: boolean }>`는 노드별 로컬 상태 키 관찰이고, 형태·값·오류·진단 기대값과 함께 단계 완료 뒤에 검사한다(TEST-011·019·023, CONTROLS-082, 28C-02).

코어 실행기는 TEST-023에 따라 schema-form의 코어 검증 소유자가 맡는다. 이 패키지는 코어 실행기를 공개하지 않으며 엔진 시나리오를 실행하지 않는다.

`playScenario(scenario, element)`는 받은 요소를 탐색 범위로 사용한다. 렌더된 래퍼는 구조적 핸들과 화면 어댑터를 자신의 루트 요소에 등록하며, 렌더 테스트는 컨테이너에 직접 등록할 수 있다. 탐색은 받은 요소를 먼저 검사한 뒤 하위 요소를 검사한다. 등록이 없거나 후보가 여러 개면 명시적으로 실패한다. 등록 해제 함수는 자신이 만든 등록만 제거한다.

이 패키지는 `ScenarioAdapter`의 실행·정착·검증 인터페이스를 정의하고 각 단계를 등록된 어댑터에 순서대로 위임한다. 화면 입력의 user event 처리, `data-path` 필드 탐색, 핸들 전용 동작의 경로 선택은 소비자가 주입하는 어댑터의 책임이다. `batch`, `reset`, `resetSubtree`, `submit`, `update`, 비말단 `setValue`처럼 화면 입력으로 표현하기 어려운 단계의 핸들 사용도 주입 어댑터가 결정한다(TEST-011·023). 패키지는 위젯이나 엔진 의미론을 추측해 실행하지 않는다.

시나리오 래퍼는 폼 컴포넌트를 입력받아 그 핸들을 루트 DOM 등록에 연결한다. 폼 렌더링과 핸들 수명은 소비자가 소유한다. 시나리오 실행 오류는 호출자에게 전파되며, 등록·어댑터 실패로 단계나 기대값을 조용히 건너뛰지 않는다.

## Acceptance Criteria

### scenario-data — 순수 공유 기술

- 시나리오 모듈에는 런타임 실행이나 엔진 의존성이 없다.
- 동작 어휘는 계약의 열 동작만 허용하고 `resetSubtree`는 명시한 경로만 로드한다(TEST-011·023, SETTLE-049).
- value, settle, fill, exit, union, derive, controls, array 계열은 실제 기대값이 있는 시나리오를 제공한다(TEST-011·016·018·019·023).
- `states`는 노드별 `visible`·`readOnly`·`disabled`·`enabled`의 기대값을 구조적으로 표현하고 코어 러너가 관찰한다(TEST-011·019·023, CONTROLS-082).

### scenario-screen-order — 순서 있는 화면 실행

- 빈 시나리오는 동작을 실행하지 않고 성공한다.
- 등록된 화면 어댑터는 각 단계를 순서대로 한 번씩 받고 완료까지 기다린다.
- 완료 후 기대값을 어댑터에 위임하며 실패를 전파한다.

### scenario-registration — 범위가 있는 DOM 전달

- 받은 요소 또는 그 하위 요소에서 등록을 찾는다.
- 등록 해제는 같은 요소의 더 새로운 등록을 제거하지 않는다.
- 핸들이 없거나 모호하면 명시적으로 실패한다.
- 래퍼는 엔진 import 없이 구조적으로 호환되는 폼을 받을 수 있다.

### scenario-screen — 공유 화면 진입점

- 공개 화면 호출은 시나리오와 범위 요소만 받는다.
- 주입된 어댑터가 user event와 핸들 전용 동작의 경로 선택을 소유한다.
- Storybook과 렌더 테스트는 단계를 복제하지 않고 같은 시나리오를 사용할 수 있다.

## Last Updated

2026-10-01
