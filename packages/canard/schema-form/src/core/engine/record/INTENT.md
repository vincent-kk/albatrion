# record — 노드 레코드 경계

## Purpose

노드 한 개의 고정 필드 배치, 동작 행과 생성 함수, 트리 런타임의 최소 계약, 새 엔진의 이벤트와 명령 비트 형을 소유한다(NODE-004·045, SURFACE-056·060).

## Conventions

- 상태는 `raw`와 `undeclaredValues`뿐이고, 나머지 값은 계산값이거나 작업 기록이다(VALUE-002).
- A host owns retained inactive instances and their source overlays; record declares this ownership without selecting, settling, or reviving an inactive public lifetime.
- 노드 인스턴스가 곧 `FieldNodeRecord<Self>`이며, 종류별 자료는 `structure` 한 칸에 둔다(NODE-004·046).
- 경고 경로 인덱스와 얼려 둔 떼어진 읽기는 선택적 트리 저장소에 두고, 가지치기용으로 노드마다 고정 필드를 추가하지 않는다(NODE-044·045, 35C-09).
- 넓은 범위의 노드 이름에는 `FieldNode`를 쓰고, 필드처럼 좁은 범위에서만 `node`를 쓴다(NODE-011, SURFACE-056).

## Boundaries

### Always do

- `Behavior`와 `FieldNodeRuntime`의 칸은 소비자가 쓰는 최소 형으로 선언한다(NODE-045).
- 이름과 경로 갱신, 상호작용 상태의 얕은 패치는 레코드 연산으로 둔다(NODE-008).
- 커밋이 배달 비트와 페이로드를 표시할 수 있게 하되, 전달 일정과 리스너 실행은 `write`에 맡긴다(EVENT-004·007).

### Ask first

- 노드의 고정 필드 순서를 바꾸거나 행 칸을 늘려서 숨은 클래스나 의존 방향이 바뀌는 경우.

### Never do

- `settle`, `FieldNode`, `write`, `validation`, 앱과 플러그인, 레거시를 값이나 타입으로 가져오지 않는다(NODE-045, LANDING-159).
- 레코드 안에서 정착, 통지, 검증을 실행하지 않는다(NODE-004·006).
