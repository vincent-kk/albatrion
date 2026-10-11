# 분기 변경 1d 설계

1d는 120C-01이 제안한 형태입니다. 기존의 뜨거운 함수는 HEAD와 바이트까지 같게 두고, 분기가 둘 이상인 합집합(oneOf·anyOf) 호스트만 청사진의 표시로 호출 자리에서 별도 함수로 보냅니다. 기준은 HEAD `b48343272`(채택된 변경 2 포함)입니다. 근거는 읽기 전용 Opus debugger의 계수 진단(시간 측정 없음, V8 최적화 단계 추적 포함)입니다. 도구와 원자료, 시제품은 세션 scratchpad의 `d1-diag/`에 있습니다(`tools/count.mjs`, `cmp.mjs`, `tierrun.mjs`, `optstate.mjs`, `make-d1.mjs`, `build-d1.mjs`, 시제품 `d1a/`).

## 1c가 느렸던 까닭

1. **oneOf 마운트.** 1c의 마운트 작업량은 HEAD보다 적습니다. 계획 관련 일은 0이고, 그 밖의 계수는 같습니다. 다른 것은 `flushPendingGateReads` 하나입니다.
   - HEAD에서는 쓰기 쪽 호출(대부분 가드에서 바로 반환)이 이 함수를 계속 뜨겁게 유지합니다. 그래서 gc가 탈최적화한 뒤에도 곧 다시 최적화되어, 마운트 101회 중 100회를 최적화 코드로 돕니다.
   - 1c는 그 호출을 없앴습니다(`const flushReads = immediate && !direct;`). 그래서 마운트의 실제 작업 호출 6n−2회만 남고, 마운트 101회 중 0~4회만 최적화 상태입니다.
   - 같은 일을 최적화되지 않은 코드로 돌리는 몫이 분기 수에 비례해 늡니다. 마운트 시점에 최적화 상태였던 횟수는 oneOf-5/10/20/40에서 HEAD 100/100/100/100, 1c 0/0/4/3입니다. 세션 126의 측정 번들에서도 oneOf-20이 100 대 4였습니다.
2. **if-then 쓰기.** 쓰기당 일량의 순증가는 거의 0입니다(`WeakMap.get` +2/+3, 바로 반환하는 flush −2/−4). 그래서 원인은 if-then에서 늘 해석 실행되는 `primeHost`·`selectChildren`의 본문 모양이 바뀐 데 있다고 봅니다. 이것은 가설이며, 1d가 두 함수를 HEAD와 같게 두므로 측정으로 확인됩니다.

## 설계

- **HEAD와 바이트까지 같게 남는 함수:** `selectChildren`, `primeHost`, `flushPendingGateReads`, `evaluateGate`, `staticShape`(`staticIds` 포함). 시제품 번들에서 import 별칭 번호만 정규화해 비교했고, 모두 같았습니다.
- **청사진 표시:** `blueprint/utils/analyze/buildNodes.ts:94-105`의 노드 리터럴에서 `childEntries` 뒤에 `multiBranchUnion`을 둡니다. 값은 소유 선언의 스키마가 oneOf나 anyOf를 둘 넘게 가지는지입니다(1c `getDirectChildSelectionPlan.ts:49-52`의 판정과 같음).
  - 모든 노드에 같은 필드가 생기므로 객체 모양은 하나로 유지됩니다.
  - 타입은 `blueprint/type.ts`의 노드 기록과 `analyze/type.ts`의 `MutableNode`에 더합니다.
  - `blueprint.ts`의 완료 반복문에 두지 않는 까닭은 둘입니다. 개발 모드에서는 그때 노드가 이미 동결되어 있고, 그 반복문의 `'union'`은 oneOf가 아니라 타입 합집합을 뜻합니다.
- **호출 자리**(`computeNode.ts:117, 126-127`): `node.blueprintNode.multiBranchUnion && context.kind !== 'load' && context.hasGates && node.behavior.type === 'object'`이면 새 함수를, 아니면 HEAD 함수를 그대로 부릅니다.
- **새 함수 `selectUnionChildren`**
  1. 맨 앞에서 계획 캐시를 읽습니다. 값이 없을 때만 계획 함수를 부르고, 결과가 null이면 `selectChildren`으로 넘깁니다.
  2. 그 뒤는 1c의 단계 경로만 남깁니다.
  3. 단계마다 `if (immediate && context.pendingOutputs?.size) flushPendingGateReads(...)`를 남깁니다. 이 조건은 `flushPendingGateReads.ts:36`의 조기 반환과 같아 동작이 HEAD와 같습니다. 1c처럼 이 호출을 없앤 변형은 시제품에서 최적화 상태 0/0/2/7로 같은 기전이 재현되었습니다. 남긴 변형은 100/100/100/101이었습니다.
- **새 함수 `primeUnionHost`:** 계획이 없으면 `primeHost`로 넘기고, 있으면 계획의 기준선을 인덱스 반복문으로 돕니다.
- **파일:** 바뀌는 파일은 `computeNode.ts`, `buildNodes.ts`, `blueprint/type.ts`, `analyze/type.ts`입니다. 새 파일은 `compute/selectUnionChildren.ts`, `compute/primeUnionHost.ts`, `compute/selectUnionChildren/utils/getDirectChildSelectionPlan.ts`(1c의 파일을 옮김)입니다.

## 시제품의 예상 계수

- 마운트(oneOf 네 크기)와 if-then OFF/ON의 모든 쓰기: 모든 계수가 HEAD와 같습니다. 계획 호출과 WeakMap 증가도 0입니다.
- oneOf-20 쓰기(HEAD → 1d):
  - 첫 쓰기: flush 248→4회, `selectChildren` 4→0회(`selectUnionChildren` 4회), 계획 생성 1회(할당 62×2+4개), `WeakMap.get` +67, `WeakMap.set` +1, `getGateExpression` +60.
  - 둘째 쓰기: flush 124→59회(실제 작업 호출은 모두 유지), `WeakMap.get` +3.
  - 이후 쓰기: flush 124→2회, `WeakMap.get` +3.
  - `active[]`·`ids[]` 할당 248/124/124 → 0.
- 계획은 청사진이 마운트마다 새로 생기므로 마운트마다 첫 전환에서 새로 만들어집니다. 단계 수는 3n+2개입니다.

## 시험과 판정

- 차등 시험: 기존 HEAD 차등 시험(59 스키마, 분기 축, if-then, 모든 노드 리스너)이 초록이어야 합니다.
- 계수 시험: if-then·비합집합 호스트에서 새 함수가 0회 불림을 단언합니다. oneOf 첫 전환 뒤 무관한 분기의 후보 방문이 줄어든 것도 단언합니다.
- 판정은 129라운드의 고친 측정 방법(클러스터 bootstrap, 확인 측정)으로 1d 대 HEAD를 잽니다.

## 확인하지 못한 것

- 마운트 −27 µs가 최적화되지 않은 flush 호출에서 온다는 수치 연결은 시간 측정을 하지 않아 확인하지 못했습니다.
- 1d는 1c가 건너뛰던 실제 작업 flush(둘째 쓰기의 59회)를 유지하므로, 분기 축 이득이 1c보다 작을 수 있습니다.
- oneOf-40에서 HEAD `selectChildren`의 마운트 시점 최적화 상태가 101회 중 7회에서 0회로 줄었습니다. 작은 차이로 보지만 측정으로 확인해야 합니다.
- 시제품의 결과 값 동일성과 시험 통과는 아직 확인하지 않았습니다.
