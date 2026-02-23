# jsonPointer

## Purpose
RFC 6901 표준 JSONPointer에 schema-form 전용 확장 심볼(`..` Parent, `.` Current, `*` Wildcard, `@` Context)을 추가한 상수 열거형과 경로 조작 유틸을 제공한다.

## Structure
- `enum.ts` — `JSONPointer` 상수 객체 및 타입 (확장 심볼 포함)
- `utils/` — 경로 조작 순수 함수
  - `getAbsolutePointer.ts` — 상대 경로를 절대 경로로 변환 (`./`, `../` 처리)
  - `isAbsolutePath.ts` — `/` 또는 `#/` 시작 여부 확인
  - `isRelativePath.ts` — `./` 또는 `../` 시작 여부 확인
  - `joinSegment.ts` — 경로에 세그먼트 결합
  - `stripFragment.ts` — `#` 프리픽스 제거 및 루트 정규화
- `index.ts` — `JSONPointer` 열거형과 `utils/*` 함수를 barrel export

## Conventions
- `JSONPointer.Index`는 deprecated — `Wildcard` 사용
- `getAbsolutePath`: `./` → 현재 경로 append, `../` → 부모 경로로 ascend
- `stripFragment`: `#`, `#/`, `/` 단독은 모두 루트(`''`)로 정규화
- 모든 유틸은 순수 함수, 문자열 리터럴 비교로 성능 최적화

## Boundaries

### Always do
- 확장 심볼(`..`, `.`, `*`, `@`)을 표준 JSONPointer 경로 연산에서 사용할 때 컨텍스트를 명시할 것
- `stripFragment` 후 `getAbsolutePath`를 호출하는 순서를 지킬 것

### Ask first
- 새 확장 심볼 추가 (computed 표현식 파서 및 경로 해석 전반에 영향)
- `getAbsolutePath`의 `../` 처리 횟수 제한 또는 에러 처리 추가

### Never do
- `JSONPointer.Index`를 신규 코드에서 사용 (deprecated)
- `utils/` 내 함수에서 외부 상태 접근 또는 에러 throw

## Dependencies
- `@winglet/json/pointer` — `JSONPointer` (공식 RFC 6901 상수 기반)
