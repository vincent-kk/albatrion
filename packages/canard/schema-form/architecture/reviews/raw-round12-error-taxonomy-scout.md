# 12라운드 원문 — 오늘 코드의 오류·경고 분류 (스카우트)

2026-09-24. 소유자의 지시("기존 error 종류와 용법을 참고해서 분류하라")로 `src/` 전체를 정적 검색한 결과의 원문이다. 편집자는 고치지 않았다. 새 분류는 원장 `03-mental-model.md` §5의 "오류와 경고의 분류" 표에 있다.

---

## (1) 오류 클래스 표

| 클래스 | 파일:행 | 상속 | code prefix(group) | 필드 | 용도 |
|---|---|---|---|---|---|
| `BaseError`(abstract) | `packages/winglet/common-utils/src/errors/BaseError.ts:5` | `Error` | - | `group`, `specific`, `code`(=`${group}.${specific}`), `message`, `details`, `toJSON()` | 모든 도메인 오류의 공통 부모 |
| `JSONSchemaError` | `packages/canard/schema-form/src/errors/JSONSchemaError.ts:24` | `BaseError` | `JSON_SCHEMA_ERROR` | 위와 동일 | 스키마 트리 빌드(노드 생성/합성/virtual/computed) 중 구조적 문제 |
| `SchemaFormError` | `errors/SchemaFormError.ts:17` | `BaseError` | `SCHEMA_FORM_ERROR` | 위와 동일 | 폼 구성(이벤트 캐스케이드, FormTypeInputMap 매핑) 중 문제 |
| `ValidationError` | `errors/ValidationError.ts:19` | `BaseError` | `VALIDATION_ERROR` | 위와 동일 | 폼 제출(onSubmit) 시 스키마 검증 실패 — AJV 등 validator의 노드별 errors와는 별개 |
| `UnhandledError` | `errors/UnhandledError.ts:17` | `BaseError` | `UNHANDLED_ERROR` | 위와 동일 | 분류되지 않은 예외 래핑(현재 플러그인 등록 실패 1곳) |

각 클래스는 `is*Error()` 타입가드(예: `isJSONSchemaError`)를 `errors/index.ts:1-4`에서 함께 export. 규약은 `errors/INTENT.md`에 명시(`BaseError` 상속 필수, `details`에 민감정보 금지 등).

## (2) 오류 코드·throw 지점 표

| 코드 | 파일:행 | 언제 | 누구 잘못 | 드러남 | 뜻 |
|---|---|---|---|---|---|
| `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA` | `core/nodes/schemaNodeFactory.ts:116` | 빌드(노드 생성) | 작성자 스키마 | throw | 지원하지 않는 `type` |
| `JSON_SCHEMA_ERROR.COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION` | `core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:81` | 빌드(oneOf/anyOf) | 작성자 스키마 | throw | 합성 분기 간 프로퍼티 배타성 재정의 충돌 |
| `JSON_SCHEMA_ERROR.COMPOSITION_PROPERTY_REDEFINITION` | 같은 파일:96 | 빌드 | 작성자 스키마 | throw | 합성 분기 간 동일 프로퍼티 재정의 |
| `JSON_SCHEMA_ERROR.COMPOSITION_TYPE_REDEFINITION` | `.../utils/throwIfTypeRedefinition.ts:29` | 빌드 | 작성자 스키마 | throw | 합성 분기 간 `type` 재정의 |
| `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID` | `.../getVirtualReferencesMap/getVirtualReferencesMap.ts:41` | 빌드(virtual 구성) | 작성자 스키마 | throw | virtual 필드 값 형식 오류 |
| `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_IN_PROPERTIES` | 같은 파일:55 | 빌드 | 작성자 스키마 | throw | virtual이 참조하는 필드가 `properties`에 없음 |
| `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` | `core/nodes/VirtualNode/VirtualNode.ts:46` | 런타임(값 동기화) | 라이브러리/호출자 경계 | throw | virtual 참조 개수와 값 배열 길이 불일치 |
| `JSON_SCHEMA_ERROR.INJECT_TO` | `core/nodes/AbstractNode/AbstractNode.ts:1012` | 런타임(노드 값 주입) | 호출자 API 오용 | throw | `injectTo` 잘못된 사용 |
| `JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION` | `.../createDynamicFunction/createDynamicFunction.ts:43` | 빌드(computed 표현식 컴파일) | 작성자 스키마 표현식 | throw | 동적 함수 생성 실패 |
| `JSON_SCHEMA_ERROR.OBSERVED_VALUES` | `.../getObservedValuesFactory/getObservedValuesFactory.ts:58` | 런타임(computed watch 평가) | 작성자 스키마 표현식 | throw | watch 관찰 함수 평가 실패 |
| `JSON_SCHEMA_ERROR.CONDITION_INDICES` | `.../getConditionIndexFactory/getConditionIndicesFactory.ts:76` | 런타임(computed if 배열) | 작성자 스키마 표현식 | throw | 조건 인덱스 배열 평가 실패 |
| `JSON_SCHEMA_ERROR.CONDITION_INDEX` | `.../getConditionIndexFactory/getConditionIndexFactory.ts:65` | 런타임 | 작성자 스키마 표현식 | throw | 단일 조건 인덱스 평가 실패 |
| `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` | `core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:209` | 런타임 정착(validator 컴파일) | 작성자 스키마(`$ref` 순환) | **throw 안 함** — `console.error`(항상, NODE_ENV 무관) + 폴백 validator를 통해 노드 `errors`(keyword `jsonSchemaCompileFailed`)로 노출 | 순환 참조로 컴파일 실패 |
| `JSON_SCHEMA_ERROR.SCHEMA_COMPILE_FAILED` | 같은 파일:214 | 런타임 정착 | 작성자 스키마 또는 validator 플러그인 | 위와 동일(로그+폴백) | 그 외 모든 컴파일 실패의 공통 코드 |
| `JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA` (4곳 공유) | `core/nodes/ArrayNode/validate.ts:26,40,53,72` | 빌드(ArrayNode 검증) | 작성자 스키마(`items`/`prefixItems`/`minItems`/`maxItems` 모순) | throw | 배열 스키마 형태 모순 — 코드 하나에 4개 세부 사유가 message로만 구분됨 |
| `JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION` | `helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:46` | 빌드(allOf 병합) | 작성자 스키마 | throw | allOf 분기 간 `type` 재정의 |
| `JSON_SCHEMA_ERROR.CONFLICTING_CONST_VALUES` | `.../intersectSchema/utils/intersectConst.ts:24` | 빌드 | 작성자 스키마 | throw | `const` 값 충돌 |
| `JSON_SCHEMA_ERROR.INVALID_RANGE` | `.../intersectSchema/utils/validateRange.ts:22` | 빌드 | 작성자 스키마 | throw | min/max 범위 불가능 |
| `JSON_SCHEMA_ERROR.EMPTY_ENUM_INTERSECTION` | `.../intersectSchema/utils/intersectEnum.ts:36` | 빌드 | 작성자 스키마 | throw | enum 교집합이 공집합 |
| `SCHEMA_FORM_ERROR.INFINITE_LOOP_DETECTED` | `core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:97` | 런타임(이벤트 캐스케이드, 예산 초과) | 불명확(라이브러리 버그 또는 호출자의 순환 의존 설정) | throw | 이벤트 전파가 `MAX_LOOP_COUNT` 초과 |
| `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` | `helpers/formTypeInputDefinition/formTypeInputMap.ts:53` | 빌드(FormTypeInputMap 키 패턴 해석) | 호출자 API 오용 | throw | 키 패턴 매핑 실패 |
| `UNHANDLED_ERROR.REGISTER_PLUGIN` | `app/plugin/registerPlugin.ts:215` | 플러그인 등록 시점 | 호출자/플러그인 작성자 오용 | throw | 플러그인 등록 중 알 수 없는 예외 래핑 |
| `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED` | `components/Form/Form.tsx:119` | 검증(폼 제출 onSubmit) | 사용자 입력 | throw | 제출 시 스키마 검증 실패(AJV validator errors와 별개 경로) |

## (3) 경고 표

모두 `helpers/warning/warnDevelopmentIssue.ts:25` (`process.env.NODE_ENV === 'production'`이면 무시, code+message로 세션 내 중복 억제, `printWarning`으로 출력)를 경유. 코드 상수는 `helpers/warning/warningCode.ts:1-15`.

| 코드 | 파일:행 | 언제 | 누구 잘못 | 드러남 | 뜻 |
|---|---|---|---|---|---|
| `SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE` | `.../getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:34` | 빌드(oneOf/anyOf null 처리) | 작성자 스키마 | 개발 모드 전용 콘솔 경고 | null이 도달 불가능한 합성 분기 |
| `SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM` | `.../utils/warnIfNullBranchIgnored.ts:25` | 빌드 | 작성자 스키마 | 개발 모드 전용 | null 분기가 폼 렌더링에서 무시됨 |
| `SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM` | `.../utils/warnIfNestedComposition.ts:24` | 빌드 | 작성자 스키마 | 개발 모드 전용 | 중첩 합성이 폼에서 무시됨 |
| `SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM` | `helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:201` | 빌드/설정 | 호출자 설정 | 개발 모드 전용 | 가상화 옵션이 비활성화됨 |
| `SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM` | `helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:40` | 빌드(allOf 병합) | 작성자 스키마 | 개발 모드 전용 | allOf 병합 시 특정 키워드 무시 |

그 외 `console.error`는 위 CIRCULAR_REFERENCE/SCHEMA_COMPILE_FAILED 1곳(`ValidationManager.ts:221`)뿐이며, `warnDevelopmentIssue`와 달리 **NODE_ENV 게이팅이 없고 항상 로깅**됩니다. `console.warn` 실사용은 없고(`core/nodes/ObjectNode/filter.ts:46`는 JSDoc 예시 주석일 뿐), 순수 `throw new Error(...)`(BaseError 미경유)는 라이브러리 소스에 없으며 테스트 헬퍼(`__tests__/renderForm.tsx` 등)에만 존재합니다.

## 검증 오류(노드 `errors`) 표현

- 타입: `PublicJSONSchemaError`/`JSONSchemaError` 인터페이스(`types/error.ts:307` 및 그 상위, 약 240행대부터) — 필드는 `dataPath`(RFC6901, `#` 없음), `schemaPath?`(`#` 접두), `keyword?`, `message?`, `details?`, `source?`, `key?`(배열 항목용, 내부 관리).
- 저장/병합: `core/nodes/AbstractNode/utils/ValidationErrorManager/ValidationErrorManager.ts:35`의 `ValidationErrorManager`가 `mergedGlobalErrors`/`mergedLocalErrors`/`externalErrors`로 관리하며 노드의 `errors` getter로 노출.
- 컴파일 실패 시 폴백: `getFallbackValidator.ts:14-26`가 `keyword: 'jsonSchemaCompileFailed'`, `dataPath: '/'`, `source: error`를 담은 배열을 반환해 노드 `errors`로 흘려보냄(위 CIRCULAR_REFERENCE/SCHEMA_COMPILE_FAILED와 짝).

## (4) 오늘 분류의 애매한 점

- **이름 충돌**: 예외로 throw되는 클래스 `JSONSchemaError`(`errors/JSONSchemaError.ts:24`)와, 노드 `errors` 배열 항목 타입인 인터페이스 `JSONSchemaError`(`types/error.ts:307`)가 동일 이름입니다. `ValidationErrorManager.ts:3`은 후자를 `as ValidationError`로 임포트하는데 이는 다시 클래스 `ValidationError`(`errors/ValidationError.ts:19`)와 이름이 겹쳐, 이름만으로는 "throw되는 예외"인지 "검증 결과 항목"인지 구분되지 않습니다.
- `JSON_SCHEMA_ERROR` 클래스는 CIRCULAR_REFERENCE/SCHEMA_COMPILE_FAILED 두 코드에서만 throw되지 않고 생성 후 로그+노드errors로 우회합니다. 나머지 18개 `JSON_SCHEMA_ERROR` 코드는 모두 throw — 같은 클래스가 두 가지 서로 다른 드러남 경로를 가진다는 점이 규칙성이 없어 보일 수 있습니다.
- `INFINITE_LOOP_DETECTED`는 "누구 잘못"이 코드만으로는 라이브러리 설계 한계인지 호출자의 순환 의존 스키마 설정인지 단정하기 어려웠습니다.

**커버 범위**: `packages/canard/schema-form/src` 전체를 `class .*Error`, `new (JSONSchemaError|SchemaFormError|ValidationError|UnhandledError)\(`, `console\.(warn|error)`, `warnDevelopmentIssue`, `throw new Error`, `throw (error|err)\b`로 정적 검색해 전수 확인했습니다. 미검토: `architecture/` 문서(청사진/ADR)와 `__tests__` 내부 assertion 로직, 별도 validator 플러그인 패키지(`@canard/schema-form-ajv*` 등)의 내부 오류 처리는 범위 밖입니다.
