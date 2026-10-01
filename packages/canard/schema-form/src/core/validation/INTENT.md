# validation — 검증기 계약과 판정 경계

## Purpose

작성 스키마 사본, 검증기 캐시·가드, 검증 실행·오류 라우팅과 작성 루트의 수명을 한 계약으로 소유합니다(VALIDATE-018·021·043·044·048, LANDING-084).

## Conventions

- 의존 순서는 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < SchemaNode`입니다. `settle`은 이 fractal의 동기 가드 읽기를 소비하고 결과 배달은 받은 콜백으로 요청자에게 돌립니다(NODE-016·045, LANDING-084).
- `index.ts`는 검증 계약 형, 동기 가드 읽기, 실행·라우팅·오류 읽기, 재생성 루트의 컴파일 사전 점검과 수명 함수를 이름으로 내보냅니다. 두 수명 함수만 `core/index.ts`가 바인딩을 위해 다시 내보내며 `src/index.ts`는 내보내지 않습니다(NODE-010, VALIDATE-044·046, LANDING-159).
- 캐시는 검증기 인스턴스와 작성 루트 정체성의 쌍이 소유합니다. 런타임에는 선택한 검증기·모드, 최신 커밋/요청 스탬프, 노드 오류 맵과 결과 배달 콜백을 둡니다. 노드 고정 필드를 늘리지 않습니다(VALIDATE-018·048·049, NODE-004·045).

## Boundaries

### Always do

- 가드는 동기 boolean이며 스키마와 방출 값은 검증기가 바꾸지 않습니다. core는 `bind`를 부르지 않습니다(VALIDATE-015·016·044·050).
- 전체 오류 목록은 루트에 보존하고 노드별 표시만 경로와 활성 분기에 따라 라우팅합니다. 검증 판정은 라우팅으로 바꾸지 않습니다(VALIDATE-043, FRAGMENT-053).
- 살아 있는 트리의 참조 세기와 최근 해제 목록을 함께 관리해 같은 작성 루트의 재마운트는 캐시를 재사용합니다(VALIDATE-021·045·048).

### Ask first

- 캐시 키, 가드 컴파일 시점, 수명 상한 8 또는 검증 결과의 스탬프 판정을 바꿀 때(VALIDATE-018·021·048·049).

### Never do

- `settle`, `dispatch`, `SchemaNode`, `__legacy__`, `app/plugin`, React 또는 `src/types` 색인을 값·타입으로 가져오지 않습니다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-159).
- 검증 결과 파동을 직접 배달하거나 플러그인을 전역 등록소에서 고르지 않습니다(LANDING-084, CONTROLS-075).
