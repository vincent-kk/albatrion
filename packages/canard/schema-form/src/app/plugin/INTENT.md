# schema-form/src/app/plugin

## Purpose
전역 플러그인 등록 및 상태 관리 모듈. `registerPlugin()` 함수로 렌더 컴포넌트, FormTypeInput 정의, 유효성 검사기, 에러 포매터를 전역적으로 확장한다.

## Structure
- `PluginManager.ts` — static 클래스, 전역 렌더 킷 및 플러그인 상태 보관
- `registerPlugin.ts` — 공개 API, 해시 기반 중복 방지 플러그인 등록
- `type.ts` — `SchemaFormPlugin`, `ValidatorPlugin` 인터페이스
- `index.ts` — barrel export

## Conventions
- `SchemaFormPlugin` 의 모든 필드는 선택적(optional)
- `ValidatorPlugin` 은 `bind(instance)` + `compile(jsonSchema)` 두 메서드 필수
- 렌더 컴포넌트는 `ComponentType<FormTypeRendererProps>` 타입 준수
- 플러그인 머지 규칙: 렌더 컴포넌트는 마지막 우선, `formTypeInputDefinitions` 는 선입 우선(prepend)

## Boundaries

### Always do
- 새 플러그인 속성 추가 시 `SchemaFormPlugin` 인터페이스와 `PluginManager.append*` 메서드를 함께 추가
- `ValidatorPlugin.compile()` 은 유효 시 `null`, 에러 시 에러 배열 반환
- 플러그인 등록 실패 시 `UnhandledError` 로 래핑하여 throw

### Ask first
- 기존 `SchemaFormPlugin` 인터페이스 필드 타입 변경 (외부 플러그인 패키지와 호환성 영향)
- `PluginManager.reset()` 이 초기화하는 기본값 변경
- 플러그인 머지 전략 수정 (prepend ↔ replace 등)

### Never do
- `PluginManager` 를 인스턴스화하여 사용 (static 전용 클래스)
- `registerPlugin()` 을 우회하여 `PluginManager.__field__` 에 직접 쓰기
- `ValidatorPlugin.compile()` 에서 에러를 throw 대신 삼키기

## Dependencies
- `@winglet/common-utils/filter` — `isPlainObject`
- `@winglet/common-utils/object` — `stableSerialize`, `remainOnlyReactComponent`
- `@/schema-form/errors` — `UnhandledError`
- `@/schema-form/helpers/error` — `formatValidationError`, `formatRegisterPluginError`
- `@/schema-form/types` — `FormTypeInputDefinition`, `FormTypeRendererProps`, `FormatError`, `ValidatorFactory`
