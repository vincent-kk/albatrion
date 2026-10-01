# record — 노드 레코드 경계

## Purpose

노드 한 개의 고정 필드 배치와 동작 행·생성 함수·트리 런타임의 최소 계약, 새 엔진의 이벤트/명령 비트 형을 소유합니다(NODE-004·045, SURFACE-056·060).

## Conventions

- 상태는 `raw`와 `extras`뿐이며 나머지 값은 계산값 또는 작업 기록입니다(VALUE-002).
- 노드 인스턴스가 곧 `SchemaNodeRecord<Self>`이고 종류별 자료는 `structure` 한 칸에 둡니다(NODE-004·046).
- 넓은 범위의 노드 이름에는 `SchemaNode`를 쓰고, 필드 같은 좁은 범위에서만 `node`를 씁니다(NODE-011, SURFACE-056).

## Boundaries

### Always do

- `Behavior`와 `SchemaNodeRuntime`의 칸을 소비자가 쓰는 최소 형으로 선언합니다(NODE-045).
- 이름·경로 갱신과 상호작용 상태의 얕은 패치를 레코드 연산으로 둡니다(NODE-008).
- 커밋이 배달 비트와 페이로드를 표시할 수 있게 하되 전달 일정과 리스너 실행은 `dispatch`에 맡깁니다(EVENT-004·007).

### Ask first

- 노드의 고정 필드 순서나 행 칸을 늘려 숨은 클래스·의존 방향을 바꿀 때

### Never do

- `settle`, `SchemaNode`, `dispatch`, `validation`, 앱·플러그인 또는 레거시를 값·타입으로 가져오지 않습니다(NODE-045, LANDING-159).
- 레코드 안에서 정착·통지·검증을 실행하지 않습니다(NODE-004·006).
