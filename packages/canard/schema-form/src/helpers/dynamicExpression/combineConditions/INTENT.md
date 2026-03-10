# combineConditions

## Purpose
문자열 조건 배열을 지정한 논리 연산자(`&&` 또는 `||`)로 결합해 단일 표현식 문자열을 생성하는 순수 함수.

## Structure
- `combineConditions.ts` — 구현
- `index.ts` — named export

## Conventions
- falsy 값(`null`, `undefined`, `''`)은 자동 필터링
- 단일 조건이면 괄호 없이 그대로 반환
- 다중 조건은 각 항목을 `()` 로 래핑 후 연산자로 결합
- 기본 연산자: `'&&'`

## Boundaries

### Always do
- 빈 배열 또는 전부 falsy인 입력에서 `null`을 반환할 것
- 각 조건을 `(`...`)` 로 래핑하여 우선순위 충돌 방지

### Ask first
- `'&&'` / `'||'` 이외의 연산자 지원 추가

### Never do
- 조건 문자열 내용을 파싱하거나 수정
- 표현식을 직접 실행하는 로직 추가

## Dependencies
- `@winglet/common-utils/array` — `map`
- `@winglet/common-utils/filter` — `isTruthy`
- `@aileron/declare` — `Nullish`
