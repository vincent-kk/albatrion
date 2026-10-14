> 이름 함정: 이 `derive`는 정착의 파생 단계 전체이며 `controls.derived` 키 하나를 뜻하지 않습니다(LANDING-063·083, SETTLE-004).

# derive — 파생 규칙 판정 경계

## Purpose

완성된 트리에서 파생 규칙의 에지와 같은 대상의 승자를 판정해 정착 실행기에 돌려줍니다(LANDING-083, SETTLE-004·043).

## Conventions

- `index.ts`는 판정 함수·규칙 표 함수·상한·형을 이름으로 내보내고, 규칙 표는 청사진마다 한 번 만들어 재사용합니다(NODE-016, LANDING-083, SETTLE-017·043).
- 값 동등은 settle의 `sameValue`를, 선언 층은 settle의 순수 `utils/controls/` 해석을 공유합니다(SETTLE-043, CONTROLS-073·082).

## Boundaries

### Always do

- 직전 커밋과 정착 안에서 소비한 값을 구별하고, 진 쓰기의 에지도 소비합니다(SETTLE-004·028·048).
- 개발 모드에서만 규칙별 기록 항목을 만들고 마지막 정착 기록은 런타임 칸에 맡깁니다(ERROR-159, NODE-045, 28C-01).

### Ask first

- 규칙 종류의 순위, 선언 층의 동점 순서 또는 에지 기준을 바꿀 때(SETTLE-004·043, CONTROLS-073).

### Never do

- 원본을 직접 쓰거나 라운드·커밋을 실행하지 않습니다. 쓰기 적용과 예산은 소유자인 settle의 실행기가 맡습니다(SETTLE-004·011·017, NODE-016).
- `settle/type.ts`·`settle/index.ts`·쓰기·전이·커밋·라운드 실행 organ을 값 또는 타입으로 가져오거나 레거시 엔진을 가져오지 않습니다(NODE-016·045, LANDING-159).
