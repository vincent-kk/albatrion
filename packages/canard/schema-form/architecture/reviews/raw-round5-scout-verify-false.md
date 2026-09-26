# raw-round5-false-usage.md 팩트체크 (6건 스팟체크)

| # | 주장 | 판정 | URL | 근거 인용 (≤1줄) |
|---|---|---|---|---|
| 1 | zod-to-json-schema `never.ts`가 `z.never()`에 대해 `{not:{}}` 방출 | CONFIRMED | https://raw.githubusercontent.com/StefanTerdell/zod-to-json-schema/master/src/parsers/never.ts | `return refs.target === "openAi" ? undefined : { not: parseAnyDef(...) }` — openAi 아닐 시 `{not:{}}` |
| 2 | TypeBox `Type.Never()`가 `{not:{}}` 방출, 코드 근거는 `src/type/never/never.ts` (repo `sinclairzx81/sinclair-typebox`) | PARTLY | https://raw.githubusercontent.com/sinclairzx81/typebox/master/src/type/types/never.ts | `export function Never(...): TNever { return Memory.Create({'~kind':'Never'}, {not:{}}, options) as never }` — 결과 형상(`{not:{}}`)은 맞으나, 보고서의 저장소명(`sinclairzx81/sinclair-typebox`, 404)과 경로(`src/type/never/never.ts`, 404)는 틀림; 실제 경로는 `sinclairzx81/typebox` repo의 `src/type/types/never.ts` |
| 3 | pydantic issue #9731이 `typing.Never` 지원 요청이며 `PydanticSchemaGenerationError` 관련 | CONFIRMED | https://github.com/pydantic/pydantic/issues/9731 | 제목 "Add support for `typing.Never`", open, feature-request/deferred 라벨, `list[str \| Never]` 사용 시 스키마 생성 실패 보고 |
| 4 | RJSF가 boolean `false` 속성 스키마에 대해 `UnsupportedFieldTemplate`/FallbackField 렌더링 | CONFIRMED | https://raw.githubusercontent.com/rjsf-team/react-jsonschema-form/main/packages/core/src/components/fields/FallbackField.tsx | `useFallbackUiForUnsupportedType` 비활성 시 `<UnsupportedFieldTemplate schema={schema} ... reason={reason} .../>` 렌더링, reason 기본값 "Unknown field type"+타입 |
| 5a | SchemaStore `github-pages-jekyll.json`에 `allOf[1].properties: {source:false, destination:false, plugins_dir:false}` | CONFIRMED | https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-pages-jekyll.json | `"source": false, "destination": false, "plugins_dir": false,` (allOf 2번째 객체 내), 주변에 "GitHub Pages always runs Jekyll in safe mode" 문맥 |
| 5b | SchemaStore `openhab-5.1.json`에 `if:{properties:{type:{not:{const:"Number"}}}}, then:{not:{required:["dimension"]}}` | CONFIRMED | https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/openhab-5.1.json | `"if":{"properties":{"type":{"not":{"const":"Number"}}}}, "then":{"not":{"properties":{"dimension":{}},"required":["dimension"]}}` — 패턴 2회 등장(items, group) |
| 6 | "SchemaStore 963건 전수조사, `x:false` 67건, `not:{required}` 181건" 수치의 산출 근거(스크립트/검색 URL) | UNVERIFIED | (해당 없음) | raw-round5-false-usage.md §2.3(원본 105-107행)에는 수치만 제시되고 검색 스크립트·검색 쿼리·URL 등 재현 가능한 산출 근거가 전혀 없음 — 숫자 자체는 검증 불가 |

## 비고
- 2번(TypeBox)은 **본문 주장(형상)은 맞지만 인용(저장소/경로/코드 스니펫)이 틀린 혼합 판정**이므로 PARTLY로 처리함. `sinclairzx81/sinclair-typebox`와 `src/type/never/never.ts`는 둘 다 404이며, 실제로는 `sinclairzx81/typebox` repo가 대규모 구조 개편(`src/type/types/*.ts`)을 거쳤음.
- 6번은 반증이 아니라 "검증 불가능"임 — 보고서에 재현 가능한 근거가 없어 숫자 자체를 확인할 방법이 없음.
