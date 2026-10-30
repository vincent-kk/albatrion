# Round 440 oneOf 마운트 게이트 평가 진단

## 요약

oneOf-N 마운트의 게이트 평가 20N은 루트 호스트 하나의 바퀴 다섯 번에서 나옵니다. 바퀴마다 4N을 평가하며, 그중 세 바퀴(W3·W4·W5, 합 12N)는 게이트 입력이 앞 바퀴와 같습니다. 게이트 평가 자체는 마운트 시간의 4.3~7.2 %이고, 바퀴의 비게이트 일(선택, flush, primeHost)은 그 약 세 배입니다. N=80 프로파일에서 청사진은 1.355 ms(39 %), 의존 색인 생성은 약 320 µs(약 9 %), GC는 약 315 µs(약 9 %)라서, 마운트 격차의 가장 큰 몫은 바퀴가 아닙니다. 이 프로파일은 E4의 NODE_ENV 미설정 번들입니다. HEAD에는 청사진 검증 생략(#428, #429)이 더해졌고, 439 벽시계는 production E5입니다. 따라서 청사진 39 %와 조합 추정은 HEAD production의 비중이 아닙니다. W4는 계측의 outputChanged(`computeNode.ts:187`)에 보이지 않아도, 전이 2라운드의 payload 값을 `flushPendingOutput`(`selectChildren.ts:404`)으로 루트 출력에 반영하는 실제 일을 합니다. H1은 반박됨(원장 충돌과 동치 실패)이며 채택하지 않습니다. 후보는 H2(#427 확인 바퀴 생략을 마운트 경로로 넓히는 안)이고, 값이 있는 마운트에서 꺼진 엔트리 분배가 멱등이라는 증명과, 결정 58의 범위를 넓히는 Vincent의 채택이 필요합니다. 이 문서는 진단이며, 수용이나 구현 채택을 결정하지 않습니다.

## 원인

평가는 하위 호스트가 아니라 루트 호스트(`host: ""`)에서만 일어납니다. primeHost 안의 평가는 없습니다. 루트의 `selectNodeSchema`가 선언 게이트 N개를 평가하고, load에서 직접 선택 계획이 꺼진 `selectChildren`이 엔트리 3N+2개의 선언 게이트를 평가하므로, 같은 게이트 객체가 바퀴마다 네 번 평가됩니다. 패스 A에서 형상 dirty가 된 루트는 정착이 끝나기 전에 `shapeDirtyPaths`가 지워지지 않아, 같은 정착의 재계산마다 다시 바퀴를 돕니다. 누적된 `changedRaw`의 `/kind`를 `registerRecalculation`이 다시 읽어 루트를 형상 dirty로 표시하는 경로가 이와 독립으로 있습니다. #427의 확인 바퀴 생략은 load에서 입력 증인 프레임을 만들지 않고, load 조항과 `distributedInputs` 조항이 마운트의 모든 루트 바퀴를 거부합니다.

## 기전

1. `selectNodeSchema`는 루트의 모든 선언 게이트를 평가합니다(`settle/utils/compute/selectNodeSchema.ts:27-28`). 이것이 바퀴당 N입니다.
2. load에서는 직접 선택 계획이 꺼져 있습니다(`settle/utils/compute/childSelection/selectChildren.ts:136-141`). 그래서 `selectChildren`은 `declareChildren`으로 엔트리 3N+2개를 받습니다(`:150-152`). 그리고 선언마다 게이트를 평가합니다(`:178-201`). payload 엔트리 하나는 자기 분기의 게이트 하나를 가지므로, 이것이 바퀴당 3N입니다. 같은 게이트 객체가 바퀴마다 네 번 평가됩니다. 루트 조각 선언에서 한 번, 분기 프로퍼티 셋에서 한 번씩입니다. 소유자는 모두 루트이고 edgeName은 모두 undefined입니다. 프로퍼티 선언의 schemaPath에 `/controls/active`를 붙인 값이 게이트 schemaPath와 다르기 때문입니다(`selectChildren.ts:193`).
3. `computeNode`는 호스트가 `context.shapeDirtyPaths`에 있을 때만 primeHost와 바퀴로 갑니다(`computeNode.ts:95`, `:150`, `:159`). 없으면 `:95-103`의 비형상 경로로 자식 재계산과 출력 갱신만 합니다.
4. `shapeDirtyPaths`는 정착 중에 지워지지 않습니다. 엔진 전체에서 유일한 clear 위치는 정착이 끝난 뒤의 `settle/utils/scratch/releaseSettlementScratch.ts:29`입니다. `computeNode`는 `dirtyPaths`만 지웁니다(`computeNode.ts:221`, `:227`). 그래서 패스 A에서 형상 dirty가 된 루트는 같은 정착의 모든 재계산에서 다시 바퀴를 돕니다.
5. `changedRaw`도 누적됩니다. 집합 전체를 비우는 곳은 `releaseSettlementScratch.ts:30`과 `settle/utils/transition/restoreSourceB.ts:45`입니다. 경로 하나를 지우는 자리는 `withdrawDetachedFills.ts:29`(`context.changedRaw.delete`)에도 있습니다. 전이 2라운드의 `registerRecalculation`(`transitionSettlement.ts:206`)은 1라운드에서 넣은 `/kind`를 여전히 봅니다. 그래서 루트를 다시 형상 dirty로 표시하는 경로가 둘 이상입니다. 하나는 `settle/utils/dependencies/registerRecalculation.ts:21-31`(affected)입니다. 다른 하나는 `:50-52`입니다. `mayChangeAt`이 `settle/utils/gates/getGateRegistry.ts:261-281`의 readsChanged로 `/kind`를 바뀐 읽기로 판정합니다. `registerRecalculation.ts:53-63`의 `mayChangeOwnDeclarationAt`도 같은 누적 `changedRaw`를 읽습니다.
6. 형상 dirty의 잔류와 `changedRaw`의 누적은 서로 독립입니다. 잔류만 없애면 누적된 `changedRaw`가 다시 표시하고, 누적만 없애면 패스 A의 형상 dirty가 남습니다.
7. 같은 기제가 갱신 첫 쓰기의 둘째 바퀴 쌍도 만듭니다. 437의 "첫 쓰기 16N·네 휠"이 그것입니다(`packages/canard/schema-form/architecture/verification/perf-optimization/gate-wheel-skip-design-437.md` 설계 문서 49행(4절)).
8. W4는 게이트 입력이 W3 이후와 같아도 실제 일을 합니다. 전이 2라운드가 채운 payload 값을 `flushPendingOutput`(`selectChildren.ts:404`)이 루트 출력에 반영합니다. 이 반영은 계측의 outputChanged(`computeNode.ts:187`)에 나타나지 않습니다. 187행은 `context.initialOutputs`가 있으면 노드를 그 배열에 넣기만 하고, `updateOutput`의 결과를 outputChanged에 싣지 않습니다.
9. #427 술어가 마운트에서 막히는 지점은 세 곳입니다. `computeNode.ts:161`은 `context.kind !== 'load'`일 때만 `GateWheelFrame`을 만듭니다. 마운트에서는 입력 증인을 기록하지 않습니다. `settle/utils/gates/canSkipGateWheel.ts:33`은 `context.kind === 'load'`이면 거부합니다. `canSkipGateWheel.ts:34`는 `context.distributedInputs.has(node)`이면 거부합니다. 마운트에서는 `writeFieldNode.ts:136`의 `markWrite(root, …)`가 `settle/utils/input/markWrite.ts:147`에서 루트를 무조건 `distributedInputs`에 넣습니다. 이 항목은 정착이 끝날 때까지 남습니다(`releaseSettlementScratch.ts:19`). 따라서 이 조항은 마운트의 모든 루트 바퀴를 막습니다.
10. 설계 문서는 이 범위 제한을 P7로 적었습니다(`gate-wheel-skip-design-437.md:35`). 이유는 꺼진 엔트리 분배(`selectChildren.ts:405-448`)의 멱등성을 증명하지 않았기 때문입니다. load에서는 `selectChildren.ts:410`의 조항 때문에 이 분배가 prior와 무관하게 매 바퀴 돕니다.

## 계산 방법

이 문서의 시간은 디버거가 HEAD `8a3ee595a`에서 코드를 읽고 기존 437 프로파일을 다시 나눈 값입니다. 제품 코드, 테스트, 벤치마크는 실행하지 않았습니다.

증거 위치의 약칭은 다음과 같습니다.

- `437/`는 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/size-diagnosis-437/`입니다.
- `439/`는 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/mount-env-439/`입니다.
- `settle/`는 `packages/canard/schema-form/src/core/engine/settle/`입니다.
- 분할 스크립트는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/920681de-5507-4bac-b671-978d55a29c7a/scratchpad/stage.mjs`입니다.

측정 조건은 다음과 같습니다.

- 계수와 프로파일 픽스처는 값 없이 마운트하고 `validationMode: 0`을 씁니다(`437/tools/count.mjs:11`, `437/tools/profile.mjs:7`). 그래서 검증 등록 계수는 모든 크기에서 0입니다(`437/counts/oneOf-*.json`의 `mount.counts.requestFieldNodeValidation`).
- static-first 적재는 일어나지 않습니다. `loadStaticFirstTree` 계수가 모든 크기에서 0입니다(`437/counts/oneOf-*.json`). 게이트가 있는 청사진은 `settle/loadFieldNodeAtMount/utils/staticFirst/canLoadStaticFirstTree.ts`의 `StaticFirstLoadCapability` 자격을 얻지 못해, `settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts:24`의 `writeFieldNode(root, value, 'load', option)`로 갑니다.
- 픽스처 스키마는 `packages/aileron/benchmark-form/fixtures/equivalent/branches.ts:22-34`입니다. 분기 k는 `controls.active: ./kind === 'kind_k'` 하나와 payload 프로퍼티 셋을 가집니다.

단계 시간의 계산은 다음과 같습니다.

- 입력은 `437/profiles/oneOf-{N}-mount.cpuprofile`과 짝 메타 `437/profiles/oneOf-{N}-mount.json`(startUs, endUs, iterations)입니다.
- 표본마다 `timeDeltas`로 구간을 만들고, 메타의 [startUs, endUs]와 겹치는 시간만 셉니다. 이 방식은 `437/tools/analyze.mjs`와 같습니다.
- 표본의 스택(잎에서 뿌리까지 functionName)을 보고, 아래 우선순위에서 처음 맞는 칸 하나에 넣습니다. 따라서 칸들은 서로 겹치지 않고, 합이 전체와 같습니다.
  1. 스택에 `blueprint`가 있으면 청사진입니다.
  2. `evaluateGate`가 있으면 게이트 평가입니다. 패스 구분은 `transitionSettlement`가 있으면 패스 B·C, 없고 `writeFieldNode`가 있으면 패스 A입니다.
  3. `createFieldNode` 또는 `createChildNode`가 있으면 노드 생성입니다.
  4. `selectChildren`, `selectNodeSchema`, `primeHost`, `computeNode`가 있으면 바퀴 비게이트입니다.
  5. `commitSettlement`, `markCommitDeliveries`, `updateInactiveValuesMemo`가 있으면 배달입니다.
  6. `finishSettlement`가 있으면 전이 채움 등입니다.
  7. `writeFieldNode`가 있으면 의존 색인과 문맥 준비입니다.
  8. 나머지는 GC와 기타입니다.
- 합계를 메타의 iterations로 나누어 마운트 한 번당 µs를 냅니다.
- 분기당 게이트 몫은 게이트 평가 µs를 N으로 나눈 값입니다. 평가 한 번당 값은 다시 20으로 나눈 값입니다.
- 프로파일 값에는 프로파일러 오버헤드가 들어 있습니다. N=80 프로파일 합계는 3.46 ms이고, 같은 판의 벽시계 중앙 최소값은 3.26 ms입니다(`437/analysis.json`의 `walls[oneOf-80].editions.E4.mount.medianMin`). 비율은 그대로 쓸 수 있지만 절댓값은 약 6 % 큽니다.

계수 표의 출처는 `437/counts/oneOf-{5,10,20,40,80}.json`의 `mount.wheels`, `mount.gates`, `mount.counts`입니다. 바퀴 순서의 출처는 `437/counts/oneOf-80.json`의 `mount.wheels`이며, 다섯 크기 모두 순서와 바뀜 값이 같습니다.

## 표

### 크기별 계수

| N | 루트 바퀴 수 | evaluateGate | selectNodeSchema 몫 | selectChildren 몫 | primeHost | computeNode | 서로 다른 게이트 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 5 | 100 (20N) | 25 | 75 | 3 | 13 | 5 |
| 10 | 5 | 200 (20N) | 50 | 150 | 3 | 13 | 10 |
| 20 | 5 | 400 (20N) | 100 | 300 | 3 | 13 | 20 |
| 40 | 5 | 800 (20N) | 200 | 600 | 3 | 13 | 40 |
| 80 | 5 | 1600 (20N) | 400 | 1200 | 3 | 13 | 80 |

모든 평가는 루트 호스트(`host: ""`)에서 일어나며, primeHost 안에서 일어나는 평가는 없습니다.

### 바퀴 순서

| 바퀴 | 호출 자리 | round | 바뀜(스키마/자식/출력) | 존재 이유 | 게이트 입력이 앞 바퀴와 같은가 |
| --- | --- | --- | --- | --- | --- |
| W1 | 패스 A: `settle/utils/write/writeFieldNode.ts:140` | 0 | 0/0/0 | 첫 계산입니다. kind가 아직 없어 모든 분기가 꺼지고, 기준선 자식(common, kind)만 남습니다. | 아니요. 첫 평가이므로 필요합니다. |
| W2 | 패스 B: `settle/utils/transition/transitionSettlement.ts:208` | 0 | 1/1/0 | 전이 1라운드가 common과 kind에 default를 채웠습니다(`transitionSettlement.ts:103-134`). kind_0 때문에 분기 0이 켜집니다. | 아니요. /kind가 바뀌었으므로 필요합니다. |
| W3 | 패스 B | 1 | 0/0/0 | 확인 바퀴입니다. `settle/utils/compute/computeNode.ts:219`에서 정지합니다. | 예. #427 술어의 생략 대상이지만 load라서 빠집니다. |
| W4 | 패스 C: `transitionSettlement.ts:208` | 0 | 0/1/0 | 전이 2라운드가 payload_0_*에 default를 채운 뒤 루트를 다시 계산합니다. primeHost가 구조를 기준선으로 되돌리기 때문에(`settle/utils/compute/primeHost.ts:106-113`) 같은 자식을 다시 받아들인 것이 "자식 바뀜"으로 보입니다. | 예. 게이트가 읽는 /kind는 W3 이후 그대로입니다. 새 computeNode 호출의 첫 바퀴이므로 #427 술어의 대상은 아닙니다. |
| W5 | 패스 C | 1 | 0/0/0 | 확인 바퀴입니다. | 예. #427 술어의 생략 대상입니다. |

전이 3라운드에서는 자동 쓰기가 없어 `transitionSettlement.ts:184-189`에서 끝납니다. 전이 단계는 `settle/utils/settlement/finishSettlement.ts:59`에서 불립니다. 게이트 입력이 앞 바퀴와 같은 바퀴는 W3, W4, W5이며, 합계는 12N입니다. 그중 #427 술어가 load 제외 없이 생략할 바퀴는 W3와 W5(8N)입니다. W4의 출력 바뀜 0은 계측의 outputChanged입니다. 출력 반영의 실제 일은 기전 8에 적습니다.

### 단계별 시간 (µs/마운트)

| N | 합계 | 청사진 | 노드 생성 | 의존 색인·문맥 준비 | 바퀴 게이트 평가 | 바퀴 비게이트 | 전이 채움 등 | 배달 | 검증 등록 | GC·기타 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 329 | 106 | 6.5 | 34.5 | 14.2 | 82.0 | 19.9 | 14.2 | 0 | 51.4 |
| 10 | 563 | 197 | 11.4 | 65.1 | 27.8 | 130.7 | 32.6 | 17.2 | 0 | 81.4 |
| 20 | 944 | 370 | 5.0 | 130.1 | 57.5 | 207.5 | 44.7 | 16.0 | 0 | 113.5 |
| 40 | 1767 | 719 | 8.1 | 219.6 | 111.9 | 396.9 | 74.7 | 26.6 | 0 | 209.9 |
| 80 | 3463 | 1355 | 15.5 | 467.1 | 248.1 | 710.7 | 194.7 | 43.7 | 0 | 428.8 |

출처는 각 행의 `437/profiles/oneOf-{N}-mount.cpuprofile`과 `.json`입니다.

프로파일은 E4의 NODE_ENV 미설정 번들입니다. HEAD에는 청사진 검증 생략(#428, #429)이 더해졌고, 439 벽시계는 production E5입니다. 따라서 청사진 39 %와 조합 추정은 HEAD production의 비중이 아닙니다.

N=80 바퀴 칸을 패스별로 나누면 다음과 같습니다(µs).

| 패스 | 게이트 평가 (selectNodeSchema + selectChildren) | selectChildren 비게이트 | selectNodeSchema 비게이트 | computeNode 기타 |
| --- | --- | --- | --- | --- |
| A (바퀴 1개) | 56.2 (22.9 + 33.3) | 47.9 | 5.0 | 31.4 |
| B·C (바퀴 4개) | 191.9 (45.9 + 146.0) | 384.2 | 58.5 | 141.9 |

primeHost는 세 번을 합쳐 41.8 µs입니다.

### 게이트 몫

| N | 게이트 평가 µs | 분기당 µs | 마운트 대비 비중 |
| --- | --- | --- | --- |
| 5 | 14.2 | 2.84 | 4.3 % |
| 10 | 27.8 | 2.78 | 4.9 % |
| 20 | 57.5 | 2.88 | 6.1 % |
| 40 | 111.9 | 2.80 | 6.3 % |
| 80 | 248.1 | 3.10 | 7.2 % |

## 귀속

### 1. 게이트 평가: N=80에서 248.1 µs, 7.2 %

평가 한 번은 약 0.14~0.155 µs입니다. 분기당 게이트 몫은 2.78~3.10 µs입니다. N=80에서 바퀴 전체(게이트 평가 248.1 µs와 비게이트 710.7 µs의 합)는 959 µs이고, 마운트의 27.7 %, 분기당 12.0 µs입니다. 바퀴 하나의 비용은 패스 A 바퀴가 약 140 µs(게이트 56.2와 비게이트 84.3의 합)입니다. 패스 B·C는 바퀴당 평균 약 194 µs(776.5 ÷ 4)입니다. 게이트 입력이 앞 바퀴와 같은 12N 가운데 #427 술어가 load 제외 없이 생략할 몫은 W3와 W5의 8N입니다. W4는 게이트 입력이 같아도 기전 8의 출력 반영을 합니다.

### 2. 바퀴 비게이트: N=80에서 710.7 µs

잎 쪽 스택 6단으로 나눈 N=80의 내역은 다음과 같습니다.

- **load에서 엔트리마다 하는 flush가 약 153 µs입니다.** 패스 B·C의 selectChildren 비게이트 384 µs 안에 있으며, `flushPendingGateReads`, `visit`, `flushRead`, `flushGate`, `bindGateHostPath` 등의 합입니다. 원인은 load에서 직접 선택 계획이 꺼져 `flushReads = immediate && !direct`가 참인 것입니다(`selectChildren.ts:154`, `:158-163`). 이 값은 같은 패스의 게이트 평가(191.9 µs)와 비슷한 규모입니다.
- **selectChildren 본체가 약 139 µs입니다.** 엔트리 3N+2개를 순회하고 `declareChildren`을 부르는 비용입니다. 여기에 `hasRecursiveExpansion`·`hasTemplateCycle`이 약 34 µs 더해집니다.

### 3. 청사진, 의존 색인, GC

- **의존 색인 생성이 약 320 µs입니다.** "의존 색인·문맥 준비" 467 µs 가운데 `registerRecalculation`(`writeFieldNode.ts:139`) 아래의 `getDependencyIndex`와 `DependencyIndex` 생성(`add`, `resolveDependencyPath`, `getGateExpression`)입니다. 나머지에는 `getTransitionCap`의 색인 수집(약 58 µs)과 게이트 레지스트리 등록(약 59 µs)이 있습니다. 청사진이 마운트마다 새로 생기므로 색인도 마운트마다 다시 만들어집니다. 320 µs는 N=80 합계 3463 µs의 약 9 %입니다.
- **"GC·기타" 428.8 µs 가운데 약 315 µs는 `(garbage collector)`입니다.** 315 µs는 합계의 약 9 %입니다.
- **청사진 1355 µs는 합계의 39 %입니다.** 이 비중은 E4의 NODE_ENV 미설정 번들에서의 값입니다. HEAD production의 비중이 아닙니다.

## 가설

절감 추정은 N=80 프로파일 기준입니다. 벽시계로 옮길 때는 같은 비율을 씁니다. 아래 범위는 관측에서 얻은 추정이며, 채택 여부는 판정 절이 정합니다.

### H1. 패스 C 제거: 패스 단위 형상 dirty

- **기제입니다.** 누적 `shapeDirtyPaths`는 그대로 두고, 이번 계산 패스에서 새로 표시된 형상 dirty를 따로 둡니다. computeNode는 바퀴를 돌린 뒤 그 표시를 소비합니다. 누적 집합에는 이미 있는 경로를 다시 add해도 흔적이 남지 않으므로, add할 때마다 패스 집합에도 넣는 래퍼가 필요합니다. add 자리는 엔진 안에 19곳입니다. 아울러 `registerRecalculation`은 직전 호출 이후 `changedRaw`에 더해진 증분으로만 affected와 `mayChangeAt`을 판정합니다(`registerRecalculation.ts:21-31`, `:50-64`).
- **지우면 안 되는 이유입니다.** `shapeDirtyPaths`는 정착 뒤에도 `settle/utils/commit/commitExitPolicyValues.ts:82`와 `settle/utils/compute/publishStateKeys.ts:26`이 읽습니다. 그래서 누적 집합은 남겨야 합니다.
- **동치 논거입니다.** 이 픽스처에서는 전이 2라운드의 쓰기가 payload 원본뿐이어서 결과가 같습니다. 일반적으로는 같지 않습니다. 게이트는 emit을 읽고, 하위 호스트의 선택 변화(자식 퇴장, overlay)는 원본 경로를 건드리지 않고 읽는 값을 바꿉니다(437 설계 2절의 (나)와 (다)). 현재 마운트는 루트가 정착 내내 형상 dirty라서 이 경우를 다시 계산하지만, H1은 이 경우를 놓칩니다. 패스 B에서는 c='x'를 보고 분기가 켜지고 m이 들어옵니다. 이어서 전이 2라운드가 m='M'을 채웁니다. 현재 코드는 패스 C에서 루트를 primeHost부터 다시 돌려 h 계산 뒤 c가 나간 것을 보고 분기와 z를 끕니다. H1에서는 증분 {/h/m}이 루트 게이트의 감시 경로 /h/c와 겹치지 않아 루트가 비형상 경로로 가고 분기와 z가 켜진 채 남습니다(정적 추적; 실행 확인은 별도).

```json
{"type":"object","properties":{"h":{"type":"object","properties":{"t":{"type":"string","default":"on"},"m":{"type":"string","default":"M","controls":{"active":"../t === 'on'"}},"c":{"type":"string","default":"x","controls":{"active":"../m !== 'M'"}}}}},"oneOf":[{"controls":{"active":"./h/c === 'x'"},"properties":{"z":{"type":"string"}}}]}
```

- **기대 절감입니다.** 바퀴는 5개에서 3개로, 평가는 20N에서 12N으로 줍니다. 시간은 약 0.35~0.40 ms(마운트의 약 11 %) 줄 것으로 봅니다. 절반 가정에서의 값은 패스 B·C 바퀴 비용의 절반(776.5 ÷ 2 ≈ 388 µs)에 primeHost 한 번(약 14 µs)을 더한 값입니다. 하한은 남는 비형상 경로 비용을 뺀 값입니다. 갱신 첫 쓰기의 둘째 쌍도 같이 줄어듭니다.
- **위험입니다.**
  - overlay나 스키마 변화처럼 원본이 그대로인데 emit이 바뀌는 경로는 `changedRaw`로 잡히지 않습니다. 갱신 경로에는 이미 있는 한계이지만, 마운트에서는 H1이 새로 만드는 동작 차이입니다. 그래도 전이 라운드에서 이 경로가 실제로 생기는지는 차등 시험으로 확인해야 합니다.
  - 표시 자리가 19곳이라 하나라도 빠지면 바퀴가 생략되어 형상이 틀립니다.
  - 값이 있는 마운트에서는 H2와 같은 분배 멱등성 전제가 필요합니다.
- 원장 문구입니다. 충돌이 있습니다. SETTLE-020 보충 97C-01 (4)는 형상 dirty 판정을 매 호출의 누적 집합에 대한 질의로 고정하고, 그보다 좁은 판정을 SETTLE-044 위반과 같다고 봅니다. H1은 이 조항을 바꾸는 편집자·소유자 결정 없이는 진행할 수 없습니다.
- **측정 방법입니다.** `437/tools/count.mjs`로 마운트 바퀴 수 3과 평가 12N을 확인하고, 갱신 첫 쓰기의 바퀴 수도 확인합니다. `437/tools/profile.mjs`와 `stage.mjs`로 패스 B·C 칸이 절반으로 주는지 봅니다. `437/tools/wall.mjs`로 oneOf 5~80의 마운트·갱신 벽시계를 잽니다.
- **판정입니다.** 반박됨(원장 충돌과 동치 실패); 채택하지 않는다.

### H2. (a) #427 확인 바퀴 생략을 마운트로 확장

- **기제입니다.** 기전 9의 세 지점을 풉니다. 즉 load에서도 프레임을 만들고(`computeNode.ts:161`), load 조항(`canSkipGateWheel.ts:33`)과 분배 조항(`:34`)을 마운트 루트에 대해 풉니다.
- **"W2·W4의 다음 바퀴는 확인 바퀴"라는 증명입니다.**
  - W2 뒤에는 /kind가 'kind_0'으로 고정되어 있습니다. W2 안에서 받아들여 계산한 payload 자식은 /kind를 바꾸지 않으므로 P6이 성립합니다.
  - `flushPendingOutput`(`selectChildren.ts:404`) 뒤에는 대기 출력이 비어 있으므로 P5가 성립합니다.
  - 남은 조건은 P3(dirtyChildren이 비어 있음)과 P4(예외 버전 불변)입니다. 둘 다 이 픽스처에서 성립할 것으로 보지만, 실행 기록으로 확인하지는 않았습니다.
  - 계수에서 W3·W5가 실제로 무변화로 정지한 것은 이 증명과 맞습니다.
- **선행 조건입니다.** load에서 꺼진 엔트리 분배(`selectChildren.ts:405-448`, `:410`의 load 조항)가 멱등이라는 증명이 필요합니다. 값 없는 마운트에서는 `hasDistributedChildInput`이 거짓이라 이 분배가 무동작이므로 벤치마크 픽스처에서는 성립합니다. 값이 있는 마운트에서는 `distributeLatentValue`가 매 바퀴 돌기 때문에 증명이 따로 필요합니다.
- **기대 절감입니다.** 단독으로는 W3·W5가 생략되어 평가가 20N에서 12N으로 줍니다. 시간은 약 0.30~0.38 ms로 봅니다(확인 바퀴 하나를 150~190 µs로 잡았고, 이 단가는 패스 A 바퀴와 패스 B·C 평균 사이 값입니다). H1 뒤에는 W3만 남으므로 평가는 12N에서 8N으로, 절감은 약 0.15~0.19 ms입니다. 프레임 기록 비용(평가마다 맵 연산 한 번)이 조금 되돌아옵니다. H1은 판정에서 채택하지 않으므로, 이 단독 수치가 현재의 기대 절감입니다.
- **위험입니다.** 분배 멱등성 증명이 틀리면 잠복 값과 커밋이 달라질 수 있습니다. #427 설계 문서의 미확인 항목인 selectedDeclarationIds와 structure 참조 잔존 문제도 마운트에서 다시 확인해야 합니다.
- **원장 문구입니다.** 바뀌는 문구는 없습니다. 다만 결정 58의 적용 범위를 넓히는 것이므로 Vincent의 채택 판단이 필요합니다.
- **측정 방법입니다.** `instrument.mjs`에 생략 분기 탐침을 더한 뒤 `count.mjs`로 생략 횟수와 평가 수를 봅니다. 꺼진 분기 키를 포함한 defaultValue 픽스처로 생략 판과 비생략 판의 전체 관측(nodes, revisions, deliveries, failures, latent, commit)을 차등 비교합니다. 시간은 `wall.mjs`로 잽니다.

### H3. (c) load에서도 직접 선택 계획 사용

- **기제입니다.** `selectChildren.ts:136-141`과 `primeHost.ts:36-39`의 load 제외를 풉니다. 그러면 바퀴마다의 `declareChildren`(`selectChildren.ts:152`, `primeHost.ts:48`)과 엔트리별 flush(`selectChildren.ts:154`, `:158-163`)가 사라집니다. 게이트 평가 수는 그대로입니다. 계획 경로도 단계마다 게이트를 평가하기 때문입니다(`:170`). 다만 `selectChildren.ts:178-201`의 선언 순회 대신 단계 순회를 씁니다.
- **동치 논거입니다.**
  - 갱신 경로에서 같은 계획이 결과, 공표 지점, 배달 순서, changedNodes, payload를 차등 비교로 통과했습니다(`packages/canard/schema-form/architecture/verification/07-switch/branch1d.md:42`).
  - load 제외는 정확성 증명이 아니라, 마운트에서 flush 호출을 없앤 1c 변형이 측정상 느렸던 결과입니다(branch1d-design.md:7-10). H3는 같은 구성을 되살리므로 절감의 부호부터 측정으로 정해야 합니다. 계획 함수의 prepare 인자 설명도 "non-load selection에서만"이라고 적습니다(`settle/utils/compute/childSelection/getDirectChildSelectionPlan.ts:46`).
  - load에만 있는 차이(`:410`의 분배 조항, pendingExits)는 계획 경로에서도 같은 코드를 지납니다.
- **기대 절감입니다.** 약 0.10~0.15 ms로 봅니다. 근거는 flush 약 153 µs와 declareChildren 몫입니다. 여기서 마운트마다 계획을 만드는 비용(단계 3N+2개)을 빼야 합니다. 청사진이 마운트마다 새로 생기기 때문입니다. 부호는 측정 전입니다.
- **위험입니다.** 마운트 시점 JIT 최적화 상태가 바뀐 이력이 있습니다(`branch1d-design.md:7-10`). 계수 절감이 시간 절감으로 이어지지 않을 수 있습니다. 99라운드 판별 선택 표가 비슷한 이유로 되돌려진 선례가 있습니다.
- **원장 문구입니다.** 바꿀 문구는 없습니다. SETTLE-020은 단계마다의 평가로 그대로 지켜집니다.
- **측정 방법입니다.** `count.mjs`로 계획 생성 횟수를 보고, `stage.mjs`로 flush 칸이 0에 가까워지는지 봅니다. `wall.mjs`로 마운트 벽시계를 잽니다. 판별 표 선례처럼 이득이 잡음 안이면 되돌립니다.

### H4. 바퀴 안 동일 게이트 결과 재사용

- **기제입니다.** 바퀴당 4N 평가 가운데 3N은 같은 (게이트, 소유자, edgeName 없음)입니다(기전 2). 바퀴 안에서 첫 평가의 결과와 입력 증인을 두고, 뒤 자리에서 증인을 다시 읽어 Object.is로 같으면 결과를 재사용합니다.
- **동치 논거입니다.** 가우스-자이델 즉시 반영 때문에 한 바퀴 안에서도 selectNodeSchema와 selectChildren 사이, 또는 엔트리 사이에 입력이 바뀔 수 있습니다. 증인을 다시 읽어 같을 때만 재사용하면, 같은 입력에 대한 순수 식이므로 값이 같습니다. 증인을 다시 읽는 일은 실제 평가가 하는 `readProjectedValue`와 같은 flush를 일으키므로 공표 순서가 그대로입니다. 식 예외가 난 평가는 재사용하지 않아야 실패 보고가 같습니다(`settle/utils/gates/evaluateGate.ts:157-200`).
- **기대 절감입니다.** 상한은 게이트 평가 248 µs의 3/4인 약 186 µs입니다. 증인 재읽기 비용을 빼면 실제로는 약 0.1 ms로 봅니다.
- **위험입니다.** 실패와 경고의 중복 제거 순서가 바뀔 수 있습니다. `gateThrowVersion` 증가 횟수도 바뀔 수 있습니다.
- **원장 문구입니다.** 소유자 결정이 필요합니다. SETTLE-020은 "매 바퀴 모든 게이트 평가"라고 적고, `evaluateGate.ts:209`의 문서 주석은 "without caching"이라고 적습니다. 결과 재사용은 BLUEPRINT-007이 남긴 "벤치마크로 정할 최적화"에 해당하지만, 제품 코드에는 없습니다(`gate-wheel-skip-design-437.md` 2절). 관련 결정은 96C-01 (가)·(나), 97C-01, 438C-02입니다. 438C-02는 실행된 바퀴의 전수 평가를 #427 무충돌의 근거로 삼았습니다.
- **측정 방법입니다.** `count.mjs`에 재사용 횟수 탐침을 더하고, `stage.mjs`로 게이트 칸을 보고, `wall.mjs`로 시간을 잽니다.

### H5. (b) 후보별 지연 평가 (권하지 않음)

- **기제입니다.** 켜진 분기를 찾으면 나머지 분기 게이트를 평가하지 않거나, 입력이 바뀐 게이트만 평가합니다.
- **관측이 바뀌는 이유입니다.**
  - SETTLE-020은 꺼진 게이트까지 매 바퀴 평가해 끄라고 정합니다.
  - 여러 분기가 켜진 경우의 경고(`selectNodeSchema.ts:30-63`의 MultipleGatedBranchesActive)는 모든 분기를 평가해야 나옵니다.
  - 평가하지 않은 게이트의 식 예외와 가드 실패 보고(`evaluateGate.ts:157-200`)가 사라집니다.
  - "입력이 바뀐 게이트만"은 읽기 집합 추출이므로 BLUEPRINT-007의 "뽑지 않는다"에 걸립니다.
- **기대 절감입니다.** 상한이 게이트 몫 전체인 약 0.25 ms(7.2 %)입니다.
- **원장 문구입니다.** SETTLE-020과 BLUEPRINT-007의 문구를 바꿔야 하므로 소유자 결정 없이는 할 수 없습니다. 관련 결정은 96C-01 (가)·(나), 97C-01, 438C-02입니다. 438C-02는 실행된 바퀴의 전수 평가를 #427 무충돌의 근거로 삼았습니다.

### 조합 기대치

H1과 H2를 함께 적용하면 바퀴는 W1, W2 두 개, 평가는 8N이 됩니다. N=80에서 바퀴 세 개(약 0.50~0.59 ms, 프로파일 합계의 약 16 %)가 사라집니다. 439 운영 재측정 벽시계 2.92 ms(`439/report.md:25`)에 같은 비율을 적용하면 약 2.45 ms입니다. 같은 행의 0.16.1 값 0.536 ms 대비 약 4.6배입니다. 남는 격차의 주된 몫은 청사진(39 %), 의존 색인 생성(약 9 %), GC(약 9 %)입니다(단계별 시간 표, 귀속 3). 청사진 39 %와 이 조합 추정은 HEAD production의 비중이 아닙니다. H1은 채택하지 않으므로 이 조합은 현재의 후보가 아닙니다.

## 미확정

1. **패스 B와 패스 C의 시간 분리입니다.** 두 패스는 스택이 같아(`finishSettlement` → `transitionSettlement` → `computeNode`) 프로파일로 나눌 수 없습니다. 이 때문에 H1의 절감은 절반 가정으로 추정했습니다. 측정용 번들에서 `transitionSettlement.ts:208`의 호출을 라운드 번호가 이름에 든 래퍼(예: 라운드 1용, 라운드 2용)로 감싸고 `profile.mjs`와 `stage.mjs`를 돌리면 정해집니다. H1은 이 분리와 별도로 반박되었습니다.
2. **확인 바퀴와 바뀐 바퀴의 단가 차이입니다.** H2의 절감 범위가 이것에 달려 있습니다. 437 `instrument.mjs`의 wheel 앵커(`for (let round = 0; round < cap; round++) {`)와 end 앵커에 `process.hrtime.bigint()` 기록을 붙여, 바퀴별 경과 시간을 `count.mjs` 결과에 넣으면 정해집니다. 계수 전용 실행이므로 시간에는 탐침 오버헤드가 들어 있다는 점을 함께 적어야 합니다.
3. **패스 C 원인의 실행 확인입니다.** 기전 3~6은 정적 판독입니다. `transitionSettlement.ts:206` 직전에 `context.shapeDirtyPaths.has('')`와 `[...context.changedRaw]`를 기록하는 탐침을 넣고 `count.mjs`를 돌리면 확인됩니다. 기대값은 전이 2라운드에서 루트가 이미 형상 dirty이고 changedRaw에 `/kind`가 남아 있는 것입니다.
4. **검증 등록 단계의 비용입니다.** 437 계수와 프로파일은 `validationMode: 0`이라 이 단계가 0입니다. 439 운영 재측정이 어떤 검증 설정을 썼는지는 이번에 확인하지 않았습니다. 439 `environment.json`과 `tools/`에서 설정을 확인한 뒤, 같은 설정으로 `count.mjs`와 `profile.mjs`를 다시 돌리면 정해집니다.
5. **값이 있는 마운트에서 H2의 분배 멱등성입니다.** 꺼진 분기의 payload 키를 포함한 defaultValue 픽스처를 만들고, 생략을 켠 판과 끈 판의 latent, commit, deliveries, revisions를 차등 비교하면 정해집니다. 그림자 모드(생략 판정이 참일 때도 다음 바퀴를 실제로 돌려 무변화를 단언)를 settle 스위트 전체에 걸어 함께 확인합니다.
6. **H1 반례는 정적 추적이며 아직 실행하지 않았습니다.** 반례 스키마에서 패스 C가 분기와 z를 끄고, H1에서는 분기와 z가 켜진 채 남는다는 서술은 실행 확인이 따로입니다.
7. **같은 반례를 갱신 경로에 놓으면 기존 결함일 수 있습니다.** 사용자가 `/h/t`를 쓰는 경우에 같은 증분 판정이 분기와 z를 끄지 못하는지는 확인하지 않았습니다.

## 한계

이 진단은 HEAD `8a3ee595a`의 코드를 읽고 437 측정 창의 CPU 프로파일과 계수 파일을 다시 나눈 것입니다. 새 측정이나 인과 실험은 아닙니다. 시간 귀속은 V8 표본 프로파일러만 사용하였고, 호출 수는 437 계수 파일에서 가져왔습니다. 프로파일 절댓값은 벽시계보다 약 6 % 큽니다. 패스 B와 패스 C는 스택이 같아 시간을 나누지 못했으므로, 소스의 H1 절감은 절반 가정입니다. 수정 가설의 기대 절감은 그 프로파일에서 얻은 범위이며, 실제 절감량은 구현 후 같은 도구로 다시 측정해야 합니다.

### 검증

Claude Opus가 이 진단을 검증하였고, 판정은 조건부 통과입니다. 주장 1–5는 확인되었고, N=80 행은 0.1 µs 안에서 다시 유도되었습니다. H1은 반박되었습니다. H2는 선행 조건과 함께 확인되었습니다. H3의 동치는 미확정입니다. H4·H5의 결론은 유지되었고, 원장 인용을 더했습니다. 검증이 요구한 수정을 이 문서에 반영하였습니다. 반영한 내용은 H1 원장 충돌 문구, H1 동치 실패와 반례 스키마, H1 위험의 분배 멱등성 전제, H1 절반 가정 문구, 조합 추정의 0.50~0.59 ms, H3의 load 제외 문구, 단계 표 뒤의 E4·HEAD·E5 한정, H4·H5 원장 끝의 96C-01·97C-01·438C-02, `getDirectChildSelectionPlan.ts:46`, 설계 문서 49행(4절), `mayChangeOwnDeclarationAt`(`registerRecalculation.ts:53-63`), `changedRaw.delete`(`withdrawDetachedFills.ts:29`), W4의 `flushPendingOutput`(`selectChildren.ts:404`)입니다.

## 판정

H1은 반박됨(원장 충돌과 동치 실패)이며 채택하지 않습니다. 후보는 H2입니다. H2는 #427의 확인 바퀴 생략을 마운트 경로로 넓힙니다. 진행에는 두 가지가 필요합니다. (a) load 시점의 꺼진 엔트리 분배가 값이 있는 마운트에서 멱등이라는 증명입니다. (b) 결정 58의 적용 범위를 넓히므로 Vincent의 채택입니다. H3는 절감의 부호를 먼저 측정해야 합니다. H4와 H5는 SETTLE-020과 BLUEPRINT-007의 문구에 대한 소유자 결정이 필요하며, 지금은 제안하지 않습니다.
