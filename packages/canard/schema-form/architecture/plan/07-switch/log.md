# 07 전환 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-02). 실행 계획은 [execution-plan.md](execution-plan.md), 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-switch/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 재개 지점

- 단계: 07 전환(PR-7). 선출 까닭: 02–06이 모두 머지되었고(06 `07a083c18`), 07보다 먼저 처리할 원장 작업이 없다(원장 관리자 착수 답 1). 08·최적화·09는 07 뒤, 릴리스 전환은 D-2에 막힘.
- 브랜치 `feat/schema-form-switch`, base `1.0.0-beta`(`93ff8d7bc`, 69라운드). 작업 자리는 워크트리 `.claude/worktrees/stage-07`(샌드박스가 쓰기를 막는 `.claude/commands/`·`.vscode/`는 이 워크트리에서만 sparse-checkout으로 뺌). PR: 아직 없음.
- seiri 작업 `schema-form-switch`(게이트 원장은 워크트리의 `.seiri/tasks/schema-form-switch/gates.md`), 워크플로우 단계: write-plan(리뷰 1차 반영) → review-plan(고친 범위 재확인).
- 다음 행동: U1(전환 직전 기준선). 계획 리뷰는 `cleared`(G1), Q16은 70C-01로 닫힘.

## 1. 최초 기준선

| 원문 | 커밋 | sha256 앞 12자 |
| --- | --- | --- |
| `plan/07-switch/request.md` | `ce7c2780c` | `2d18c8e8f6ec` |
| `plan/07-switch/adr-and-axes.md` | `ce7c2780c` | `3a0de74015f6` |
| `plan/07-switch/verification.md` | `85e7d01af` | `03921fe0fb80` |
| `reviews/round-68-closing.md` | `1ba284393` | `eb4076c56b01` |

목표·비목표·산출물·완료 기준·게이트는 `request.md`의 "산출물과 완료 기준"과 `verification.md`의 "게이트"를 그대로 쓰고, 실행 계획 §1이 단위와 증거에 잇는다. 구현에 맞춰 이 기준선을 다시 쓰지 않는다.

## 2. 진행

| 날짜 | 단위 | 무엇 | 근거 |
| --- | --- | --- | --- |
| 2026-10-02 | U0 | 원장 관리자에게 착수 확인 1–6과 물음 Q1–Q10을 보내 답을 받음(68C-01–10). 현재 코드·시험·원장 조사(서브에이전트 여섯). 실행 계획·ADR·게이트 원장 작성. Q11–Q15 송부 | `reviews/round-68-closing.md` |
| 2026-10-02 | U0 | 작업 공간 사고: 메인 체크아웃에서 07 브랜치를 만든 탓에 원장 관리자의 68·69라운드 커밋(`1ba284393`·`93ff8d7bc`)이 07 브랜치에 들어감. 소유자가 `1.0.0-beta`를 `93ff8d7bc`로 맞췄고, 07은 워크트리로 옮김. 07의 첫 커밋 `a44003ddd`는 `93ff8d7bc` 위 | 원장 관리자와의 교신 |
| 2026-10-02 | U0 | Q11–Q15 답(69C-01–05, 권장안대로) 반영. 계획 리뷰 1차 `rework-required`(F1–F10) 반영 | `reviews/round-69-closing.md`, 계획 §9 |

## 3. 자율 판단

실행 계획 §2.1의 "자율 결정" 행이 판단 기록이다(I1, I8, I9, I12, I22). Q11–Q15의 권장은 69라운드로 닫혀 "닫힘"이 되었다. 구현 중 바뀌면 여기에 날짜와 함께 적는다.

## 4. 원장·계획서·코드 어긋남

실행 계획 §2.2의 M1–M9를 옮긴다. 셈의 차이: `request.md:26`의 438건과 `ledger/test.md:421`의 447건은 계획서 시점의 수이고, 전환 직전 셈은 `src/__tests__` 47파일 444건, `src` 전체 `.test.tsx` 53파일 521건이다(68C-01). 옛 스토리는 오늘 49파일 33,545줄(TEST-025는 33,533줄).

| ID | 처리 상태 |
| --- | --- |
| M1–M4, M9 | 68라운드로 닫힘 |
| M5 | U2에서 고침 |
| M6 | 69C-03: PR-7의 일(코드와 원장의 어긋남), U4에서 고침 |
| M7 | 69C-04: 03·04의 결함, U4에서 별도 커밋으로 고침 |
| M8 | 69C-05: 결함이 아닌 빈자리, U4에서 미룸 선택을 더함 |

## 5. 스파이크 사례표(68C-09)

U1에서 채운다.

## 6. UI 플러그인 고친 줄(68C-07)

U12에서 채운다.
