# app

## Requirements

전역 플러그인 상태와 상수의 의미를 유지하며, 노드별 상태를 전역 저장소에 섞지 않습니다.

## API Contracts

- 플러그인 상태 변경은 PluginManager의 등록·초기화 경로로 수행합니다. 동일 콘텐츠의 플러그인은 중복 등록하지 않습니다.
- registerPlugin에 null을 전달하면 등록 상태와 기본 설정을 복원합니다.
- 공개 `ValidatorPlugin`은 `compile`과 동기 `compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean`을 필수로 가지며 `bind?`·`release?(root: JSONSchema): void`·`readonly dialect?: string`은 선택 멤버입니다. core `Validator`와 구조적으로 같은 검증 계약을 따르되 core 형을 `app/plugin`으로 가져오지 않습니다(VALIDATE-015·044, LANDING-036·084, 32C-01, 34C-01, 35C-07).
- Form 속성 `validatorFactory`의 공개 형은 함수 하나가 아닌 필수 `compile`·`compileGuard`를 가진 `{ compile, compileGuard }` 객체 계약입니다. `PluginManager`의 검증기 칸은 바인딩이 읽는 등록소이며, 선택 순서는 Form 속성 > FormProvider > 플러그인입니다. 선택한 검증기 참조가 바뀌면 트리를 재생성하므로 참조는 안정적으로 유지합니다. 선택 결과나 없음을 core 생성 인자로 전달하고 core는 이 모듈을 가져오거나 `bind`를 부르지 않습니다(CONTROLS-075, VALIDATE-044, 32C-01).
- 렌더 키트의 이름은 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`이며 플러그인 키와 Form 속성이 같은 이름을 사용합니다. 그룹 렌더러를 넘기는 입력·그룹 props도 `FormTypeGroupRenderer` 이름을 사용합니다(LANDING-035·067, SURFACE-002).

## Acceptance Criteria

### app-contract — 관찰 가능한 동작

- 동일 플러그인을 반복 등록해도 입력 정의와 렌더 설정이 중복 누적되지 않습니다.
- 초기화 후에는 이전 플러그인의 설정이 다음 폼에 남지 않습니다.
- Form·Provider·플러그인에서 고른 검증기는 필수 `compile`·`compileGuard`를 만족하며, 선택 참조가 바뀌면 해당 폼의 트리가 재생성됩니다. 플러그인 계약은 core `Validator` 서명과 구조적으로 맞습니다(VALIDATE-044, LANDING-036·084, 32C-01, 34C-01, 35C-07).

## Last Updated

계약 기준: VALIDATE-044, LANDING-036·067·084, 32C-01.
