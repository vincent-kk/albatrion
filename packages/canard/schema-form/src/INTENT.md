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

- 새 노드 타입은 노드 구현 모듈에 두고 해당 공개 진입점에서 이름을 지정해 export
- `FormTypeInput` 컴포넌트는 `FormTypeInputProps` 인터페이스를 구현
- 에러 발생 시 도메인 에러 클래스 사용 (`JsonSchemaError`, `SchemaFormError` 등)
- 플러그인 등록은 반드시 `registerPlugin()` API를 통해 수행

### Ask first

- 새 Context 추가 전 Provider 계층의 설계 검토 요청
- bitmask 플래그 변경 (기존 노드 상태에 영향)
- 번들 크기 20KB 제한에 영향을 줄 수 있는 의존성 추가

### Never do

- 독립 계약을 갖지 않는 organ에 INTENT.md를 추가해 독립 프랙탈로 취급
- `PluginManager` 의 static 상태를 `registerPlugin()` 우회하여 직접 변경
- 내부 `__method__` 패턴 메서드를 외부 컴포넌트에서 직접 호출
- 공개 진입점이 아닌 구현을 패키지 소스 루트에 직접 추가 (소유하는 하위 모듈에 배치)
