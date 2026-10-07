# 분기 변경 1b·2 — 지연 선택과 경로 해석

기준은 `3a637c4cd`입니다. stage-07 안에서 구현·검증했고 최종 작업 트리에 두 변경을 남겼습니다. 설치·git 쓰기·시간 측정은 실행하지 않았습니다. 아래는 구현과 런타임 계수의 결과이며 성능 채택 판정은 후속 측정 세션의 몫입니다.

## 변경 1b와 비용

`src/core/settle/utils/compute/selectChildren.ts:148`에서 load를 제외한 실제 선택에만 기존 후보 계획을 준비합니다. 첫 선언의 oneOf/anyOf가 둘 이상이고 기존 단일 선언·단일 읽기 자격을 만족하는 객체만 사용합니다. `primeHost`는 준비된 baseline만 조회하고 계획을 만들지 않습니다. if-then·단일 분기는 계획을 만들지 않으며, union도 mount와 무관한 common 잎 쓰기까지 계획이 없습니다.

속도 비용은 첫 사용의 O(후보 수) 자격 확인·계획 준비와 O(1) 조회입니다. 준비 전 첫 primeHost의 후보 순회는 남고, 이후에는 baseline만 순회합니다. 선택은 같은 순서의 step으로 원래 자리마다 조건을 평가하며 반복 후보 접근·ID 배열 생성·후보별 사전 공표 진입을 줄입니다. branchless 안정 갱신과 load는 준비 호출을 건너뜁니다. if-then·단일 분기의 non-load 선택에는 O(1) 적격 판정/빈 조회가 있고 계획 구축·보유 비용은 없습니다.

메모리는 모듈의 약한 map 하나와 준비된 청사진 호스트당 O(후보 수)의 step·ID 배열·baseline 참조입니다. 실패한 자격은 해당 union 호스트에 null로 메모합니다. live record·값·조건 결과는 보관하지 않고 step 객체는 같은 필드 형태를 유지합니다. 최초 준비 비용을 이후 전환 계수와 섞어 0으로 표시하지 않았습니다.

## 변경 2와 비용

`src/core/settle/utils/gates/getGateRegistry.ts:48`에서 같은 host/dependency 쌍을 한 번 해석합니다. 평가에서는 기존 등록의 `watchPaths`를 직접 읽고(`evaluateGate.ts:120`), 후보 공표도 같은 해석 메모를 사용합니다. 실제 포인터 읽기는 decoded segment를 재사용합니다. if/discriminator의 host가 현재 owner이면 그 record를 사용하고, 다른 host는 현재 구조를 계속 탐색합니다.

속도 비용은 유일 쌍/포인터당 O(경로 길이)의 해석·분해와 이후 O(1) 메타데이터 조회입니다. 동일 포인터의 split·unescape와 동일 owner의 host 재탐색을 제거합니다. 실제 projected 읽기·공표·의존 배열 순서·조건 호출·catch·gateThrowVersion·오류 위치는 유지합니다. branchless registry는 해석/분해를 직접 수행하며 runtime별 map은 만들지 않습니다.

메모리는 기존 runtime 소유 registry의 map 두 개와 그 수명 동안 실제 요청한 유일 host/dependency 쌍 및 포인터 segment에 비례합니다. 제거된 경로의 문자열도 runtime 수명까지 남을 수 있습니다. 노드·값·게이트 결과 캐시는 추가하지 않습니다. 함수 호출은 같은 경로를 사용하고 새 선택/경로 루프는 classic loop입니다. heap byte와 시간 이득은 측정하지 않았습니다.

## 런타임 계수

제품 소스 문자열을 단언하지 않습니다. 후보 배열의 실제 indexed access, 공표 함수 진입, 실제 컴파일된 조건 호출과 실제 경로 해석 호출을 관측합니다. B=5/10/20/40에서 kind_0→kind_4→kind_0를 두 번 수행합니다.

| 무관 분기당 관측 | HEAD | 1b | 2 | 1b+2 |
| --- | ---: | ---: | ---: | ---: |
| 첫 전환 후보 배열 접근 | 18 | 3 | 18 | 3 |
| 준비 후 후보 배열 접근 | 9 | 0 | 9 | 0 |
| 첫 전환 후보 사전 공표 진입 | 12 | 0 | 12 | 0 |
| 준비 후 후보 사전 공표 진입 | 6 | 0 | 6 | 0 |
| 첫 전환 경로 해석 — 무관 분기 1 | 16 | 16 | 0 | 0 |
| 첫 전환 실제 조건 호출 | 16 | 16 | 16 | 16 |
| 이후 실제 조건 호출 | 8 | 8 | 8 | 8 |

후보의 3회는 첫 계획 준비 이전 primeHost가 그 분기의 세 후보를 읽는 비용입니다. 최초 계획 작성은 청사진 후보를 별도로 한 번 읽습니다. 준비 후 HEAD의 9/6은 기존 `branch1-child-selection.md`의 원 계수이며 새 HEAD 실패에서도 첫 18/12를 확인했습니다. 경로의 16은 네 B 모두에서 실제 실패를 확인한 분기 1의 수치입니다. HEAD의 다른 위치별 해석 횟수는 공표 위치에 따라 다릅니다. 변경 2 시험은 모든 무관 분기의 해석 0회와 **전환 전체의 해석 0회**를 첫·후속 전환 모두 단언하여 B와 무관함을 확인합니다.

각 원래 평가 자리의 조건 호출은 1회입니다. 전환 전체를 분기당 1회로 줄였다는 뜻은 아닙니다. 최초 16B·이후 8B와 평가 순서를 유지합니다. 계획 생성은 mount 0, common 잎 쓰기 0, if-then ON/OFF 및 단일 분기 mount/전환 0, 실제 union 전환에서 호스트당 1회입니다.

변경 1b 계수 시험은 HEAD에서 네 B 모두 `candidates: 18, flushes: 12`로 실패했습니다. 변경 2 계수 시험은 HEAD와 1b 구현에서 네 B 모두 분기 1의 `resolutions: 16`으로 실패했습니다. 최종 결합의 계수·차등 시험은 3 files·18 cases가 통과했습니다.

## HEAD 차등과 파괴 복사본

공통 차등 기준을 `3a637c4cd`에 고정했습니다. 59-schema corpus는 root 리스너 및 모든 노드 리스너 두 모드로 비교하고, oneOf-5/10/20/40은 live 폭 5를 유지하는 고정 kind_0→kind_4→kind_0 왕복을 비교합니다. if-then은 자동 쓰기 ON/OFF, root/escaped nested host, 가드 부재·정상·throw·promise를 비교합니다. 각 runtime의 실제 결과·공표 지점·changedNodes·배달 순서·revision·payload·예외가 같습니다. HEAD 구현 자체의 확장 characterization도 7 cases가 통과했습니다.

최종 정상 구현은 단독/결합 전체 검증에서 7개 차등 case를 모두 통과했습니다. S의 아래 복사본을 original resolve directory에 대체한 파괴 실행은 각각 oneOf 네 축에서 AssertionError로 실패했습니다(4 failed·3 passed, exit 1, signal 없음). 빌드·import 실패가 아닙니다.

- `branch1b-broken-selectChildren.ts`: 지연 step의 admitted를 false로 고정합니다. override 환경 키는 `SCHEMA_FORM_CHILD_SELECTION_SOURCE`입니다.
- `branch2-broken-getGateRegistry.ts`: `./kind`를 `/common`으로 잘못 해석합니다. override 환경 키는 `SCHEMA_FORM_GATE_PATH_SOURCE`입니다.

실행 명령은 `npx vitest run --project unit src/core/settle/__tests__/selectChildren.head-differential.test.ts --reporter=dot`입니다. 환경은 자식 프로세스 옵션으로 전달하고 package-manager shell 명령에는 prefix·pipe·redirect를 붙이지 않았습니다. 원본 작업 소스는 바꾸지 않았습니다.

## 독립 패치와 production 번들

S는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.

- `S/branch1b.patch`: 1b 구현·계수 시험·해당 DETAIL 비용/acceptance group입니다.
- `S/branch2.patch`: 경로 구현·계수 시험·해당 DETAIL 비용/acceptance group입니다.
- `S/branch-verification.patch`: 중복 없이 공유하는 HEAD 차등 보강·가드 이력 helper·차등 acceptance group·번들 준비 도구입니다. 전체 검증을 재현할 때 공통 검증 보강으로 사용합니다.

두 변경 패치는 각각 HEAD 파일 복사본에 `git apply --check`가 exit 0이고, 1b 적용 상태의 파일 복사본에 2도 exit 0입니다. 순서는 **1b → 2**입니다. 세 패치를 함께 검사한 경우도 exit 0입니다. 이 명령들은 확인만 수행하며 git index나 refs를 쓰지 않았습니다. 단독 검증에서는 공통 차등 보강을 유지하고 해당 변경의 구현·계수 시험만 활성화했습니다.

기존 `tools/prepare-branch1-bundles.mjs`를 확장했습니다. 같은 esbuild 옵션으로 HEAD/1b/2/1b+2의 소스 그룹을 선택하고 NODE_ENV를 production으로 치환합니다. observer·counter·clock 계측은 없으며 출력은 S뿐입니다. 각 variant의 build service 하나가 종료 코드 0으로 자연 종료했습니다.

| S/bundles 파일 | bytes | SHA-256 |
| --- | ---: | --- |
| b-head.cjs | 531041 | 47a737852c3f35c46c4949aecb0ef8ed692ffc08a0960d775195a83880d17c48 |
| b-1b.cjs | 534214 | f62e60e962b48fd7eefe20417764823712a4e69fa7915a5e3bd4e948b28cd9d6 |
| b-2.cjs | 532549 | dea8879b6cf968f00f551609c63ea22a3fc3ffdcba0b900ed7714dcafe45f167 |
| b-1b2.cjs | 535722 | 71efe35a17508ed96a88b65638a67f2c064274b7c823354f35446633fa61b691 |

번들은 core와 비교 fixture를 포함한 scratch runtime이며 배포 dist 크기가 아닙니다.

## 지정 검증

모두 PKG에서 각각 단독 package-manager shell 호출로 실행했습니다. 테스트는 non-watch 명령이고 모든 실행 프로세스가 자연 종료했습니다. 한 명령이 8분을 넘지 않았으며 긴 테스트/빌드 호출에는 450초 상한을 뒀습니다.

| 명령 | 1b 단독 | 2 단독 | 최종 1b+2 |
| --- | --- | --- | --- |
| `npx vitest run --project unit --project render --project react18 --reporter=dot` | 459 files·3388 passed | 459 files·3385 passed | 460 files·3392 passed |
| `yarn test:production` | 9 files·20 passed | 9 files·20 passed | 9 files·20 passed |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0 | exit 0 | exit 0 |
| `npx eslint "src/**/*.{ts,tsx}"` | exit 0 | exit 0 | exit 0 |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 1676 files·exit 0 | 1674 files·exit 0 | 1677 files·exit 0 |

unit/render/react18은 각각 기존 todo 1개, 실패 0입니다. production은 package script의 `NODE_ENV=production vitest run --project production --reporter=dot --configLoader runner --cache false`를 사용했습니다. host 탐색의 제네릭 structure에 명시적 null 포함 타입을 지정한 뒤 tsc가 통과했습니다. 마지막 전체 검증 이후 제품 소스는 바꾸지 않았고 DETAIL의 시험 group 연결과 이 보고서만 마무리했습니다.

## 후속 검토 범위

검토 대상은 두 독립 패치와 공통 검증 보강입니다. 유지할 조건은 원래 평가·공표·배달·예외 순서, 1b의 load/primeHost 준비 금지, 경로 메모의 현재 값/노드 비보유입니다. 후속 측정에서는 1b 최초 준비의 시간·상주 metadata 비용, 2의 map 조회/상주 경로 비용과 branchless 경로의 고정 호출 비용을 각각 판정해야 합니다. flat-500과 if-then의 이전 회귀가 시간 기준으로 제거됐다는 채택 주장은 이 기록에 넣지 않았습니다.

## 판정

**두 변경 모두 REJECT입니다(105C-01).** 근거는 [profile-119-session.md](profile-119-session.md)의 (4)절과 (5)절입니다.

- 1b는 분기당 기울기를 µs 단위로 BF 49.48→41.17, 첫 갱신 33.33→28.06, 이후 갱신 16.01→13.06으로 줄였습니다. 그러나 4행에서 회귀했습니다: array-100 OFF 이후 갱신 -0.58 µs, oneOf-10 OFF 마운트 -12.46 µs, if-then ON BF -4.92 µs, if-then ON 첫 갱신 -3.54 µs.
- 2는 분기당 기울기를 BF 48.95→39.26, 첫 갱신 32.97→26.38, 이후 갱신 15.86→12.77로 줄였습니다. 그러나 if-then OFF 이후 갱신에서 -0.46 µs 회귀했습니다.

제품 코드는 HEAD로 되돌렸고, HEAD에서도 통과하는 차등 시험의 확장만 남겼습니다. 계수 시험 둘은 HEAD에서 실패하므로 뺐습니다. 두 변경은 세션 scratchpad에 패치로 보관했습니다.
