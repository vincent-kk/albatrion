# 05 통지와 검증 — 실행 계획 리뷰 기록

seiri `review-plan`의 판정과 지적. 리뷰어는 소유자 배정(2026-09-30)대로 antigravity(cennad 경유, 세션 `15dafbc0-6b23-4926-b13f-4bdac0502cc6`)다. 대상은 [execution-plan.md](execution-plan.md), [execution-adr.md](execution-adr.md), 게이트 원장 `.seiri/tasks/schema-form-dispatch-and-validation/gates.md`.

## 1차 — `rework-required` (HEAD `81649244f`)

| ID | 심각도 | 자리 | 지적 | 처리 |
| --- | --- | --- | --- | --- |
| F1 | 차단 | ADR D6, 계획 I13·U3·§7, G8 | 공개 `JSONSchemaError` 별칭을 PR-7 전에 지움 — LANDING-159 규칙 3, 옛 `<Form>` 형(`src/components/Form/type.ts:54,123,125`)과 플러그인 스토리 여섯 파일이 깨짐 | `ValidationIssue`를 내보내고 `export type { ValidationIssue as JSONSchemaError }`를 07까지 유지(34C-02가 원장으로 확인) |
| F2 | 차단 | G24 | 없는 디렉토리에 `! grep`이 종료 코드 2를 뒤집어 거짓 통과 | 부정 grep 게이트 여섯에 `test -d`/`test -f` 선행 |
| F3 | 차단 | U16, §7, G44–G51 | 06과의 머지 절차가 구체적이지 않음(`core/index.ts` 빠짐, 기준·방향·파일별 규칙·실행 게이트 없음) | U16a로 나눠 충돌 일곱 파일, `origin/1.0.0-beta`를 merge(rebase 없음), 파일별 규칙, 실행 게이트 G44, 33C-01 조건부 배열 진입 파일 G45·G46 |
| F4 | 비차단 | G46 | 제목은 린트를 말하나 CHECK에 없음 | 플러그인마다 `npx eslint` 추가(새 G47) |
| F5 | 비차단 | gates.md | 번호가 원장 순서와 어긋남 | G1–G54로 다시 매김 |

같은 수정에 원장 답 32C-01(공개 `validatorFactory` 속성은 PR-7, 새 계약 형은 공개 index 밖)·32C-02·33C-01·34C-01(플러그인 쪽 계약은 공개 `ValidatorPlugin`에 선택 멤버를 더하는 개정)·34C-02를 반영했다.

## 2차 — `cleared` (HEAD `07fbc5878`, 범위 한정 재확인)

- 지적 0. F1–F5의 해소와 32–34라운드 반영을 파일·줄로 확인(리뷰어의 말: "지적사항 0건 (결함 없음)").
- 리뷰어가 근거로 확인한 위험한 주장: D7(검증기 없음 → `if` 조각 꺼짐, 트리마다 경고 하나)은 ERROR-154·146–151과 맞음, D3의 `revision` 개명이 건드리는 시험 8파일(grep), D2·D8·D9·D10의 원장 대조, G2의 이동 0.

## 2차 뒤의 원장 답 반영 — 조율 세션의 근거 대조만(`grounded-only`)

35라운드의 원장 관리자 답 셋(Q9a 35C-07: 세 플러그인 모두 네이티브 `Error` 하위 클래스, 새 의존 없음; Q9b: `ValidatorPlugin`의 넷째 선택 멤버 `dialect?`와 방언 불일치 경고 ERROR-188; Q9c: 공개 `ValidateFunction`·`ValidatorFactory`는 07까지 그대로)과 06의 `ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)를 더했다. 원장이 정한 문장을 옮긴 범위 한정 변경이라 독립 재리뷰 없이 조율 세션이 계획의 해당 줄(I19·I26, ADR D6·D9)을 grep으로 대조했다. plan-links problems 0, 게이트 54개 파싱.
