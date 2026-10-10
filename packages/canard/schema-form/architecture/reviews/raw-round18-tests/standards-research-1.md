# 조사 보고: `union` 노드(A)와 채움 시점(B)을 표준·업계 관행과 대조

**결론부터 말씀드리겠습니다.**
- A의 `type` 배열 처리, `null`의 nullable 플래그화, `integer` 접기는 표준과 대부분의 생성기·폼 라이브러리와 맞습니다.
- 가장 큰 이탈은 primitive `anyOf`/`oneOf`를 blueprint 오류로 거부하는 규칙입니다. 이를 기본으로 내는 생성기가 많고 OpenAPI 3.0에서는 그것이 유일한 표현이어서 위험도 가장 큽니다.
- "정확히 한 타입만 받아들일 때 변환" 규칙을 쓰는 구현은 찾지 못했습니다. 변환하는 구현은 모두 선언 순서를 씁니다.
- B는 RHF·Formik·Final Form의 기본값 적용 방식과 같습니다.

저장소 파일은 수정하지 않았습니다. npm tarball은 scratchpad에 풀어 소스만 읽었고 실행하지 않았습니다. 실행해서 확인한 것은 저장소에 이미 설치된 ajv 8.17.1, zod 3.25.76, @sinclair/typebox 0.34.48, @rjsf/utils 6.6.1뿐이며, 표에 "로컬 관찰"로 적었습니다. "도출"은 인용문에서 추론한 내용이고, 원문에 그 문장이 있다는 뜻은 아닙니다.

## Q1. JSON Schema 표준 인터페이스

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| `type` 배열은 문자열이어야 하고 서로 달라야 함 | https://json-schema.org/draft/2020-12/json-schema-validation#section-6.1.1 | "The value of this keyword MUST be either a string or an array. If it is an array, elements of the array MUST be strings and MUST be unique." |
| 배열의 의미(2020-12 문구) | 같은 곳 | "If the value of "type" is an array, then an instance validates successfully if its type matches any of the types indicated by the strings in the array." |
| "any of the sets" 문구는 draft-07과 2019-09에만 있고, 2020-12에서는 위 문장으로 바뀜 | https://json-schema.org/draft-07/json-schema-validation.html , https://json-schema.org/draft/2019-09/json-schema-validation.html | "An instance validates if and only if the instance is in any of the sets listed for this keyword." |
| 메타스키마: 최소 1개, 중복 불가 | https://json-schema.org/draft/2020-12/meta/validation | `"items": { "$ref": "#/$defs/simpleTypes" }, "minItems": 1, "uniqueItems": true` |
| 배열 순서에 의미가 없음(도출) | 위 두 스펙 본문 | 순서를 언급하는 문장이 없습니다. "any of"와 "MUST be unique"를 함께 보면 집합으로 읽는 것이 맞습니다. |
| `integer`의 정의 | §6.1.1 | ""integer" which matches any number with a zero fractional part." |
| 데이터 모델은 정수와 다른 수를 구분하지 않음 | https://json-schema.org/draft/2020-12/json-schema-core#section-4.2.1 | "…"integer" is a reasonable type for a vocabulary to define as a value for a keyword, but the data model makes no distinction between integers and other numbers." |
| OpenAPI의 integer는 표기 기준으로 정의됨 | https://spec.openapis.org/oas/v3.1.0#data-types (3.0.3도 같음) | "Note that integer as a type is also supported and is defined as a JSON number without a fraction or exponent part." |
| OpenAPI 3.0은 `type` 배열을 허용하지 않음 | https://spec.openapis.org/oas/v3.0.3#schema-object | "type - Value MUST be a string. Multiple types via an array are not supported." |
| OpenAPI 3.0에는 null 타입이 없고 `nullable`을 씀 | https://spec.openapis.org/oas/v3.0.3#data-types | "null is not supported as a type (see nullable for an alternative solution)." |
| OpenAPI 3.0 `nullable`의 의미 | https://spec.openapis.org/oas/v3.0.3#schema-object | "A true value adds "null" to the allowed type specified by the type keyword, only if type is explicitly defined within the same Schema Object. Other Schema Object constraints retain their defined behavior, and therefore may disallow the use of null as a value." |
| OpenAPI 3.1은 2020-12의 상위집합이고 의미를 덧붙이지 않음 | https://spec.openapis.org/oas/v3.1.0#schema-object | "This object is a superset of the JSON Schema Specification Draft 2020-12." / "Unless stated otherwise, the property definitions follow those of JSON Schema and do not add any additional semantics." |
| OpenAPI 3.1에서 `nullable`이 제거됨. 3.1.0 본문에서 `nullable`을 검색하면 0건 | https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0 | "…the `type` keyword can now define multiple types for a schema with an array. This is useful new functionality, but has also made nullable redundant. … it was decided to remove nullable entirely instead of deprecate it." |
| `anyOf`의 정의. annotation을 모을 때는 모든 분기를 검사해야 함 | https://json-schema.org/draft/2020-12/json-schema-core#section-10.2.1.2 | "An instance validates successfully against this keyword if it validates successfully against at least one schema… Note that when annotations are being collected, all subschemas MUST be examined…" |
| 스펙은 동치일 때 동치라고 적는데, type과 anyOf 사이에는 그런 문장이 없음 | Validation §6.1.3 | "Use of this keyword is functionally equivalent to an "enum" (Section 6.1.2) with a single value." (2020-12 Validation과 Core에서 "equivalent"를 검색했지만 type과 anyOf를 잇는 문장은 없었습니다.) |
| 스펙이 아닌 업계 쪽 진술(zod 소스 주석) | https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/to-json-schema.ts | "…which every JSON Schema draft treats as equivalent… `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there." |

**동치 여부:** 분기가 타입만 가진 경우 `type: [a,b]`와 `anyOf: [{type:a},{type:b}]`는 정의상 같은 검증 결과를 냅니다(도출). 다만 스펙이 동치라고 선언하지는 않았고, annotation 수집과 오류 위치는 서로 다릅니다. `oneOf`로 바꾸면 integer와 number가 겹치므로 동치가 깨집니다.

## Q2. 생성기의 `number | string` 출력

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| TypeBox 0.34.48: 항상 `anyOf` | https://github.com/sinclairzx81/typebox-legacy/blob/main/readme.md , /Users/Vincent/Workspace/albatrion/node_modules/@sinclair/typebox/build/cjs/type/union/union-create.js | README 표: `Type.Union([ Type.String(), Type.Number() ])` → `{ anyOf: [{ type: 'string' }, { type: 'number' }] }` / `CreateType({ [index_1.Kind]: 'Union', anyOf: T }, options)` / 로컬 관찰: `{"anyOf":[{"type":"number"},{"type":"string"}]}` |
| TypeBox 1.3.34(`typebox` 패키지): 항상 `anyOf` | https://github.com/sinclairzx81/typebox/blob/main/src/type/types/union.ts | `return Memory.Create({ '~kind': 'Union' }, { anyOf }, options);` |
| zod-to-json-schema 3.25.2(기본 target `jsonSchema7`): 제약 없는 원시 유니언만 `type` 배열로 합치고, 나머지와 openApi3 target은 `anyOf` | https://github.com/StefanTerdell/zod-to-json-schema/blob/master/src/parsers/union.ts | "all types in union are primitive and lack checks, so might as well squash into {type: [...]}" / `if (refs.target === "openApi3") return asAnyOf(def, refs);` |
| zod-to-json-schema는 유지보수 중단 | 같은 repo README | "As of November 2025, this project will no longer be actively maintained." |
| zod 4.0–4.4.x와 zod 3.25.x의 `zod/v4`: `anyOf` | /Users/Vincent/Workspace/albatrion/node_modules/zod/v4/core/to-json-schema.js | `json.anyOf = def.options.map(…)` / 로컬 관찰: union은 `{"anyOf":[{"type":"number"},{"type":"string"}]}`, `.nullable()`은 `{"anyOf":[{"type":"string"},{"type":"null"}]}` |
| zod 4.5.0 이상(2026-08-28 배포): 타입만 가진 분기만 `type` 배열로 합치고, 제약·메타데이터·`$ref`가 있거나 target이 openapi-3.0이면 `anyOf` 유지. npm tarball 확인 결과 4.3.6과 4.4.3에는 이 처리가 없고 4.5.0부터 있음 | https://github.com/colinhacks/zod/releases/tag/v4.5.0 , 위 to-json-schema.ts | "feat: compact simple anyOf unions to type array in toJSONSchema (#6339)" / "Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone." / "OpenAPI 3.0 is excluded" |
| zod `z.xor()`와 discriminated union: `oneOf` | https://github.com/colinhacks/zod/blob/main/packages/zod/src/v4/core/json-schema-processors.ts | "Exclusive unions (inclusive === false) use oneOf… This includes both z.xor() and discriminated unions" |
| zod 공식 문서의 nullable 예시 | https://zod.dev/json-schema | `z.nullable(z.string()); // => { type: ["string", "null"] }` / `z.nullable(z.string().min(5)); // => { anyOf: [{ type: "string", minLength: 5 }, { type: "null" }] }` |
| ts-json-schema-generator 2.9.0: string·number·boolean·null 유니언은 `type` 배열. 이 formatter가 일반 유니언 formatter보다 먼저 등록돼 우선 적용됨 | https://github.com/vega/ts-json-schema-generator/blob/next/src/TypeFormatter/PrimitiveUnionTypeFormatter.ts | `type: uniqueArray(type.getTypes().map((item) => this.getPrimitiveType(item))),` |
| typescript-json-schema 0.68.0: 단순 타입은 `type` 배열. 현재 사실상 유지보수 모드 | https://github.com/YousefED/typescript-json-schema/blob/master/typescript-json-schema.ts | `schemas.push({ type: simpleTypes.length === 1 ? simpleTypes[0] : simpleTypes });` / README: "more or less in maintenance mode" |
| pydantic v2: 기본값이 `anyOf` | https://github.com/pydantic/pydantic/blob/main/pydantic/json_schema.py , https://docs.pydantic.dev/latest/api/json_schema/ | `union_format: Literal['any_of', 'primitive_type_array'] = 'any_of',` / "`'any_of'`: Use the `anyOf` keyword to combine schemas (the default)." |
| pydantic 2.12.0부터 `type` 배열을 선택할 수 있으나, 분기에 제약이나 메타데이터가 있으면 다시 `anyOf` | 위 소스, https://github.com/pydantic/pydantic/blob/main/HISTORY.md (v2.12.0) | "…or contains constraints/metadata, falls back to `any_of`." / "Add `union_format` parameter to JSON Schema generation" |
| pydantic 문서 예시: Optional도 `anyOf` | https://docs.pydantic.dev/latest/concepts/json_schema/ | `size: Union[float, None] = None` → `"anyOf": [ { "type": "number" }, { "type": "null" } ]` |

다음 셋은 소스와 문서로만 판단했고 실행해서 확인하지는 않았습니다.
- pydantic `Union[int, str]`의 출력(로컬에 pydantic이 없습니다)
- zod 4.5 이상의 실제 출력
- ts-json-schema-generator와 typescript-json-schema의 출력

## Q3. 다중 `type`을 다루는 검증기

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| ajv(coerce 끔): 배열은 허용 타입 목록일 뿐 | https://ajv.js.org/json-schema.html#type | "Its value can be a string (the allowed type) or an array of strings (multiple allowed types)." / "schema: {type: ["number", "string"]} valid: 1, 1.5, "abc", "1" invalid: [], {}, null, true" |
| ajv strictTypes: null을 뺀 다중 타입을 금지하고 `anyOf`를 권장. 기본값 `"log"`에서는 경고만 냄 | https://ajv.js.org/strict-mode.html#union-types , https://ajv.js.org/options.html | "With strictTypes option "type" keywords with multiple types (other than with "null") are prohibited." / "Unions can still be defined with anyOf keyword." / ""log" (default) - log warning…" |
| ajv coerceTypes의 다중 타입 규칙: 선언 순서대로 시도 | https://ajv.js.org/coercion.html | "Type coercion only happens if there is type keyword and if without coercion the validation would have failed." / "If there are multiple types allowed in type keyword the coercion will only happen if none of the types match the data and some of the scalar types are present… the validating function will try coercing the data to each type in order until some of them succeeds." |
| ajv 소스도 선언 순서를 그대로 따름 | https://github.com/ajv-validator/ajv/blob/master/lib/compile/validate/dataType.ts | `types.filter((t) => COERCIBLE.has(t) \|\| …)` / `for (const t of coerceTo) {` |
| ajv 변환표 가운데 설계 표에 없는 항목 | https://ajv.js.org/coercion.html | "null coerces to the empty string." / "null coerces to 0" / "null coerces to false" / "true -> 1 false -> 0" / "Empty string is coerced to null" / "Coercion to integer is possible if the string is a valid number without fractional part (data % 1 === 0)." |
| 로컬 관찰(ajv 8.17.1, `coerceTypes: true`): 순서에 따라 결과가 바뀜 | /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/node_modules/ajv | `["number","string"]`: `true→1`, `null→0` / `["string","number"]`: `true→"true"`, `null→""` |
| @cfworker/json-schema 4.1.1: 소속 여부만 검사하고 변환하지 않음. 패키지 전체에 "coerc"가 0건 | https://github.com/cfworker/cfworker/blob/main/packages/json-schema/src/validate.ts | `if ( instanceType === $type[i] \|\| ($type[i] === 'integer' && instanceType === 'number' && instance % 1 === 0 && …) ) { valid = true; break; }` |
| @hyperjump/json-schema 1.17.8: 소속 여부만 검사. 패키지 전체에 "coerc"가 0건. @exodus/schemasafe 1.3.0도 0건 | https://github.com/hyperjump-io/json-schema/blob/main/lib/keywords/type.js | `: type.some(isTypeOf(instance));` |
| TypeBox `Value.Convert`: 이미 맞는 분기가 있으면 그대로 두고, 없으면 anyOf 순서로 시도해 처음 통과한 값을 씀 | https://github.com/sinclairzx81/typebox-legacy/blob/main/src/value/convert/convert.ts | "// Check if original value already matches one of the union variants" / "// Attempt conversion for each variant" / 로컬 관찰: `Union[Number,String]`에서 `true→1`, `Union[String,Number]`에서 `true→"true"` |

## Q4. 다중 `type`을 받은 폼 라이브러리의 선택 규칙

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| rjsf 문서: null과의 쌍(nullable)만 지원한다고 명시. 문서화된 규칙은 이것뿐 | https://rjsf-team.github.io/react-jsonschema-form/docs/json-schema/single#nullable-types | "…react-jsonschema-form only supports a restricted subset of this -- nullable types, in which an element is either a given type or equal to null." |
| rjsf `getSchemaType`: `[X,null]`이면 X, 그 밖에는 `type[0]`. 주석에는 null 쌍만 적혀 있음 | https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/getSchemaType.ts | "- type is an array with a length of 2 and one type is 'null': Returns the other type" / `… } else { type = type[0]; }` / 로컬 관찰(6.6.1): `["number","string"]→"number"`, `["string","number"]→"string"`, `["null","string","number"]→"null"` |
| rjsf 필드 선택: 첫 타입을 쓰고, integer와 number는 모두 NumberField. anyOf/oneOf는 MultiSchemaField가 처리 | /Users/Vincent/Workspace/albatrion/node_modules/@rjsf/core/lib/components/fields/SchemaField.js (upstream SchemaField.tsx) | `const type = Array.isArray(schemaType) ? schemaType[0] : schemaType \|\| '';` / `integer: 'NumberField', number: 'NumberField',` / "let the MultiSchemaField component handle the form display" |
| rjsf v7: 켜야 동작하는 타입 선택기 추가. PR #5323이 2026-09-24 병합됐고, 릴리스 포함 여부는 확인하지 못함 | https://github.com/rjsf-team/react-jsonschema-form/pull/5323 | "…the first type in that list was the only one reachable" / "With `useFallbackUiForUnsupportedType` on, `SchemaField` now routes both to `FallbackField`, whose selector offers exactly the types the schema allows" / "with the prop off the first type still wins" |
| JSON Forms: `type` 배열은 나열된 모든 타입의 tester에 걸림 | https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/util/util.ts | `if (Array.isArray(jsonSchema.type)) { return jsonSchema.type; }` / `return includes(deriveTypes(jsonSchema), expected);` |
| JSON Forms: 우선순위가 가장 높은 렌더러가 선택됨. 문자열 1, 숫자·정수·불리언 2 | https://jsonforms.io/docs/tutorial/custom-renderers , material-renderers 3.8.0 `src/controls/*` | "The returned number is the priority which expresses if and how well a renderer can actually render the given UI Schema Element" / `rankWith( 1, isStringControl )` / `rankWith( 2, isNumberControl )` |
| JSON Forms 동점 처리: 먼저 등록된 렌더러가 이김(도출, 문서화된 규칙 아님) | https://github.com/eclipsesource/jsonforms/blob/master/packages/react/src/JsonForms.tsx , lodash `_baseGt.js` | `maxBy(props.renderers, (r) => r.tester(…))` / `return value > other;` |
| JSON Forms UI 생성기: null을 빼고 보며, 그래도 여럿이면 단일 Control 하나 | https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/generators/uischema.ts | "If the schema declares multiple types alongside 'null' (e.g. ['null', 'object']), treat it as a nullable instance of the non-null type for UI generation purposes." |
| JSON Forms anyOf: 탭 렌더러(우선순위 3). 데이터를 통과시키는 첫 분기가 초기 탭 | 같은 repo `MaterialAnyOfRenderer.tsx`, `mappers/renderer.ts` | `rankWith( 3, isAnyOfControl )` / `indexOfFittingSchema = i; break;` |
| ngx-formly 8.0.0(세 번째 사례): null 쌍이면 null을 뒤로 보내고, 필드 타입과 자체 타입 검증 모두 `types[0]`. anyOf/oneOf는 `multischema` 필드로 선택하게 함 | https://github.com/ngx-formly/ngx-formly/blob/main/src/core/json-schema/src/formly-json-schema.service.ts | `return type.sort((t1) => (t1 == 'null' ? 1 : -1));` / `type: types[0],` / `switch (types[0])` / `type: 'multischema',` |
| (참고) uniforms 4.0.0: 결합자에서는 타입을 가진 첫 분기의 타입을 씀 | https://github.com/vazco/uniforms/blob/master/packages/uniforms-bridge-json-schema/src/JSONSchemaBridge.ts | `if (!definitionCache.type && partial.type) { definitionCache.type = partial.type; }` |

## Q5. 폼 라이브러리의 기본값 적용 시점

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| RHF: defaultValues는 캐시되고, 다시 적용하려면 reset을 써야 함 | https://react-hook-form.com/docs/useform | "defaultValues are cached. To reset them, use the reset API." |
| RHF setValue: 값만 설정하며 undefined는 넘길 수 없음 | https://react-hook-form.com/docs/useform/setvalue | "The value for the field. This argument is required and cannot be undefined." |
| RHF reset: 값을 넘기면 그 값이 새 defaultValues가 됨 | https://react-hook-form.com/docs/useform/reset | "Calling reset with values updates the form's defaultValues unless options.keepDefaultValues is set." |
| RHF resetField: 해당 필드의 defaultValue로 되돌림 | https://react-hook-form.com/docs/useform/resetfield | "When this value is not provided, field will be revert back to it's defaultValue." |
| RHF 소스: 필드를 등록할 때 값이 undefined면 defaultValues로 채움. setValue 쪽 코드는 defaultValues를 읽지 않음(로컬 dist 7.76.1의 `_setValue`에 참조 없음, 도출) | https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/createFormControl.ts | `isUndefined(value) ? get(_defaultValues, name) : value,` |
| Formik: initialValues와 setFieldValue. setFieldValue는 값만 설정 | https://formik.org/docs/api/formik , https://github.com/jaredpalmer/formik/blob/main/packages/formik/src/Formik.tsx | "Set the value of a field imperatively." / `values: setIn(state.values, msg.payload.field, msg.payload.value),` |
| Formik resetForm: 인자가 없으면 처음 상태로, 있으면 그 값이 새 초기 상태 | https://formik.org/docs/api/formik | "If nextState is omitted, then Formik will reset state to the original initial state." / "If nextState is specified, Formik will set nextState.values as the new "initial state"…" |
| Formik enableReinitialize | 같은 곳 | "Default is false. Control whether Formik should reset the form if initialValues changes (using deep equality)." |
| Final Form: initialValues와 change. change는 값만 바꿈 | https://github.com/final-form/final-form/blob/main/docs/types/Config.md , https://github.com/final-form/final-form/blob/main/docs/types/FormApi.md | "The initial values of your form. These will also be used to compare against the current values to calculate `pristine` and `dirty`." / "Changes the value of the given field." |
| Final Form reset | FormApi.md | "Resets the values back to the initial values the form was initialized with. Or empties all the values if the form was not initialized. If you provide `initialValues` they will be used as the new initial values." |
| Final Form 필드 defaultValue: 필드를 만들 때만 적용. 5.0.1에서 defaultValue를 쓰는 곳은 필드 등록 한 곳뿐이라 reset이 필드 defaultValue를 다시 넣지 않음(도출) | https://github.com/final-form/final-form/blob/main/docs/types/FieldConfig.md , https://github.com/final-form/final-form/blob/main/src/FinalForm.ts | "The value of the field upon creation only if both the field's `initialValue` is `undefined` and the value from the form's `initialValues` is also `undefined`." / "// only use defaultValue if we don't yet have any value for this field" |

## 설계에 대한 함의

### 표준·관행과 맞는 부분
- **A, `type` 배열을 하나의 leaf로:** 스펙의 집합 의미("any of", 중복 불가)와 맞습니다. ts-json-schema-generator, typescript-json-schema, zod-to-json-schema(기본), zod 4.5 이상(타입만 가진 분기), pydantic의 `primitive_type_array`가 내는 모양과도 같습니다.
- **A, `null`을 nullable 플래그로:** 다음 사례들과 같은 방향입니다.
  - OpenAPI 3.0 `nullable`, 그리고 3.1 이관 지침
  - ajv strictTypes가 null 쌍만 허용하는 점
  - rjsf가 "nullable types"만 지원하는 점
  - JSON Forms UI 생성기, formly(null을 뒤로 보냄)
- **A, `integer`를 number kind로 접기:** Core 데이터 모델 및 rjsf(integer와 number 모두 NumberField)와 맞습니다. 정수 여부 검사는 검증기에 남습니다.
- **A, 선언 순서를 쓰지 않음:** 스펙에 순서 의미가 없는 것과 맞습니다.
- **B, 노드 생성 시에만 채우고 `setValue`는 load가 아님:** RHF, Formik, Final Form과 구조가 같습니다. 세 라이브러리 모두 초기화·필드 등록·reset 계열에서만 기본값을 넣고, setter는 기본값을 읽지 않습니다. 따라서 `setValue(getValue())`가 멱등이라는 점도 관행과 맞습니다.

### 표준·관행과 다른 부분
- **A, primitive `anyOf`/`oneOf`를 오류로 처리:**
  - 스펙상 타입만 가진 anyOf는 `type` 배열과 같은 검증 결과를 냅니다(도출).
  - OpenAPI 3.0에서는 `type` 배열이 금지되어 anyOf/oneOf가 유일한 표현입니다.
  - ajv는 오히려 anyOf를 권장합니다.
  - rjsf, JSON Forms, formly는 이를 사용자가 고르는 변형으로 렌더링하며, 오류로 막는 곳은 없습니다.
- **A, "정확히 한 타입만 받아들일 때 변환" 규칙:** 같은 규칙을 가진 구현을 찾지 못했습니다. ajv와 TypeBox는 선언 순서에서 처음 성공한 변환을 쓰고, rjsf와 formly는 `type[0]`, JSON Forms는 우선순위 다음 등록 순서를 씁니다. 그래서 같은 입력에도 결과가 다릅니다. 예를 들어 `["number","string"]`에 다음 값이 들어오면 이렇게 갈립니다.

  | 입력 | 설계 A | ajv (`coerceTypes` 켬) |
  |---|---|---|
  | `true` | `"true"` (설계 표로 도출) | `1` |
  | `null` | 변환하지 않음 | `0` |
- **A, 변환표:** ajv에는 있고 설계에는 없는 항목이 있습니다. boolean→number, null→`""`/0/false, `""`/0/false→null입니다. 또 ajv는 소수부가 0일 때만 integer로 변환합니다.
- **A, primitive와 object/array를 섞으면 오류:** 스펙은 이를 허용하므로 설계가 더 좁습니다. 다만 ajv strictTypes도 같은 쪽을 막고 있어 방향은 같습니다.
- **B, `setValue(undefined)`:** RHF는 undefined를 넘길 수 없게 하므로, 이를 "비우기"로 받는 설계 B의 계약이 더 넓습니다.
- **B, `reset()`의 기본값 재적용:** Final Form의 `reset()`은 필드 defaultValue를 다시 넣지 않는데(도출), 설계 B는 다시 채웁니다. 이 점에서는 RHF의 `reset()`에 가깝습니다.

### 구체적 위험
1. **anyOf를 기본으로 내는 생성기가 흔하고, 이 스키마들은 모두 blueprint 오류가 됩니다.**
   - 항상 `anyOf`인 경우
     - TypeBox 0.34와 1.x
     - pydantic 기본값(`Optional[X]` 포함)
     - zod 4.0–4.4, 그리고 zod 3.25.x의 `zod/v4`
     - OpenAPI 3.0을 대상으로 한 모든 출력
   - 조건에 따라 `anyOf`인 경우: zod 4.5 이상과 zod-to-json-schema는 분기에 제약이나 설명(`min`, `format`, `describe` 등)이 하나라도 있으면 anyOf를 유지합니다.
     - 예: 로컬 zod에서 `z.int()`는 `minimum`/`maximum`을 냅니다. 4.5 이상에서는 실행해 보지 않았습니다.
   - `oneOf`인 경우: zod `z.xor()`와 discriminated union입니다.
   - 규모 참고(npm 2026-09-18~24 주간 다운로드이며, 스키마 출력 빈도가 아닙니다): `@sinclair/typebox` 104,967,529, `typebox` 10,689,671, `zod-to-json-schema` 58,044,727입니다. zod 4.x 가운데 4.5 이상은 27.5%(43,336,295)이고, 4.5 미만은 114,364,296, 3.25.x는 92,504,024입니다(https://api.npmjs.org/versions/zod/last-week).
2. **nullable을 anyOf로 쓴 스키마의 처리가 정해져 있지 않습니다.** `anyOf: [{type:X},{type:"null"}]`는 pydantic, zod, TypeBox가 nullable을 표현하는 기본 형태입니다. brief는 anyOf 규칙에서 `null`을 하나의 kind로 세는지 정하지 않았습니다.
   - kind로 센다면 가장 흔한 nullable 형태가 오류가 됩니다.
   - 세지 않는다면 같은 데이터 모델이 `type` 배열로는 nullable leaf, anyOf로는 variant host가 되어, 표기법에 따라 노드 종류가 달라집니다.
3. **설계가 권하는 수정("`type` 배열을 쓰세요")이 이 저장소의 ajv8 플러그인과 부딪힙니다.**
   - 기본 설정은 `{ allErrors: true, strictSchema: false, validateFormats: false }`입니다(/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/src/2020/validatorPlugin.ts).
   - ajv는 strictTypes를 `o.strictTypes ?? s ?? "log"`로 정하므로 경고 모드가 됩니다(/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/node_modules/ajv/lib/core.ts 250행).
   - 로컬 실행에서 `strict mode: use allowUnionTypes to allow union type keyword at "#/properties/a" (strictTypes)` 경고가 실제로 찍혔습니다.
4. **분기마다 제약이 다른 스키마는 `type` 배열로 옮기면 구조가 바뀝니다.** 예를 들어 문자열 분기의 `minLength`와 숫자 분기의 `minimum`은 부모로 끌어올려야 합니다. 두 키워드는 각자의 타입에만 적용되므로 의미는 유지됩니다(도출). 하지만 분기별 `title`/`description`은 둘 곳이 없어집니다.
5. **integer를 number kind로 접으면 변환 후 검증이 실패할 수 있습니다.** 변환 가능 여부를 kind 단위로 판정하면, `["integer","boolean"]`에서 `"1.5"`가 1.5로 바뀐 뒤 검증기에서 integer 위반이 됩니다. brief에는 integer에 대한 판정 방식이 없습니다.
6. **기본 입력이 텍스트라서 저장되는 타입이 다른 라이브러리와 달라집니다.** `["number","string"]`에서 텍스트 입력은 항상 문자열을 보내고, 문자열은 허용 목록에 있으므로 `"42"`가 그대로 저장됩니다. 같은 스키마에서 rjsf·formly(첫 타입)와 JSON Forms(우선순위)는 number를 고릅니다.
7. **사용자가 붙인 ajv 인스턴스가 데이터를 바꿀 수 있습니다.** 플러그인은 `bind(customAjv)`로 임의의 ajv 인스턴스를 받습니다.
   - `coerceTypes`가 켜져 있으면 ajv는 데이터를 선언 순서대로 변환합니다.
   - `useDefaults`가 켜져 있으면 ajv가 문서 표현대로 "Replace missing or undefined properties and items with the values from corresponding default keywords"를 합니다.
   - 현재 플러그인은 데이터를 복사하지 않고 `validate(data)`에 그대로 넘깁니다(/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts). 다음 메이저도 복사본을 넘기지 않는다면, A의 "순서 없는 해석"과 B의 "undefined는 다시 채우지 않음"이 깨질 수 있습니다. 다음 메이저 코드는 확인하지 않았습니다.
8. **OpenAPI 3.0의 `nullable: true`가 사라질 수 있습니다.** brief에는 `nullable` 키워드 처리가 없습니다. OpenAPI 3.0 문서는 null을 이 키워드로만 나타내므로(ajv는 기본 지원), 설계가 처리하지 않으면 nullable 정보가 blueprint에서 빠질 수 있습니다.

## 확인하지 못한 것
- pydantic, zod 4.5 이상, ts-json-schema-generator, typescript-json-schema의 실제 실행 출력
- rjsf PR #5323이 릴리스에 포함됐는지 여부
- JSON Forms 동점 처리를 뒷받침하는 공식 문서(찾지 못해 소스와 lodash 구현에서 도출)
- JSON Forms 커뮤니티 스레드와 StackOverflow는 접근이 막혀(403, 크롤러 차단) 인용하지 않았습니다.