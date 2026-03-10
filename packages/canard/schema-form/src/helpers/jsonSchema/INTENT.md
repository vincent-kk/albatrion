# jsonSchema Helpers

## Purpose
JSON Schema 처리를 위한 헬퍼 함수 모음. 스키마 추출, $ref 해석, 전처리(oneOf/virtual), allOf 병합, 확장 필드 제거를 담당한다.

## Structure
- `extractSchemaInfo/` — 스키마에서 type/nullable 정보 추출
- `getResolveSchema/` — $ref 참조 해석 함수 생성
- `preprocessSchema/` — oneOf 변형 및 virtual 스키마 전처리
- `processAllOfSchema/` — allOf 배열을 단일 스키마로 병합
- `stripSchemaExtensions/` — FormTypeInput 등 확장 필드 제거
- `filter.ts` — `isTerminalType`, `isBranchType` 타입 가드
- `index.ts` — 모든 공개 API의 barrel export

## Conventions
- TypeScript strict 모드
- 각 기능은 독립 서브디렉토리에 위치하며 `index.ts`로 export
- 순수 함수 형태로 구현 (부수 효과 없음)
- `@winglet/json-schema/scanner`의 `JsonSchemaScanner`를 트리 순회에 활용

## Boundaries

### Always do
- 새 헬퍼 추가 시 독립 서브디렉토리를 생성하고 `index.ts`에 export 추가
- 공개 API는 반드시 `index.ts`의 barrel export를 통해 노출
- 함수는 순수 함수로 유지 (입력만으로 결과 결정, 전역 상태 미사용)

### Ask first
- 기존 공개 함수 시그니처 변경 (호출부 전반에 영향)
- `filter.ts`의 타입 분류 기준 변경 (`virtual` 타입 추가/제거 등)

### Never do
- `helpers` organ 디렉토리 자체에 INTENT.md 생성
- 이 디렉토리에서 직접 React 컴포넌트나 노드 인스턴스 생성
- `index.ts`를 우회하여 서브디렉토리 내부 파일을 직접 import

## Dependencies
- `@winglet/json-schema/filter` — 스키마 타입 필터 유틸
- `@winglet/json-schema/scanner` — `JsonSchemaScanner` 트리 순회
- `@winglet/common-utils/filter` — `isArray`, `isEmptyObject` 등
- `@winglet/common-utils/object` — `merge`, `clone`, `cloneLite`
- `@winglet/json/pointer` — JSONPointer `getValue`
- `@aileron/declare` — `Fn`, `Dictionary` 공통 타입
