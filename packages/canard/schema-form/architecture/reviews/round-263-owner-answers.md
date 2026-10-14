# 263라운드 — Vincent의 답 (PR #364 병합 명시 허가)

2026-10-14. 262라운드(#364 검증 통과) 뒤 원장 관리자가 squash 병합 허가를 물었고 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| #364 병합 | PR #364(07b-4, head c711f3d17)를 squash 병합해도 되는지 | "내가 명시적으로 허가한다. 병합해도 된다." | 원장 관리자가 squash 병합·원격 가지 삭제 실행 |

다음 라운드 번호는 264이다.

## 덧붙임 (2026-10-14, 병합 실행)

원장 관리자가 #364를 squash 병합했다: 병합 커밋 f108340f3(feat/schema-form-switch 새 tip), 원격 feat/schema-form-07b-4 삭제. 다음은 07b-5(259C-01 치환) 브리프를 fixy07에게 보내고, 261C-01의 소유자 답이 오면 같은 PR의 후속 커밋으로 더한다.

## 덧붙임 (2026-10-14, 07b-5 치환 규칙 셋)

fixy07 질문에 편집자 결정: (가) 시험 파일 `src/__tests__/e2e/schema-node-props-flow.test.tsx`는 `field-node-props-flow.test.tsx`로 git mv(파생 이름은 원본을 따름); (나) 런타임 노드를 뜻하는 산문 "schema node(s)"는 "field node(s)"로 바꾸되(fieldInput.ts·fieldRenderer.ts JSDoc 약 25줄, README.md:527-539, SPECIFICATION.md:412, JSONSchemaError.ts:6, 시험 이름 2개), JSON Schema 조각을 뜻하는 "JSON Schema node"·"Non-schema node"와 documents/docs/winglet/json-schema의 5줄은 유지 — 구분 기준을 PR 본문에 적음; (다) fieldRenderer.ts:32의 옛 이름 오타 "FromTypeInput"은 `FieldInput` component로 고치고 옛 이름 게이트 목록에 오타 변형 `FromType*`를 추가.

## 덧붙임 (2026-10-14, 옛 문법 게이트의 정리 커밋 둘)

fixy07의 기준 트리 스캔: 지워진 키 133건과 위치 판정이 필요한 중첩 키 248건. 분류 A(실제 옛 문법 스키마: UI 플러그인 넷의 RegisterPlugin.stories.tsx 각 7곳·FormComponent.stories.tsx 각 1곳의 `computed`, benchmark-form fixtures/equivalent/derived.ts·branches.ts), B(산문·오류 문구·INTENT·시험 이름: documents 예제 셋 en·ko, api-reference watchValues 주석, formatDynamicFunctionError·formatInfiniteLoopError 문구, dynamicExpression/INTENT.md, computed.*.render.test.tsx 파일 이름, schema-form-scenarios 설명), C(지워졌음을 확인하는 시험 넷 — 예외), D(오탐 — 예외). 편집자 결정: A는 ②-4(런타임 변경 표기, 스토리 전후 차이), B는 ②-5(파일 이름 git mv, 사용자 가시 문구 변경 목록), C·D는 PR 본문 예외 목록. 조건: benchmark-form equivalent fixture는 소비자를 확인해 옛 엔진 비교 하네스가 읽으면 C로, 새 엔진만 읽으면 A로, 둘 다면 보고 후 정지. 중첩 키 248건의 판정 요약을 PR 본문에.
