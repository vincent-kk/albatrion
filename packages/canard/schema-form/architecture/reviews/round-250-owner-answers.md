# 250라운드 — Vincent의 답 (대기열 35 — production-test의 옛 문법을 지금 새 문법으로 다 바꾼다)

2026-10-14. 249라운드 덧붙임(production-test 두 화면이 지워진 옛 문법 `&if`·`terminal`을 아직 씀)에 소유자가 원장 세션에서 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 대기열 35 | 옛 문법을 새 문법으로 옮길지, 화면을 지울지 | "새 문법으로 다 바꿔야 하지 않을까?? 아무래도? 지금 바꾸는 중이니까" | 승인: production-test 패키지 전체의 지워진 옛 문법을 새 문법(controls 등)으로 옮긴다; 07b-3의 별도 커밋 |

250C-01(편집자 정리): fixy07이 production-test 전체에서 지워진 문법(`&if`·`&active`·`&visible` 등 `&` 접두 키, `terminal`, `computed`, 스키마 수준 `injectTo`, 최상위 `virtual`, 옛 `watch`)의 사용처를 먼저 목록으로 보고하고, 명세(docs/en/SPECIFICATION.md)의 새 문법으로 옮긴 뒤 화면별 렌더 전후 차이를 보고한다. 07b-3 안의 별도 커밋. 세 번째 파일 묶음(nullable·computed·if-then-else 자산)도 같은 범위.

다음 라운드 번호는 251이다.

## 덧붙임 (2026-10-14, 250C-01 대응표와 편집자 결정 둘)

fixy07의 사용처 목록(production-test: oneOf.ts `&if` 넷·`placeholder` 둘, if-then-else.ts·complex-if-then-else.ts `computed.active` 셋, CanardForm.computed.tsx `&active` 둘, CanardForm.nullable.tsx `computed.active` 열·`computed.if` 둘, CanardForm.ignoreAdditionalProperties.tsx `&if` 둘·`terminal: false` 둘, DynamicObjectFieldInputTest.tsx `terminal: false` 하나; `watch`·`virtual`·`injectTo` 없음). 대응표: `&active`·`computed.active` → `controls.active`; 분기의 `&if`·`computed.if` → 분기 객체의 `controls.active`(`controls.discriminator`는 루트 oneOf에만 맞아 쓰지 않음); 최상위 `terminal: false` → `options.terminal: false`(src/core/blueprint/utils/types/resolveNodeStrategy.ts:31,59가 읽음); 최상위 `placeholder` → `presentation.FieldInputProps.placeholder`. 편집자 결정: (1) `options.terminal`로 옮긴다 — 두 화면이 ChildNodeComponents를 써 비terminal이 의도. 그 키가 공개 형(ObjectSchema·ArraySchema options)에 없고 SPECIFICATION.md:600에 `terminal: true`로만 느슨히 적힌 것은 대기열 36. (2) 최상위 `placeholder` 둘도 같은 커밋에 포함(같은 종류).
