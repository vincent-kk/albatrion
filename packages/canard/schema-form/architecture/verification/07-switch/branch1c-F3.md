# 분기 변경 1c와 F3, 측정기 F4

기준은 HEAD `6b5758ec8`입니다. 고침 명세는 [branch-regression-diagnosis-122.md](branch-regression-diagnosis-122.md)의 F1~F4이고, 편집자의 답은 120라운드 닫기 문서의 덧붙임(Q122)입니다. 제품 변경은 세션 scratchpad(아래 S)의 패치로만 남겼고, 작업 트리에는 측정기 도구 파일과 이 문서만 남겼습니다. git 쓰기, 설치, 시간 측정은 하지 않았습니다. 측정기의 짧은 시험 실행(표본 5개)만 했습니다.

S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

## 패치

| 파일 | 적용 기준 | 내용 | SHA-256 앞 16자 |
| --- | --- | --- | --- |
| `S/branch1c.patch` | HEAD 단독 | 1b 전체, F1, F2, 계수 시험, DETAIL | `0d6a9a0212b40afc` |
| `S/branch2.patch` | HEAD 단독 | 변경 2 그대로(바꾸지 않음) | `2bedd61f48a3493d` |
| `S/branchF3.patch` | HEAD 단독 | 변경 2 전체와 F3, 계수 시험, DETAIL | `05615d1c15e4fede` |
| `S/branchF3-on-2.patch` | HEAD에 변경 2를 적용한 상태 | F3만의 차이(지연 생성, 시험, DETAIL) | `9f99ef7717324f60` |

세 패치 모두 HEAD에서 `git apply --check`가 통과합니다. `branchF3-on-2.patch`를 변경 2 위에 적용한 결과는 `branchF3.patch`를 HEAD에 적용한 결과와 같습니다.

## 변경 1c

### 구현

- **F1.** `getDirectChildSelectionPlan`은 합집합이 아닌 호스트의 판정도 null로 캐시합니다. 캐시는 같은 파일에서 `DIRECT_CHILD_SELECTION_PLANS`라는 이름으로 내보냅니다. `primeHost`와 `selectChildren`은 먼저 이 WeakMap을 직접 조회하고, 항목이 `undefined`일 때만 함수를 부릅니다. `prepare`가 false인 조회(`primeHost`)는 여전히 캐시에 쓰지 않으므로, 나중의 선택이 계획을 준비할 수 있습니다.
- **F2.** `selectChildren`은 `context.pendingOutputs?.size`가 있을 때만 `flushPendingGateReads`를 부릅니다. 이 조건은 그 함수 자신의 즉시 반환 조건과 같으므로 동작이 같고, 빈 호출과 경로 문자열 생성만 사라집니다.
- `let`으로 캐시 결과를 다시 대입하면 tsc가 순환 추론 오류(TS7022)를 내므로, `cached`와 `direct` 두 `const`로 선언했습니다.

속도 비용은 이후 방문마다 WeakMap 조회 하나이며, 계획 함수 호출과 빈 사전 공표 호출이 사라집니다. 메모리 비용은 게이트가 있는 비합집합 호스트마다 null 항목 하나이고 청사진과 함께 사라집니다.

### 런타임 계수

같은 계측 탐침을 세 판에서 실행했습니다. 계획 함수 호출은 모듈 내보내기의 spy로, 사전 공표 호출은 `flushPendingGateReads`의 spy로 세었습니다. "빈/일함"은 `pendingOutputs`가 비어 있는 진입과 비어 있지 않은 진입의 수입니다.

| 관측 | HEAD | 1b | 1c |
| --- | --- | --- | --- |
| if-then ON, 쓰기별 계획 함수 호출(5회) | 해당 없음 | 6, 3, 3, 3, 3 | 2, 0, 0, 0, 0 |
| if-then OFF, 쓰기별 계획 함수 호출(5회) | 해당 없음 | 3, 3, 3, 3, 3 | 2, 0, 0, 0, 0 |
| if-then ON, 쓰기별 사전 공표 빈/일함 | 8/0, 이후 4/0 | 8/0, 이후 4/0 | 0/0 |
| oneOf B=5 mount 사전 공표 빈/일함 | 40/28 | 40/28 | 0/28 |
| oneOf B=10 mount 사전 공표 빈/일함 | 70/58 | 70/58 | 0/58 |
| oneOf B=20 mount 사전 공표 빈/일함 | 130/118 | 130/118 | 0/118 |
| oneOf B=40 mount 사전 공표 빈/일함 | 250/238 | 250/238 | 0/238 |
| oneOf 전환 4회의 계획 함수 호출(B 모두) | 해당 없음 | 6, 3, 3, 3 | 2, 0, 0, 0 |
| 무관 분기의 후보 접근(첫 전환, 이후) | 18, 9 | 3, 0 | 3, 0 |

일을 하는 사전 공표 진입 수(6B−2)는 세 판이 같습니다. 1c가 없앤 것은 즉시 반환하던 빈 진입뿐입니다. B=10의 일함 58회는 진단 문서가 남는다고 적은 58회와 같습니다. 후보 접근은 1b와 같습니다.

### 계수 시험

새 파일은 `src/core/settle/__tests__/selectChildren.plan-lookup-counts.test.ts`(10 cases)이고, DETAIL의 acceptance group은 `settle-child-selection-lookup`입니다. if-then(자동 쓰기 ON/OFF)은 첫 쓰기 뒤 쓰기마다 계획 함수 호출 0회와 사전 공표 빈 진입 0회를 단언합니다. B=5/10/20/40 mount는 사전 공표 진입이 `{ empty: 0, pending: 6B−2 }`임을, 전환은 1b의 후보 접근 계수와 준비 뒤 계획 함수 호출 0회를 단언합니다.

- HEAD에서는 새 기호인 계획 모듈이 없어서 수집 단계에서 실패했습니다(`Cannot find module .../getDirectChildSelectionPlan`).
- 1b에서는 10개 case가 모두 단언으로 실패했습니다. 계획 호출 `[3, 3, 3, 3]`이 `[0, 0, 0, 0]`이 아니고, mount 빈 진입이 40/70/130/250으로 0이 아니었습니다.
- 1c에서는 10개 모두 통과했습니다.

### 파괴 변형(S의 사본에서)

`S/scratch-1c/pkg`에 1c의 `src`를 복사하고 저장소의 `node_modules`를 심볼릭 링크로 연결한 뒤, 사본 전용 vitest 설정으로 계수 시험만 실행했습니다. 망가뜨리지 않은 사본은 10개 모두 통과했습니다.

| 변형 | 바꾼 것 | 결과 |
| --- | --- | --- |
| no-lookup | 두 호출 자리의 WeakMap 조회를 `undefined`로 바꿈 | 6 failed(계획 호출 `[3, 3, 3]`, `[3, 3, 3, 3]`) |
| no-null-cache | 비합집합 반환의 null 캐시를 지움 | 2 failed(if-then 계획 호출 `[3, 3, 3, 3]`) |
| no-size-guard | F2의 size 조건을 지움 | 6 failed(mount 빈 진입 40/70/130/250, if-then 빈 진입 22/26) |

세 실행 모두 종료 코드 1의 AssertionError였습니다. 빌드나 import 실패가 아닙니다.

## 변경 2

`S/branch2.patch`를 바꾸지 않았습니다. 검증 명령만 같은 방식으로 다시 실행했습니다.

## F3 — GateRegistry의 Map 두 개 지연 생성

### 범위에 관한 판단

지연 생성할 `resolvedReads`와 `segments` Map은 변경 2가 추가한 필드이며 HEAD에는 없습니다. 그래서 "HEAD 단독에 적용되는 F3"은 변경 2를 포함할 수밖에 없습니다. `S/branchF3.patch`는 변경 2와 F3을 함께 담아 HEAD 단독에 적용되게 만들었고, 조합용으로 F3만의 차이인 `S/branchF3-on-2.patch`를 따로 두었습니다. 그 결과 번들 `c-F3`와 `c-2F3`, `c-1cF3`와 `c-1c2F3`은 바이트가 같습니다. F3을 변경 2 없이 판정하는 측정은 성립하지 않으므로, 다음 세션은 `c-2` 대 `c-F3`로 F3만의 효과를 재야 합니다.

### 구현

두 필드를 `Map | undefined` 타입과 `= undefined` 초기값으로 선언했습니다. 초기값은 생성자에서 대입되므로 registry의 필드 목록과 순서는 변경 2와 같습니다. `resolveRead`와 `pathSegments`는 `this.resolvedReads ??= new Map()`과 `this.segments ??= new Map()`으로 첫 사용 때 만듭니다. production 번들에서도 `resolvedReads = void 0;` 필드 정의로 남는 것을 확인했습니다.

속도 비용은 두 메서드 호출마다 존재 확인 하나입니다. 메모리는 해석이 없는 runtime에서 빈 Map 두 개(진단 문서의 마운트당 432 B)를 아낍니다. if-then 트리는 mount와 전환 뒤에도 두 Map을 만들지 않았습니다.

### 계수 시험

새 파일은 `src/core/settle/__tests__/getGateRegistry.lazy-maps.test.ts`(4 cases)이고, acceptance group은 `settle-gate-registry-lazy-memos`입니다. 새 registry에서 두 필드가 `undefined`인지, 첫 `resolveRead` 뒤에 해석 Map만 생기는지, 첫 `pathSegments` 뒤에 segment Map이 생기는지, 그리고 그 전후로 `Object.keys(registry)`가 같은지 봅니다. union mount 뒤에는 두 Map이 모두 있고, if-then(ON/OFF)은 쓰기 뒤에도 둘 다 `undefined`입니다.

- HEAD: 2 failed(필드 목록에 두 키가 없음, mount 뒤 해석 Map 없음).
- 변경 2 단독: 3 failed(처음부터 `{ reads: 0, segments: 0 }`인 Map이 있음).
- 변경 2+F3: 4개 모두 통과.

### 파괴 변형(S의 사본에서)

`S/scratch-F3/pkg`에 2+F3의 `src`를 복사해 같은 방식으로 실행했습니다. 망가뜨리지 않은 사본은 4개 모두 통과했습니다.

| 변형 | 바꾼 것 | 결과 |
| --- | --- | --- |
| eager | 초기값을 다시 `new Map()`으로 | 3 failed |
| no-field | `= undefined` 초기값을 지움 | 2 failed(필드 목록에서 두 키가 빠지고, 생성 뒤 필드가 늘어남) |

no-field 변형은 vitest의 변환 설정(ES2020 대상, define 의미 아님)에서 필드 선언이 지워져 객체 모양이 바뀐다는 것을 보여 줍니다. 초기값이 모양 보존에 필요한 이유입니다.

## 검증

모든 명령은 PKG에서, 그 변경만 적용한 상태로 실행했습니다. 패키지 관리자 명령은 단독 호출이었고 모든 프로세스가 자연 종료했습니다. HEAD 차등 시험 `selectChildren.head-differential.test.ts`는 세 경우 모두 unit 프로젝트 안에서 통과했습니다.

| 명령 | 1c | 2 | F3(2+F3) |
| --- | --- | --- | --- |
| `npx vitest run --project unit --project render --project react18 --reporter=dot` | 460 files, 3398 passed, todo 1 | 459 files, 3385 passed, todo 1 | 460 files, 3389 passed, todo 1 |
| `yarn test:production` | 9 files, 20 passed | 9 files, 20 passed | 9 files, 20 passed |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0 | exit 0 | exit 0 |
| `npx eslint "src/**/*.{ts,tsx}"` | exit 0 | exit 0 | exit 0 |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 1677 files, exit 0 | 1674 files, exit 0 | 1675 files, exit 0 |

## 번들

`tools/prepare-branch1-bundles.mjs --patch-variants`로 만들었습니다. 이 플래그는 새 도구 `tools/prepare-patch-bundles.mjs`를 부르며, 작업 트리를 바꾸지 않고 S 안의 임시 사본에 패치의 제품 소스 부분만 적용해 HEAD 원문 위에 겹칩니다. 기존 b-* 번들과 같은 esbuild 옵션과 production 치환을 쓰고, 121 판정 어댑터와 같이 분기 fixture를 `[5, 10, 20, 40]`으로 넓혀 oneOf-40을 포함합니다. `c-headx`는 `c-head`의 바이트 뒤에 주석 한 줄만 붙인 사본입니다. 각 빌드는 패치된 파일이 모두 번들에 들어갔는지 확인했고, build service는 종료 코드 0으로 자연 종료했습니다. 목록은 `S/bundles/c-bundles.json`에 있습니다.

| 파일 | bytes | SHA-256 앞 16자 |
| --- | ---: | --- |
| c-head.cjs | 531045 | `fc6b0288c7736918` |
| c-headx.cjs | 531107 | `44efddaab613d258` |
| c-1c.cjs | 534625 | `d9f241fde3d28a82` |
| c-2.cjs | 532499 | `0e053b889ed605d7` |
| c-F3.cjs | 532619 | `1f54156cb9d08c2e` |
| c-1c2.cjs | 536079 | `506e76e8ed075218` |
| c-1cF3.cjs | 536199 | `8f08443c1ad62d36` |
| c-2F3.cjs | 532619 | `1f54156cb9d08c2e`(c-F3와 같음) |
| c-1c2F3.cjs | 536199 | `8f08443c1ad62d36`(c-1cF3와 같음) |

## 측정기 F4

- **(가) A/A 짝.** `tools/measure-verdict-121.mjs`에 `--pair <stage> <fixture> <off|on> <run>` 경로를 더했고, 구현은 `tools/measure-pair-121.mjs`에 두었습니다. 두 번들을 한 프로세스에 올리고 표본마다 순서를 바꿔 잽니다. 시계, 표본마다의 강제 gc, gc 뒤 빈 짝 버리기는 기존 worker의 것을 그대로 씁니다. `AA`는 `c-head`와 `c-headx`이고, 도구는 둘이 끝 주석 한 줄만 다른지, 그리고 두 파일이 `c-bundles.json`에 적힌 현재 HEAD 빌드와 같은지 확인합니다. `head:1c`처럼 다른 짝도 받습니다.
- **(나) gc 없는 첫 쓰기.** `--no-gc-first`를 주면 gc 있는 공식 회차 뒤에 같은 순서의 회차를 강제 gc와 빈 짝 버리기 없이 한 번 더 돌리고, 마운트 직후 첫 쓰기(`update-first`, 분기 축의 `axis-first`)만 `-nogc` 기록 열로 남깁니다. 판정 열은 gc 있는 회차의 것뿐입니다.
- **(다) 보고.** `tools/report-verdict-121.mjs --pair <파일>`은 행마다 기준−비교의 종단 짝 차이를 모아 새 A/A 크기(|짝 중앙값|)와 99% 구간을 계산하고, 119 세션의 같은 번들 A/A(`profile-119-session/analysis-AA-*.json`의 |짝 중앙값|)를 옆에 적습니다. 통계는 119 세션과 같은 xorshift 1999회 bootstrap(seed 101)입니다. gc 없는 열은 옛 값이 없어 빈칸입니다.

기존 경로는 그대로이며, `--self-test`와 `--self-check --nested-callback`이 다시 통과했습니다.

### 시험 실행(판정 아님)

`--pair AA if-then off 1`과 `--pair AA oneOf-10 off 1`을 예열 2, 표본 5, `--no-gc-first`로 실행했습니다. 두 worker 모두 종료 코드 0이었고 값 digest가 두 번들 사이에서 일치했습니다. 보고는 14행을 냈고, 그중 11행에 119 세션의 같은 번들 A/A가 있었습니다. 표본이 5개라 구간이 수십 µs로 넓어서, 아래 수치는 도구가 끝까지 도는지를 보인 것일 뿐 A/A 크기의 추정이 아닙니다.

| 행 | 새 A/A µs | 119 같은 번들 A/A µs |
| --- | ---: | ---: |
| if-then off mount | 29.042 | 1.125 |
| if-then off update-first | 0.334 | 0.541 |
| if-then off update-first-nogc(기록) | 0.082 | 없음 |
| oneOf-10 off mount | 22.917 | 2.375 |
| oneOf-10 off axis-first | 0.959 | 1.126 |
| oneOf-10 off axis-first-nogc(기록) | 43.083 | 없음 |

원자료는 `S/f4/smoke-AA.json`, 보고 출력은 `S/f4/report-AA.json`입니다.

## 남은 판단

- F3은 변경 2 없이 존재할 수 없어서, 요청된 "HEAD 단독 F3"을 변경 2를 포함한 패치로 만들었습니다. 이 해석이 맞는지는 편집자가 정해야 합니다.
- F1의 지시대로 `primeHost`는 항목이 없을 때 `prepare=false`로 함수를 부릅니다. 그 호출은 항목이 없으면 언제나 null을 반환하므로, `?? null`로 바꾸면 호출 하나를 더 줄일 수 있습니다. 시험에서는 if-then과 oneOf 모두 첫 쓰기의 2회 외에는 호출이 없었습니다.
- pair 경로는 스케줄러 경계 감사를 반복하지 않습니다. (가)의 경계 검사는 기존 단일 판 worker가 맡습니다.
