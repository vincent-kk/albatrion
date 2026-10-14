> 이름 함정: 이 `derive`는 정착의 파생 단계 전체를 가리키며, `controls.derived` 키 하나를 뜻하지 않는다(LANDING-063·083, SETTLE-004).

# derive — 파생 규칙 판정 경계

## Purpose

완성된 트리에서 파생 규칙의 에지를 찾고, 같은 대상에 규칙이 여럿이면 승자를 가려 정착 실행기에 돌려준다(LANDING-083, SETTLE-004·043).

## Conventions

- `index.ts`는 판정 함수, 규칙 표 함수, 상한, 형을 이름으로 내보낸다. 규칙 표는 청사진마다 한 번 만들어 재사용한다(NODE-016, LANDING-083, SETTLE-017·043).
- 값이 같은지는 settle과 함께 쓰는 engine의 `utils/compute/sameValue`로 비교한다. 선언 층은 engine의 순수 `utils/controls/` 해석을 settle과 함께 쓴다(SETTLE-043, CONTROLS-073·082).

## Boundaries

### Always do

- 직전 커밋의 값과 정착 중에 소비한 값을 구별하고, 쓰기에서 진 규칙의 에지도 소비한다(SETTLE-004·028·048).
- 개발 모드에서만 규칙별 기록 항목을 만들고 마지막 정착 기록을 런타임 칸에 맡긴다(ERROR-159, NODE-045, 28C-01).

### Ask first

- 규칙 종류의 순위, 선언 층에서 동점일 때의 순서, 에지 기준을 바꾸려는 경우(SETTLE-004·043, CONTROLS-073).

### Never do

- 원본에 직접 쓰거나 라운드와 커밋을 실행하지 않는다. 쓰기 적용과 예산은 소유자인 settle의 실행기가 맡는다(SETTLE-004·011·017, NODE-016).
- `settle/types/`, `settle/index.ts`, 쓰기·전이·커밋·라운드 실행 organ을 값이나 타입으로 가져오지 않고, 레거시 엔진도 가져오지 않는다(NODE-016·045, LANDING-159).
