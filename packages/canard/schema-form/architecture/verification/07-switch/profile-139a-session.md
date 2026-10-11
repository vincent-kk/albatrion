# 139a 세션: G27 수정(B4·B1) React 판정 part 1

139C-01에 따라 최종 측정 React 기준 번들 `r136-final`과 G27 수정 후보 `r139`를 비교하였습니다. 105C-01, round-128에서 수정된 124C-01, round-128 독립 확인 규칙 및 131C-01을 기존 러너의 결과 그대로 적용하였습니다. 표시 회귀 **0행**, 확인 회귀 **0행**, 채택을 막는 회귀 **0행**, 유의한 이득 **0행**이며 part 1 판정은 **ADOPT**입니다. 전체 wall time은 **3,372.392초(56분 12.392초)**입니다.

## 실행 환경과 입력

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`
- Node: `v26.11.1`
- V8: `14.6.202.34-node.37`
- Node 실제 경로: `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`
- 엔진: `codex`
- 티어: `mid`
- 번들 매니페스트 기준 리비전: `daca1d14a8406e5ca939bad5e99f5be29768a5b3`

실행 전에 `D/harness-131.md`를 먼저 읽고 `D/profile-136e-session.md`의 보고 형식을 확인하였습니다. 시작 작업 트리가 깨끗함을 확인하였으며, 두 실제 번들의 SHA-256과 비압축 전체 차분을 확인한 뒤 기존 `D/tools/run-session-131.mjs`를 한 번 실행하였습니다. 측정 코드 작성, git 쓰기, 설치, 제품 변경, 번들 재빌드 및 측정 중 다른 무거운 작업은 수행하지 않았습니다. 종료 후 러너 결과를 읽고 이 보고서와 요청된 산출물을 보관하였습니다. 측정 및 결과 확인에 사용한 Node는 모두 위 지정 경로입니다.

행 파일은 `S/rows-fb-13.json`이며 SHA-256은 `c875904226b641a626527f99d4170b53741a387d4a250f2382dc9daee8eb09ca`입니다. 파일 이름의 13과 달리 실제 선택 설정은 요청된 12개인 `sample-0/off`, `sample-1/off`, `sample-2/off`, `sample-3/off`, `flat-50/off`, `flat-100/off`, `nested-d3-f4/off`, `computed-visible-derived/off`, `oneOf-5/off`, `oneOf-10/off`, `oneOf-20/off`, `array-500/off`입니다. 검증은 모두 OFF입니다. 각 설정의 16개 열을 선택하여 총 192행을 보고하였으며 공식 판정 48행과 기록 144행입니다. 예열은 20회, 표본은 41개, 폼 수는 프로세스당 1개입니다.

기준 번들은 `S/bundles/r136-final.cjs`이며 최종 측정 React 번들입니다. SHA-256은 `1d0ad52295ebb91e590d12f4119e5d5e4170ec23dc61f7b08aac7cdc7b6958cb`이고 크기는 963,333바이트입니다. 후보는 `S/bundles/r139.cjs`이며 SHA-256은 `1756485ae182ea5b537544c866a7d4c474984c7ed8a9cfb8c56c6e43185806cd`, 크기는 963,587바이트입니다. 요청에서 제공한 빌드 근거에 따르면 후보는 같은 계보의 HEAD `75fc421b4`에서 빌드되었고 `daca1d14a`의 통제 재빌드가 `r136-final`을 바이트 단위로 재현하였습니다. 이번 세션에서는 그 재빌드를 반복하지 않았습니다. 두 매니페스트의 공통 기준 리비전을 후보의 빌드 HEAD로 해석하지 않습니다.

작업 계수는 지정된 `S/session-135-counts/react-counts.json`을 그대로 사용하였고 SHA-256은 `4115fc9db9ddfd598f29896de3227f4c954d2e402320068b1a51686f6db24391`입니다. 후보용 계수를 새로 수집하지 않았습니다. A/A는 **134C-01 및 139C-01에 따라 session 136i를 재사용**하였습니다. `S/session-136i/final.json`의 SHA-256은 `32873daf99a0f37b320099eed3f046cd4f77e5cc9a5bf2347b5f682d80c3ff9f`이고 상태는 `passed`, 판정은 `AA_PASS`입니다. 같은 Node·V8·실제 경로의 A/A이며 이번 세션에서 별도 A/A는 실행하지 않았습니다.

실제 실행 명령은 다음과 같습니다. stdout과 stderr를 하나의 로그로 보냈으며 셸의 백그라운드 프로세스를 `wait`로 유지하였습니다.

```sh
"$HOME/.nvm/versions/node/v26.11.1/bin/node" \
  /Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools/run-session-131.mjs \
  --kind=verdict --lane=react \
  --rows=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/rows-fb-13.json \
  --watch-in-selection \
  --base=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r136-final \
  --candidate=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r139 \
  --blocks=24 \
  --touch-counts=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-135-counts/react-counts.json \
  --aa=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-136i/final.json \
  --node-version=v26.11.1 \
  --out=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-139a \
  > /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/session-139a.log 2>&1 &
runner_pid=$!
wait "$runner_pid"
```

별도의 짧은 명령으로 폴링하였으며 최초 sleep은 2초, 이후 각 sleep은 50초였습니다. 각 폴링 명령은 진행 행을 한 줄 출력하였습니다. `final.json` 존재와 로그의 `SESSION_131_OK`를 함께 확인한 뒤 폴링을 종료하였고 실행 셸의 종료 코드도 0입니다. 시작 셸은 `nice(5) failed: operation not permitted`를 출력하였지만 러너가 시작되어 사전 검사와 모든 단계를 통과하였습니다. 입력·옵션 거부나 사전 예산 거부는 없었습니다.

## 번들 차분

측정 전에 실제 `S/bundles/r136-final.cjs`와 `S/bundles/r139.cjs`의 전체 차분을 대조하였습니다. 차분에는 **B4의 terminal child 읽기 감지기에서 사용하는 로드 번호 비교와 그 번호 관리, B1의 타입 유도용 선언 줄만** 있습니다. B1에 따른 `types` 지역 선언 및 빈 자식 배열의 선언·freeze 분리는 아래 차분에 그대로 보존하였습니다. 다른 차이는 없었습니다.

아래는 요청된 `S/g27-fix-139/r136-final-vs-r139.diff`의 완전한 비압축 번들 차분입니다. [별도 차분 파일](./profile-139a-session/r136-final-vs-r139.diff)도 원본과 바이트 단위로 동일하게 복사하였습니다. SHA-256은 `0b90a48cdddfaa7a06dad688d19beefb2886f83ae41e2039a6b636a177d92f9c`입니다. 원본 헤더의 후보 경로는 준비 당시 경로이며, 실제 측정 후보의 차분 본문과 일치합니다.

```diff
--- /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/r136-final.cjs	2026-10-11 10:58:17
+++ /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g27-fix-139/r139.cjs	2026-10-11 16:05:01
@@ -20613,7 +20613,11 @@
       let delivering = false;
       const service = {
         hasConsumer: () => !!service.onError || false,
-        beginLoad: () => warnings.clear(),
+        load: 0,
+        beginLoad: () => {
+          service.load++;
+          warnings.clear();
+        },
         report(record) {
           if (delivering) return;
           if (record.error && typeof record.error === "object") {
@@ -20841,10 +20845,8 @@
           const invalid = Object.keys(test).filter(
             (key) => !testKeys.includes(key)
           );
-          if ((isArray(test.type) ? test.type : [test.type]).includes(
-            "integer"
-          ))
-            invalid.push("type:integer");
+          const types = isArray(test.type) ? test.type : [test.type];
+          if (types.includes("integer")) invalid.push("type:integer");
           if (invalid.length && false)
             console.warn("SCHEMA_FORM_WARNING.FORM_TYPE_TEST_INVALID", {
               definition,
@@ -22694,7 +22696,8 @@
     "use strict";
     import_react57 = require("react");
     init_FormErrorContext2();
-    EMPTY_CHILDREN = Object.freeze([]);
+    EMPTY_CHILDREN = [];
+    Object.freeze(EMPTY_CHILDREN);
     COMMITTED = 1;
     ACCESSED = 2;
     useTerminalChildren = (node) => {
@@ -22704,7 +22707,12 @@
         accessed.current = 0;
         if (node.strategy !== "terminal" || !reporter?.hasConsumer())
           return EMPTY_CHILDREN;
+        let readLoad = reporter.load;
         const get = (target = EMPTY_CHILDREN, key, receiver) => {
+          if (readLoad !== reporter.load) {
+            readLoad = reporter.load;
+            accessed.current &= ~ACCESSED;
+          }
           if (key === void 0) {
             reporter.report({
               level: "warning",
```

## 감시 범위와 실제 블록

`--watch-in-selection`을 적용하였습니다. 고정 감시 fixture 중 이번 선택에 포함한 설정은 **`array-500/off`, `flat-50/off`, `oneOf-20/off`, `sample-1/off`, `computed-visible-derived/off`**입니다. 최종 scoping에서 명시적으로 `reason=watch`인 행과 실제 사용 블록은 다음과 같습니다.

| 감시 행 | calls | 첫 블록 | 확인 블록 |
| --- | ---: | ---: | --- |
| array-500/off/mount-wall-nogc | 14,019 | 24 | null |
| flat-50/off/profiler-update-nogc | 100 | 24 | null |
| oneOf-20/off/profiler-mount-nogc | 47 | 24 | null |
| oneOf-20/off/profiler-update-nogc | 74 | 24 | null |

네 감시 행은 선택 목록에 이미 들어 있어 `rowSelection.watchAdded=[]`입니다. `sample-1/off`와 `computed-visible-derived/off`의 모든 행은 양수 계수의 `scopeReason=touched`이며 실제 24블록입니다. 따라서 두 설정도 측정 범위에 포함되지만 명시적 감시 행 분류와는 구별합니다. `array-replace-200/off` 감시는 이번 part 1에 포함되지 않았습니다. 이번 기록만으로 분할 세션 전체의 감시 범위 충족이나 G27 수정의 React 전체 범위 채택을 주장하지 않습니다.

처음 계획과 실제 사용 블록은 모두 **192행이 24블록**입니다. 131C-01에 따라 측정한 블록을 전부 사용하였으며 188행은 `scopeReason=touched`, 4행은 `scopeReason=watch`입니다. `all-measured-blocks` 승격이나 축소 행은 없습니다.

| 실제 블록 | 설정 | 공식 판정 행 | 기록 행 |
| ---: | --- | ---: | ---: |
| 24 | sample-0/off, sample-1/off, sample-2/off, sample-3/off, flat-50/off, flat-100/off, nested-d3-f4/off, computed-visible-derived/off, oneOf-5/off, oneOf-10/off, oneOf-20/off, array-500/off | 48 | 144 |

실제 축소 행은 **0개**입니다. 모든 공식 판정 행의 관측 상태는 “관측되지 않음”이며 기록 행은 “기록”입니다.

**`array-1000`과 `nested-d5-f4`는 B4가 reset 경로 밖에서는 실행되지 않으므로 측정하지 않았습니다(139C-01).** part 2의 `flat-500`, `array-100`, `array-push-100`, `array-replace-200`, `array-push-remove-100`은 별도 **session 139b**입니다.

## 표시 및 확인된 회귀

105C-01과 round-128의 독립 확인 규칙을 러너 결과 그대로 적용하였습니다. 차이의 부호는 기준에서 후보를 뺀 값이므로 음수는 손실입니다. 131C-01의 순서통계량 구간은 모든 행에서 24블록, k=6, 포함률 하한 99.3389248848%입니다.

| 구분 | 행 수 | 첫 블록 | 확인 블록 |
| --- | ---: | --- | --- |
| 공식 판정 행 | 48 | 모두 24 | 각 null |
| 표시 회귀 | 0 | 해당 없음 | 해당 없음 |
| 확인 회귀 | 0 | 해당 없음 | 해당 없음 |
| 채택을 막는 회귀 | 0 | 해당 없음 | 해당 없음 |

첫 통과에서 표시된 회귀가 없어 `confirmationPlan=[]`, `report.confirmation=null`이며 독립 확인 worker는 실행하지 않았습니다. 모든 행의 `confirmBlocks`와 `confirmStatus`는 null입니다. 확인 회귀 0행은 표시 회귀가 없어 확인 측정이 필요하지 않았다는 뜻입니다.

예를 들어 `flat-100/off/mount-wall`의 차이 중앙값은 −0.045250000ms이나 구간 [−0.221874000, +0.052709000]ms가 0을 포함하여 유의한 변화로 표시되지 않았습니다. `sample-1/off/update-wall`도 차이 중앙값 +0.001770500ms, 구간 [−0.016333000, +0.016167000]ms로 0을 포함합니다. 두 행은 첫 24블록이며 확인 블록은 모두 null입니다.

## 유의한 이득

유의한 이득은 **0행**이며 `report.gains=[]`입니다. round-128 규칙상 이득은 독립 확인 대상이 아닙니다. 양의 점 추정을 유의한 이득으로 해석하지 않습니다.

다음은 `array-500/off`의 공식 마운트·갱신 결과입니다. 차이 중앙값과 구간은 블록 차이 통계이며 양수는 기준보다 후보가 빠르다는 뜻입니다.

| 행 | 차이 중앙값(ms) | 구간(ms) | 첫 블록 | 확인 블록 | 분류 |
| --- | ---: | --- | ---: | --- | --- |
| array-500/off/mount-wall | −0.720625 | [−3.071792, +1.509208] | 24 | null | 유의한 변화 관측되지 않음 |
| array-500/off/mount-active | −0.159521 | [−3.596916, +1.690209] | 24 | null | 유의한 변화 관측되지 않음 |
| array-500/off/update-wall | +0.008646 | [−0.037333, +0.026126] | 24 | null | 유의한 변화 관측되지 않음 |
| array-500/off/update-active | +0.005001 | [−0.036750, +0.026375] | 24 | null | 유의한 변화 관측되지 않음 |

네 행 모두 구간이 0을 포함하고 `gain=false`, `regression=false`입니다. 같은 fixture의 wall과 active는 별개 보고 열이며 독립된 시나리오를 뜻하지 않습니다. 이번 비교는 최종 측정 기준 `r136-final`에서 G27 수정 후보로의 변화이며, 이전 최적화의 개별 기여나 그 이득을 다시 판정한 결과로 해석하지 않습니다.

## 124C-01 면제와 작업 계수

round-128에서 수정된 124C-01의 적용 결과, **면제된 회귀는 없습니다**. 표시 회귀 자체가 없어 면제 대상과 `report.exemption.rows`가 모두 비어 있습니다. `axisGainMs=0`, `regressionTotalMs=0`입니다. 면제 객체의 `provisional=true` 및 기록용 label은 실제 행에 면제를 부여했다는 뜻이 아닙니다.

| fixture | 마운트 행의 calls | 갱신 행의 calls |
| --- | ---: | ---: |
| sample-0 | 26 | 10 |
| sample-1 | 75 | 15 |
| sample-2 | 47 | 15 |
| sample-3 | 292 | 15 |
| flat-50 | 362 | 100 |
| flat-100 | 712 | 100 |
| nested-d3-f4 | 600 | 200 |
| computed-visible-derived | 40 | 44 |
| oneOf-5 | 47 | 74 |
| oneOf-10 | 47 | 74 |
| oneOf-20 | 47 | 74 |
| array-500 | 14,019 | 20 |

작업 계수는 공식 wall·active 열과 해당 단계의 기록·no-GC 열에 적용됩니다. 선택한 192행의 계수는 모두 양수이며 각 설정을 모두 24블록으로 측정하였습니다. 지정된 작업 범위의 계수이며 시간이나 절감량으로 해석하지 않습니다.

## part 1의 결정

러너 판정은 **ADOPT**입니다. 139C-01의 G27 수정(B4·B1) 후보에 대해 선택된 12개 fixture의 공식 판정 48행에서 채택을 막는 회귀가 표시되지 않았습니다. 유의한 이득도 0행입니다. 공식 판정 행은 모두 24블록이며 축소 측정은 없습니다. 이번 결정은 part 1의 선택 행 및 실제 포함된 감시 행에 한정합니다. B4·B1의 기여를 개별적으로 분해하거나 아직 측정하지 않은 part 2의 채택을 주장하지 않습니다. part 2는 별도 session 139b이며, `array-1000`과 `nested-d5-f4`의 제외 근거는 위 139C-01의 reset 경로 범위입니다.

## 시간 분해와 예산

시작 시각은 최종 JSON의 `environment.startedAt` 기준 **2026-10-11 16:08:42.150 KST**, 종료 시각은 **17:04:54.542 KST**입니다. `time.totalMs=3372391.878625`에 따른 wall time은 **3,372.392초**, 즉 **56분 12.392초**입니다. 마지막 요약 및 해시 목록 쓰기, 이 보고서 작성과 보관 비용은 러너의 wall time에서 제외됩니다.

첫 통과의 사전 추정은 3,697.821초이고 확인 여유는 1,200.000초입니다. 합계 4,897.821초가 시작 시 남은 예산 7,099.939초 안에 들어가 사전 검사를 통과하였습니다. 실제 로그의 사전 검사 메시지는 다음과 같습니다.

```text
SESSION_131_ESTIMATE: first pass 3697.821s + reserve 1200.000s = 4897.821s; remaining 7099.939s
```

표시 회귀가 없어 확인 직전의 추가 예산 검사는 필요하지 않았습니다.

| 세션 구간 | 시간(초) |
| --- | ---: |
| 첫 통과 및 나머지 세션 비용: 전체에서 확인·보고를 뺀 값 | 3,372.296 |
| 독립 확인 구간: `time.confirmMs` | 0.000 |
| 보고 계산: `time.reportMs` | 0.096 |
| 전체 wall time | 3,372.392 |

`time.confirmMs`의 원값 0.00266700005158782ms는 확인 분기의 부수 비용이며 독립 확인 측정은 0개입니다. 첫 통과 worker 576개가 순차 실행되었고 worker wall time의 합은 3,369.861초입니다.

| worker 단계의 기록 합 | 시간(초) |
| --- | ---: |
| 시작부터 준비 완료 | 124.264 |
| 예열 | 1,069.240 |
| 강제 GC | 214.768 |
| 시계 밖 minor GC | 28.833 |
| 표본 | 2,112.795 |
| digest | 399.332 |
| React 보정 | 43.500 |

예열과 표본 시간은 GC 및 digest를 포함하므로 위 단계들을 단순 합산하지 않습니다. worker 준비 합은 프로세스 시작부터 준비 완료까지이며 세션 전체 wall time과 별도 범위입니다.

## 보존한 산출물

- [러너의 최종 한국어 요약](./profile-139a-session/summary.md)
- [러너의 최종 JSON gzip](./profile-139a-session/final.json.gz)
- [러너 원자료 및 산출물 SHA-256 목록](./profile-139a-session/raw-sha256.txt)
- [완전한 비압축 번들 차분](./profile-139a-session/r136-final-vs-r139.diff)

최종 JSON 원본은 34,950,962바이트로 5MB를 초과하여 gzip으로 보관하였습니다. 보관한 gzip은 808,346바이트, 요약은 26,576바이트, `raw-sha256.txt`는 183,806바이트, 차분은 2,103바이트이며 각 파일이 5MB 미만입니다. 번들은 보관하지 않았습니다. `raw-sha256.txt`는 러너의 `sha256.txt`를 그대로 복사한 목록이며 경로는 원 세션 디렉터리 기준입니다. 원자료와 실행 로그 `S/session-139a.log`는 S의 원 세션에 남아 있습니다.

압축을 풀어 원본 JSON과 바이트 동일성을 확인하였습니다. 요약, SHA-256 목록 및 차분 복사본도 각각 원본과 바이트가 같습니다. 압축 해제한 JSON의 SHA-256은 `5d9e13781504c606c3a7bb88bf33cdd682a7968be98f9012007341e121b7ebd7`입니다.
