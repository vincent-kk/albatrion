# 설계 Ⅲ — 직접 계획에서 풀린 정적 준비물과 Δ 상수의 축소 (B9·B10, 461라운드 제안)

## 자리

460라운드의 이정표(`design-ii.md` 이정표 절, `../../verification/branch-switch/b5-results.md`)에서 분기 전환은 0.16.1의 4.37배(oneOf-80 쓰기당 171.94 µs), 형제 1,000은 형제 0의 19.45배로, 관문 여섯 가운데 oneOf·discriminator·if·형제 넷이 FAIL이었다. 461라운드에 소유자는 성능(알려진 한계의 넷째 묶음)을 설계 Ⅲ의 문제로 두고 보강 PR(B8)을 먼저 하며 코디네이터가 설계 Ⅲ을 준비하도록 지시했다(`../../reviews/round-461-owner-answers.md`). **이 문서는 제안이며 착수 여부는 소유자가 정한다.** 관문 수치는 446C-06(oneOf-80 왕복이 0.16.1의 1.5배 안, 1 ms 아래)과 459라운드의 형제 상한(TEST-093, 형제 1,000이 형제 0의 3배 안)을 그대로 두되, 이 설계가 어느 관문에 닿고 어느 관문에 닿지 못하는지를 비용 모델에 먼저 적는다.

## 문제

B5의 단계 장부(`../../verification/branch-switch/raw/b5/stages.json`, 단계 끝 `ad0be79ba`, 쓰기당 self 중앙값)와 D2-P5의 CPU 프로파일(호출 수)로 만든 비용 지도에서 읽은 사실 셋이다.

- **(1) 형제 선형항의 근원: 형제 호스트는 B2-P2의 정적 준비물을 한 번도 받지 못한다.** 형제 행의 고정물은 루트에 `pad_N`과 분기 둘짜리 oneOf가 있고 두 분기가 모두 `x`·`y`를 선언한다. 청사진은 종류와 이름이 같은 후보를 게이트 선언 둘을 가진 템플릿 하나로 합치므로, 직접 계획(`settle/utils/compute/childSelection/getDirectChildSelectionPlan.ts`)은 `declarations.length !== 1` 조건으로 null이 되고, `prepareStaticHost`는 직접 계획이 없으면 준비물을 만들지 않는다(`if (!plan) return undefined`). 그래서 쓰기마다 엔트리 전부를 두 번 걷는다(primeHost와 selectChildren의 `createStaticEntryReuser` 콜백, N=1,000에서 쓰기당 2,004회). B2-P2 결과 문서의 "`HostStaticPartition`이 정적 목록을 비운다"는 서술은 이 관찰과 맞지 않는다: B5에서 wheelPreparation incl 685 µs는 primeHost 677 µs와 self 4.7 µs뿐이라 deferBaseline이 참이고, baselineEligible은 `staticEntries.length > 0`을 요구하므로 분할은 비어 있지 않다. 막는 것은 분할이 아니라 직접 계획이다. 형제당 기울기 2.03 µs(단계 단위; 행 단위 1.63)는 selectChildren 0.70, primeHost 0.67, computeNode self 0.29, assembleObject 0.26, commitSettlement 0.07, markCommitDeliveries 0.01로 나뉜다. O(S)로 도는 루프는 여섯이다: (a) primeHost의 엔트리별 선언 `some`과 재사용 콜백(`appendSegment` 문자열, Map get, getter 검사 열 개, `selectedDeclarationIds.set` — 이 맵은 `releaseSettlementScratch`가 쓰기마다 비운다)과 `Object.values`·`isSameChildList`; (b) selectChildren의 두 번째 전체 방문과 `Object.keys(prior)` 전체 비교, `Object.values(next)`, `isSameChildList` 둘, flushPendingOutput; (c) 전환마다 루트 effective schema의 identity가 바뀌어 assembleObject 메모가 늘 빗나가 전체 경로(모든 자식 Map, childEntries 루프, `Object.keys(previous)`, `{...previous}`)를 치르는 것(엔트리당 0.04 µs, oneOf-80의 9.2 µs가 거의 전부 이 항); (d) computeNode self의 `preserveReferences`의 `children.every`와 1,003키 루트 값에 대한 `sameValue`의 `Object.keys`; (e) commitSettlement의 형제 전원 `getCommittedDeclarationKey`와 `PathKeyedMap.set`(쓰기당 1,004회); (f) 루트 schema가 바뀌면 markCommitDeliveries가 자식 전원의 required를 다시 계산하는 것. registerRecalculation·evaluateGate·의존 색인·게이트 표·배달은 1,000형제당 합쳐 약 11 µs라 O(S) 항이 아니다.
- **(2) oneOf-80 쓰기당 166 µs(self 합; wrapped 172.4)의 구성.** 상위 다섯은 computeNode self 33.4(루트·들어온 잎 셋·kind의 5회; 안에서 `selectNodeSchema` → `mergeEffectiveSchema` → `selectEffectiveDeclarations`가 루트 선언 D=81개를 `includes`로 거르고 정렬하는 O(D·A), 바뀐 이름마다 `registerPresenceChanges`, 게이트 표 라운드, `preserveReferences`의 `sameValue`), selectChildren self 29.8(방문은 이미 O(A+Δ)이고 self는 들고 나는 엔트리당 상수: `getSlotSource`, `getChildDistribution`, 나감 키의 `JSON.stringify`와 `getBlueprintNodeIdentity`, `updatePendingExitIndex`, 새 복제 노드마다 `getGateRegistry.register`의 Map 둘과 배열 spread·flatMap), finalizeExits 18.4(나감 서브트리당 `captureDetachedFieldNodeReads` 동결·레지스트리 제거·`DetachedWriteAddress.retain`·overlay; 나감이 하나라도 있으면 루트 misfitPaths 전체 색인; 두 행으로 맞추면 고정 약 13.6 µs에 나감당 약 1.6 µs이고 고정분의 주인은 미확인), everythingElse 13.4(바닥; 컨텍스트·scratch·쓰기 사슬·배달 flush), registerRecalculation 12.2(의존 색인이 게이트 G개 각각의 식 의존을 선언 경로에 등록해 `/kind` 하나에 소유자 G개가 나오며 게이트당 약 0.07 µs, 약 5.6 µs가 G 항). 같은 G=80에서 Δ만 다른 oneOf-80(잎 6)과 payload-12(잎 24)를 맞추면 들고 나는 잎 하나당 약 4.9 µs(assembleObject의 엔트리 항을 뺀 값)이고, oneOf-80 166은 바닥형 79(형제 0의 self 합) + Δ 29 + 나머지 58(computeNode 14, finalizeExits 고정 13.6, assembleObject 9.2, selectChildren 7, cloneFromSlot 4.9, commitSettlement 4.2, registerRecalculation 3.6)로 나뉜다. 고정물이 서로 달라 방향 지표다.
- **(3) 바닥.** 형제 0은 행 106.7 µs(단계 self 79.1)이고 0.16.1의 형제 0은 29.75 µs다. 1.5배 관문은 39.30 × 1.5 = 59.0 µs/쓰기인데 바닥만으로 관문의 1.8배다. 바닥은 정착의 고정 장치(컨텍스트, dirty 집합, 바퀴, 커밋, 배달)가 대부분이고, 행과 단계 사이의 24 µs는 설명되지 않았다.

## 명제

**호스트의 정적 준비물은 직접 계획이 아니라 분할의 유일성에만 걸리고, 정착의 호스트 루프는 동적 엔트리 K개만 걷는다. 들고 나는 엔트리의 상수는 문자열 왕복과 게이트 없는 잎의 레지스트리 할당을 빼서 줄인다.** 공개 계약은 그대로다: 자식 순서와 방출 키 순서, 같은 값이면 같은 참조, 떼어짐 규칙(NODE-044), 커밋된 선언 ID의 조회, 배달 결과. 바뀌는 것은 정착이 어느 엔트리를 다시 보느냐와 한 엔트리당 치르는 상수뿐이다.

## 모델

| # | 겨냥 | 기제 |
| --- | --- | --- |
| H1 | primeHost, selectChildren(형제) | 분할이 유일하면(`gated`, gated overlay 없음, `staticEntries.length > 0`) 직접 계획이 null이어도 준비물을 만든다. 준비물은 정적 엔트리의 노드 참조와 선언 ID(청사진 상수)와 동적 엔트리 목록(저작 순서)을 들고, primeHost와 selectChildren은 동적 목록만 돌며 정적 엔트리는 `prepared.entries.has`로 재사용한다(지금 준비된 경로가 그렇다). verify 모드의 증인 재확인(GOAL-029)과 load·distributedInputs·pathChanges·failures·relocated의 무효화는 그대로. 구성원 Δ(들어옴·나감)가 없으면 이전 children 배열을 유지하고 `Object.assign`·`Object.values`·`isSameChildList`를 생략한다. |
| H2 | assembleObject | 메모 키를 effective schema identity가 아니라 `getStaticChoices(schema).propertyOrder`와 children identity로 바꾸고, 재계산된 자식(Δ)만 덧붙인다. 구성원이 바뀌면 활성 A개로 구성한다. |
| H3 | computeNode, updateOutput | 참조 보존 판정을 깊은 `sameValue`와 `children.every` 대신 정착이 이미 아는 Δ 집합으로 한다. computeNode self의 내부 분할이 미확인이므로 B9-0의 하위 타이머 뒤에 확정한다. |
| H4 | commitSettlement, markCommitDeliveries | 정적 자식의 선언 ID는 청사진 상수이므로 `selectedDeclarationIds`에 기록하지 않고 `derive`·`readDefault`·`getControlLayers`의 조회가 준비물에서 읽게 한다. required 배열의 identity가 같으면 required 루프를 생략하고, 아니면 들어온 자식만 계산한다. |
| H5 | 들어옴·나감 상수(oneOf) | 나감 키를 경로 문자열 대신 노드 identity로(`request.md` Ⅲ의 제안), 게이트가 없는 잎의 레지스트리 등록 빠른 길(Map·spread 할당 없음), finalizeExits 고정분의 주인을 B9-0에서 확인한 뒤 제거(misfit 색인은 나간 서브트리 아래로 한정). |
| H6 | selectNodeSchema | 활성 선언 ID는 표의 버킷이 정하므로 버킷별 effective schema 메모로 루트 선언 D개의 순회를 없앤다. |
| H7 | registerRecalculation | 표 단계의 게이트를 호스트 소유자 하나로 등록해 `/kind` 변경의 소유자가 G개가 아니라 하나가 되게 한다. BLUEPRINT-007은 평가를 정하는 규칙이지 등록 방식을 정하지 않는다. S3 shadow 경로의 동등을 확인한다. |

## 비용 모델

| 가설 | oneOf-80(µs/쓰기) | siblings-1000(µs/쓰기) | 공개 동작 위험 |
| --- | ---: | ---: | --- |
| H1 | 0 | −1,100~−1,300 | 중간(순서, 증인) |
| H2 | −6~−8(payload-12 −30) | −200~−230 | 중간(키 순서) |
| H3 | −2~−5 | −200~−300(미확인) | 낮음~중간(참조 규칙) |
| H4 | 약 −1 | −80~−95 | 낮음~중간 |
| H5 | −10~−25 | 0 | 낮음 |
| H6 | −3~−8 | 0 | 낮음 |
| H7 | −4~−5 | 0 | 중간(S3 shadow) |

- **예상 결과.** oneOf-80 172 → 약 120~145 µs/쓰기(0.16.1의 3.1~3.7배). siblings-1000은 H1~H4를 모두 적용해 2,076 → 250~400 µs(형제 0의 2.3~3.8배), 기울기 1.63 → 약 0.2~0.4 µs/형제. discriminator-80·if-80은 oneOf-80과 같은 항을 공유하므로 같은 방향.
- **닿는 관문과 닿지 못하는 관문.** 형제 3배 상한(TEST-093, 320 µs)은 H1~H4를 모두 해야 경계선에 걸친다(형제당 0.21 µs 이하가 필요하며 0.16.1의 기울기 2.17 µs는 그 관문을 83.7배로 통과하지 못한다). **1.5배 관문(59.0 µs/쓰기)은 이 설계의 범위로는 닿지 않는다.** 바닥(형제 0, self 79.1·행 106.7)만으로 1.8배이고, 통과하려면 바닥 약 35 µs 이하·잎당 Δ 3.6 µs 이하·G 항 거의 0이 동시에 필요한데 그것은 정착의 고정 장치 재설계(설계 Ⅳ 후보)다. 이 설계는 그 관문을 약속하지 않는다.
- **메모리.** 준비물은 호스트당 정적 엔트리의 노드 참조 O(S)를 든다. 지금도 children 배열이 같은 수의 참조를 들므로 증가는 호스트당 상수이며, 바뀐 fractal의 DETAIL과 결과 문서에 보유량을 적는다. 힙 관문(448C-05·TEST-086)은 그대로.

## 지키는 것

- SETTLE-044·GOAL-029(baseline은 청사진에서 항상 활성인 엔트리, verify 모드의 증인 재확인, 준비물 무효화 조건), BLUEPRINT-007(동적 게이트는 매 바퀴 전부 평가), SETTLE-001(단계 순서), NODE-044, 자식 순서와 방출 키 순서, 같은 값이면 같은 참조, 커밋된 선언 ID를 `derive`·`readDefault`·`getControlLayers`가 계속 읽을 수 있음, 전후 배달 비교 0, 공개 겉면 차분 0.
- 460C-07의 검증 스케줄과 무결함 원칙(`verification.md` 460라운드 절): 반복 중 표적 시험, delta 검토, 최종 머리에서 전체 관문 한 번, 빨간 상태로는 PR도 병합도 없음.

## 하지 않는 것

- 정착의 고정 장치(컨텍스트·dirty 집합·바퀴·커밋·배달)의 재설계. 바닥은 이 설계의 범위 밖이다.
- 청사진의 합치기 규칙(같은 종류·이름의 후보를 선언 둘 템플릿으로)의 변경이나 직접 계획의 조건 완화. 준비물의 조건을 바꾸는 것이지 직접 계획을 넓히는 것이 아니다.
- 공개 겉면·시험 기대값의 변경. 일곱 가설을 한 PR에 넣는 것.

## 단계(B9·B10)

| PR | 내용 | 판정 |
| --- | --- | --- |
| B9-0 | 측정만(제품 코드 변경 없음, 계측 번들과 도구만): computeNode 하위 타이머(`selectNodeSchema`·`registerPresenceChanges`·`preserveReferences`·`canSkipGateWheel`·`sameValue`), finalizeExits 하위 타이머(`captureDetachedFieldNodeReads`·`retainExitedSlot`·misfit 색인·`withdrawDetachedFills`·`finalizePerished`), oneOf-80 형상에 형제를 더한 탐침 행(준비된 경로의 기울기), 형제 셋 고정물에서 `staticEntries.length`와 직접 계획 캐시 값의 출력, 행 대 단계 24 µs 차이의 귀속 | 미확인 넷이 수치로 닫힘. 수치가 H3·H5의 예상을 뒤집으면 이 문서의 모델·비용 모델 절을 정정하고 B2-P2 결과 문서의 서술을 바로잡는다 |
| B9-1 | H1 + H4(형제) | siblings-1000이 폭 (다) 밖 개선; 단계 장부 1,000에서 primeHost ≤ 50, selectChildren ≤ 60, commitSettlement ≤ 5 µs; TEST-093 재판정; verify 모드 초록, 배달 비교 0, 힙; oneOf-80·siblings-0 악화 없음 |
| B9-2 | H2 + H3 | assembleObject ≤ 3 µs(oneOf-80)·≤ 40 µs(1,000); 값·키 순서 시험과 참조 안정 시험이 수정 전에 실패; siblings-1000·payload-12 폭 밖 개선 |
| B9-3 | H5 + H6 + H7(oneOf) | oneOf-80 폭 밖 개선; payload-12 잎당 ≤ 3 µs; registerRecalculation ≤ 7 µs(G=80); discriminator-80·if-80 동반 개선; S3 shadow 동등 |
| B10 | 이정표 재측정: 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 설계 Ⅲ 끝)과 여섯 관문, B5와 같은 창 | 관문 판정. 1.5배 미달이 예상되므로 마감 판정(설계 Ⅳ 착수 또는 "대규모 개편 없는 상한"으로 기록)은 소유자가 정한다 |

B9-1·B9-2·B9-3은 각각 하나의 PR이며 순서는 형제(B9-1) 먼저다. 어느 PR이든 겨냥한 행이 폭 안이면 "개선 없음"으로 적고 되돌린다(`verification.md` PR 관문). 구현은 codex, 창은 인계 파일을 받은 측정 담당, 독립 검토는 claude 검증 에이전트(460C-05).

## 확인되지 않은 것(B9-0이 닫는다)

- computeNode self 33.4 µs의 내부 분할(인라인 때문에 프로파일 귀속이 흐림).
- finalizeExits 고정분 약 13.6 µs의 주인.
- H1 뒤에 남는 O(S)(`Object.assign`·`Object.values`)의 실측.
- B2-P2 결과 문서의 "정적 목록을 비운다"와 비용 지도의 읽기 사이의 차이.
