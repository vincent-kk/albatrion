# schema-form/src/app/plugin

## Purpose

전역 플러그인 등록 및 상태 관리 모듈. `registerPlugin()` 함수로 렌더 컴포넌트, FieldInput 정의, 유효성 검사기, 에러 포매터를 전역적으로 확장한다.

## Conventions

- `SchemaFormPlugin` 의 모든 필드는 선택적(optional)
- `ValidatorPlugin`은 `compile(jsonSchema)`·동기 `compileGuard(root, pointer)`가 필수이며, `bind(instance)`는 소비자가 등록 전 인스턴스를 주입하는 선택 훅(코어는 호출하지 않음)
- 렌더 컴포넌트는 `ComponentType<FieldRendererProps>` 타입 준수
- 플러그인 머지 규칙: 렌더 컴포넌트는 마지막 우선, `fieldInputDefinitions` 는 선입 우선(prepend)
- `PluginManager`는 전역 상태를 유지하는 static singleton이며 노드별 상태를 저장하지 않습니다.
- 플러그인 중복 판정은 구조와 함수 identity를 함께 비교합니다.
- 개발 분기는 사용처마다 bare `process.env.NODE_ENV !== 'production'` 비교를 쓰며 모듈 상수·함수로 추출하지 않습니다.

## Boundaries

### Always do

- 새 플러그인 속성 추가 시 `SchemaFormPlugin` 인터페이스와 `PluginManager.append*` 메서드를 함께 추가
- `ValidatorPlugin.compile()`이 반환하는 검증 함수는 유효 시 `null`, 에러 시 에러 배열을 반환
- 플러그인 등록 실패 시 `UnhandledError` 로 래핑하여 throw
- 전역 상태 변경은 `PluginManager.append*`·`reset()` 통로만 사용하고 `registerPlugin(null)`로 기본 설정을 복원

### Ask first

- 기존 `SchemaFormPlugin` 인터페이스 필드 타입 변경 (외부 플러그인 패키지와 호환성 영향)
- `PluginManager.reset()` 이 초기화하는 기본값 변경
- 플러그인 머지 전략 수정 (prepend ↔ replace 등)
- `PluginManager`에 static 필드를 추가하여 전역 상태를 늘릴 때

### Never do

- `PluginManager` 를 인스턴스화하여 사용 (static 전용 클래스)
- `registerPlugin()` 을 우회하여 `PluginManager.__field__` 에 직접 쓰기
- `ValidatorPlugin.compile()` 에서 에러를 throw 대신 삼키기
- 중복 등록 기록을 우회하거나 전역 상수 정의를 이 모듈에 두기
