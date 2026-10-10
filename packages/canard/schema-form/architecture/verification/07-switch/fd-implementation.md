# F-D의 구현과 검증 결과를 기록합니다.

2026년 10월 10일에 `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`에서 F-D를 구현하고 검증하였습니다. 시작과 종료 HEAD는 `af057ab024668315f9fad441c60dd6a6c38f0f36`입니다. 시작 작업 트리는 깨끗했습니다. 이 기록에서 PKG는 `packages/canard/schema-form`이고 D는 `PKG/architecture/verification/07-switch`입니다. S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

## 내부 배열 버튼의 memo 경계를 구현하였습니다.

`D/react-proxy-audit-121.md`의 F-D와 배열 Button 재렌더 발견을 적용하였습니다. `src/formTypeDefinitions/DETAIL.md`에 계약과 수용 조건을 먼저 적었습니다. 이어 `src/formTypeDefinitions/FormTypeInputArray.tsx`의 삭제 버튼을 현재 `index`, 안정된 `onRemove`, `disabled`를 받는 내부 `RemoveButton` memo 컴포넌트로 바꾸었습니다. `useCallback`의 의존성을 `[index, onRemove]`로 두어 삭제로 위치가 바뀌면 현재 위치를 사용합니다. `Button`도 memo로 감쌌습니다. 두 컴포넌트는 내부 React 구현이며 공개 export와 정의 매칭 조건은 바꾸지 않았습니다.

목록 생성과 memo 속성 비교의 시간 복잡도는 O(N)으로 유지됩니다. push 때 기존 삭제 버튼의 콜백과 본문 실행을 건너뛰고 새 항목만 렌더합니다. 항목마다 내부 memo 경계와 콜백을 보유하므로 마운트의 메모리 비용이 늘 수 있습니다. 가운데 삭제는 이동한 인덱스의 콜백을 갱신합니다. DOM, 문구, 순서, disabled, readOnly, maxItems의 의미는 유지합니다. 바인딩 계약은 변경하지 않았습니다.

## HEAD의 실패와 F-D의 통과를 런타임으로 확인하였습니다.

가장 가까운 테스트 디렉터리에 `src/formTypeDefinitions/__tests__/array-button-memo.test.tsx`를 추가하였습니다. 세 테스트는 JSX 런타임의 실제 button 생성 호출, React의 원래 memo를 유지한 컴포넌트 호출 관측, 공개 Form handle의 값과 DOM을 검사합니다. 제품 소스 텍스트를 읽는 테스트는 없습니다. Vite가 함수명에 붙이는 숫자 접미사와 React 18의 default export 형태를 관측기에 반영하였습니다.

PKG에서 `npx --no-install vitest run --project render --project react18 src/formTypeDefinitions/__tests__/array-button-memo.test.tsx --reporter=dot`를 실행하였습니다. HEAD 제품 코드에서는 React 18과 19의 총 여섯 테스트가 모두 의도한 렌더 계수 차이로 실패했고 종료 코드는 1이었습니다. F-D에서는 여섯 테스트가 모두 통과했고 종료 코드는 0이었습니다. 최종 테스트를 HEAD 제품 코드에 다시 적용하여 같은 여섯 실패를 재확인하였습니다. 로그는 `S/fd-count-head.log`와 `S/fd-count-fd-final.log`에 있습니다.

각 연산을 100개 문자열 항목에서 별도로 시작하였습니다. push의 Button 실행은 HEAD 102회에서 F-D 1회로 줄었습니다. HEAD의 삭제 Button 101회와 추가 Button 1회가 F-D에서는 새 삭제 Button 1회가 됩니다. 사양의 n+1에서 n은 push 후 항목 수이므로 여기서는 n=101입니다. 기존 100개 삭제 버튼과 추가 버튼의 실행은 F-D에서 각각 0회였으며, RemoveButton 자체도 새 인덱스 100만 한 번 실행했습니다. 기존 DOM 버튼의 identity도 유지됩니다.

100개에서 `remove(37)`을 실행하면 Button은 HEAD 100회에서 F-D 62회로 줄었습니다. HEAD는 남은 삭제 버튼 99개와 추가 버튼 1개를 실행했습니다. F-D는 이동한 인덱스 37부터 98까지만 실행하며 추가 버튼은 0회입니다. 같은 DOM 위치 37에서 다시 삭제하면 F-D는 61회 실행하고 `item-38`을 제거하여 그 위치의 입력값이 `item-39`가 됩니다. 준비한 두 번들로 같은 100개 연산을 별도로 단언한 자료는 `S/fd-array-100-counts-base.json`과 `S/fd-array-100-counts-fd.json`입니다. 실행 스크립트는 `S/fd-array-100-counts.mjs`입니다.

관측 테스트의 유효성도 확인하였습니다. RemoveButton의 memo 비교를 일시적으로 항상 false로 만들면 push에서 인덱스 0부터 100까지 101번 실행되어 두 React 프로젝트의 기존 버튼 건너뛰기 테스트가 실패했습니다. 이 탐침은 원복하였으며 최종 패치에는 없습니다. 로그는 `S/fd-forced-render-mutant.log`입니다.

## 시간 측정 없이 쓰기당 할당을 관측하였습니다.

131C-01의 131라운드 덧붙임에 따른 F-D 준비 자료로 push, remove, replace의 할당을 기록하였습니다. 단위는 쓰기당 바이트입니다. `S/fd-allocation.mjs`는 단위 테스트가 아닌 scratch 런타임 스크립트입니다. 두 번들은 각각 별도 프로세스에서 nvm의 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`를 사용하였습니다. Node는 v26.11.1이고 V8은 `14.6.202.34-node.37`입니다. 실행 인수는 `--expose-gc --max-semi-space-size=256`입니다.

각 연산은 새 Form을 마운트하고 준비를 마친 뒤 전체 GC와 네 번의 setImmediate drain을 수행합니다. 연산을 flushSync로 적용하고 쓰기마다 같은 네 번의 drain을 수행한 구간의 heapUsed 증가량을 셉니다. GC observer는 횟수만 관측하며 시간과 duration은 읽지 않습니다. 모든 관측 구간의 GC 횟수가 0임을 단언하였습니다. 조건마다 예열 세 번을 제외한 아홉 표본의 쓰기당 증가량 중앙값을 보고합니다. 입력값 준비, 마운트, 결과 digest와 teardown은 관측 구간 밖에 있습니다. 이 수치는 React·JSDOM과 drain을 포함한 런타임 할당 관측이며 보유 메모리나 통계적 성능 판정은 아닙니다.

array-100의 push는 기본 100개에서 항목 한 개를 추가합니다. HEAD는 1,498,184바이트였고 F-D는 1,344,072바이트였습니다. F-D에서 154,112바이트 줄었습니다. HEAD 표본 범위는 1,429,912부터 1,610,856바이트이고 F-D 범위는 1,282,480부터 1,420,664바이트입니다.

array-100의 remove는 기본 100개에서 인덱스 37을 한 번 삭제합니다. HEAD는 14,048,568바이트였고 F-D는 14,125,104바이트였습니다. F-D에서 76,536바이트 늘었습니다. HEAD 범위는 13,842,856부터 14,188,272바이트이고 F-D 범위는 13,746,624부터 14,221,496바이트입니다.

array-100의 replace는 항목 수를 100개로 유지하며 모든 name 값을 한 번 바꿉니다. HEAD는 10,398,144바이트였고 F-D는 10,381,304바이트였습니다. F-D에서 16,840바이트 줄었습니다. HEAD 범위는 10,203,672부터 10,534,560바이트이고 F-D 범위는 10,184,120부터 10,516,904바이트입니다.

array-push-100의 push는 fixture의 빈 배열에서 작성된 100개 항목을 차례로 추가하며 구간 합계를 100번의 쓰기로 나눕니다. HEAD는 936,967.20바이트였고 F-D는 898,603.44바이트였습니다. F-D에서 쓰기당 38,363.76바이트 줄었습니다. HEAD 범위는 934,326.56부터 940,254.32바이트이고 F-D 범위는 886,809.12부터 901,416.80바이트입니다.

array-push-100의 remove는 관측 밖에서 같은 100개 push로 준비한 뒤 인덱스 99부터 0까지 삭제하며 합계를 100번의 쓰기로 나눕니다. HEAD는 355,529.20바이트였고 F-D는 309,591.52바이트였습니다. F-D에서 쓰기당 45,937.68바이트 줄었습니다. HEAD 범위는 342,330.96부터 359,860.40바이트이고 F-D 범위는 306,746.48부터 317,008.40바이트입니다.

array-push-100의 replace는 빈 배열에 같은 100개 항목을 한 번의 setValue로 넣습니다. HEAD는 63,485,008바이트였고 F-D는 63,987,928바이트였습니다. F-D에서 502,920바이트 늘었습니다. HEAD 범위는 62,558,872부터 64,208,872바이트이고 F-D 범위는 62,639,032부터 64,253,168바이트입니다.

원자료는 `S/fd-allocation-base.json`과 `S/fd-allocation-fd.json`에 있습니다. 모든 할당 연산의 최종 값과 DOM은 양쪽에서 같았습니다. 범위가 겹치는 결과도 그대로 기록하였으며 시간 향상이나 채택 verdict를 주장하지 않습니다.

## 지정된 검증 명령을 통과하였습니다.

모든 제품 검증은 PKG에서 실행하였습니다. `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot`의 최종 결과는 466개 파일과 3,425개 테스트의 통과이며 기존 todo 한 개가 있습니다. 실패는 0개이고 종료 코드는 0입니다. 최종 전체 로그는 `S/fd-full-vitest-final.log`입니다.

`yarn test:production`은 단독 Bash 호출로 실행하였으며 아홉 파일의 20개 테스트가 통과하고 종료 코드가 0이었습니다. 로그는 `S/fd-production.log`입니다. `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json`과 `npx --no-install eslint "src/**/*.{ts,tsx}"`도 최종 종료 코드가 0이고 오류 출력이 없었습니다. `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`는 종료 코드 0과 `LEGACY_ISOLATED: 1681 files checked`를 출력하였습니다. 제품 구현을 바꾸지 않은 이후의 테스트 관측기 타입 보완은 최종 타입 검사와 여섯 계수 테스트로 확인하였습니다.

패키지 관리자 명령은 모두 단독 호출로 실행하였으며 파이프, 리다이렉트, 환경 접두사와 추가 shell 명령을 붙이지 않았습니다. 설치, add, commit, stash를 실행하지 않았습니다. 각 명령의 종료를 확인한 후 다음 명령을 실행했습니다. 제품 검증, 번들 빌드, 런타임 계수와 할당 관측 프로세스는 모두 스스로 종료했고 단일 명령은 8분을 넘지 않았습니다. 시간 벤치마크와 판정 세션은 실행하지 않았습니다.

초기 파일 조사에서 검색 범위를 너무 넓게 잡은 rg 호출 한 개가 execFileSync의 출력 버퍼 한도를 넘어 `ENOBUFS`로 중단되었습니다. 이 검색 프로세스는 자체 종료 조건의 예외이며, 해당 조건을 완전히 준수했다고 주장하지 않습니다. 이후에는 파일 목록과 좁은 범위로 수집했습니다. 이 실패는 제품 테스트, 할당 관측, 번들 검증과 touch-counts의 증거로 사용하지 않았습니다.

## HEAD 전용 패치와 판정용 번들을 보존하였습니다.

`S/fd.patch`는 DETAIL, FormTypeInputArray, 새 array-button-memo 테스트의 세 파일만 담습니다. 이 기록은 패치에 포함하지 않았습니다. 제품과 테스트를 원복한 HEAD에서 `git apply --check S/fd.patch`가 종료 코드 0으로 통과하였으므로 af057ab02에 단독 적용할 수 있습니다.

`S/fd-prepare.mjs`는 `D/tools/prepare-react-bundles.mjs`의 `prepareReactBundles`에 전체 기준 커밋을 `head` 인자로 전달하여 빌드했습니다. `measure-react-pair-126.entry.tsx`와 `equivalentHarness: true`를 사용하므로 세션 러너가 기대하는 Form·fixture·상호작용·동등 폼 마운트 API가 있습니다. HEAD 번들은 `S/bundles/r132-base.cjs`이고 HEAD와 F-D 패치의 제품 번들은 `S/bundles/r132-fd.cjs`입니다. 번들은 계수 관측을 위한 제품 코드 계측을 넣지 않은 production 번들입니다. esbuild 서비스는 각각 stdin 종료 후 자연 종료 코드 0을 확인했습니다.

기준 번들은 962,784바이트이고 SHA-256은 `43b1dac346a93ca4fc751d0d979b6a0f322e2c8761405d2318879cfc556f0b1c`입니다. F-D 번들은 963,200바이트이고 SHA-256은 `afe3b951fd7cbab3ba96aa932dac76f67303ea824e01cc0b90e8df09188ce9ce`입니다. 매니페스트는 `S/bundles/r132-fd-manifest.json`이며 `baseRevision`과 각 entry의 `revision`은 모두 전체 HEAD 리비전입니다. 후보의 `sourceRevision`에는 이 기준과 fd.patch 적용 상태를 기록했습니다. `verifyBundles131({ kind: 'verdict', base, candidate })`로 양쪽 파일, 바이트 수, SHA-256과 기준 리비전을 검증하였습니다. 이 검증은 시간 verdict의 실행이나 채택 판정이 아닙니다.

## React 행의 실제 작업량으로 touch-counts를 만들었습니다.

`D/harness-131.md`, `D/tools/scope-rows-131.mjs`와 `session-rows-131.mjs`의 행 키와 입력 형태를 확인하였습니다. `S/fd-runtime-counts.mjs`는 두 준비 번들을 각각 별도 프로세스에서 실행하고 React profiling 런타임의 컴포넌트 본문 호출, beginWork 방문, 새 fiber 수를 메모리 안에서 관측했습니다. 디스크의 React 파일과 번들은 변경하지 않았습니다. 시간 값을 읽는 동등 폼 마운트 함수는 호출하지 않고 Form을 직접 마운트했습니다. Profiler는 커밋 횟수만 세며 duration을 저장하지 않습니다.

19개 fixture의 마운트와 작성된 모든 상호작용을 실행하였습니다. 두 번들의 시작·종료 값, DOM, data-path 목록과 커밋 횟수가 모두 같음을 단언했습니다. 컴포넌트별 호출 수의 절대 차이 합에 방문 수와 생성 수의 절대 차이를 더한 비음수 정수를 해당 단계의 `calls`로 사용합니다. memo 경계가 달라지는 마운트는 Button 본문 횟수가 같더라도 변경 작업이 있으므로 양수입니다. 이는 절감량이나 시간 추정이 아니라 실행 작업의 변경 여부를 나타내는 보수적인 계수입니다. 동일한 마운트 또는 쓰기 구간을 보는 wall·active·profiler·commits 열과 그 nogc 열에는 같은 런타임 작업 계수를 연결합니다.

`S/session-132e-counts/react-counts.json`은 러너가 받는 행 키별 숫자 객체입니다. 304개 키를 모두 포함하며 88개 키는 양수이고 216개 키는 명시적으로 0입니다. `scopeRows131`에 24·8블록 설정으로 전달하여 모든 계수가 누락 없이 인식되는 것을 확인했습니다. 감시 행은 0 계수라도 러너의 기존 규칙에 따라 전체 범위가 될 수 있습니다.

마운트 영향 fixture는 `sample-2`, `sample-3`, `array-100`, `array-500`, `array-1000`, `array-push-100`, `array-replace-200`, `array-push-remove-100`입니다. 각 fixture의 `/off/mount-wall`, `/off/mount-active`, `/off/profiler-mount`, `/off/commits-mount`와 각각의 `-nogc` 키가 양수입니다. 이 단계 계수는 순서대로 4, 20, 502, 2,502, 5,002, 2, 2, 2입니다.

갱신 영향 fixture는 `array-push-100`, `array-replace-200`, `array-push-remove-100`입니다. 각 fixture의 `/off/update-wall`, `/off/update-active`, `/off/profiler-update`, `/off/commits-update`와 각각의 `-nogc` 키가 양수입니다. 이 단계 계수는 순서대로 15,449, 1,002, 30,599입니다. 그 밖의 행은 모두 0입니다. 기존 array-100·500·1000의 잎 값 변경에서는 버튼 본문이나 fiber 작업이 바뀌지 않으므로 update 열을 0으로 기록했습니다.

array-push-100의 100번 push에서 Button 실행 합계는 HEAD 5,150회이고 F-D 101회입니다. 빈 배열에서 첫 push는 양쪽에서 추가 버튼까지 포함하여 두 번 실행하며 이후 F-D push는 각각 한 번입니다. 따라서 이 fixture의 평균은 쓰기당 51.50회에서 1.01회로 줄었습니다. array-push-remove-100의 뒤 100번 끝 항목 삭제는 HEAD 5,050회에서 F-D 0회로 줄었습니다. 전체 200번 상호작용에서는 HEAD 10,200회와 F-D 101회입니다. 이 예외와 합계도 관측 자료에 보존하였습니다.

양쪽 런타임 원자료는 `S/session-132e-counts/base-runtime.json`과 `fd-runtime.json`이고, 304개 행의 연결 근거는 같은 디렉터리의 `touch-evidence.json`입니다. 후속 시간 판정은 이 작업의 범위가 아닙니다.

## 작업 트리를 HEAD로 돌리고 이 기록만 남겼습니다.

요청된 `git checkout --`은 sandbox가 `.git/worktrees/stage-07/index.lock` 생성을 금지하여 실패했습니다. git 메타데이터 쓰기를 확대하지 않고 HEAD blob을 읽어 native 파일 편집으로 두 추적 파일을 정확히 복원했습니다. 복원 실패 직후의 계수 실행은 F-D였으므로 HEAD 실패 근거로 사용하지 않았습니다. 추적 파일의 `git diff --exit-code`가 종료 코드 0임을 먼저 확인한 뒤 최종 HEAD 실패를 재현했습니다. 새 테스트는 패치와 로그에 보존한 뒤 작업 트리에서 삭제했습니다.

최종 작업 트리에는 `D/fd-implementation.md`만 새 파일로 남깁니다. 생성 번들, 할당 자료, 계수 파일, scratch 스크립트와 검증 로그는 모두 S에 있습니다. 공개 표면 변경과 git 커밋은 없습니다.
