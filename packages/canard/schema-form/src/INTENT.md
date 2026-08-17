# schema-form/src

## Purpose

JSON Schema 기반 폼 생성 라이브러리의 전체 소스 루트. 노드 시스템, 플러그인, 렌더링 컴포넌트, 타입 정의를 통합한다.

## Conventions

- TypeScript strict 모드; barrel export는 `index.ts` 로만 수행
- 클래스 멤버는 Domain-First 순서 (Identity → Tree → Value → Computed → State → Validation → Events → Lifecycle → Constructor)
- JSDoc: `@internal`, `@remarks`, `@param name - desc`, `@example` 태그 사용
- 내부 필드는 `__fieldName__` 이중 언더스코어 네이밍

## Boundaries

### Always do

- 새 노드 타입 추가 시 `core/nodes/` 하위에 위치시키고 `index.ts` 에 export 추가
- `FormTypeInput` 컴포넌트는 `FormTypeInputProps` 인터페이스를 구현
- 에러 발생 시 `errors/` 의 도메인 에러 클래스 사용 (`JsonSchemaError`, `SchemaFormError` 등)
- 플러그인 등록은 반드시 `registerPlugin()` API를 통해 수행

### Ask first

- `providers/` 에 새 Context 추가하기 전 설계 검토 요청
- `app/constants/` 의 bitmask 플래그 변경 (기존 노드 상태에 영향)
- 번들 크기 20KB 제한에 영향을 줄 수 있는 의존성 추가

### Never do

- `organ` 디렉토리(`components`, `utils`, `types`, `hooks`, `helpers`)에 INTENT.md 생성
- `PluginManager` 의 static 상태를 `registerPlugin()` 우회하여 직접 변경
- 내부 `__method__` 패턴 메서드를 외부 컴포넌트에서 직접 호출
- `src/` 루트에 소스 파일 직접 추가 (반드시 하위 모듈로 분류)

## Dependencies

- `@winglet/common-utils`·`@winglet/react-utils` — 공통·React 유틸리티
- `@winglet/json`·`@winglet/json-schema` — JSONPointer·Schema 타입/유틸
- `@aileron/declare` — 공통 타입; React 18-19 (peer dependency)
