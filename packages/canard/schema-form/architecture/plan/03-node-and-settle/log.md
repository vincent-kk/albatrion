# 03 노드 트리와 정착 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 오케스트레이터 실행 요청(2026-09-29). 단위마다의 단계·명령·기대 결과는 seiri `write-plan`의 불변식으로 채운다. 실행 계획은 [execution-plan.md](execution-plan.md), 게이트 원장은 `.seiri/tasks/schema-form-03-node-and-settle/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다. 원장과 계획서는 고치지 않는다.

## 0. 머리

- 선출 이유: `PLAN.md` §3에서 `진행`인 단계가 없고, 보정 PR #349가 실제로 머지되어(`85e7d01af`, 2026-09-29 10:28Z) §4 다음 할 일의 첫 실행 가능 단계가 03이 됐다. 01 절 단위 통과는 소유자의 일이고, D-1은 05만 막는다. 소유자가 03 착수를 승인했다(2026-09-29).
- 브랜치 `feat/schema-form-node-and-settle`, base와 PR base `1.0.0-beta`(`85e7d01af`).
- 원장 질의는 원장 관리 세션 `albatrion-f8`로 보낸다(소유자 지시, 2026-09-29).
- 착수 전 확인(`request.md`): LANDING-062의 안건과 노드 구조는 18라운드가 닫음, 명령 메서드(EVENT-073)는 05 몫이라 겉면 시험은 그 자리를 비움. 막는 소유자 결정 없음.

## 1. 최초 작업 기준선

| 원문 | 리비전 | sha256(앞 16자) |
| --- | --- | --- |
| `plan/03-node-and-settle/request.md` | `85e7d01af` | `74356a3a34c48bec` |
| `plan/03-node-and-settle/adr-and-axes.md` | `85e7d01af` | `d5eb4307d93b665a` |
| `plan/03-node-and-settle/verification.md` | `85e7d01af` | `d97ace6fbac1e3e9` |
| `ledger/*.md` | `85e7d01af` | 커밋으로 고정 |

- 목표: 상속 없는 단일 클래스 `SchemaNode`와 동작 행, `raw`·`extras` 둘뿐인 상태, 정착 루프(표시·계산·전이·커밋)와 예산·원본 B, `diagnostics`(LANDING-062).
- 비목표: 게이트 평가(스텁), 파생(04), 상태 키·제어(04), 통지·검증(05), 배열 행(06), 렌더·공개 전환(07), 명령 메서드(05, EVENT-073).
- 산출물·완료 기준·게이트: `request.md` "산출물과 완료 기준", `verification.md` 전체. 원장 ID 목록은 두 문서의 "원장 항목 색인".

## 2. 진행

| 날짜 | 단계 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-09-29 | 착수 | 브랜치 생성, `PLAN.md` §3 보정 행 `머지`·03 행 `진행`, 이 기록 | `a0be6cc07` |
| 2026-09-29 | U0 | scout 둘로 02 코드 계약(청사진 수출·형, 레거시 이동 선례, 하네스, 벤치, filid 설정)과 프로토타입 회귀 묶음을 조사. 실행 계획·구조 결정·게이트 원장 초안 | [execution-plan](execution-plan.md), [execution-adr](execution-adr.md) |
| 2026-09-29 | U0 | 원장 관리 세션 `albatrion-f8`에 해석 확인 Q1–Q6 송신(겉면 스텁, 동사 진입, 렌더 시나리오 게이트, 뒤 PR 기제를 쓰는 게이트, 게이트 평가와 L, 형 충돌 신호) | 회신 대기 |

| 2026-09-29 | U0 | 소유자 지시: "codex와 agy를 활발하게 사용하면서 claude 자체 토큰 소비량을 억제하렴. 멀티에이전트 관리를 해주길 바라." 구현은 codex, 대조·리뷰는 antigravity, 조율·판정은 이 세션으로 배정(실행 계획 §4 머리) | 이 커밋 |

| 2026-09-29 | U0 | 계획 리뷰 1차(verifier, `1bd021cb1` 기준) `rework-required`. 높음 둘: H1 겉면 스텁이 TEST-069 (나)·EVENT-073·raw-round17:74와 어긋남, H2 `controls.active` 스텁이 TEST-069 (가)·(나)·LANDING-062·25C-06과 어긋남. 중간 여덟(M1 U1 import 목록 불완전 — 상대 import 37+8+1곳, 별칭 9파일, `stories`·`bench` 4파일; M2 TEST-069 (가) 의무 누락; M3 청사진 L의 담당·시험 없음; M4 벤치 실행 불가와 옛 엔진 기준선 시점; M5 U3∥U4 의존; M6 게이트·추적표 불일치; M7 §6.1 배분 오류; M8 원장 세션과 같은 체크아웃). 낮음 아홉. 리뷰어가 원장 관리 세션이 작업 트리에 쓰는 26라운드(26C-01~05, Q1–Q6의 답)를 확인함 | 이 기록 |

| 2026-09-29 | U0 | 원장 관리 세션 회신과 26라운드 커밋(`a6af7f8a3`, `reviews/round-26-closing.md` 26C-01~05, 보충 줄 48, 검사 전부 0). 판정은 아래 줄마다 적는다 | `a6af7f8a3` |

- Q1(틀림, 26C-01): 멤버는 그 기제를 들여오는 PR에서 겉면에 들고, 그 PR이 DETAIL 목록·멤버 목록 시험·공개 형을 함께 고친다.
  - 이기는 원장: EVENT-063, LANDING-064·066, TEST-069 (나).
  - PR-2 겉면: `raw-round17-node-structure.md:74`의 PR-2 목록(식별·값 게터, `active`, `find`·`findNodes`, 가드, 생성, settle로 직접 위임하는 `setValue`)에 `raw`·`extras`·`diagnostics`·`SetValueOption`·`defaultValue`·`resetSubtree`를 더한 것.
  - 뒤 PR의 멤버: 명령 메서드·`subscribe`·`validate`·오류 읽기·외부 오류 설정은 PR-4, 배열 메서드는 PR-5, 계산 게터는 PR-6.
  - TEST-070의 "배열 멤버" 형 검사는 PR-5.
  - `verification.md:26`을 26C-01로 고친다.
- Q2(맞음): TEST-069 "PR-2에서 사슬은 settle 호출 하나다", LANDING-064. NODE-010 보충에 정본 줄을 붙임.
- Q3(맞음, 26C-02): 코어 러너로 잰다.
  - `FormHandle.reset()`은 루트의 폼 수준 로드, `resetSubtree()`는 그 노드의 로드다. 제출 거부는 TEST-069 (다)로 PR-7.
  - 고침: ERROR-204의 경고 중복 키 단언은 PR-4다(ERROR-032, LANDING-064). PR-2는 `diagnostics` 초기화만 단언한다.
- Q4(맞음, 26C-03): 제안대로 나눈다. 미룬 단언은 log와 PR 본문에 사례마다 PR 번호를 단다.
- Q5(판별·`if` 맞음, `controls.active` 틀림, 26C-04):
  - 노드·조각 게이트의 `controls.active` 식은 PR-2가 `BlueprintExpression.evaluate`로 호스트 바퀴에서 실제로 평가한다(TEST-069 (가), LANDING-062, WRITE-099).
  - L은 PR-2가 청사진에 계산과 칸을 더한다. 청사진 시험에 세 규칙 사례를 둔다: `#`·`(/)`는 루트, `/p`·`#/p`는 p의 자리, `@`는 세지 않음.
- Q6(맞음, 26C-05): `EffectiveSchema { schema, typeConflict }`가 최종 모양이다.
  - `cause:'sharedConflict'`(ERROR-133), 사슬 끝·모든 환경(ERROR-070), `degraded`는 폼 수준 로드까지.
  - 주의: 정적 선언 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜지는 경우(BLUEPRINT-044)는 `typeConflict`가 나르지 않는다. 정착이 켜진 선언 집합에서 따로 판정해 같은 코드로 낸다(26C-05).

## 3. 다음 행동

- 1차 리뷰 고침 명세(`plan-review.md`)와 26C를 codex가 계획에 반영 → antigravity 범위 한정 재리뷰 → 조율 세션 판정 → `cleared` 뒤 U1.
- 이 세션의 커밋은 경로를 지정한 `git add`만 쓴다(원장 세션의 미커밋 변경과 섞지 않음).

## 4. 원장·계획서 어긋남

| # | 자리 | 어긋남 | 원장 | 처리 |
| --- | --- | --- | --- | --- |
| 1 | TEST-069 (라)의 묶음 이름·수 | "`r8-port`(q8 108)"의 108은 `spikes/round9/r9.mjs`이고, "`r7-port`(52, E1–E13·X*)"의 52는 `r9b.mjs`의 검사 수다. `r7-port.mjs`·`r8-port.mjs`는 단언 없는 관찰 도구다 | TEST-069 | 파일 기준으로 가르고 (라)의 일반 규칙으로 몫을 정한다(실행 계획 I9, §6.1) |
| 2 | `selfcheck-v5` 무리 a의 주입 사용 다섯 | 원장은 무리 c의 주입 단언만 PR-3으로 보내지만, 무리 a에도 주입을 쓰는 단언 다섯이 있다(A4a·A4b·A4c·A4-cap·A6-automatic) | TEST-069 | (라) "건드리는 기제가 모두 있는 가장 이른 PR"대로 04로 넘긴다 |
| 3 | `r9.mjs` P4(상태 키 16) | 원장이 PR을 적지 않았다 | TEST-069 | 상태 키(`readOnly`·`disabled`·`visible`·`&children`)가 PR-6 기제이므로 (라)대로 04(PR-3 + PR-6)로 넘긴다 |
| 4 | SETTLE-045 "청사진이 … L로 옮긴다" | 02 청사진에 L 계산이 없다 | SETTLE-045 | 실행 계획 I6·구조 결정 D4, 원장 관리 세션 Q5 |
