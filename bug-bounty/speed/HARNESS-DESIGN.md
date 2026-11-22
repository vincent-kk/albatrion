# 공개 배포물 A/B 속도 하니스 설계

기준선은 `1c77ced57`, 첫 후보는 바운티 스쿼시 `d78e45c6b`로 고정합니다. 이후 개선 브랜치도 같은 기준선과 비교합니다. [`SPEED-TARGETS.md`](../SPEED-TARGETS.md)의 행을 우선순위 1 → 2 → 3 순서로 실행하며, 기존 비율과 입력 분류는 새 판정에 사용하지 않습니다. 측정 규칙은 [`SPEED-TARGETS.md` 2절](../SPEED-TARGETS.md#2-측정-규칙)을 따릅니다.

## 1. 위치와 형태

기존 비공개 워크스페이스 `@aileron/benchmark-form`에 독립 명령 `bench:speed`와 `src/speed/`를 추가하는 방식을 권장합니다. 폼과 플러그인 행이 이미 쓰는 DOM 초기화와 갱신 경계를 워크스페이스 안에서 재사용할 수 있습니다. 유틸리티와 설치 행도 같은 실행기와 보고 경로를 사용하도록 워크스페이스 설명에 교차 패키지 A/B 계측 책임을 명시합니다. 기존 `bench`와 `bench:form`의 명령 및 지표 계약은 유지합니다. [Benchmark Form 가이드](../../packages/aileron/benchmark-form/CLAUDE.md)

새 비공개 워크스페이스는 의존성 선언, 검사 설정, DOM 공용 코드 경계를 추가로 요구합니다. 루트 `scripts/`는 현재 워크스페이스의 lint와 TypeScript 검사에 별도 연결이 필요합니다. 기존 범용 `@aileron/benchmark`는 대화형 실행기이며 해당 검사 명령이 없습니다. `src/speed/` 아래 TypeScript 파일은 `benchmark-form`의 기존 `lint`와 `typecheck`에 포함하고, CLI는 패키지 스크립트를 통해 실행합니다. [Benchmark Form 설정](../../packages/aileron/benchmark-form/package.json) · [범용 벤치마크 설정](../../packages/aileron/benchmark/package.json)

`benchmark-form`은 현행 Filid 스캔 제외 대상이지만 수동으로 경계를 점검합니다. CLI와 그 내부 행 모듈만 필요한 구성에는 별도 프랙탈 문서를 만들지 않습니다. 이후 독립 공개 경계를 추가하면 진입점, 한국어 `INTENT.md`, 구현보다 앞선 `DETAIL.md`로 계약을 명시합니다. `run`, `prepare`처럼 함수는 동사로 시작하고 데이터는 `rowId`, `batchSize`처럼 명사로 이름을 붙입니다. [Filid 설정](../../.filid/config.json) · [명명 규칙](../../NAMING_CONVENTIONS.md)

## 2. 각 트리의 공개 배포물과 의존성 해석

동일 소스의 하니스가 arm마다 해당 루트의 설치된 워크스페이스 manifest를 찾아 `packageName`과 `entry`(`.` 또는 공개 subpath)를 해석합니다. 고정한 Node의 ESM resolver를 해당 manifest URL에 앵커링하고(`import.meta.resolve`의 parent URL 인자를 쓸 때는 양쪽에 `--experimental-import-meta-resolve` 적용), `node`/`import`/`default` 조건으로 열린 파일 URL을 네이티브 `import()`로 로드합니다. 예를 들어 schema-form 루트의 Node ESM은 양쪽 manifest에서 `dist/index.node.mjs`입니다. 실제 경로가 그 워크스페이스의 `dist` 아래이고, `publishConfig.exports`가 있으면 해당 게시 조건과 일치하는지 검사합니다. `source` 조건, Vite alias, 내부 파일과 private symbol 추출은 배제합니다. 동일한 공개 호출을 구성할 수 없으면 해당 행에 이유를 기록합니다. [schema-form manifest](../../packages/canard/schema-form/package.json) · [기존 merge 배포물 로더](../../packages/winglet/common-utils/src/utils/object/merge/__benchmarks__/merge-distribution-performance/loadMergeDistribution.mjs)

제품 모듈의 의존성은 로드된 파일을 기준으로 Node와 Yarn의 일반 `node_modules` 해석을 따릅니다. UI 행의 드라이버도 해당 arm의 제품과 같은 `react`, `react-dom`, `react-dom/client` 경로를 사용합니다. 렌더러·제품·플러그인의 React 실경로가 프로세스 안에서 하나인지, 플러그인의 schema-form이 해당 arm의 것인지 확인합니다. 플러그인별 `antd` 메이저, MUI·Emotion, `antd-mobile`, `dayjs`, AJV는 사용하는 패키지에서 시작해 해석합니다. `jsdom`과 그 의존성은 양쪽에 동일한 `benchmark-form` 설치 사본을 사용하고 제품 import 전에 DOM을 준비합니다. [Yarn 설정](../../.yarnrc.yml) · [기존 DOM 초기화](../../packages/aileron/benchmark-form/src/utils/setup-env.ts)

타이밍 전 별도 프로세스에서 실제 행을 재생해 ESM 로드 URL과 CommonJS `require.cache`의 모듈 관계를 수집합니다. 루트 기준 경로, 로드한 entry, 패키지 이름·버전과 lockfile 출처를 비교합니다. `require.cache`는 CJS·JSON·native 모듈을 확인하고 ESM 로드는 Node resolver 계측으로 확인합니다. 서로 다른 워크스페이스 구현이 추가 의존성을 호출하면 기록하고, 양쪽에서 공유하는 요청의 실제 공급 버전이 다르거나 제품 워크스페이스가 다른 트리로 새면 해당 행은 `void`로 둡니다. `yarn.lock`의 `antd-mobile`은 beta의 `^5.0.0` → `5.40.0`, 후보의 `^5.2.0` → `5.43.0`이므로 공통 버전이 실제 로드되는지 특히 확인합니다. 버전이 다르면 동결 트리를 수정하지 않고 양쪽 피어 범위에 맞는 공통 버전으로 임시 설치본을 준비할지 조정자에게 확인합니다.

## 3. 샘플링과 A/A

- 행마다 20라운드를 시작값으로 둡니다. 각 라운드는 `A1`(beta), `A2`(beta), `B`(후보) 세 슬롯을 같은 실행기로 직렬 실행하고, 세 슬롯의 순서는 라운드마다 여섯 가지 순열을 차례로 돌립니다. `B/A1`이 판정 비율이고 `A2/A1`이 대조군입니다. 같은 `A1`을 두 비율이 공유하므로 대조군이 판정 비율과 같은 조건에서 잰 것이 되고, 슬롯은 네 개가 아니라 세 개로 충분합니다. `A1`과 `A2`는 모두 beta의 동일 경로와 해시를 사용하며 매번 독립 프로세스입니다. 이렇게 모듈 캐시·React 레지스트리·JIT 피드백을 arm 사이에서 격리하고, 열·시간 드리프트가 한 arm의 순서에 고정되는 것을 줄입니다.
- 슬롯마다 새 프로세스에서 같은 10개 워밍업 배치를 버린 뒤 5개 배치를 기록합니다. 기본값이면 arm별 100개 샘플입니다. 워밍업 길이와 배치 크기는 대표 마이크로 및 UI 행의 사전 실행으로 확인한 뒤 행별 설정을 고정합니다. import, 프로세스 시작, 준비와 정리는 구간 밖에 두되 행이 명시한 마운트·등록·컴파일은 구간에 포함합니다. 첫 호출·캐시 미스 행은 워밍업과 실측에 독립 입력이나 캐시 소유자를 사용합니다. 같은 캐시 키를 피할 수 없는 프로세스 첫 호출은 샘플마다 새 프로세스를 쓰고 해당 진입은 워밍업에서 호출하지 않습니다. 그 경우 샘플 수는 라운드 수를 늘려 맞추며 같은 설정을 A/A에도 적용합니다.
- `process.hrtime.bigint()`로 배치 앞뒤를 재고 경과 ns를 호출 수로 나눕니다. 짧은 동기 호출은 pilot에서 두 arm 중 빠른 쪽도 대략 5ms가 되도록 반복 수를 정하고 네 슬롯에 그대로 적용합니다. DOM·I/O·비동기 행은 기본 한 연산씩 측정합니다. 입력은 미리 준비하고, 상태를 바꾸는 호출은 연산마다 독립 대상을 사용하며, 결과를 소비하고 검증합니다. 빈 루프와 구동 비용은 진단으로 별도 기록합니다. 구동 비용이 신호를 지배하거나 의도한 호출이 최적화로 사라진 행은 `void`로 둡니다. [기존 merge 벤치마크의 배치와 결과 소비](../../packages/winglet/common-utils/src/utils/object/merge/__benchmarks__/merge-distribution-performance/runMergeDistributionPair.mjs)
- 두 arm에서 같은 Node 바이너리·옵션과 환경을 사용합니다. `--expose-gc`를 켜고 워밍업 종료 후 각 슬롯에서 강제 GC를 한 번 호출합니다. 시간 구간과 샘플 사이에는 강제 GC를 넣지 않으며 자연 GC가 든 유효 샘플도 보존합니다. 같은 머신에서 단독 실행과 전체 실행 조건을 같은 방식끼리 비교합니다. C2의 대기열을 따르고 15분 점유 한도 안에 끝날 행 묶음으로 나눕니다. 분할은 행 사이에서만 합니다. [C2](../final-correction/DECISIONS.md#c2-속도-측정-대기열-순서)
- 통계는 arm별로 계산합니다. `min`과 nearest-rank `p10`의 `B/A1`을 각각 보고하고 `A2/A1`의 두 값이 모두 `0.98–1.02` 안에 있어야 유효합니다. 중앙값은 진단입니다. A/A 실패 시 전체 행을 `void`로 기록하고, 설정을 보정할 때는 세 슬롯 모두를 처음부터 다시 실행합니다.

## 4. 행 정의와 입력 재구성

기본은 패키지별 TypeScript 모듈입니다. 같은 스키마나 입력 생성기와 호출 구동기를 공유하는 변형을 한 곳에 둡니다. DOM 마운트와 파일 설치처럼 준비와 완료 경계가 크게 다른 경우에만 구동기를 분리합니다. 공통 실행기는 다음 정보를 소비합니다.

| 필드 | 의미 |
|---|---|
| `id`, `packageName`, `entry` | 재실행용 고정 ID와 공개 패키지 specifier입니다. 여러 스트림에 같은 행 이름이 있으면 ID에 스트림을 포함합니다. |
| `operation`, `input` | 표에 나오는 함수·동작과 입력 이름입니다. 크기, 옵션, seed와 캐시의 cold/warm 조건은 재현에 필요한 것만 기록합니다. |
| `prepare`, `run`, `cleanup` | 구간 밖에서 대상을 준비하고, 공개 호출과 약속된 완료 지점을 재고, 필요한 경우 정리합니다. 결과 또는 관측 상태 검증은 구간 밖에서 수행합니다. |
| `source` | 원장 ID, 재사용한 공개 테스트나 벤치마크의 경로·케이스, 보고서의 재구성 근거입니다. 재구성한 입력이면 복원한 조건과 확인 가능한 차이를 적습니다. |
| `inputKind` | 실행 결과에 기록하는 `plain`/`repaired`입니다. 정의에는 계수 근거만 연결하고, 계수 미완료는 값을 비워 `void`로 남깁니다. |

`SPEED-TARGETS.md`는 행의 정체성과 우선순위를, `contract-ledger/`와 공개 진입점 테스트는 기대 동작을 확인하는 데 사용합니다. 기존 `__benchmarks__`의 스키마나 입력을 재사용할 수 있지만 `nodeFromJSONSchema` 등 내부 구동기는 가져오지 않습니다. 예를 들어 엔진 행은 공개 `Form` 핸들에서 대상 노드를 얻고, 마운트 자체가 측정 항목일 때만 마운트를 타이머 안에 둡니다. 설치 행은 샘플마다 별도 임시 디렉터리에 신규·기설치·강제 조건을 준비하고, 양쪽에서 제공하는 공개 설치 연산만 호출합니다. beta의 알려진 동작 차이는 각 arm의 예상 관측으로 검증합니다. 두 팔에서 동등한 공개 연산을 시작할 수 없거나 입력을 특정할 근거가 부족하면 조정자에게 남깁니다. [엔진 보고서](../final-correction/engine-report.md) · [계약 원장](../final-correction/contract-ledger/ledger.md)

## 5. 코어와 UI 렌더 행

Node의 jsdom을 권장합니다. 기존 UI 집계의 35행에는 `sliderMount`, `timeRangePanel`, `checkboxChange`, `branchError` 같은 플러그인 시나리오가 있고, C15는 이 논의의 대상을 수 밀리초짜리 jsdom 렌더 행으로 명시합니다. 따라서 기존 UI 행의 환경으로는 jsdom이 가장 유력합니다. C15의 중앙값 판정은 독립 감사에서 철회됐으므로 3절의 min과 p10을 그대로 적용합니다. [속도 집계](../final-correction/speed-overview.md) · [C15와 독립 감사](../final-correction/DECISIONS.md)

`setupJsdom`, `drainUntilReady`, 필요한 경우 `settleUpdates`를 같은 워크스페이스에서 재사용합니다. 정적 React import가 있는 기존 구동기는 arm의 런타임을 인자로 받도록 경계를 좁힐 수 있을 때에만 공용화합니다. `NODE_ENV=production`을 양쪽 프로세스 시작 전에 설정하고 행당 동일한 DOM·시간대·locale·입력 이벤트를 사용합니다. 새 컨테이너에 공개 `Form` 또는 공개 플러그인 컴포넌트를 마운트하고 완료 조건으로 첫 커밋, 실제 값 변경 또는 오류 표시 중 해당 동작을 명시합니다. 동기 커밋은 `flushSync`로 구동하고 비동기 완료가 측정 대상일 때는 행의 관측 조건을 기다립니다. 대기 시간 초과는 `void`입니다. 각 샘플 종료 후 unmount와 타이머를 정리해 다음 샘플로 일이 넘어가지 않도록 합니다. [DOM 준비](../../packages/aileron/benchmark-form/src/utils/setup-env.ts) · [갱신 구간](../../packages/aileron/benchmark-form/src/utils/measureRenderUpdates.ts)

Chromium `bench:form`은 실제 프레임, Long Task, 페인트와 브라우저 상호작용을 관측하는 기존 계약에 사용합니다. 그 실행기를 jsdom 시간의 대체 지표로 쓰면 측정 경계와 표본의 의미가 바뀝니다. 독립 빌드 디렉터리를 받는 CLI 형식과 원자료 보존 방식은 재사용할 수 있습니다. [브라우저 측정 계약](../../packages/aileron/benchmark-form/README.md)

## 6. `plain`과 `repaired`의 증거

분류는 시간 측정에서 두 비율 중 하나라도 `1.03`을 넘은 유효 행에만 합니다. 통과한 행은 입력 종류와 관계없이 `pass`이므로 분류가 판정을 바꾸지 않습니다. 따라서 재측정 표의 `input kind`는 초과 행에서만 채우고, 나머지는 `—`로 둡니다.

가장 작은 확실한 방법으로 계수 전용 후보 빌드를 권장합니다. `git diff --find-renames 1c77ced57 d78e45c6b`와 계약 원장을 함께 읽어 추가·변경된 실행 코드의 위치를 패키지별로 지정합니다. 같은 함수 안에서도 변경된 조건 평가와 변경된 분기 몸체를 구별하고, 삭제만 있는 변경은 남은 대체 경로가 있을 때 그 위치를 확인합니다. 제품 공용 의존성의 수정 지점도 포함합니다. 개선 브랜치에서 코드가 이동하거나 인라인되면 원장 ID의 대응 위치를 다시 확인합니다.

임시 소스 복사본에 지점별 카운터를 넣고 평상시와 같은 옵션으로 dist를 빌드한 뒤, 같은 공개 fixture를 별도 프로세스에서 재생합니다. 계수 지점별 경로·범위·원장 ID, 행당 실행 횟수, 공개 결과를 보존합니다. 준비에서만 실행된 경우와 측정 구간에서 실행된 경우를 따로 기록해 준비 비용이 실측에 귀속되는 것을 막습니다. 공통 런타임 초기화 이후 행의 실제 준비와 측정 경로에서 대상 코드가 한 번이라도 실행되면 `repaired`입니다. 관련 변경 위치의 확인이 끝나고 모두 0회일 때 `plain`으로 확정합니다. 계수 지점이 실제로 잡히는 양성 fixture를 확인하고, 계수 빌드와 일반 빌드의 공개 관측이 일치해야 합니다. 증거가 빠진 0회는 `void`입니다. 일반 dist만 시간 측정에 사용합니다.

`NODE_V8_COVERAGE`는 실행된 모듈과 함수 후보를 좁히는 데 쓸 수 있습니다. 제품 빌드가 대체로 `sourcemap: false`이고 한 함수에 양쪽 경로가 들어갈 수 있어, V8 범위의 출처가 불명확한 경우는 변경 위치를 직접 확인하고 계수합니다. 행마다 패치를 만드는 비용은 같은 패키지의 여러 행을 한 계수 빌드로 재생해 줄입니다. [schema-form 빌드 설정](../../packages/canard/schema-form/rolldown.config.mjs)

`fix cost`는 분류와 별도로 확인합니다. 해당 구간에서 필요한 작업이 의도한 연산마다 한 번만 실행됐음을 보이고, 같은 조건에서 수정 경로만 분리한 대조의 min·p10으로 초과분의 귀속을 검증합니다. 같은 입력을 쓰는 임시 진단 빌드가 필요하면 그 분기만 분리하고, 해당 공개 동작이 사라지는 것과 다른 관측이 유지되는 것을 확인합니다. 최종 후보와 진단 빌드의 쌍으로 제거한 비용을 재고, 진단 빌드와 beta의 쌍으로 차이가 남는지 확인합니다. 두 진단 비교에도 A/A를 적용하며 최종 표의 후보는 원본 dist입니다. 귀속을 입증하지 못한 유효 초과 행의 판정은 `over`입니다. [수정 비용 승인 조건](../SPEED-TARGETS.md#2-측정-규칙)

## 7. 산출물과 단일 행 재실행

실행마다 `run.json`과 거기서 생성한 `report.md`를 고유 출력 디렉터리에 남깁니다. JSON에는 하니스와 두 제품 ref, archive/build 및 공개 진입점·dist 해시, 실제 의존성, Node/V8·OS·CPU·환경, 행 입력 출처·검증값, 슬롯 순서와 워밍업·배치 규격, 식별 가능한 A/B·A/A 원시 샘플과 요약, 수정 경로의 계수와 귀속 자료를 담습니다. 반올림은 표시 단계에서만 합니다. 완료 여부와 `void` 사유를 기록하고 실패 실행도 덮어쓰지 않습니다.

| package | function | input | input kind | min ratio | p10 ratio | control | verdict |
|---|---|---|---|---|---|---|---|
| 패키지 | 함수·동작 | fixture | `plain` / `repaired` / `—` | `B/A` | `B/A` | `A2/A1`의 min / p10 | `pass` / `over` / `fix cost` / `void` |

유효한 두 비율이 모두 `1.03` 이하면 `pass`입니다. 초과 시 6절의 입증을 충족하면 `fix cost`, 그 외에는 `over`입니다. AJV 6 `default/boundFirstIdResourceInvalid`의 I05 승인 상한은 두 통계 모두 `1.46`입니다. `1.03`을 넘는 이 행은 수정 비용 증거와 상한을 함께 충족해야 `fix cost`이며 상한을 넘으면 `over`입니다. 대조군 범위 이탈, 의존성 불일치, 행 검증 또는 분류 실패는 `void`이며, 무효 비율이 있으면 원자료에 보존합니다. [재측정 대상](../SPEED-TARGETS.md)

`--row <id>`는 같은 실행기의 행 선택 필터입니다. 기존 결과에서 beta나 A/A 샘플을 끌어오지 않고 새로 두 쌍을 실행합니다. 전체 표와 비교할 때 실행 범위가 단일 행임을 표시하고, 원래 실행을 덮어쓰지 않습니다. 우선순위별 묶음에도 같은 실행기를 사용합니다.

## 8. 실행 명령과 CI 재사용

아래는 구현할 CLI입니다. `--baseline-ref`와 `--candidate-ref`는 archive 생성 시 기록한 ref와 빌드 인벤토리를 대조하는 데 사용합니다. 개선 브랜치는 검증한 빌드 경로와 해당 ref를 후보로 넘깁니다.

```sh
yarn workspace @aileron/benchmark-form lint
yarn workspace @aileron/benchmark-form typecheck
yarn workspace @aileron/benchmark-form bench:speed \
  --baseline-dir /Users/Vincent/Workspace/albatrion-speed/beta --baseline-ref 1c77ced57 \
  --candidate-dir /Users/Vincent/Workspace/albatrion-speed/head --candidate-ref d78e45c6b \
  --out /tmp/albatrion-speed-first-run
```

단일 행은 같은 명령에 `--row <id>`를 붙여 새 `--out`을 지정합니다. 같은 선택자를 반복하면 한 점유 구간에 실행할 행 묶음을 지정할 수 있습니다. 하니스는 이미 빌드된 루트를 받으며 install, build, worktree 생성은 측정 시작 전에 수행합니다. 현재 두 워크플로가 쓰는 Node `20.19.5`와 워크스페이스의 React·ReactDOM `19.2.6`, jsdom `26.1.0`을 첫 고정 후보로 두고 실제 pilot과 양쪽 빌드의 호환성을 확인합니다. [Benchmark Form 의존성](../../packages/aileron/benchmark-form/package.json)

CI는 추후 각 checkout의 immutable install과 의존성 순서 빌드를 기존 워크플로에서 가져오고, 한 job 안에서 같은 CLI를 직렬로 실행해 JSON과 Markdown을 아티팩트로 올릴 수 있습니다. `prepareCheckout.mjs`는 폼 코어·AJV 중심이므로 UI와 유틸리티는 선택 행의 패키지 빌드까지 준비합니다. 최종 비교에는 같은 머신에서 완주한 결과를 사용합니다. [성능 워크플로](../../.github/workflows/performance-benchmarks.yml) · [브라우저 워크플로](../../.github/workflows/browser-benchmark.yml)

## 조정자 결정

- 외부 라이브러리 버전: 두 커밋의 `yarn.lock`에서 실제 공급 버전이 다른 것은 `antd-mobile` 하나입니다(beta 플러그인 5.40.0, 후보 플러그인 5.43.0). 비교 대상은 우리 코드이므로 두 arm이 같은 라이브러리를 써야 합니다. 5.43.0은 beta의 피어 범위 `^5.0.0`도 만족하므로, `antd-mobile` 행을 잴 때만 beta 사본에서 플러그인의 `antd-mobile`을 5.43.0으로 맞춘 별도 변형 트리를 씁니다. 이 변형은 `run.json`에 기록합니다. 그 전까지 `antd-mobile` 행은 `void`입니다.
- 입력 재구성: 행별 입력은 `ROWS-P<n>.md`가 정하고, 확신도가 낮은 행은 조정자가 확정한 뒤 구현합니다.
- 라운드, 워밍업, 배치 크기는 pilot에서 확인한 값으로 행별 설정에 고정합니다.
