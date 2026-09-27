# PLAN — `@canard/schema-form` 1.0.0-beta 진행 상황판

> 이 문서가 개발의 **단일 진입점**이다. 어느 계획이 있고(§1), 어떻게 수행하며(§2), 어디까지 왔고(§3), 다음에 무엇을 하는지(§4)를 여기서만 갱신한다. 정본은 원장 `ledger/`(설계)와 `plan/<순서>-<이름>/`(단계 계획)이며, 이 문서는 그 위의 상황판이다. 세션 인수인계는 `HANDOFF.md`, 우산 구조·절차의 설명은 `plan/README.md`가 든다.
>
> 갱신 규칙: PR을 열 때·머지할 때·소유자 결정이 나올 때 §3의 상태와 §5의 기록을 같은 커밋에서 고친다. 상태 낱말은 넷뿐이다 — `대기`, `진행`, `리뷰`, `머지`.

## 1. 계획 — 링크

우산: PR [#344](https://github.com/vincent-kk/albatrion/pull/344) (`1.0.0-beta` → `master`, 초안). 자식 PR은 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다(LANDING-204).

| 순서 | 계획 | 개발요청서 | 검증 구성요건 | ADR과 핵심 축 | 원장 단계 | 의존 |
| --- | --- | --- | --- | --- | --- | --- |
| 00 | 설계 원장·개발계획 | — | — | — | PR-0 문서 부분(LANDING-060) | — |
| 01 | 설계문서 | [request](plan/01-design-docs/request.md) | [verification](plan/01-design-docs/verification.md) | [adr-and-axes](plan/01-design-docs/adr-and-axes.md) | PR-0 문서 부분의 잔여 | 없음 |
| 02 | 기반 + 청사진 | [request](plan/02-foundation-and-blueprint/request.md) | [verification](plan/02-foundation-and-blueprint/verification.md) | [adr-and-axes](plan/02-foundation-and-blueprint/adr-and-axes.md) | PR-0 코드 + PR-1 | 없음 |
| 03 | 노드 트리·정착 | [request](plan/03-node-and-settle/request.md) | [verification](plan/03-node-and-settle/verification.md) | [adr-and-axes](plan/03-node-and-settle/adr-and-axes.md) | PR-2 | 02 |
| 04 | 파생 + 상태 키·제어 | [request](plan/04-derive-and-controls/request.md) | [verification](plan/04-derive-and-controls/verification.md) | [adr-and-axes](plan/04-derive-and-controls/adr-and-axes.md) | PR-3 + PR-6 | 03 |
| 05 | 통지·검증(ajv 셋 포함) | [request](plan/05-dispatch-and-validation/request.md) | [verification](plan/05-dispatch-and-validation/verification.md) | [adr-and-axes](plan/05-dispatch-and-validation/adr-and-axes.md) | PR-4 | 03 |
| 06 | 배열 | [request](plan/06-array/request.md) | [verification](plan/06-array/verification.md) | [adr-and-axes](plan/06-array/adr-and-axes.md) | PR-5 | 03 |
| 07 | 전환(원샷, 레거시 보존) | [request](plan/07-switch/request.md) | [verification](plan/07-switch/verification.md) | [adr-and-axes](plan/07-switch/adr-and-axes.md) | PR-7 | 02–06 |
| 08 | 플러그인(UI 넷) | [request](plan/08-plugins/request.md) | [verification](plan/08-plugins/verification.md) | [adr-and-axes](plan/08-plugins/adr-and-axes.md) | LANDING-206 | 07 |
| 09 | 정리·릴리스(레거시 삭제) | [request](plan/09-release-and-cleanup/request.md) | [verification](plan/09-release-and-cleanup/verification.md) | [adr-and-axes](plan/09-release-and-cleanup/adr-and-axes.md) | PR-8 | 08, 별도 |
| 별도 | 릴리스 전환(`master` 직접) | [request](plan/release-transition/request.md) | [verification](plan/release-transition/verification.md) | [adr-and-axes](plan/release-transition/adr-and-axes.md) | LANDING-097 | 없음 |

04·05·06은 서로 병렬이다. 구조와 순서의 까닭은 [plan/README.md](plan/README.md).

## 2. 수행 방법 — 한 PR의 순서

1. **읽기.** 그 디렉토리의 문서 셋을 순서대로 읽는다: `request.md`(무엇을, 어디까지) → `adr-and-axes.md`(무엇을 지키며) → `verification.md`(무엇으로 끝났다고 하는가). 원장 항목은 `ledger/<area>.md`에서 `### AREA-nnn`으로 찾는다. 계획서와 원장이 다르면 원장이 이긴다.
2. **착수 전 확인.** `request.md`의 "착수 전 확인"을 닫는다. 소유자 결정이 남아 있으면 권장안을 올리고 답을 받은 뒤 원장에 기록한다(소유자 답 → `reviews/round-18-owner-answers.md` 행 → 원장 항목).
3. **브랜치.** `1.0.0-beta`에서 `request.md`의 제안 이름으로 딴다. 이 문서 §3의 상태를 `진행`으로 고치고 §5에 한 줄 적는다(같은 브랜치의 첫 커밋).
4. **문서가 코드보다 먼저(filid).** 새 fractal의 `INTENT.md`·`DETAIL.md`를 먼저 커밋한다. 형제 fractal은 진입점으로만 건너고, organ은 소유자 하위 트리 안에서만 직접 가져온다.
5. **구현(seiri).** 저장소 `seiri_*` 규칙을 따른다. 한 세션이 설계하고 worker가 적용, verifier가 게이트를 대조한다. 04·05·06은 세션을 나눠 병렬로 진행할 수 있다.
6. **검증.** `verification.md`의 게이트를 모두 통과한다. 옛 시험 전체 초록(07 전까지), 새 시험, 벤치 행, `tsc --strict`, filid 스캔, seiri 게이트. 결과 파일은 PR 본문에 첨부한다.
7. **교차 확인.** codex·antigravity에 "원장 대 구현" 대조 한 번. 지적은 검증자가 거른 뒤 반영한다.
8. **PR.** base `1.0.0-beta`. 본문에는 `request.md`의 완료 기준과 `verification.md`의 리뷰 체크리스트를 그대로 옮겨 하나씩 닫고, 원장과 어긋난 발견은 ID와 함께 적는다. 이 문서 §3을 `리뷰`로.
9. **머지.** merge commit. 이 문서 §3을 `머지`로, §4의 다음 할 일을 갱신, §5에 기록. 원장이 틀렸음이 드러났으면 새 라운드 항목으로 기록한다(옛 글은 자라기만 한다).

원장 검사(`HANDOFF.md` §4)는 원장이나 계획서를 고친 PR마다 다시 돌린다.

## 3. 진행 상황

| 순서 | 계획 | 상태 | PR | 비고 |
| --- | --- | --- | --- | --- |
| 우산 | `1.0.0-beta` → `master` | 진행 | [#344](https://github.com/vincent-kk/albatrion/pull/344) | 초안. 09 머지 뒤 `master`로 |
| 00 | 설계 원장·개발계획 | 머지 | [#345](https://github.com/vincent-kk/albatrion/pull/345), [#346](https://github.com/vincent-kk/albatrion/pull/346) | 원장 1,336항목·검사 0, 계획서 디렉토리 열 개 |
| 01 | 설계문서 | 대기 | — | 02와 병렬. `design/` 8편·ADR·`doc-coverage`·`_archive/`·절 단위 통과 |
| 02 | 기반 + 청사진 | 대기 | — | 첫 개발 PR. 착수 전 확인 없음 |
| 03 | 노드 트리·정착 | 대기 | — | 02 뒤 |
| 04 | 파생 + 상태 키·제어 | 대기 | — | 03 뒤, 05·06과 병렬 |
| 05 | 통지·검증 | 대기 | — | 03 뒤. **착수 전 소유자 결정**: 명령 메서드 이름·명령 종류 값의 형·`FormHandle` 대칭(EVENT-073) |
| 06 | 배열 | 대기 | — | 03 뒤, 04·05와 병렬 |
| 07 | 전환 | 대기 | — | 02–06 전부 머지 뒤. 원샷 |
| 08 | 플러그인 | 대기 | — | 07 뒤 |
| 09 | 정리·릴리스 | 대기 | — | 08과 릴리스 전환 PR 뒤. 머지되면 우산을 `master`로 |
| 별도 | 릴리스 전환 | 대기 | — | 시점은 소유자가 정한다(LANDING-204) |

### 열린 소유자 결정

| 번호 | 물음 | 막는 것 | 어디에 기록 |
| --- | --- | --- | --- |
| D-1 | 명령 메서드의 이름(`action`·`interaction`·`request` 또는 명령 한정 `publish`), 명령 종류 값의 형(공개 열거 또는 문자열 리터럴), `FormHandle` 대칭 모양 | 05 착수 | EVENT-073 보충, `reviews/round-18-owner-answers.md` 새 행 |
| D-2 | 릴리스 전환 PR을 여는 시점 | 09 착수 | LANDING-204 보충 |

## 4. 다음 할 일

1. **02 기반 + 청사진 착수** — `1.0.0-beta`에서 `feat/schema-form-foundation-blueprint`. 첫 일은 옛 엔진 벤치 기준선 고정과 vitest `test.projects` 셋, 그다음 시나리오 패키지 뼈대와 프로토타입 v7, 그다음 `src/core/blueprint/`의 INTENT·DETAIL.
2. **01 설계문서 착수(02와 병렬)** — `docs/schema-form-design-docs`. `design/02-node-and-value.md`부터(의존이 큰 것부터: 02 → 01 → 03 → 05 → 04 → 06 → 07 → 00).
3. **D-1 권장안** — 05 착수 전에 올린다. 권장은 `request(kind, payload?)` 하나에 명령 종류를 문자열 리터럴 합집합 `'focus' | 'select' | 'refresh' | 'remount'`로, `FormHandle`은 같은 모양 `request(path, kind, payload?)` 하나로 합치는 것(겉면 수 약 57 → 약 54). 소유자가 정한다.
4. 02 머지 뒤 03. 03 머지 뒤 04·05·06 병렬.

## 5. 기록

| 날짜 | 무엇 | 어디 |
| --- | --- | --- |
| 2026-09-26 | 18라운드 봉인, 최종 정합성 점검 닫힘 | 커밋 `9f6d21306`·`75b277a56`, `reviews/raw-round18-final-check.md` |
| 2026-09-27 | 소유자 설계서 검토 메모 넷(38–41행) 원장 반영 | `d2ed8976a`, BLUEPRINT-046·047, EVENT-073, SURFACE-061 |
| 2026-09-27 | 우산 브랜치 `1.0.0-beta`와 우산 PR #344, 설계 PR #345 | `19a249101` |
| 2026-09-27 | 설계 PR #345 머지 | `1.0.0-beta` |
| 2026-09-27 | 소유자 개발계획 결정(42–46행) 원장 반영, 계획서 PR별 디렉토리 재구성, 계획 PR #346 | `8911a28c2`, LANDING-204·205·206, PROCESS-067 |
| 2026-09-27 | 계획 PR #346 머지. 이 상황판 작성 | `1.0.0-beta` |
