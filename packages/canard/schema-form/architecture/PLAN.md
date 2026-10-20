# PLAN — `@canard/schema-form` 1.0.0-beta 진행 상황판

> 이 문서가 개발의 **단일 진입점**이다. 어느 계획이 있고(§1), 어떻게 수행하며(§2), 어디까지 왔고(§3), 다음에 무엇을 하는지(§4)를 여기서만 갱신한다. 정본은 원장 `ledger/`(설계)와 `plan/<순서>-<이름>/`(단계 계획)이며, 이 문서는 그 위의 상황판이다. 세션 인수인계는 `HANDOFF.md`(메인 에이전트를 Claude에서 codex로 바꿀 때의 작업대·Orca 상태·열린 PR은 `AGENT-HANDOFF.md`), 우산 구조·절차의 설명은 `plan/README.md`가 든다.
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

426라운드에서는 T14 후속 진단·게이트 재실행과 조건부 독립 검토 뒤 시간 잡음의 소유자 예외로 PR424를 수용했고, Vincent가4e9b6786e로 직접 병합했습니다. itemless 재측정의 새 창은 대표 행의 부호가 반대여서 차이가 입증되지 않았으며 이전 창을 뒤집거나 확인하지 않습니다. 두 창의 원자료를 소유자 결정60의 근거로 넘기고 owner54/58/59/60·TEST-027/M3·성능 수용·PR423 병합과 P1 전체 protocol 실패는 보류합니다. 현재 경로·봉인과 한계는 reviews/round-426-t14-followup-and-remeasurement.md를 따릅니다.

최적화 작업은 **nested 마운트 가설 둘을 병합하고 가설 4의 보류 질의와 oneOf 마운트 진단으로 진행 중**입니다(439라운드). 426라운드에 T14 검증 도구를 수용해 PR424로 병합했고 제품 코드 변경은 0입니다. 새 itemless 재측정 창은 차이가 입증되지 않아 두 창의 원자료를 결정 60의 근거로 넘겼습니다. 427라운드에 진입 문서를 압축했고, 옮긴 글은 `PLAN-LOG.md`와 `_archive/2026-10-20/`에 있습니다.

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
| 07 | 전환 | 머지 | [#354](https://github.com/vincent-kk/albatrion/pull/354) | 2026-10-14에 `1.0.0-beta`로 병합(`9c4d4a59d`). 브랜치 `feat/schema-form-switch`(2026-10-02 착수, 2026-10-11 `1.0.0-beta` `351ece24e` 위에 다시 세움). 원샷. 측정 원자료는 `archive/stage-07-verification-raw`(140라운드). 실행 계획은 [execution-plan](plan/07-switch/execution-plan.md), 기록은 [log](plan/07-switch/log.md) |
| 08 | 플러그인 | 완료 | — | 별도 PR 없음. `presentation.*` 이주와 이름 대응은 07b(#365)·07d(입력 설정 이주, 플러그인 0.17.0)에서 끝났고 PR마다 플러그인 일곱 빌드가 게이트로 돌았다(331라운드 소유자 답). 계획서가 인용한 옛 경로(`plan/07-switch/log.md` "08 목록")는 역사 기록. 미확인 셋은 대기열 54 |
| 정돈 | 코드 정돈 | 진행 | — | 07 뒤·08 앞(287라운드), 최적화 앞. 계획 [request](plan/tidy-structure/request.md), 결정 D1–D6 확정(289라운드). 정돈-1부터 PR 넷. 정돈-1 #374 병합 ae502f7bd(297라운드), 정돈-2 진행. 소유자가 코드를 직접 보며 파일 구성·함수 이름·함수 로직을 손질한다(76라운드 소유자 답, `reviews/round-76-owner-answers.md`). fractal 경계와 공개 인터페이스는 바꾸지 않는다. 원칙을 소유자 라운드로 먼저 적고 작업 세션이 한 번에 적용, 동작 불변은 차등 시험·기존 스위트·벤치로 보임. P-24·P-25를 함께 처리할 수 있음 |
| 최적화 | 성능 최적화 | 진행(가설 3·2 병합, 가설 4 보류 질의, oneOf 마운트 진단) | [#423](https://github.com/vincent-kk/albatrion/pull/423) | 브랜치 `feat/schema-form-08-review-and-perf`에서 원장과 작업 폴더를 운영한다. 병합: L3 다섯 가설 #416~#420, 측정 문서 #421, 마운트 완료 경계 #422(`ef6747ea0`), T14 검증 도구 #424(`4e9b6786e`), 가설 N #425(`2efad372d`), 가설 F #426(`335874be2`). Draft #423(itemless 빈 선언 조회 제거)은 두 측정 창이 엇갈려 결정 60을 기다린다. 남은 것은 F·nextExtras 가설, 결정 58 실험, M3 종합 재측정과 소유자 수용, 결정 54이며 대기열 59·TEST-027·P1 전체 protocol 실패도 보류다. 429라운드 소유자 지시로 다음 작업을 시작했다. 430라운드에 기준 측정 창(`verification/perf-optimization/baseline-430-results.md`)을 쟀고, 가설 N·F는 433라운드 소유자 허가로 코디네이터가 병합했다. 434라운드에 M3 종합 재측정 결과(`verification/perf-optimization/m3-results.md`)를 제출했다: 느린 행 92개 가운데 (나) 58행의 묶음 수용과 결정 60(PR423, 코디네이터 권고는 병합)을 소유자가 판단하고, (가) 20행(oneOf·nested·flat)은 82C-01 진단과 결정 58 실험으로 이어진다. 435라운드에 소유자가 결정 60과 (나) 58행을 코디네이터 권고대로 수용했다(전제: 기능 무결성·예측 가능성 등 설계 원칙 준수). 마운트 지연 단계는 닫혔고 PR423은 436라운드에 여섯 조건을 거쳐 병합되었다(`d9f4eb975`). 437라운드에 (가) 20행의 82C-01 크기 진단과 (다) 14행의 추가 확인을 마쳤다: 상수 배 19행은 소유자 묶음 수용 질의, 초선형 8행(oneOf 갱신의 N 비례 게이트 재평가, nested 마운트의 경로 인코딩)은 수정 대상, (다) 7행은 확인 대상이며, 결정 58 확인 휠 생략 실험의 설계를 두었다. 지난 경위는 `PLAN-LOG.md`와 `_archive/2026-10-20/PLAN.md`에 있다. 계획은 [request](plan/perf-optimization/request.md)이며 끝나면 `1.0.0-beta`에 squash한다. 438라운드에 소유자가 상수 배 19행을 수용하고 결정 58을 채택했으며 PR427이 병합되었다(`7039bce5a`); 가설 2는 재생성 유지(채택 시 같은 스키마만 재사용)이고 다음은 nested 마운트 나머지 원인 진단과 가설 1 설계다. 439라운드에 nested 마운트 원인 진단을 마치고 가설 3(#428 `cc1b1db47`)·가설 2(#429 `8a3ee595a`)를 병합했으며, 가설 4(#430 NODE_ENV 모듈별 읽기)는 esbuild 소비자 번들 제거가 깨져 200C-01 역전 여부를 결정 61로 올렸다. 단계마다 마운트 속도 표를 보고한다. |
| 09 | 정리·릴리스 | 대기 | — | 08·최적화와 릴리스 전환 PR 뒤. 머지되면 우산을 `master`로 |
| 별도 | 릴리스 전환 | 대기 | — | 시점은 소유자가 정한다(LANDING-204) |

### 열린 소유자 결정

| 번호 | 물음 | 막는 것 | 어디에 기록 |
| --- | --- | --- | --- |
| D-1 | 명령 메서드의 이름·명령 종류 값의 형·`FormHandle` 대칭 모양 | 닫힘(30라운드): 이름 `request`, 값은 요청 비트 별칭의 TS 열거, 한 호출에 종류 하나, 둘째 인자 없음, 폼 핸들은 전용 메서드 넷(경로는 선택, 없으면 루트) | `reviews/round-30-owner-answers.md`, EVENT-073·063·SURFACE-058·059·REACT-025 보충 |
| D-2 | 릴리스 전환 PR을 여는 시점 | 09 착수 | LANDING-204 보충 |

## 4. 다음 할 일

**429라운드 소유자 지시로 성능 측정과 개선 작업을 시작했습니다.** 에이전트 분담과 사용량 한도는 AGENT-HANDOFF.md 1절을 따릅니다. 순서와 단계별 목표는 다음과 같습니다.

1. **core 마운트 비효율 제거(최적화 M2 계속).** 이름 붙은 비효율을 하나씩 없애되 관측 결과는 그대로 둡니다. nextExtras 결과 키 재열거 제거(가설 N, #425)와 F 가설(첫 객체 합성의 중간 이름 구성 제거, #426)은 병합되었습니다. M3 창(434라운드)은 PR423 판에서 느려진 행이 없음을 보였고, 435라운드에 소유자가 결정 60과 (나) 58행을 수용해 마운트 지연 단계가 닫혔습니다. PR423은 436라운드에 병합되었습니다(제품 끝 `d9f4eb975`). 437라운드에 (가) 20행의 82C-01 진단과 (다) 14행의 추가 확인을 마쳤습니다(`verification/perf-optimization/size-diagnosis-437-results.md`, `open-rows-437-results.md`). 438라운드에 결정 58 확인 바퀴 생략 실험(PR427)을 소유자가 채택해 병합했습니다(제품 끝 `7039bce5a`; oneOf-80 갱신 −29.65 %, gate-form-one-key −25.66 %/−29.66 %, 마운트 동치). 상수 배 19행은 소유자가 묶음 수용했습니다. 가설 2(같은 스키마의 청사진 재사용)는 소유자가 재생성 유지를 택했고, 뒤에 채택하면 "스키마가 동일할 때만 재사용, 달라지면 재구성"입니다. 439라운드에 nested 마운트 나머지 원인을 진단했고(`nested-mount-diagnosis-439.md`), 가설 3(자식 대상 검증 생략, #428)과 가설 2(형상 검증 생략, #429)를 병합했습니다(제품 끝 `8a3ee595a`). 가설 4(NODE_ENV 모듈별 읽기, #430; Node 직접 실행에서 nested d6 −31 %)는 esbuild 소비자 번들에서 개발 코드 제거가 깨져 소유자 결정 200C-01의 역전 여부(결정 61)를 기다립니다. 다음은 oneOf 마운트 바퀴 구조 진단(루트 호스트 다섯 바퀴 중 세 바퀴가 입력 불변)의 문서화와 가설 H1(세 번째 계산 패스 제거) 설계, 가설 1(경로 interning), (다) 7행입니다. flat-2000 갱신의 `assembleObject` 전체 복사는 열린 행으로 후속 측정합니다. 가설마다 네 게이트·관측 동치·독립 검토·같은 창 측정을 거쳐 병합하고, 지울 근거가 없는 잔여는 M3 수용 후보로 넘깁니다. 기준 측정은 430라운드에 마쳤습니다(`verification/perf-optimization/baseline-430-results.md`).
2. **M3 종합 재측정과 수용.** 0.16.1, 최적화 전, 최적화 뒤의 세 판을 한 창에서 core와 React 포함 폼 수준으로 재고 정상동작 검증 보고와 함께 올립니다. 정본은 폼 전체 e2e입니다(358라운드). 남은 느린 행마다 이유와 수치를 붙여 Vincent가 수용합니다(TEST-027). React 포함 폼 수준의 마지막 측정은 2026-10-15 L1 직후입니다.
3. **플러그인·내장 fallback 결함 여덟 건 수정 PR.** 결정 54를 이때 판단합니다.
4. **09 정리와 릴리스.** 레거시 삭제, 릴리스 전 벤치 재실행(폼 전체 e2e), 번들 크기와 모바일 재측정을 하고 릴리스 전환 시점(D-2)을 정한 뒤 `1.0.0-beta`에 squash합니다. 원장 본문과 `reviews/` 기록의 보관도 이때 한 번 합니다(427라운드).

성능과 별개로 열린 것은 01 설계문서의 절 단위 통과(§3 표의 "절 통과 대기")와 정돈 단계(§3 표의 "진행")입니다. 07 진행과 D-1 등 끝난 옛 항목은 `_archive/2026-10-20/PLAN.md`로 옮겼습니다.

## 5. 기록

기록은 [`PLAN-LOG.md`](./PLAN-LOG.md)에 있다 — 1절은 날짜·무엇·어디의 표(라운드·PR·머지마다 한 행, 끝에만 덧붙임), 2절은 라운드별 요지다. 이 문서에는 마지막 행만 둔다.

| 날짜 | 무엇 | 어디 |
| --- | --- | --- |
| 2026-10-20 | 439라운드: 소유자가 단계별 속도 표 보고 규칙과 8단계 완료 목표를 지시했고, nested 마운트 원인 진단, 가설 3(#428 `cc1b1db47`)·가설 2(#429 `8a3ee595a`) 병합, 가설 4(#430) esbuild 제거 실패로 결정 61 보류, production 재측정 표(mount-env-439·439b), 작업 폴더 둘 삭제 | reviews/round-439-closing.md |

