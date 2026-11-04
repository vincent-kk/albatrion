# 305라운드 닫기 — 대기열 51·40을 fairy08의 코드 확인 결과와 원장 원리로 닫고, 옛 조건 문법의 무시는 원리로 답하며, 배열 한도 문서를 PR로 보낸다

2026-10-14. fairy08이 300C-04로 넘긴 코드 확인 둘(대기열 51 `queue-51-codes.md`, 대기열 40 `queue-40-storybook-docs.md`)과 304라운드 문안(`errcodes/array-limits-sections.md`)을 보고했다. 301라운드 소유자 지시(원장 원리나 코드 확인으로 알 수 있는 항목은 원장 관리자가 닫는다)에 따라 편집자 결정으로 닫는다.

### 305C-01 대기열 51을 닫는다 — 넷 모두 폐기다. `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 fairy08이 "이식 누락"으로 보았으나 원장 ERROR-162가 17라운드에 이미 폐기했다

- 닫는 항목: LANDING-210(보충), ERROR-162(보충), ERROR-044(보충)
- 결정:
  - 【추론】 fairy08의 코드 확인은 넷 중 셋(`NESTED_COMPOSITION_IGNORED_FOR_FORM`은 중첩 합성을 재귀로 펼쳐 지원, `CONDITION_INDEX`·`CONDITION_INDICES`는 분기 `controls.active`의 컴파일 실패가 `CREATE_DYNAMIC_FUNCTION`으로 `#/oneOf/<i>/controls/active`에 나고 `const`·`enum` 선택은 코드를 만들지 않는 판별자 게이트)을 폐기로, `NULLABLE_ONE_OF_NULL_UNREACHABLE`을 이식 누락으로 판정했다. 그러나 원장 ERROR-162(17라운드, `adr/0014-error-policy.md:385`)가 그 경고를 "분기 내용을 읽으므로 폐기"로 이미 정했고, 시험 `src/__tests__/scenarios/nullable.object-validation.render.test.tsx:4-14`의 머리글도 "아무것도 이 경고를 내지 않는다"를 그 결정대로 고정하고 있다. 코드 확인이 원장 결정과 어긋날 때는 원장이 이기므로 넷 모두 폐기이며, 정돈-E E1은 `PRESENTATION_KEY_SUSPECT`와 함께 다섯을 지우고 `BlueprintErrorCode`의 죽은 항목 둘(`ConditionIndex`·`ConditionIndices`)과 `src/helpers/warning/warningCode.ts`의 소비자 없는 상수도 함께 지운다. ADR 0014 코드 표의 "CONDITION_INDEX 또는 CONDITION_INDICES" 행은 레거시 이름의 열거라 새 엔진의 코드는 `CREATE_DYNAMIC_FUNCTION` 하나임을 이 보충으로 적는다.
- 근거: fairy08 `queue-51-codes.md`(2026-10-14, 시험과 탐침으로 확인); `ledger/error.md` ERROR-162·ERROR-044; `adr/0014-error-policy.md:385,703,732`; `src/core/engine/blueprint/utils/diagnostics/constant.ts:13-14`.
- 다음: `plan/tidy-structure/brief-tidy-E.md` E1의 "값은 남기고 주석" 지시를 "다섯 모두 지움"으로 고친다(이 라운드에서 고침).

### 305C-02 대기열 40을 닫는다 — 재현되지 않았고 #367의 방어 수정이 유효하다

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 fairy08이 1.0.0-beta 트리에서 스토리북 docs 페이지 85개 전부를 iframe으로 직접 열고, 관리 화면 안에서 보고된 페이지와 composite·composition docs 37개를 다시 불러오지 않고 오가며 관리 창과 미리보기 창 양쪽에 오류 수집기를 심었는데 오류 화면·콘솔 오류·"circular" 문구가 모두 0이었다. #367(beff4b5ec)이 확인된 순환 하나(`createHandleProbe`의 spy 인자)를 호출 기록 배열로 바꾸고 `controls.exclude`와 표시의 순환 안전화를 넣었으므로 그 수정으로 해소된 것으로 본다. 확인하지 않은 것은 정적 빌드(#367이 확인함), 페이지 안 조작(Show code·controls 변경), 소유자의 브라우저·확장 상태이며, 소유자가 다시 보면 브라우저 정보와 함께 새 항목으로 연다.
- 근거: fairy08 `queue-40-storybook-docs.md`(2026-10-14, 결과 `q40/results.jsonl`·`q40/manager.jsonl`, 스크린숏 둘); PR #367.
- 다음: 없음.

### 305C-03 옛 조건 문법(`computed.if`·`&if`)이 보고 없이 무시되는 것은 결함이 아니라 CONTROLS-001의 결과다 — 대기열에 올리지 않는다

- 닫는 항목: LANDING-210(보충), CONTROLS-049(보충)
- 결정:
  - 【추론】 fairy08의 별도 발견(옛 문법 `computed.if`·`&if`가 든 스키마는 오류나 경고 없이 키가 무시됨)은 새 설계의 원칙 그대로다: 폼은 그룹 객체 셋(`controls`·`options`·`presentation`) 안의 키만 읽고(CONTROLS-001), 맨 키는 JSON Schema 층의 모르는 키로 검증기에 간다(CONTROLS-078·CONTROLS-081이 같은 원리로 `virtualRequired`·`placeholder`를 처리). `computed`와 `&` 접두 키는 CONTROLS-049의 이주 항목이고, 이주 진단을 넣으면 폼이 맨 키를 읽게 되어 원칙을 어기므로 넣지 않는다. 이주 안내는 README 1.0.0 이주 절(270C-01, 마무리 단계에 한 번에 씀)이 CONTROLS-049의 이주 항목 목록으로 적는다. 소유자 결정이 필요한 공개 동작 변경이 아니므로 대기열에 올리지 않는다.
- 근거: `ledger/controls.md` CONTROLS-001·CONTROLS-049·CONTROLS-078·CONTROLS-081; fairy08 `queue-51-codes.md` "Side finding"; `reviews/round-270-closing.md`(이주 절의 자리).
- 다음: 없음.

### 305C-04 배열 한도와 경계 문장의 문서는 정돈-E를 기다리지 않고 fairy08의 문서 전용 PR로 지금 고친다 — documents 데모의 `node.normalizedValue`도 같은 PR

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 304라운드가 "문서는 지금 고친다"고 정했고 fairy08의 문안(`errcodes/array-limits-sections.md` A–H)은 코드 이름에 기대지 않으므로 정돈-E(오류 코드 이름이 바뀜)와 묶을 이유가 없다. 217C-01의 문서 전용 허용에 따라 fairy08이 PR을 연다: SPECIFICATION en·ko(경계 단락은 Architecture 아래 새 절, ArrayNode 행, 배열 한도 새 절, 986·998행 예제, 1222행 nullable 문구), README en·ko(minItems 자동 채우기 절·prefixItems 문구·출력 필터 예제·Reset bullet), `docs/QUICK_REFERENCE.md:491`, docs/agents 셋(`troubleshooting.md:56`은 `push(data, true)` 우회와 Promise 반환을 말해 전부 틀림), documents 사이트 `core-concepts.mdx`·`examples/array-output-filters.mdx` en·ko. documents 데모 `ArrayOutputFiltersDemo.tsx:77,117`과 페이지 17행의 `node.normalizedValue`는 새 엔진에 없는 이름이라 "방출 값" 칸이 비는 문서 사이트 결함이므로 같은 PR에서 현재 공개 API로 바꾸되 그 이름 교체 외의 동작 변경은 넣지 않는다. 옵션과 UI 전용 빈 슬롯은 적지 않고(정돈-S는 PR이 병합된 뒤 문서화), `MOBILE_PERFORMANCE_REPORT`는 옛 엔진 측정 보고서라 손대지 않는다. 게이트는 `@albatrion/documents` build와 정돈-2와의 충돌 없음이며 원장 관리자가 병합한다.
- 근거: `reviews/round-304-owner-answers.md:7`; fairy08 `errcodes/array-limits-sections.md`(2026-10-14); `plan/tidy-structure/array-limits-review.md` §5 4항.
- 다음: fairy08에게 PR 개설을 지시한다(이 라운드에서 보냄). 병합 뒤 정돈-E 브리프의 "문서 절은 fairy08 문안" 중 배열 한도 부분은 끝난 것으로 표시한다.
