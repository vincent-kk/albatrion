# IR-7 — 숨김 폼의 engine chain 끝 전달

## 변경과 규칙

기준 제품은 stage `7428d5db8`(#509)입니다. 계약 `c662e7b93` → 시험 `a2984dfc6` → stage red `ffef4d91a` → 제품 `ca8b7ad2f` 순서로 커밋했습니다. 시험 타입·도우미 정리 `6f1b36f22` 뒤 최종 시험 텍스트를 stage 제품으로 다시 실행해 `b85f1f8bb`에 SHA256과 red를 보존했습니다. 버전·패키지 진입점·공개 선언은 변경하지 않습니다.

첫 layout commit을 마친 현행 load는 숨김·effect 연결 여부와 관계없이 onChange·onStateChange·onValidate·onDiagnosticsChange·onError를 보이는 폼과 같은 순서·내용으로 engine chain 끝에 전달합니다. never-prepared load는 변경·상태·진단을 버리고 생성 기록만 첫 commit까지 보관합니다. reset으로 은퇴한 load는 hasConsumer가 false이고 기록을 버립니다. Provider는 추가 호스트 보고를 만들지 않으며 기존 engine sink와 폐기 stamp 규칙을 유지합니다.

구독은 첫 commit 또는 reset에서 한 번 설치해 load 교체까지 유지합니다. cleanup은 검증 캐시 참조만 해제합니다. owed·reconnect flush를 제거했고, 첫 commit 전에 교체된 옛 load에는 prepared만 설정합니다. reset은 batch try/catch 뒤에 이전 load를 은퇴시키고, 마지막 build 기록 flush를 handler마다 격리해 소비자 예외 뒤에도 기록과 binding 교체를 완료합니다. recordOrigins·warning scope·reported 가드·pendingLoad fallback은 유지합니다.

## L1–L4 수용 한계

- L1: React는 숨김과 실제 unmount를 구분하지 않습니다. 실제 unmount 뒤에도 prepared와 루트 구독은 유지되며 보유한 핸들·노드의 쓰기, reset·rebuild·validate·submit과 예약 슬롯은 콜백을 전달합니다. mounted 트리의 검증 루트 참조 수는 cleanup에서 해제합니다. unmount 뒤 reset으로 만든 새 루트는 retain하지 않아 캐시 축출 뒤 재컴파일할 수 있습니다.
- L2: 숨김 중 onChange·onStateChange·onValidate·onDiagnosticsChange는 마지막 연결 commit의 콜백을 사용하고 prop 갱신은 show에 반영됩니다. onError는 insertion effect로 최신입니다. 숨김 중 Form ref는 null이므로 이전에 보유한 핸들·노드를 사용합니다.
- L3: 필드 layout effect의 렌더 경고와 쓰기는 show에 도착합니다. prepared load의 show 쓰기는 즉시 전달하지만 최초 mount의 준비 전 쓰기는 REACT-007에 따라 버립니다. 개발 StrictMode replay도 React가 hide/show로 모델링하므로 replay의 비멱등 layout 쓰기는 전달되며 production 렌더는 영향을 받지 않습니다.
- L4: 루트 교체 reset의 기록은 binding을 새 루트로 바꾸기 전에 전달하므로 onError 안의 handle.node는 옛 루트입니다. mount-time 기록이 build-time 기록보다 먼저 도착합니다.

## 시험과 red/green 증거

[최종 stage red와 SHA256](raw/ir-7/final-red-runs.json), [최초 red와 V7 unit](raw/ir-7/red-runs.json), [불변 guard 변형](raw/ir-7/mutation-runs.json)을 구분합니다. stage 제품에서 React19는 17실패·18통과, React18은 15실패·17통과·19 전용3 skip, V7 unit은 1실패입니다. 기존 시험·불변 guard의 기준 통과를 red로 세지 않습니다. product focused green은 React19 35개·React18 32개·unit1개이며, 최종 전체 관문이 최종 텍스트의 green을 다시 검증합니다.

| 시험 | 기준 실패 또는 예외 | 검증한 동작 |
| --- | --- | --- |
| T1 | 양쪽 major에서 숨김 log와 가시 log가 다름 | 동일한 안정 props/validator로 valid·misfit·validator throw·subtree state·reset·rebuild를 수행하고 다섯 콜백의 순서와 인자를 구조 비교. show 뒤 추가 log 없음 |
| T2 | hidden slot의 검증 호출0 | 숨김 중1회 검증하고 show 뒤 증가 없음 |
| T3 R1 | 숨김 중 onError0 | layout-write compile 실패를 hidden chain 끝에1회 전달 |
| T3 V6 | 숨김 중 onError0 | 던지는 처리기 뒤 다음 hidden 기록과 호스트 보고를 유지 |
| T3 rebuild | rebuild 전 onError0 | 이전 실패는 쓰기 때 이미 전달하고 rebuild/show에서 재생하지 않음 |
| T3 W4 | async mount rejection의 hidden onError0 | engine의 rejected 기록을 hidden에서1회 전달하고 recapture 없음 |
| T3 W5 | hidden observer guard 실행0 | hidden chain의 onError에서 현행 폼 쓰기를 차단 |
| T3 hidden-reset-records | 쓰기 때 warning0 | 쓰기와 reset 각 호출에서 원래 load별 경고를 한 번씩 전달 |
| T3 after-paint (d) | unmount 뒤 validator0 | 예약 mount 판정1회·오류 기록0이라는 L1을 확인 |
| T3 bufferedRecords | never-prepared 기록이 reset 뒤에도 남음 | 첫 준비 전 기록만 이전 root/scope로 옮겨 reset 끝에 한번 flush |
| T4 initially hidden | 승인된 기준 통과 예외, React19 전용 | 최초 show 전 무배달·ref null, construction warning을 show에 한번 flush |
| T4 validator 교체 | stage는 폐기된 옛 root의 applyFormErrors에서 render fallback으로 진행 | 준비 전 validator 교체의 기록 각1회 및 새 root 단일 구독. C4의 옛 load 생략 분기가 함께 해결 |
| T5 reset/rebuild | show 뒤 같은 root의 진단2회 | 교체·같은-schema reset 후 한 번의 reset 진단은1회 |
| T5 cycles/StrictMode/cache lifetime | 코디네이터가 baseline-pass guard로 승인하고 mutation red를 조건으로 부과 | 매 setup 재구독 변형은 cycle3회·StrictMode6회로 실패; release 생략 변형은 참조 불균형으로 실패. 두 major 각각 검증 |
| T6 visible/hidden | visible은 handler throw로 reset 중단; hidden은 이후 쓰기 기록0 | build-time DialectMismatch 처리기 예외를 호스트1회로 격리하고 새 binding·후속 기록·쓰기 성공 |
| T7a | rebuild와 같은 act의 옛 detached node가 onError1회 | retired load는 소비자에 배달하지 않고 현행 폼을 계속 사용 |
| T7b | 승인된 기준 통과 예외 | rebuild 뒤 정착한 옛 write validation rejection은 onError·호스트 모두0 |
| T8 L1 | unmount 뒤 onChange0 | 보유한 node의 쓰기가 onChange1회 전달 |
| T8 L2 | hidden 중 옛 콜백도 호출0, React19 전용 | onError는 숨김 prop commit 직후 최신, 나머지 네 콜백은 show까지 마지막 연결 commit 사용 |

T3의 `validation.continuity-restore.render.test.tsx` X1 4개는 변경 없이 통과했습니다. 초기 speculative/StrictMode 관련 Form.binding·RootNodeContext.binding·Form.reactVersions·settle 회귀는 전체 관문으로 확인합니다. lint의 도우미 Fast Refresh 경고는 Suspense Gate를 별도 컴포넌트 파일로 나누고, 스키마 fixture 타입은 리터럴로 고정해 해결했습니다. 최초 로컬 의존 번들 누락에 따른 수집 실패는 red 증거에서 제외했습니다.

## 순차 관문

모든 실행 관문은 서로 겹치지 않게 lint → typecheck → build → unit → render → react18 → verify → Storybook → production → import-model 순으로 완료했습니다. 불변 guard 승인·mutation 검증은 unit 뒤 render 시작 전에 수행했습니다. 원시는 [실행 영수증](raw/ir-7/command-gates.json), [시험 집계](raw/ir-7/test-gates.json)와 각 gate JSON gzip에 있습니다.

| 관문 | 파일 | 통과 | 실패 | skip / todo |
| --- | ---: | ---: | ---: | ---: |
| unit | 619 | 4,089 | 0 | 0 / 1 |
| render | 158 | 896 | 0 | 2 / 0 |
| react18 | 158 | 892 | 0 | 6 / 0 |
| verify | 782 | 5,029 | 0 | 2 / 1 |
| storybook | 101 | 254 | 0 | 0 / 0 |
| production | 10 | 21 | 0 | 0 / 0 |
| import-model | 1 | 2 | 0 | 0 / 0 |

lint는 `--max-warnings 0`, typecheck·build는 exit0입니다. build의 DEVELOPMENT_FLAG_OK·GATE_SELECTION_DIST_OK와 세 runtime bundle의 크기·SHA256을 [build artifact](raw/ir-7/build-artifacts.json)에 보존했습니다. dist는 추적하지 않으므로 source와 함께 커밋할 생성 runtime bundle·adapter 차분이 없습니다. production은 검증한 후보 build 그대로 사용했습니다.

공개 선언은 기준과 후보 모두 지정 full build로 만든 뒤 기존 평가 비교기로 검사했습니다. 공개 이름97·도달 선언917·각 공개 root 추적97개이며 의미 차이·미해결 alias·전체 runtime 노출·index 바이트 차이는 모두0입니다. `src/index.ts`와 package.json 차분도0입니다. [선언 원시](raw/ir-7/public-declarations.json.gz), [첫 비교의 기준 build 진단](raw/ir-7/declaration-baseline-diagnosis.json)에 보존합니다. 첫 시도의 build:types 단독 기준에는 공유 @aileron/declare가 없어 추가13·미해결 alias1275였고, full build의 동일 조건으로 해결했습니다. 검사기를 완화하거나 제품 선언을 바꾸지 않았습니다.

FCA는 추측성 소스 교체와 별개로 기준·후보 각각 bundled extractor의 facts를 등록한 뒤 비교했습니다. 기준 exact1,754 → 후보1,760, missing·needsResolution·uncertain·toolError·미판정·pending attestation은0이며 기존 unsupported175는 유지합니다. validate finding202·확정 실패12·skip1·진단177의 원시 multiset 차이가0입니다. 후보 scan201·verification21과 같은 snapshot hash도 보존했습니다. [FCA 차분](raw/ir-7/fca-diff.json), 각 fca JSON gzip을 확인할 수 있습니다. 절대 상태 `indeterminate`와 기존 위반은 유지하며 깨끗한 전체 통과라고 보고하지 않습니다. 새 시험 case 수10·2·1·1은 모두 exact인 test-record이며 cap32 이내입니다. 첫 미등록 facts 실행의 새 진단4개를 bootstrap으로 해소했습니다.

전체 [원장 검사](raw/ir-7/ledger-checks.json)와 [원시](raw/ir-7/ledger-logs.json.gz)는 verbatim 불일치0, supplement 불일치0·unparsed0, ref 문제0, owner 답720·인용720·미인용0, 17영역 sentence missing0·bad classification0입니다. tokens 목록2,390·잔여398은 기존 범위이며, 기존 plan-links의 분할된 ERROR-038 참조1건과 doc-coverage 미인용66건을 보존합니다. 새 bad ID·missing token·untagged sentence·stale exemption은0입니다. 기존 ledger·ADR·design·plan prefix는 그대로 유지했고 소유자 원문39–41도 그대로입니다.

[skip 소스 감사](raw/ir-7/skip-source-audit.json)는 기존 skip·todo·fails 선언 변경0과 새 React19 전용 context.skip3개만 보여 줍니다. render 기존2 skip, react18 기존3+신규3 skip, unit·verify 기존 todo1을 유지합니다. 최종 제품·시험 SHA256을 다시 대조했으며 machine-path·기록 prefix·diff 공백 감사를 완료합니다.


## 비용과 범위

prepared/retired 조건은 상수 시간 flag 검사입니다. ready와 mountValidationOwed를 제거했으며, 새 타이머·프레임 루프·검증 재시도는 추가하지 않았습니다. 숨김·unmount 뒤에는 보유한 핸들·노드가 구독과 마지막 콜백을 함께 유지할 수 있으며 reset 또는 GC까지 수명이 이어집니다. 검증 캐시 참조는 effect cleanup에서 해제합니다.

설계대로 browser 측정 창과 benchmark는 실행하지 않았습니다. 기존 측정 행은 Form을 숨기지 않으므로 IR-7의 성능 개선 수치를 주장하지 않습니다. Storybook 브라우저 시험은 기능 관문으로만 실행합니다. dist는 저장소에서 추적하지 않으며 빌드·artifact 검사를 실행한 후 추적된 생성 runtime bundle 또는 adapter 차분이 있는지 확인합니다.

## 정리

코디네이터 승인 조건의 scratch `ir-7-guard-mutation`은 증거 커밋 직후 bare Orca 명령으로 제거하고, Orca가 남긴 임시 branch도 삭제했습니다. 새 scratch worktree·branch는 남기지 않았습니다.


### IR-7 round b — 독립 검토 수정 (2026-11-01)

reset의 옛 load 은퇴는 batch try/catch 뒤·최종 build 기록 flush 앞으로 옮깁니다. adoption 전 컴파일 실패를 포함한 reset 사슬의 옛 runtime 기록은 사슬 끝에 onError 한 번으로 전달하고 caller에 다시 던지며 호스트 sink는 0회로 유지하고, batch가 던져도 이후 은퇴합니다. 교체된 never-prepared load의 생성 실패도 reset 끝에 reported 가드로 한 번 capture·호스트 보고하며 새 reporter.root를 유지합니다. 첫 commit 구독은 이전 구독을 먼저 해제해 reset이 이전 load를 반환한 경우에도 한 구독만 남깁니다.

L3에는 개발 StrictMode replay를 포함합니다: including the development StrictMode replay, which React models as a hide and show; production renders are unaffected. 비멱등 자식 mount layout 쓰기는 replay의 prepared load에서 onChange로 한 번 전달합니다. 최초 준비 전 쓰기는 계속 버립니다.

T7a는 retired load의 hasConsumer()가 false여서 report 호출 자체에 도달하지 않는 경로입니다. 소비자 무배달만 검증하며 reporter.root 유지·복원을 검증했다는 주장은 제거합니다. T4 validator 교체 뒤 구독 단언은 기존 구독 변형에서도 red를 확인합니다. T7b는 validator start promise를 기다리고 hidden mount 시험은 숨기기 전에 확보한 node로 settle합니다. 새 회귀는 visible/hidden adoption 실패, never-prepared 생성 실패, 양쪽 major StrictMode replay이며 최종 커밋 시험의 red·mutation·green 해시와 모든 순차 관문은 round b 결과에 보존합니다.

구현·시험·관문 결과는 완료 후 이 round b 절에 확정합니다.


### Round b host 표면 정정 승인

기준 stage의 visible adoption 전 compile 실패를 양쪽 React major에서 관찰한 결과 caller throw·onError1·host0이었습니다. 코디네이터가 이 기존 표면을 계약으로 승인했으며 처음 브리프의 host 보고 가정은 대체합니다. 수정 뒤 visible·hidden 모두 caller throw·onError1·host0을 검사하고 커밋 시험 텍스트의 stage visible green과 06df red를 저장합니다. never-prepared 생성 오류의 reset 끝 capture·host1 보고는 이 adoption 실패와 다른 경로이며 그대로 유지합니다.
