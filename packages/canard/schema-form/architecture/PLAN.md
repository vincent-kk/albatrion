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

1. **읽기.** 그 디렉토리의 문서 셋을 순서대로 읽는다: `request.md`(무엇을, 어디까지) → `adr-and-axes.md`(무엇을 지키며) → `verification.md`(무엇으로 끝났다고 하는가). 원장 항목은 `ledger/<area>.md`에서 `### AREA-nnn`으로 찾는다. **계획서는 안내이고 원장 항목이 명세다.** 구현자는 계획서가 인용한 원장 항목(본문과 "원장 항목 색인")을 원장에서 직접 읽고, 계획서의 문장은 그 항목을 찾는 길잡이로만 쓴다. 계획서와 원장이 다르면 원장대로 가고, 어긋남은 멈출 일이 아니라 단계 `log.md`와 PR 본문에 ID와 함께 적을 일이다. 멈추는 것은 원장의 현행 항목 둘이 서로 어긋나거나 원장이 틀렸다고 판단될 때뿐이다.
2. **착수 전 확인.** `request.md`의 "착수 전 확인"을 닫는다. 소유자 결정이 남아 있으면 권장안을 올리고 답을 받은 뒤 원장에 기록한다(소유자 답 → `reviews/round-18-owner-answers.md` 행 → 원장 항목).
3. **브랜치.** `1.0.0-beta`에서 `request.md`의 제안 이름으로 딴다. 이 문서 §3의 상태를 `진행`으로 고치고 §5에 한 줄 적는다(같은 브랜치의 첫 커밋).
4. **문서가 코드보다 먼저(filid).** 새 fractal의 `INTENT.md`·`DETAIL.md`를 먼저 커밋한다. 형제 fractal은 진입점으로만 건너고, organ은 소유자 하위 트리 안에서만 직접 가져온다.
5. **구현(seiri).** 저장소 `seiri_*` 규칙을 따른다. 한 세션이 설계하고 worker가 적용, verifier가 게이트를 대조한다. 04·05·06은 세션을 나눠 병렬로 진행할 수 있다.
6. **검증.** `verification.md`의 게이트를 모두 통과한다. 옛 시험 전체 초록(07 전까지), 새 시험, 벤치 행, `tsc --strict`, filid 스캔, seiri 게이트. 결과 파일은 PR 본문에 첨부한다.
7. **교차 확인.** codex·antigravity에 "원장 대 구현" 대조 한 번. 지적은 검증자가 거른 뒤 반영한다.
8. **PR.** base `1.0.0-beta`. 본문에는 `request.md`의 완료 기준과 `verification.md`의 리뷰 체크리스트를 그대로 옮겨 하나씩 닫고, 원장과 어긋난 발견은 ID와 함께 적는다. 이 문서 §3을 `리뷰`로.
9. **머지.** merge commit. 이 문서 §3을 `머지`로, §4의 다음 할 일을 갱신, §5에 기록. 원장이 틀렸음이 드러났으면 새 라운드 항목으로 기록한다(옛 글은 자라기만 한다).

원장 검사(`HANDOFF.md` §4)는 원장이나 계획서를 고친 PR마다 다시 돌린다.

세션을 여는 프롬프트는 [plan/prompts.md](plan/prompts.md)에 둘이 있다: 여러 단계를 이어 관리하는 오케스트레이터와, 단계 하나를 끝까지 구현하는 단계 실행. 둘 다 위 순서와 "계획서는 안내, 원장이 명세" 규칙을 같은 말로 든다.

## 3. 진행 상황

| 순서 | 계획 | 상태 | PR | 비고 |
| --- | --- | --- | --- | --- |
| 우산 | `1.0.0-beta` → `master` | 진행 | [#344](https://github.com/vincent-kk/albatrion/pull/344) | 초안. 09 머지 뒤 `master`로 |
| 00 | 설계 원장·개발계획 | 머지 | [#345](https://github.com/vincent-kk/albatrion/pull/345), [#346](https://github.com/vincent-kk/albatrion/pull/346) | 원장 1,336항목·검사 0, 계획서 디렉토리 열 개 |
| 01 | 설계문서 | 머지(절 통과 대기) | [#348](https://github.com/vincent-kk/albatrion/pull/348) | 설계문서 8편(`design/`)과 ADR 0001–0017(`adr/`), 옛 문서는 `_archive/2026-09-29/`. 2026-09-29 머지. 소유자 절 단위 통과는 머지된 문서 위에서 머리 표의 행을 `대기` → `통과`로 바꾸는 후속 커밋으로 받는다(25C-09, PROCESS-062). 02가 먼저 머지되어 생긴 틈 16건은 25라운드와 보정 PR이 닫는다([realign](plan/01-design-docs/realign.md)). 실행 계획과 기록은 [log](plan/01-design-docs/log.md) |
| 02 | 기반 + 청사진 | 머지 | [#347](https://github.com/vincent-kk/albatrion/pull/347) | 전체 4,437시험·lint·strict·빌드 통과. 19라운드 원장 해소와 TEST-079 반영, 내부 Codex 대조 완료. Filid 잔여 발견은 기록했고 Antigravity 외부 확인은 자동 승인 검토가 거절함 |
| 보정 | 01·02 보정 | 머지 | [#349](https://github.com/vincent-kk/albatrion/pull/349) | 브랜치 `fix/schema-form-realign-01-02`. 25라운드(`reviews/round-25-closing.md`)대로 청사진 코드·시험과 설계문서를 맞춤. 2026-09-29 머지(`85e7d01af`). [realign](plan/01-design-docs/realign.md) |
| 03 | 노드 트리·정착 | 진행 | — | 브랜치 `feat/schema-form-node-and-settle`. 실행 계획과 기록은 [log](plan/03-node-and-settle/log.md) |
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

1. **03 노드 트리·정착** — 브랜치 `feat/schema-form-node-and-settle`에서 진행 중. 보정에서 넘어온 것은 `plan/03-node-and-settle/request.md`의 "02·01 보정에서 넘어온 것" 절. 03 머지 뒤 04·05·06 병렬. 기록은 [log](plan/03-node-and-settle/log.md).
2. **01 절 단위 통과** — 머지된 설계문서 여덟 편(192절)을 소유자가 절 단위로 통과시키고 문서 머리의 표에 날짜를 적는다(25C-09). 통과 중 나온 새 결정은 원장에 새 라운드 항목으로 먼저 들어가고 문서가 따라간다(`plan/01-design-docs/verification.md`).
3. **D-1 권장안** — 05 착수 전에 올린다. 권장은 `request(kind, payload?)` 하나에 명령 종류를 문자열 리터럴 합집합 `'focus' | 'select' | 'refresh' | 'remount'`로, `FormHandle`은 같은 모양 `request(path, kind, payload?)` 하나로 합치는 것(겉면 수 약 57 → 약 54). 소유자가 정한다.

## 5. 기록

| 날짜 | 무엇 | 어디 |
| --- | --- | --- |
| 2026-09-26 | 18라운드 봉인, 최종 정합성 점검 닫힘 | 커밋 `9f6d21306`·`75b277a56`, `reviews/raw-round18-final-check.md` |
| 2026-09-27 | 소유자 설계서 검토 메모 넷(38–41행) 원장 반영 | `d2ed8976a`, BLUEPRINT-046·047, EVENT-073, SURFACE-061 |
| 2026-09-27 | 우산 브랜치 `1.0.0-beta`와 우산 PR #344, 설계 PR #345 | `19a249101` |
| 2026-09-27 | 설계 PR #345 머지 | `1.0.0-beta` |
| 2026-09-27 | 소유자 개발계획 결정(42–46행) 원장 반영, 계획서 PR별 디렉토리 재구성, 계획 PR #346 | `8911a28c2`, LANDING-204·205·206, PROCESS-067 |
| 2026-09-27 | 계획 PR #346 머지. 이 상황판 작성 | `1.0.0-beta` |
| 2026-09-27 | 02 첫 실행이 찾은 어긋남 셋 고침 — LANDING-061에 정적 `injectTo` 오류 없음의 충돌 줄, 02 계획서의 빈 루트 방출·changeset 문구, 검증 명령을 패키지 단위로 | `1.0.0-beta` |
| 2026-09-27 | 계획서 32편을 원장과 전수 대조(검증자 셋)하고 원장 내부의 18라운드 충돌 줄 누락을 감사. 계획서의 요약이 원장을 잃은 문장을 원장 원문 인용으로 바꾸고, 원장 항목 스물 남짓에 충돌·보충 줄을 더함. §2에 "계획서는 안내, 원장이 명세" 규칙 추가, 07·08의 이름 이주 배정을 원장(LANDING-067·206)대로 | `1.0.0-beta` |
| 2026-09-27 | 오케스트레이터·단계 실행 프롬프트 둘을 `plan/prompts.md`에 둠 — codex·antigravity 위임, 어긋남은 원장 조회로 해소하고 멈추지 않음 | `1.0.0-beta` |
| 2026-09-27 | 02 기반 + 청사진 착수 승인. 옛 엔진 기준선 고정부터 시작하며 문서 선행 커밋·worker 구현·verifier 대조로 진행 | `feat/schema-form-foundation-blueprint` |
| 2026-09-27 | 소유자 교정: merge를 독립 FCA·두 재귀·배열 전략 일회 판정으로 재구성. common-utils는 0.15.0으로 복구하고 changeset에 기록. 진단 상수의 내부 이름을 PascalCase로 통일한 뒤 02 완료까지 재개 승인 | `f09033cf`, `071cc8bf`, `3a9dd775` |
| 2026-09-27 | 19라운드 — 02 검증이 찾은 원장 충돌(TEST-067(b) 대 BLUEPRINT-039·045 E16)을 소유자 답 둘로 닫음: 형 없는 객체·배열 분기는 variant 호스트로 추정, `type` 없이 `const`·`enum`만 있는 칸은 리터럴 종류의 잎. 초안을 verifier·codex·antigravity가 대조해 결함을 고친 뒤 채택. 새 항목 BLUEPRINT-048~051, NODE-059, LANDING-207·208, TEST-079 | `feat/schema-form-foundation-blueprint`, `reviews/round-19-closing.md`, `reviews/round-19-owner-answers.md`, `reviews/raw-round19-typeless-object-host/` |
| 2026-09-27 | 02 전체 4,393시험·lint·strict·빌드 통과 및 seiri 보조 함수 보완. merge의 벤치 전용 getter 최적화를 철회하고 실제 ESM·CJS 산출물 8회 비교로 교정. CJS 배열 -0.0112%와 신뢰구간 미확정은 소유자가 측정 불확실성으로 수용 | `verification/02-foundation-and-blueprint/` |
| 2026-09-27 | 소유자가 원장 충돌 해소를 확인 중. 해소 후 Antigravity로 설계·변경 소스·검증 자료 전달 승인, 비활성 외부 Codex는 별도 내부 Codex 검토자로 대체 승인 | `verification/02-foundation-and-blueprint/cross-review.md` |
| 2026-09-27 | 02의 19라운드 TEST-079와 원본 코퍼스 14종 수용을 확인하고 전체 4,437시험·lint·strict·빌드·벤치·내부 Codex 대조를 마침. Filid 스캔 발견과 Antigravity 자동 승인 거절을 첨부하여 PR #347을 엶 | [#347](https://github.com/vincent-kk/albatrion/pull/347), `verification/02-foundation-and-blueprint/` |
| 2026-09-27 | 02 PR #347 머지 확인. 03의 의존이 풀림 | `3d94a046f` |
| 2026-09-28 | 01 설계문서 착수. 소유자 결정: 문서는 opus, 검사 도구는 codex, 외부 대조는 codex·antigravity, 절 통과는 02만 멈춰 받고 나머지는 PR 리뷰에서. 실행 계획은 verifier·원장 관리 세션의 계획 검증을 거쳐 `cleared` | `docs/schema-form-design-docs`, `plan/01-design-docs/log.md` |
| 2026-09-28 | 20라운드 — 01 형식 검증이 찾은 표기 빈틈(PROCESS-023의 옛 근거 표기 대 새 문서의 원장 ID)을 편집자 결정으로 닫음: 새 설계문서·ADR은 문장 끝 괄호 안에 원장 ID(PROCESS-068). 소유자 답 없음 | `reviews/round-20-closing.md` |
| 2026-09-29 | 01 설계문서 PR을 엶: 설계문서 8편과 ADR 0001–0017을 원장에서 옮기고(21·22·23라운드는 작성 중의 원장 물음), 해상도 대조 두 차례(거른 새 지적 0), 옛 문서를 `_archive/2026-09-29/`로 옮김. 어긋남 15건은 log §6 | [#348](https://github.com/vincent-kk/albatrion/pull/348), `plan/01-design-docs/log.md` |
| 2026-09-29 | 25라운드: 02(#347)와 01(#348) 사이의 어긋남 16건을 원장 관리자가 편집자 결정으로 닫음(25C-01~12, 보충 줄만 추가). 01의 상태는 머지(절 통과 대기). 보정 PR `fix/schema-form-realign-01-02`가 코드·문서를 따라감 | `reviews/round-25-closing.md` |
| 2026-09-29 | 보정 PR #349 머지 확인(`85e7d01af`, 10:28Z). 03의 의존(02·보정)이 풀림 | [#349](https://github.com/vincent-kk/albatrion/pull/349) |
| 2026-09-29 | 26라운드: 03(PR-2) 착수 전 원장 해석 여섯 건을 원장 관리자가 편집자 결정으로 닫음(26C-01~07, 보충 줄만 추가). 겉면 멤버는 기제의 PR에서, `controls.active` 게이트는 PR-2가 실제 평가, 평가 자리 L은 PR-2가 청사진에 더함. `plan/03-node-and-settle/verification.md:26`의 겉면 문장은 26C-01로 바꿔 읽음 | `reviews/round-26-closing.md` |
| 2026-09-29 | 03 노드 트리·정착 착수 — 소유자 승인. 원장 질의는 원장 관리 세션 `albatrion-f8`로 | `feat/schema-form-node-and-settle`, `plan/03-node-and-settle/log.md` |
