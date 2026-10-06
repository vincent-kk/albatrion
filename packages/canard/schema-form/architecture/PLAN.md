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
| 정돈 | 코드 정돈(내부: 파일 구성·함수 이름·함수 로직) | — | — | — | 없음(76라운드 소유자 답, `reviews/round-76-owner-answers.md`) | 08 뒤, 최적화 앞 |
| 최적화 | 성능 최적화(동작 불변) | [request](plan/perf-optimization/request.md) | [verification](plan/perf-optimization/verification.md) | [adr-and-axes](plan/perf-optimization/adr-and-axes.md) | 없음(27라운드 소유자 답, TEST-027 보충) | 정돈 뒤(76라운드), 09 전 |
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
| 정돈 | 코드 정돈 | 대기 | — | 08 뒤, 최적화 앞. 소유자가 코드를 직접 보며 파일 구성·함수 이름·함수 로직을 손질한다(76라운드 소유자 답, `reviews/round-76-owner-answers.md`). fractal 경계와 공개 인터페이스는 바꾸지 않는다. 원칙을 소유자 라운드로 먼저 적고 작업 세션이 한 번에 적용, 동작 불변은 차등 시험·기존 스위트·벤치로 보임. P-24·P-25를 함께 처리할 수 있음 |
| 최적화 | 성능 최적화 | 대기 | — | 정돈 뒤 착수(76라운드 소유자 답), 09 전에 끝냄. 묶음(M2)마다 PR 하나. 출발점은 [대장](verification/performance-issues.md), 계획은 [request](plan/perf-optimization/request.md) |
| 09 | 정리·릴리스 | 대기 | — | 08·최적화와 릴리스 전환 PR 뒤. 머지되면 우산을 `master`로 |
| 별도 | 릴리스 전환 | 대기 | — | 시점은 소유자가 정한다(LANDING-204) |

### 열린 소유자 결정

| 번호 | 물음 | 막는 것 | 어디에 기록 |
| --- | --- | --- | --- |
| D-1 | 명령 메서드의 이름·명령 종류 값의 형·`FormHandle` 대칭 모양 | 닫힘(30라운드): 이름 `request`, 값은 요청 비트 별칭의 TS 열거, 한 호출에 종류 하나, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷(경로는 선택, 없으면 루트) | `reviews/round-30-owner-answers.md`, EVENT-073·063·SURFACE-058·059·REACT-025 보충 |
| D-2 | 릴리스 전환 PR을 여는 시점 | 09 착수 | LANDING-204 보충 |

## 4. 다음 할 일

1. **07 진행** — 02–06이 전부 머지되었으므로(06은 `07a083c18`) 07 전환은 `1.0.0-beta`에서 `feat/schema-form-switch`를 내고 `plan/07-switch/request.md`·`verification.md`로 시작한다(원샷, LANDING-058·072). 레거시는 지우지 않고(LANDING-205), UI 플러그인 넷의 `presentation.*` 이주는 08(LANDING-206). 06이 넘긴 열린 행 P-24·P-25와 05의 느린 행은 `verification/performance-issues.md`; 07의 시나리오가 닿으면 07이 고치고(49C-01), 아니면 전용 성능 작업이다. **진행 상태(2026-10-03, 89라운드 뒤, 두 세션 모두 소유자 지시로 종료).** 전환 묶음·e2e·플러그인·이주 점검·react18·브라우저 게이트는 통과했고(게이트 24/33), 남은 것은 성능이다. 소유자가 목표 속도를 정했고(85C-01: 코어 마운트·갱신 1.5배, React 마운트 1.2배·갱신 1.0배, 분기 폼은 검증기 끈 값), 느린 행은 수용하지 않으며 구조 변경도 PR-7 안에서 한다(84·87라운드 소유자 답). 정적 첫 로드 설계(89라운드)의 구현과 재측정, 그 뒤 분기 전환 정착의 진단이 다음이고, G26이 닫혀야 PR-7을 올린다. 07의 재개 지점은 `plan/07-switch/log.md` §0(`b31125119`).
2. **01 절 단위 통과** — 머지된 설계문서 여덟 편(192절)을 소유자가 절 단위로 통과시키고 문서 머리의 표에 날짜를 적는다(25C-09). 통과 중 나온 새 결정은 원장에 새 라운드 항목으로 먼저 들어가고 문서가 따라간다(`plan/01-design-docs/verification.md`).
3. **D-1** — 30라운드에서 소유자가 정했다: 노드는 `request(kind)` 하나, 종류 값은 요청 비트 별칭의 TS 열거(리터럴 합집합 불허), 한 호출에 종류 하나, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷에 경로 선택 인자(없으면 루트). 편집자 권장이던 리터럴 합집합과 폼 핸들 통합 메서드는 택하지 않았다.
4. **정돈(08 뒤)** — 소유자가 07·08의 구현 코드를 직접 보며 파일 구성·함수 이름·함수 로직의 원칙을 정하면 원장 관리자가 소유자 라운드로 적고, 작업 세션이 코드 전체에 한 번에 적용한다. 성능 최적화는 그 뒤다(`reviews/round-76-owner-answers.md`).

## 5. 기록

기록은 [`PLAN-LOG.md`](./PLAN-LOG.md)에 있다 — 1절은 날짜·무엇·어디의 표(라운드·PR·머지마다 한 행, 끝에만 덧붙임), 2절은 라운드별 요지다. 이 문서에는 마지막 행만 둔다.

| 날짜 | 무엇 | 어디 |
| --- | --- | --- |
| 2026-10-06 | 100라운드: 표본 프로파일 뒤의 순서 — 100C-01 마운트 간극의 대부분은 청사진 분석 자체(nested-d5 13.5 ms 중 10.7 ms, 옛 판 마운트 전체 3.3 ms)이므로 콜드 분석 안의 함수별 몫을 같은 프로파일러로 갈라 코드 수준으로 먼저 줄임; 청사진의 폼 간 공유(S01)는 둘째 폼부터만 돕고 새 계약이 필요해 코드 수준 뒤 남은 간극이 있을 때 설계안으로; 노드 트리 재사용(S02)은 열지 않음; 코드 수준 몫은 상한 순서로 변경 하나에 종단 재측정 하나, 겹친 상한은 다시 잼. 보충 2줄 | `reviews/round-100-closing.md` |
