# 37라운드 닫기 — 06의 원장 해석 하나: 가지 배열에서 `omitTrailing`이 자르는 것

2026-10-01. 06 작업자(브랜치 `feat/schema-form-array`)가 가지 배열의 `omitTrailing` 투영이 정확히 무엇을 자르는지 물었다. VALUE-034의 문장("이렇게 채운 자리를 자른다")과 PR-5로 넘어온 프로토타입 기대값(`spikes/round9/regress/selfcheck-v5.mjs:516-519`의 `['a', null, null]` → `['a']`, `spikes/round18/proto/__tests__/rootOutput.test.mjs:30-38`의 `[undefined, 'x', undefined]` → `[null, 'x']`)에서 유도되므로 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 37C-01 `omitTrailing`은 가지 배열 방출의 꼬리에서 "빈 자리"의 최대 연속 구간을 자른다 — 빈 자리는 방출 없는 아이템의 채움(`{}`·`[]`·`null`)과 `null`을 방출한 잎 아이템, 청사진 없는 자리의 `undefined`·`null`이며, 실제 `{}`·`[]`를 방출한 아이템은 자르지 않고 원본은 건드리지 않는다

- 닫는 항목: VALUE-034(보충), TEST-018(보충), GOAL-073(보충)
- 결정:
  - 【추론】 `omitTrailing`은 가지 배열의 방출 배열 꼬리에서 빈 자리의 최대 연속 구간을 자르는 투영이며, 빈 자리는 셋이다: (1) 방출이 없는 아이템의 자리를 VALUE-034대로 채운 값(객체 `{}`, 배열 `[]`, 잎 `null`), (2) 잎 아이템이 실제로 `null`을 방출한 자리(방출 배열에서 (1)의 잎과 구별되지 않고, PR-5로 넘어온 프로토타입 기대 `['a', null, null]` → `['a']`가 이것을 자른다), (3) 청사진이 없는 자리(`extras`)의 값이 `undefined` 또는 `null`인 자리.
  - 【추론】 `omitEmpty`를 끈 객체·배열 아이템이 실제로 방출한 `{}`·`[]`는 빈 자리가 아니라 자르지 않으며(VALUE-034 "`omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다"; 프로토타입 `[{}, { a: 1 }, {}]`가 그대로 남는다), 앞과 가운데의 빈 자리는 색인을 지키기 위해 남긴다(레거시 `omitTrailingArray`의 주석과 같은 까닭, `[undefined, 'x', undefined]` → `[null, 'x']`); 원본 `raw`·상태·스냅숏은 바뀌지 않는다(GOAL P4, VALUE-034 "이 투영은 원본과 상태를 바꾸지 않는다").
  - 【추론】 터미널 배열은 아이템 노드가 없으므로 (3)의 규칙만으로 꼬리의 `undefined`·`null`을 자른다(35C-12); CONTROLS-080대로 식이 읽는 길이는 잘린 방출 배열의 길이다.
- 근거: VALUE-034 "배열 아이템은 자리가 색인이므로 빠지지 않는다: 방출이 없는 객체 아이템은 `{}`, 배열 아이템은 `[]`, 잎 아이템은 `null`로 그 자리를 채운다(VALIDATE-007: 방출은 JSON 왕복과 같고 배열 중간의 `undefined`는 없다).", "`omitTrailing`은 배열 꼬리에서 이렇게 채운 자리를 자른다.", "`omitEmpty`를 끈 호스트는 `{}`·`[]`를 방출한다.", "이 투영은 원본과 상태를 바꾸지 않는다(P3, P4)."; CONTROLS-080 "방출 값이므로 `omitTrailing`이 뺀 꼬리 아이템은 길이에 들지 않는다."; `spikes/round9/regress/selfcheck-v5.mjs:519` "C2-load omitTrailing: raw keeps [a,null,null], emit [a]"; `spikes/round18/proto/__tests__/rootOutput.test.mjs:30-38`; 레거시 `src/__legacy__/core/nodes/ArrayNode/utils/omitTrailingArray/omitTrailingArray.ts` "Leading and middle `undefined` items are preserved — removing them would shift indices".
