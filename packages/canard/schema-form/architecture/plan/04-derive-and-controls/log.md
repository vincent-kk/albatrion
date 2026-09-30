# 04 파생 + 상태 키·제어 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-09-30). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md)(작성 전), 게이트 원장은 `.seiri/tasks/schema-form-04-derive-and-controls/gates.md`(작성 전).

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 머리

- 선출 이유: 03 PR #350이 실제로 머지되어(`0705217d5`, 2026-09-30 13:30Z) 04·05·06의 의존이 풀렸다. 05는 D-1(EVENT-073)이 열려 있어 막혔고, 04·06 가운데 단계 순서가 앞서며 03이 넘긴 사례(03 `log.md` §4의 2·3·9·13–17행)가 가장 많이 모인 04를 골랐다. 소유자가 04 착수를 승인했고 D-1은 05 착수 때 다시 올린다(2026-09-30).
- 브랜치 `feat/schema-form-derive-and-controls`, base와 PR base `1.0.0-beta`(`0705217d5`).
- 원장 질의는 원장 관리 세션 `albatrion-79`로 보낸다(소유자 지시, 2026-09-30).
- 착수 전 확인(`request.md`): LANDING-063의 셋은 18C-50(SETTLE-043)·18C-51(FRAGMENT-050)이 닫음, `controls.children` 세부는 CONTROLS-073, 게이트는 03의 술어 대역을 그대로 씀(`if` 가드 컴파일은 05). 막는 소유자 결정 없음.

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/04-derive-and-controls/request.md` | `0705217d5` | `3bcda77ab9b7f546` |
| `plan/04-derive-and-controls/adr-and-axes.md` | `0705217d5` | `afffad6fdb651d97` |
| `plan/04-derive-and-controls/verification.md` | `0705217d5` | `80bccee545e9a19e` |
| `ledger/*.md` | `0705217d5` | 커밋으로 고정 |
| 03에서 넘어온 사례 | `plan/03-node-and-settle/log.md` §4 @ `0705217d5` | 커밋으로 고정 |

- 목표: 정착 루프의 계산 단계를 완결한다 — 파생 `settle/derive/`(`controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록; LANDING-063·083)과 상태 키·제어(결합 OR/AND, `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식 값·하위 트리 정책, 겉면 계산 게터 넷; LANDING-066·086).
- 비목표: `if`의 가드 컴파일·평가(05), 통지·`batch`·배달(05), 배열 행(06), 렌더 계층의 전체 잠금과 공개 전환(07), 옛 `InjectionGuardManager` 재진입 가드의 재구성.
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인". 03이 넘긴 이식 사례는 03 `log.md` §4.

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-09-30 | 착수 | 상황판 03 → 머지, 04 → 진행. 이 기록 작성 | 이 커밋 |

## 3. 다음 행동

- 원장 항목 직접 읽기(색인과 03 §4의 넘김) → seiri `write-plan`으로 `execution-plan.md` → 독립 `review-plan` → `cleared` 뒤 실행.
- 이 세션의 커밋은 경로를 지정한 `git add`만 쓴다(원장 세션의 미커밋 변경과 섞지 않음).

## 4. 원장·계획서 어긋남

- 없음(작성 시점).
