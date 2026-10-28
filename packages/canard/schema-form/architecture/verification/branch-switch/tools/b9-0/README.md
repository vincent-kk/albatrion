# B9-0 측정 계약

제품 기준은 `4d0fa4a12`입니다. 제품 소스를 수정하지 않으며 `buildStages.mjs`는 B6 장치를 복제한 scratch builder입니다. `wrapped` 번들의 바이트와 선언 manifest가 B6와 같음을 준비 단계에서 단언합니다. 새 함수와 영역 타이머는 `supplemental`에만 추가하며 `gap`은 별도 경계 진단, `diagnostic`은 시계 없는 캐시·콜백 진단입니다. source 진입점을 esbuild scratch 입력으로 읽고 제품 hook을 추가하지 않습니다.

`rows.mjs`의 여섯 행은 모든 장치가 공유합니다. 기존 setupWrite가 oneOf의 형제 수를 보존하지 않으므로 `operation.mjs`가 `fixtures.mjs`의 oneOf 형상을 직접 구성합니다. payload-12만 기존 branch-switch 형상을 사용합니다. 모든 시간 단위는 쓰기 한 번이며 구성·마운트·값 검사·legacy 정착 대기를 current 시간에 넣지 않습니다. legacy만 과거 비동기 정착을 타이밍에 포함합니다. siblings의 legacy는 분기 기본값 x/y가 바뀌고 current는 기존 값을 유지한다는 기존 차이를 그대로 검사하며 legacy는 창 품질에만 씁니다.

## 실행 순서

기존 설치의 Node 26을 사용합니다. `B9_RUN`은 새 외부 디렉터리, `B9_AGENT_PID`는 실행 중인 자체 에이전트의 PID입니다. 설치나 다른 창을 동시에 실행하지 않습니다.

```sh
B9_TOOLS=packages/canard/schema-form/architecture/verification/branch-switch/tools/b9-0
yarn workspace @canard/schema-form build
# 필요한 @winglet workspace dist 및 AJV8 plugin dist를 지정 build로 준비합니다.
yarn workspace @canard/schema-form-ajv8-plugin build
node "$B9_TOOLS/checkTools.mjs"
node "$B9_TOOLS/prepare.mjs" "$B9_RUN" 4d0fa4a12
yarn workspace @canard/schema-form build
node "$B9_TOOLS/verifyBuild.mjs" "$B9_RUN"
node "$B9_TOOLS/staticPreparation.mjs" "$B9_RUN"
node "$B9_TOOLS/checkLoad.mjs" "$B9_RUN"
# 코디네이터가 다른 시험·빌드·창을 멈춘 뒤 한 번만 실행합니다.
node "$B9_TOOLS/window.mjs" "$B9_RUN" --authorized "$B9_AGENT_PID"
node "$B9_TOOLS/summarize.mjs" "$B9_RUN" packages/canard/schema-form/architecture/verification/branch-switch/raw/b9-0
```

무시간 smoke는 번들당 한 프로세스에서 여섯 행을 기본 두 번 실행하고(legacy oneOf-80은 가드 검증을 위해 120번) clock-free recorder로 값·권한·의존성·적재를 확인합니다. `formal-start.json`은 이 smoke와 해시 검증 뒤에만 생성하며 재실행은 거부합니다. 공용 `../window/` 장치가 시작 전과 각 프로세스 전 3초 평균·개별 외부 PID 30%·최대 120초 시작 지연을 적용합니다. 자체 agent와 관측기만 제외합니다. 환경 실패는 458C-03으로 보존하고 코디네이터에게 보고합니다.

정식 창은 여섯 행 × 세 pass × 10프로세스이며 각 프로세스는 20예열/100표본입니다. ledger pass에서 dist·unwrapped·wrapped·legacy 순서를 회전하고, supplemental/gap은 각각 unwrapped와 번갈아 실행합니다. legacy 품질은 여섯 행 각각의 앞5/뒤5 프로세스 최소값 중앙 비를 구한 뒤 행간 중앙이 0.95–1.05인지 판정합니다. 품질 미달은 그대로 보고하고 재실행하지 않습니다.

wrapped는 B4-2의 원래 recorder를 그대로 사용합니다. supplemental의 scoped 장부는 가장 가까운 기존 B6 경계에 추가 타이머 self를 귀속하여 `computeNode`와 `finalizeExits`의 이전 self 안에서 생긴 비용만 분리합니다. `sameValue` 재귀의 inclusive 합은 중복될 수 있으므로 분할에는 self만 사용합니다. 개별 단계 중앙값의 합은 총합 중앙값과 같지 않습니다. 각 표본의 self 합은 원시 총시간과 일치해야 합니다.

gap의 `beforeSettlementUs`는 setValue 호출 직전부터 `writeFieldNode` 함수 진입까지입니다. `writeFieldNode`는 컨텍스트 준비·정착·scratch 반환을 포함합니다. `runDeliveryWaves`는 커밋 후 배달 경계입니다. `deliverWave`는 `flushQueuedEvents`에서도 호출되므로 `subscriberWaveUs`가 항상 `deliveryUs`에 포함되지는 않습니다. fixture는 onChange no-op이며 명시적 subscriber는 없습니다. 행 차이의 항등식은 `row − wrapped = (dist − unwrapped) − (wrapped − unwrapped) + residual`입니다. 진입·writeFieldNode self·배달·사슬 종료는 두 총시간 안에 모두 있으므로 이 차이에 더하지 않습니다. 이들은 기존 비교 장부의 everythingElse 안에 있던 비용의 진단입니다. gap 번들에서는 writeFieldNode self와 배달을 새 경계로 분리했으며 gap everythingElse는 진입과 남은 사슬 종료를 담습니다. 과거 서로 다른 창의 row와 단계 숫자의 차이를 정밀 분해했다고 주장하지 않습니다.

원시 표본과 CPU 관측은 gzip JSON으로 보존하며 summary가 프로세스 수·표본 수·self 보존·불변 번들 해시를 다시 검사합니다. `timerCost`는 pass마다 같은 프로세스의 unwrapped 짝으로 구한 오버헤드와 enter/exit 쌍당 평균 추정치를 보존하며 H3·H5·H6 판정은 `selfNetUs`를 사용합니다. 이 추정치는 균일 비용 모델이며 깊은 스택은 더 비쌀 수 있고 음수 보정값은 그대로 남깁니다. leaf 기울기는 payload-12와 oneOf-80의 차이를 추가 들고 나는 잎 18개로, 형제 기울기는 각 행 차이를 형제 수 차이로 나눕니다. 개선량은 제품 변경 실측이 아니라 해당 비용의 제거 가능성에 대한 진단입니다.

도구 검증은 `checkTools.mjs`, 저장소 ESLint, `yarn exec tsc --allowJs --checkJs --noEmit --skipLibCheck --target es2023 --module nodenext --moduleResolution nodenext --types node <tools/b9-0/*.mjs>`와 Prettier를 사용합니다. raw 공개 파일에는 기계 로컬 경로를 남기지 않습니다.

## B11 뒤 재개

기준은 B11 병합 머리입니다. B11에서 제거한 `DetachedWriteAddress.retain`은 supplemental manifest의 `absentSupplementalStages`에 명시하며 0회 호출과 구별합니다. 중지된 첫 창은 legacy 101번째 배치에서 가드 상한 100을 넘어 완료 프로세스 0/180으로 끝났습니다. 원래 러너는 microtask만 양보해 macrotask 초기화를 막았습니다. `yieldBeforeSample.mjs`가 canonical measurePair와 같은 타이밍 밖 `setTimeout(0)` 경계를 복원하며, 120회 가드 검사는 수정 전 실패·수정 후 통과합니다. 새 smoke 뒤 코디네이터에게 창 허가를 질문하고 허가 뒤에만 새 창을 엽니다.

B5의 단계 러너는 wrapped/unwrapped 두 레인을 macrotask 양보 없이 번갈아 실행하지만 이번 ledger 러너는 0.16.1을 포함한 네 레인을 유지하고 매 표본 밖에서 양보합니다. timed bundle 바이트는 같아도 GC와 inter-sample 상태는 다르므로 모든 기울기·분할·오버헤드는 이번 창 내부에서 구하고 B5 절대값 비교는 cross-harness로 표시합니다.

후처리 `deriveCosts.mjs`는 각 표본의 scoped 보존 항등식을 검사하고 `cost-splits.json`과 `row-gap.json`을 만듭니다. 기존 비교 경계의 자식 self는 상위 self에 넣지 않고, 새 세부 경계 self와 비교 장부에 없던 B6 자식의 inclusive만 더해 `ledgerEquivalent`를 구합니다. `summarize.mjs`의 `rowStageGap`은 같은 프로세스 중앙값의 차이를 사용하며 개별 중앙값을 결합할 때 생기는 잔여를 명시합니다.
