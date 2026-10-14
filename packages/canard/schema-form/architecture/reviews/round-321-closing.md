# 321라운드 닫기 — 정돈-S PR #381 병합(a8277781f): 기본 배열 입력이 minItems만큼 빈 슬롯을 UI로만 그린다, core 불변

2026-10-14. fairy08이 codex 없이 정돈-S를 마쳐 PR #381(커밋 셋: 문서 → 실패-먼저 시험 → 구현)을 열었고, 원장 관리자가 확인 뒤 스쿼시 병합했다.

### 321C-01 #381을 병합한다 — 304라운드 결정의 UX 쪽 집행, 값은 쓰지 않음

- 닫는 항목: LANDING-210(보충), WRITE-003(보충)
- 결정:
  - 【추론】 확인: `src/core/` 변경 0, 세션·공동 저자 줄 0, 공개 표면 불변; 슬롯은 `push`·`setValue`를 부르지 않고 사용자가 입력할 때 그 입력의 onChange(입력 기원 쓰기)로만 값이 들어가며(`fillArraySlot`은 그 자리까지의 배열을 만들고 앞의 빈 자리는 undefined로 남김 — 기존 명시적 슬롯 의미와 같음), 게이트로 minItems가 바뀌면 슬롯 수가 따라간다; 슬롯의 컨트롤은 자리 스키마를 따르고(string·number·integer·boolean, 그 밖은 "fill item" 버튼); 첫 시도의 `node.setValue`가 배열 입력을 다시 마운트해 포커스·행 identity를 잃는 것을 시험이 막는다. 문서(fieldInputs DETAIL, SPECIFICATION Array Limits en·ko, README 둘, agents 지식 둘)는 코드보다 먼저. 게이트는 typecheck·lint·관련 시험 1064·배열 스토리 4(310라운드대로 전체는 돌리지 않음). 병합 결과 1.0.0-beta는 a8277781f. 정돈-S의 보조 파일 셋과 시험은 구조-4에서 FieldInputArray fractal 안으로 옮긴다.
- 근거: PR #381(fairy08 보고, 2026-10-14); `reviews/round-304-owner-answers.md:7`; `plan/tidy-structure/array-limits-review.md` §5 2항.
- 다음: 없음.
