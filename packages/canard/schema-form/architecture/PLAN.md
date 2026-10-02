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
| 최적화 | 성능 최적화(동작 불변) | [request](plan/perf-optimization/request.md) | [verification](plan/perf-optimization/verification.md) | [adr-and-axes](plan/perf-optimization/adr-and-axes.md) | 없음(27라운드 소유자 답, TEST-027 보충) | 07, 08과 병렬, 09 전 |
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
| 03 | 노드 트리·정착 | 머지 | [#350](https://github.com/vincent-kk/albatrion/pull/350) | 브랜치 `feat/schema-form-node-and-settle`. 2026-09-30 머지(`0705217d5`). 뒤 PR로 넘긴 사례는 [log](plan/03-node-and-settle/log.md) §4 |
| 04 | 파생 + 상태 키·제어 | 머지 | [#351](https://github.com/vincent-kk/albatrion/pull/351) | 브랜치 `feat/schema-form-derive-and-controls`. 2026-10-01 머지(`54afafb86`). 뒤 단계로 넘긴 사례는 [log](plan/04-derive-and-controls/log.md) §4, 속도 문제는 [대장](verification/performance-issues.md). 느린 벤치 행 수용은 30라운드 소유자 답으로 기록(TEST-027·071 보충) |
| 05 | 통지·검증 | 머지 | [#352](https://github.com/vincent-kk/albatrion/pull/352) | 브랜치 `feat/schema-form-dispatch-and-validation`. 2026-10-02 머지(`afbba714d`). D-1은 30라운드로 닫힘(EVENT-073 보충). 06이 맡을 일은 [log](plan/05-dispatch-and-validation/log.md) "06에 넘길 목록"과 #352 본문의 머지 순서 메모(33C-01). 느린 벤치 행 P-16–P-19는 56라운드로 소유자 수용, 속도 문제는 [대장](verification/performance-issues.md) |
| 06 | 배열 | 머지 | [#353](https://github.com/vincent-kk/albatrion/pull/353) | 브랜치 `feat/schema-form-array`. 2026-10-02 머지(`07a083c18`). 05를 통합해 그 "06에 넘길 목록"을 맡음. P-23은 64·65라운드대로 진단·개선해 R-22 해결(65C-01 표본, 통째 쓰기 Node 1.39–1.42×·Bun 2.09–2.11×), P-14의 54라운드 수용 유지. 07이 이어받는 열림 행 P-24·P-25(03 코드, 수용 대상 아님), 속도 문제는 [대장](verification/performance-issues.md). 실행 기록은 [log](plan/06-array/log.md) |
| 07 | 전환 | 착수 가능 | — | 02–06 전부 머지(06 `07a083c18`, 2026-10-02). 원샷. 브랜치 제안 `feat/schema-form-switch`, 착수 문서 [request](plan/07-switch/request.md) |
| 08 | 플러그인 | 대기 | — | 07 뒤 |
| 최적화 | 성능 최적화 | 대기 | — | 07 머지 뒤 착수, 08과 병렬, 09 전에 끝냄. 묶음(M2)마다 PR 하나. 출발점은 [대장](verification/performance-issues.md), 계획은 [request](plan/perf-optimization/request.md) |
| 09 | 정리·릴리스 | 대기 | — | 08·최적화와 릴리스 전환 PR 뒤. 머지되면 우산을 `master`로 |
| 별도 | 릴리스 전환 | 대기 | — | 시점은 소유자가 정한다(LANDING-204) |

### 열린 소유자 결정

| 번호 | 물음 | 막는 것 | 어디에 기록 |
| --- | --- | --- | --- |
| D-1 | 명령 메서드의 이름·명령 종류 값의 형·`FormHandle` 대칭 모양 | 닫힘(30라운드): 이름 `request`, 값은 요청 비트 별칭의 TS 열거, 한 호출에 종류 하나, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷(경로는 선택, 없으면 루트) | `reviews/round-30-owner-answers.md`, EVENT-073·063·SURFACE-058·059·REACT-025 보충 |
| D-2 | 릴리스 전환 PR을 여는 시점 | 09 착수 | LANDING-204 보충 |

## 4. 다음 할 일

1. **07 진행** — 02–06이 전부 머지되었으므로(06은 `07a083c18`) 07 전환은 `1.0.0-beta`에서 `feat/schema-form-switch`를 내고 `plan/07-switch/request.md`·`verification.md`로 시작한다(원샷, LANDING-058·072). 레거시는 지우지 않고(LANDING-205), UI 플러그인 넷의 `presentation.*` 이주는 08(LANDING-206). 06이 넘긴 열린 행 P-24·P-25와 05의 느린 행은 `verification/performance-issues.md`; 07의 시나리오가 닿으면 07이 고치고(49C-01), 아니면 전용 성능 작업이다.
2. **01 절 단위 통과** — 머지된 설계문서 여덟 편(192절)을 소유자가 절 단위로 통과시키고 문서 머리의 표에 날짜를 적는다(25C-09). 통과 중 나온 새 결정은 원장에 새 라운드 항목으로 먼저 들어가고 문서가 따라간다(`plan/01-design-docs/verification.md`).
3. **D-1** — 30라운드에서 소유자가 정했다: 노드는 `request(kind)` 하나, 종류 값은 요청 비트 별칭의 TS 열거(리터럴 합집합 불허), 한 호출에 종류 하나, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷에 경로 선택 인자(없으면 루트). 편집자 권장이던 리터럴 합집합과 폼 핸들 통합 메서드는 택하지 않았다.

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
| 2026-09-29 | 26라운드: 03(PR-2) 착수 전 원장 해석 여섯 건을 원장 관리자가 편집자 결정으로 닫음(26C-01~14, 보충 줄만 추가). 겉면 멤버는 기제의 PR에서, `controls.active` 게이트는 PR-2가 실제 평가, 평가 자리 L은 PR-2가 청사진에 더함. `plan/03-node-and-settle/verification.md:26`의 겉면 문장은 26C-01로 바꿔 읽음 | `reviews/round-26-closing.md` |
| 2026-09-30 | 27라운드: 소유자가 PR-2 벤치의 느린 행을 모두 수용(TEST-027 충족), 벤치 기록은 `verification/03-node-and-settle/performance.md`, 새 엔진의 React·jsdom 성능 평가는 PR-7 전환의 게이트, 최적화는 구현 완료 뒤 별도 작업으로 분리. 소유자 답 5행, 보충 줄만 추가 | `reviews/round-27-owner-answers.md` |
| 2026-09-29 | 03 노드 트리·정착 착수 — 소유자 승인. 원장 질의는 원장 관리 세션 `albatrion-f8`로 | `feat/schema-form-node-and-settle`, `plan/03-node-and-settle/log.md` |
| 2026-09-30 | 03 PR #350 머지 확인(`0705217d5`, 13:30Z). 04·05·06의 의존이 풀림 | [#350](https://github.com/vincent-kk/albatrion/pull/350) |
| 2026-09-30 | 04 파생 + 상태 키·제어 착수 — 소유자 승인. D-1은 05 착수 때 다시 올린다. 원장 질의는 원장 관리 세션 `albatrion-79`로 | `feat/schema-form-derive-and-controls`, `plan/04-derive-and-controls/log.md` |
| 2026-09-30 | 28라운드: 04(PR-3+PR-6) 실행 계획 초안의 원장 해석 일곱 건과 후속 둘을 원장 관리자가 편집자 결정으로 닫음(28C-01~08, 보충 줄만 추가). 정착 기록은 런타임 칸에 마지막 하나, `enabled = active && visible`, `@`는 맥락 칸(03의 extras 읽기는 04가 고침), `setContext`·맥락 에지는 PR-3, `unsetOnInactive` 식 throw는 유지, TEST-071 값 크기의 뜻, `watchValues`·`node.context`는 04 | `reviews/round-28-closing.md` |
| 2026-10-01 | 29라운드: 04 구현 중 물음 넷(생긴 노드의 `injectTo`·`derived`가 `undefined` 원천에서 발화하는가; 식이 던진 정착의 채움·나감 비움; 공유 충돌 정착의 진행; 조각 `controls`의 `injectTo`)을 원장 관리자가 편집자 결정으로 닫음(29C-01~04, 보충 줄만 추가). 발화한다; 채움 뒤의 변화는 새 에지; v7의 모형 선택과 다른 회귀 기대는 원장 값으로 바꿈; 식이 던져도 자리별 값으로 정착을 마치며 03의 전이 전체 생략은 04가 고침; 공유 충돌도 앞선 종류로 커밋하고 자동 쓰기는 진행; 조각의 `injectTo`는 청사진 오류(CONTROLS-077) | `reviews/round-29-closing.md` |
| 2026-10-01 | 04 PR #351 머지 확인(`54afafb86`, 01:11Z). 게이트 30 가운데 29 충족, G23 storybook은 실행 결과 없이 소유자가 머지를 결정해 사유를 남기고 포기(통과로 주장하지 않음). 04가 고친 03 결함은 29C-02·03과 비루트 노드의 자기 선언 재선택. 05·06의 의존이 풀림(05는 D-1 뒤). 속도 문제 대장 `verification/performance-issues.md` 시작 | [#351](https://github.com/vincent-kk/albatrion/pull/351) |
| 2026-10-01 | 소유자 요청으로 구현 완료 뒤 성능 최적화 작업의 계획서 셋을 `plan/perf-optimization/`에 둠. 단계는 M0 측정판 고정(옛 판·최적화 전·묶음 뒤 세 기준선, 미측정 행의 수치) → M1 분류·우선순위(계약·차수·체감·위험, 소유자 확인 한 번) → M2 묶음별 PR(L1 이차 비용 → L2 상수 비용 → L3 비교·할당·메모리 → L4 런타임 교차, PR 하나에 가설 하나) → M3 종합 재측정과 TEST-027 수용. 자리는 07 머지 뒤·08과 병렬·09 전. 원장 항목은 더하지 않음 | `plan/perf-optimization/` |
| 2026-10-01 | 30라운드: D-1(EVENT-073)의 소유자 답 둘을 원장 세션에서 직접 받음 — 명령 메서드는 한 호출에 종류 하나, 종류 값은 내부 요청 비트의 별칭인 TS 열거(맨 리터럴 합집합 불허, 이름은 SURFACE-056을 따름). 합침은 디스패처가 한다. 메서드 이름·페이로드·`FormHandle` 모양은 05 세션이 전한 소유자 입장이 있으나 직접 확인 대기. EVENT-073 보충 두 줄 | `reviews/round-30-owner-answers.md` |
| 2026-10-01 | 30라운드 마무리: 소유자가 풀어 쓴 물음 여섯에 직접 답함 — 명령 메서드 이름 `request`, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷에 경로 선택 인자(없으면 루트, 16 → 18), 최적화 작업은 07 뒤·08과 병렬. 04의 스토리북 게이트는 "포기"가 아니라 소유자가 독립 실행해 모두 통과했고 기록만 빠진 것으로 정정(게이트 30 가운데 30). D-1 닫힘, 05 착수 가능. 소유자 지시로 로컬 `1.0.0-beta`를 원격에 푸시. 04 느린 벤치 행 수용은 다음 행에서 닫힘 | `reviews/round-30-owner-answers.md` |
| 2026-10-01 | 30라운드 추가: 04 벤치의 느린 행 둘(TEST-071 통째 교체 객체 행, 04 뒤 03 벤치의 느려진 행)을 소유자가 "맞습니다."로 수용(TEST-027 충족). TEST-027·TEST-071 보충. 04의 소유자 확인 대기 항목이 모두 닫힘 | `reviews/round-30-owner-answers.md` |
| 2026-10-01 | 05 통지·검증 착수 — 소유자 승인(D-1 결정 뒤 05). 06은 별도 세션이 병렬로 맡음. 원장 질의는 원장 관리 세션 `albatrion-5c`로 | `feat/schema-form-dispatch-and-validation`, `plan/05-dispatch-and-validation/log.md` |
| 2026-10-01 | 31라운드: 05 착수 뒤 작업자의 원장 해석 일곱 건 — 넷은 현행 문장 확인(VALIDATE-051 ajv8만 `allowUnionTypes`, VALIDATE-048 공유 단위, ERROR-021 일반 규칙, ERROR-201 새 코드 없음), 다섯을 편집자 결정으로 닫음(31C-01 `request(kind)`는 진입이 아니며 진입 밖에서는 동기 배달, 31C-02 운영 모드 경고의 둘째 예외는 `NON_JSON_WHOLE_VALUE`, 31C-03 `reason` 값은 원장이 이름 붙인 것으로 닫힘, 31C-04 차등 시험의 독립 검증기는 ajv 아닌 라이브러리, 31C-05 가칭 확정은 PR-4 결정이되 보충으로 옮김). 보충 20줄. 같은 날 06(배열) 세션에 착수 지시 | `reviews/round-31-closing.md` |
| 2026-10-01 | 32라운드: 05 실행 계획의 원장 해석 둘을 편집자 결정으로 닫음 — 32C-01 검증기 계약 통일은 PR-4에서 코어 쪽 계약 형과 ajv 플러그인 셋, Form 속성 `validatorFactory`의 공개 형은 PR-7; 32C-02 `VALIDATOR_BIND_REFUSED`는 플러그인이 던지는 `BaseError`(그룹 `UNHANDLED_ERROR`)이며 코어 `UnhandledError` 클래스는 요구되지 않음. 보충 13줄 | `reviews/round-32-closing.md` |
| 2026-10-01 | 06 배열 착수 — 소유자 승인. 05와 병렬로 별도 세션이 맡음. 원장 질의는 원장 관리 세션 `albatrion-5c`로 | `feat/schema-form-array`, `plan/06-array/log.md` |
| 2026-10-01 | 33라운드: 06 착수 — 05·06이 합의한 공유 파일 분담(배열 쓰기 동사의 `dispatch` 진입 파일은 뒤에 머지하는 쪽이 더함, 그때까지 06 동사는 PR-2 모양)을 LANDING-084와 맞는 것으로 닫음(33C-01). 06 첫 커밋은 06 브랜치에 있음. 보충 6줄 | `reviews/round-33-closing.md` |
| 2026-10-01 | 34라운드: 05 실행 계획의 해석 둘 — 34C-01 플러그인용 계약 형은 공개 `ValidatorPlugin`(`app/plugin/type.ts`)이며 PR-4가 선택 멤버로 넓힘(LANDING-084), 코어 `Validator`는 공개 index에 내보내지 않음; 34C-02 `ValidationIssue`는 PR-4에 더하고 `JSONSchemaError` 별칭은 PR-7까지 유지. 보충 10줄 | `reviews/round-34-closing.md` |
| 2026-10-01 | 35라운드: 06 착수의 해석 아홉과 05의 셋을 편집자 결정 열둘로 닫음 — 배열 메서드의 던짐은 PR-5·보고는 배선 PR, 경로 갱신 사실은 PR-5·`UpdatePath` 배달은 디스패처, 삽입 동사 없음, `resolveArrayLimits`는 청사진, 원본 B 배열 구조 기록(키 카운터 되감지 않음), 범위 밖 인덱스는 무효 호출, 32C-02 정정(ajv6·7은 공용 유틸 의존 없음)·`dialect?`·공개 검증 형 유지, 아이템 안 선언의 아이템별 평가와 템플릿 조각 맞춤, 소멸 아이템, 꺼진 배열 호스트의 잠복 원본, `children`은 객체 전용, 터미널 배열 행. 보충 다수 | `reviews/round-35-closing.md` |
| 2026-10-01 | 36라운드: 06 문서 선행 작성의 해석 둘 — 36C-01 NODE-014의 "행의 공유 칸"은 배열 구조 연산의 여덟째 행 칸(순수 계획, 비배열 행은 공유 거부 함수 하나); 36C-02 옛 튜플 표기의 `additionalItems` 꼬리 템플릿 컴파일은 PR-5가 청사진에 더함(스키마 값만, 그 밖은 `extras`). 보충 7줄 | `reviews/round-36-closing.md` |
| 2026-10-01 | 37라운드: 06의 해석 하나 — 37C-01 가지 배열의 `omitTrailing`은 방출 꼬리의 빈 자리(방출 없는 아이템의 채움, `null`을 방출한 잎, 청사진 없는 자리의 `undefined`·`null`) 최대 연속 구간을 자르고, 실제 `{}`·`[]` 방출은 자르지 않으며 원본은 그대로. 보충 4줄 | `reviews/round-37-closing.md` |
| 2026-10-01 | 38라운드: 06 정착 구현의 해석 둘 — 38C-01 가지 배열 호스트에 온 배열 아닌 값은 잘못된 종류의 `raw`로 들고 아이템 0개(있던 아이템은 소멸), 호스트는 그 값을 방출하고 경고등이 켜짐; 38C-02 게이트로 나간 배열 호스트의 잠복 원본은 `local`이 아니라 원본 트리(원본 없는 자리는 `undefined`, 방출용 채움은 얼리지 않음, 아래 잠복 항목은 접혀 듦). 보충 9줄 | `reviews/round-38-closing.md` |
| 2026-10-01 | 39라운드: 38C-01 후속 — 잘못된 종류의 `raw`를 든 가지 호스트는 그 `raw`를 방출한다(VALUE-033, 프로토타입 A3-3/A3-4-host·line 31). 머지된 객체 행이 방출을 하지 않는 것은 03 기록에 없는 근사라 결함이며 06이 배열 행과 함께 고치고 06 실행 기록 §4에 적음(39C-01). 보충 6줄 | `reviews/round-39-closing.md` |
| 2026-10-01 | 40라운드: 소유자 답 — 차등 시험에 ajv 밖의 라이브러리를 더하지 않고 PR-4는 같은 ajv로 폼 경로와 직접 경로를 비교, 다른 구현과의 교차 확인은 ajv 아닌 검증기 플러그인을 만드는 PR로. 31C-04의 오라클 선택은 PR-4에 대해 대체됨. TEST-001·017, VALIDATE-003 보충 | `reviews/round-40-owner-answers.md` |
| 2026-10-01 | 41라운드: 06의 해석 하나 — 41C-01 튜플에서 자리마다 템플릿이 다르면 구조 연산의 밀림은 노드가 아니라 값을 옮긴다(같은 템플릿일 때만 노드와 키 재사용, 다르면 새 자리 템플릿의 새 노드, 옛 노드는 소멸). 보충 3줄 | `reviews/round-41-closing.md` |
| 2026-10-01 | 42라운드: 06이 VALUE-034 옛 단언을 이식하다 찾은 03 결함 둘 — 가상 노드의 호출자 쓰기가 참조 노드에 분배되지 않고(모양 거부도 없음), 가상 노드 아래에 그림자 기록이 생겨 값이 늘 빈 튜플. 03 기록에 없는 근사라 결함이며 06이 이 PR에서 고치고 06 실행 기록 §4에 적음(42C-01); 고치는 내용은 ERROR-195의 분배·거부, NODE-034·054의 실제 형제 참조와 재합성, Overwrite 채움은 WRITE-090대로 없음(42C-02). 보충 9줄 | `reviews/round-42-closing.md` |
| 2026-10-01 | 43라운드: 05의 해석 하나 — 43C-01 EVENT-062의 `globalState` 기제 전부(키별 셈, 상태 변경·형상 출입 때의 갱신, 0↔1을 넘을 때만의 새 객체와 `UpdateGlobalState`)는 LANDING-064 PR-4 행의 "상태 사건"에 접힌 PR-4의 몫. 셈과 객체는 런타임 칸, 갱신은 상태 쓰기 진입과 정착 커밋, 사건은 최외곽 진입 끝에 한 번. 보충 6줄 | `reviews/round-43-closing.md` |
| 2026-10-01 | 44라운드: 06 벤치의 비용 둘 — 44C-01 변경에 비례하지 않는 비용은 느린 행이 아니라 계약 위반(SETTLE-047·017, NODE-026, GOAL-011, 대장 머리 규칙). 통째 교체의 이차 순회(03 보조 함수 `dirtyChildren`)와 키 입력의 아이템 수 비례 합성(`assembleArray`)은 06이 뜻을 바꾸지 않고 고쳐 대장 "해결"에 적음(배열 `assemble`은 SETTLE-042의 객체 패치 규칙과 같은 모델). 고친 뒤 남는 비례하는 느린 행만 소유자 수용으로 묶어 올림. 보충 5줄 | `reviews/round-44-closing.md` |
| 2026-10-01 | 45라운드: 42C-02의 좁은 해석 — 45C-01 가상 노드의 분배는 호출자의 쓰기 종류를 바꾸지 않고 참조 노드마다 그 종류로 넘긴다(`Merge`면 부분 쓰기, 기본 `Overwrite`면 전체 교체). 보충 2줄 | `reviews/round-45-closing.md` |
| 2026-10-01 | 46라운드: 05의 해석 하나 — 46C-01 가드 인스턴스의 루트 중복 컴파일은 루트마다 한 번의 마운트 비용이라 계약 위반이 아니라 TEST-027·072의 느린 행. 가드를 검증 인스턴스로 옮기는 B안은 VALIDATE-033에 어긋나 금지, 자족한 부분 스키마의 직접 컴파일 A안은 ADR 0004 방식의 변경이라 소유자에게 묻는다(06의 P-13·P-14와 묶음). 보충 5줄 | `reviews/round-46-closing.md` |
| 2026-10-01 | 47라운드: 06의 해석 둘 — 47C-01 원본 트리에서 배열 호스트는 늘 자리 수만큼의 배열로 읽혀(원본 없는 자리는 `undefined`, 객체 아이템·잎은 원본 없으면 `undefined`) 재진입·`update` 재작성에서 아이템 수를 잃지 않음; 47C-02 `null`을 든 배열 호스트의 `push`는 가지·터미널 모두 `[x]`를 만들고 `update`·`remove`·`pop`·`clear`는 무효 호출, 04 파생 보조 함수의 이차 비용은 44C-01대로 06이 고침. 보충 8줄 | `reviews/round-47-closing.md` |
| 2026-10-01 | 48라운드: 06의 해석 둘 — 48C-01 대량 나감의 이차 비용 세 고리(`updateInactiveValuesMemo`·`finalizeExits`·`captureLatentDescendants`, 03·04 코드)는 P-03·P-04에 적힌 원인이 아니라 44C-01대로 06이 고침(소유자 수용은 행에 적힌 원인에 한함); 48C-02 터미널 배열 행도 배열 아닌 `raw` 위의 `push`는 `[x]`, 나머지 동사는 무효 호출. 보충 6줄 | `reviews/round-48-closing.md` |
| 2026-10-01 | 49라운드: 44C-01의 경계 — 49C-01 한 단계가 고치는 비례하지 않는 비용은 그 단계의 시나리오가 닿는 것까지(06은 배열 시나리오가 닿는 03·04 비용을 계속 고침); 닿지 않는 03·04 비용은 대장에 "계약 위반, 수용 대상 아님"으로 표시한 열린 행으로 남겨 07의 jsdom 게이트가 다시 봄. 소유자에게 보고. 보충 4줄 | `reviews/round-49-closing.md` |
| 2026-10-01 | 50라운드: 05의 해석 하나 — 50C-01 PR-7까지 남기는 옛 이름 `JSONSchemaError`는 `ValidationIssue`의 호환 확장(`details?: Record<string, any>`, `key?: number`)이어도 되며 새 `ValidationIssue`는 `unknown`을 지킨다(34C-02의 뜻은 PR-7 전 공개 형 불변). 보충 2줄 | `reviews/round-50-closing.md` |
| 2026-10-01 | 51라운드: 06의 해석 하나 — 51C-01 게이트 가진 호스트가 들어오는 아이템마다 자식 목록·출력을 다시 짓는 줄(P-03의 원인)은 소유자 수용이 아닌 편집자 기록이고 배열 시나리오가 닿으므로 49C-01대로 06이 고침. 조건은 게이트가 같은 바퀴 안에서 읽는 값의 보존. 고치면 P-03을 "해결"로. 보충 3줄 | `reviews/round-51-closing.md` |
| 2026-10-01 | 52라운드(소유자 답 셋): 06 느린 행 P-13·P-14는 같은 완료점(쓴 값이 루트에서 읽히는 시점) 기준으로 다시 재어 수용을 다시 물음(수용 보류); 05 가드 컴파일 A안(자족한 `if` 부분 스키마의 직접 컴파일)은 최초 로드 비용임을 확인하고 동작 안정성·플러그인 옵션(기본 켜짐) 조건으로 PR-4에 수용, ajv 플러그인 셋 안에서 함께 넣고 따로 나누지 않음; 49C-01 범위 경계 확정 | `reviews/round-52-owner-answers.md` |
| 2026-10-01 | 53라운드: 05의 해석 하나 — 53C-01 루트의 다른 곳에 있는 컴파일 오류가 자족한 가드를 실패시키지 않는 직접 경로의 동작은 ERROR-041·ADR 0004 §78이 적은 동작이고, 루트 위치 경로가 모든 가드를 실패시키던 것은 방식의 한계라 재현하지 않음. 옵션 가칭 `configure({ directGuardCompile })`. 보충 2줄 | `reviews/round-53-closing.md` |
| 2026-10-01 | 54라운드(소유자 답): 06의 같은 완료점 재측정 결과 P-13(1만 아이템 키 입력)은 새 엔진이 Node 약 35배·Bun 약 12배 빨라 닫히고, P-14(1천 아이템 루트 통째 쓰기, Node 1.41–1.43배·Bun 2.87배, 선형)는 소유자가 수용("이정도면 수용 가능. 동작무결성을 확보하고, 성능 개선 라운드에서 쪼아보자"). PR-5의 TEST-027 게이트 충족, 고침은 07 뒤 최적화 작업 | `reviews/round-54-owner-answers.md` |
| 2026-10-02 | 55라운드: 05 PR #352 소유자 묶음 가운데 넷을 원장에서 닫음 — 55C-01 한 쓰기의 가드 실패 둘은 ERROR-005대로 묶어 던지며 첫 실패만 던지는 03 코드는 결함이라 05(집계 오류는 PR-4 범위)가 고침; 55C-02 VALIDATE-047 (iv)는 "위치마다 가드 하나"와 양립하지 않아 문서화된 한계, 엄격 옵션 인스턴스의 가드 컴파일 실패도 문서화된 한계(플러그인은 소비자 옵션을 덮지 않음); 55C-03 가칭 확정(`Focus`·`Select`·`Refresh`·`Remount`, `ValidatorBindRefusedError`, `configure({ directGuardCompile })`). 벤치 P-16~P-19와 스토리북은 소유자에게. 보충 9줄 | `reviews/round-55-closing.md` |
| 2026-10-02 | 56라운드(소유자 답): 05 PR-4의 느린 행 넷(P-16 작은 폼 마운트 0.30배, P-17 200그룹 마운트 0.75배, P-18 통지 파동 0.23배·0.12배, P-19 03 벤치 재실행)을 소유자가 수용("응 그것도 수용. 성능 개선 라운드에서 다루자. 동작만 정상적이면 수용할게. 아까처럼 지수적으로 성능이 악화되는 케이스가 아니면"). 느린 행 수용의 일반 규칙 둘(동작 정상, 비례 이상 악화는 수용 대상 아님)이 소유자 답으로 섬 | `reviews/round-56-owner-answers.md` |
| 2026-10-02 | 57라운드: 06의 해석 하나 — 57C-01 정착 도중 살아 있는 노드 읽기는 직전 커밋을 돌려주며 바퀴 중간 상태는 관측 계약이 아님(VALUE-013·EVENT-061); 51C-01 미루기 뒤 코드 변경 없음, `settle` DETAIL에 문장 하나. 보충 2줄 | `reviews/round-57-closing.md` |
| 2026-10-02 | 58라운드: 05의 해석 하나 — 58C-01 한 정착의 정착 오류는 종류를 가리지 않고 모두 모아 사슬 끝에서 발생 순서대로 묶어 던진다(ERROR-004·005); 첫 실패만 남기는 `context.failure`는 결함이라 05가 PR-4에서 고침; 예산 초과는 뒤의 진행을 멈출 뿐 앞의 오류를 버리지 않음(29C-03). 보충 4줄 | `reviews/round-58-closing.md` |
| 2026-10-02 | 59라운드: 05의 해석 하나 — 59C-01 `INJECT_TARGET_MISSING`과 자동 쓰기의 가상 노드 쓰기 모양 오류의 `details`에 출처 노드 경로 `sourcePath`를 더함(`path`는 대상 그대로, 덧붙이는 변경, PR-4). 보충 3줄 | `reviews/round-59-closing.md` |
| 2026-10-02 | 60라운드(소유자가 맡긴 결정): 시나리오 패키지의 가족 디렉토리는 진입점을 가진 모듈이라 여덟 가족 모두 INTENT·DETAIL을 두고(#353에서 한 번에), 패키지 INTENT의 가족 목록을 여덟으로, 장면 파일의 홀로 파일 경고는 `.filid/config.json` 예외 목록에 패키지 경로를 더해 닫음, 동적 표의 사례 상한 미확정은 DETAIL 선언(60C-01). 보충 3줄 | `reviews/round-60-closing.md` |
| 2026-10-02 | 61라운드: PR-4 머지(`afbba714d`) 뒤 31C-05의 가칭 확정 기록 — 61C-01 05 실행 기록의 표(`plan/05-dispatch-and-validation/log.md:80-156`)를 정본으로 77개 처분을 적음(확정 그대로 67, 삭제·대체 10; 소유자 이름이 이김). 보충 15줄 | `reviews/round-61-closing.md` |
| 2026-10-02 | 62라운드: 06 통합의 해석 하나 — 62C-01 `batch(fn)` 안의 배열 동사는 updater와 같다(EVENT-061): 앞선 표시를 얹은 배열을 부른 자리에서 읽어 계산하고 동기 결과를 돌려주며 결과 배열을 통째 쓰기로 표시만 함. 정착은 fn 끝 한 번, 배치 안 정착 당김은 로드뿐, 아이템 키는 위치로(NODE-051). 보충 10줄 | `reviews/round-62-closing.md` |
| 2026-10-02 | 63라운드: 06 통합 보고의 셋 — 63C-01 P-14의 둘째 원인(05의 커밋마다 하는 배달 표시, 바뀐 노드 수에 비례)은 54라운드 수용 밖이라 05 귀속의 새 행 P-23으로 소유자 수용을 따로 물음(닫기 파일 덧붙임 참조)(통합은 기다리지 않음); 63C-02 배열 `remove`의 전체 감시자 훑기와 저장소 전체 훑기는 계약 위반이라 06이 고침(05 파일 포함); 63C-03 키 입력의 배열 얕은 사본은 44C-01 모델의 비용으로 수용. 보충 9줄 | `reviews/round-63-closing.md` |
| 2026-10-02 | 64라운드: 소유자 답 하나 — P-23(05의 커밋마다 하는 배달 표시가 더한 배열 통째 쓰기의 비용)은 수용하지 않고 06 PR 안에서 속도를 개선한다("속도개선을 해보세요. 너무 느리군요"). 통과 기준은 54라운드 수용 수치 이하로 복귀. 덧붙임: 소유자가 요지를 보탬 — 상승 추세가 구조적일 수 있으니 먼저 원인을 상수·구조로 가르고, 구조 몫은 원장 라운드를 거쳐 설계를 바꾼다. 보충 7줄 | `reviews/round-64-owner-answers.md` |
| 2026-10-02 | 65라운드: P-23의 진단과 처분 — 65C-01 상승 추세는 단계마다 더해진 전체 훑기의 누적(모두 선형, 계약 위반 아님); 상수 몫은 03·04 코드까지 06이 고침(물음 30). 65C-02 S3 기능 통과는 청사진 정적 색인과의 교집합만 방문. 65C-03 S1+S2 배달 장부를 변경 현장에서 포착하고 커밋 방문 하나·레코드 필드로(EVENT-007·024, SETTLE-006 그대로; S4는 하지 않음). 65C-04 객체 키 입력의 형제 수 비례 비용은 열린 행. 보충 19줄 | `reviews/round-65-closing.md` |
| 2026-10-02 | 66라운드: 06의 해석 하나 — 66C-01 배달 변경 판정과 감시 에지의 동등은 SETTLE-043의 `sameValue`(SameValueZero)다. 옛 코드의 `NaN`→`NaN` 헛 배달은 결함(S2가 없앤 것이 맞음), S2 뒤 감시 값의 `NaN` 덧배달도 결함이라 06이 고침. 보충 5줄 | `reviews/round-66-closing.md` |
| 2026-10-02 | 67라운드: 06의 해석 하나 — 67C-01 SETTLE-043의 한 판정은 두 자리에 산다: 깊은 구조 비교는 커밋의 참조 되살림에서 한 번, 배달·감시 에지는 참조 비교(원시 값은 SameValueZero). 배달 차이에 깊은 도우미를 쓰면 틀림. 내용 같고 참조 새로운 호스트는 되살림의 구멍 — 배열 호스트면 06이 고치고 03이면 열린 행. 보충 5줄 | `reviews/round-67-closing.md` |
| 2026-10-02 | 65라운드 덧붙임: P-23 해결 — 06이 세 단계를 모두 구현하고 54라운드 방법으로 재어 Node 1.39–1.42배·Bun 2.09–2.11배(수용 수치 이하), 대장 "해결" R-22; P-14 수용 유지. 되살림 구멍은 03 귀속의 열린 행 P-25. PR #353 머리 `e147d98cb`, 06 쪽 머지 조건 충족 | `reviews/round-65-closing.md` |
| 2026-10-02 | 06 머지 — PR #353 소유자 스쿼시 머지 `07a083c18`, 06 문서 커밋 `80875e50f`(§3 06 행 머지, 06 실행 기록 머지 항목). 07 행을 착수 가능으로. 우산 PR #344 본문 갱신 | `HANDOFF.md` §1 "06 머지" |
