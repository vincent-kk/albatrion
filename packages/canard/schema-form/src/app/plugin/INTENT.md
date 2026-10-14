# schema-form/src/app/plugin

## Purpose

전역 플러그인을 등록하고 그 상태를 관리하는 모듈. `registerPlugin()` 함수로 렌더 컴포넌트, FieldInput 정의, 유효성 검사기, 에러 포매터를 전역에서 확장한다.

## Conventions

- `SchemaFormPlugin`의 모든 필드는 선택이다.
- `ValidatorPlugin`은 `compile(jsonSchema)`와 동기 `compileGuard(root, pointer)`가 필수이다. `bind(instance)`는 소비자가 등록하기 전에 인스턴스를 주입하는 선택 훅이며, 코어는 이를 호출하지 않는다.
- 렌더 컴포넌트는 `ComponentType<FieldRendererProps>` 타입을 따른다.
- 플러그인 병합 규칙: 렌더 컴포넌트는 마지막에 등록한 것이 우선하고, `fieldInputDefinitions`는 나중에 등록한 정의를 목록 앞에 붙여(prepend) 먼저 매칭한다.
- `PluginManager`는 전역 상태를 유지하는 static singleton이며 노드별 상태는 저장하지 않는다.
- 플러그인 중복은 구조와 함수 identity를 함께 비교해서 판정한다.
- 개발 모드 분기는 사용하는 곳마다 bare `process.env.NODE_ENV !== 'production'` 비교를 쓰고, 모듈 상수나 함수로 빼내지 않는다.

## Boundaries

### Always do

- 새 플러그인 속성을 추가할 때 `SchemaFormPlugin` 인터페이스와 `PluginManager.append*` 메서드를 함께 추가
- `ValidatorPlugin.compile()`이 반환하는 검증 함수는 유효하면 `null`, 오류가 있으면 오류 배열을 반환
- 플러그인 등록에 실패하면 `UnhandledError`로 감싸서 throw
- 전역 상태는 `PluginManager.append*`와 `reset()`으로만 바꾸고, 기본 설정은 `registerPlugin(null)`로 복원

### Ask first

- 기존 `SchemaFormPlugin` 인터페이스 필드의 타입을 바꿀 때 (외부 플러그인 패키지와의 호환성에 영향)
- `PluginManager.reset()`이 초기화하는 기본값을 바꿀 때
- 플러그인 병합 전략을 수정할 때 (prepend와 replace 사이의 전환 등)
- `PluginManager`에 static 필드를 추가해서 전역 상태를 늘릴 때

### Never do

- `PluginManager`를 인스턴스화해서 사용 (static 전용 클래스)
- `registerPlugin()`을 거치지 않고 `PluginManager.__field__`에 직접 쓰기
- `ValidatorPlugin.compile()`에서 오류를 throw하지 않고 삼키기
- 중복 등록 기록을 우회하거나 전역 상수 정의를 이 모듈에 두기
