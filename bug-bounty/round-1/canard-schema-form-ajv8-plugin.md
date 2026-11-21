# @canard/schema-form-ajv8-plugin 버그 바운티 결과

확인된 버그는 5건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 1번과 2번은 같은 조건(루트 스키마의 `$id`)에서 시작하므로 함께 고치는 편이 자연스럽습니다. 3번과 4번은 AJV6, AJV7 플러그인에도 같은 문제가 있습니다.

재현 테스트 (모두 [`probes/canard-schema-form-ajv8-plugin/`](probes/canard-schema-form-ajv8-plugin/) 아래):

- `rootIdSchemaPath.test.ts`, `schemaPath.test.ts`, `conversion.test.ts` (일부 파일에는 통과하는 대조 테스트도 들어 있습니다)
- schema-form 화면에서 증상을 재현하는 테스트는 [`probes/canard-schema-form/rootIdUnionBranch.test.tsx`](probes/canard-schema-form/rootIdUnionBranch.test.tsx)와 [`probes/canard-schema-form/rootIdNotRouting.test.tsx`](probes/canard-schema-form/rootIdNotRouting.test.tsx)입니다.

원인 파일 위치: `packages/canard/schema-form-ajv8-plugin/src/validator/`

계약 문서 위치: `packages/canard/schema-form/src/core/engine/validation/types/issue.ts`, `packages/canard/schema-form/src/core/engine/validation/DETAIL.md`

## 1. 루트 스키마에 `$id`가 있으면 모든 issue의 `schemaPath`가 플러그인 내부 URI가 되어, 폼의 비활성 분기 오류 숨김이 꺼집니다

- 심각도: 높음. 루트 스키마에 `$id`를 두는 것은 흔합니다. 그러면 AJV8의 모든 진입점(기본, 2019, 2020)에서 비활성 `oneOf`/`anyOf` 분기의 오류가 필드에 표시됩니다.
- 영향받는 공개 API: 세 AJV8 진입점의 `plugin.validator.compile`, `ValidationIssue.schemaPath`, `FormHandle.getErrors()`, `useFieldErrors`, `node.errors`.
- 어긋난 계약:
  - `issue.ts:11`은 `ValidationIssue.schemaPath`를 "가능하면 URI 조각을 쓰는, 작성된 스키마 위치"로 정의합니다.
  - `.changeset/schema-form-array-union-errors.md`는 비활성 분기 오류가 배열 항목 필드에 나타나지 않는다고 적고 있습니다. 대응하는 내부 계약은 `DETAIL.md:173`의 validation-route 절입니다.
  - AJV7과 AJV6 플러그인은 같은 스키마에 `#/...`를 반환합니다. 대조 테스트로 확인했습니다.
- 원인:
  - `createValidatorFactory.ts:19`부터 23행은 `$id`가 있는 루트를 `{ $async: true, $ref: registration.key }` 래퍼(`https://canard.invalid/ajv8/root/N`)로 컴파일합니다.
  - 그러면 AJV8은 각 오류의 `schemaPath`를 참조된 자원 기준으로 보고합니다. 예를 들어 `#` 없이 `https://canard.invalid/ajv8/root/1/properties/a/type`이 됩니다.
  - `utils/transformErrors.ts:22`가 이 경로를 그대로 넘기고, 코어의 `normalizeValidationIssue`는 이를 다시 쓸 수 없습니다. 그래서 `resolveUnionBranchAttribution`이 청사진 조각과 맞추지 못해 null을 반환하고, 오류가 비활성 분기 오류로 취급되지 않습니다.
  - AJV7은 `ajv.getSchema(key)`를 직접 호출하므로 이 문제가 없습니다.
- 재현:
  - `rootIdSchemaPath.test.ts`의 테스트 "%s entry reports authored fragment schema paths for a root with $id"가 세 진입점 모두에서 실패합니다. 실제 `https://canard.invalid/ajv8/root/N/not`, 기대 `#/not`.
  - `rootIdUnionBranch.test.tsx`(schema-form render 프로젝트, 공개 `Form`과 배포된 플러그인 사용)의 "with root $id" 사례가 실패합니다. 필드에 `minLength|maxLength`가 표시되는데, 기대값은 `minLength`입니다. "without $id" 대조 사례는 통과합니다.
- 확신도: 높음.

## 2. 루트에 `$id`가 있을 때 `not` 오류가 루트의 `required` 목록에서 지어낸 `rejectedKey`를 받아, 필드의 오류가 부모로 옮겨집니다

- 심각도: 높음. 스키마 `{ $id, required: ['code'], properties: { code: { type: 'string', not: { const: 'admin' } } } }`에서 `not` 오류가 `code` 필드에서 사라지고 루트 객체에 표시됩니다.
- 영향받는 공개 API: `ValidationIssue.rejectedKey`, `node.errors`, `useFieldErrors`.
- 어긋난 계약:
  - `DETAIL.md:115`의 FRAGMENT-020: 플러그인은 거부된 키를 식별할 수 있을 때만 `rejectedKey`를 제공합니다.
  - `DETAIL.md:111`의 VALIDATE-051: `rejectedKey`가 있는 issue는 말단 노드에서 가장 가까운 가지 조상으로 올라갑니다.
  - `issue.ts:13`은 `rejectedKey`를 "거부된 속성 키"로 정의합니다.
- 원인:
  - `utils/getRejectedKey.ts:12`와 13행의 `schemaAtPath`가 `path.slice(path.indexOf('#') + 1)`을 씁니다. 경로에 `#`가 없으면(1번의 경우, 또는 `urn:item/not`처럼 중첩 `$id` 자원으로 들어가는 `$ref`의 경우) 결과가 `/`로 시작하지 않아 함수가 루트를 반환합니다.
  - 그러면 `getRejectedKey`가 루트의 `required`를 읽고, 항목이 정확히 하나면 그 이름을 모든 `not` issue의 `rejectedKey`로 씁니다. `required`와 무관한 `not: { const }`에도 그렇습니다.
  - 이어서 라우팅 코드가 그 issue를 말단 필드에서 올려 보냅니다.
- 재현:
  - `rootIdNotRouting.test.tsx`의 "with root $id" 사례: 실제 `{ field: [], root: ['not'] }`, 기대 `{ field: ['not'], root: [] }`. issue에 `rejectedKey: 'code'`가 붙어 있습니다. "without $id" 대조 사례는 통과합니다.
  - `schemaPath.test.ts`의 테스트 "does not fabricate a rejected key from the root required list for a not-required inside a nested $id resource": 중첩 `$id` 자원에서 `rejectedKey`가 `'banned'`가 아닌 `'name'`(루트의 `required`)입니다.
  - 같은 파일의 테스트 "reports the rejected key for a root-level not-required in a root with $id": `rejectedKey`가 없습니다. 기대값은 `'banned'`입니다.
- 확신도: 높음.

## 3. 값 수준의 `false` 스키마를 거부된 키로 취급해 오류를 부모로 보냅니다

- 심각도: 중간. 하나의 실패가 두 노드로 갈라지고, 주된 오류가 필드를 떠납니다.
- 예: `properties.name = { type: 'string', if: { const: 'admin' }, then: false }`에서 `false schema` issue는 `dataPath ''`와 `rejectedKey 'name'`을 받고, 짝이 되는 `if` issue는 `/name`에 남습니다.
- 영향받는 공개 API: `compile`, `node.errors`.
- 어긋난 계약: `issue.ts:5`는 `dataPath`를 거부된 값의 위치로, `issue.ts:13`은 `rejectedKey`를 거부된 속성 키로 정의합니다. FRAGMENT-020(`DETAIL.md:115`)도 적용됩니다. 이 경우 거부된 키는 없습니다.
- 원인: `utils/getRejectedKey.ts:36`, 37행과 `utils/transformDataPath.ts:12`, 13행이 `instancePath`만 보고 판단하며, `schemaPath`가 속성 위치 스키마에서 끝나는지 확인하지 않습니다.
- 재현: `conversion.test.ts`의 테스트 "keeps a value-level false schema (then: false) on the value instead of rejecting its key". 실제 `dataPath`는 `''`, 기대 `/name`.
- 확신도: 중간에서 높음. 기존 테스트는 아직 올바르게 처리되는 `properties: { forbidden: false }`만 고정하고 있습니다.

## 4. URI 인코딩이 필요한 이름(한글, 공백, `%`)을 가진 속성 아래의 단일 키 `not.required`가 `rejectedKey`를 잃습니다

- 심각도: 낮음에서 중간. AJV는 `schemaPath` 조각을 퍼센트 인코딩합니다(예: `#/properties/%EC%9D%B4%EB%A6%84%20a/not`). 플러그인은 디코딩 없이 스키마를 찾으므로 조회가 빗나갑니다. 결과적으로 말단 객체 호스트의 오류 라우팅이 속성 이름의 철자에 따라 달라집니다.
- 어긋난 계약: FRAGMENT-020(`DETAIL.md:115`).
- 원인: `utils/getRejectedKey.ts:12`부터 17행. 코어는 이미 `parseStandardPointer.ts:32`에서 퍼센트 이스케이프를 디코딩합니다.
- 재현: `conversion.test.ts`의 테스트 "reports not-required rejected key under a property whose name needs URI encoding". `rejectedKey`가 없고, 기대값은 `'x'`입니다.
- 확신도: 높음.

## 5. `propertyNames` 실패의 안쪽 issue에서 거부된 키를 빠뜨립니다

- 심각도: 낮음. AJV6과 AJV7은 이 키를 유지합니다.
- 예: `propertyNames: { pattern: '^a' }`에 키 `bad`가 있으면, 원본 오류에 `propertyName: 'bad'`가 있는데도 안쪽 `pattern` issue가 `rejectedKey` 없이 반환됩니다. AJV7은 두 issue 모두에 `rejectedKey: 'bad'`를 붙입니다(대조 테스트 통과).
- 어긋난 계약: FRAGMENT-020, 그리고 플러그인 간 동작 일치.
- 원인: `utils/getRejectedKey.ts:29`부터 37행이 `error.propertyName`을 읽지 않습니다. AJV7은 `transformErrors.ts:39`에서, AJV6은 `transformDataPath.ts:35`에서 읽습니다.
- 재현: `conversion.test.ts`의 테스트 "attaches the rejected key to every issue a propertyNames failure produces".
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- `dependencies`와 `dependentRequired` 오류가 빠진 속성이 아닌 호스트 객체에 남는 것은 2019 `datapath.test.ts:129`가 의도로 고정하고 있습니다.
- `~`, `/`, 빈 이름, 따옴표가 든 이름의 `required` 경로는 AJV6, AJV7, AJV8 모두에서 올바르게 이스케이프됩니다.
- 중첩 `$id` 자원 안의 오류는 조각이 아닌 `schemaPath`(`urn:item/oneOf/0/...`)를 받아 분기 필터가 계속 표시합니다. `DETAIL.md:173`의 validation-route 절은 귀속이 불확실한 오류를 숨기지 말라고 하므로 의도된 한계입니다.
