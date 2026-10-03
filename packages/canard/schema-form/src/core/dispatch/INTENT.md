> 이름 함정: 이 `dispatch`는 한 트리의 루트 디스패처이며 Redux식 액션 디스패치가 아닙니다(LANDING-084, EVENT-004).

# dispatch — 루트 진입 사슬과 배달 경계

## Purpose

공개 쓰기 진입과 정착 밖 사건을 한 루트의 사슬에 모아 통지, 검증 요청, `onChange`, 오류 전달을 순서대로 조율합니다(LANDING-064·084, EVENT-027).

## Conventions

- 의존 순서는 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < SchemaNode`입니다. `dispatch`는 아래 fractal의 진입점만 소비하고 노드 겉면을 가져오지 않습니다(NODE-016·045, LANDING-084).
- 쓰기·읽기·검증·결합 진입을 경계에서 이름으로 드러냅니다. 배열 동사도 같은 진입 사슬에 들고, 배치 안에서는 앞선 표시에 순수 계획을 적용한 뒤 배치 끝의 한 번 정착에 맡깁니다(NODE-010, LANDING-064·084, EVENT-030, 62C-01).
- 진입 깊이·파동/중첩 예산·대기 비트·콜백·보고기·전달 중 표시·경고 키는 `record`가 선언한 트리 런타임 칸입니다. 노드별 일정과 추가 고정 필드를 만들지 않습니다(NODE-004·045, EVENT-004, ERROR-024·029).

## Boundaries

### Always do

- 커밋된 배달 집합을 문서 순서로 파동마다 한 번 순회하고, 최외곽 공개 쓰기 끝에 검증을 먼저 요청한 뒤 `onChange`를 부릅니다(EVENT-004·007·027, SETTLE-007).
- 상태·외부 오류·`request(kind: SchemaNodeRequestType)`는 정착 없이 같은 디스패처에서 동기로 배달하거나 진입 안이면 합쳐 대기합니다(EVENT-012·045·067·073, 31C-01).
- 사슬 끝 기록 전달·묶음·throw와 전달 중 쓰기 거부는 이 경계가 소유합니다. 정착 밖 파동의 리스너가 쓰기를 열면 바깥 오류 수집기를 복원하고 안쪽 진입의 오류를 여기에 합칩니다(ERROR-004·005·019·029).

### Ask first

- 진입 정의, 파동 예산 25 또는 `onChange` 앞의 검증 요청 순서를 바꿀 때(EVENT-008·020·027).
- 바인딩 전용 사슬 넘김의 이름 붙은 표면을 넓힐 때(EVENT-030, NODE-010).

### Never do

- `__legacy__`, `app/plugin`, React, `SchemaNode` 겉면 또는 `src/types` 색인을 값·타입으로 가져오지 않습니다(LANDING-159, CONTROLS-075, GOAL-088, NODE-016).
- 커밋 후 전체 트리를 다시 비교해 배달 집합을 만들거나 검증 라우팅을 직접 구현하지 않습니다(SETTLE-017, VALIDATE-043, LANDING-084).
