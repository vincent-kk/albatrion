# plugin

## Requirements

외부 플러그인은 선택적 설정으로 렌더러, 입력 정의, 검증기와 오류 포맷을 확장합니다.
전역 플러그인 상태는 static singleton인 `PluginManager`가 소유하며 노드별 상태를 이 등록소에 섞지 않습니다.

## API Contracts

- 이 fractal은 진단 문자열 포맷터 `formatRegisterPluginError`를 `utils/`에 소유하며 상자 원소는 `helpers/error` 진입점에서 가져옵니다.
- 렌더 컴포넌트는 나중 설정을 우선하며, 입력 정의는 등록 순서에 따른 탐색 우선순위를 유지합니다.
- null 등록은 초기화로 처리하고, 일반 객체가 아닌 입력은 무시합니다. 등록 처리 중 오류는 UnhandledError로 전달합니다.
- 중복 판정은 모듈 수명의 fingerprint factory로 처리합니다. 기본 safe 모드, 속성 정렬, 결과 캐시 없음 정책을 사용합니다. 함수 참조 identity를 유지하며 mutable 플러그인은 매번 재계산합니다. 같은 구조와 같은 함수 참조는 속성 순서와 무관하게 중복이고 다른 closure는 별개입니다. 플러그인의 깊은 불변성을 요구하지 않으므로 immutable 캐시는 사용하지 않습니다.
- 플러그인 상태 변경은 `PluginManager.append*`·`reset()` 통로만 사용하며 `registerPlugin(null)`은 중복 기록과 기본 렌더·입력·검증·포맷 설정을 복원합니다.
- 공개 `ValidatorPlugin`은 `compile`과 동기 `compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean`이 필수이고 `bind?`·`release?(root: JSONSchema): void`·`readonly dialect?: string`은 선택입니다. core `Validator`와 구조적으로 같은 계약을 따르며 core 형을 이 모듈로 가져오지 않습니다(VALIDATE-015·044, LANDING-036·084, 32C-01, 34C-01, 35C-07).
- Form 속성 `validatorFactory`는 필수 `compile`·`compileGuard`를 가진 객체입니다. 검증기 선택은 Form 속성 > FormProvider > 플러그인이며 등록소는 바인딩이 읽습니다. 선택한 참조가 바뀌면 트리를 재생성하므로 참조를 안정적으로 유지합니다. 바인딩은 선택 결과나 없음을 core 생성 인자로 전달하며 core는 등록소를 가져오거나 `bind`를 부르지 않습니다(CONTROLS-075, VALIDATE-044, 32C-01).
- 개발 모드 판정은 사용처마다 bare `process.env.NODE_ENV !== 'production'`(부정은 `=== 'production'`) 비교를 사용합니다. 소비자 번들러는 사용처의 토큰만 production define으로 접으므로 모듈 상수·함수로 추출하지 않습니다. 개발 전용 본문은 `if (process.env.NODE_ENV !== 'production' && …) { … }` 안에 두거나 함수 첫 줄의 `if (process.env.NODE_ENV === 'production') return;`로 끊습니다. 다른 문과 합쳐지는 자리(예: `useMemo` 콜백)에서는 esbuild가 조기 반환 뒤 본문을 남기므로 블록을 사용합니다. `eslint.config.js`의 `no-restricted-syntax`는 다른 비교·대입·구조 분해·단독 참조를 막습니다. define과 `process`가 없는 호스트는 CommonJS 소비자와 같이 define을 제공해야 합니다(189라운드, 196라운드, 200C-01).
- 렌더 키트와 Form 속성은 `FieldRenderer`·`FormLabelRenderer`·`FormInputRenderer`·`FormErrorRenderer` 이름을 공유하며, 입력·그룹 props도 그룹 렌더러를 `FieldRenderer`로 부릅니다(LANDING-035·067, SURFACE-002).
- 검증기와 플러그인 검증 계약의 구조적 일치는 `core/engine/validation/__tests__/validatorConformance.test.ts`가 검증합니다. 동기 가드 읽기는 validation 내부에서 소비하며 core·engine 집계 진입점은 재수출하지 않습니다.

## Acceptance Criteria

### plugin-contract — 관찰 가능한 동작

- 같은 콘텐츠를 재등록해도 기존 등록 결과가 중복되지 않습니다.
- 렌더러를 연속 등록하면 마지막 렌더러가 선택되며, 초기화는 중복 등록 기록도 지웁니다.
- 초기화 뒤 등록한 폼에 초기화 대상 플러그인의 설정이 남지 않습니다.
- Form·Provider·플러그인에서 고른 검증기는 필수 `compile`·`compileGuard`를 만족하며 참조가 바뀌면 해당 폼 트리를 재생성합니다(VALIDATE-044, LANDING-036·084, 32C-01, 34C-01, 35C-07).

## Last Updated

2026-10-14 — 정돈-1; 계약 기준: VALIDATE-044, LANDING-036·067·084, 32C-01; 정돈-2(2026-10-14).
