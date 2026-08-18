# constant — 상수 컬렉션

## Purpose

함수형 no-op 상수 6개(`VOID_FUNCTION` 등), 밀리초 기준 시간 단위 상수 5개, JS 내부 `[object X]` 타입 태그 문자열 28개, 10진·2진 배수 단위 상수 12개 — 4개 테마의 flat 리터럴 컬렉션을 소유한다.

함수 상수는 `Object.freeze`로 고정된 참조이고, 시간·타입태그·단위 상수는 원시값(숫자·문자열) 리터럴이거나 그 위의 산술식이다 — 모든 값은 조건 분기나 런타임 계산 없이 모듈 로드 시점에 확정된다.

## Conventions

- 모든 export 이름은 `UPPER_SNAKE_CASE`다.
- 각 값은 파일 로드 시점에 즉시 확정되는 리터럴이다 — 지연 계산이나 조건부 생성은 없다.

## Boundaries

### Always do

- 새 상수는 기존 4개 테마(`function`, `time`, `typeTag`, `unit`) 중 하나에 속할 때만 해당 파일에 추가한다
- 상수 리터럴 값 변경은 하위 호환을 깨는 변경이므로 DETAIL.md를 먼저 갱신한다

### Ask first

- 새로운 5번째 테마 파일 추가(기존 4개와 무관한 그룹)
- `typeTag` 문자열 포맷(`[object X]`) 변경

### Never do

- 이미 export된 상수의 리터럴 값을 다른 값으로 교체
- 상수 파일에 조건 분기·함수 호출 등 런타임 로직 추가
