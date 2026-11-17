# @canard/schema-form-ajv6-plugin 버그 바운티 결과

확인된 버그는 2건입니다. 두 건 모두 AJV7, AJV8 플러그인에도 같은 문제가 있으며, 원인 위치만 플러그인마다 다릅니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-ajv6-plugin/conversion.test.ts`](probes/canard-schema-form-ajv6-plugin/conversion.test.ts) (통과하는 대조 테스트도 들어 있습니다)

원인 파일: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/transformDataPath.ts`

계약 문서 위치: `packages/canard/schema-form/src/core/engine/validation/types/issue.ts`, `packages/canard/schema-form/src/core/engine/validation/DETAIL.md`

## 1. 값 수준의 `false` 스키마를 거부된 키로 취급해 오류를 부모로 보냅니다

- 심각도: 중간. 하나의 실패가 두 노드로 갈라지고, 주된 오류가 필드를 떠납니다.
- 예: `properties.name = { type: 'string', if: { const: 'admin' }, then: false }`에서 `false schema` issue는 `dataPath ''`와 `rejectedKey 'name'`을 받고, 짝이 되는 `if` issue는 `/name`에 남습니다.
- 영향받는 공개 API: `compile`, `node.errors`.
- 어긋난 계약: `issue.ts:5`는 `dataPath`를 거부된 값의 위치로, `issue.ts:13`은 `rejectedKey`를 거부된 속성 키로 정의합니다. FRAGMENT-020(`DETAIL.md:115`)도 적용됩니다. 이 경우 거부된 키는 없습니다.
- 원인: `transformDataPath.ts:25`부터 30행이 데이터 경로만 보고 판단하며, `schemaPath`가 속성 위치 스키마에서 끝나는지 확인하지 않습니다.
- 재현: 테스트 "keeps a value-level false schema (then: false) on the value instead of rejecting its key". 실제 `dataPath`는 `''`, 기대 `/name`.
- 확신도: 중간에서 높음. 기존 테스트는 아직 올바르게 처리되는 `properties: { forbidden: false }`만 고정하고 있습니다.

## 2. URI 인코딩이 필요한 이름(한글, 공백, `%`)을 가진 속성 아래의 단일 키 `not.required`가 `rejectedKey`를 잃습니다

- 심각도: 낮음에서 중간. AJV는 `schemaPath` 조각을 퍼센트 인코딩합니다(예: `#/properties/%EC%9D%B4%EB%A6%84%20a/not`). 플러그인은 디코딩 없이 스키마를 찾으므로 조회가 빗나갑니다. 결과적으로 말단 객체 호스트의 오류 라우팅이 속성 이름의 철자에 따라 달라집니다.
- 어긋난 계약: FRAGMENT-020(`DETAIL.md:115`).
- 원인: `transformDataPath.ts:37`부터 42행. 코어는 이미 `parseStandardPointer.ts:32`에서 퍼센트 이스케이프를 디코딩합니다.
- 재현: 테스트 "reports not-required rejected key under a property whose name needs URI encoding". `rejectedKey`가 없고, 기대값은 `'x'`입니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `~`, `/`, 빈 이름, 따옴표가 든 이름의 `required` 경로와, 따옴표가 든 부모 아래의 `required`는 올바른 포인터를 만듭니다.
- `propertyNames` 실패의 두 issue 모두에 `rejectedKey`가 붙습니다.
