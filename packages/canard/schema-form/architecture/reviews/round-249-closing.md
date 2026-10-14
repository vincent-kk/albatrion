# 249라운드 닫기 — PR #362(07b-2) squash 병합(1dbc1c1c9), 원격 07b-2 가지 삭제; #361 재기준과 07b-3 배분

2026-10-14. 소유자 248라운드 허가에 따라 원장 관리자가 #362를 squash 병합했다. feat/schema-form-switch의 새 tip은 1dbc1c1c9, 원격 feat/schema-form-07b-2는 지워졌다. fairy07에게 #361을 1dbc1c1c9 위로 재기준하고 새 이름으로 바꿔 push하라고 알렸고, fixy07에게 07b-3(244C-01: production-test implicit any 12건 수정, 최상위 FieldInput 두 파일 이동, 경로 문자열 /dynamic-object-formtype 치환) 브리프를 보냈다.

### 249C-01 #362 병합 확인과 다음 배분 — switch tip 1dbc1c1c9; #361은 재기준·새 이름 뒤 검증; 07b-3은 feat/schema-form-07b-3에서 production-test만

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 소유자 허가(248라운드)가 있었고 재검증 게이트가 모두 통과했으므로 병합했다. 남은 PR 둘은 서로 독립이라 동시에 진행한다.
- 근거: 248라운드 소유자 답; 246라운드 덧붙임(재검증); gh pr view 362(MERGED, merge 1dbc1c1c9).
- 다음: #361과 07b-3 보고를 받아 각각 검증하고 병합 허가를 묻는다. 둘 다 끝나면 정리 커맨드(대기열 15), #354 본문 갱신, 개선-38 문서 이름 갱신.

## 덧붙임 (2026-10-14, 07b-3 범위 하나 추가와 대기열 35)

fixy07 보고: implicit any 12건은 모두 CanardForm.ignoreAdditionalProperties.tsx의 최상위 FieldInput 아래 인라인 컴포넌트에서 나오므로(최상위 키는 형이 없어 매개변수가 any) presentation.FieldInput으로 옮기면 슬롯 형(C1)이 매개변수 형을 주어 244C-01의 1번과 2번이 같은 수정이 된다. 편집자 결정: production-test/src/assets/jsonSchema/oneOf.ts:34,76의 최상위 `inputType: "checkbox"`도 같은 커밋에서 presentation.inputType으로 옮긴다(같은 규칙). 두 페이지가 쓰는 옛 문법(`&if`, `terminal`)은 범위 밖이라 손대지 않고 대기열 35로 올린다.
