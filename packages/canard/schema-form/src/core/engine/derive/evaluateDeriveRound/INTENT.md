# evaluateDeriveRound

## Purpose

정착의 한 파생 라운드에서 `unsetValue`, `derived`, `injectTo` 규칙의 에지를 판정하고, 대상마다 승자 하나만 남긴 쓰기 후보를 settle의 라운드 실행기에 돌려준다(SETTLE-004·043, CONTROLS-079).

## Conventions

- 대상별 승자는 종류 순위, 원천 문서 순서, 선언 층, 조각 순서를 차례로 비교해 고르며, 이 비교와 `injectTo` 대상 해석은 라운드 판정만 쓰므로 이 fractal 안에 둔다.
- 규칙 표, 기준점, 식 평가, 선택된 선언 판정처럼 상호작용 초기화 판정과 함께 쓰는 보조는 부모 derive의 `utils/`에서 위쪽으로 가져온다.

## Boundaries

### Always do

- 진 규칙의 에지도 소비하고, 앞 라운드에서 적용된 더 높은 순위를 뒤 라운드의 낮은 순위가 덮어쓰지 못하게 한다(SETTLE-004·005).
- 식이나 `injectTo` 함수의 실패는 규칙을 후보에서 빼고 실패 목록에 발생 순서대로 남긴다(SETTLE-004·028, ERROR-122·132).

### Ask first

- 종류 순위, 선언 층 순위, 동점일 때의 순서를 바꾸려는 경우(SETTLE-004·043, CONTROLS-073).

### Never do

- 원본에 직접 쓰거나 라운드 예산을 셈하지 않는다. 쓰기 적용과 예산은 settle의 실행기가 맡는다(SETTLE-004·011·017).
- 상호작용 초기화 판정이나 규칙 표 생성을 이 fractal로 끌어오지 않는다. 두 판정이 함께 쓰는 보조는 부모 derive가 소유한다.
