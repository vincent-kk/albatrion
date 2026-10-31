# validation — 검증기 계약과 판정 경계

## Purpose

작성 스키마 사본, 검증기 캐시와 가드, 검증 실행과 오류 라우팅, 작성 루트의 수명을 하나의 계약으로 소유한다(VALIDATE-018·021·043·044·048, LANDING-084).

## Conventions

- 의존 순서는 `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`이다. `settle`은 이 fractal의 동기 가드 읽기를 소비하고, 결과 배달은 넘겨받은 콜백을 통해 요청자에게 돌려준다(NODE-016·045, LANDING-084).
- `index.ts`는 검증 계약 형과 `readValidationEntry`, `compileEntryGuards`, `runFieldNodeValidation`, `routeValidationIssues`, `retainEqualValidationIssues`, `EMPTY_GLOBAL_ERRORS`를 이름으로 내보낸다. 동기 가드와 오류 읽기, 재생성 루트의 컴파일 사전 점검과 수명 함수도 이름으로 내보낸다. 수명 함수는 core가 바인딩용으로 명명 재수출하며 패키지 진입점에는 노출하지 않는다(NODE-010, VALIDATE-044·046, LANDING-159).
- 캐시는 검증기 인스턴스와 작성 루트 정체성의 쌍이 소유한다. 런타임에는 선택한 검증기와 모드, 최신 커밋과 요청 스탬프, 노드 오류 맵, 결과 배달 콜백을 둔다. 노드의 고정 필드는 늘리지 않는다(VALIDATE-018·048·049, NODE-004·045).

- 프레임 예약과 연속 입력 주기는 형제 `validationScheduling`이 소유하며 이 모듈은 매 요청마다 주기의 request를 호출한다. 마운트는 그 형제의 일회성 슬롯을 core를 통해 사용한다. 요청 여부 조회는 validation→engine의 `hasFieldNodeValidationRequest`를 surface 래퍼로 이어 core가 재수출하며 패키지 진입점은 넓히지 않는다.

## Boundaries

### Always do

- 가드는 동기 boolean이며, 검증기는 스키마와 방출 값을 바꾸지 않는다. core는 `bind`를 호출하지 않는다(VALIDATE-015·016·044·050).
- 전체 오류 목록은 루트에 보존하고, 노드별 표시만 경로와 활성 분기에 따라 라우팅한다. 검증 판정은 라우팅 때문에 바뀌지 않는다(VALIDATE-043, FRAGMENT-053).
- 살아 있는 트리의 참조 수와 최근 해제 목록을 함께 관리해, 같은 작성 루트를 다시 마운트하면 캐시를 재사용한다(VALIDATE-021·045·048).

### Ask first

- 캐시 키, 가드 컴파일 시점, 수명 상한 8, 검증 결과의 스탬프 판정을 바꾸려는 경우(VALIDATE-018·021·048·049).

### Never do

- `settle`, `write`, `FieldNode`, `__legacy__`, `app/plugin`, React, `src/types` 색인을 값이나 타입으로 가져오지 않는다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-159).
- 검증 결과의 파동을 직접 배달하지 않고, 전역 등록소에서 플러그인을 고르지도 않는다(LANDING-084, CONTROLS-075).
