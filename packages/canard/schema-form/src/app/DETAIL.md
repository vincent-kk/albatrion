# app

## Requirements

전역 플러그인 상태와 상수의 의미를 유지하며, 노드별 상태를 전역 저장소에 섞지 않습니다.

## API Contracts

- 플러그인 상태 변경은 PluginManager의 등록·초기화 경로로 수행합니다. 동일 콘텐츠의 플러그인은 중복 등록하지 않습니다.
- registerPlugin에 null을 전달하면 등록 상태와 기본 설정을 복원합니다.
- 공개 `ValidatorPlugin`은 기존 `compile`과 `bind?`를 유지하면서 `compileGuard?(root: JSONSchema, pointer: string): (value: unknown) => boolean`, `release?(root: JSONSchema): void`, `readonly dialect?: string`을 선택 멤버로 더합니다. `compileGuard`의 판정은 동기이며 이 서명은 core `Validator`의 대응 메서드와 구조적으로 맞습니다. 07의 소비자 이주까지 선택성을 유지하고 core 형을 `app/plugin`으로 가져오지 않습니다(VALIDATE-015·044, LANDING-036·084, 32C-01, 34C-01).
- `PluginManager`의 검증기 칸은 바인딩이 읽는 등록소입니다. 바인딩이 Form 속성 > FormProvider > 플러그인 순서로 검증기를 고른 뒤 core 트리 생성 인자로 전달하고, core는 이 모듈을 가져오거나 `bind`를 부르지 않습니다(CONTROLS-075, VALIDATE-044).

## Acceptance Criteria

### app-contract — 관찰 가능한 동작

- 동일 플러그인을 반복 등록해도 입력 정의와 렌더 설정이 중복 누적되지 않습니다.
- 초기화 후에는 이전 플러그인의 설정이 다음 폼에 남지 않습니다.
- 선택 `compileGuard?`·`release?`·`dialect?` 추가 뒤에도 기존 플러그인 값의 형이 유효하고, 새 메서드를 가진 플러그인은 core `Validator` 서명에 구조적으로 맞습니다(LANDING-084, 34C-01).

## Last Updated

2026-09-16
