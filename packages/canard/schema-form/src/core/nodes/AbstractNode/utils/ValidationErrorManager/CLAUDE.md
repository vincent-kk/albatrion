# ValidationErrorManager

## Purpose
폼 노드의 에러 상태를 순수하게 관리하는 클래스. 로컬 에러(스키마 검증), 글로벌 에러(루트 전용), 외부 에러(서버 사이드)를 독립적으로 저장하고 병합한다. 이벤트 발행 및 트리 로직은 `AbstractNode` 에서 담당한다.

## Structure
- `ValidationErrorManager.ts` — 클래스 본체
- `index.ts` — barrel export

## Boundaries

### Always do
- `setLocalErrors()` / `setGlobalErrors()` / `setExternalErrors()` 반환값 확인: `true` 이면 변경 없음(이벤트 발행 불필요), `false` 이면 변경됨
- 외부 에러에 `key: number` 인덱스 부여 (`setExternalErrors` 에서 자동 처리)
- `filterExternalErrors()` 는 `key` 필드 기반으로 필터링

## Conventions
- TypeScript strict 모드
- `mergedLocalErrors` = `externalErrors` + `__localErrors__`
- `mergedGlobalErrors` = `externalErrors` + `__globalErrors__` (루트 전용)
- 동일 에러 중복 방지: `equals()` 로 deep 비교 (`RECURSIVE_ERROR_OMITTED_KEYS = Set(['key'])`)

### Ask first
- 에러 병합 순서 변경 (external 우선 vs local 우선)
- `key` 필드 네이밍 변경 (external 에러 식별자)

### Never do
- 이벤트 발행을 이 클래스 내부에서 수행
- `__globalErrors__` 를 루트 노드 외 컨텍스트에서 설정

## Dependencies
- `@winglet/common-utils/object` — `equals`
- `@/schema-form/types` — `JsonSchemaError` (ValidationError 타입)
