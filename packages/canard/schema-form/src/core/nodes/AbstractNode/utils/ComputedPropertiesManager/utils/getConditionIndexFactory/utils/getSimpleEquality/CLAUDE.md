# getSimpleEquality

## Purpose
`dependencies[n] === "value"` 패턴의 단순 등호 조건들을 분석하여 O(1) 딕셔너리 룩업 함수로 최적화한다. 패턴이 일치하지 않거나 다중 의존성 인덱스가 사용된 경우 `null` 을 반환한다.

## Structure
- `getSimpleEquality.ts` — 메인 함수
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 입력: `expressions: string[]`, `schemaIndices: number[]`
- 출력: `((dependencies: unknown[]) => number) | null`
- `SIMPLE_EQUALITY_REGEX` 로 `dependencies[n] === 'value'` 패턴 매칭
- 단일 의존성 인덱스(`dependencyIndex`)만 사용한 경우에만 최적화 적용
- 최적화 조건: 모든 expression이 동일한 `dependencies[n]` 을 참조하는 단순 등호

## Boundaries

### Always do
- `SIMPLE_EQUALITY_REGEX` 매칭 실패 시 즉시 `null` 반환
- 둘 이상의 다른 의존성 인덱스 발견 시 `null` 반환

### Ask first
- 최적화 조건 확장 (예: 숫자 비교, 부등호 패턴)

### Never do
- 최적화 실패 케이스에서 부분 최적화 함수 반환
- `SIMPLE_EQUALITY_REGEX` 를 이 모듈 외부에서 임의로 변경

## Dependencies
- `../../../regex` — `SIMPLE_EQUALITY_REGEX`
- `@winglet/common-utils/object` — `countKey`, `getEmptyObject`, `getFirstKey`
- `@aileron/declare` — `Dictionary`
