# 14라운드 — 단계 분할용 코드 사실 (scout 원문)

2026-09-24. 경로는 모두 저장소 루트 기준 `packages/canard/` 하위. 파일/줄 수는 `.ts`/`.tsx` 소스 기준이며 `__tests__` 디렉터리는 제외. 편집자는 고치지 않았다.

## 1. `schema-form/src` 디렉터리별 파일 수·줄 수

| 디렉터리 | 파일 수 | 줄 수 |
|---|---|---|
| app | 9 | 642 |
| components | 33 | 2,056 |
| core | 178 | 9,884 |
| errors | 5 | 137 |
| formTypeDefinitions | 11 | 656 |
| helpers | 134 | 6,087 |
| hooks | 6 | 508 |
| providers | 29 | 845 |
| types | 11 | 1,375 |

`core/nodes`를 노드 종류별로 세분(클래스 파일 + 하위 utils/strategies 전부 포함):

| 노드 | 파일 수 | 줄 수 | 비고 |
|---|---|---|---|
| AbstractNode | 71 | 3,991 | 본체 `AbstractNode.ts` 1,228줄 + `utils/` 68파일 2,706줄(계산 속성·검증 매니저·이벤트 캐스케이드 등) |
| ObjectNode | 45 | 2,363 | 본체 168줄 + `strategies/`(BranchStrategy 등) 39파일 2,185줄 + `utils/` 3파일 10줄 |
| ArrayNode | 28 | 1,441 | 본체 393줄 + `strategies/` 15파일 930줄 + `utils/` 9파일 118줄 |
| StringNode | 3 | 214 | |
| VirtualNode | 3 | 199 | |
| NumberNode | 3 | 195 | |
| NullNode | 3 | 163 | |
| BooleanNode | 3 | 157 | |
| ContextNode | 2 | 52 | |
| (nodes 루트) | 3 | 384 | `schemaNodeFactory.ts` 155, `filter.ts` 198, `index.ts` 31 |

`core/parsers` 185줄(5파일), `core/types` 449줄(5파일).

## 2. 공개 진입점 `schema-form/src/index.ts` 내보내기 목록

- **플러그인 계약**(3): `SchemaFormPlugin`, `ValidatorPlugin`, `registerPlugin`
- **컴포넌트**(1) + 부속 타입 5개: `Form`(+ `FormProps`, `FormHandle`, `FormChildrenProps`, `FormErrorProps`, `FormLabelProps`)
- **오류 판별 함수**(4): `isSchemaFormError`, `isJSONSchemaError`, `isUnhandledError`, `isValidationError`
- **헬퍼**(2): `JSONPointer`, `VirtualizationBackfill`(+ 가상화 타입 3개)
- **노드 시스템**(약 20): 타입 가드 9개(`isArrayNode` 등), 노드 타입 9개(`SchemaNode`, `ArrayNode` 등), 열거값 `NodeState`/`ValidationMode`/`NodeEventType`/`SetValueOption`
- **오류 관련 타입**: `ShowError`, `PublicJSONSchemaError`(as `JSONSchemaError`)
- **FormTypeInput 계약 타입**(약 12): `FormTypeInputProps`, `FormTypeInputDefinition`, `FormTypeTestFn` 등
- **`types/rolled`에서 재수출되는 전체 타입 번들**(`export type *`) — 여기에 `FormTypeRendererProps`(플러그인들이 실제로 가져다 쓰는 타입) 포함
- **훅**(5): `useSchemaNodeTracker`, `useSchemaNodeSubscribe`, `useChildNodeComponentMap`, `useChildNodeErrors`, `useFormSubmit`
- **Provider**(1): `ExternalFormContextProvider`(as `FormProvider`)

## 3. 형제 플러그인 패키지와 가져오는 심볼

패키지 7개: `schema-form-ajv6-plugin`, `-ajv7-plugin`, `-ajv8-plugin`, `-antd-mobile-plugin`, `-antd5-plugin`, `-antd6-plugin`, `-mui-plugin`.

- ajv6/7/8 플러그인: `@canard/schema-form`에서 `ValidatorPlugin`, `ValidateFunction`, `JSONSchema` 타입만 가져옴. ajv8은 자체 서브패스(`/2019`, `/2020`)도 내부적으로 노출.
- antd-mobile/antd5/antd6/mui 플러그인: `FormTypeRendererProps` 타입 하나만 가져옴.
- **내부 경로 침범**: 없음 — 모두 패키지 진입점(`index.ts`가 내보내는 이름)만 사용.

## 4. 테스트 현황

`src/**/__tests__` 디렉터리 29개, 파일 총 205개, `it(`/`test(` 호출 총 약 3,150건. 밀집 구역:
- `src/core/__tests__`: 89파일, 1,139건(노드 트리 단위 테스트 대다수)
- `src/__tests__`: 2파일, 442건(`renderForm.tsx` 기반 렌더 레벨 통합 시나리오)
- `getComputedPropertiesManager` 하위: 14+2파일, 549건(computed/조건부 파싱)
- `helpers/jsonSchema` 계열(전처리·allOf 병합): 26파일, 415건

벤치마크: `packages/canard/schema-form/bench/*.bench.ts` 7개 파일. 실행 명령은 `package.json`의 `bench`/`bench:baseline`/`bench:compare`/`bench:watch` 스크립트(`vitest bench --config vitest.bench.config.ts`).

## 5. `core/nodes` 의존 방향

`schemaNodeFactory.ts`(오케스트레이터)가 7개 구체 노드 클래스를 모두 import하여 스키마 타입별로 인스턴스화. 구체 노드는 `AbstractNode`만 import해 상속. `AbstractNode.ts`는 구체 노드나 `schemaNodeFactory`를 import하지 않음. `core/parsers`는 `types`만 참조하고 노드를 참조하지 않으며, 구체 노드(터미널 전략)가 반대로 `parsers`를 가져다 씀. 샘플링한 모든 간선에서 순환 없음 — 방향은 `parsers`/`AbstractNode` → (구체 노드) → `schemaNodeFactory`로 단방향.

## 6. 검증기 플러그인 계약

인터페이스: `ValidatorPlugin`, 위치 `packages/canard/schema-form/src/app/plugin/type.ts:240`.
```
interface ValidatorPlugin {
  bind?: Fn<[instance: any]>;   // 선택, 코어는 호출 안 함 — 등록 전 커스텀 인스턴스 주입용
  compile: ValidatorFactory;    // 필수, 스키마별 검증기 생성
}
```
ajv 플러그인 구현 위치: `schema-form-ajv8-plugin/src/default/validatorPlugin.ts`(+ `/2019`, `/2020` 서브패스 각각 동일 구조), 공통 로직은 `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts`. ajv6/ajv7 플러그인도 각자 동일한 `validatorPlugin.ts` 패턴.

## 7. computed/`&`식 파싱·평가 파일

- 파싱(표현식 → 조합): `helpers/dynamicExpression/`(79줄, 4파일) — `convertExpression.ts`(51줄), `combineConditions.ts`(21줄).
- 평가·실행(런타임 계산 속성 관리): `core/nodes/AbstractNode/utils/getComputedPropertiesManager/`(30파일) — 핵심은 `ComputedPropertiesManager/ComputedPropertiesManager.ts`, 하위 `utils/createDynamicFunction/`(동적 함수 생성), `getConditionIndexFactory/`(조건 인덱싱), `getDerivedValueFactory/`, `getObservedValuesFactory/`, `getPathManager/`.

## 8. `oneOf`/`anyOf`/`if` 조건 분기 처리 위치

핵심 처리: `core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts`와 그 하위 `utils/`의 `getCompositionKeyInfo`, `getCompositionNodeMapList`(+ 타입 재정의/중첩 조합/null 분기 경고 유틸), `getConditionsMap`, `hasCompositionSchema`, `processValueWithCondition`. 스키마 전처리 단계는 `helpers/jsonSchema/preprocessSchema/utils/processOneOfSchema/processOneOfSchema.ts`. 계산 속성 쪽 조건 인덱싱은 `getConditionIndexFactory`(항목 7)가 별도로 담당.

## 9. `package.json` 필드

- `version`: `0.16.0`
- `exports`: 단일 키 `"."` — 서브패스 export 없음
- `peerDependencies`: `react` `>=18 <20`, `react-dom` `>=18 <20`
- 릴리스 규약 확인: `scripts`에 changesets 관련 항목 없음, `version:major`/`version:minor`/`version:patch`가 `yarn version <bump>` 호출 — 저장소 루트 CLAUDE.md의 "changesets 미사용, `package.json` version bump가 유일한 기록" 규약과 일치.

## 10. DETAIL/INTENT 문서 존재 및 경계 요약

전부 존재:
- `src/INTENT.md`: 소스 루트 전체 목적(노드 시스템·플러그인·렌더링·타입 통합) 선언, barrel export는 `index.ts`로만, 내부 필드 `__name__` 네이밍 등 컨벤션 명시.
- `src/DETAIL.md`: `index.ts`가 유일한 공개 표면이며 소비자는 하위 모듈을 직접 참조하지 않는다는 계약, 스키마 `options`가 공개 계약이라는 점을 명시.
- `src/core/INTENT.md`: `core`는 "JSON Schema를 노드 트리로 변환하고 상태를 관리하는 핵심 엔진"이라는 목적, `nodeFromJSONSchema()` 팩토리가 경계.
- `src/core/DETAIL.md`: `core/index.ts`가 이 fractal의 공개 표면, 모든 노드가 `value`/`normalizedValue` 두 채널로 값을 노출해야 한다는 계약 명시.

**미수집**: ajv6/ajv7 플러그인의 `validatorPlugin.ts` 세부 시그니처 차이는 파일 존재만 확인. 항목 5의 순환 검사는 주요 간선만 샘플링.
