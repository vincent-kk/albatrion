# Ⅳ-1 후보 2 독립 검토 판정 (읽기 전용)

검토 대상은 19353b1d2d9a63299d47cd25bbe7f88733b828dd이며 제품 커밋은 63c4c9235입니다. 후보 1(0cc800d28) 이후 두 커밋을 봤습니다. 아래 경로는 모두 packages/canard/schema-form 기준입니다.

## 판정

**FAIL**입니다. P1 0건, P2 1건, P3 2건입니다.

제품 변경 (a)(b)(c)(d)는 요청한 명세와 같습니다. 관측 차이를 만드는 결함이나 새 회귀 경로는 코드 읽기로 찾지 못했습니다. 앞 판정의 P2 두 건도 명세대로 닫혔습니다.

FAIL 사유는 판정 장치 하나입니다. (a)가 범위 표 생성 비용을 마운트에서 첫 비-load 쓰기로 옮겼습니다. 그런데 첫 쓰기는 모든 행에서 예열 구간에 들어가고, 가중 교환비도 따로 잰 생성 비용을 더하지 않습니다. 그래서 이 비용이 채택 판정에서 통째로 빠집니다. 수정은 창 뒤에 저장된 원시만 읽는 계산 하나이므로 제품 바이트도, 창 2 재실행도 필요 없습니다.

## 발견

### P2-1 (확인됨) 첫 쓰기로 옮긴 범위 표 생성 비용이 가중 교환비와 모든 시간 행에서 빠집니다

- 근거, 생성 위치: src/core/engine/blueprint/blueprint.ts:131-134의 getter가 첫 접근에서 표를 만듭니다. 제품에서 표를 읽는 곳은 src/core/engine/settle/utils/settlement/resolveSettlementScope.ts:15-18뿐이고, load 검사 바로 뒤입니다. 따라서 비용은 세션마다 청사진 하나당 첫 비-load 쓰기에서 한 번 납니다.
- 근거, 측정에서 빠지는 이유: 시간 행은 프로세스마다 예열 20회 뒤에 표본 100회를 잽니다. 그래서 첫 쓰기는 늘 예열에 들어갑니다. 마운트 행은 쓰기를 하지 않습니다. tools/iv-1/scopeCost.mjs:38-55가 생성 비용을 따로 재지만, summarize.mjs:234는 그 값을 증거로 저장만 합니다. weightedExchange.mjs:42-45의 합과 summarize.mjs의 adoptable 계산은 이 값을 쓰지 않습니다.
- 근거, 규칙과의 어긋남: 단계 가지 20fc0f7bc의 verification.md(가중 교환비 절)는 "청사진 분석 단계로 일을 옮기는 설계(범위 표 같은 것)는 (4)로 판정한다"고 적습니다. 같은 절 끝은 "첫 쓰기 지연 생성이 들어간 창 2에서 다시 센다"고 적습니다. blueprint/DETAIL.md도 "비용과 표 크기는 마운트·쓰기 행 및 별도 구성 기록으로 판정합니다"라고 적습니다.
- 실패 시나리오: 창 2에서 마운트 행이 폭 안으로 돌아오고 교환비가 음수가 되면 채택 가능으로 나옵니다. 그러나 창 1에서 잰 표 생성 중앙값은 다음과 같고, 이 비용은 이제 사용자의 첫 입력에서 판정 밖으로 지불됩니다. 이 값은 예열된 반복의 중앙값이므로 실제 첫 쓰기(예열 전)보다 작게 잡혔을 가능성이 큽니다.

  | 형상 | 표 항목 수 | 생성 중앙값 |
  | --- | ---: | ---: |
  | 중첩 d6-f4 | 5,461 | 1,586.792 µs |
  | 평면 1000 | 1,001 | 227.855 µs |

  창 1의 교환비 +299 µs를 결정한 항이 바로 mount-nested-d6-f4의 +2,569 µs였으므로 크기 차원에서 무시할 수 없습니다.
- 수정 명세: 창 2 준비 루트는 tools/iv-1의 .mjs 해시를 고정하고 summarize가 그것을 검사합니다(tools/b9-1/verifyInputs.mjs:17-21). 그러므로 준비 뒤에 summarize.mjs나 weightedExchange.mjs를 고치지 않습니다.
  1. 새 파일 tools/iv-1/firstWriteExchange.mjs를 만듭니다. 이 스크립트는 summarize 뒤에 돌고, `<raw-output>/judgment.json`과 `<raw-output>/scope-build-cost.json`만 읽습니다.
  2. mount-oneOf-80, mount-flat-1000, mount-nested-d6-f4 각각에 대해 `records.find((r) => r.row === id).medianUs`를 가중치 1인 추가항으로 둡니다. 근거는 "세션당 마운트 한 번과 같은 빈도로, 청사진당 첫 쓰기 한 번"입니다. A 레인에는 표가 없으므로 이 항은 B에만 더합니다.
  3. `adjustedTotalUs = judgment.weightedExchange.totalUs + Σ추가항`을 계산합니다.
  4. decision이 'regressed'인 마운트 행은 `adjustedTotalUs < 0`일 때만 exchange-allowed로 다시 판정합니다.
  5. `adjustedAdoptable = judgment.adoptable && adjustedTotalUs <= 0 && (다시 판정한 마운트 행이 모두 통과)`로 정합니다.
  6. 결과 문서에는 원래 값과 조정 값, 행별 추가항을 함께 적습니다. 예열 중앙값이 차가운 첫 쓰기를 과소 추정한다는 점도 적습니다.

  창 2를 아직 준비하지 않았다면 대안이 있습니다. weightedExchange(rows, weights, additions = [])로 추가항을 받게 하고, 창 1 원시에 위 추가항을 넣은 장치 시험을 더하는 방식입니다. 이 비용을 판정에서 빼기로 한다면 그것은 소유자의 결정이므로, 그 결정을 결과 문서에 명시적으로 남깁니다.

### P3-1 (가능성) (d)는 H만 되살리고, 루트 재계산이 다시 돌린 H 안쪽 노드의 changedNodes 소거는 되살리지 않습니다

- 근거: src/core/engine/settle/utils/compute/computeSettlement.ts:25-33은 H의 local과 emit 참조만 비교해 H를 다시 넣습니다. 루트 재계산은 국소 결과 위에서 시작합니다. 게이트가 있는 H의 바퀴는 자식을 baseline으로 되돌렸다가(primeHost.ts:145-160) 다시 선택하고(selectEntryStep.ts:351-371), schema가 baseline과 다른 branch 자식을 다시 계산합니다. 고정 baseline 덕분에 다시 계산한 값은 국소 결과와 같습니다. 그래서 preserveReferences.ts:41-51이 그 자식을 changedNodes에서 지웁니다. 그 자식의 값이 국소 계산에서 실제로 바뀌었어도 지워집니다.
- 영향: 지워진 노드는 commitSettlement.ts:85의 misfit 갱신에서 빠지고, markCommitDeliveries.ts:82-112의 required 갱신(자식이 새로 들어온 경우)에서 빠집니다. 값 배달은 stateDirtyNodes 경로로 계속 나가므로 영향은 좁습니다. 후퇴가 일어나는 것도 국소 계산 도중 실패, 예산 초과, 범위 밖 소유자 같은 오류 경로뿐입니다. H 자체도 children만 바뀌고 local과 emit 참조가 그대로인 경우에는 같은 소거를 겪지만, H 안 쓰기는 보통 H의 값을 바꾸므로 이론상의 경우입니다.
- 수정 명세: computeSettlement.ts에서 25-26행과 32-33행을 지웁니다. 후퇴 분기 안 computeNode(context.root) 앞에 `const locallyChanged = [...context.changedNodes];`를 넣고, 뒤에 `for (const node of locallyChanged) if (!node.detached && readWitnessDeliveryMask(node) !== 0) context.changedNodes.add(node);`를 넣습니다. import는 `../settlement/readWitnessDeliveryMask`에서 가져옵니다. 이 함수는 마지막 commit 이후 첫 변경 기준값과 현재 값을 비교하므로 "정착 시작 대비 변경"과 같은 뜻입니다. 할당은 후퇴 경로에서만 생기고, 국소 쓰기마다 하던 참조 읽기 둘은 사라집니다.
- 시험: head-differential의 throw 가드 fixture에 변형을 하나 더합니다. H의 then이 branch 자식 c에 overlay를 더하고(c가 baseline과 다름), 쓰기 대상은 c 안입니다. 이 변형에서 commitCandidates가 강제 루트와 같은지 단언합니다. 제품 바이트가 바뀌므로 반영 시점은 코디네이터가 정합니다.

### P3-2 2 µs 미만 단계 규칙의 근거가 규칙 문서에 없습니다

- tools/iv-1/judgeStage.mjs:11-21의 규칙(A self가 0보다 크고 2 µs 미만이면 B − A가 A의 세 프로세스 중앙값 폭 이하)은 결과 문서와 장치에만 있습니다. 20fc0f7bc의 verification.md에는 없습니다.
- 수정 명세: 코디네이터 승인과 그 이유(측정 분해능)를 verification.md의 PR 관문 절에 한 문단으로 기록합니다.

## 확인한 것

1. **(a) 지연 생성.**
   - 생성은 resolveSettlementScope.ts:15-18에서 load와 loadScope 검사 뒤에 처음 표를 읽을 때 일어납니다. load와 reset(kind 'load')은 표를 만들지 않습니다(settle.local-wheel-live-proof.test.ts:51-74).
   - batch와 배열 조작의 첫 쓰기도 표를 만들지만, batch 판정이 표 조회 뒤에 있어 결과는 루트입니다.
   - verify 증인은 표를 읽지 않습니다.
   - 캐시는 blueprint() 호출마다 생기는 클로저 변수이므로 청사진 인스턴스 사이 오염이 없습니다. 같은 schema의 캐시 적중은 같은 객체와 같은 표를 줍니다(blueprint.local-wheel-lazy.test.ts:16-45).
   - 의존 색인과 키(청사진 객체 정체성)와 GC 수명이 같습니다. 다만 의존 색인은 파생 기록 초기화로 지워지고 표는 지워지지 않습니다. 이 차이는 DETAIL에 적힌 의도이며, 표가 값을 담지 않으므로 해가 없습니다.
   - 첫 쓰기 자체는 표를 만든 직후 그 표를 써서 국소로 갈 수 있습니다. 표는 결정적이므로 선택이 생성 시점에 좌우되지 않습니다.
   - 부모가 모두 루트인 청사진의 조기 반환(buildSettlementScopes.ts:18-23)은 원래 알고리즘과 결과가 같습니다.
2. **(b)(c)(d).**
   - (b)는 앞 명세 4와 같습니다(computeSettlement.ts:28-31). post-order 집합에서 add가 소비된 H와 그 부모 간선을 되살려 S6를 없애고, 게이트 집합에서는 조상의 dirtyChildren이 H를 다시 포함하게 합니다. table과 verify 두 모드의 시험이 있습니다.
   - (c)는 P3-1 명세와 같습니다(releaseWrongKindHosts.ts:35).
   - (d)의 참조 비교는 updateOutput과 preserveReferences가 sameValue일 때만 참조를 유지하므로, H의 local과 emit에 대해 거짓 음성과 거짓 양성이 없습니다. 남는 범위는 P3-1입니다.
   - 계산 전 재확인 경로(20-24행)는 재진입 때 순수 루트 경로와 같은 재계산을 하므로 동등합니다.
3. **앞 판정 P2 두 건.**
   - if 시험은 required 가림을 제거했고, if 호스트 아래 후보 시험과 virtual 및 재귀 전제 시험을 더했습니다.
   - 후퇴 시험은 writeEpoch, changedRaw, wrong-kind 안팎, split 안팎, 재결합 안 된 occurrence, 예산 둘, detached, 끊긴 부모 사슬, terminal, cause 없는 실패, 계산 전과 뒤 재확인을 다룹니다.
   - 규칙 줄 제거 probe 13건의 기록(raw/iv-1/candidate-2-review/summary.json)에서 표본 4건(if-host-edge, recursive-binding, postcompute-host-candidate, split-outside)을 열어 봤습니다. 모두 설정 오류가 아니라 해당 단언에서 실패했습니다.
   - P3-3부터 P3-7까지도 반영되었습니다. 특히 commits 절은 stateDirtyNodes만 빼고 비교하며, 빠진 항목이 host의 엄격 조상뿐인지 단언합니다. 최종 commit 후보 집합 전체도 강제 루트와 비교합니다.
4. **장치 (f).**
   - tools/window/eventWeights.json의 22행 가중치와 k가 verification.md 표와 모두 같습니다(왕복 2, single 10, 나머지 1).
   - Δ = (B − A)/k이고, decision 'unproven'(폭 안)은 0으로 셉니다.
   - 쓰기 행은 폭 밖 개선을 허용하고 폭 밖 퇴보를 거절합니다. 마운트 퇴보는 합이 엄격한 음수일 때만 허용합니다. 합이 0일 때 규칙 문서는 말이 없고, 장치는 거절하는 보수적인 쪽을 택합니다.
   - 창 1 원시로 +299 µs를 재현하는 장치 시험이 있고, 표의 수치로 다시 계산해도 +298.9 µs입니다.
   - 0에서 0 허용은 single-nested selectChildren에만 적용됩니다(judgeStage.mjs:7-10).
5. **바이트와 FCA.**
   - public dist/index.d.ts의 SHA-256은 ed3bfe4d…b3d로 후보 1과 같습니다(raw/iv-1/candidate-2-static/artifacts.json). 런타임 번들 세 개는 바뀝니다.
   - FCA 발견은 202건 그대로이고, facts는 1,681/1,681 exact입니다.
   - 커밋된 원시와 문서에 기계 로컬 경로가 없습니다.
   - receipts는 19353b1d2에서 build와 여섯 시험 단계가 모두 exit 0이라고 적습니다. 로그의 시험 수는 verify 745파일 4,837, unit 608파일 4,025입니다.

## 미확인

- 지시대로 빌드, 시험, node는 하나도 실행하지 않았습니다. probe도 다시 돌리지 않았고, 13건 가운데 4건의 로그만 열었습니다.
- typecheck와 lint 로그는 비어 있고, receipts에 두 단계의 exit 기록이 없습니다.
- P3-1의 소거 경로는 코드 읽기로만 확인했습니다.
- 차가운 첫 쓰기의 실제 표 생성 시간은 재지 않았습니다.
- 창 2 준비 루트가 이미 만들어졌는지 모릅니다. 이에 따라 P2-1 수정을 둘 위치가 달라집니다.

## 실행한 명령

- git log, git show, git diff, git rev-parse, git status, git grep(19353b1d2, 63c4c9235, 20fc0f7bc 대상)
- cat, sed, grep, head, ls, find, tr, paste(소스, 시험, DETAIL, 장치, 결과 문서, 커밋된 원시)
- gzip -dc(커밋된 probe와 시험 로그 읽기)
- 빌드, 시험, lint, typecheck, node, yarn은 실행하지 않았습니다.
