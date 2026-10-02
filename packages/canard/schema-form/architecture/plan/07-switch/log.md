# 07 전환 — 실행 기록

Planning method: 저장소 지침 — `PLAN.md` §2와 `plan/prompts.md`의 단계 실행 절차, 소유자의 착수 승인(2026-10-02). 실행 계획은 [execution-plan.md](execution-plan.md), 구조 결정은 [execution-adr.md](execution-adr.md), 게이트 원장은 `.seiri/tasks/schema-form-switch/gates.md`.

정본의 순서: 원장 `ledger/<area>.md` > 계획서 `request.md`·`adr-and-axes.md`·`verification.md` > 실행 계획 > 이 기록. 이 기록이 원장과 다르면 원장대로 가고 §4에 적는다.

## 0. 재개 지점

- 단계: 07 전환(PR-7). 선출 까닭: 02–06이 모두 머지되었고(06 `07a083c18`), 07보다 먼저 처리할 원장 작업이 없다(원장 관리자 착수 답 1). 08·최적화·09는 07 뒤, 릴리스 전환은 D-2에 막힘.
- 브랜치 `feat/schema-form-switch`, base `1.0.0-beta`(착수 `78534356c`, 68라운드 `1ba284393`까지 빨리 감기). PR: 아직 없음.
- seiri 작업 `schema-form-switch`, 워크플로우 단계: write-plan → review-plan.
- 다음 행동: 계획 리뷰(G1). 원장 물음 Q11–Q15(69라운드)의 답을 받아 계획 §2.3과 U4에 반영.

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

## 3. 자율 판단

실행 계획 §2.1의 "자율 결정"·"권장" 행이 판단 기록이다(I1, I8, I9, I12, I22와 Q11–Q15 권장). 답이 오거나 구현 중 바뀌면 여기에 날짜와 함께 적는다.

## 4. 원장·계획서·코드 어긋남

실행 계획 §2.2의 M1–M9를 옮긴다. 셈의 차이: `request.md:26`의 438건과 `ledger/test.md:421`의 447건은 계획서 시점의 수이고, 전환 직전 셈은 `src/__tests__` 47파일 444건, `src` 전체 `.test.tsx` 53파일 521건이다(68C-01). 옛 스토리는 오늘 49파일 33,545줄(TEST-025는 33,533줄).

| ID | 처리 상태 |
| --- | --- |
| M1–M4, M9 | 68라운드로 닫힘 |
| M5 | U2에서 고침 |
| M6–M8 | Q13–Q15 답 대기 |

## 5. 스파이크 사례표(68C-09)

U1에서 채운다.

## 6. UI 플러그인 고친 줄(68C-07)

U12에서 채운다.
