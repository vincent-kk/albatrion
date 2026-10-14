# plugin

## Requirements

외부 플러그인은 선택적 설정으로 렌더러, 입력 정의, 검증기, 오류 포맷을 확장합니다.
전역 플러그인 상태는 static singleton인 `PluginManager`가 소유하고, 노드별 상태는 이 등록소에 섞지 않습니다.

## API Contracts

- 이 fractal은 진단 문자열 포맷터 `formatRegisterPluginError`를 `utils/`에 두며, 상자 원소는 `helpers/error` 진입점에서 가져옵니다.
- 렌더 컴포넌트는 나중에 등록한 설정이 우선합니다. 입력 정의는 등록 순서에 따른 탐색 우선순위를 유지합니다.
- null 등록은 초기화로 처리하고, 일반 객체가 아닌 입력은 무시합니다. 등록 처리 중 오류가 나면 UnhandledError로 전달합니다.
- 중복 판정은 모듈 수명 동안 유지되는 fingerprint factory가 맡습니다. 기본 safe 모드로 속성을 정렬해 비교하고 결과는 캐시하지 않습니다. 함수 참조는 identity를 그대로 유지하고, mutable 플러그인은 매번 다시 계산합니다. 구조와 함수 참조가 같으면 속성 순서가 달라도 중복이고, closure가 다르면 별개의 플러그인입니다. 플러그인이 깊은 불변성을 갖추었다고 가정하지 않으므로 immutable 캐시는 쓰지 않습니다.
- 플러그인 상태는 `PluginManager.append*`와 `reset()`으로만 바꿉니다. `registerPlugin(null)`은 중복 기록과 기본 렌더·입력·검증·포맷 설정을 복원합니다.
- 공개 `ValidatorPlugin`은 `compile`과 동기 `compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean`을 반드시 갖춰야 하고, `bind?`·`release?(root: JSONSchema): void`·`readonly dialect?: string`은 선택입니다. core `Validator`와 구조가 같은 계약을 따르며, core 형을 이 모듈로 가져오지 않습니다(VALIDATE-015·044, LANDING-036·084, 32C-01, 34C-01, 35C-07).
- Form 속성 `validatorFactory`는 필수인 `compile`·`compileGuard`를 가진 객체입니다. 검증기는 Form 속성, FormProvider, 플러그인 순으로 우선해서 고르고, 등록소는 바인딩이 읽습니다. 선택한 참조가 바뀌면 트리를 다시 만들므로 참조를 안정적으로 유지해야 합니다. 바인딩은 선택한 결과(없으면 없음)를 core 생성 인자로 넘기며, core는 등록소를 가져오지도 `bind`를 호출하지도 않습니다(CONTROLS-075, VALIDATE-044, 32C-01).
- 개발 모드 여부는 사용하는 곳마다 bare `process.env.NODE_ENV !== 'production'`(부정은 `=== 'production'`) 비교로 판정합니다. 소비자 번들러는 사용하는 곳의 토큰만 production define으로 접기 때문에 모듈 상수나 함수로 빼내지 않습니다. 개발 전용 코드는 `if (process.env.NODE_ENV !== 'production' && …) { … }` 안에 두거나, 함수 첫 줄에 `if (process.env.NODE_ENV === 'production') return;`을 두어 끊습니다. `useMemo` 콜백처럼 다른 문과 함께 있는 자리에서는 esbuild가 조기 반환 뒤의 코드를 남기므로 블록을 사용합니다. `eslint.config.js`의 `no-restricted-syntax`는 그 밖의 비교, 대입, 구조 분해, 단독 참조를 막습니다. define도 `process`도 없는 호스트는 CommonJS 소비자와 마찬가지로 define을 직접 제공해야 합니다(189라운드, 196라운드, 200C-01).
- 렌더 키트와 Form 속성은 `FieldRenderer`·`FormLabelRenderer`·`FormInputRenderer`·`FormErrorRenderer`라는 이름을 함께 쓰고, 입력·그룹 props에서도 그룹 렌더러를 `FieldRenderer`라고 부릅니다(LANDING-035·067, SURFACE-002).
- 검증기와 플러그인 검증 계약의 구조가 일치하는지는 `__tests__/validatorConformance.test.ts`가, 검증기가 수명을 유지하는지와 가드를 읽는 동작은 `core/engine/validation/__tests__/validation.retain-guard.test.ts`가 검증합니다. 동기 가드 읽기는 validation 내부에서 소비하며, core·engine의 집계 진입점은 이를 다시 내보내지 않습니다.

- `PluginManager`와 `registerPlugin`은 `utils/`에 있습니다. 뿌리에는 문서, 진입점, 형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### plugin-contract — 관찰 가능한 동작

- 같은 콘텐츠를 다시 등록해도 기존 등록 결과가 중복되지 않습니다.
- 렌더러를 연속으로 등록하면 마지막 렌더러가 선택되고, 초기화하면 중복 등록 기록도 지워집니다.
- 초기화한 뒤 등록한 폼에는 초기화된 플러그인의 설정이 남지 않습니다.
- Form, Provider, 플러그인 중 어디서 고르든 검증기는 필수인 `compile`·`compileGuard`를 갖추어야 하며, 참조가 바뀌면 해당 폼 트리를 다시 만듭니다(VALIDATE-044, LANDING-036·084, 32C-01, 34C-01, 35C-07).

## Last Updated

2026-10-14 — 정돈-1; 계약 기준: VALIDATE-044, LANDING-036·067·084, 32C-01; 정돈-2(2026-10-14).
