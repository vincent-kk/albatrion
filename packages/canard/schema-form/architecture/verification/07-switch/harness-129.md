# 129회차 측정기 정정: 클러스터 bootstrap, 면제 범위, 확인 측정, 도구 결함 2~8

이 문서는 127라운드 닫기 결정 127C-01의 (1)과 (2), 128라운드 닫기 결정 128C-01의 (1)~(3), 그리고 `pipeline-review-128.md`의 도구 결함 2~8을 도구에 넣은 기록입니다. 작업 트리의 HEAD는 `1e9d6b9d3`이고, 모든 실행은 `/opt/homebrew/bin/node`의 Node v26.10.0으로 했습니다. 번들·원자료·임시 파일의 루트 S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다. 부호는 앞선 판정 문서와 같게 기준 − 변경이며, 음수는 변경 쪽이 느리다는 뜻입니다. 다른 진단이 동시에 돌고 있었으므로 시간 측정은 표본 수가 아주 작은 짧은 실행만 했고, 판정용 A/A와 재판정은 하지 않았습니다.

## 결론

1. **번들 하나 프로세스 방식의 구간은 이제 블록 단위로 냅니다.** 행마다 ABBA 블록 하나가 짝 차이 하나(median(기준 표본) − median(변경 표본))를 내고, 블록을 1,999회 재표집해 nearest-rank 99% 구간을 냅니다. 행 통계량은 블록 차이의 중앙값이고, 105C-01 하한에 들어가는 A/A의 |통계량|도 같은 방식으로 냅니다. 기본값은 블록 24, 예열 20, 프로세스당 표본 41입니다.
2. **합성 A/A에서 이 구간이 0을 제외한 비율은 2,000행 중 27행, 1.35%였습니다.** 같은 자료의 앞 100행에 세션 119의 표본 단위 bootstrap을 적용하면 61%가 0을 제외했습니다. 참 이동을 넣은 행에서는 프로세스 수준 표준편차와 같은 크기의 이동을 56%, 그 두 배의 이동을 100% 검출했습니다.
3. **124C-01 면제는 128C-01대로 바뀌었습니다.** 이름은 "측정 조건 소음(기록)"이고, gc 없는 기록 열은 코어와 React의 모든 열에서 잴 수 있습니다. 면제되는 행에는 작업 계수가 있어야 하며, 계수 파일에 그 행이 없으면 "계수 없음"으로 적고 면제하지 않습니다.
4. **회귀는 확인 측정에서도 회귀일 때만 셉니다.** 두 측정기에 첫 보고가 회귀로 표시한 행만 다시 재는 확인 모드를 더했고, 보고 도구는 확인 측정이 없으면 판정을 "CONFIRMATION_PENDING"으로 둡니다. 이득 행은 확인하지 않습니다.
5. **도구 결함 2~8을 모두 고쳤습니다.** 기존 도구 가운데 바이트가 바뀐 파일은 세 개이며, 앞선 세션의 근거가 기대는 측정 도구 본체는 그대로 두고 새 파일로 고쳤습니다.

## 1. 클러스터 bootstrap(127C-01 (1)·(2))

- **통계 모듈.** `tools/cluster-bootstrap-129.mjs`의 `clusterBootstrap129(blockDifferences, seed, trials = 1999)`가 구간을 냅니다. 난수는 세션 119와 같은 xorshift32이고, 구간 끝점은 재표집 중앙값들의 nearest-rank 0.5%·99.5% 점입니다. 블록이 둘 미만이거나 시드가 0이면 예외를 던집니다.
- **중앙값의 정의.** 짝수 개의 중앙값은 가운데 두 값의 평균입니다(`tools/median-129.mjs`). 앞선 도구는 짝수 개에서 아래쪽 nearest-rank 값을 썼는데, 블록 24개에서는 그 정의가 통계량을 아래로 치우치게 합니다. 이 판단을 위해 S의 `r129/sim-median.mjs`로 미리 견주었고, 같은 합성 모형의 3,000행에서 0을 제외한 비율은 nearest-rank 중앙값이 1.73%, 두 값 평균이 1.47%였습니다.
- **행마다의 시드(결함 7).** `tools/row-seed-129.mjs`의 `rowSeed129`가 행 키 "fixture/validation/mode"의 32비트 FNV-1a 해시를 시드로 씁니다. 확인 측정은 키 뒤에 `#confirm`을 붙여 첫 측정과 다른 재표집 궤적을 씁니다. 프로세스별 (가) 검사의 시드도 "fixture/validation/ga/b<블록>/<쪽>"에서 같은 방식으로 냅니다.
- **블록 배치.** 두 측정기 모두 전역 블록 번호 k가 짝수이면 기준을 먼저, 홀수이면 변경을 먼저 띄웁니다. 한 명령이 8분을 넘을 것 같으면 `--first-block`과 `--blocks`로 블록을 나누어 돌리고, 보고 도구가 블록 번호로 합칩니다. 같은 행에 같은 블록 번호가 두 번 들어오면 보고 도구가 멈춥니다. 각 측정기는 450초가 지나면 다음 블록을 시작하지 않고 멈춥니다.
- **보정.** 코어 행의 기준 중앙값은 호출 수 × 같은 검증 경로의 빈 호출 종단 중앙값(두 쪽의 모든 프로세스를 합침)을 뺀 값입니다. 이 상수는 두 쪽에 같으므로 블록 차이에서는 지워지고, 0.5% 하한과 2% 조건의 분모에만 쓰입니다. React 행은 보정하지 않습니다.
- **보고 도구.** `tools/report-cluster-129.mjs`가 A/A 입력이면 행마다 `aaMagnitudeMs`와 0을 제외한 행의 목록과 비율을 냅니다. 변경 입력이면 `--aa`의 A/A 보고에서 같은 키의 |통계량|을 읽고, 회귀는 구간 전체가 0 아래이면서 |통계량|이 max(|A/A|, 보정한 기준 중앙값의 0.5%)를 넘을 때, 이득은 구간 전체가 0 위이면서 통계량이 |A/A|를 넘을 때로 가릅니다. 블록이 24개보다 적은 행의 수를 `blockCoverage`에 적으므로, 짧은 실행의 구간을 판정으로 읽지 않게 됩니다.

## 2. 124C-01 면제의 범위(128C-01 (1))

- 면제의 이름은 "측정 조건 소음(기록)"입니다.
- `measure-core-worker-129.mjs`와 `measure-react-pair-129.mjs`의 `--no-gc`는 강제 gc 없는 두 번째 전체 순서를 돌려 모든 열을 `<열>-nogc` 기록 열로 남깁니다. 앞선 도구는 첫 쓰기 계열만 남겼습니다.
- 보고 도구는 셈에 든 회귀 행마다 네 조건을 따로 적습니다. 조건 (1)은 코어 분기 축 행(`axis-update`, `axis-first`, `axis-later`)의 유의한 이득 합계가 회귀 합계의 열 배를 넘는 것입니다. React만 담은 보고는 `--axis-from`으로 같은 변경의 코어 보고에서 그 합계를 읽습니다. 조건 (2)는 손실이 보정한 기준 중앙값의 2% 이하이고 5 µs 이하인 것입니다. 조건 (3)은 같은 행의 gc 없는 열 구간이 0을 품는 것이며, 끝점이 0이면 품는 것으로 셉니다. 조건 (4)는 그 열이 있는 것이고, 없으면 "조건 (4) gc 없는 열 없음(먼저 잼)"으로 적습니다.
- **작업 계수.** `--counts=<파일>`은 `{ "rows": { "<fixture/validation/mode>": { "calls": <0 이상 정수>, "probe": "<무엇을 셌는지>" } } }` 또는 키마다 정수만 둔 객체를 받습니다. 면제를 적용할 행에 계수가 없으면 `workCount`를 "계수 없음"으로 적고 면제하지 않습니다. 계수가 있으면 `changedCodeExecutes`(calls > 0)를 함께 적습니다. 128C-01대로 이 값은 조건이 아니라 기록이며, 실행되지 않는 행이라도 크기 조건 (2)와 gc 없는 열 조건 (3)은 그대로 요구합니다.
- 계수를 만드는 도구는 이번 범위가 아니어서 만들지 않았습니다. 변경마다 바뀐 함수의 호출 수를 세는 계측은 그 변경의 진단 세션에서 정해야 합니다.

## 3. 확인 측정(128C-01 (2))

- `measure-core-pair-129.mjs confirm <첫 보고.json>`과 `measure-react-pair-129.mjs --confirm <첫 보고.json>`은 첫 보고의 `flaggedRegressions`에서 자기 경로의 행만 골라 fixture/validation 설정별로 묶고, 같은 방법(기본 블록 24)으로 새 프로세스에서 다시 잽니다. `--setting=<fixture>/<validation>`으로 설정 하나만 고를 수 있습니다. 기록에는 출처 보고의 경로와 SHA-256, 확인할 열이 `confirm`으로 남습니다.
- 보고 도구는 `--confirm-input`의 확인 기록에서 표시된 행만 읽고, 같은 A/A 하한으로 다시 판정합니다. 두 번 모두 회귀이면 "확인됨", 두 번째가 회귀가 아니면 "확인되지 않음", 확인 기록이 없으면 "확인 측정 없음"입니다. 124C-01 면제는 확인된 회귀에만 적용하고, 확인 전에는 같은 계산을 표시된 행에 대해 `provisional: true`로 미리 보여 줍니다.
- 판정은 확인되지 않은 표시 행이 남아 있으면 "CONFIRMATION_PENDING", 면제되지 않은 확인 회귀가 있으면 "REJECT", 그 밖에는 "ADOPT"입니다. 이 판정은 규칙의 적용일 뿐이며, 채택은 원장의 결정입니다.

## 4. 도구 결함 2~8의 고침

- **결함 2(경계 계수가 구조상 0).** `measure-core-worker-129.mjs`의 경계 회차가 공유 스케줄러와 함께 전역 `setImmediate`·`setTimeout`(그리고 그 취소 함수)·`queueMicrotask`를 감쌉니다. 측정 하네스는 불러올 때 잡아 둔 원래 `setImmediate`만 쓰므로, 감싼 함수에 닿는 호출은 엔진의 것뿐입니다. 매크로태스크 호출은 `scheduled`에 더해지고 모두 0이어야 합니다. `queueMicrotask`는 `microtasksQueued`로 세고, 마이크로태스크 시계 시점에 실행되지 않고 남은 수(`microtasksPendingAtMicrotasks`)가 0이어야 합니다. `queueMicrotask` 자체를 0으로 요구하지 않은 까닭은, 현재 엔진이 검증 ON 경로에서 정당하게 한 번 쓰기 때문입니다(`requestSchemaNodeValidation`, 번들 `c-head.cjs` 4944행). 측정 구간 밖의 호출은 `boundaryOutsideWindow`에 따로 셉니다.
- **결함 3((가) 실패의 단언 없음).** `measure-core-pair-129.mjs`는 프로세스가 끝날 때마다 `gaValidation129`로 (가)를 판정합니다. 실패하면 그 원자료를 `<slot>.ga-failed.json`으로 남기고, 짝 기록을 저장하지 않은 채 0이 아닌 코드로 끝납니다.
- **결함 4(출력 형식 불일치).** `report-verdict-121.mjs --pair`가 `{ workers: [...] }` 기록과 최상위 `summary`·`timings` 객체를 모두 읽습니다. `S/core-pair-126/aa126/pair-AA-array-100-off-r1.json`으로 확인했고 4개 worker, 4개 행이 나왔습니다. 새 보고 도구도 두 옛 형식을 읽습니다.
- **결함 5(React 커밋 수 1 고정).** `measure-react-pair-129.mjs`는 보정 회차의 쓰기당 커밋 수를 0 이상의 정수로만 단언하고, 모든 표본의 쓰기가 그 보정값과 같아야 하며 모든 프로세스의 보정값이 같아야 합니다.
- **결함 6(패치 번들이 HEAD를 동적으로 읽음).** `preparePatchBundles(packageRoot, outputRoot, base = 'HEAD')`가 기준 커밋을 받고, 기준 파일의 내용도 그 커밋에서 읽습니다. `prepare-branch1-bundles.mjs --patch-variants --base=<커밋>`이 이를 넘깁니다. 인자를 주지 않으면 앞선 동작과 같습니다. 확인으로 HEAD가 `1e9d6b9d3`인 지금 기준 `9f92fef85`로 아홉 번들을 `S/bundles-129`에 다시 만들었고, 아홉 개 모두 `S/bundles-126`과 바이트가 같았습니다(스크립트 `S/r129/rebuild-base-check.mjs`). 단, esbuild가 남기는 경로 주석은 실행 디렉터리에 따라 달라지므로 저장소 루트에서 실행해야 같은 바이트가 나옵니다.
- **결함 7(시드 공유).** 1절의 행별 시드로 고쳤습니다.
- **결함 8(리비전 단언이 엄격함).** 새 코어 worker는 번들을 `c-bundles.json`의 SHA-256과 대조하고, `--base-revision`을 주면 매니페스트의 빌드 기준 리비전과 비교합니다. 현재 HEAD와는 비교하지 않고 기록만 합니다. React worker는 `<prefix>-bundles.json`의 SHA-256과 `head`(기준 리비전)로 같은 일을 합니다. 두 측정기는 블록의 두 번들이 같은 기준 리비전에서 나왔는지도 단언합니다. 짧은 실행은 HEAD가 `1e9d6b9d3`인 상태에서 `9f92fef85`로 만든 번들로 통과했습니다.

## 5. 자체 검사

명령은 `node tools/self-test-129.mjs`이고, 끝 줄은 `SELF_TEST_129_ALL_OK`였습니다. 실행에는 약 57초가 걸렸습니다.

- **합성 A/A.** 모형은 블록 24, 프로세스당 표본 41이고, 프로세스 수준 표준편차 10, 표본 표준편차 3, 표본의 5%에 0~30의 느린 표본을 더했습니다. 기준과 변경은 같은 분포이므로 차이는 프로세스 수준과 표본 소음뿐입니다.

| 방법 | 행 | 0을 제외한 행 | 비율 |
| --- | ---: | ---: | ---: |
| 클러스터 bootstrap(이번 도구) | 2,000 | 27 | 1.35% |
| 표본 단위 bootstrap(세션 119의 `pairRows121`) | 100 | 61 | 61% |

  기대 비율 1%에 대한 99% 이항 폭은 ±0.57%포인트이므로 1.35%는 그 안에 있습니다. 다만 백분위 bootstrap은 블록이 적을 때 조금 너그럽다고 알려져 있고, 미리 견준 3,000행에서도 1.47%였으므로 실제 비율은 1%보다 약간 높을 수 있습니다.
- **참 이동의 검출.** 변경 쪽 모든 표본에 이동을 더한 200행씩에서 구간 전체가 0 아래인 행의 비율은 이동 10(프로세스 수준 표준편차와 같음)에서 56.5%, 이동 20에서 100%였습니다.
- **판정 규칙.** 작은 합성 코어 자료에서 다음을 확인했습니다. 확인 측정이 없으면 "CONFIRMATION_PENDING"이었습니다. 두 번째에도 회귀인 행은 "확인됨", 아닌 행은 "확인되지 않음"이었습니다. 계수가 있는 확인 회귀는 "측정 조건 소음(기록)"으로 면제되어 "ADOPT"였습니다. 계수를 빼면 "계수 없음"으로 면제가 거절되어 "REJECT"였습니다. gc 없는 열을 빼면 "조건 (4) gc 없는 열 없음(먼저 잼)"으로 "REJECT"였습니다.
- **옛 형식.** `{ workers: [...] }` 기록 하나(블록 둘)와 최상위 `summary`·`timings` 객체 하나를 함께 읽어 한 행에 블록 셋이 모였습니다.
- **(가) 검사.** `measure-core-worker-129.mjs --self-test`의 세 행은 다음과 같았습니다.

| 행 | (가) | 차이 µs | 잡음 폭 µs | 전역 setImmediate | queueMicrotask |
| --- | --- | ---: | ---: | ---: | ---: |
| no-op | 통과 | −0.37 | 7.96 | 0 | 0 |
| queueMicrotask | 통과 | 0.00 | 8.96 | 0 | 1 |
| setImmediate 5 ms | 실패 | 5,012.0 | 11.00 | 1 | 0 |

  5 ms 행은 시간 절반과 경계 절반이 모두 실패했습니다. 경계 절반은 앞선 스케줄러 감싸개로는 잡히지 않던 전역 호출을 셌습니다.
- **덧붙인 확인.** 새 보고 도구를 세션 126의 코어 A/A 원자료(`S/core-pair-126/aa126`, 다섯 설정, 행마다 12블록)에 적용했더니 19개 판정 행 가운데 0을 제외한 행은 없었습니다. 블록이 12개뿐이고 기준 중앙값 보정이 없는 옛 형식이므로 참고로만 적습니다(`S/r129/legacy-aa126-cluster-report.json`).

## 6. 짧은 실행

모두 블록 2개의 짧은 실행이며, 블록이 2개이면 재표집 중앙값이 세 값뿐이라 구간은 판정이 아닙니다. 모든 명령이 종료 코드 0으로 스스로 끝났습니다.

| 명령 | 결과 |
| --- | --- |
| 코어 `AA if-then off --blocks=2 --warmup=2 --samples=5 --no-gc --bundles=S/bundles-126 --base-revision=9f92fef…` | 1.7초, 프로세스 4개의 (가) 통과, 판정 열 4개와 gc 없는 기록 열 4개 |
| 코어 `head:2 if-then off` 같은 설정 | 1.7초, (가) 통과 |
| 코어 `confirm`(합성으로 표시한 if-then 두 행) | 1.7초, 기록의 `confirm.modes`가 `update-first`, `mount` |
| React `--pair AA array-100 --blocks=2 --warmup=2 --samples=3 --no-gc` | 7.7초, 보정 커밋 수 [1], 판정 열 4개와 기록 열 12개 |
| React `--pair change array-100` 같은 설정 | 7.5초 |
| React `--confirm`(합성으로 표시한 update-wall) | 6.9초 |
| 보고: 코어 A/A, 코어 변경(`--counts`), 코어 변경 + 확인 | 새 필드(`aaMagnitudeMs`, `blockCoverage`, `flaggedRegressions`, `confirmation`, `exemption`, `decision`)가 모두 나옴, 코어 변경은 표시 행 0으로 "ADOPT" |
| 보고: React A/A, React 변경(`--confirm-input`, `--counts`, `--axis-from`) | React 변경은 표시 2행 중 update-wall "확인됨", update-active "확인 측정 없음", 면제 거절 사유에 "계수 없음", 판정 "CONFIRMATION_PENDING" |

원자료는 `S/core-pair-129/smoke129`, `S/core-pair-129/smoke129-confirm`, `S/react-pair-129/smoke129`, `S/react-pair-129/smoke129-confirm`에 있고, 보고는 `S/r129/smoke-*.json`에 있습니다. 합성 표시를 넣은 첫 보고는 `S/r129/smoke-flagged-report.json`과 `smoke-flagged-react-report.json`이며 `syntheticFlagsForSmoke: true`를 달고 있습니다.

## 7. 바뀐 도구 파일

새 파일은 다음과 같습니다. 앞선 세션의 근거(`profile-126a-session/session-evidence.json` 등)가 해시로 기록한 측정 도구는 바꾸지 않으려고 새 파일로 만들었습니다.

- `tools/cluster-bootstrap-129.mjs`, `tools/median-129.mjs`, `tools/row-seed-129.mjs`: 클러스터 구간, 중앙값, 행별 시드입니다.
- `tools/ga-validation-129.mjs`: 프로세스별 (가) 판정입니다. 시간 절반과 잡음 폭은 `measure-core-pair-126.mjs`와 같은 식이고, 마이크로태스크 조건을 더했습니다.
- `tools/measure-core-worker-129.mjs`: 번들 하나만 올리는 코어 측정 프로세스입니다. 시계 함수(`measureCall`, `measure`, `discardPostGcPair`)와 픽스처 처리(`apply`, `later`, `validatorServices`)는 `measure-verdict-121.mjs`와 `measure-pair-121.mjs`에서 그대로 옮겼습니다. 그 두 파일은 앞선 세션의 근거가 해시로 기록하고 있어 고치지 않았습니다.
- `tools/measure-core-pair-129.mjs`, `tools/measure-react-pair-129.mjs`: 블록 24 기본값, 확인 모드, 매니페스트 대조, gc 없는 전체 열을 갖춘 짝 측정기입니다. React 진입점은 `measure-react-pair-126.entry.tsx`를 그대로 씁니다. `--old-wait` 기록 회차는 옮기지 않았습니다.
- `tools/confirm-settings-129.mjs`: 첫 보고의 표시 행을 설정별로 묶습니다.
- `tools/report-cluster-129.mjs`: 클러스터 통계, 105C-01 판정, 확인 측정, 124C-01 면제를 냅니다.
- `tools/self-test-129.mjs`: 5절의 자체 검사입니다.

바이트가 바뀐 기존 파일은 세 개입니다. 해시는 SHA-256의 앞 16자리입니다.

| 파일 | 바뀐 내용과 이유 | 해시 |
| --- | --- | --- |
| `tools/report-verdict-121.mjs` | 결함 4: `--pair` 입력에서 `{ workers: [...] }`를 펼칩니다. 앞선 입력 모양의 결과는 같습니다. | `3a37cb47cb8cd2fe` → `6c614a9849d808e0` |
| `tools/prepare-patch-bundles.mjs` | 결함 6: 기준 커밋 인자를 받습니다. 인자가 없으면 HEAD로 앞선 동작과 같고, 번들 바이트(`c-headx`의 주석 포함)는 바뀌지 않습니다. | `89a4d00e4b873fd8` → `7caaca1a73ed45a7` |
| `tools/prepare-branch1-bundles.mjs` | 결함 6: `--patch-variants --base=<커밋>`을 넘깁니다. | `78d742656fa957ee` → `667d1046ce543860` |

`report-verdict-121.mjs`의 해시는 `profile-122-session`, `profile-126a-session`, `profile-126b-session`의 근거 파일에 기록되어 있으므로, 그 세션들의 해시 재검증은 이 파일에서 달라집니다. `prepare-patch-bundles.mjs`의 해시는 `profile-122-session/session-evidence.json`에 있습니다. 두 경우 모두 판정에 쓴 계산 경로는 바뀌지 않았습니다.

## 확인하지 못한 것

- 판정용 A/A(블록 24)와 변경 2, 1c, F-A'의 재판정은 다른 진단이 돌고 있어 하지 않았습니다. 128C-01 (3)이 말하듯 다음 A/A 세션에서 같은 코드의 0 제외 비율이 약 1%로 나오는지가 고침 전체의 확인입니다.
- 블록 24·예열 20·표본 41의 실제 한 명령 시간은 재지 않았습니다. 짧은 실행에서 코어 if-then 프로세스는 0.4초 안팎, React array-100 프로세스는 약 2초였으나, 표본 수가 커지면 큰 픽스처는 블록을 나누어야 할 수 있습니다.
- 작업 계수를 만드는 도구는 없습니다. 보고 도구는 계수 파일을 받기만 합니다.
- React 경로에는 (가)에 해당하는 검사가 없습니다. 앞선 도구와 같습니다.
- 새 경계 감싸개가 실제 엔진의 예약을 잡는지는, 현재 번들이 매크로태스크를 예약하지 않아 주입한 자체 검사로만 확인했습니다.
- 이 작업 중 작업 트리의 `packages/canard/schema-form/src` 아래에 이 작업이 만들지 않은 변경(수정 9개, 새 파일 4개)이 나타났습니다. 다른 작업자의 변경으로 보고 손대지 않았으며, 위의 번들 재생성은 git의 커밋 내용만 읽으므로 그 변경의 영향을 받지 않았습니다.
