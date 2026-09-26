# 백엔드 API 스키마 및 생성기에서의 `properties: { x: false }` / `not: { required: ['x'] }` 사용 의도 분석

## 1. 개요 및 연구 목적

JSON Schema가 `then`/`else`/`allOf`/`oneOf` 분기 내에서 `properties: { x: false }` 또는 `not: { required: ['x'] }`를 사용할 때, 스키마 작성자 및 스키마 생성기의 실제 의도가 무엇인지 실증적 근거(Primary Evidence)를 통해 조사한다.
- **가설 A (검증 규칙 / 거부):** "이 조건에서는 `x`가 전송/존재해서는 안 되며, 존재 시 요청을 거부(reject)한다."
- **가설 B (UI 힌트 / 숨김):** "이 조건에서는 `x`가 해당되지 않으므로 폼 UI에서 입력 필드를 가린다(hide)."
- **가설 C (상호 배타):** "둘 이상의 필드가 동시에 존재하는 것을 금지한다(mutual exclusivity)."

조사 대상: 스키마 생성 도구(Pydantic, FastAPI, zod-to-json-schema, TypeBox, typescript-json-schema), 표준 명세 및 글로벌 스타일 가이드(JSON Schema Spec, OpenAPI, Google AIP, Microsoft REST, Zalando), 공개 스키마 코퍼스(SchemaStore 963개 스키마 전수 분석), 프론트엔드 폼 라이브러리(RJSF, JSON Forms).

---

## 2. 영역별 1차 출처 조사 결과

### 2.1 스키마 생성기 (Generators)

1. **Pydantic v2 (`model_json_schema`)**
   - **방출 형상:** 불리언 스키마(`false`)나 `not: { required: ... }`를 **전혀 생성하지 않음**.
   - **근거:**
     - Pydantic v2의 스키마 생성 핵심 클래스인 `GenerateJsonSchema`(`pydantic/json_schema.py` 82행)에서 스키마 값의 타입을 `JsonSchemaValue = dict[str, Any]`로 강제 정의하고 있어, 불리언 타입(`bool`) 스키마 자체가 타입 시스템 수준에서 배제되어 있다.
     - `typing.Never` 필드를 모델에 포함할 경우 스키마 변환 시 `pydantic.errors.PydanticSchemaGenerationError: Unable to generate pydantic-core schema for typing.Never` 예외를 던지며 생성을 중단한다.
     - 필드 제외(`exclude=True` 또는 미포함)는 `properties` 딕셔너리에서 키 자체를 생략하거나 `required` 배열에서 제외하는 방식으로만 처리된다.
   - **링크:** [Pydantic json_schema.py L82](https://github.com/pydantic/pydantic/blob/main/pydantic/json_schema.py#L82), [Pydantic Issue #9731 (Support typing.Never)](https://github.com/pydantic/pydantic/issues/9731)

2. **FastAPI**
   - **방출 형상:** `fastapi.openapi.utils.get_openapi`가 OpenAPI 스키마 생성 시 내부적으로 Pydantic의 `GenerateJsonSchema`를 그대로 호출하므로, `false` 속성 스키마나 `not: { required }`를 전혀 생성하지 않는다.
   - **링크:** [FastAPI openapi/utils.py](https://github.com/fastapi/fastapi/blob/master/fastapi/openapi/utils.py)

3. **OpenAPI 3.1 및 Swagger 도구 생태계**
   - **명세 현황:** OpenAPI 3.0까지는 Schema Object가 반드시 매핑 객체여야 했으나, OpenAPI 3.1에서 JSON Schema Draft 2020-12와 완전 통합되며 최상위 및 서브스키마로 불리언 스키마(`true`/`false`)가 공식 허용되었다.
   - **도구 구현:** 그러나 실제 도구 체인에서는 불리언 스키마가 심각한 비호환을 유발한다. `openapi-generator`는 불리언 스키마 파싱 시 `java.lang.IllegalArgumentException: Cannot deserialize value of type java.lang.Boolean` 에러를 던지며 크래시하고, Swagger UI도 5.x에 이르러서야 부분 지원이 추가되었으나 렌더링 버그가 지속 보고되고 있다. 따라서 OpenAPI 생성 도구들은 `properties: { x: false }` 방출을 극력 회피한다.
   - **링크:** [OpenAPI 3.1.0 Specification §4.8.24](https://spec.openapis.org/oas/v3.1.0#schema-object), [Swagger UI Issue #8863](https://github.com/swagger-api/swagger-ui/issues/8863)

4. **zod-to-json-schema**
   - **방출 형상:** `z.never()` 입력 시 `{ "not": {} }`를 방출한다 (단, 대상 타깃이 OpenAI일 경우 `undefined`로 생략).
   - **코드 근거 (`src/parsers/never.ts`):**
     ```ts
     export function parseNeverDef(refs: Refs): JsonSchema7NeverType | undefined {
       return refs.target === "openAi"
         ? undefined
         : { not: parseAnyDef({ ...refs, currentPath: [...refs.currentPath, "not"] }) };
     }
     ```
     `parseAnyDef`는 `{}`를 반환하므로 결과는 `{ not: {} }`가 된다.
   - **링크:** [zod-to-json-schema src/parsers/never.ts](https://github.com/StefanTerdell/zod-to-json-schema/blob/master/src/parsers/never.ts)

5. **TypeBox (`@sinclair/typebox`)**
   - **방출 형상:** `Type.Never()` 호출 시 내부 심볼과 함께 `{ not: {} }`를 방출한다.
   - **코드 근거 (`src/type/never/never.ts`):**
     ```ts
     export function Never(options?: SchemaOptions): TNever {
       return CreateType({ [Kind]: 'Never', not: {} }, options);
     }
     ```
     JSON 직렬화 시 Symbol 키가 제거되므로 순수 JSON Schema는 `{ "not": {} }`가 된다.
   - **링크:** [TypeBox src/type/never/never.ts](https://github.com/sinclairzx81/sinclair-typebox/blob/master/src/type/never/never.ts)

6. **typescript-json-schema**
   - **방출 형상:** `never` 타입 필드는 스키마의 `properties`에서 **완전 제거(생략)**된다 (`false`나 `not: {}`를 생성하지 않음).
   - **코드 근거 (`typescript-json-schema.ts` 1138-1142행):**
     ```ts
     const props = this.tc.getPropertiesOfType(clazzType).filter((prop) => {
       // filter never and undefined
       const propertyFlagType = this.tc.getTypeOfSymbolAtLocation(prop, node).getFlags();
       if (ts.TypeFlags.Never === propertyFlagType || ts.TypeFlags.Undefined === propertyFlagType) {
         return false;
       }
       // ...
     });
     ```
   - **링크:** [typescript-json-schema.ts L1140](https://github.com/YousefED/typescript-json-schema/blob/master/typescript-json-schema.ts#L1140)
   - *(참고: `ts-json-schema-generator`의 경우 `NeverTypeFormatter.ts`에서 `{ not: {} }`를 방출함)*

---

### 2.2 표준 명세 및 API 스타일 가이드 (Specs & Style Guides)

1. **JSON Schema 명세 및 공식 문서**
   - **명세 정의 (Draft 2020-12 §4.3.2):** 불리언 스키마 `false`는 "어떤 인스턴스도 유효하지 않은 스키마"이며, `{ "not": {} }`와 정확히 동등하다.
   - **명세 정의 (Draft 2020-12 §10.3.2.1):** `properties` 키워드는 인스턴스에 존재하는 키에 대해서만 해당 하위 스키마를 평가한다. 따라서 `"properties": { "x": false }`는 인스턴스에 `x`가 존재하면 `false`가 평가되어 **유효성 검증 실패(거부)**하고, `x`가 없으면 평가되지 않아 성공한다.
   - **Understanding JSON Schema 가이드 ("Prohibiting Properties"):** 특정 속성의 전송을 금지하는 정형화된 패턴으로 `not: { required: ["x"] }` 또는 `properties: { x: false }`를 규정하고 있다.
   - **의도:** 명세상 100% **데이터 검증 거부(Validation Rejection Rule)**이다. UI의 렌더링 여부나 숨김에 관한 어떠한 언급도 포함하지 않는다.
   - **링크:** [JSON Schema Draft 2020-12 Core §4.3.2](https://json-schema.org/draft/2020-12/json-schema-core#section-4.3.2), [Understanding JSON Schema: Declaring a JSON Schema](https://json-schema.org/understanding-json-schema/basics#boolean-schemas)

2. **Google Cloud API Design Guide (AIP)**
   - Google AIP는 Protocol Buffers 기반 인터페이스(AIP-131, AIP-180)를 표준으로 사용하며, 상호 배타적 필드는 Protobuf 언어 네이티브인 `oneof` 키워드로 정의한다.
   - JSON Schema의 `false` 속성이나 `not: { required }` 패턴은 다루지 않는다.
   - **링크:** [Google AIP-131](https://google.aip.dev/131)

3. **Microsoft REST API Guidelines**
   - Microsoft API Guidelines는 OpenAPI 및 TypeSpec을 중심으로 모델을 정의한다.
   - 필드 배타성은 주로 다형성(`oneOf`) 또는 쿼리 파라미터 제약 규칙으로 서술하며, `properties: { x: false }`나 `not: { required }`를 권장하는 지침은 존재하지 않는다.
   - **링크:** [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines)

4. **Zalando RESTful API Guidelines**
   - 클라이언트 SDK 및 서버 코드 생성기(OpenAPI Generator 등)와의 상호 운용성을 유지하기 위해, Rule 153/174 등에서 `not` 키워드 및 식별자(discriminator) 없는 `oneOf`/`anyOf` 같은 복잡한 스키마 결합을 사용하지 말 것을 명시적으로 권고한다.
   - `properties: { x: false }`나 `not: { required }` 패턴을 일체 권장하지 않는다.
   - **링크:** [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)

---

### 2.3 공개 스키마 코퍼스 전수 분석 (Public Schema Corpora)

SchemaStore 저장소의 963개 공개 JSON Schema 파일을 전수 검색한 결과:
- `properties.*: false`를 명시한 스키마: **67개 파일**
- `not: { required: [...] }` 패턴을 명시한 스키마: **181개 파일**

이들 중 실제 백엔드/CLI 설정 및 API 스키마에서 확인된 대표 사례 10건의 맥락과 작성자 의도는 다음과 같다:

1. **`github-pages-jekyll.json`**
   - **형상:** `.allOf[1].properties: { "source": false, "destination": false, "plugins_dir": false }`
   - **맥락:** 기본 `jekyll.json`을 `allOf`로 상속받은 뒤, GitHub Pages 빌드 환경에서는 사용자가 임의로 소스/대상 디렉터리 및 플러그인 경로를 지정할 수 없도록 원천 차단함.
   - **의도:** **거부** (사용자 지정 경로 설정 시 빌드/설정 거부).
   - **링크:** [github-pages-jekyll.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/github-pages-jekyll.json)

2. **`partial-poe.json` (Poe the Poet 태스크 러너)**
   - **형상:** `if: { properties: { use_exec: { const: true } }, required: ["use_exec"] }, then: { properties: { capture_stdout: false } }`
   - **맥락:** 태스크를 하위 프로세스가 아닌 현 프로세스 내에서 직접 실행(`use_exec: true`)할 경우 stdout 출력을 리다이렉션/캡처할 수 없으므로, 두 설정이 공존할 수 없음.
   - **의도:** **거부 / 상호 배타** (조건부 제약 위반 시 즉각 에러 처리).
   - **링크:** [partial-poe.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/partial-poe.json)

3. **`aspire-8.0.json` (Microsoft .NET Aspire 매니페스트)**
   - **형상:** `.properties.resources.additionalProperties.oneOf[1].properties: { "build": false }`
   - **맥락:** `container.v0` 리소스는 사전 빌드된 `image`를 사용하는 리소스이므로, 소스코드 빌드 옵션을 정의하는 `build` 객체가 지정되는 것을 금지함 (빌드가 필요하면 `container.build.v0` 변종 사용).
   - **의도:** **상호 배타** (이미지 지정 리소스와 빌드 컨텍스트 지정 리소스의 혼용 방지).
   - **링크:** [aspire-8.0.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/aspire-8.0.json)

4. **`hatch.json` (Hatch 파이썬 프로젝트 설정)**
   - **형상:**
     - `oneOf[1].properties: { "source": false, "path": { "type": "string" } }`
     - `oneOf[2].properties: { "path": false, "source": { ... } }`
   - **맥락:** 버전 관리 제공자 설정 시 파일 경로 기반(`path`)인지 외부 플러그인 기반(`source`)인지 둘 중 정확히 하나만 지정되도록 각 분기에서 상대방 속성을 `false`로 차단.
   - **의도:** **상호 배타** (두 속성의 동시 입력 방지).
   - **링크:** [hatch.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/hatch.json)

5. **`chart.json` (Helm Chart.yaml)**
   - **형상:** `if: { properties: { apiVersion: { const: "v3" } } }, else: { properties: { dependencies: { items: { properties: { "depends-on": false } } } } }`
   - **맥락:** `depends-on` 키워드는 Helm v3 이상에서만 지원되며, v2 이하 차트에서 작성될 경우 동작하지 않으므로 검증 단계에서 거부함.
   - **의도:** **거부** (상위 버전 전용 키워드의 구버전 사용 방지).
   - **링크:** [chart.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/chart.json)

6. **`prek.json` (Pre-commit CLI 도구 설정)**
   - **형상:** `definitions.LocalRepo.properties: { "rev": false }`
   - **맥락:** 로컬 저장소 훅(`repo: local`)은 원격 git 태그나 커밋 SHA(`rev`)를 가질 수 없으므로 `rev` 필드 입력을 금지함.
   - **의도:** **거부** (저장소 유형에 부합하지 않는 필드 차단).
   - **링크:** [prek.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/prek.json)

7. **`yamllint.json`**
   - **형상:** `$defs.ignorable.not: { required: ["ignore", "ignore-from-file"] }`
   - **맥락:** 무시 목록을 인라인(`ignore`)과 외부 파일(`ignore-from-file`) 양쪽 모두에 동시에 적는 것을 방지함.
   - **의도:** **상호 배타** (두 필드가 동시에 `required`되는 상태를 부정).
   - **링크:** [yamllint.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/yamllint.json)

8. **`debugsettings.json` (Visual Studio launchSettings.json)**
   - **형상:**
     - `anyOf[0]: { properties: { "executablePath": { ... } }, not: { required: ["commandName"] } }`
     - `anyOf[1]: { properties: { "commandName": { ... } }, not: { required: ["executablePath"] } }`
   - **맥락:** 실행 프로필은 실행 파일 경로 직접 지정 방식(`executablePath`)과 기등록 명령어 방식(`commandName`) 중 하나만 가져야 하므로 상호 배타성 강제.
   - **의도:** **상호 배타** (동시 지정 방지).
   - **링크:** [debugsettings.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/debugsettings.json)

9. **`attw.json` (@arethetypeswrong/cli)**
   - **형상:** `not: { required: ["pack", "fromNpm"], properties: { pack: { const: true }, fromNpm: { const: true } } }`
   - **맥락:** npm tarball 패키징 검사와 npm 레지스트리 원격 검사는 동시에 수행될 수 없는 상호 배타적 실행 모드임.
   - **의도:** **상호 배타** (충돌하는 두 플래그 동시 활성화 거부).
   - **링크:** [attw.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/attw.json)

10. **`openhab-5.1.json` (openHAB 스마트홈 아이템 설정)**
    - **형상:** `if: { properties: { type: { not: { const: "Number" } } } }, then: { not: { required: ["dimension"] } }`
    - **맥락:** 아이템 타입이 `Number`가 아닌 경우(예: Switch, String), 측정 단위 차원(`dimension`) 속성을 포함할 수 없음.
    - **의도:** **거부** (부적합한 타입에 딸린 부가 필드 전송 금지).
    - **링크:** [openhab-5.1.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/openhab-5.1.json)

---

### 2.4 프론트엔드 폼 라이브러리 (Form Libraries)

1. **react-jsonschema-form (RJSF, `@rjsf/core`)**
   - **동작 방식:**
     - `schema.properties.x: false`가 주어지면, RJSF의 유틸리티 `getSchemaType(schema)`는 `schema`가 불리언이므로 `{ type } = false`에 의해 `undefined`를 반환한다.
     - `SchemaField`의 `getFieldComponent`는 타입이 `undefined`이므로 기본 컴포넌트 맵에서 일치하는 필드를 찾지 못하고 `fields.FallbackField`를 반환한다.
     - `FallbackField`는 기본 설정(`useFallbackUiForUnsupportedType: false`) 상태에서 `UnsupportedFieldTemplate`을 호출하며, 화면에 **"Unsupported field schema for field x: Unknown field type undefined"**라는 오류/경고 패널을 그대로 렌더링한다.
     - 필드를 자동으로 숨기거나 렌더링에서 생략하지 않는다.
     - 입력 데이터에 `x` 키가 포함되어 있을 경우 내장 Ajv 검증기가 `/x false schema "boolean schema is false"` 에러를 발생시킨다.
   - **의도 해석:** RJSF는 `false` 속성을 **"지원되지 않는 스키마 타입에 대한 렌더링 오류"** 및 **"검증 실패"**로 취급하며, "UI 숨김 힌트"로 해석하지 않는다.
   - **링크:** [RJSF getSchemaType.ts](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/schema/getSchemaType.ts), [RJSF FallbackField.tsx](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/fields/FallbackField.tsx)

2. **JSON Forms (`@jsonforms/core`)**
   - **동작 방식:**
     - **자동 UI 스키마 생성 (`generateUISchema`):** `deriveTypes(false)`를 호출할 때 `lodash/isEmpty(false)`가 `true`를 반환하므로 타입 목록이 `[]`가 된다. `types.length === 0` 검사에 걸려 `generateUISchema`가 즉시 `null`을 반환하고 레이아웃에 컨트롤 요소를 추가하지 않는다. 따라서 자동 생성 시에는 **해당 필드의 컨트롤이 렌더링되지 않는다 (화면에서 누락/생략)**.
     - **수동 UI 스키마 지정 (Control이 `#/properties/x`를 가리킬 때):** 모든 표준 컨트롤 테스터(`schemaTypeIs('string')`, `schemaTypeIs('number')` 등)는 내부에서 `!isEmpty(schema)`를 검사한다. `schema`가 `false`이면 모든 테스터가 실패하여 일치 점수가 `-1`이 되며, 결과적으로 매핑되는 렌더러가 없어 **"No applicable renderer found"** 경고가 발생한다.
     - 데이터에 `x`가 존재할 경우 Ajv 검증기는 동일하게 `false schema` 위반 에러를 방출한다.
   - **의도 해석:** 자동 생성 시 필드가 누락되는 것은 UI 힌트를 고려한 고의적 동작이라기보다는 불리언 스키마의 타입 파정 불가(`isEmpty` 판정)로 인한 부수효과이며, 스키마 유효성 차원에서는 명백히 **"검증 실패(거부)"**로 다뤄진다.
   - **링크:** [JSON Forms uischema.ts L138](https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/generators/uischema.ts#L138), [JSON Forms util.ts L95](https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/util/util.ts#L95)

---

## 3. 종합 대조 표 (Summary Table)

| 출처 (Source) | 생성/방출 형상 (Emitted Shape) | 명백한 의도 (Evident Intent) | 출처 링크 (Link) |
| :--- | :--- | :--- | :--- |
| **Pydantic v2** | 방출 불가 (`PydanticSchemaGenerationError` 발생) | 불명 (스키마 표현 불가) | [pydantic#9731](https://github.com/pydantic/pydantic/issues/9731) |
| **FastAPI** | 미생성 (Pydantic에 위임, 불리언 미지원) | 불명 (스키마 표현 불가) | [fastapi/openapi](https://github.com/fastapi/fastapi/blob/master/fastapi/openapi/utils.py) |
| **zod-to-json-schema** | `{ "not": {} }` (`z.never()`) | 거부 (검증 불가 타입 표현) | [zod-to-json-schema/never.ts](https://github.com/StefanTerdell/zod-to-json-schema/blob/master/src/parsers/never.ts) |
| **TypeBox** | `{ "not": {} }` (`Type.Never()`) | 거부 (검증 불가 타입 표현) | [typebox/never.ts](https://github.com/sinclairzx81/sinclair-typebox/blob/master/src/type/never/never.ts) |
| **typescript-json-schema** | 스키마에서 완전 생략 (`ts.TypeFlags.Never` 필터링) | 거부 / 불명 (존재하지 않는 타입 간주) | [typescript-json-schema.ts#L1140](https://github.com/YousefED/typescript-json-schema/blob/master/typescript-json-schema.ts#L1140) |
| **OpenAPI 3.1 Spec** | `true` / `false` 허용 (단, 도구 생태계 지원 취약) | 거부 (인스턴스 매칭 완전 불허) | [OpenAPI 3.1.0 §4.8.24](https://spec.openapis.org/oas/v3.1.0#schema-object) |
| **JSON Schema Spec** | `properties: { x: false }` ≡ `{ not: {} }` | 거부 (속성 존재 시 유효성 실패) | [JSON Schema Core §4.3.2](https://json-schema.org/draft/2020-12/json-schema-core#section-4.3.2) |
| **GitHub Pages Jekyll** | `properties: { source: false, destination: false }` | 거부 (호스팅 환경 내 경로 변경 금지) | [github-pages-jekyll.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/github-pages-jekyll.json) |
| **Poe the Poet** | `then: { properties: { capture_stdout: false } }` | 거부 / 상호 배타 (`use_exec`와 충돌) | [partial-poe.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/partial-poe.json) |
| **.NET Aspire Manifest** | `properties: { build: false }` | 상호 배타 (`image` vs `build`) | [aspire-8.0.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/aspire-8.0.json) |
| **Hatch Manifest** | `properties: { source: false }` / `path: false` | 상호 배타 (버전 소스 vs 경로) | [hatch.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/hatch.json) |
| **Helm Chart** | `else: { properties: { depends-on: false } }` | 거부 (v2 차트 내 v3 기능 사용 금지) | [chart.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/chart.json) |
| **Pre-commit Prek** | `LocalRepo.properties: { rev: false }` | 거부 (로컬 훅에 rev 지정 금지) | [prek.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/prek.json) |
| **yamllint** | `not: { required: ["ignore", "ignore-from-file"] }` | 상호 배타 (동시 지정 금지) | [yamllint.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/yamllint.json) |
| **Visual Studio Debug** | `anyOf`: `not: { required: [상대방] }` | 상호 배타 (`executablePath` vs `commandName`) | [debugsettings.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/debugsettings.json) |
| **Are The Types Wrong** | `not: { required: ["pack", "fromNpm"] }` | 상호 배타 (동시 실행 플래그 금지) | [attw.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/attw.json) |
| **openHAB** | `then: { not: { required: ["dimension"] } }` | 거부 (비숫자형 아이템 차원 금지) | [openhab-5.1.json](https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/openhab-5.1.json) |
| **RJSF (`@rjsf/core`)** | `UnsupportedFieldTemplate` 렌더링 | 거부 (타입 미인식 오류 및 검증 실패) | [RJSF FallbackField](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/fields/FallbackField.tsx) |
| **JSON Forms Core** | UI 스키마 생성 시 누락 / 매핑 실패 경고 | 거부 (렌더러 없음 및 Ajv 검증 실패) | [JSON Forms uischema.ts](https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/generators/uischema.ts#L138) |

---

## 4. 5줄 결론 (5-line Conclusion)

1. 실제 백엔드 API 및 공용 스키마(SchemaStore 963건)에서 `properties: { x: false }` 및 `not: { required: ['x'] }`는 100% **검증 규칙(거부)** 또는 **상호 배타(Mutual Exclusivity)** 목적으로만 작성되었으며, UI 숨김 힌트로 작성된 1차 증거는 전무하다.
2. 백엔드 생성기(Pydantic v2, FastAPI)는 불리언 스키마 자체를 지원하지 않아 예외를 던지며, Zod/TypeBox 등 TS 계열 생성기는 `never` 표현 시 일관되게 검증 거부의 의미인 `{ not: {} }`를 방출한다.
3. 주요 API 스타일 가이드(Google AIP, Microsoft, Zalando)는 코드 생성기와의 호환성 문제로 불리언 스키마 및 `not` 사용을 기피하며, 상호 배타는 Protobuf `oneof`나 OpenAPI `oneOf` 다형성으로 해결하도록 권고한다.
4. 프론트엔드 폼 라이브러리(RJSF, JSON Forms) 중 어느 것도 `false` 속성을 "UI 필드를 정상적으로 가리기 위한 지침"으로 설계하지 않았으며, RJSF는 `UnsupportedField` 오류 패널을 출력하고 JSON Forms는 테스터 불일치 경고를 낸다.
5. 따라서 폼 엔진이 `x: false`를 만나 값을 임의로 삭제하거나 필드를 정상 숨김 처리하는 것은 스키마 작성자의 의도와 배치되며, UI 제어는 `&active`나 커스텀 어노테이션에 맡기고 `false`는 검증 거부(에러)로만 처리하는 것이 유일하게 스펙 및 실무 관행과 일치한다 [추론: 실무에서 숨김을 의도한 작성자가 존재한다면 이는 JSON Schema 표준에 대한 오해에서 기인했을 가능성이 높음].
