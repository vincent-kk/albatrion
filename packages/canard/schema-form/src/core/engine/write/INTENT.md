> 이름 함정: 이 `write`는 한 트리의 루트 디스패처이며, Redux식 액션 디스패치가 아니다(LANDING-084, EVENT-004).

# write — 루트 진입 사슬과 배달 경계

## Purpose

공개 쓰기 진입과 정착 밖에서 일어난 사건을 한 루트의 사슬로 모아, 통지, 검증 요청, `onChange`, 오류 전달을 순서대로 조율한다(LANDING-064·084, EVENT-027).

## Conventions

- 의존 순서는 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`이다. `write`는 아래 fractal의 진입점만 소비하며 노드 겉면을 가져오지 않는다(NODE-016·045, LANDING-084).
- 쓰기, 읽기, 검증, 결합 진입은 경계에서 이름으로 드러낸다. 배열 동사도 같은 진입 사슬에 속하며, 배치 안에서는 앞선 표시에 순수 계획을 적용하고 배치 끝의 한 번 정착에 맡긴다(NODE-010, LANDING-064·084, EVENT-030, 62C-01).
- 진입 깊이, 파동과 중첩 예산, 대기 비트, 콜백, 보고기, 전달 중 표시, 경고 키는 `record`가 선언한 트리 런타임 칸이다. 노드별 일정이나 추가 고정 필드는 만들지 않는다(NODE-004·045, EVENT-004, ERROR-024·029).

## Boundaries

### Always do

- 커밋된 배달 집합을 파동마다 문서 순서로 한 번씩 순회한다. 가장 바깥의 공개 쓰기가 끝나면 검증을 먼저 요청하고 그다음에 `onChange`를 호출한다(EVENT-004·007·027, SETTLE-007).
- 상태, 외부 오류, `request(kind: FieldNodeRequestType)`는 정착 없이 같은 디스패처에서 동기로 배달하거나, 진입 중이면 합쳐서 대기시킨다(EVENT-012·045·067·073, 31C-01).
- 루트가 아닌 노드에서 외부 오류를 쓰거나 지우면 그 노드의 경로로 루트의 외부 목록에도 반영한다. 합산값(`globalErrors`)이 바뀌면 `UpdateGlobalError`도 함께 올린다(185라운드, 188C-01, SURFACE-053).
- 사슬 끝에서 기록을 전달하고 묶고 throw하는 일과, 전달 중 쓰기를 거부하는 일은 이 경계가 소유한다. 정착 밖 파동의 리스너가 쓰기를 열면 바깥 오류 수집기를 복원하고, 안쪽 진입의 오류를 여기에 합친다(ERROR-004·005·019·029).
- 주인 없는 실패 묶음은 같은 raw sink 채널에 잎마다 전달하고 caller의 묶음 거부와 기존 handler-first 순서는 유지한다.

### Ask first

- 진입 정의, 파동 예산 25, `onChange` 앞의 검증 요청 순서를 바꾸려는 경우(EVENT-008·020·027).
- 바인딩 전용 사슬 넘김에서 이름이 붙은 표면을 넓히려는 경우(EVENT-030, NODE-010).

### Never do

- `__legacy__`, `app/plugin`, React, `FieldNode` 겉면, `src/types` 색인을 값이나 타입으로 가져오지 않는다(LANDING-159, CONTROLS-075, GOAL-088, NODE-016).
- 커밋 뒤에 전체 트리를 다시 비교해서 배달 집합을 만들지 않고, 검증 라우팅을 직접 구현하지도 않는다(SETTLE-017, VALIDATE-043, LANDING-084).
