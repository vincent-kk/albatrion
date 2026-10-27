# D0 코어 쌍 측정 도구

설계 최적화 단계의 코어 측정 장치입니다. 제품 소스와 배포 번들을 고치지 않고,
설치된 npm `@canard/schema-form@0.16.1`과 현재 `dist/index.node.mjs`를 비교합니다.
React 렌더·DOM 입력·사용자 대기 시간은 포함하지 않습니다.

## 준비와 실행 디렉터리

저장소 루트에서 실행합니다. 설치된 잠금 파일의 별칭을 사용하며 도구는 다운로드하거나 빌드하지 않습니다.

```sh
yarn install --immutable
yarn workspaces foreach --from @canard/schema-form --recursive --topological-dev run build
export NODE_ENV=production
export D0_NODE=/opt/homebrew/bin/node             # Node 26; 실제 실행 버전은 JSON에 기록
export D0_TOOLS=packages/canard/schema-form/architecture/verification/design-optimization/tools
```

원시 표본, 번들 사본, 프로파일, 명령, 환경, stdout/stderr는 전부
`/private/tmp/claude-501/perf-runs/<실행 ID>/`에 둡니다. 실행 ID는
`<YYYYMMDD>T<HHMM>-<커밋 7자>-<표지>`이며 날짜는 UTC입니다.
저장소에는 도구와 해석을 위한 요약만 커밋합니다. 기존 실행 디렉터리는 덮어쓰지 마십시오.
소표본은 장치 검증용이며 정식 기준선이나 개선의 증거가 아닙니다.

## 코어 여덟 행

```sh
NODE_ENV=production "$D0_NODE" "$D0_TOOLS/pair-core.mjs" --samples=5 --label=core-smoke
```

기본값은 프로세스당 20회 예열, 각 판 100표본, 행당 독립 프로세스 3개입니다.
한 프로세스에 두 판을 함께 적재하고, 예열과 표본마다 cached import와 연산 순서를
AB/BA로 번갈아 바꿉니다. import는 타이머 밖입니다. 반복 실행의 시작 순서도 번갈아 바뀝니다.
각 판의 세 **실행 최소값의 중앙값**과 **최소값의 최댓값−최솟값**을 출력하며
Δ %는 `(current / 0.16.1 − 1) × 100`입니다. 원시 표본과 AB/BA 순서는 JSON에 남습니다.

| 행 ID               | 정의                                             |          N |
| ------------------- | ------------------------------------------------ | ---------: |
| mount-oneOf-80      | 판별자와 활성 payload 세 개를 포함한 트리 마운트 |    분기 80 |
| mount-flat-1000     | 문자열 기본값을 가진 평평한 객체 마운트          | 필드 1,000 |
| mount-nested-d6-f4  | 깊이 6, fanout 4 객체 트리 마운트                |   잎 4,096 |
| single-flat-1000    | 처음 잎 10개에 각 1회 쓰는 상호작용 묶음         | 필드 1,000 |
| single-nested-d6-f4 | DFS 순서 처음 잎 10개에 각 1회 쓰는 묶음         |   잎 4,096 |
| switch-oneOf-80     | `kind_0 → kind_79 → kind_0` 실제 분기 왕복 2회   |    분기 80 |
| bulk-flat-2000      | 루트 `setValue` 1회로 모든 잎 교체               | 필드 2,000 |
| bulk-nested-d6-f4   | 루트 `setValue` 1회로 모든 잎 교체               |   잎 4,096 |

`fixtures.mjs`는 TS 실행기를 요구하지 않도록 `benchmark-form/src/fixtures/scale-schemas.ts`의
flat·nested 형상과 `benchmark-form/fixtures/equivalent/branches.ts`의 판별자 분기를 옮겼습니다.
새 판은 `controls.active`, 옛 판은 `&if`를 사용합니다. 기본값, 키, 잎 경로는 동일합니다.
분기 한 개의 payload는 문자열·숫자·불리언입니다.

마운트는 새 판의 `buildFieldNodeTree`·`mountFieldNode`와 옛 판의 `nodeFromJSONSchema`를
호출하고 양쪽 모두 자식부터 공개 값을 읽어 실체화합니다. 청사진 분석도 타이머 안입니다.
옛 판의 초기 분기 선택과 입력 전파에 필요한 microtask 대기도 포함합니다.
단일 입력의 열 번 쓰기는 동기로 묶고 그 뒤 한 번 settle합니다. 분기 왕복은 중간 분기의
실제 선택을 보장하도록 각 판별자 쓰기 뒤 settle합니다. 두 판의 반복마다 실제 값이 바뀝니다.
루트 생성·잎 탐색·일괄 payload 생성은 갱신 타이머 밖이며, 단언도 타이머 밖입니다.
각 연산 직전 타이머 태스크로 양보하여 옛 판의 연속 갱신 가드를 초기화합니다.
초기 잎 수·활성 분기·분기 왕복 사전 점검과 매 연산 뒤 값 검사를 통과해야 표를 만듭니다.

`--samples=N`, `--warmups=N`, `--runs=N`, `--label=표지`, `--only=행ID,행ID`,
`--run-dir=/private/tmp/claude-501/perf-runs/<실행ID>`를 지원합니다.
`--runs=1`의 폭은 0이므로 반복 간 변동의 증거로 쓰지 않습니다.
출력은 `rows.md`, `results.json`, `environment.json`, `engines.json` 및 행·반복별
`.stdout`, `.stderr`, `.command.json`입니다. 환경에는 커밋, Node·OS·CPU, 번들 경로와
원본 SHA256, 실행 argv, 시작/종료 시각을 기록합니다. 복사본에는 내부 심볼 export 한 줄만 붙이며,
`profile/register.mjs`가 원본 번들 위치에서 의존성 import를 풉니다.

정식 실행은 담당 코디네이터가 조용한 창을 확보한 뒤 별도로 수행합니다. 예:

```sh
NODE_ENV=production "$D0_NODE" "$D0_TOOLS/pair-core.mjs" \
  --label=baseline --quiet-since=2026-10-27T00:00:00Z
```

`--quiet-since`는 창이 시작된 과거 ISO 시각입니다. 100표본 이상에서는 필수입니다.
창 동안 다른 시험·벤치·빌드·프로파일·무거운 작업을 멈추고, 전원·열 상태와 실행 환경을
유지합니다. 이 시각을 적는 것만으로 조용함이 증명되지는 않습니다. 한 창의 쌍 비교만 유효하며
443b와 절대값이 다른 것만으로 제품 변화의 인과 효과를 주장하지 않습니다.

## 탐침

```sh
NODE_ENV=production "$D0_NODE" "$D0_TOOLS/probes.mjs" --samples=5 --label=probes-smoke
```

같은 쌍 측정기와 옵션을 사용합니다. 출력 계약도 같습니다.

- `switch-siblings-{0,100,1000,4000}`: 루트의 정적 숫자 형제 N개 옆에서 두 분기의 판별자 `type`을 1회 토글합니다.
- `leaf-{plain,gate}-{250,1000,4000,8000}`: 게이트 유무 외에는 같은 폼에서 `/pad_7`을 1회 씁니다.
- `mount-blueprint-{1000,2500,5000,10000}`: flat 문자열 스키마의 청사진 분석부터 값 실체화까지 마운트합니다.

형제 탐침은 446 프로파일과 같은 `a/b` 판별자 및 공유 `x/y` 분기 키를 사용합니다.
옛 판의 게이트는 `computed.if`입니다. N은 숫자 형제 수이고 판별자·분기 필드는 별도입니다.

## 446 프로파일 도구

`profile-446.md` 7절의 임시 스크립트를 이식했습니다. 아래 예도 저장소 루트에서 실행합니다.
이 계열은 당시 기준인 **0.16.0**을 기본값으로 유지합니다. `D0_LEGACY=0.16.1`로
prepare하면 공개 0.16.1과도 비교할 수 있습니다. 코어 여덟 행은 항상 0.16.1입니다.
프로파일 픽스처는 혼합형 flat-10000, 공유/분리 키 분기, 형제 1000, 구독자 1000 wave 등
당시 장면을 유지하며 canonical 여덟 행과 섞어 비교하지 않습니다.

```sh
export D0_RUN_DIR="/private/tmp/claude-501/perf-runs/$(date -u +%Y%m%dT%H%M)-$(git rev-parse --short=7 HEAD)-profile-smoke"
export D0_PROFILE="$D0_TOOLS/profile"
mkdir -p "$D0_RUN_DIR"
NODE_ENV=production "$D0_NODE" "$D0_PROFILE/prepare.mjs" > "$D0_RUN_DIR/prepare.log"
NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/run.mjs" switch current profile 0.1
NODE_ENV=production "$D0_NODE" "$D0_PROFILE/analyze.mjs" "$D0_RUN_DIR/prof/switch" 25
NODE_ENV=production "$D0_NODE" "$D0_PROFILE/tables.mjs" switch 25
NODE_ENV=production "$D0_NODE" "$D0_PROFILE/phases.mjs" switch
NODE_ENV=production "$D0_NODE" "$D0_PROFILE/callers.mjs" "$D0_RUN_DIR/prof/switch" computeNode,sameValue
NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/compare.mjs" switch 5
NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/count.mjs" switch 5 30
NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/heap.mjs" switch 0.1
D0_SAMPLES=5 NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/scale.mjs"
D0_SAMPLES=5 NODE_ENV=production "$D0_NODE" --import "./$D0_PROFILE/register.mjs" "$D0_PROFILE/leaf.mjs"
```

stdout은 필요한 경우 `$D0_RUN_DIR/<도구>.txt`로 리다이렉트합니다.
`run` 장면은 `mount`, `mount-bp`, `switch`, `switch-distinct`, `switch-wide`, `wave`,
`leaf-wide`, `leaf-wide-oneof`이고 판은 `current|legacy`, 방식은 `profile|time`입니다.
`profile`은 초 단위 실행 시간(기본 4)을 받고 준비·20회 예열 뒤 inspector를 켭니다.
`time`은 원본의 자동 batch 보정과 15개 batch 중앙값 방식을 유지합니다.

`analyze`는 cpuprofile에서 자기/포함 시간을 집계하여 같은 디렉터리에 `summary.json`을 쓰고,
`tables`는 그 요약을 원본 소스 선언 위치와 연결합니다. `phases`는 쉼표로 나눈 장면들의
포함 시간 표를 만들며 인수를 생략하면 원본의 일곱 장면 전부를 읽습니다.
`callers`는 쉼표로 나눈 함수 이름의 호출자 사슬별 자기 시간을 출력합니다.
`compare`는 같은 프로세스의 쌍 batch 벽시계 비교, `count`는 V8 precise coverage 호출 수,
`heap`은 수거된 객체도 포함하는 표본 할당량입니다. coverage 원본은 `coverage.json`,
할당 원본은 `allocation.heapprofile`, CPU 원본은 `loop.cpuprofile`로 외부 `prof/<장면>/`에 남습니다.
`scale`은 청사진·마운트·wave·분기·잎 쓰기 규모 추세, `leaf`는 게이트 유무별 두 판의 잎 쓰기입니다.
`D0_SAMPLES`는 scale·leaf의 표본 수만 바꿉니다. 이 둘의 요약은 원본처럼 중앙값이며
코어의 세 실행 최소값 중앙값과 통계 정의가 다릅니다.

이식 시 고정 절대 경로를 제거하고 외부 엔진 manifest를 공통으로 사용하게 했습니다.
CPU 표본의 시간은 `timeDeltas[i]`를 `samples[i]`에 대응시키며, 원본의 한 칸 밀린 대응을 고쳤습니다.
`--cpu-prof` 대신 inspector를 써 모듈 적재와 로더 워커 비용을 측정 루프에서 분리합니다.
레거시 profile 갱신 루프는 매 연산 전에 타이머 태스크로 양보해 연속 갱신 가드를 초기화하므로
그 판의 루프 벽시계에는 양보 시간이 포함됩니다. CPU 자기 시간과 혼동하지 마십시오.
배포 번들의 sourcemap이나 소스는 수정하지 않습니다.

## 검증

결과는 소표본 장치 검증이며 정식 기준선 또는 성능 개선 주장이 아닙니다.
기준 커밋 `1f58ef018`, Node v26.12.1, Apple M1 Max, `NODE_ENV=production`에서
프로세스당 예열 20회·표본 5개·독립 쌍 프로세스 3개로 실행했습니다.

- 코어: `20261026T1502-1f58ef0-d0-core-smoke-c` (`rows.md`, `results.json`, `artifact-check.txt`). 8행·24프로세스·유지 표본 240개 통과.
- 탐침: `20261026T1504-1f58ef0-d0-probes-smoke` (`rows.md`, `results.json`, `artifact-check.txt`). 16행·48프로세스·유지 표본 480개 통과.
- 프로파일: `20261026T1506-1f58ef0-d0-profile-smoke`. prepare·run·analyze·tables·phases·callers·compare·count·heap·scale·leaf가 exit 0으로 실행되었습니다. run은 두 판의 switch 장면을 각각 0.1초, compare·count·scale·leaf는 5표본/연산, heap은 0.1초입니다.

| 행                  |    N | 0.16.1 ms |  폭 ms | current ms |  폭 ms |    Δ ms |    Δ % |
| ------------------- | ---: | --------: | -----: | ---------: | -----: | ------: | -----: |
| mount-oneOf-80      |   80 |    0.4797 | 0.0378 |     2.6699 | 0.3920 |  2.1902 | 456.57 |
| mount-flat-1000     | 1000 |    2.2249 | 0.1087 |     2.6185 | 0.0866 |  0.3937 |  17.69 |
| mount-nested-d6-f4  | 4096 |    7.0554 | 2.5713 |    18.6593 | 1.3565 | 11.6039 | 164.47 |
| single-flat-1000    | 1000 |    0.6185 | 0.0797 |     0.1477 | 0.0150 | -0.4708 | -76.13 |
| single-nested-d6-f4 | 4096 |    0.0471 | 0.0101 |     0.2588 | 0.0263 |  0.2116 | 449.07 |
| switch-oneOf-80     |   80 |    0.0889 | 0.0127 |     0.5638 | 0.0502 |  0.4749 | 534.11 |
| bulk-flat-2000      | 2000 |    2.0585 | 0.2902 |     3.5791 | 0.1624 |  1.5206 |  73.87 |
| bulk-nested-d6-f4   | 4096 |    3.9012 | 0.2439 |    10.8649 | 1.7138 |  6.9638 | 178.50 |

443b의 같은 행 대비 레거시 시간 비율은 0.86~1.52배, 현재 판은 0.93~3.94배입니다.
예를 들어 oneOf-80 레거시 마운트는 0.4797ms(443b 0.4800ms)입니다.
현재 판의 단일 입력은 443b보다 약 3.5~3.9배 크므로 정식 창에서 다시 확인해야 합니다.
차수 확인을 위한 대조이며 서로 다른 커밋·측정 창·소표본의 비율로 회귀나 원인을 판정하지 않습니다.

복원한 여덟 행의 규모·쓰기 횟수·통계 정의는 브리프와 같습니다. 다만 소실된 443b 실행기를
직접 대조할 수 없어 바이트 단위 동등성을 주장하지 않습니다. 이 장치의 settle·값 실체화·
타이머 경계는 위에 명시했습니다. 초기 레거시 분기는 microtask 뒤에 선택되므로 마운트에
그 대기를 포함하고, 분기 왕복의 중간 상태도 별도 사전 점검합니다.
프로파일 계열은 당시의 0.16.0 기준과 혼합형 픽스처를 유지합니다.

모든 `.mjs`의 Node 문법 검사와 결과 JSON의 행 수·독립 PID·AB/BA 교대·표본 수·
유한한 수치·최소값의 중앙값/범위 검사를 통과했습니다. 지정된 의존성 준비와 build는
성공했으며 전체 시험·전체 벤치·100표본 기준선은 실행하지 않았습니다.
제품 `src/**` diff와 저장소 안의 원자료는 0입니다.
Node v26.12.1은 원본 로더의 `module.register()`에 DEP0205 사용 중단 경고를 내지만
실행 오류는 없었습니다.

## B0 분기 전환 장치

`branch-switch.mjs`는 스크립트 안에서 `NODE_ENV=production`을 고정하고 B0 행만 선택합니다.
기존 canonical 여덟 행과 탐침 16행의 fixture는 그대로입니다. 기존 `switch-oneOf-80`은
쓰기 2회(왕복 1회)이며 신규 분기 행도 이 단위를 따릅니다. `switch-siblings-0`만 기존대로
쓰기 1회입니다. 결과 표에는 합계와 쓰기당 환산(2회 행은 ÷2)을 함께 적습니다.

| 행 ID                   | 정의                                                                                                                                |        N |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------: |
| switch-discriminator-80 | 호스트 `controls.discriminator: 'kind'`, 분기마다 `kind.const` 태그, payload 문자열·숫자·불리언 각 1개, `kind_0 → kind_79 → kind_0` |  분기 80 |
| switch-if-80            | `allOf`의 80개 `if`/`then`, guard는 `kind.const`와 `required: ['kind']`, AJV8 플러그인 사용, 같은 왕복                              |  분기 80 |
| switch-nested-oneOf-20  | `/outer/inner` 호스트의 `controls.active`, payload 3개, `kind_0 → kind_19 → kind_0`                                                 |  분기 20 |
| switch-oneOf-2          | `controls.active`, payload 3개, 첫 분기와 마지막 분기 왕복                                                                          |   분기 2 |
| switch-oneOf-10         | 위와 같음                                                                                                                           |  분기 10 |
| switch-oneOf-40         | 위와 같음                                                                                                                           |  분기 40 |
| switch-oneOf-80         | 기존 canonical 행 재사용, 회귀의 N=80 점                                                                                            |  분기 80 |
| switch-oneOf-160        | `controls.active`, payload 3개, 첫 분기와 마지막 분기 왕복                                                                          | 분기 160 |
| switch-payload-12       | 분기 80, 각 분기의 12개 잎은 문자열·숫자·불리언을 4번 반복, Δ=12 나감+12 들어옴                                                     |  분기 80 |
| switch-siblings-0       | 기존 탐침 재사용, 공유 `x/y` 필드의 값 보존을 포함한 쓰기 1회                                                                       |   형제 0 |

`discriminator`와 `if`는 **새 엔진 전용**입니다. 설치된 0.16.1에 동일 스키마를 넣으면
전자는 `COMPOSITION_PROPERTY_REDEFINITION`, 후자는 `allOf` 안의 조건 구문을 폼 구성에서
무시하여 초기 payload 누락으로 사전 점검이 실패합니다. `if`에 AJV8의 `compile`을
validatorFactory로 넘겨도 같고, 그 판의 검증기는 이 조건을 형상 guard로 사용하지 않습니다.
다른 구문으로 바꾼 가짜 쌍을 만들지 않습니다. 두 행의 표는 절대 시간과 **같은 새 엔진
`switch-oneOf-80` 쓰기당 시간** 대비 비율을 적고 레거시 열은 해당 없음입니다.

새 행은 초기·중간·복귀 호스트의 모든 키와 payload 값을 타이머 밖에서 검사합니다.
`if`는 실제 AJV8 플러그인을 등록하고 core에 그 validator를 전달합니다. 검증기 누락은
즉시 실패하며, 각 guard 포인터가 준비 과정에서 정확히 한 번 컴파일되었는지도 확인합니다.

```sh
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/design-optimization/tools/branch-switch.mjs \
  --samples=3 --runs=1 --label=b0-smoke
# 위 실행의 run-dir를 사용합니다. 원자료의 engines.json이 로더의 해석 기준입니다.
/opt/homebrew/bin/node --import ./packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/register.mjs \
  packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/checkBranchDevice.mjs \
  /private/tmp/claude-501/perf-runs/<실제-smoke-ID>
```

### 정식 창과 단계 계측

AJV8은 `yarn workspace @canard/schema-form-ajv8-plugin build`로 별도 준비합니다.
의존 workspace dist가 없다면 위 재귀 빌드를 먼저 합니다. 다운로드·자동 설치는 없습니다.
코디네이터가 다른 시험·빌드·벤치·프로파일을 중지한 뒤 아래 창을 한 번 실행합니다.

```sh
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/runWindow.mjs \
  /private/tmp/claude-501/perf-runs/<YYYYMMDD>T<HHMM>-b8db539-b0
/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/design-optimization/tools/profile/branch-switch/reportLedger.mjs \
  /private/tmp/claude-501/perf-runs/<동일-ID>
```

`runWindow`는 저장소 밖 `stages/scratch/`에 제품 `src`의 esbuild 번들 두 개를 먼저 만듭니다.
무계측과 계측 번들은 같은 entry·의존성·production 설정을 사용합니다. 그 뒤 `ps` 누적 CPU
카운터를 5초 간격으로 기록하고 quiet-since를 고정합니다. 쌍 장치 30프로세스 다음 단계 장치
18프로세스를 순차 실행합니다. 20예열·100표본·행당 3프로세스이며 창을 덮어쓰지 않습니다.
방해가 있으면 해당 창과 방해 사실을 기록하고 재측정하지 않습니다.
CPU 판정은 D4와 같습니다: 일반 프로세스 ≥50%, `mds_stores` ≥10%, 다른
Node/Bun/vitest/tsc/rolldown ≥10%면 정식 표본을 시작하지 않습니다. 누적 CPU 시간의
5초 차이를 사용하며 순간 `%cpu` 열로 판정하지 않습니다. 시작하지 못한 창은 표본 0으로
보존하고 다음 사전 점검 여부는 코디네이터가 정합니다.

`buildBundle.mjs`의 esbuild 플러그인이 TypeScript AST로 지정 함수의 몸체에
`performance.now()` 타이머의 try/finally를 넣습니다. `computeNode`의 `staticList`부터
첫 `getHostWheelBudgetCap`까지를 scratch 함수 `wheelPreparation`으로 감싸며, 그 안의
`primeHost`·초기 dirty 계산·출력 호출은 다시 하위 단계로 셉니다. 이는 제품 소스 수정이나
배포 export가 아니며 정확한 계측 목록은 scratch의 `instrumentation.json`에 남습니다.

각 타이머는 inclusive와 하위 타이머를 뺀 self를 기록합니다. `computeNode` 재귀도
같은 규칙이므로 inclusive를 행끼리 더하지 않습니다. 전체 쓰기 시간에서 self 합을 뺀
`everythingElse`는 진입 검사·컨텍스트 생성·계측 진입/종료 비용 등 미포착 비용입니다.
총합과 wrapped/unwrapped 오버헤드는 **실행별 최소값의 중앙값**입니다. 단계별 시간은
**실행별 중앙값의 중앙값**이며 중앙값을 더한 값이 총합 중앙값과 같다는 주장은 하지 않습니다.
별도의 정착 단계 표는 각 쓰기에서 최상위 단계별 self를 먼저 합칩니다. 따라서
`transitionSettlement` 안에서 부른 `markWrite` 등은 해당 최상위 단계 안에서만 셉니다.
compute·finalize·commit 안의 하위 함수 비용을 그 문맥별로 읽을 수 있습니다.

시간 통과가 끝난 뒤 타이머를 끄고 별도 100쓰기에서 inspector
`Profiler.startPreciseCoverage({callCount:true,detailed:false})`로 호출 수를 셉니다.
다시 별도 100쓰기에서 `HeapProfiler.startSampling`을 512B 간격으로 켜고 major/minor GC로
수거된 객체도 포함합니다. 할당 스택의 가장 안쪽 지정 단계에 selfSize를 귀속하므로 중복이
없으며, scratch 엔진 스택 밖의 inspector/하네스 할당은 제외합니다. 할당은 process별 B/쓰기
추정값의 중앙값입니다. 보유 힙이나 정확한 할당 바이트가 아닙니다. 표본 수가 k일 때
상대 오차 규모 `1/√k`를 참고할 수 있으나 객체 크기·스택 상관·V8 샘플링 때문에 신뢰구간은
아닙니다. 0표본은 할당 없음의 증명이 아닙니다. 타이머 off 상태에도 scratch의 준비 함수와
빈 계측 호출이 남으므로 제품 판의 할당과 완전히 같다고 주장하지 않습니다.

마지막 별도 쓰기에서만 `recordGateFrameInput`의 불일치 key·kind·두 값·객체 identity를
기록합니다. 값 복사와 로그는 시간·할당·호출 수 통과 밖에 있습니다. `*.coverage.json`,
`*.heapprofile`, `*.gate-inputs.json`, 모든 표본과 실행 명령을 원자료로 보존합니다.
`reportLedger`는 행·PID·표본·교대·최소값·중앙값·각 표본 self 합을 검증한 뒤
`summary.json`과 `tables.md`를 만듭니다. 회귀는 N=2·10·40·80·160의 쓰기당 시간에 대한
최소제곱 `floor + slope × N`이고, Δ항은 `payload12 − oneOf80`입니다.
