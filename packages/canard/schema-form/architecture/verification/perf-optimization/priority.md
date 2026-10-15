# M1 분류와 우선순위

- **기준 실행:** `20261015T0138-c59ba13-before`([M0 기준선](./baseline.md)), 기준 커밋 `c59ba1363`.
- **소유자 확인은 결정 대기열 55의 가결정(344라운드 편집자 가결정, 소유자가 뒤집을 수 있음, `reviews/owner-queue-07.md`)대로 기다리지 않는다.** 축이 금하는 후보는 멈추고 기록한다.
- 초안은 fairy08(2026-10-15), M0 수치 채움과 계약 칸 확정은 원장 관리자의 지시로 fixy08이 했다. 칸 규칙은 [개발요청서](../../plan/perf-optimization/request.md)의 "M1 분류와 우선순위", 묶음 L1–L4는 같은 문서의 M2 표, 금지 축은 [ADR과 축](../../plan/perf-optimization/adr-and-axes.md)의 "축이 금하는 후보"다. 묶음 순서는 체감 가중이 높은 것부터이고(354라운드), L4는 코드 작업 없이 "수용 후보"로만 둔다.
- 경로는 현행(`src/core/engine/...`)이다. 아래에서 `S/`는 `src/core/engine/settle/`이다. 대장의 위치 칸은 옛 경로가 많다.

## 상위 15행 — M2에 들어갈 가설 후보 순서

순서는 (0) 계약 위반, 그다음 체감 가중이 높은 render 경로 묶음, 그다음 코어 전용 묶음이다. 같은 원인의 render 행과 코어 행은 한 가설로 합쳤다. 원장 관리자가 이 순서를 받았고, M0 뒤에도 순위는 초안 그대로다. **첫 PR(L1)은 순위 0·1·2·3·7이다.** 계약·차수·체감 칸의 "M0" 수치는 [M0 기준선](./baseline.md)의 실행 `20261015T0138-c59ba13-before`에서 왔고, "옛 판 대비"는 같은 실행의 `--equivalent`(TEST-073의 선)이다. 그 실행에서 옛 판 대비 회귀는 core 38행 중 29행, render 114행 중 27행이다.

| 순위 | 가설 후보 | 대표 행 (구성) | 체감 순위 근거 | 추정 원인 (현행 path:line) | 계약 | 차수 | 체감 | 위험 / 금지 축 | 묶음 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 커밋 되살림 기준을 직전 커밋으로 (H4) | P-25 | 비용 행이 아니라 결함(같은 참조 규칙) | `S/utils/output/updateOutput.ts:44,53-58`, `S/utils/compute/preserveReferences.ts:28-31`, `S/utils/commit/markCommitDeliveries.ts:177` | 위반(같은 참조) | 해당 없음 | 무관(필수) | SETTLE-043, GOAL-011(같은 값은 같은 참조), EVENT-006 / 금지 축 아님(기존 시험이 원하는 동작을 이미 단언) | L3 |
| 1 | 배열 구조 동사의 동사당 길이 비용 (G8) | P-85 (P-57, P-59, P-84, P-98) | P-85 1.5301×, +402.80 ms; 코어 P-57 4.8478×, +94.70 ms | `S/arrangeFieldNodeItems/utils/arraySlots/canApplyArrayTail.ts:17-29`, `src/core/engine/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts:12`, `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:52-56` | **위반(G8, push)**: push가 기존 길이에 선형(M0 1천→8천 Node 7.69×, Bun 10.75×). remove는 지우는 자리를 바꾸는 행이 없어 꼬리 비례 여부 미분리 | push 선형(기존 길이 1천/2천/4천/8천 Node 0.280/0.492/1.050/2.153 ms). remove(1) 2.440/5.044/10.47/23.02 ms(9.44×, 꼬리와 전체 길이가 함께 늚) | 높음(render 3행). M0 옛 판 대비 `array-push-100` render 갱신 1.49×·Profiler 갱신 1.45×, `array-push-remove-100` render 갱신 1.40×, core 갱신 2.44×·2.58×(모두 회귀) | NODE-005·014·051, SETTLE-017·043 / 아이템 지연 실체화를 고르면 NODE-053 | L1 |
| 2 | oneOf 영향 게이트 O(B) (G11 + G5) | P-91 (render P-64~66·81~83·89~91, 코어 P-38~40·54~56) | P-91 1.7195×, +2.23 ms; P-83 +3.29 ms; 코어 P-56 10.6331×, +1.55 ms | `S/utils/compute/childSelection/selectChildren.ts:170-185` → `S/utils/gates/evaluateGate.ts:29` | 준수 | 선형(B) | 높음. M0 옛 판 대비 core 갱신 `oneOf-5`/`10`/`20` 5.92×/7.07×/9.44×, 마운트 3.26×/3.58×/4.28×; render 갱신 1.41×/1.46×/1.53×, 마운트 1.39×/1.47×/1.58×(모두 회귀). 가지 수에 따라 자람 | SETTLE-017·020·050, REACT-019 / 게이트 평가 생략·역색인은 BLUEPRINT-007, 직전 active 출발은 SETTLE-044 — 게이트당 상수만 줄이는 길로 | L1 |
| 3 | 배열 렌더 갱신의 길이 비용 (G12b) | P-96 (P-79, P-80) | P-96 2.1078×, +5.50 ms; P-80 +7.48 ms | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:52-56` | 준수 | M0 render 갱신 벽시계 `array-100`/`500`/`1000` 3.85/3.98/5.17 ms(길이 10배에 1.34×). 옛 판 대비 0.87×/0.25×/0.20×로 새 판이 빠름 | 높음 2·낮음 1(초안). M0 옛 판 대비로는 회귀 아님 — 대장 행(P-96 등)의 근거와 측정 경로가 다름 | REACT-006·028 / 없음 | L1 |
| 4 | 평면·중첩 렌더 갱신의 필드 수 비용 (G12a) | P-78 (P-75, P-76, P-77) | P-78 1.4105×, +9.93 ms; P-76 +6.93 ms | `useChildFields.tsx:52-56`(루트 호스트 재렌더 때 자식 N개 재조정) | 준수 | M0 render 갱신 벽시계 `flat-50`/`100`/`500` 29.6/30.1/39.6 ms, `nested-d3-f4`/`d5-f4` 31.0/33.5 ms | 높음 2·낮음 2(초안). M0 옛 판 대비 `flat-500` 1.36×, `nested-d3-f4` 1.17×, `nested-d5-f4` 1.39×(render 갱신, 회귀) | SETTLE-017, REACT-006 / 없음 | L2 |
| 5 | 잎 쓰기 한 번의 고정비 (G13 + G7) | P-73 (render P-71·72·74·86, 코어 P-45~48·53·60) | P-73 1.5765×, +1.19 ms; 코어 P-60 2.7718×, +0.23 ms | `S/utils/write/writeFieldNode.ts:39` → `S/utils/commit/commitSettlement.ts:32` → `src/core/engine/write/utils/chain/exitFieldNodeChain.ts:27` | 준수 | 상수(폼 크기 기준) | 높음 4·낮음 1 | SETTLE-001·003, REACT-006 / 할 일 없는 단계 건너뛰기는 GOAL-011 범위라 금지 아님, 단계 순서 변경은 금지 | L2 |
| 6 | 고정 fixture 마운트 상수 (G10 + G1) | P-61 (render P-62·63·67~70·87·88·92~94, 코어 P-26~29·41~44) | P-61 1.3986×, +1.55 ms; 코어 P-29 3.1902×, +1.35 ms | `src/core/engine/blueprint/blueprint.ts:22` → `S/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:72` | 준수 | M0 core 마운트 `sample-0`~`3` 0.301/0.388/0.485/1.04 ms | 낮음(잠정). M0 옛 판 대비 core 마운트 1.20×/1.15×/1.38×/1.73×(`sample-1` 제외 회귀), render 마운트 `sample-0` 1.05×(회귀) | GOAL-071, BLUEPRINT-022, REACT-006·019 / 없음 | L2 |
| 7 | 형상 변경 호스트의 자식 전체 재선택 (H3) | P-09 | 미측정 | `S/utils/compute/childSelection/selectChildren.ts:149`, `getDirectChildSelectionPlan.ts:72` | 준수(통제 가능). M0: 정착 한 번의 `selectChildren` 호출이 형제 수와 무관하게 호스트 4·부모 2 — 쓰기 × 형제 수로 곱해지지 않음. 시간의 선형이 어느 단계인지는 미분리 | 선형(형제 1천→8천 Node 8.24×, Bun 10.30×; 계수기 비용 포함) | 옛 판 비교 행 없음(탐침만). 형제 8천에서 쓰기 한 번 Node 43.6 ms, Bun 29.6 ms | SETTLE-017 / 바뀌지 않은 형제 게이트를 읽기 경로 역색인으로 건너뛰면 BLUEPRINT-007 | L1 |
| 8 | 상태 키 결합의 조각 수 이차 (H2) | P-08 (P-01) | 미확인(조각 16·32·64·128 탐침) | `S/utils/controls/getControlLayers.ts:77,103,119`(`includes` 중첩) | 준수 | **이차**: 조각 F=16→128 Node 15.16×, Bun 24.02×, 배가 비 Node 1.85→2.44→3.35, Bun 1.68→3.13→4.55 | 옛 판 비교 행 없음(탐침만). F=128에서 토글 한 번 Node 1.73 ms, Bun 2.25 ms | SETTLE-017 / 없음 | L1 |
| 9 | 크기 계열 코어 마운트의 노드당 상수 (G2 + G3 + G4) | P-34 (P-30~33, P-35~37) | P-34 7.2839×, +29.36 ms; P-37 +27.83 ms; P-32 +9.55 ms | `loadStaticFirstTree.ts:72`, `S/utils/compute/hasRecursiveExpansion.ts:104-108`(cold DFS) | 준수 | 선형 | M0 옛 판 대비 core 마운트 `flat-50`/`100`/`500` 1.77×/1.93×/2.14×, `nested-d3-f4`/`d5-f4` 2.39×/3.03×(회귀). 배열 마운트 `array-100`/`500`/`1000`은 0.88×/0.83×/0.86×로 새 판이 빠름 | GOAL-071, BLUEPRINT-030, WRITE-059 / 배열은 NODE-053 주의 | L2 |
| 10 | 쓰기·배달 경로의 노드당 상수와 할당 (H5) | P-14 (P-05, P-10, P-18) | P-14 배열 통째 쓰기 1천→8천 17.5→100.6 ms | 쓰기·배달 경로의 노드당 상수(이전 이차 몫은 `S/utils/compute/dirtyChildren.ts:19`의 부모 색인으로 고침, 44C-01) | 준수(P-10은 판단 보류) | 선형 | M0 옛 판 대비 core 갱신 `array-replace-200` 2.00×, `array-push-remove-100` 2.58×(회귀). `B5` 쓰기 한 번 Node 14.46 µs, Bun 14.00 µs | SETTLE-042·047 / 아이템 지연 실체화를 고르면 NODE-053 | L2 |
| 11 | 중첩 갱신의 깊이 비용 (G6) | P-51 (P-52) | 코어 P-51 1.5592×, +0.26 ms | `S/utils/dependencies/registerRecalculation.ts:33-39`, `S/utils/scratch/DirtyPathSet.ts:47-66` | 준수 | 선형(D) | M0 옛 판 대비 core 갱신 `nested-d3-f4` 1.76×, `nested-d5-f4` 1.69×(회귀) | SETTLE-001·006·017 / 없음 | L2 |
| 12 | 가드 컴파일·마운트 (H7) | P-16 (P-17, P-20, P-21) | 8→200그룹 5.5→78 ms | 가드 수와 위치별 컴파일에 비례(위치당 컴파일 1회) | 준수 | 선형 | M0 행 없음(가드 행은 M0 행 모음 밖) | ADR 0004, SETTLE-017; 소유자 수용 행(P-16·17) 포함 / 없음 | L2 |
| 13 | 통째 교체·첫 로드의 비교·할당·잔존 힙 (G9 + H6) | P-58 (P-19, P-07, P-02) | 코어 P-58 2.8008×, +5.22 ms | `S/utils/write/writeFieldNode.ts:39`(통째 교체 생성 200개) | 준수 | M0 TEST-071 통째 교체 객체 크기비 4.75에 Node 2.016, Bun 1.884(하한 2.375 아래, P-02와 같은 관측). `B2` Node 1,440 B/노드, Bun 2,110 B/노드 | M0 옛 판 대비 core 갱신 `array-replace-200` 2.00×, 마운트 1.97×(회귀) | SETTLE-047, NODE-051, SETTLE-043 / 없음 | L3 |
| 14 | 정착 내부 중첩 검색 잔여 (H9) | P-135 | 07 fixture에서 도달하지 않음 | `S/utils/transition/withdrawDetachedFills.ts:16-49`(떼어진 채움마다 자동 쓰기 기록 전체에 조상 걷기와 `JSON.parse`) | 준수 | 분석상 O(F·(A·D+L)) | M0 행 모음에 이 경로를 재는 행 없음(07 fixture에서도 도달하지 않음) | SETTLE-005·017 / 없음 | L1 |
| 수용 후보 | 런타임 차이와 측정 절차 (H8) | P-06 (P-11, P-12, P-15) | — | 코드 비용 아님 | 준수 | — | — | 코드 작업 없음, 측정과 소유자 수용 | 수용 후보(L4) |

### 가설별 피해야 할 길

- 0 P-25: 시험 기대값을 바꾸는 길(동작 변경)과 정착 단계 순서 변경(SETTLE-001). 되살림의 비교 기준만 직전 커밋 값으로 바꾼다.
- 1 G8: 아이템 노드의 지연 실체화(NODE-053), 배열 동사의 공개 겉면 변경, 시험 기대값 변경.
- 2 oneOf 영향 게이트: 게이트 평가 생략과 읽기 경로 역색인(BLUEPRINT-007, ADR 0005의 기각), 직전 커밋의 active에서 이어 출발하는 정착(SETTLE-044), 정착 단계 순서 변경(SETTLE-001). 게이트당 상수만 줄인다.
- 3 배열 렌더 갱신: 아이템 노드의 지연 실체화(NODE-053), `FieldInputProps`의 `ChildFields` 같은 공개 겉면을 줄이거나 바꾸는 것.
- 4 평면·중첩 렌더 갱신: 공개 겉면 변경, 시험 기대값 변경.
- 5 잎 쓰기 고정비: 정착 단계 순서 변경(SETTLE-001)과 직전 active 출발(SETTLE-044). 할 일이 없는 단계를 건너뛰는 것은 GOAL-011 범위라 허용된다.
- 6 고정 fixture 마운트 상수: 아이템 노드의 지연 실체화(NODE-053), 공개 겉면 변경.
- 7 P-09: 바뀌지 않은 형제 게이트를 읽기 경로 역색인으로 건너뛰는 것(BLUEPRINT-007), 직전 active 출발(SETTLE-044).
- 8 P-08: 선언 소속을 청사진당 한 번 색인하는 것은 구조 색인이라 허용된다(SETTLE-017은 controls 식과 watch 경로의 역의존 표를 청사진이 정적으로 만든다고 정함; ADR 0005의 역색인 기각은 검증기 if 게이트의 건너뛰기에만 해당 — 원장 관리자 확인). 금지는 BLUEPRINT-007대로 게이트가 읽는 것을 뽑아 게이트 평가 자체를 건너뛰는 것이다. 정착 단계 순서 변경도 피한다.
- 9 크기 계열 코어 마운트: 배열 아이템의 지연 실체화(NODE-053), 정착 단계 순서 변경.
- 10 P-14: 아이템 노드의 지연 실체화(NODE-053).
- 11 P-51: 정착 단계 순서 변경(SETTLE-001).
- 12 P-16: 공개 겉면 변경, 시험 기대값 변경. 위치당 컴파일 1회(SETTLE-017)는 유지한다.
- 13 P-58 + P-19: 아이템 노드의 지연 실체화(NODE-053), 같은 값 같은 참조 규칙을 깨는 할당 줄이기(SETTLE-043).
- 14 P-135: 정착 단계 순서 변경.

분류 제외(문제로 다루지 않음): G14 재측정 기준 통과 4행(P-49·50·95·97), G15 패키지 벤치 기록 34행(P-99~P-132), G16 배포 번들 2행(P-133·134, 84라운드 수용), 해결 또는 구조 수정 완료 4행(P-22·24·136·137).

## 부록

> **결정 전 분석 기록.** 아래 부록 A·B는 M0 수치가 나오기 전에 쓴 행별 분류 원문이다. 그 안의 "M0 대기"·"M0 탐침 대기" 칸과 "판단 보류" 절은 그때의 기록으로 그대로 둔다. 결론은 위 표다.

아래 두 부분은 에이전트 둘이 쓴 행별 분류 원문이다. 위 요약과 다르면 위 요약이 이 초안의 결론이다. 행별 표의 G8 다섯 행과 P-09의 계약 칸은 편집자 결정 1·2에 맞춰 고쳤다. 부록 안의 "판단 보류와 근거 부족" 절과 집계 문장은 결정 전의 분석 기록으로 남긴다.


---

## 부록 A. M1 분류 초안 — 코어 엔진 행(03–06, 82C)

기준: 작업 트리 `/tmp/claude-501/stage-08-audit`, c59ba1363. 경로는 `packages/canard/schema-form` 기준이며 `S/`는 `src/core/engine/settle/utils/`, `PI`는 `architecture/verification/performance-issues.md`를 줄인 표기입니다.

범위 메모: P-01–P-25 가운데 P-03·P-13·P-23은 "## 열림"에 행이 없습니다(해결 R-17·R-18·R-22, `PI:163,173-174,156`). 그래서 대상은 P-01–P-25의 22행과 P-135·P-136·P-137을 합한 25행입니다.

| ID | 대장 상태 | 계약 | 근거(현행 path:line) | 차수 | 체감 가중 | 위험(원장 ID / 금지 축) | 묶음 | 가설 묶음(대표 행) | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P-01 | 소유자 수용 | 준수 | `S/compute/publishStateKeys.ts:17-18`: 상태 키를 선언한 노드가 하나도 없으면 단계 전체를 건너뜁니다. 선언한 폼에서는 `S/controls/calculateStateKeys.ts:69-82`의 청사진 색인으로 후보를 거릅니다 | M0 탐침 대기 | M0 대기 | CONTROLS-045, SETTLE-001(건너뛰기만 하므로 순서 변경 아님) | L2 | H2 상태 키 단계(P-08) | 수용된 행입니다. 대장의 후보인 "controls 없음" 표지 캐시는 65C-01 C6과 65C-02로 이미 코드에 들어가 있습니다. 따라서 L2의 이 가설은 M0에서 다시 재어 남은 몫이 있는지부터 확인해야 합니다. |
| P-02 | 소유자 수용 | 준수 | 통째 교체는 SETTLE-047이 허용하는 닿은 하위 트리 1회 순회이고, 객체 키 열거는 그 범위 안의 비용입니다 | 선형(하한 아래, 크기비 대비 2.020×; `architecture/verification/04-derive-and-controls/performance.md:23`) | M0 대기 | SETTLE-047, SETTLE-042 | L3 | H6 비교·할당·메모리(P-19) | 수용된 행이므로 짧게 둡니다. |
| P-04 | 소유자 수용 | 위반 | `S/latentStore/getLatentOrder.ts:20-32`: 조상마다 청사진 `childEntries` 전체를 `findIndex`하고, 정확히 맞지 않으면 한 번 더 훑습니다. 호출 자리는 나간 노드마다(`S/transition/applyExitClearing.ts:30`, `S/transition/finalizeExits.ts:103`), 잠복 쓰기마다(`S/write/writeFieldNode.ts:94`), 분배 자식마다(`S/compute/childSelection/selectChildren.ts:417`)입니다 | 이차(1천/2천/4천 37/131/486 ms; `architecture/plan/06-array/log.md:141`, `architecture/verification/03-node-and-settle/performance.md:106`) | M0 대기 | NODE-044(잠복 원본 (경로, 종류)). 정적 색인만 더하는 수정이라 원장 결정 문장에는 닿지 않을 것으로 봅니다 | L1 | H1 템플릿 자식 순서 선형 탐색(P-04) | 훑는 집합은 나간 하위 트리가 아니라 각 조상이 선언한 형제 항목 전체이므로 SETTLE-017의 범위 밖입니다. 나감이 하나뿐이어도 비용은 형제 수에 비례하고, 형제가 모두 나가는 집단 나감에서는 S²가 됩니다. 소유자의 수용(2026-09-30)은 48C-01(`architecture/ledger/settle.md` SETTLE-017 보충)이 바로 이 원인에 한정한다고 적었으므로 다시 열지 않습니다. 같은 꼴의 선형 탐색이 대장에 없는 자리에도 있습니다: `S/latent/distributeLatentValue.ts:108-110`(키마다 `findIndex`)와 `:47-48`(쓴 경로마다 형제 전체를 도는 `clearOtherKinds`). |
| P-05 | 소유자 수용 | 준수 | `S/input/markWrite.ts:129`: 호스트 쓰기마다 분배 기록 객체를 하나 할당합니다. 쓰기 수에 대해 상수 몫입니다 | M0 탐침 대기 | M0 대기 | NODE-044, VALUE-017 | L3 | H5 쓰기 경로의 노드당 상수(P-14) | 수용된 행입니다. |
| P-06 | 소유자 수용 | 준수(순회 비용이 아님) | 런타임 차이(JSC)이며 결정할 루프가 없습니다 | M0 탐침 대기 | M0 대기 | 없음 | L4 | H8 런타임·측정(P-06) | 수용된 행입니다. |
| P-07 | 소유자 수용 | 준수 | 노드마다 잔존하는 바이트 수이고 순회가 아닙니다 | M0 탐침 대기 | M0 대기 | NODE-018 | L3 | H6(P-19) | 수용된 행입니다. |
| P-08 | 미확인 | 준수 | 도는 집합: 후보는 `stateDirtyNodes`(재계산 목록, `S/compute/computeNode.ts:49`)와 청사진 상태 키 색인의 교집합에, 의존 소유자·형상 변경 호스트가 지정한 직계 자식을 더한 것입니다(`S/controls/calculateStateKeys.ts:82-94`, `S/compute/publishStateKeys.ts:23-26`, 소유자는 `S/dependencies/registerRecalculation.ts:27`). 대상 하나마다 `S/controls/getControlLayers.ts:77`·`:103`(선언마다 `includes`)과 `:115-131`(조각 선언마다 자기 선언 × `includes`) 때문에 O(F²)입니다. 식 조회는 이미 Map입니다(`src/core/engine/utils/controls/getControlExpression.ts:27-44`) | M0 탐침 대기 | M0 대기 | CONTROLS-073, SCHEMA-010, LANDING-066(결합은 순서와 무관하므로 Set이나 Map으로 바꿔도 뜻이 바뀌지 않음) | L1 | H2 상태 키 단계(P-08) | 집합은 SETTLE-017 범위 안에 있습니다. 배열 와일드카드 대상은 아이템 전체로 넓어지지만, 그 아이템들의 상태가 바뀐 식에 실제로 기대므로 변경의 크기에 해당합니다. 남은 F²는 조각 수에 예측 가능하게 자라는 비용이라 준수입니다. 대장의 원인 가운데 "식 탐색"은 R-07 뒤로 사라졌고, 남은 원인은 `includes` 중첩입니다. 같은 함수가 나감 경로(`S/commit/commitExitPolicyValues.ts:99`, `S/transition/captureLatentDescendants.ts:103`)에서도 자식마다 불리므로 F²가 그곳에서도 곱해집니다. |
| P-09 | 미측정 | 준수(통제 가능; 편집자 결정 2: 정착 한 번에 호스트당 한 번이어야 하고 쓰기 × 형제 수면 위반) | `S/dependencies/registerRecalculation.ts:53-63`: 자기 선언 게이트가 바뀐 값을 읽으면 부모를 형상 변경으로 표시합니다. 그러면 `S/compute/computeNode.ts:152-161`의 바퀴마다 `S/compute/childSelection/selectChildren.ts:149`이 부모의 자식 항목 전체를 돕니다(직접 계획 `getDirectChildSelectionPlan.ts:72`도 `childEntries` 전체를 담습니다) | M0 탐침 대기 | M0 대기 | SETTLE-017, BLUEPRINT-007. 금지 축 근접: 바뀌지 않은 형제 게이트를 읽기 경로 역색인으로 건너뛰는 수정은 금지 후보 2(ADR 0005의 기각)에 닿습니다 | L2 | H3 게이트 호스트 형상 재선택(P-09) | 쓰기 한 번마다 O(형제 수 × 바퀴 수)가 드는 것은 확인했습니다. |
| P-10 | 미확인 | 판단 보류 | 원인이 분리되지 않았습니다(`49ad47e13`~`439c491c5` 사이를 이분해야 함) | M0 탐침 대기 | M0 대기 | 미정 | L2 | H5(P-14) | 상수 µs로 보이지만 N에 따라 자라는지는 기록이 없습니다. |
| P-11 | 측정 과제 | 준수(코드 비용이 아님) | 측정 환경의 문제입니다 | M0 탐침 대기 | M0 대기 | 없음 | L4 | H8(P-06) | 측정 과제이므로 짧게 둡니다. |
| P-12 | 측정 과제 | 준수(코드 비용이 아님) | 측정 범위의 문제입니다 | M0 탐침 대기 | M0 대기 | 없음 | L4 | H8(P-06) | 측정 과제이므로 짧게 둡니다. |
| P-14 | 소유자 수용(PR-5) | 준수 | 루트 통째 쓰기는 SETTLE-047이 허용합니다. 이전의 이차 몫은 `S/compute/dirtyChildren.ts:19`의 부모 색인으로 고쳐졌습니다(44C-01) | 선형(배열 통째 쓰기 1천/2천/4천/8천 17.5/22.3/40.7/100.6 ms; `architecture/verification/06-array/performance.md:279`) | M0 대기 | SETTLE-042, SETTLE-047. 금지 축 주의: 아이템 지연 실체화(NODE-053)가 후보로 떠오르기 쉽습니다 | L2 | H5 쓰기 경로의 노드당 상수(P-14) | 수용된 행입니다. 개선은 07 뒤의 성능 작업으로 넘겨져 있습니다. |
| P-15 | 소유자 수용 대기 | 준수(실행 간 퍼짐이고 순회 비용이 아님) | `bench/node-and-settle.bench.ts`의 잠복 행이며, 재실행에서 재현되지 않았습니다 | M0 탐침 대기 | M0 대기 | 없음 | L4 | H8(P-06) | 통계 판정이 남아 있습니다. |
| P-16 | 소유자 수용 | 준수 | 가드 수와 위치별 컴파일에 비례합니다(규칙상 준수) | 선형(8→200그룹에서 5.5→78 ms; `PI:30`의 P-20 행) | M0 대기 | ADR 0004, SETTLE-017(위치당 컴파일 1회) | L2 | H7 가드 컴파일·마운트(P-16) | 수용된 행입니다. 56라운드 우선 항목입니다. |
| P-17 | 소유자 수용 | 준수 | 그룹 수에 비례합니다(`PI:27`) | 선형(위와 같은 근거, `PI:30`) | M0 대기 | ADR 0004 | L2 | H7(P-16) | 수용된 행입니다. |
| P-18 | 소유자 수용 | 준수 | `S/commit/markCommitDeliveries.ts:90-92`: 배달 후보는 바뀐 노드·생긴 노드·상태 키 계산 노드뿐이며, 바뀐 노드 수에 비례합니다 | M0 탐침 대기 | M0 대기 | EVENT-005, EVENT-006 | L2 | H5(P-14) | 수용된 행입니다. |
| P-19 | 소유자 수용 | 준수 | 첫 로드의 트리 전체 순회는 SETTLE-017이 허용합니다 | M0 탐침 대기 | M0 대기 | NODE-018, GOAL-071 | L3 | H6 비교·할당·메모리(P-19) | 수용된 행입니다. Bun 잔존 메모리가 56라운드 우선 항목입니다. |
| P-20 | 반영(잔여는 P-16·P-17) | 준수 | ajv8 플러그인의 직접 컴파일이 기본으로 켜져 있습니다(`e623395c8`) | M0 탐침 대기 | M0 대기 | ADR 0004 | L2 | H7(P-16) | 반영된 행입니다. |
| P-21 | 측정 과제 | 준수 | 회전 상한 64가 적정한지의 문제입니다(ajv7·ajv8 `registerSchemaRoot.ts`) | M0 탐침 대기 | M0 대기 | 없음 | L3 | H7(P-16) | 측정 과제입니다. |
| P-22 | 해결(82C-01) | 준수 | `S/dependencies/getDependencyIndex.ts:158-167`: `ownerPaths` Set으로 중복을 확인합니다 | 해결(owner 중복 검사 2207→0; `PI:32`) | M0 대기 | 없음 | L1 | H9 정착 내부 중첩 검색(P-135) | 해결된 행입니다. |
| P-24 | 해결(82C-01) | 준수 | `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:30-67`: 재계산된 자식만 패치하며, 허용된 얕은 복사 O(keys)는 남아 있습니다 | 해결(flat-500 0.716957→0.027915 ms; `PI:33`) | M0 대기 | SETTLE-042 | L1 | H9(P-135) | 해결된 행입니다. |
| P-25 | 열림(수용 대상 아님) | 위반(같은 참조 규칙. 순회 범위 기준이 아님) | 아래 "P-25 상세"를 보십시오 | 해당 없음(비용 행이 아님) | M0 대기 | SETTLE-043 (나), GOAL-011 "같은 값을 두 번 읽으면 같은 참조", EVENT-006. 금지 축 아님(기존 시험이 이미 원하는 동작을 단언하므로 기대값을 바꿀 필요가 없음) | L3 | H4 커밋 되살림 기준(P-25) | 07 탐침(`architecture/verification/07-switch/u9-e2e-group-b.md:94-96`)은 대장의 재현과 다른 경로였고, 해결을 주장하지 않았습니다. |
| P-135 | 열린 행(수용 대상 아님) | 준수 | `S/transition/withdrawDetachedFills.ts:16-49`: 떼어진 채움 노드마다 `automaticLog` 전체에 조상 걷기(`:19-22`)를 하고 `latentAutomaticLog` 전체에 `JSON.parse`(`:31-32`)를 합니다. 모두 이번 정착의 자동 쓰기 기록이므로 범위 안입니다 | M0 탐침 대기(분석상 O(F·(A·D+L)); `architecture/verification/07-switch/residual-breakdown.md:218`, 07 fixture에서는 도달하지 않음) | M0 대기 | SETTLE-017(원본 B 되돌림 기록), SETTLE-005 | L1 | H9 정착 내부 중첩 검색(P-135) | 범위 안 집합끼리의 곱이라 이차이지만 계약 기준으로는 준수입니다. 범위 밖 노드를 훑는 몫은 없습니다. |
| P-136 | 구조 수정 완료 | 준수 | `S/transition/transitionSettlement.ts:96-97`: `default`가 있을 때만 `isMissingRaw`를 부르며, 재귀(`S/transition/isMissingRaw.ts:19`)는 생긴 하위 트리 안에서만 돕니다 | 해결(방문 313/7737→64/1024; `architecture/verification/07-switch/residual-breakdown.md:15`) | M0 대기 | SETTLE-005 | L1 | H9(P-135) | 남은 몫은 생긴 노드의 채움이라 허용됩니다. |
| P-137 | 구조 수정 완료 | 준수 | `S/scratch/DirtyPathSet.ts:24-45,47-64`: 게이트 없는 경로는 고유 접두사를 한 번만 색인합니다. 게이트 있는 경로(`:66-82`)는 여전히 쓰기마다 접두사 전체를 색인하므로 잎 하나에 O(D²)가 듭니다 | 해결(index peak 10/136/2080→4/16/64; `architecture/verification/07-switch/residual-breakdown.md:220`) | M0 대기 | SETTLE-006(순서) | L1 | H9(P-135) | 게이트 있는 폼의 O(D²)가 남지만, 재계산 목록인 조상 사슬의 크기로 정해지므로 준수입니다. |

## P-25 상세 — "같은 참조 규칙 위반"이 코드에서 뜻하는 것

- 규칙: GOAL-011은 "같은 값을 두 번 읽으면 같은 참조다"이고, SETTLE-043 (나)는 커밋 단계에서 내용이 직전 커밋과 같으면 직전 참조를 둔다는 것입니다.
- 직전 커밋 기준은 레코드에 있습니다. `src/core/engine/record/utils/captureFieldNodeChange.ts:37-41`이 정착에서 처음 바뀔 때 `deliveryPreviousLocal`·`deliveryPreviousEmit`를 잡습니다.
- 그런데 되살림은 이 기준과 비교하지 않습니다.
  - `S/output/updateOutput.ts:44`는 `sameValue(node.local, assembled)`로 비교합니다. 여기서 `node.local`은 같은 정착 앞 라운드에서 이미 중간 값으로 덮인 값입니다.
  - `:53-58`의 `emit`도 같은 방식으로 `node.emit`과 비교합니다.
  - `S/compute/computeNode.ts:76-82`의 `previous`는 이번 계산에 들어올 때의 값이고, 이것을 `S/compute/preserveReferences.ts:28-31`이 되살립니다.
  - 게이트 없는 경로(`S/compute/computeNode.ts:61-72`)는 `preserveReferences`를 아예 부르지 않습니다.
- 그 결과는 이렇습니다. 객체 호스트가 중간 값을 거쳐 원래 내용으로 돌아오면 새 객체 참조가 남습니다. 배달은 참조로 판정하므로(`S/commit/markCommitDeliveries.ts:177`, `S/commit/utils/isSameDeliveryValue.ts:11`) 가짜 UpdateValue와 watch가 나갑니다.
- 고치는 길은 직전 커밋 기준(`deliveryPreviousLocal`·`deliveryPreviousEmit`)과 구조 비교를 해서 같으면 그 참조를 되살리는 것입니다. 바뀐 객체 호스트마다 O(폭)의 구조 비교가 더해지며, 이 비용은 PR 본문에 적어야 합니다. 배달 자리에 깊은 비교를 넣는 길은 67C-01이 막았습니다.
- 계약 칸을 "위반"으로 둔 근거는 순회 비용이 아니라 참조 규칙입니다. 순회 범위 기준(SETTLE-017·047)으로 보면 해당하지 않습니다.

## 가설 묶음

| 묶음 | 대표 행 | 구성 | 공통 원인 |
| --- | --- | --- | --- |
| H1 | P-04 | P-04, 대장에 없는 `distributeLatentValue.ts:47-48,108-110` | 청사진 템플릿에 자식 이름·순서 색인이 없어 형제 목록을 선형으로 찾음 |
| H2 | P-08 | P-08, P-01 | 상태 키 단계: 선언 목록 `includes` 중첩(P-01의 건너뛰기는 이미 구현됨) |
| H3 | P-09 | P-09 | 형상 변경 호스트가 자식 항목 전체를 다시 선택함 |
| H4 | P-25 | P-25 | 되살림 기준이 직전 커밋이 아니라 계산 시점 값임 |
| H5 | P-14 | P-14, P-18, P-10, P-05 | 쓰기·배달 경로의 노드당 상수와 할당 |
| H6 | P-19 | P-19, P-07, P-02 | 첫 로드·잔존 힙·통째 교체 비교와 열거 |
| H7 | P-16 | P-16, P-17, P-20, P-21 | 가드 컴파일·마운트 |
| H8 | P-06 | P-06, P-11, P-12, P-15 | 런타임 차이와 측정 절차 |
| H9 | P-135 | P-135(열림), P-22·P-24·P-136·P-137(해결 또는 구조 수정 완료) | 정착 내부 기록을 중첩으로 선형 검색함 |

## 판단 보류와 근거 부족

- **P-09**: 형상 변경 부모가 바퀴마다 자식 항목 전체 O(S)를 도는 것은 코드로 확인했습니다(`S/compute/childSelection/selectChildren.ts:149`, `S/compute/childSelection/getDirectChildSelectionPlan.ts:72`).
  - 부족한 것: 재계산 목록에 든 호스트가 자기 자식 항목 전체를 다시 선택하는 일이 SETTLE-017의 "순회"에 드는지에 대한 원장 문장이 없습니다.
  - 선례는 엇갈립니다. P-24(82C-01에서 해결)는 패치 밖 형제 순회를 위반으로 보았고, 65C-01 C1은 정적 호스트 형상 재선택을 "상수 몫"으로 분류했습니다.
  - 기울기는 위반 쪽입니다. 바뀐 것은 게이트 하나인데 형제 전체를 다시 봅니다.
  - 원장 관리자의 해석이 필요합니다. 또 게이트 L 메모(`S/gates/getGateRegistry.ts`)가 바뀌지 않은 형제 게이트를 O(1)로 만드는지 M0 계수로 확인해야 합니다.
- **P-10**: 원인 커밋이 이분되지 않았고, 비용을 결정하는 루프가 특정되지 않았습니다.
  - 부족한 것: `49ad47e13`~`439c491c5` 사이의 커밋별 측정(대장의 후속 후보)과 N 배율입니다.

---

## 부록 B. M1 분류 초안 — 07 U13 행 (P-26~P-134, 109행)

작업 트리는 `/tmp/claude-501/stage-08-audit`(c59ba1363, 353라운드)이며 경로는 `packages/canard/schema-form/` 기준이다. 빌드·시험·벤치는 돌리지 않았고 기록과 코드만 읽었다.

## 먼저 알릴 것

- 이 행들의 근거 수치는 82C·83C 시점(U13 동등 벤치와 82C React 최종 측정)이다. 같은 시나리오의 더 새 공식 표가 이미 있다: 코어는 136j(`verification/07-switch/performance.md:147-330`), React는 136k(`performance.md:342-617`). 새 표에는 104·108·110·142·157라운드 소유자 수용이 행마다 적혀 있으나 대장 "열림"의 상태 칸은 여전히 "소유자 묶음 — 미수용" 또는 "수용 대기"다. 원장 관리자가 대장 상태를 새 표와 맞출지 판단해야 한다. 이 초안은 대장 상태를 바꾸지 않았다.
- 코어 마운트 행(G1~G4)이 잰 경로는 지금 코드와 다르다. 82C 뒤에 분기·식·파생·감시·상태·의존이 없는 청사진은 정적 첫 로드로 가게 되었고(`src/core/engine/blueprint/blueprint.ts:127-136`, 89C-04), 파생 없는 청사진은 파생 규칙 표를 즉시 비운다(`src/core/engine/derive/utils/rules/getDeriveRuleTable.ts:49`). M0가 현행 기준선을 다시 잡기 전에는 G1~G4의 L2 작업 크기를 이 수치로 예측하면 안 된다.
- 위반으로 판정한 행은 없다. 판단 보류는 배열 구조 동사 묶음(G8) 다섯 행이다.

## 근거 색인 (현행 path:line)

| 키 | 위치 | 무엇을 정하는가 |
| --- | --- | --- |
| E1 | `src/core/engine/settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts:23-24`, `src/core/engine/blueprint/blueprint.ts:127-136`, `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:72` | 마운트는 로드다. 자격 있는 청사진은 스택 한 번 순회의 정적 첫 로드, 그 밖은 `writeFieldNode(root, value, 'load')`. SETTLE-017 "트리 전체 순회는 로드에서만 허용"의 안이다. |
| E2 | `src/core/engine/settle/utils/compute/hasRecursiveExpansion.ts:12,21-39,104-108` | 템플릿 순환 판정 DFS는 청사진당 한 번(WeakMap 메모)이며 O(V+E)다. 로드 상수 비용이다. |
| E3 | `src/core/engine/derive/utils/rules/getDeriveRuleTable.ts:49-62`, `src/core/engine/settle/utils/controls/getControlLayers.ts:61-74`, `src/core/engine/settle/utils/transition/readDefault.ts:16-22` | 선언 읽기는 노드와 직계 부모 선언까지이며 노드 수에 선형이다. 파생 없는 청사진은 표 생성을 건너뛴다. |
| E4 | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:149,163,170-185`, `src/core/engine/settle/utils/gates/evaluateGate.ts:29`, `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:83-126` | 호스트의 자식 항목마다 선언의 게이트를 모두 평가한다(SETTLE-020, BLUEPRINT-007). 비용은 영향 게이트 수 B에 비례하며 이는 TEST-027의 "통제 가능"이다. |
| E5 | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:21-31,33-39` | 재계산 목록은 바뀐 경로, 역의존 소유자, 그 조상뿐이다. 조상은 `expanded` 집합으로 한 번씩만 오른다. SETTLE-017의 범위 그대로다. |
| E6 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:24-35,47-66` | 비게이트 정착에서 직접 에지만 보관해 깊이 D에 선형으로 색인한다(82C 수정, residual-breakdown.md:16-17). |
| E7 | `src/core/engine/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts:28-32`, `src/core/engine/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts:12`, `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:133-135`, `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:36`, `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/canApplyArrayTail.ts:17-29`, `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:63-70` | push·remove 한 번마다 기존 길이만큼의 칸 계획을 만들고, 기존 아이템 노드마다 `host.structure[index]`를 확인하고, 접두 부분을 복사한다. 재계산 목록 밖의 기존 아이템 수에 비례한다. |
| E8 | `src/core/surface/utils/binding/writeFieldNodeInput.ts:13` → `src/core/engine/settle/utils/write/writeFieldNode.ts:39` | 통째 교체 쓰기는 쓰기가 닿은 하위 트리를 한 번 돈다(SETTLE-047). 생긴 노드의 채움은 허용 범위다. |

체감 가중의 잠정 규칙: 렌더·프로파일러 행은 82C 배율이 1.4× 이상이거나 82C 측정 묶음의 절대 차이가 5 ms 이상이면 높음, 그 밖은 낮음이다. 출처는 각 행의 대장 근거(82C 최종 측정, `performance.md`)다. 136k 공식 React 표의 값은 비고에 대조로만 적었다. 코어 전용 행은 계획의 규칙대로 "M0 대기"다.

## 가설 묶음

| 체감 순위 | 묶음 | 대표 행 | 체감 순위 근거(대표 배율, 절대 차이) | 구성 행 | 공유 원인 가설 | 추정 원인 코드 경로(현행 path:line) | 계약 | 차수 | 체감 | 위험 | 묶음(L) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | G8 배열 구조 동사(push·remove)의 동사당 길이 비용 | P-85 | P-85 1.5301×, +402.80 ms (P-84 1.4959×, +188.35 ms; 코어 P-57 4.8478×, +94.70 ms) | P-57, P-59, P-84, P-85, P-98 (5) | 동사 한 번마다 기존 길이에 비례하는 칸 계획·노드 확인·접두 사본. 동사 100회 누적이면 총합이 길이 제곱에 가깝게 자랄 수 있다. | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/canApplyArrayTail.ts:17-29`(push마다 기존 아이템 노드 확인 루프)와 `src/core/engine/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts:12`(칸 계획), React 쪽은 `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:52-56`(children 배열이 바뀔 때마다 자식 N개 재구성) | 위반 후보(편집자 결정 1) | M0 탐침 대기 | 렌더 행 높음 3(P-84, P-85, P-98), 코어 행 M0 대기 | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 |
| 2 | G11 oneOf 렌더·프로파일러 | P-91 | P-91 1.7195×, +2.23 ms (P-83 1.5295×, +3.29 ms; P-66 1.5719×, +2.95 ms) | P-64, P-65, P-66, P-81, P-82, P-83, P-89, P-90, P-91 (9) | G5의 O(B) 게이트 비용과 분기 렌더가 React 경로에 그대로 보인다. | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:170-185`(선언마다 게이트 루프) → `src/core/engine/settle/utils/gates/evaluateGate.ts:29` | 준수 | 선형(B) (performance-issues.md:73-75) | 높음(잠정) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 |
| 3 | G12a 평면·중첩 렌더 갱신 | P-78 | P-78 1.4105×, +9.93 ms (P-76 1.2362×, +6.93 ms) | P-75, P-76, P-77, P-78 (4) | 코어 잎 쓰기 10회(G6·G7)에 React 갱신 층. flat-100→500에서 새 판이 6.1 ms, 옛 판이 3.2 ms 자라 React 층이 필드 수에 따라 자라는 몫이 있다. | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:52-56`(루트 호스트 재렌더 때 자식 N개 요소 재조정; 코어 잎 쓰기는 상수) | 준수 | M0 탐침 대기(2점만) | 행마다(높음 2·낮음 2) | SETTLE-017, REACT-006 / 금지 축 없음 | L2 |
| 4 | G12b 배열 크기 계열 렌더 갱신 | P-96 | P-96 2.1078×, +5.50 ms (P-80 1.5552×, +7.48 ms) | P-79, P-80, P-96 (3) | 코어 잎 쓰기는 길이에 무관하나 React 층(목록 재렌더·비교)이 길이에 따라 자랐다. 136k에서는 옛 판보다 빠르다. | `src/components/FieldProxy/components/FieldInputSlot/hooks/useChildFields.tsx:52-56`(배열 호스트 재렌더 때 아이템 N개 요소 재조정; 코어 잎 쓰기는 상수) | 준수 | M0 탐침 대기(2점만) | 행마다(높음 2·낮음 1) | REACT-006, REACT-028 / 금지 축 없음 | L1 |
| 5 | G13 고정 fixture 렌더 갱신 | P-73 | P-73 1.5765×, +1.19 ms | P-71, P-72, P-73, P-74, P-86 (5) | G7의 잎 쓰기 고정비에 React 갱신 층. 136k에서는 차이가 거의 사라졌다. | `src/core/engine/settle/utils/write/writeFieldNode.ts:39` → `src/core/engine/settle/utils/commit/commitSettlement.ts:32` → `src/core/engine/write/utils/chain/exitFieldNodeChain.ts:27`(단계 연결·커밋·배달의 고정비, 프로파일 없는 추정) | 준수 | M0 탐침 대기 | 행마다(높음 4·낮음 1) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 |
| 6 | G10 고정 fixture 렌더·프로파일러 마운트 | P-61 | P-61 1.3986×, +1.55 ms | P-61, P-62, P-63, P-67, P-68, P-69, P-70, P-87, P-88, P-92, P-93, P-94 (12) | G1의 코어 마운트 상수에 React 마운트 층이 더해진 것. | `src/core/engine/blueprint/blueprint.ts:22`(청사진 분석의 첫 비용) 뒤 `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:72` | 준수 | M0 탐침 대기 | 낮음(잠정) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 |
| 7 | G5 oneOf 영향 게이트 O(B) — 코어 | P-56 | 코어 P-56 10.6331×, +1.55 ms | P-38, P-39, P-40, P-54, P-55, P-56 (6) | 영향 게이트 B개의 평가와 후보 선언 순회가 필수 O(B)이고 게이트당 상수가 옛 판보다 크다. 옛 판 분모는 거의 일정하다. | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:170-185` → `src/core/engine/settle/utils/gates/evaluateGate.ts:29` | 준수 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 |
| 8 | G3 중첩 크기 계열 코어 마운트 | P-34 | 코어 P-34 7.2839×, +29.36 ms | P-33, P-34 (2) | 노드당 기울기 차이(0.023213 대 0.002957 ms/노드)와 cold 순환 판정 DFS의 상수, 경로 바이트 길이 비용. | `src/core/engine/settle/utils/compute/hasRecursiveExpansion.ts:104-108`(cold DFS)와 로드 순회 `loadStaticFirstTree.ts:72` | 준수 | 선형(잠정, 2점 보간 — residual-breakdown.md:30) | M0 대기 | BLUEPRINT-030, SETTLE-017 / 금지 축 없음 | L2 |
| 9 | G2 평면 크기 계열 코어 마운트 | P-32 | 코어 P-32 4.8030×, +9.55 ms | P-30, P-31, P-32 (3) | 새 판 고정비 2.374929 ms와 필드당 기울기 0.019437 ms가 옛 판(0.641103 + 0.003750S)보다 크다. 주요 단계 Q는 1 아래이고 이차 구조의 증거는 없다. | `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:72`(현행 로드 순회; 82C가 잰 것은 `writeFieldNode.ts:39` load 경로) | 준수 | 선형 (residual-breakdown.md:29) | M0 대기 | GOAL-071, SETTLE-017(89C-04), CONTROLS-045 / 금지 축 없음 | L2 |
| 10 | G4 배열 크기 계열 코어 마운트 | P-37 | 코어 P-37 3.3404×, +27.83 ms | P-35, P-36, P-37 (3) | 아이템 생성의 노드당 상수 비용. 136j에서는 이미 옛 판보다 빠르다. | `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:72`(아이템 생성 순회) | 준수 | 선형 (performance-issues.md:44-46) | M0 대기 | WRITE-059 / 금지 축 주의: NODE-053(아이템 지연 실체화) | L2 |
| 11 | G1 고정 fixture 코어 마운트 | P-29 | 코어 P-29 3.1902×, +1.35 ms | P-26, P-27, P-28, P-29, P-41, P-42, P-43, P-44 (8) | 청사진 분석의 첫 비용과 생성·첫 정착의 노드당 상수(136j 108라운드 수용 사유와 같음). 고정 fixture라 크기 성장 정보가 없다. | `src/core/engine/blueprint/blueprint.ts:22`(청사진 분석의 첫 비용) | 준수 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 |
| 12 | G9 배열 통째 교체 — 코어 | P-58 | 코어 P-58 2.8008×, +5.22 ms | P-58 (1) | 200개 아이템을 한 번에 만드는 통째 교체의 생성·비교·할당 비용. | `src/core/engine/settle/utils/write/writeFieldNode.ts:39`(통째 교체; 생성 200개) | 준수 | M0 탐침 대기 | M0 대기 | SETTLE-047, NODE-051, SETTLE-043 / 금지 축 없음 | L3 |
| 13 | G7 잎 쓰기 한 번의 고정 비용 — 코어 | P-60 | 코어 P-60 2.7718×, +0.23 ms | P-45, P-46, P-47, P-48, P-53, P-60 (6) | 잎 쓰기 한 번의 정착 단계 연결·커밋·배달 고정비. 폼 크기와 무관하다. | `src/core/engine/settle/utils/write/writeFieldNode.ts:39` → `commitSettlement.ts:32` → `exitFieldNodeChain.ts:27` | 준수 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 |
| 14 | G6 중첩 갱신의 깊이 D 비용 — 코어 | P-51 | 코어 P-51 1.5592×, +0.26 ms | P-51, P-52 (2) | 쓰기 경로 조상 D개 등록과 경로 문자열 slice·해시. O(D²) 색인은 82C에 없앴다. | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:33-39`와 `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:47-66` | 준수 | 선형(D) (residual-breakdown.md:17) | M0 대기 | SETTLE-017, SETTLE-001, SETTLE-006 / 금지 축 없음 | L2 |
| — | G14 재측정 기준 통과 | P-50 | — | P-49, P-50, P-95, P-97 (4) | 같은 BF 재측정에서 TEST-027 회귀 판정이 성립하지 않은 행. | — | 분류 제외 | — | — | — | — |
| — | G15 패키지 벤치 기록 | P-102 | — | P-99, P-100, P-101, P-102, P-103, P-104, P-105, P-106, P-107, P-108, P-109, P-110, P-111, P-112, P-113, P-114, P-115, P-116, P-117, P-118, P-119, P-120, P-121, P-122, P-123, P-124, P-125, P-126, P-127, P-128, P-129, P-130, P-131, P-132 (34) | 새 엔진 회귀 감시 기준선(옛 기준선과 비교 판정 없음). | — | 분류 제외 | — | — | — | — |
| — | G16 배포 번들 크기 | P-133 | P-133 1.9446×, +34,971 B | P-133, P-134 (2) | 번들 크기 증가(84라운드 소유자 수용, 축소는 뒤 단계). | — | 분류 제외 | — | — | TEST-075, GOAL-011(번들 예산) | — |

순위 규칙: 렌더 경로 묶음을 먼저 둔다. 그 안에서 구성 행이 모두 체감 높음인 묶음(G8, G11)을 앞에, 높음·낮음이 섞인 묶음(G12a, G12b, G13)을 그다음에, 모두 낮음인 묶음(G10)을 뒤에 두고, 같은 칸에서는 대표 행의 82C 절대 차이 순이다. 코어 전용 묶음은 체감이 "M0 대기"이므로 렌더 묶음 뒤에 코어 배율 순으로 둔다. G11은 136k 공식 React 표에서도 1.65~1.80×로 남아 있고 G12a·G12b·G13은 136k에서 차이가 대부분 사라졌으므로, M0 재측정 뒤에는 G11이 G8 다음 자리를 지킬 가능성이 크다. 이 행들에는 L4(런타임 교차) 묶음이 없으므로 "수용 후보"로 표시한 묶음도 없다. 작업 묶음은 모두 L1·L2·L3 가운데 하나다.

## 행별 분류


| ID | 대장 상태 | 계약 | 근거(현행 path:line) | 차수 | 체감 가중 | 위험(원장 ID / 금지 축) | 묶음 | 가설 묶음(대표 행) | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P-26 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / sample-0. U13/82C 2.2901× (0.244792→0.560604 ms). |
| P-27 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / sample-1. U13/82C 2.3570× (0.343792→0.810333 ms). |
| P-28 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / sample-2. U13/82C 2.3185× (0.358479→0.831125 ms). |
| P-29 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / sample-3. U13/82C 3.1902× (0.615521→1.963625 ms). 대표 행이다. 136j 공식 표에서 sample-3 마운트는 1.714×이며 108라운드에 "청사진 분석의 첫 비용"으로 소유자 수용되었다(performance.md:165). |
| P-30 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1, E3 | 선형 (residual-breakdown.md:29) | M0 대기 | GOAL-071, SETTLE-017(89C-04), CONTROLS-045 / 금지 축 없음 | L2 | G2(P-32) | core-mount / flat-50. U13/82C 3.9030× (0.786396→3.069312 ms). |
| P-31 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1, E3 | 선형 (residual-breakdown.md:29) | M0 대기 | GOAL-071, SETTLE-017(89C-04), CONTROLS-045 / 금지 축 없음 | L2 | G2(P-32) | core-mount / flat-100. U13/82C 4.3541× (1.063521→4.630709 ms). |
| P-32 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1, E3 | 선형 (residual-breakdown.md:29) | M0 대기 | GOAL-071, SETTLE-017(89C-04), CONTROLS-045 / 금지 축 없음 | L2 | G2(P-32) | core-mount / flat-500. U13/82C 4.8030× (2.510624→12.058521 ms). 대표 행이다. 새 판 기울기 0.019437 ms/필드가 옛 판 0.003750의 약 5.2배다. 136j 공식 표에서 flat-500 마운트는 1.100×로 충족이다(performance.md:167-171). |
| P-33 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1, E2 | 선형(잠정, 2점 보간 — residual-breakdown.md:30) | M0 대기 | BLUEPRINT-030, SETTLE-017 / 금지 축 없음 | L2 | G3(P-34) | core-mount / nested-d3-f4. U13/82C 4.8727× (0.887542→4.324729 ms). |
| P-34 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1, E2 | 선형(잠정, 2점 보간 — residual-breakdown.md:30) | M0 대기 | BLUEPRINT-030, SETTLE-017 / 금지 축 없음 | L2 | G3(P-34) | core-mount / nested-d5-f4. U13/82C 7.2839× (4.672959→34.037355 ms). 대표 행이다. cold DFS 상수가 d5에서 0.027500→0.173792 ms로 늘었다(residual-breakdown.md:212). 136j에서는 1.954×이고 108라운드 소유자 수용이다(performance.md:175). |
| P-35 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1 | 선형 (performance-issues.md:44-46) | M0 대기 | WRITE-059 / 금지 축 주의: NODE-053(아이템 지연 실체화) | L2 | G4(P-37) | core-mount / array-100. U13/82C 2.6866× (1.751792→4.706437 ms). |
| P-36 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1 | 선형 (performance-issues.md:44-46) | M0 대기 | WRITE-059 / 금지 축 주의: NODE-053(아이템 지연 실체화) | L2 | G4(P-37) | core-mount / array-500. U13/82C 3.1557× (6.379771→20.132687 ms). |
| P-37 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E1 | 선형 (performance-issues.md:44-46) | M0 대기 | WRITE-059 / 금지 축 주의: NODE-053(아이템 지연 실체화) | L2 | G4(P-37) | core-mount / array-1000. U13/82C 3.3404× (11.891166→39.720937 ms). 대표 행이다. 100/500/1000에서 4.706/20.133/39.721 ms로 기울기가 0.0386·0.0392 ms/아이템으로 거의 같다. 136j 공식 표에서 array-1000 마운트는 0.461×로 옛 판보다 빠르다(performance.md:181). |
| P-38 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-mount / oneOf-5. U13/82C 3.3702× (0.518521→1.747521 ms). 마운트(로드)이므로 전체 트리 순회가 허용된다. 비용은 분기 수 B에 따라 자란다. |
| P-39 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-mount / oneOf-10. U13/82C 3.7174× (0.574584→2.135979 ms). |
| P-40 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-mount / oneOf-20. U13/82C 4.2948× (0.700145→3.007001 ms). |
| P-41 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / array-push-100. U13/82C 3.3810× (0.243375→0.822854 ms). |
| P-42 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / array-replace-200. U13/82C 3.3554× (0.185416→0.622146 ms). |
| P-43 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / array-push-remove-100. U13/82C 3.0681× (0.262605→0.805687 ms). |
| P-44 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | M0 대기 | GOAL-071, BLUEPRINT-022, NODE-006 / 금지 축 없음 | L2 | G1(P-29) | core-mount / computed-visible-derived. U13/82C 2.3357× (0.376958→0.880480 ms). computed-visible-derived는 파생이 있어 정적 첫 로드가 아니라 `writeFieldNode(..., 'load')` 경로(E1 :24)를 탄다. |
| P-45 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / sample-0. U13/82C 1.8319× (0.063459→0.116250 ms). |
| P-46 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / sample-1. U13/82C 1.6621× (0.069729→0.115896 ms). |
| P-47 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / sample-2. U13/82C 1.5931× (0.079625→0.126854 ms). |
| P-48 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / sample-3. U13/82C 1.3903× (0.074417→0.103458 ms). |
| P-49 | 재측정 기준 통과 | 분류 제외 | — | — | — | — | — | G14(P-50) | core-update / flat-50. U13/82C 0.9719× (0.682855→0.663647 ms). 재측정 기준 통과 행이다. 문제로 분류하지 않는다. |
| P-50 | 재측정 기준 통과 | 분류 제외 | — | — | — | — | — | G14(P-50) | core-update / flat-100. U13/82C 0.7418× (0.874605→0.648811 ms). 재측정 기준 통과 행이다. 문제로 분류하지 않는다. |
| P-51 | 소유자 묶음 — 미수용 | 준수 | E5, E6 | 선형(D) (residual-breakdown.md:17) | M0 대기 | SETTLE-017, SETTLE-001, SETTLE-006 / 금지 축 없음 | L2 | G6(P-51) | core-update / nested-d3-f4. U13/82C 1.5592× (0.463647→0.722938 ms). 대표 행이다. 136j에서 nested 갱신은 3.961×·3.899×이며 142라운드 소유자 수용이다(performance.md:173-176). |
| P-52 | 소유자 묶음 — 미수용 | 준수 | E5, E6 | 선형(D) (residual-breakdown.md:17) | M0 대기 | SETTLE-017, SETTLE-001, SETTLE-006 / 금지 축 없음 | L2 | G6(P-51) | core-update / nested-d5-f4. U13/82C 1.5582× (0.373334→0.581730 ms). |
| P-53 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / array-100. U13/82C 1.1952× (0.107875→0.128938 ms). 136j에서 array-100 첫 갱신 3.077×(137r 3.099×)이며 104라운드 소유자 수용이다(performance.md:229). |
| P-54 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-update / oneOf-5. U13/82C 6.3261× (0.157209→0.994520 ms). |
| P-55 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-update / oneOf-10. U13/82C 7.6200× (0.159250→1.213479 ms). |
| P-56 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (residual-breakdown.md:31,35; performance.md:186-198) | M0 대기 | SETTLE-017, SETTLE-020, SETTLE-050, BLUEPRINT-007, NODE-006 / 금지 축: 게이트 평가 생략·역색인(BLUEPRINT-007), 직전 active 출발(SETTLE-044) | L1 | G5(P-56) | core-update / oneOf-20. U13/82C 10.6331× (0.160958→1.711479 ms). 대표 행이다. 새 판 기울기 0.048083 ms/분기가 옛 판 0.000239의 약 200배다. 136j에서 oneOf BF 갱신은 B=5→40에서 12.250→15.404×이며 142라운드 답으로 성능 개선 단계에 이월되었다(performance.md:186-198). |
| P-57 | 소유자 묶음 — 미수용 | 위반 후보(편집자 결정 1: push가 기존 길이에 비례하면 위반, remove의 꼬리 길이 비례는 준수; M0 탐침으로 확정) | E7 | M0 탐침 대기 | M0 대기 | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 | G8(P-85) | core-update / array-push-100. U13/82C 4.8478× (24.612645→119.317209 ms). 코어 대표 행이다. push마다 기존 길이만큼 칸 계획을 만들고 기존 아이템 노드를 하나씩 확인한다(E7). 100회 누적이면 총합이 길이의 제곱에 가깝게 자랄 수 있으나 코어 기록이 없다. |
| P-58 | 소유자 묶음 — 미수용 | 준수 | E8 | M0 탐침 대기 | M0 대기 | SETTLE-047, NODE-051, SETTLE-043 / 금지 축 없음 | L3 | G9(P-58) | core-update / array-replace-200. U13/82C 2.8008× (2.897021→8.113896 ms). 쓰기는 `/items`에 200개 배열 통째 설정 한 번이다(benchmark-form fixtures/equivalent/arrays.ts:23-26). SETTLE-047이 허용한 "쓰기가 닿은 하위 트리 한 번 순회"와 생긴 노드의 채움이다. |
| P-59 | 소유자 묶음 — 미수용 | 위반 후보(편집자 결정 1: push가 기존 길이에 비례하면 위반, remove의 꼬리 길이 비례는 준수; M0 탐침으로 확정) | E7 | M0 탐침 대기 | M0 대기 | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 | G8(P-85) | core-update / array-push-remove-100. U13/82C 3.9727× (40.112207→159.353913 ms). remove 100회는 끝에서부터 지우며 칸 계획이 남은 길이만큼 만들어진다(E7 arrangeBranchArray). |
| P-60 | 소유자 묶음 — 미수용 | 준수 | E5 | 상수(폼 크기 기준) (performance.md:219-223, 229-233) | M0 대기 | SETTLE-001, SETTLE-003, CONTROLS-045 / 금지 축 없음(할 일 없는 단계 건너뛰기는 GOAL-011 범위) | L2 | G7(P-60) | core-update / computed-visible-derived. U13/82C 2.7718× (0.128250→0.355479 ms). 대표 행이다. 역의존 표로 소유자를 찾는 경로(E5 :21-31)는 SETTLE-017이 허용한 범위다. 136j에서 8.009×이고 142라운드 소유자 수용이다. |
| P-61 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.3986×, +1.55 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / sample-0. U13/82C 1.3986× (3.892542→5.444125 ms). 대표 행이다. 136k 공식 React 표에서 sample-0 마운트는 1.0303×다(performance.md:452). |
| P-62 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.1816×, +1.08 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / sample-1. U13/82C 1.1816× (5.922083→6.997625 ms). |
| P-63 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.2069×, +1.16 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / sample-2. U13/82C 1.2069× (5.626791→6.790979 ms). |
| P-64 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4290×, +2.01 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-mount-wall / oneOf-5. U13/82C 1.4290× (4.679938→6.687833 ms). |
| P-65 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4580×, +2.24 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-mount-wall / oneOf-10. U13/82C 1.4580× (4.899458→7.143355 ms). |
| P-66 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.5719×, +2.95 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-mount-wall / oneOf-20. U13/82C 1.5719× (5.163708→8.116917 ms). |
| P-67 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.1262×, +0.54 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / array-push-100. U13/82C 1.1262× (4.301521→4.844250 ms). |
| P-68 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.1434×, +0.64 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / array-replace-200. U13/82C 1.1434× (4.466750→5.107458 ms). |
| P-69 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.2142×, +1.07 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / array-push-remove-100. U13/82C 1.2142× (4.984833→6.052750 ms). |
| P-70 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.2917×, +1.37 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | render-mount-wall / computed-visible-derived. U13/82C 1.2917× (4.690999→6.059500 ms). |
| P-71 | 소유자 묶음 — 미수용 | 준수 | E5 | M0 탐침 대기 | 높음(잠정; 1.4206×, +0.94 ms) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 | G13(P-73) | render-update-wall / sample-0. U13/82C 1.4206× (2.227646→3.164646 ms). |
| P-72 | 소유자 묶음 — 미수용 | 준수 | E5 | M0 탐침 대기 | 높음(잠정; 1.4724×, +1.04 ms) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 | G13(P-73) | render-update-wall / sample-1. U13/82C 1.4724× (2.210125→3.254188 ms). |
| P-73 | 소유자 묶음 — 미수용 | 준수 | E5 | M0 탐침 대기 | 높음(잠정; 1.5765×, +1.19 ms) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 | G13(P-73) | render-update-wall / sample-2. U13/82C 1.5765× (2.066854→3.258313 ms). 대표 행이다. 136k 공식 React 표에서 sample 갱신 네 행은 1.0037~1.0410×로 차이가 거의 사라졌다(performance.md:481-484). |
| P-74 | 소유자 묶음 — 미수용 | 준수 | E5 | M0 탐침 대기 | 높음(잠정; 1.4220×, +0.95 ms) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 | G13(P-73) | render-update-wall / sample-3. U13/82C 1.4220× (2.243792→3.190562 ms). |
| P-75 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5, E6 | M0 탐침 대기(2점만) | 낮음(잠정; 1.1546×, +4.03 ms) | SETTLE-017, REACT-006 / 금지 축 없음 | L2 | G12a(P-78) | render-update-wall / flat-100. U13/82C 1.1546× (26.090625→30.123416 ms). |
| P-76 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5, E6 | M0 탐침 대기(2점만) | 높음(잠정; 1.2362×, +6.93 ms) | SETTLE-017, REACT-006 / 금지 축 없음 | L2 | G12a(P-78) | render-update-wall / flat-500. U13/82C 1.2362× (29.336875→36.265438 ms). 136k 공식 React 표에서 1.1761×다. |
| P-77 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5, E6 | M0 탐침 대기(2점만) | 낮음(잠정; 1.1777×, +4.62 ms) | SETTLE-017, REACT-006 / 금지 축 없음 | L2 | G12a(P-78) | render-update-wall / nested-d3-f4. U13/82C 1.1777× (25.978521→30.595938 ms). |
| P-78 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5, E6 | M0 탐침 대기(2점만) | 높음(잠정; 1.4105×, +9.93 ms) | SETTLE-017, REACT-006 / 금지 축 없음 | L2 | G12a(P-78) | render-update-wall / nested-d5-f4. U13/82C 1.4105× (24.199292→34.133750 ms). 대표 행이다. 136k 공식 React 표에서 1.0929×로 줄었다(performance.md:481-499 구간). |
| P-79 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5 | M0 탐침 대기(2점만) | 낮음(잠정; 1.2428×, +1.10 ms) | REACT-006, REACT-028 / 금지 축 없음 | L1 | G12b(P-96) | render-update-wall / array-100. U13/82C 1.2428× (4.516667→5.613209 ms). |
| P-80 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5 | M0 탐침 대기(2점만) | 높음(잠정; 1.5552×, +7.48 ms) | REACT-006, REACT-028 / 금지 축 없음 | L1 | G12b(P-96) | render-update-wall / array-500. U13/82C 1.5552× (13.474708→20.956146 ms). 136k 공식 React 표에서 0.9345×다(performance.md:491). |
| P-81 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4248×, +2.61 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-update-wall / oneOf-5. U13/82C 1.4248× (6.149458→8.761937 ms). |
| P-82 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4631×, +2.85 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-update-wall / oneOf-10. U13/82C 1.4631× (6.156771→9.007792 ms). |
| P-83 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.5295×, +3.29 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | render-update-wall / oneOf-20. U13/82C 1.5295× (6.207584→9.494209 ms). |
| P-84 | 소유자 묶음 — 미수용 | 위반 후보(편집자 결정 1: push가 기존 길이에 비례하면 위반, remove의 꼬리 길이 비례는 준수; M0 탐침으로 확정) | E7 | M0 탐침 대기 | 높음(잠정; 1.4959×, +188.35 ms) | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 | G8(P-85) | render-update-wall / array-push-100. U13/82C 1.4959× (379.788479→568.134666 ms). 136k 공식 React 표에서 1.7232×(244.96→422.12 ms)로 여전히 큰 차이다(performance.md:493). 단일 push의 React wall은 write-2 0.718 ms에서 write-99 0.976 ms로 자라고 옛 판도 0.713→0.888 ms로 자란다(frame-budget.md:148,245). |
| P-85 | 소유자 묶음 — 미수용 | 위반 후보(편집자 결정 1: push가 기존 길이에 비례하면 위반, remove의 꼬리 길이 비례는 준수; M0 탐침으로 확정) | E7 | M0 탐침 대기 | 높음(잠정; 1.5301×, +402.80 ms) | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 | G8(P-85) | render-update-wall / array-push-remove-100. U13/82C 1.5301× (759.903042→1162.706396 ms). 대표 행이다(체감 순위 기준). 136k 공식 React 표에서 1.5046×(583.08→877.29 ms)이다(performance.md:495). 157라운드 답으로 수용된 행과 같은 시나리오다(performance.md:638-643). |
| P-86 | 소유자 묶음 — 미수용 | 준수 | E5 | M0 탐침 대기 | 낮음(잠정; 1.2264×, +1.81 ms) | SETTLE-001, REACT-006 / 금지 축 없음 | L2 | G13(P-73) | render-update-wall / computed-visible-derived. U13/82C 1.2264× (7.980813→9.787376 ms). |
| P-87 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.2441×, +0.47 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | profiler-mount / sample-0. U13/82C 1.2441× (1.925974→2.396019 ms). |
| P-88 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.2085×, +0.65 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | profiler-mount / sample-2. U13/82C 1.2085× (3.104894→3.752192 ms). |
| P-89 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4753×, +1.20 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | profiler-mount / oneOf-5. U13/82C 1.4753× (2.517173→3.713460 ms). |
| P-90 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.4981×, +1.39 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | profiler-mount / oneOf-10. U13/82C 1.4981× (2.788232→4.176958 ms). |
| P-91 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E4 | 선형(B) (performance-issues.md:73-75) | 높음(잠정; 1.7195×, +2.23 ms) | SETTLE-020, BLUEPRINT-007, REACT-019 / 금지 축: G5와 같음 | L1 | G11(P-91) | profiler-mount / oneOf-20. U13/82C 1.7195× (3.095089→5.322044 ms). 대표 행이다. 136k 공식 React 표에서도 oneOf-20 프로파일러 마운트 1.8015×, 렌더 마운트 1.6873×, 렌더 갱신 1.6496×로 남아 있다(performance.md:470,499,528). |
| P-92 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.3501×, +0.50 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | profiler-mount / array-push-100. U13/82C 1.3501× (1.435731→1.938439 ms). |
| P-93 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.3804×, +0.56 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | profiler-mount / array-replace-200. U13/82C 1.3804× (1.485229→2.050166 ms). |
| P-94 | 소유자 묶음 — 미수용 | 준수 | E1 | M0 탐침 대기 | 낮음(잠정; 1.3356×, +0.75 ms) | GOAL-071, REACT-006, REACT-019 / 금지 축 없음 | L2 | G10(P-61) | profiler-mount / array-push-remove-100. U13/82C 1.3356× (2.242167→2.994711 ms). |
| P-95 | 재측정 기준 통과 | 분류 제외 | — | — | — | — | — | G14(P-50) | profiler-mount / computed-visible-derived. U13/82C 1.1431× (2.649232→3.028208 ms). 재측정 기준 통과 행이다. 문제로 분류하지 않는다. |
| P-96 | 소유자 묶음(83C-01) — 수용 대기 | 준수 | E5 | M0 탐침 대기(2점만) | 높음(잠정; 2.1078×, +5.50 ms) | REACT-006, REACT-028 / 금지 축 없음 | L1 | G12b(P-96) | profiler-update / array-500. U13/82C 2.1078× (4.963464→10.462226 ms). 대표 행이다. 코어의 배열 잎 쓰기는 길이에 무관하다(performance.md:229-233). 136k 공식 React 표에서는 0.2657×로 옛 판보다 빠르지만 100/500/1000에서 0.218/0.401/0.647 ms로 길이에 따라 자란다(performance.md:539-557). |
| P-97 | 재측정 기준 통과 | 분류 제외 | — | — | — | — | — | G14(P-50) | profiler-update / array-push-100. U13/82C 1.1861× (153.664254→182.262620 ms). 재측정 기준 통과 행이다. 문제로 분류하지 않는다. |
| P-98 | 소유자 묶음 — 미수용 | 위반 후보(편집자 결정 1: push가 기존 길이에 비례하면 위반, remove의 꼬리 길이 비례는 준수; M0 탐침으로 확정) | E7 | M0 탐침 대기 | 높음(잠정; 1.1768×, +49.00 ms) | NODE-005, NODE-014, NODE-051, SETTLE-017, SETTLE-043 / 금지 축 주의: NODE-053 | L1 | G8(P-85) | profiler-update / array-push-remove-100. U13/82C 1.1768× (277.069744→326.066537 ms). 136k 공식 React 표에서는 0.9365×로 옛 판보다 빠르다(performance.md:553). |
| P-99 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-100 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-101 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-102 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-103 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-104 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | branch-strategy-init.bench.ts: blueprint/load: branch initia. 기록 행이다(`src/core/__benchmarks__/branch-strategy-init.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-105 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-106 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-107 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-108 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-109 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-110 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | compute-recalculate.bench.ts: settle: controls through publi. 기록 행이다(`src/core/__benchmarks__/compute-recalculate.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-111 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | event-cascade.bench.ts: dispatch: public writes (legacy macr. 기록 행이다(`src/core/__benchmarks__/event-cascade.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-112 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | event-cascade.bench.ts: dispatch: public writes (legacy macr. 기록 행이다(`src/core/__benchmarks__/event-cascade.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-113 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | find-node.bench.ts: navigation: find through core / depth 3 . 기록 행이다(`src/core/__benchmarks__/find-node.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-114 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | find-node.bench.ts: navigation: find through core / depth 7 . 기록 행이다(`src/core/__benchmarks__/find-node.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-115 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | find-node.bench.ts: navigation: find through core / depth 12. 기록 행이다(`src/core/__benchmarks__/find-node.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-116 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | nodeFromJSONSchema.bench.ts: load: nodeFromJSONSchema throug. 기록 행이다(`src/core/__benchmarks__/nodeFromJSONSchema.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-117 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | nodeFromJSONSchema.bench.ts: load: nodeFromJSONSchema throug. 기록 행이다(`src/core/__benchmarks__/nodeFromJSONSchema.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-118 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | nodeFromJSONSchema.bench.ts: load: nodeFromJSONSchema throug. 기록 행이다(`src/core/__benchmarks__/nodeFromJSONSchema.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-119 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | nodeFromJSONSchema.bench.ts: load: nodeFromJSONSchema throug. 기록 행이다(`src/core/__benchmarks__/nodeFromJSONSchema.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-120 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-121 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-122 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-123 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-124 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-125 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-126 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | object-pending-read.bench.ts: settle: object read after chil. 기록 행이다(`src/core/__benchmarks__/object-pending-read.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-127 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: small (5 terminals. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-128 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: small (5 terminals. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-129 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: medium (25 termina. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-130 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: medium (25 termina. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-131 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: large (150 termina. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-132 | 기록(비교 판정 없음) | 분류 제외 | — | — | — | — | — | G15(P-102) | render-delay.bench.ts: load/render-delay: large (150 termina. 기록 행이다(`src/core/__benchmarks__/render-delay.bench.ts`). 새 엔진의 회귀 감시 기준선이며 옛 판 비교 판정이 없으므로 문제로 분류하지 않는다. |
| P-133 | 소유자 수용(84라운드) | 분류 제외 | — | — | — | TEST-075, GOAL-011(번들 예산) | — | G16(P-133) | esbuild minify + gzip -9. 84라운드 소유자 수용 행이다. 번들 축소는 뒤 단계이며 순회 비용 계약과 무관하다. |
| P-134 | 소유자 수용(84라운드) | 분류 제외 | — | — | — | TEST-075, GOAL-011(번들 예산) | — | G16(P-133) | minify 없는 gzip -9. 84라운드 소유자 수용 행이다. 번들 축소는 뒤 단계이며 순회 비용 계약과 무관하다. |

## 판단 보류와 근거 부족

1. **G8 배열 구조 동사(P-57, P-59, P-84, P-85, P-98) — 계약 판단 보류.** push·remove 한 번마다 기존 아이템 수에 비례하는 일이 있다(E7: `arrangeBranchArray.ts:28-32`의 칸 계획, `canApplyArrayTail.ts:17-29`의 기존 아이템 노드 확인, `applyArrayTail.ts:63-70`의 접두 사본). 기존 아이템은 이번 정착의 재계산 목록에 들지 않으므로 글자대로 읽으면 범위 밖 노드 방문이다. 그러나 호스트 배열의 불변 출력 사본 O(길이)가 SETTLE-017의 허용 범위인지 정한 원장 문장이 없고(NODE-005 "원본 배열 위의 배열 연산"), 길이별 코어 기록도 없다. 필요한 것은 두 가지다. 하나는 M0의 길이별(예: 100·1,000·8,000) push 한 번 코어 시간 탐침이고, 다른 하나는 호스트 사본과 기존 아이템 확인이 범위 안인지에 대한 원장 관리자의 판정이다. 고치는 길이 아이템 지연 실체화로 가면 금지 축(NODE-053)이다.
2. **React 층의 크기 의존(G12a, G12b).** 코어 경로는 준수로 판정했다(폼 크기에 무관한 잎 쓰기 기록: `performance.md:219-223, 229-233`). 그러나 React 층의 재렌더 범위는 SETTLE-017·047이 다루지 않으므로 같은 기준으로 판정하지 않았다. P-96은 136k에서 옛 판보다 빠르지만 100/500/1000에서 0.218/0.401/0.647 ms로 여전히 길이에 따라 자란다. 렌더 계층의 비용 범위를 정한 원장 항목과 M0 렌더 탐침이 있어야 판정할 수 있다.
3. **차수 근거 부족.** G1·G9·G10·G13은 고정 fixture라 N 배율 기록이 없다. G3은 2점 보간이라 지수를 증명하지 않는다(residual-breakdown.md:27). G12a·G12b는 2점뿐이다. 모두 M0 탐침이 필요하다.
4. **측정과 현행 코드의 차이.** G1~G4는 82C 뒤에 생긴 정적 첫 로드와 파생 표 지름길 이전의 경로를 쟀다(E1, E3). 계약 판정(로드라 준수)은 바뀌지 않지만 크기와 차수는 M0에서 다시 재야 한다.
5. **대장 상태와 공식 표의 불일치.** P-26~P-98의 다수는 136j·136k 공식 표에서 소유자 수용(104·108·110·142·157라운드)이 적혀 있으나 대장 상태 칸은 미수용으로 남아 있다. 이 초안은 대장 상태를 그대로 옮겼다.
6. **범위 밖 관찰(분류하지 않음).** `hasRecursiveExpansion.ts:72-77`은 순환 청사진에서만 잠복 저장소 전체를 훑는다. U13 fixture는 순환이 없어 도달하지 않으므로 이 행들의 분류에는 넣지 않았다.

계약 집계: 준수 64, 분류 제외 40, 판단 보류 5.
