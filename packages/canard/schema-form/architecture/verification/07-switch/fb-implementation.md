# F-B의 구현과 검증 결과를 기록합니다.

2026년 10월 10일에 stage-07 작업 트리에서 React 입력 경계 변경 F-B를 구현하고 검증하였습니다. 시작과 종료 HEAD는 `e805074de8a9cb0c072a81284a166ab985a113be`이며 시작 작업 트리는 깨끗했습니다. PKG는 `packages/canard/schema-form`이고 D는 `PKG/architecture/verification/07-switch`입니다. S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

먼저 `D/react-proxy-audit-121.md`의 F-B와 이탈 지점 3, `D/fd-implementation.md`, `D/fd-a500-diagnosis.md`, `D/fd-prime-implementation.md`, 현재 입력 경계 구현을 읽었습니다. PKG의 CLAUDE.md와 Error Isolation 절, seiri·filid 규칙, 소유 모듈의 INTENT·DETAIL을 확인하였습니다. 기존 F-A′가 사용하는 직접 ErrorBoundary를 유지하면서 generation 전달 층만 제거하였습니다.

## 입력 감싸개가 적용 세대를 직접 소비하도록 구현하였습니다.

제품 코드보다 먼저 `src/helpers/formTypeInputDefinition/DETAIL.md`의 계약을 갱신하고, INTENT의 깊이 보존 문장을 새 경계 구조에 맞게 바꾸었습니다. `withFormTypeInputErrorBoundary`는 memo 함수 하나가 입력 props에서 inputGeneration을 분리하고, 기존 useBoundaryReporter에 현재 path를 전달하며, ErrorBoundary의 직접 자식인 원래 입력에만 적용 세대 key를 줍니다. 별도 Input 컴포넌트는 제거하였습니다.

ErrorBoundary는 generation key 바깥에 있어 Refresh 뒤에도 같은 인스턴스를 유지합니다. 정상 입력만 다시 마운트하며 실패한 입력 경계는 Refresh로 복구되지 않습니다. RequestRemount와 Form key 교체의 복구 동작, 조합 입력과 자식 프록시가 있는 컨테이너의 세대 보류, 공개 입력 props에서 inputGeneration을 숨기는 동작을 유지하였습니다. 112C-01, EVENT-039, ERROR-090·114·117의 기존 검증도 통과하였습니다.

필드마다 새로운 클로저·훅·상태 객체를 추가하지 않았습니다. 기존 보고기 훅은 그대로 사용하고, resolver가 만드는 memo 컴포넌트가 제거한 generation 전달 컴포넌트를 대신합니다. 메모 비교는 작은 props 집합을 얕게 비교하며, 아래 보유량 관측은 별도로 기록하였습니다.

패치는 여섯 파일을 포함합니다. 입력 경계의 INTENT·DETAIL·구현, 기존 `SchemaNodeProxy/__tests__/renderCounts.test.ts`, 새 `formTypeInputDefinition/__tests__/inputBoundaryLayer.test.tsx`, `D/tools/measure-react-render-counts.mjs`입니다. 계측 도구의 counts-only 모드는 전역 문맥·오류 표시·readOnly 변화도 실행하지만 DOM 지연 측정 구간은 계속 실행하지 않습니다. 기존 경계 시험의 단언은 바꾸지 않았습니다.

## HEAD의 실패와 F-B의 통과를 런타임으로 확인하였습니다.

제품을 수정하기 전에 새 직접 자식·Refresh 시험을 render와 react18 프로젝트에서 실행하였습니다. 두 시험 모두 실제 ancestry가 ErrorBoundary 대신 중간 Input을 가리켜 실패하였습니다. 이어 unit 프로젝트의 계수 시험은 실제 fiber 20개와 렌더 10회 때문에 세 시험이 실패하고 기존 격리 시험 하나가 통과하였습니다. 두 명령의 종료 코드는 각각 1이며, 수집 오류나 누락된 import로 실패한 것이 아닙니다.

F-B에서는 위 여섯 계수·구조 시험이 모두 통과하였습니다. 기존 refreshBoundary·refreshGeneration·rendererBoundary 시험을 포함한 집중 실행은 9개 파일과 116개 시험이 통과하고 종료 코드 0으로 끝났습니다. 새 직접 자식 시험은 DOM에 연결된 React fiber의 실제 ancestry, 경계 객체 identity, 입력 DOM identity, 마운트 횟수와 caret 초기화를 관측합니다. 제품 소스 텍스트를 읽어 구조를 단언하지 않습니다. 계수 시험도 production React 런타임의 실제 함수·클래스 호출과 살아 있는 fiber를 셉니다.

| 관측 조건을 기록하였습니다. | HEAD의 계수를 기록하였습니다. | F-B의 계수를 기록하였습니다. |
| --- | ---: | ---: |
| 필드마다 살아 있는 fiber를 관측하였습니다. | 20 | 19 |
| 자기 필드 쓰기마다 컴포넌트 렌더를 관측하였습니다. | 10 | 9 |
| 전역 context와 showError 변화에서 필드마다 렌더를 관측하였습니다. | 10 | 9 |
| 전역 readOnly 변화에서 필드마다 렌더를 관측하였습니다. | 5 | 4 |
| 명시적 Refresh의 해당 필드 렌더를 관측하였습니다. | 5 | 4 |

제어·비제어 입력의 수치는 같았습니다. 형제·부모 쓰기는 변경되지 않은 필드를 렌더하지 않았고, 전역 변화는 입력을 다시 마운트하지 않았습니다. Refresh에서는 같은 경계 객체 아래의 원래 입력만 새 DOM과 두 번째 마운트를 만들었습니다. 확정 번들의 작은 계수 원자료는 `S/fb-diag/small-counts-base.json`과 `small-counts-fb.json`이며 재현 도구는 `S/fb-small-counts.mjs`입니다.

## 마운트 후 힙과 쓰기 창 scavenge 생존량을 관측하였습니다.

기존 `S/fdp-diag/probe.mjs` 패턴을 `S/fb-diag/probe.mjs`로 복사하고 번들 이름을 r133으로 바꾸었습니다. 시간·ELU·Profiler duration 수집을 제거하고, 같은 Form·Profiler·handle 준비·마운트 drain을 직접 구성하여 마운트 시간도 읽지 않았습니다. Profiler는 커밋 횟수만 세었습니다. clone fixture, 마운트 전 전체 GC와 네 번의 setImmediate drain, 마운트 후 none 조건, fixture 상호작용과 drain, WIN-START·WIN-END 표식을 유지하였습니다.

각 fixture·후보를 독립 프로세스에서 예열 5회와 표본 30회로 실행하였습니다. 모든 보유량·할당 프로세스와 보유량 드라이버는 `$HOME/.nvm/versions/node/v26.11.1/bin/node`만 사용하였으며 한 번에 하나씩 실행하고 자연 종료를 기다렸습니다. Node는 v26.11.1이고 V8은 14.6.202.34-node.37입니다. 보유량 자식 인수는 `--expose-gc --trace-gc-nvp`이며 별도 시간 벤치마크와 A/A·verdict 실행은 하지 않았습니다.

아래 힙은 전체 GC로 보유 객체만 분리한 값이 아니라, 기존 진단과 같은 마운트 후 h0.used 중앙값입니다. 마운트 전 m0.used를 뺀 증가량도 함께 기록하였습니다. 생존량·승격량은 쓰기 창 안의 scavenge에 한정한 중앙값입니다. array-500의 창은 fixture의 잎 쓰기 한 번이고 flat-500의 창은 fixture의 잎 쓰기 열 번입니다.

| 바이트 단위 관측값을 기록하였습니다. | HEAD의 중앙값을 기록하였습니다. | F-B의 중앙값을 기록하였습니다. |
| --- | ---: | ---: |
| array-500의 마운트 후 heap used를 관측하였습니다. | 268,804,180 | 267,892,644 |
| array-500의 마운트 전 대비 증가량을 관측하였습니다. | 156,772,888 | 155,931,332 |
| array-500의 쓰기 창 scavenge 생존량을 관측하였습니다. | 520,020 | 473,408 |
| array-500의 쓰기 창 scavenge 승격량을 관측하였습니다. | 6,161,744 | 6,176,828 |
| flat-500의 마운트 후 heap used를 관측하였습니다. | 102,501,000 | 102,546,120 |
| flat-500의 마운트 전 대비 증가량을 관측하였습니다. | 48,673,328 | 48,795,356 |
| flat-500의 쓰기 창 scavenge 생존량을 관측하였습니다. | 4,888,568 | 4,949,008 |
| flat-500의 쓰기 창 scavenge 승격량을 관측하였습니다. | 8,627,136 | 8,571,608 |

array-500은 양쪽 모두 30개 표본 창마다 scavenge 하나가 있었고, flat-500은 양쪽 모두 30개 중 29개 창에서 하나가 있었습니다. flat-500의 생존량 중앙값은 GC가 있는 29개 창으로 계산하였으며 GC가 없는 창을 생존량 0으로 바꾸지 않았습니다. array-500의 마운트 후 힙은 F-B에서 911,536B 낮았지만 flat-500은 45,120B 높았습니다. 필드별 보유 객체를 추가하지 않았다는 구현 사실과 별개로, 모든 fixture에서 절대 힙이 줄었다고 주장하지 않습니다.

GC trace의 실제 출력은 JSON 형식입니다. 최초 집계가 이전 key=value 형식만 찾았던 오류를 실제 로그 확인 후 수정하고 같은 원자료를 다시 집계하였습니다. 프로브를 다시 실행하거나 시간 값을 분석하지 않았습니다. 원자료는 `S/fb-diag/{array-500,flat-500}-{base,fb}.json`과 같은 이름의 `.log`이며 드라이버는 `trace.mjs`, 집계 도구는 `summarize.mjs`, 최종 결과는 `summary.json`입니다.

## 일곱 조건의 쓰기당 할당을 관측하였습니다.

기존 F-D′ 도구를 `S/fb-allocation.mjs`로 복사하여 후보와 번들 이름을 바꾸고 flat-500의 잎 쓰기 한 번을 추가하였습니다. 실행 인수는 `--expose-gc --max-semi-space-size=256`이며 시간 값은 읽지 않았습니다. 조건마다 새 마운트와 준비 뒤 전체 GC와 네 번의 setImmediate drain을 수행하고, 쓰기와 drain을 포함한 heapUsed 증가량을 관측하였습니다. 예열 세 번을 제외한 아홉 표본의 B/write 중앙값이며 모든 창의 GC 횟수 0을 단언하였습니다.

array-100은 기본 100개에서 한 번 push하거나 index 37을 한 번 remove하며, replace는 길이를 유지하고 모든 name 값을 바꿉니다. array-push-100의 push는 빈 배열에서 100번 추가하고 remove는 관측 밖에서 100번 추가한 뒤 끝부터 100번 삭제하며, 두 연산의 구간 합계는 쓰기 100번으로 나눕니다. 이 fixture의 replace는 빈 배열에 100개를 한 번에 설정합니다. flat-500은 fixture의 첫 잎 쓰기만 실행합니다.

| fixture와 연산을 기록하였습니다. | HEAD의 B/write를 기록하였습니다. | F-B의 B/write를 기록하였습니다. | HEAD 표본 범위를 기록하였습니다. | F-B 표본 범위를 기록하였습니다. |
| --- | ---: | ---: | ---: | ---: |
| array-100의 push를 관측하였습니다. | 1,348,136 | 1,356,352 | 1,293,136–1,438,584 | 1,284,528–1,431,720 |
| array-100의 remove를 관측하였습니다. | 13,998,888 | 14,037,064 | 13,791,888–14,078,888 | 13,724,720–14,098,824 |
| array-100의 replace를 관측하였습니다. | 10,355,888 | 10,358,592 | 10,237,176–10,512,840 | 10,173,280–10,479,296 |
| array-push-100의 push를 관측하였습니다. | 898,151.20 | 894,790.16 | 892,007.28–901,977.52 | 889,171.12–900,406.88 |
| array-push-100의 remove를 관측하였습니다. | 319,438.16 | 318,073.84 | 310,465.36–320,521.36 | 310,662.80–324,770.64 |
| array-push-100의 replace를 관측하였습니다. | 63,953,800 | 63,543,864 | 62,934,440–64,222,416 | 62,802,184–63,819,304 |
| flat-500의 잎 쓰기를 관측하였습니다. | 133,264 | 134,544 | 131,232–164,072 | 131,784–142,120 |

두 후보의 최종 값과 DOM digest가 일곱 조건에서 정확히 같음을 확인하였습니다. 이 값은 React·JSDOM·drain을 포함한 GC 없는 창의 할당이며 보유량이나 시간 판정이 아닙니다. 원자료는 `S/fb-allocation-base.json`과 `fb-allocation-fb.json`이며 최종 번들 SHA와 일치함을 집계 도구에서 단언하였습니다.

## 지정된 다섯 검증 명령을 모두 통과하였습니다.

모든 제품 검증은 PKG에서 실행하고 각 명령이 끝난 뒤 다음 명령을 시작하였습니다.

- `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot`는 468개 파일과 3,428개 시험 통과, 기존 todo 한 개, 실패 0개, 종료 코드 0을 보고하였습니다.
- `yarn test:production`은 단독 Bash 호출로 실행하였으며 9개 파일과 20개 시험 통과, 실패 0개, 종료 코드 0을 보고하였습니다.
- `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json`은 오류 출력 없이 종료 코드 0으로 끝났습니다.
- `npx --no-install eslint "src/**/*.{ts,tsx}"`는 오류 출력 없이 종료 코드 0으로 끝났습니다.
- `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`는 `LEGACY_ISOLATED: 1682 files checked`와 종료 코드 0을 보고하였습니다.

수집한 출력은 `S/fb-focused.log`, `fb-full-vitest.log`, `fb-production.log`입니다. 전체 Vitest 출력 일부는 도구의 출력 한도로 잘렸으므로 전문 로그라고 주장하지 않으며, 완료 요약과 종료 코드는 확인하였습니다. 기존 validator·virtualization·Storybook·Node 경고가 있었고 실패는 없었습니다.

PKG/CLAUDE.md의 Error Isolation 설명은 계속 정확합니다. resolver의 사설 입력 어댑터가 경계를 한 번 적용하고 소비처마다 새 경계를 붙이지 않습니다. 공개 선택 우선순위와 오류 보고 계약도 같습니다. CLAUDE.md는 수정하지 않았으며 제안할 대체 문장이 없습니다.

## HEAD 전용 패치와 A/A·F-B 판정용 번들을 보존하였습니다.

`S/fb.patch`는 여섯 파일의 변경만 담고 이 기록은 포함하지 않습니다. F-B 작업 트리에서 `git apply --reverse --check S/fb.patch`가 통과하였고, 원본 파일을 복원한 뒤 `git apply --check S/fb.patch`도 종료 코드 0으로 통과하였습니다. 따라서 e805074de에 다른 패치 없이 단독 적용할 수 있습니다.

`S/fb-prepare.mjs`는 D/tools/prepare-react-bundles.mjs의 prepareReactBundles에 전체 기준 커밋을 head 인자로 전달하였습니다. entry는 `measure-react-pair-126.entry.tsx`이고 equivalentHarness는 true입니다. 제품 번들에 작업 계측을 넣지 않았으며 모든 esbuild 서비스가 stdin 종료 뒤 자연 종료 코드 0으로 끝났습니다. basex는 확정한 base 뒤에 `// r133 A/A trailing comment` 한 줄만 덧붙인 파일입니다.

| 번들을 기록하였습니다. | 바이트 수를 기록하였습니다. | SHA-256을 기록하였습니다. |
| --- | ---: | --- |
| `S/bundles/r133-base.cjs`는 HEAD입니다. | 962,944 | `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027` |
| `S/bundles/r133-basex.cjs`는 A/A 후보입니다. | 962,973 | `1cf9895ddbba58f7edf7a4751b08da991766057e13575679fad4b1af9b075940` |
| `S/bundles/r133-fb.cjs`는 HEAD와 F-B 패치의 제품 번들입니다. | 962,926 | `b8c36a3878d1a733795a085dc7532fc1a2382337cc349fb792bfd795c04dab00` |

각 번들의 manifest는 `r133-base-manifest.json`, `r133-basex-manifest.json`, `r133-fb-manifest.json`이며 같은 bundles 디렉터리에 있습니다. A/A 쌍의 manifest는 `r133-aa-manifest.json`입니다. 모든 baseRevision과 entry revision은 전체 e805074de 리비전이고 후보 sourceRevision에는 fb.patch 적용 상태를 기록하였습니다. verifyBundles131의 aa·verdict 형식 검증에서 바이트 수·SHA·기준 리비전과 A/A의 정확한 한 줄 차이를 확인하였습니다. 이는 A/A나 시간 verdict 실행이 아닙니다.

초기 빌드는 이전 기록에서 발견한 미사용 isInteger 초기화를 포함하기도 했습니다. 정리 검사의 초기 정규식이 `Number.isInteger`까지 잡아 한 번 실패하였으므로 독립 식별자 검사로 좁혔습니다. 진행 설명에서 이 오탐을 React prop으로 언급한 것은 부정확하였으며 실제 대상은 Number.isInteger 호출이었습니다. 최종 빌드는 해당 초기화 없이 직접 생성되었고 manifest에 normalization 기록이 없습니다. 생성기에는 재현 시 같은 미사용 코드만 정리하는 검사를 남겼습니다. 첫 할당 실행은 확정 번들 생성 전에 시작되어 자연 종료를 기다린 후 참고 자료 `S/fb-diag/pre-final-allocation-base.json`로 보존하였으며, 위 표에는 확정 번들로 다시 실행한 결과만 사용하였습니다.

최종 base와 fb를 모듈별로 비교하면 esbuild가 만든 React import·memo 식별자 번호를 제외한 차이는 입력 경계 모듈 하나입니다. 보유량·할당·touch-count와 작은 계수 관측은 이 최종 번들을 사용하였고 그 뒤 번들을 다시 빌드하지 않았습니다.

`git diff --quiet 65f74e669 HEAD -- packages/canard/schema-form/src/core`는 종료 코드 0입니다. 코어 소스가 같으므로 요청 조건에 따라 `S/bundles/h-head.cjs`와 `h-headx.cjs`의 새 빌드는 생략하였습니다.

## 실제 React 작업량으로 304행 touch-count를 만들었습니다.

`S/fb-runtime-counts.mjs`는 F-D′ 계수 도구를 복사하여 r133-base와 r133-fb를 비교합니다. React profiling 런타임을 메모리 안에서 관측하여 함수·클래스 호출, beginWork 방문, 새 fiber 수를 셌습니다. 디스크의 React와 제품 번들은 수정하지 않았고 Profiler는 커밋 횟수만 세었습니다. 시간이나 duration을 저장하지 않았습니다.

19개 fixture의 마운트와 모든 작성된 상호작용을 실행하고 양쪽의 시작·종료 값, DOM, data-path, 커밋 횟수가 같음을 단언하였습니다. 단계별 calls는 컴포넌트 이름별 호출 차이의 절대값 합에 방문·생성 수 차이의 절대값을 더한 비음수 정수입니다. memo 경계의 이름 변화도 포함하므로 calls를 절감량이나 시간 추정으로 해석하지 않습니다.

`S/session-133-counts/react-counts.json`은 러너가 받는 행 키별 숫자 객체이며 304개 키가 모두 양수입니다. scopeRows131에 24·8블록 설정으로 전달하여 모든 키와 수치가 인식됨을 확인하였습니다. 아래 각 fixture의 mount 칸은 `/off/mount-wall`, `mount-active`, `profiler-mount`, `commits-mount`와 각각의 `-nogc` 행에 같은 calls를 연결합니다. update 칸도 `/off/update-wall`, `update-active`, `profiler-update`, `commits-update`와 각각의 `-nogc` 행에 연결합니다. 따라서 표의 한 행은 실제 러너 행 16개를 뜻하며 전체 304개가 touched입니다.

| 영향을 받은 fixture를 기록하였습니다. | mount의 각 행 calls를 기록하였습니다. | update의 각 행 calls를 기록하였습니다. |
| --- | ---: | ---: |
| sample-0을 관측하였습니다. | 19 | 8 |
| sample-1을 관측하였습니다. | 54 | 12 |
| sample-2를 관측하였습니다. | 34 | 12 |
| sample-3을 관측하였습니다. | 209 | 12 |
| flat-50을 관측하였습니다. | 259 | 80 |
| flat-100을 관측하였습니다. | 509 | 80 |
| flat-500을 관측하였습니다. | 2,509 | 80 |
| nested-d3-f4를 관측하였습니다. | 429 | 160 |
| nested-d5-f4를 관측하였습니다. | 6,829 | 240 |
| array-100을 관측하였습니다. | 2,014 | 16 |
| array-500을 관측하였습니다. | 10,014 | 16 |
| array-1000을 관측하였습니다. | 20,014 | 16 |
| computed-visible-derived를 관측하였습니다. | 29 | 33 |
| oneOf-5를 관측하였습니다. | 34 | 46 |
| oneOf-10을 관측하였습니다. | 34 | 46 |
| oneOf-20을 관측하였습니다. | 34 | 46 |
| array-push-100을 관측하였습니다. | 14 | 2,800 |
| array-replace-200을 관측하였습니다. | 14 | 4,008 |
| array-push-remove-100을 관측하였습니다. | 14 | 3,600 |

원자료는 같은 디렉터리의 `base-runtime.json`과 `fb-runtime.json`이며 정확한 행 키·계수·번들 SHA·연결 근거는 `touch-evidence.json`에 보존하였습니다. 후속 A/A와 F-B 판정은 실행하지 않았습니다.

## 작업 트리를 HEAD로 복원하고 이 기록만 남겼습니다.

git add·commit·stash·checkout·restore·reset은 실행하지 않았고 설치도 하지 않았습니다. HEAD 원본을 native 파일 편집으로 복원하고 새 계수 시험을 삭제하였습니다. 복원 직후 `git diff --exit-code`가 종료 코드 0이었고 패치 단독 적용 검사도 통과하였습니다. 마지막에는 D/fb-implementation.md만 새 파일로 남깁니다.

패키지 관리자 명령은 모두 단독 Bash 호출이며 파이프·리다이렉트·추가 shell 명령·환경 접두사를 붙이지 않았습니다. 모든 실행 명령과 자식 프로세스의 종료를 기다렸고 수동 종료하지 않았으며 단일 명령은 8분을 넘지 않았습니다. 별도 타이밍 측정 없이 요청한 보유량·쓰기당 할당과 런타임 작업 계수만 관측하였습니다. 패치·번들·manifest·프로브·계수 자료와 scratch 도구는 S에 보존하였습니다.
