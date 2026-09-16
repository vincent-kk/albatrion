# schema-form/src/app

## Purpose

애플리케이션 수준의 플러그인 시스템과 전역 상수를 관리하는 모듈. `PluginManager` 를 통해 렌더 킷, FormTypeInput 정의, 유효성 검사기를 전역 상태로 유지한다.

## Conventions

- TypeScript, 클래스 기반 singleton 패턴 (`PluginManager` static class)
- 플러그인은 콘텐츠 해시로 중복 등록을 방지 (`stableSerialize`)
- 상수는 용도별로 파일 분리 (bitmask / control / internal / style)

## Boundaries

### Always do

- 플러그인 상태 변경은 `PluginManager` 의 `append*` / `reset()` 메서드만 사용
- `registerPlugin(null)` 호출로 전역 플러그인을 기본값으로 복원
- 새 상수 추가 시 의미에 따라 적절한 상수 파일에 배치

### Ask first

- `PluginManager` 에 새로운 static 필드 추가 (전역 상태 증가)
- 비트 플래그 값 재배치 또는 기존 플래그 삭제 (노드 상태 비트마스크에 영향)
- 플러그인 머지 전략 변경 (render components: 마지막 우선, formTypeInputDefinitions: 선입 우선)

### Never do

- `PluginManager` 의 private `__field__` 에 직접 접근
- `RegisteredPlugin` Set을 우회하여 중복 플러그인 강제 등록
- constants 파일에 런타임 로직 추가 (상수만 포함해야 함)
