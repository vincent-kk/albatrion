# 후속 조사: 브랜치(object/array) 노드의 다중 타입 처리

## 핵심 요약
- **다중 타입 선택기가 있는가:** 릴리스된 rjsf 6.x와 JSON Forms, ngx-formly는 `type` 배열에 선택기를 두지 않습니다. rjsf와 formly는 첫 타입(null 쌍이면 null이 아닌 타입)을, JSON Forms는 rank가 가장 높은 렌더러를 고릅니다. 받은 값을 해석하거나 변환하지는 않습니다.
- **rjsf의 타입 선택기는 아직 미릴리스입니다.** `type` 배열용 선택기(PR #5323)는 v7 브랜치의 7.0.0 변경사항입니다. npm에 7.x는 아직 없습니다.
- **`oneOf`/`anyOf`는 세 라이브러리 모두 사용자에게 선택기를 보여 줍니다.** 초기 분기는 데이터를 보고 자동으로 고릅니다.
- **분기를 바꾸면 값은 변환되지 않습니다.** 유지되거나(rjsf의 같은 타입 공유 프로퍼티), 지워지거나, 새 분기의 기본값으로 교체됩니다.

**근거 표기**
- **로컬 관찰:** 저장소에 설치된 @rjsf/utils·@rjsf/core 6.6.1, ajv 8.17.1, react·react-dom 19.2.6(@rjsf/core 실행에 필요한 기존 의존성)으로 돌린 결과입니다.
  - 스크립트: /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/a8be555b-9dd3-4b7e-ac18-a45022199e69/scratchpad/rjsf-probe.mjs
  - 검증기는 @rjsf/validator-ajv8 대신 ajv 8.17.1로 `isValid`만 구현한 최소 어댑터를 썼습니다. 따라서 `$ref` 처리 같은 validator-ajv8 고유 동작은 검증하지 않았습니다.
- **JSON Forms 3.8.0, ngx-formly 8.0.0:** scratchpad에 풀어 둔 npm 소스를 읽기만 했고 실행하지 않았습니다.
- 인용할 때 공백과 줄바꿈만 정리했습니다. 저장소 파일은 수정하지 않았습니다.

## 1. rjsf: `object`나 `array`를 포함한 `type` 배열

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| 타입 결정: `[X,'null']`이면 X, 그 밖에는 첫 원소 | /Users/Vincent/Workspace/albatrion/node_modules/@rjsf/utils/lib/getSchemaType.js (upstream `packages/utils/src/getSchemaType.ts`) | `if (type.length === 2 && type.includes('null')) { type = type.find((type) => type !== 'null'); } else { type = type[0]; }` |
| 필드 선택: 첫 타입에 대응하는 컴포넌트 | /Users/Vincent/Workspace/albatrion/node_modules/@rjsf/core/lib/components/fields/SchemaField.js | `const type = Array.isArray(schemaType) ? schemaType[0] : schemaType \|\| '';` / `array: 'ArrayField',` / `object: 'ObjectField',` |
| 로컬 관찰(6.6.1): `['object','array']`, `['object','string']`, `['object','null']`은 ObjectField, `['array','null']`은 ArrayField. 플래그를 켜도 선택기가 나오지 않음 | rjsf-probe.mjs | `type=["object","array"] … flag=true fields=object>object>string fallbackSelector=false` / `type=["array","null"] … fields=object>array>array fallbackSelector=false` |
| 로컬 관찰: 데이터 타입이 달라도 해석하지 않음. `['string','object']`에 객체 값을 넣으면 텍스트 입력에 `[object Object]`가 표시됨 | 같은 곳 | `type=["string","object"] … object data flag=true … inputs=root_v[text]=[object Object]` |
| 로컬 관찰: 값이 없을 때 생성되는 기본값. `['object','null']`도 `{}`로 만듦 | 같은 곳 | `type=["object","null"] getSchemaType="object" defaultFormState(undefined)={}` / `type=["array","null"] getSchemaType="array" defaultFormState(undefined)=[]` |
| 6.x에서 플래그의 적용 범위는 "지원하지 않는 필드"뿐 | …/@rjsf/core/lib/components/Form.d.ts | "Optional flag that, when set to true, will cause the `FallbackField` to render a type selector for unsupported fields instead of the default UnsupportedField error UI." |
| 6.x에서 FallbackField는 대응하는 필드가 없을 때만 쓰임 | SchemaField.js | `return componentName in fields ? fields[componentName] : fields['FallbackField'];` |
| 플래그와 FallbackField는 이미 릴리스됨(6.0.0-beta.23 항목) | https://github.com/rjsf-team/react-jsonschema-form/blob/main/CHANGELOG.md | "Added new `FallbackField` to add opt-in functionality to control form data that is of an unsupported or unknown type" |
| PR #5323은 v7 브랜치(base `rjsf-team:v7`)를 대상으로 하며, `CHANGELOG-v7.md`의 "# 7.0.0" 아래에 기록됨 | https://github.com/rjsf-team/react-jsonschema-form/blob/v7/CHANGELOG-v7.md | "With `useFallbackUiForUnsupportedType` turned on, `SchemaField` now routes both to `FallbackField`, whose type selector offers exactly the types the schema allows … A nullable `['string', 'null']` still renders as the plain `string` field it always has, … and with the prop off the first type still wins, as before." |
| v7에서는 null 쌍을 union으로 보지 않음. 따라서 `['object','null']`과 `['array','null']`은 선택기 대상이 아니고, `['object','array']`와 `['object','string']`은 대상임(도출) | https://github.com/rjsf-team/react-jsonschema-form/blob/v7/packages/utils/src/getUnionTypes.ts | "…its `type` is an array of two or more non-`null` type names. … A schema that allows a single type, with or without `null`, is one `getSchemaType()` resolves to that type, so it is not a union and `undefined` is returned for it." |
| v7에서 타입을 바꾸면 object나 array는 빈 값으로 시작함. 처음 선택되는 타입은 현재 데이터의 타입 | CHANGELOG-v7.md (# 7.0.0) | "an `object` or `array` starts empty rather than keeping a value of the type it replaces" / "It starts on the type the current form data has, `null` included, … and on the schema's own first type when there is no data to match" |
| 미릴리스: npm에 7.x 버전이 없음 | https://registry.npmjs.org/@rjsf/core | `"dist-tags":{"canary":"3.0.1","next":"6.0.0-beta.23","latest":"6.10.1"}` |

## 2. rjsf: 분기가 object나 array인 `oneOf`/`anyOf`

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| 사용자에게 보이는 선택기(기본 `select`)가 렌더링됨. 항목 이름은 옵션의 title, 없으면 "Option N" | …/@rjsf/core/lib/components/fields/MultiSchemaField.js | `const { widget = 'select', placeholder, autofocus, autocomplete, title = schema.title, ...uiOptions } = getUiOptions(uiSchema, globalUiOptions);` / `label: uiTitle \|\| translateString(translateEnum, translateParams.concat(String(index + 1))),` |
| 예외: 옵션이 모두 const이면 이 선택기 대신 일반 select로 렌더링 | SchemaField.js | "If the schema `anyOf` or 'oneOf' can be rendered as a select control, don't render the selection and let `StringField` component handle rendering…" |
| 초기 옵션은 생성 시 데이터로 결정 | MultiSchemaField.js | `selectedOption: this.getMatchingOption(0, formData, retrievedOptions),` |
| 매칭 규칙: 유효한 옵션이 하나면 그것을 고름. 없으면 모든 옵션에 점수를 매겨 최고점을 고르고, 점수가 모두 같으면 현재 선택을 유지 | …/@rjsf/utils/lib/schema/getClosestMatchingOption.js | "if there is only one valid index, just return it. Otherwise, if there are no valid indexes, then fill the valid indexes array with the indexes of all the options. Next, the index of the option with the highest score is determined…" / `// if all scores are the same go with selectedOption` |
| 객체 옵션이 유효하려면 properties 키가 하나 이상 있어야 하고, 이때 required는 무시됨 | …/lib/schema/getFirstMatchingOption.js | "Create an "anyOf" schema that requires at least one of the keys in the "properties" object" / "Remove the "required" field as it's likely that not all fields have been filled in yet" |
| 점수 계산: 프로퍼티 타입이 값에서 추정한 타입과 같으면 +1(default·const가 있으면 추가로 ±1). 비객체 스키마는 타입이 같으면 +1 | getClosestMatchingOption.js (calculateIndexScore) | "If the type of the `value` matches the guessed-type of the `formValue`, the score is incremented by 1, UNLESS the value has a `default` or `const`." / `else if (isString(schema.type) && schema.type === guessType(formData)) { totalScore += 1;` |
| discriminator가 있으면 그것을 먼저 봄 | …/lib/getOptionMatchingSimpleDiscriminator.js | "Returns index of first `option` whose discriminator matches formData." |
| 데이터가 바뀌면 옵션을 다시 매칭함(6.6.1과 main 모두) | MultiSchemaField.js 6.6.1 / https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/fields/MultiSchemaField.tsx | "It recomputes the currently selected option based on the overall `formData`" / "Mirrors componentDidUpdate: re-match selectedOption when formData changes on the same field." |
| 옵션을 바꾸면 데이터를 정리한 뒤 새 옵션의 기본값을 채움 | MultiSchemaField.js | `let newFormData = schemaUtils.sanitizeDataForNewSchema(newOption, oldOption, formData);` / `newFormData = schemaUtils.getDefaultFormState(newOption, newFormData, 'excludeObjectChildren');` |
| 정리 규칙: 새 옵션에 properties가 없으면 전부 지움. 이전 옵션에만 있던 키는 undefined로 만듦. 새 옵션이 객체일 때 문자열·배열 데이터는 버림 | …/lib/schema/sanitizeDataForNewSchema.js | "If the new schema does not contain any properties, then `undefined` is returned to clear all the form data." / "any properties in the old schema that are non-existent in the new schema are set to `undefined`." / `...(typeof data == 'string' \|\| Array.isArray(data) ? undefined : data),` |

### 2(a)–(d) 로컬 관찰(rjsf 6.6.1)
네 경우 모두 선택기가 나옵니다. 사용자가 옵션을 바꿀 때 값을 새 타입으로 변환하는 경우는 없었습니다.

| 경우 | 선택기 | 초기 옵션 (데이터 → 선택) | 옵션을 바꿀 때 값 |
|---|---|---|---|
| (a) 객체끼리, properties가 다름 | `A`/`B`, 데이터에 맞춰 선택됨 | `{name,age}` → A, `{name,email}` → B, 둘 다 해당하는 `{name}` → 0(동점이라 현재 선택 유지) | 같은 타입의 공유 키(`name`)는 유지, 이전 옵션에만 있던 키(`age`)는 undefined |
| (b) 객체와 배열 | `Obj`/`Arr` | `{a}` → 0, `["x"]` → 1 | 데이터를 버리고 새 옵션의 빈 컨테이너로 교체(→배열은 `[]`, →객체는 `{}`) |
| (c) 객체와 문자열 | `Obj`/`Str` | `"hello"` → 1, `42` → 0(어느 옵션에도 맞지 않지만 0번이 켜짐) | 문자열 → 객체는 `{}`, 객체 → 문자열은 undefined |
| (d) 문자열과 숫자 | "v option 1/2", 선택된 옵션에 따라 입력 타입이 text/number로 바뀜 | `"42"` → 0(string), `42` → 1(number), `true`와 `null` → 0 | `"42"`를 숫자 옵션으로 바꾸면 undefined(삭제). 숫자 옵션에 `default: 7`이 있으면 7 |

실제 출력:
- (a)
  - `data={"name":"x","age":3} initialOption=0 | switch 0->1: sanitize={"name":"x"} afterDefaults={"name":"x"}`
  - `data={"name":"x"} initialOption=0`
  - `"options":["0:A","1:B"],"selected":"1"`
- (b)
  - `data={"a":"y"} initialOption=0 | switch 0->1: sanitize=undefined afterDefaults=[]`
  - `data=["x"] initialOption=1 | switch 1->0: sanitize={} afterDefaults={}`
- (c)
  - `data="hello" initialOption=1 | switch 1->0: sanitize={} afterDefaults={}`
  - `data=42 initialOption=0`
  - `data={"a":"y"} initialOption=0 | switch 0->1: sanitize=undefined afterDefaults=undefined`
- (d)
  - `data="42" initialOption=0 | switch 0->1: sanitize=undefined afterDefaults=undefined`
  - `data=42 initialOption=1`
  - `data=true initialOption=0`
  - 기본값 있음: `afterDefaults=7`
  - 렌더링: `"options":["0:v option 1","1:v option 2"],"selected":"0"` / `inputs=root_v[text]=42`, 42를 넣으면 `"selected":"1"` / `inputs=root_v[number]=42`

## 3. rjsf는 항상 "사용자가 고른다"인가, 자동 해석이 있는가

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| `type` 배열(6.x): 데이터와 상관없이 첫 타입으로 고정됨. 사용자 선택도 없고 해석도 없음 | 1번 표의 getSchemaType와 로컬 관찰 | `inputs=root_v[text]=[object Object]` |
| `oneOf`/`anyOf`: 분기는 데이터로 자동 선택되고(검증과 점수) 데이터가 바뀌면 다시 매칭됨. 사용자는 선택기로 바꿀 수 있음 | 2번 표 | `selectedOption: this.getMatchingOption(0, formData, retrievedOptions),` |
| 기존 값을 새 분기에 맞게 변환하지 않음. `"42"`에서 숫자 옵션으로 바꾸면 값이 삭제됨 | 로컬 관찰 | `data="42" … switch 0->1: sanitize=undefined afterDefaults=undefined` |
| 변환이 일어나는 곳 ①: 숫자 필드에서 사용자가 입력한 텍스트를 숫자로 해석할 때 | …/@rjsf/utils/lib/asNumber.js, …/core/lib/components/fields/NumberField.js | "Otherwise, the string is wrapped by `Number()` and if that result is not `NaN`, that number will be returned, otherwise the string `value` will be." / `asNumber(value)` |
| 변환이 일어나는 곳 ②: FallbackField에서 사용자가 타입을 바꿀 때. 처음 타입은 데이터에서 추정함. 6.x에서는 지원하지 않는 필드에만 적용되고, v7에서는 타입 배열까지 확장되지만 미릴리스 | …/core/lib/components/fields/FallbackField.js | `const [type, setType] = useState(getTypeOfFormData(formData));` / `const castedNumber = Number(formData);` / `return (isNaN(castedNumber) ? 0 : castedNumber);` / `onChange(castToNewType(formData, newType), fieldPathId.path, errorSchema, id);` |

**결론(도출):** rjsf에서 브랜치 노드의 다중 타입은 다음처럼 처리됩니다.
1. 타입 배열은 첫 타입으로 고정됩니다.
2. `oneOf`/`anyOf`는 데이터로 초기 분기를 자동 선택하고, 이후에는 사용자가 명시적으로 바꿉니다.
3. `"42"`를 42로 바꾸는 식의 해석은 기존 값에는 전혀 일어나지 않습니다. 변환은 사용자가 입력하거나 FallbackField에서 타입을 바꾸는 조작 때만 일어납니다.

## 4. JSON Forms 3.8.0과 ngx-formly 8.0.0

| 사실 | 출처 | 원문 인용 |
|---|---|---|
| JSON Forms `type` 배열: 선택기가 없음. 나열된 타입의 tester 가운데 rank가 가장 높은 렌더러가 선택됨(object 2, 배열 3, 텍스트 1). 배열 tester는 `items`만 있으면 걸리므로 `['object','array']`는 배열 컨트롤이 됨(도출) | https://github.com/eclipsesource/jsonforms/tree/master/packages/material-renderers/src/complex , https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/testers/testers.ts | `rankWith( 2, isObjectControl )` / `rankWith( 3, or(isObjectArrayControl, isPrimitiveArrayControl) )` / `deriveTypes(schema).length !== 0 &&` |
| JSON Forms `oneOf`: 탭으로 렌더링. 데이터가 있을 때 탭을 바꾸면 확인창이 뜨고, 확인하면 새 옵션의 기본값으로 교체함 | …/MaterialOneOfRenderer.tsx , …/core/src/i18n/combinatorTranslations.ts | `if (data === undefined) { openNewTab(newOneOfIndex); } else { setConfirmDialogOpen(true); }` / `handleChange( path, createDefaultValue(oneOfRenderInfos[newIndex].schema, rootSchema) );` / `'Your data will be cleared. Do you want to proceed?'` |
| JSON Forms `anyOf`: 데이터가 비었거나, 새 옵션 기본값과 JS `typeof`가 같으면 데이터를 유지한 채 탭만 바꿈. 아니면 `oneOf`와 같은 확인과 교체 | …/MaterialAnyOfRenderer.tsx | `isEmpty(data) \|\| typeof data === typeof createDefaultValue( anyOfRenderInfos[newIndex].schema, rootSchema )` |
| JSON Forms 기본값 생성 규칙. 초기 탭은 데이터를 통과시키는 첫 분기 | …/core/src/mappers/renderer.ts | `return '';` / `return 0;` / `return false;` / `return [];` / `return extractDefaults(resolvedSchema, rootSchema);` / `indexOfFittingSchema = i; break;` |
| formly `type` 배열: 첫 타입을 쓰고(null 쌍이면 null을 뒤로 보냄) 선택기가 없음. formly 자체 type 검증도 첫 타입만 허용하므로, 목록의 다른 타입 값은 invalid가 됨(도출) | https://github.com/ngx-formly/ngx-formly/blob/main/src/core/json-schema/src/formly-json-schema.service.ts | `return type.sort((t1) => (t1 == 'null' ? 1 : -1));` / `type: types[0],` / `case 'object': { return isObject(value); }` |
| formly `oneOf`/`anyOf`: `multischema` 필드와 enum 선택기를 만듦(`anyOf`는 다중 선택). 초기 선택은 유효한 옵션을 먼저, 그다음 값이 채워진 필드 수로 정렬 | 같은 곳 | `type: 'multischema',` / `multiple: mode === 'anyOf',` / `options: schemas.map((s, i) => ({ label: s.title, value: i, disabled: s.readOnly })),` / `if (f1Valid !== f2Valid) { return f2Valid ? 1 : -1; }` |
| formly 전환 시 값: 숨겨지는 옵션의 필드는 undefined가 되고, 보이게 되는 옵션의 필드는 값이 없으면 defaultValue가 들어감 | 같은 곳, https://github.com/ngx-formly/ngx-formly/blob/main/src/core/src/lib/models/fieldconfig.ts | `this._toFieldConfig(s, { ...options, resetOnHide: true })` / core: `if (resetOnHide && field.resetOnHide) { assignFieldValue(field, undefined);` / `if (field.resetOnHide && !isUndefined(field.defaultValue) && isUndefined(getFieldValue(field))) { assignFieldValue(field, field.defaultValue);` / "Whether to reset the value on hide or not. Defaults to `true`." |
| formly `oneOf`에서 공유 프로퍼티가 살아남는지는 실행으로 확인하지 않음. 옵션마다 별도 컨트롤을 쓰므로, 숨겨지는 쪽의 초기화가 같은 키를 비울 수 있음(도출) | 같은 서비스 파일 | `this.resolveMultiSchema('oneOf', <JSONSchema7[]>schema.oneOf, { ...options, shareFormControl: false }),` |

JSON Forms와 formly 소스에서 `type` 배열용 선택기는 찾지 못했습니다(검색 결과 없음, 도출).

## 설계에 대한 함의

**① 우리 union leaf (primitive 전용, 선택기 없음, 규칙 A로 값을 해석)**
- "선택기 없음"은 릴리스된 세 라이브러리와 같습니다.
- 차이는 값을 해석하는 방식입니다. 이 라이브러리들은 스키마 순서나 rank만 보고 필드를 고르며, 값을 보고 해석하거나 변환하지 않습니다. 규칙 A처럼 받은 값을 보고 판단하는 동작은 이들에게 없는 추가 동작입니다.
- 가장 가까운 선례는 rjsf v7의 opt-in 선택기입니다(미릴리스).
  - 처음 선택되는 타입을 데이터 타입에서 고르는 점은 규칙 A의 "목록에 있는 타입이면 유지"와 같은 방향입니다.
  - 하지만 값 변환은 사용자가 타입을 바꿀 때만 합니다.
  - null 쌍을 union으로 보지 않는 점은 우리의 nullable 플래그 설계와 같습니다.

**② 우리 object `oneOf`/`anyOf` variant host (값이 맞으면 분기가 켜짐)**
- 데이터로 분기를 고른다는 점은 세 라이브러리와 같은 방향입니다. rjsf는 데이터가 바뀔 때도 다시 매칭합니다.
- 차이 1 — 선택기: 세 라이브러리 모두 사용자에게 분기 선택기를 제공합니다(rjsf select, JSON Forms 탭, formly enum). 우리 설계는 값 매칭만 있으므로, 사용자가 분기를 바꾸려면 판별 값을 직접 입력해야 합니다.
- 차이 2 — 어느 분기에도 맞지 않을 때와 동점일 때:
  - rjsf는 유효한 옵션이 없어도 점수로 항상 하나를 켜고, 동점이면 현재 선택을 유지합니다. 예를 들어 (c)에서 `42`가 들어오면 객체 옵션이 켜집니다.
  - formly도 선택할 것이 없으면 `[0]`으로 돌아갑니다.
  - "값이 맞을 때만 켜짐"이라면 같은 데이터에서 아무 분기도 켜지지 않을 수 있습니다. brief에는 이 경우의 정책이 없습니다.
- 차이 3 — 분기가 바뀔 때 이전 값:
  - 공통: 세 라이브러리 모두 새로 켜진 분기에는 기본값을 채웁니다. 우리 B("분기가 켜질 때 기본값을 채움")와 같습니다.
  - rjsf는 같은 타입의 공유 키를 유지하고 나머지는 undefined로 만들며, 컨테이너 타입이 바뀌면 데이터를 버립니다.
  - JSON Forms의 `oneOf`는 확인을 받은 뒤 전체를 새 기본값으로 교체합니다.
  - formly는 숨겨지는 필드를 초기화합니다.
  - 우리 설계는 공유 키를 어떻게 할지 명시하지 않았습니다.

**③ object/array와 primitive 혼합을 blueprint 오류로 처리**
- `type` 배열 혼합은 세 라이브러리 모두 거부하지 않습니다. rjsf 6.x는 첫 타입으로 렌더링하고, v7은 opt-in 선택기를, JSON Forms는 rank를, formly는 첫 타입을 씁니다.
- `oneOf`/`anyOf` 안의 혼합((b), (c))도 세 라이브러리 모두 선택기로 정상 렌더링합니다.
- 이 오류 규칙이 `oneOf`/`anyOf`에도 적용되는지는 brief에서 분명하지 않습니다. 적용된다면 다른 라이브러리에서는 동작하는 흔한 스키마를 우리만 거부하게 됩니다(도출).

**남은 확인 사항**
- formly에서 공유 프로퍼티가 보존되는지는 실행해 보지 않았습니다.
- JSON Forms의 rank 결과는 소스로만 도출했고, 실행으로 확인하지 않았습니다.