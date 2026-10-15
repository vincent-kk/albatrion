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
| 정돈 | 코드 정돈(최소 export 계약·fractal 뿌리·시험 자리; 내부 파일 구성) | [request](plan/tidy-structure/request.md) | — | — | 없음(76·287·288라운드 소유자 답) | 07 뒤(287라운드로 08 앞에 당김), 최적화 앞 |
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
| 07 | 전환 | 리뷰 | [#354](https://github.com/vincent-kk/albatrion/pull/354) | 브랜치 `feat/schema-form-switch`(2026-10-02 착수, 2026-10-11 `1.0.0-beta` `351ece24e` 위에 다시 세움). 원샷. 착수 물음은 68라운드로 닫힘. G23·G26·G27이 소유자 답([질의 목록](reviews/owner-queue-07.md))으로 닫힐 때까지 머지하지 않음. 측정 원자료는 `archive/stage-07-verification-raw`(140라운드). 실행 계획은 [execution-plan](plan/07-switch/execution-plan.md), 기록은 [log](plan/07-switch/log.md) |
| 08 | 플러그인 | 완료 | — | 별도 PR 없음. `presentation.*` 이주와 이름 대응은 07b(#365)·07d(입력 설정 이주, 플러그인 0.17.0)에서 끝났고 PR마다 플러그인 일곱 빌드가 게이트로 돌았다(331라운드 소유자 답). 계획서가 인용한 옛 경로(`plan/07-switch/log.md` "08 목록")는 역사 기록. 미확인 셋은 대기열 54 |
| 정돈 | 코드 정돈 | 진행 | — | 07 뒤·08 앞(287라운드), 최적화 앞. 계획 [request](plan/tidy-structure/request.md), 결정 D1–D6 확정(289라운드). 정돈-1부터 PR 넷. 정돈-1 #374 병합 ae502f7bd(297라운드), 정돈-2 진행. 소유자가 코드를 직접 보며 파일 구성·함수 이름·함수 로직을 손질한다(76라운드 소유자 답, `reviews/round-76-owner-answers.md`). fractal 경계와 공개 인터페이스는 바꾸지 않는다. 원칙을 소유자 라운드로 먼저 적고 작업 세션이 한 번에 적용, 동작 불변은 차등 시험·기존 스위트·벤치로 보임. P-24·P-25를 함께 처리할 수 있음 |
| 최적화 | 성능 최적화 | 진행 | — | 브랜치 `feat/schema-form-08-review-and-perf`(330라운드; 원장 커밋도 이 위에, 끝나면 `1.0.0-beta`에 squash). 소유자 리뷰 항목을 먼저 받는다(331라운드). 정돈 뒤 착수(76라운드 소유자 답), 09 전에 끝냄. 가설마다 커밋 하나, 수용 가설 3~4개마다 PR 하나(결정 대기열 56, 344라운드 편집자 가결정). 출발점은 [대장](verification/performance-issues.md), 계획은 [request](plan/perf-optimization/request.md) |
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
| 2026-10-15 | 329라운드 닫기: 문서 한국어화 PR #386 병합(d25a8aee8; 96 재작성, 문체 통일, 플러그인 문장 정정). 보충 1줄 | `reviews/round-329-closing.md` |
| 2026-10-15 | 330라운드 소유자: 중간 브랜치 삭제, 1.0.0-beta 압축(48 커밋, 백업 유지), 8단계는 feat/schema-form-08-review-and-perf에서 원장·워크트리 운영. 보충 2줄 | `reviews/round-330-owner-answers.md` |
| 2026-10-15 | 331라운드 소유자: 08 플러그인 완료 처리(07b·07d), 미확인 셋은 대기열 54, 최적화 진행. 보충 1줄 | `reviews/round-331-owner-answers.md` |
| 2026-10-15 | 332라운드 소유자: 8단계 리뷰 1차 열넷(구조·조사·이름·질문). 보충 1줄 | `reviews/round-332-owner-answers.md` |
| 2026-10-15 | 333라운드 소유자: 작업자 지정, NODE_ENV는 React 방식, 칸 이름 수용, typeMismatch → misfit. 보충 1줄 | `reviews/round-333-owner-answers.md` |
| 2026-10-15 | 334라운드 소유자: 구조 정리 먼저(codex 없이, 소유자 감독), 속도 최적화부터 codex·agy. 보충 1줄 | `reviews/round-334-owner-answers.md` |
| 2026-10-15 | 335라운드 소유자: WeakMap 측정, schemaType 안 1 유지, stringify는 control.ts 구분자로 속도 토막, engine 재구조화 수용. 보충 1줄 | `reviews/round-335-owner-answers.md` |
| 2026-10-15 | 336라운드 소유자: 결정 여덟(NODE_ENV 현행, misfit 전면, virtual 유지, CLAUDE.md 승인, settle 2개·순환 지금, types/ 분할, walkFieldNodes 삭제, 혼재 금지). 보충 1줄 | `reviews/round-336-owner-answers.md` |
| 2026-10-15 | 337라운드 소유자: Roll을 정의 자리에서 한 번 펴고 rolled 칸·Base 접두사 제거. 보충 3줄 | `reviews/round-337-owner-answers.md` |
| 2026-10-15 | 338라운드 소유자: Roll 실험 실패(재귀 스키마 형) → rolled 칸 유지, Rolled 접두사·export rename. 보충 1줄 | `reviews/round-338-owner-answers.md` |
| 2026-10-15 | 339라운드 닫기: 묶음 1 PR #387 병합(daadce7ab), 편집자 결정 넷, CLAUDE.md 두 줄 | `reviews/round-339-closing.md` |
| 2026-10-15 | 340라운드 소유자: walkFieldNodes 삭제 대신 순회 한 벌로 합침(동작 불변). 보충 3줄 | `reviews/round-340-owner-answers.md` |
| 2026-10-15 | 341라운드 소유자: 하위 방문 공개 기능 추가 → 설계 초안 walk-subtree-design.md, 판정 여섯. 보충 1줄 | `reviews/round-341-owner-answers.md` |
| 2026-10-15 | 342라운드 소유자: visitSubtree 확정(지연 batch, 옵션 없음), SURFACE-062 신설. 보충 6줄 | `reviews/round-342-owner-answers.md` |
| 2026-10-15 | 343라운드 소유자: 묶음 2 마무리, 전체 게이트 한 번. 보충 1줄 | `reviews/round-343-owner-answers.md` |
| 2026-10-15 | 344라운드 소유자: 밤까지 자율 진행(원장 기반 판단, 결정 대기열, PR 병합 허용, codex·agy 분산). 보충 2줄 | `reviews/round-344-owner-answers.md` |
| 2026-10-15 | 345라운드 소유자: 작업 끝난 브랜치 즉시 정리. 보충 1줄 | `reviews/round-345-owner-answers.md` |
| 2026-10-15 | 346라운드 닫기: 묶음 2 #389 병합, 편집자 결정 일곱. 보충 10줄 | `reviews/round-346-closing.md` |
| 2026-10-15 | 347라운드 닫기: #390·#391·#392 병합, 편집자 결정 셋, 최적화 행의 PR 단위를 대기열 56으로. 보충 5줄 | `reviews/round-347-closing.md` |
| 2026-10-15 | 348라운드 닫기: 묶음 3 blueprint #393 병합, 편집자 결정 셋, 대기열 57. 보충 3줄 | `reviews/round-348-closing.md` |
| 2026-10-15 | 349라운드 닫기: 묶음 3 derive #394 병합, 편집자 결정 둘. 보충 2줄 | `reviews/round-349-closing.md` |
| 2026-10-15 | 350라운드 닫기: 묶음 3 settle #395 병합, 묶음 3 완료, 편집자 결정 셋. 보충 3줄 | `reviews/round-350-closing.md` |
| 2026-10-15 | 351라운드 닫기: 최종 경로 #396 병합, 밤 작업 종료. 보충 1줄 | `reviews/round-351-closing.md` |
| 2026-10-15 | 352라운드 소유자: CLAUDE.md 경로 수정 승인(대기열 57 닫힘), 속도 그림 물음. 보충 1줄 | `reviews/round-352-owner-answers.md` |
| 2026-10-15 | 353라운드 소유자: 속도 측정·개선 착수, 계획 브리핑. 보충 1줄 | `reviews/round-353-owner-answers.md` |
| 2026-10-15 | 354라운드 소유자: 루프 전체 시간을 20~30시간으로(대기열 56 갱신). 보충 1줄 | `reviews/round-354-owner-answers.md` |
| 2026-10-15 | 355라운드 닫기: M0 기준선·M1 우선순위표 #397 병합, 편집자 결정 넷. 보충 5줄 | `reviews/round-355-closing.md` |
| 2026-10-15 | 356라운드 소유자: 개선 즉시 진행, stringify 배제 가설, 측정은 dist 기준. 보충 1줄 | `reviews/round-356-owner-answers.md` |
| 2026-10-15 | 357라운드 소유자: 속도 측정은 빌드 결과물로. 보충 1줄 | `reviews/round-357-owner-answers.md` |
| 2026-10-15 | 358라운드 소유자: 내부 이름은 빌드 결과물 개입으로(임시), 이후 폼 e2e. 보충 1줄 | `reviews/round-358-owner-answers.md` |
| 2026-10-15 | 359라운드 소유자: codex 위임의 데이터 공유 허용 공유. 보충 1줄 | `reviews/round-359-owner-answers.md` |
| 2026-10-15 | 360라운드(닫기): L1 PR #399 검증·squash-merge(3c0e46576); SETTLE-043 보강, G8 설계 넷, L1 예외, L2 이월. 보충 4줄 | `reviews/round-360-closing.md` |
| 2026-10-15 | 361라운드 소유자: 속도 수용은 옛·현재·배율·절대시간으로 소유자가, push 설계는 소유자 검토. 보충 1줄 | `reviews/round-361-owner-answers.md` |
| 2026-10-15 | 362라운드 소유자: push 지름길 승낙, 두 번째 값 복사는 가능하면 줄임, pop·remove 지름길 물음. 보충 1줄 | `reviews/round-362-owner-answers.md` |
| 2026-10-15 | 363라운드 소유자: 배열 동사 전부와 자식 노드 배열·로드 스냅숏 복사의 검증 데이터 요구. 보충 1줄 | `reviews/round-363-owner-answers.md` |
| 2026-10-15 | 364라운드 소유자: 지름길은 배열 동사 전부에, 원칙 변경이 필요하면 보고. 보충 1줄 | `reviews/round-364-owner-answers.md` |
| 2026-10-15 | 365라운드 소유자: push·pop 꼬리 연산, remove·insert 재매김 동사 틀; insert를 지금 추가해 remove 비효율과 함께 해결. 보충 1줄 | `reviews/round-365-owner-answers.md` |
| 2026-10-15 | 366라운드 소유자: 지름길 설계는 볼 것 없음, 중간 결과 보고. 보충 1줄 | `reviews/round-366-owner-answers.md` |
| 2026-10-14 | 316라운드 소유자: constants·hooks organ(index 제거), organ 안 barrel 금지, Field를 Form처럼 components/ 아래로. 보충 2줄 | `reviews/round-316-owner-answers.md` |
| 2026-10-14 | 317라운드 소유자: Form barrel 삭제, 병렬 진행(정돈-S 병렬), 검증 뒤 병합 위임, surface/classes → runtime, 손질은 단일 PR. 보충 4줄 | `reviews/round-317-owner-answers.md` |
| 2026-10-14 | 318라운드 소유자: fieldInputs를 입력마다 fractal로(넷째 손질, fixy08 별도 PR), ArrayItems 래핑은 memo 경계라 유지. 보충 1줄 | `reviews/round-318-owner-answers.md` |
| 2026-10-14 | 313라운드 소유자: 정돈-E·S도 codex 없이 fixy08 직접. 보충 1줄 | `reviews/round-313-owner-answers.md` |
| 2026-10-14 | 314라운드 소유자: Form 재구성(FormCore·Form.* 다섯은 fractal), 이름 함정 수정, 문서화는 fairy08 위임, INTENT 한국어. 보충 1줄 | `reviews/round-314-owner-answers.md` |
| 2026-10-14 | 309라운드 소유자: 이동 속도 지적; 순수 이동은 fixy08 직접, 전체 게이트는 PR 직전 한 번 허락(217C-01 예외). 보충 2줄 | `reviews/round-309-owner-answers.md` |
| 2026-10-14 | 310라운드 소유자: 벤치는 측정 없이 시작 확인 한 번, 오래 걸리는 절차는 묶어 한 번(단계마다 전부 검사는 과함). 보충 2줄 | `reviews/round-310-owner-answers.md` |
| 2026-10-14 | 311라운드 소유자: 정돈-3이 구조 리뷰 전 마지막, 리뷰 중 구조 추가 조정, 오늘 밤 속도 측정·개선 루프. 보충 1줄 | `reviews/round-311-owner-answers.md` |
| 2026-10-14 | 301라운드 소유자: 대기열은 직접 닫기, 53은 옵션 기능으로 재검토(SPECIFICATION의 minItems 채움 문장은 코드와 어긋남), CLAUDE.md 갱신 진행. 보충 2줄 | `reviews/round-301-owner-answers.md` |
| 2026-10-14 | 302라운드 소유자 생각: 53 유익·손해 비교 요청 → array-limits-review.md. 보충 1줄 | `reviews/round-302-owner-answers.md` |
| 2026-10-14 | 303라운드 소유자 생각: 53 경계·일관성 → "적용 가능성에는 따르고 제약은 강제하지 않음" 한 줄. 보충 1줄 | `reviews/round-303-owner-answers.md` |
| 2026-10-14 | 304라운드 소유자 답: 53 확정(경계 문장 수용, 현행 유지, UI 전용 빈 슬롯 작은 PR, controls 옵트인은 새 라운드). 보충 2줄 | `reviews/round-304-owner-answers.md` |
| 2026-10-14 | 298라운드 소유자: 구조 리뷰 전까지 정돈 전부 무정지 진행, 판단은 대기열, PR 병합 허용 | `reviews/round-298-owner-answers.md` |
| 2026-10-14 | 293라운드 소유자: FCA import 멘탈모델(외부·형제·직계, 직계는 내부 모듈, 공통 부모 organ, 부모→자식 비대칭). 보충 2줄 | `reviews/round-293-owner-answers.md` |
| 2026-10-14 | 294라운드 소유자: 보강 다섯 수용, 모델 기록(fca-import-model.md), 구조 검사 지시, filid 개선 여부는 마지막에 결정. 보충 1줄 | `reviews/round-294-owner-answers.md` |
| 2026-10-14 | 295라운드 소유자: D7(공개 API 시험은 외부)·D8(B6·B7) 허용, 모델 안 변용 허용, filid 언어 중립. 보충 1줄 | `reviews/round-295-owner-answers.md` |
| 2026-10-14 | 296라운드 소유자: 정돈-1 뒤 정돈-2 즉시, fairy08에 export 재검사 배정 | `reviews/round-296-owner-answers.md` |
| 2026-10-14 | 287라운드 소유자 지시: 최소 export 원칙의 까닭·전제를 가이드에 적고 fractal 뿌리·index를 전수 재검사. 보충 1줄 | `reviews/round-287-owner-answers.md` |
| 2026-10-14 | 288라운드 소유자 지시: filid 이슈는 초안만(규칙 위반/결함 가린 뒤 등록), CLAUDE.md 자리 검토, 수정 계획 제시 → `plan/tidy-structure/request.md`. 보충 1줄 | `reviews/round-288-owner-answers.md` |
| 2026-10-14 | 289라운드 소유자 답: 정돈 D1–D6 확정(진행, nodeFromJSONSchema 하향·문서 삭제, providers organ 둘, 오류 코드 object enum root export, 가이드 자리, 이슈는 정돈-2 뒤). 보충 1줄 | `reviews/round-289-owner-answers.md` |
| 2026-10-14 | 290라운드 소유자 지시: 작업자 fixy08·fairy08, 원장 관리자는 관리만. 정돈-1 브리프 발송 | `reviews/round-290-owner-answers.md` |
| 2026-10-14 | 291라운드 소유자: 리터럴 규약 금지(JSON Schema type 제외), 순서 정돈 → 구조 리뷰 → 최적화. 전수 판정 string-literal-audit.md, 정돈-E E1–E5 | `reviews/round-291-owner-answers.md` |
