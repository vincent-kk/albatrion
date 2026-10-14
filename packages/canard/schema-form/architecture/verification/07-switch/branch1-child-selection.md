# 113라운드 — child selection 반복 제거

지정한 stage-07에서 V06·V07·V11의 후보 메타데이터 반복을 제거했습니다. 기준 소스와 HEAD 차등 번들은 `831805d27d8313762afd7ca1f1feca2098c6aa25`에 고정했습니다. 시간 측정, 설치, git 쓰기 명령은 실행하지 않았습니다.

## 변경과 비용

- `src/core/settle/utils/compute/selectChildren.ts:148`에서 단일 선언·단일 inherited active 게이트의 고정 평가 메타데이터를 재사용합니다. 선언과 게이트 배열을 다시 순회하거나 후보마다 같은 읽기 공표 도우미에 진입하지 않습니다. 실제 식 호출과 projected read, 실패 처리와 선택·이탈 처리는 원래 평가 자리에 남습니다.
- `src/core/settle/utils/compute/primeHost.ts:27`에서 이미 준비한 ungated 후보만 순회합니다. 꺼진 분기의 세 필드를 다시 방문해 같은 시작 목록을 찾지 않습니다.
- 자손 읽기, 여러 선언/게이트, parent gate, 자체 child active 게이트 또는 여러 의존 읽기가 있는 호스트는 기존 경로를 유지합니다. 게이트 결과·읽은 값의 캐시나 재사용 유효성 검사는 추가하지 않습니다.
- 최초 준비는 O(후보 수) 시간이며 이후 시작 목록은 O(ungated 후보 수)입니다. 필수 평가 위치를 걷는 드라이버는 O(평가 수)로 남습니다. 비활성 후보의 선언/ID 임시 배열을 제거하는 대신 청사진별 약한 캐시에 O(후보 수)의 고정 모양 메타데이터와 ID 배열을 보유합니다. 새 노드·문맥 칸은 없습니다. 내부 readonly 메타데이터를 추가로 동결하지 않습니다. 실제 시간과 heap byte는 후속 세션에서 확인해야 합니다.
- 소유 `src/core/settle/DETAIL.md`의 비용과 acceptance groups를 제품 코드보다 먼저 갱신했습니다. 공개 경계와 API, 바퀴 상한은 바꾸지 않았습니다.

## 런타임 횟수

제품 소스 문자열을 단언하지 않습니다. `selectChildren.metadata-counts.test.ts`는 실제 호출 구간에서 후보 배열 접근을 Proxy로 계수하고, 후보 공표 도우미와 컴파일된 active 식의 실제 호출을 관측합니다. B=5/10/20/40에서 kind_0→kind_4→kind_0 및 준비된 왕복을 확인했습니다.

| 무관 분기 하나의 첫 전환 | 변경 전 실제 관측 | 변경 후 실제 관측 |
| --- | ---: | ---: |
| 원래 후보 배열 접근 — 선택과 primeHost | 18 | 0 |
| 후보별 flushPendingGateReads 진입 | 12 | 0 |
| 실제 active 식 호출 | 16 | 16 |

이후 전환에서는 모든 무관 분기의 후보 배열 접근과 후보 공표 진입이 각각 0이고, active 식 호출은 분기마다 8회입니다. 식은 매 원래 호출 자리에서 한 번씩 평가합니다. 조건 평가가 전환 전체에서 분기당 한 번만 일어난다는 뜻은 아닙니다. 원래 16B/8B 계수와 평가 순서를 유지합니다. 변경 전의 이후 방문 9/6은 `profile-112-branch.md`의 primeHost 3회와 선택 6회, 후보 공표 6회에 대응합니다.

변경 전에는 네 분기 크기 모두 첫 전환의 `candidates: 18, flushes: 12`에서 새 횟수 단언이 실패했습니다. 변경 전 characterization differential은 통과했으며, 변경 뒤에는 횟수와 differential이 모두 통과했습니다.

## HEAD differential과 파괴 시험

`selectChildren.head-differential.test.ts`는 pinned HEAD와 작업 소스를 각각 번들해 같은 런타임 이력을 실행합니다. runtime observer는 실제 선택 완료, 값 공표와 커밋 배달 표시를 관측하며 제품 소스의 텍스트를 단언하지 않습니다.

- `ownedInlineHead.json`의 59개 스키마 각각에서 루트 리스너 모드와 모든 노드 리스너 모드를 비교했습니다. 마운트와 루트의 `{}`·`null`·`undefined` 교체를 포함하며 생성 오류도 결과로 비교합니다.
- 고정 축 B=5/10/20/40은 `{ kind: 'kind_0' }` 마운트 뒤 kind_4→kind_0→kind_4→kind_0을 비교했습니다. 새로 생긴 노드에도 첫 배달 전 리스너를 설치했습니다.
- 총 122개 이력에서 값·자식/키 순서·발생 identity·스키마·오류·diagnostics·revision·commit·global state·latent·changedNodes·pending publication·실제 리스너 배달 순서와 payload가 같습니다. 원래 자리의 읽기 그림자 및 16B/8B characterization도 통과했습니다.
- c31ac77e3의 membership 파일에는 두 런타임 시험만 있으며 HEAD differential builder는 없습니다. 기존 record/배달 계약과 실제 커밋 표시를 재사용하고 누락된 differential builder를 추가했습니다.
- scratch의 `branch1-broken/selectChildren.ts`만 후보 순서를 역순으로 바꿨습니다. 같은 B=5 differential이 종료 코드 1의 AssertionError로 실패하며 `/payload_0_a`와 `/payload_0_c` 순서 차이를 검출했습니다. 마지막 제품 소스와 같은 scratch 복사본으로 다시 확인했습니다. 제품 소스에는 파괴 변형을 적용하지 않았습니다.

파괴 시험 명령은 PKG에서 다음과 같습니다.

```sh
SCHEMA_FORM_CHILD_SELECTION_SOURCE=/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/branch1-broken/selectChildren.ts npx vitest run --project unit src/core/settle/__tests__/selectChildren.head-differential.test.ts --reporter=dot -t 'preserves B=5 '
```

## Production 번들

`node architecture/verification/07-switch/tools/prepare-branch1-bundles.mjs`로 준비했습니다. NODE_ENV는 production으로 치환했고 observer·카운터·clock 계측은 넣지 않았습니다. 두 build service가 각각 종료 코드 0으로 자연 종료했습니다. 각각 직접 require한 뒤 실제 oneOf 전환도 확인했습니다. 외부 의존은 stage-07의 package.json을 기준으로 해석하며 `nodeFromJSONSchema`, `blueprint`, `equivalentFixtures`를 내보냅니다.

| 구분 | 파일 | SHA-256 | bytes |
| --- | --- | --- | ---: |
| HEAD 831805d27 | `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/branch1-head.cjs` | `47a737852c3f35c46c4949aecb0ef8ed692ffc08a0960d775195a83880d17c48` | 531041 |
| 작업 소스 | `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/branch1-working.cjs` | `b329b7ac011b2eb41b74462803f32ee784ae58057bded6b0565ef2b2f53b9224` | 533784 |

이는 core와 비교 fixture를 포함한 scratch 번들의 크기이며 배포 dist의 크기는 아닙니다. 성능 기울기와 아홉 회차 채택 판정은 실행하지 않았습니다.

## 지정 검증

모든 명령은 PKG에서 실행했고 정상 종료했습니다. 자식 프로세스의 최장 허용은 450초로 제한했으며 실제 강제 종료는 없었습니다. npx는 설치된 도구를 사용하도록 offline 환경으로 실행했습니다.

| 명령 | 결과 |
| --- | --- |
| `npx vitest run --project unit --project render --project react18 --reporter=dot` | 459 files 통과, 3383 tests 통과, 기존 todo 1개, 실패 0 |
| `export NODE_ENV=production; npx vitest run --project production --reporter=dot` | 9 files·20 tests 통과, 실패 0 |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 종료 0 |
| `npx eslint "src/**/*.{ts,tsx}"` | 종료 0, 오류·경고 0 |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | `LEGACY_ISOLATED: 1675 files checked`, 종료 0 |

전체 검증에서 새 메타데이터 동결 64회가 oneOf-20의 기존 1564회 계수를 1628회로 늘리는 회귀를 발견했습니다. 불필요한 동결을 제거한 뒤 해당 시험과 전체 검증이 통과했습니다. 이후 test builder의 종료 오류 처리를 finally 밖으로 옮겨 ESLint를 해결했고, 그 builder를 소비하는 9개 차등·횟수 시험과 tsc·ESLint를 다시 통과했습니다. 제품 소스는 전체 검증 이후 바꾸지 않았습니다.

## 동시 문서 변경

작업 시작 시 HEAD는 지정한 831805d27이었지만 검증 후 확인에서는 다른 작업의 문서 커밋으로 b547db585, 이후 확인에서는 020269679였습니다. 831805d27..020269679의 변경은 PKG CLAUDE.md의 bundle 크기 문장, bundle-115.md와 performance.md뿐입니다. `src` 변경이 없음을 git 읽기 명령으로 확인했으므로 제품 검증과 비교 기준은 유효합니다. 이 작업에서는 git 쓰기 명령을 실행하지 않았으며 비교용 HEAD 번들을 새 HEAD로 바꾸지 않았습니다.

## 판정

**REJECT입니다(105C-01).** 분기당 기울기는 BF 47.443→38.168, 첫 갱신 31.920→25.461, 이후 갱신 15.400→12.289 µs로 약 20%씩 줄었습니다. 그러나 최소 크기를 넘는 회귀가 4행에서 나왔습니다: flat-500 OFF 첫 갱신, if-then OFF 마운트, if-then ON BF·첫 갱신. 그래서 제품 코드를 HEAD로 되돌렸습니다. HEAD에서도 통과하는 [차등 시험](../../../src/core/settle/__tests__/selectChildren.head-differential.test.ts)만 남겼습니다. 근거는 [profile-117-session.md](profile-117-session.md)의 (D)절입니다.
