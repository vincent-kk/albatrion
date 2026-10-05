# 94C-03: 후속 갱신·분기 수·마운트의 비용 진단

## (가) 한 번의 갱신이 내는 고정 비용

후속 갱신의 작은 폼 배율은 이번 상세 계측에서 3.52–3.62×, 중첩·배열은 2.65–2.90×, computed-visible-derived는 4.53×입니다. 작은 폼의 mark는 약 50–52%, delivery는 약 15–17%입니다. 단일 raw 쓰기와 조상 output 갱신 외에도 빈 phase 진입, context/chain 준비, 사용하지 않은 작업군 정리가 반복됩니다. 다만 빈 feature helper만의 몫은 약 6–8%로, mark 전체를 지울 수 있다는 근거는 없습니다.

**근거와 측정 범위.** 94C-03 및 94C-01은 `git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-94-closing.md`로 읽었습니다. 65C-01의 phase별 상수/구조 분리, round 87의 최소 순회·서브트리 독립성, round 91의 untouched branch 비용·중복 작업 기준을 적용했습니다. corrected `verdict-93c01.md`와 summary, `branchless-phase-diagnosis.md`, `remeasure-86c02.md`를 교차 참조했습니다. 후자의 관측을 현재 코드의 호출 수로 재확인했으며 첫 갱신이나 여러 interaction의 평균으로 후속 단일 쓰기를 대체하지 않았습니다.

worktree는 `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`, HEAD는 `f8aaa4ed23245450f967878cd96477fa5bae8f96`입니다. Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max, darwin/arm64의 단일 프로세스에서 각 폼·버전별 warmup 24회 후 101쌍×3회차를 실행했습니다. 매 쌍 old/new를 교대하고 회차마다 선후를 반전했습니다. BF 원 interaction을 끝낸 후 한 번 더 실제 값을 바꿨습니다. oneOf는 분기 수와 무관하게 `kind_0 → kind_4`입니다. 개발 모드, 일반 validation off, 빈 onChange, 구독자 없음입니다. 명시적 GC는 계측 밖입니다. 타이밍과 census는 별도 순차 실행했고 census는 5개 새 트리로 확인했습니다. esbuild 서비스도 계측 전에 stdin을 닫아 스스로 종료시켰습니다. 새 에이전트·설치·Git 쓰기·제품 소스 변경은 없습니다. 기존 호스트의 idle 세션은 종료시키지 않았으므로 호스트 전체 프로세스 배타성은 보증하지 않습니다.

old는 설치된 BF `@canard/schema-form_0.16.0` alias의 0.16.0에 대응하는 release tag `6c5cb708fd3f108159f85bfafe48e67803848e30`의 정본 TypeScript를 메모리에서 계측·번들한 경로입니다. 현재 `src/__legacy__`가 이 release와 같다고 가정하지 않았습니다. alias 실제 CJS의 내부 factory도 메모리에서 연결해 30개 mount/later 결과가 source lane 및 HEAD와 같은 hash임을 확인했습니다. 이는 표본 의미 동등성 증거이며 alias bytecode와 계측 lane의 타이밍 동등성 증거는 아닙니다. 제품 파일에는 계측을 넣지 않았습니다.

**계측 편향.** 각 fixture/version/operation의 실제 site 빈도로 빈 span을 replay하고, noop 바탕 비용과 교대 비교한 한 호출 비용 `k`를 구했습니다. 각 sample의 보정은 `원시간 − C×k`입니다. 아래 모든 단계 값은 호출 수 C와 ns/call을 함께 적었습니다. C는 계측 span 수이고 computeNode 등 의미 있는 함수 호출 수와 다릅니다. 원/보정 시간은 중앙값이며 몫은 합이 100%가 되는 보정 산술평균 기준입니다. median끼리 더하지 않습니다. 0 미만 보정은 잘라내지 않았습니다. parent의 절감 상한은 자기 C가 아니라 자손을 포함한 C_sub로 보정했습니다. recursive inclusive 부모나 gate와 그 부모 선택 테이블의 시간을 합산하지 않습니다.

동기 함수 span과 bounded drain에서 실제 실행된 old callback의 active 시간을 합했고 timer 대기는 제외했습니다. plain 동기 제어군은 old의 비동기 작업을 제외하므로 공식 종단 배율로 쓰지 않았습니다. 계측은 JIT/inlining/cache를 바꿀 수 있으며 빈 span 보정으로 되돌릴 수 없습니다. 특히 nested-d5 mount의 HEAD는 196,943 spans여서 원 평균 51.04 ms 중 보정 공제가 27.32 ms입니다. 따라서 이 phase 합계는 93C-01 공식 corrected 표 및 94C-01의 종단 계측 미해결 상태를 대체하지 않습니다.

**후속 단일 쓰기 합계.**

| 폼 | old 원/보정 µs | old C / 빈 span ns | HEAD 원/보정 µs | HEAD C / 빈 span ns | 보정 배율 |
|---|---:|---:|---:|---:|---:|
| sample-0 | 31.83/26.63 | 35 / 148.8 | 115.25/96.51 | 116 / 161.6 | 3.62× |
| sample-1 | 36.00/29.27 | 45 / 149.5 | 126.92/104.10 | 141 / 161.8 | 3.56× |
| sample-2 | 35.92/29.15 | 45 / 150.4 | 127.46/104.77 | 141 / 160.9 | 3.59× |
| sample-3 | 35.54/28.83 | 45 / 149.3 | 124.58/101.47 | 143 / 161.7 | 3.52× |
| nested-d3-f4 | 46.88/38.60 | 55 / 150.4 | 136.75/110.17 | 167 / 159.2 | 2.85× |
| nested-d5-f4 | 47.29/36.09 | 75 / 149.4 | 139.54/104.49 | 222 / 157.9 | 2.90× |
| array-100 | 49.50/41.28 | 54 / 152.2 | 135.46/109.23 | 164 / 159.9 | 2.65× |
| computed-visible-derived | 51.79/40.09 | 78 / 150.1 | 229.00/181.48 | 292 / 162.7 | 4.53× |

**mark → compute → derive → transition → commit → delivery.** mark에는 entry/chain, raw 쓰기, dependency marking 및 호출 외곽의 finish/cleanup이 들어갑니다. 그러므로 순수하게 compute 이전 시간만을 뜻하지 않습니다. derive/transition 안에서 일어난 compute·mark는 상위 phase에 남겼습니다. delivery 준비는 commit 내부에서 실행돼도 delivery로 분리했습니다. old에 독립 commit 함수가 없어서 commit C=0입니다. output 슬롯은 compute 등에 포함되므로 standalone output=0을 출력 작업 없음으로 읽으면 안 됩니다.

| 폼 / 단계 | old 원→보정 µs; C; ns/call | HEAD 원→보정 µs; C; ns/call | HEAD 보정 평균 몫 |
|---|---:|---:|---:|
| sample-0 / mark | 7.21→6.32; 6; 148.8 | 56.46→50.64; 36; 161.6 | 52.2% |
| sample-0 / compute | 6.79→6.05; 5; 148.8 | 15.08→11.53; 22; 161.6 | 12.4% |
| sample-0 / derive | 0.00→0.00; 0; 148.8 | 1.58→1.10; 3; 161.6 | 1.3% |
| sample-0 / transition | 0.00→0.00; 0; 148.8 | 4.71→3.90; 5; 161.6 | 4.4% |
| sample-0 / commit | 0.00→0.00; 0; 148.8 | 19.79→13.98; 36; 161.6 | 14.2% |
| sample-0 / delivery | 16.08→12.51; 24; 148.8 | 17.29→15.03; 14; 161.6 | 15.5% |
| sample-1 / mark | 7.29→6.40; 6; 149.5 | 58.88→52.73; 38; 161.8 | 51.0% |
| sample-1 / compute | 7.79→6.60; 8; 149.5 | 19.58→14.08; 34; 161.8 | 13.5% |
| sample-1 / derive | 0.00→0.00; 0; 149.5 | 1.63→1.14; 3; 161.8 | 1.5% |
| sample-1 / transition | 0.00→0.00; 0; 149.5 | 4.71→3.90; 5; 161.8 | 4.1% |
| sample-1 / commit | 0.00→0.00; 0; 149.5 | 20.83→14.04; 42; 161.8 | 13.7% |
| sample-1 / delivery | 19.37→14.74; 31; 149.5 | 19.42→16.34; 19; 161.8 | 16.2% |
| sample-2 / mark | 7.17→6.27; 6; 150.4 | 58.04→51.93; 38; 160.9 | 50.4% |
| sample-2 / compute | 8.00→6.80; 8; 150.4 | 19.37→13.90; 34; 160.9 | 13.4% |
| sample-2 / derive | 0.00→0.00; 0; 150.4 | 2.46→1.98; 3; 160.9 | 2.2% |
| sample-2 / transition | 0.00→0.00; 0; 150.4 | 4.92→4.11; 5; 160.9 | 4.2% |
| sample-2 / commit | 0.00→0.00; 0; 150.4 | 20.46→13.70; 42; 160.9 | 13.2% |
| sample-2 / delivery | 19.29→14.63; 31; 150.4 | 20.50→17.44; 19; 160.9 | 16.6% |
| sample-3 / mark | 7.29→6.40; 6; 149.3 | 58.46→52.32; 38; 161.7 | 51.4% |
| sample-3 / compute | 7.54→6.35; 8; 149.3 | 17.96→12.14; 36; 161.7 | 12.4% |
| sample-3 / derive | 0.00→0.00; 0; 149.3 | 1.58→1.10; 3; 161.7 | 1.3% |
| sample-3 / transition | 0.00→0.00; 0; 149.3 | 4.71→3.90; 5; 161.7 | 4.0% |
| sample-3 / commit | 0.00→0.00; 0; 149.3 | 20.75→13.96; 42; 161.7 | 13.8% |
| sample-3 / delivery | 19.79→15.16; 31; 149.3 | 19.75→16.68; 19; 161.7 | 17.1% |
| nested-d3-f4 / mark | 9.62→8.72; 6; 150.4 | 60.13→53.76; 40; 159.2 | 49.1% |
| nested-d3-f4 / compute | 10.33→8.68; 11; 150.4 | 23.67→16.19; 47; 159.2 | 15.0% |
| nested-d3-f4 / derive | 0.00→0.00; 0; 150.4 | 1.67→1.19; 3; 159.2 | 1.2% |
| nested-d3-f4 / transition | 0.00→0.00; 0; 150.4 | 4.71→3.91; 5; 159.2 | 3.6% |
| nested-d3-f4 / commit | 0.00→0.00; 0; 150.4 | 20.83→13.19; 48; 159.2 | 11.8% |
| nested-d3-f4 / delivery | 26.13→20.41; 38; 150.4 | 24.79→20.97; 24; 159.2 | 19.3% |
| nested-d5-f4 / mark | 8.62→7.73; 6; 149.4 | 56.29→49.35; 44; 157.9 | 47.2% |
| nested-d5-f4 / compute | 11.04→8.50; 17; 149.4 | 30.00→18.00; 76; 157.9 | 17.6% |
| nested-d5-f4 / derive | 0.00→0.00; 0; 149.4 | 1.50→1.03; 3; 157.9 | 1.1% |
| nested-d5-f4 / transition | 0.00→0.00; 0; 149.4 | 4.29→3.50; 5; 157.9 | 3.4% |
| nested-d5-f4 / commit | 0.00→0.00; 0; 149.4 | 18.88→9.40; 60; 157.9 | 9.7% |
| nested-d5-f4 / delivery | 27.41→19.65; 52; 149.4 | 27.12→21.76; 34; 157.9 | 21.0% |
| array-100 / mark | 7.83→6.92; 6; 152.2 | 62.13→55.73; 40; 159.9 | 50.7% |
| array-100 / compute | 7.75→6.53; 8; 152.2 | 22.96→15.92; 44; 159.9 | 14.9% |
| array-100 / derive | 0.00→0.00; 0; 152.2 | 1.67→1.19; 3; 159.9 | 1.3% |
| array-100 / transition | 0.00→0.00; 0; 152.2 | 3.87→3.07; 5; 159.9 | 2.9% |
| array-100 / commit | 0.00→0.00; 0; 152.2 | 20.92→13.24; 48; 159.9 | 12.1% |
| array-100 / delivery | 33.92→27.83; 40; 152.2 | 23.12→19.28; 24; 159.9 | 18.0% |
| computed-visible-derived / mark | 10.21→8.41; 12; 150.1 | 56.46→49.62; 42; 162.7 | 27.1% |
| computed-visible-derived / compute | 9.71→8.21; 10; 150.1 | 30.16→22.19; 49; 162.7 | 12.4% |
| computed-visible-derived / derive | 1.79→1.34; 3; 150.1 | 79.67→61.28; 113; 162.7 | 33.9% |
| computed-visible-derived / transition | 0.00→0.00; 0; 150.1 | 3.83→3.02; 5; 162.7 | 1.7% |
| computed-visible-derived / commit | 0.00→0.00; 0; 150.1 | 39.21→28.96; 63; 162.7 | 16.0% |
| computed-visible-derived / delivery | 28.75→20.80; 53; 150.1 | 19.00→15.74; 20; 162.7 | 9.0% |

**필수 쓰기와 형태에 비례하는 작업.** `writeSchemaNode.ts:71`의 markWrite는 외부 입력 한 번, `computeNode.ts:43`의 ungated 경로는 변경된 자식과 그 조상만 계산합니다. computeNode 호출 수는 sample-0/1/2/3에서 2/3/3/3, nested-d3/d5에서 4/6, array-100에서 4입니다. nested-d5 전체 1,365개 및 array의 100개 원소를 후속 쓰기마다 순회하지 않았습니다. registerRecalculation의 dirty loop(`src/core/settle/utils/write/registerRecalculation.ts:27`)도 2/3/3/3/4/6/4회로 쓰기 경로 깊이에 비례합니다. immutable 부모 output을 갱신하기 위해 이 조상 작업은 필요합니다. 넓은 객체의 copy는 크기에 비례할 수 있으며 flat-500의 후속 갱신은 오히려 old보다 작아(0.38×) 이를 작은 폼 고정비와 구분해야 합니다.

빈 derive·transition·exit·derive commit helper는 기능이 없는 모든 표본에서도 각각 한 번 실행됩니다. 아래 A-empty는 자손 C를 합한 분리된 helper들의 묶음입니다. scratch는 첫 사용/중첩 호출 때만 새로 만들고 이후 재사용합니다(`getSettlementScratch.ts:11`). 24개 scratch 컨테이너가 후속 쓰기마다 새로 만들어지는 것은 아니며, `releaseSettlementScratch.ts:9`에서 21회 clear와 3회 배열 길이 초기화가 무조건 실행됩니다. 사용하지 않은 containers를 정리하는 상수 비용과 사용한 DirtyPathSet의 색인 정리는 구분해야 합니다.

| 묶음 / 폼 | 원→보정 평균 µs | C(own) 또는 C_sub / ns/call | 보정 평균 몫 |
|---|---:|---:|---:|
| A-empty / sample-0 | 9.83→7.08 | 17 / 161.6 | 7.2% |
| A-context / sample-0 | 7.51→6.54 | 6 / 161.6 | 6.6% |
| A-dispatch-own / sample-0 | 29.97→29.16 | 5 / 161.6 | 29.5% |
| A-empty / sample-1 | 10.14→7.39 | 17 / 161.8 | 6.9% |
| A-context / sample-1 | 7.36→6.39 | 6 / 161.8 | 6.0% |
| A-dispatch-own / sample-1 | 30.24→29.43 | 5 / 161.8 | 27.7% |
| A-empty / sample-2 | 10.98→8.24 | 17 / 160.9 | 7.8% |
| A-context / sample-2 | 7.39→6.42 | 6 / 160.9 | 6.0% |
| A-dispatch-own / sample-2 | 30.03→29.23 | 5 / 160.9 | 27.5% |
| A-empty / sample-3 | 9.70→6.95 | 17 / 161.7 | 6.7% |
| A-context / sample-3 | 7.58→6.61 | 6 / 161.7 | 6.3% |
| A-dispatch-own / sample-3 | 29.81→29.00 | 5 / 161.7 | 27.8% |
| A-empty / nested-d3-f4 | 9.61→6.90 | 17 / 159.2 | 6.1% |
| A-context / nested-d3-f4 | 6.63→5.67 | 6 / 159.2 | 5.0% |
| A-dispatch-own / nested-d3-f4 | 31.19→30.39 | 5 / 159.2 | 27.0% |
| A-empty / nested-d5-f4 | 9.00→6.31 | 17 / 157.9 | 5.9% |
| A-context / nested-d5-f4 | 5.87→4.92 | 6 / 157.9 | 4.6% |
| A-dispatch-own / nested-d5-f4 | 27.85→27.06 | 5 / 157.9 | 25.1% |
| A-empty / array-100 | 8.85→6.13 | 17 / 159.9 | 5.5% |
| A-context / array-100 | 7.55→6.59 | 6 / 159.9 | 5.9% |
| A-dispatch-own / array-100 | 31.23→30.43 | 5 / 159.9 | 27.3% |

sample-0의 enterSchemaNodeChain/exitSchemaNodeChain은 각각 한 번, 자손 포함 C=4/7, 보정 평균 9.89/6.40 µs(10.0%/6.5%)입니다. 빈 span 비용은 두 함수 모두 161.6 ns/call입니다. 쓰기 writable 확인, 오류 수집, budget과 root onChange 전달을 포함하므로 전체를 unused bookkeeping으로 분류하지 않습니다. A2는 이 전체 몫을 절감값에 넣지 않았습니다. onChange가 빈 함수라도 현행 payload/revision 계약상 준비 비용은 필수입니다.

**derived 4.53×의 분해.** evaluateDeriveRound는 2회입니다. 첫 회가 target에 자동 쓰기를 만들고, 둘째 회가 새 쓰기가 없음을 확인합니다. 둘째 회 전체가 낭비라는 증거는 없으며 이를 제거하면 edge 소비·rank·수렴 계약(`SETTLE-004`)을 훼손할 수 있습니다. registerRecalculation은 2회, collectDeriveSourcePaths는 2회, getDependencyIndex는 4회, DependencyIndex.affected는 6회입니다. index constructor는 0회로 캐시를 새로 만드는 비용이 아닙니다. changedRaw를 누적으로 질의해 loop가 3회(source, 이후 source+target)가 되고 dirty loop는 5회입니다. computeNode도 5회로 root 2, source 1, target 2회입니다. target의 자동 쓰기 전 선행 계산은 잠재적인 중복이지만 다른 control/gate 독자가 없음을 증명해야 생략할 수 있습니다. root의 정적 shape 확인과 선택(`selectChildren.ts:94,102`)은 각각 8개 항목을 방문해 단일 쓰기 수가 아니라 고정된 네 자식 폭에 비례합니다.

| 묶음 / 폼 | 원→보정 평균 µs | C(own) 또는 C_sub / ns/call | 보정 평균 몫 |
|---|---:|---:|---:|
| A-derive-rounds / computed-visible-derived | 81.58→63.20 | 113 / 162.7 | 33.9% |
| A-derive-evaluation / computed-visible-derived | 30.75→25.38 | 33 / 162.7 | 13.6% |
| A-derive-dependencies / computed-visible-derived | 27.96→22.27 | 35 / 162.7 | 11.9% |

round 전체 33.9%와 의존성 11.9%는 겹칩니다. 의존성 묶음 중 두 번째 등록과 두 번 source 질의가 derive 내부에 있으므로 이 둘을 더해 45.8%라고 하지 않습니다. commitDeriveRules의 baseline/edge 상태도 둘째 round와 의미가 달라 중복이라는 이유로 삭제할 수 없습니다.

**발견의 분류와 수정 명세.** 아래 절감 범위는 아직 구현하지 않은 가정이며 상한을 넘는 절감을 약속하지 않습니다. (a)는 원장 계약을 유지하는 후보, (b)는 설계 및 명시한 원장을 바꿔야 하는 후보입니다.

| ID / 분류 | 위치·진단 | 수정 명세 또는 바꿀 설계 | 예상 절감·상한 / 원장 변경 |
|---|---|---|---|
| A1 / (a) | 기능 없는 단계의 빈 진입·종료<br>`src/core/settle/utils/settlement/finishSettlement.ts:33`<br>`src/core/settle/utils/transition/finalizeExits.ts:20`<br>`src/core/settle/utils/commit/commitDeriveRules.ts:19` | 정적 rule 부재 및 entered/exited/perished/array 작업 부재를 증명한 경로에서 빈 helper 호출을 생략한다. 논리적인 phase 순서, commit#, 오류·trace, state와 revision 갱신은 유지한다. | 완전한 빈 그룹의 40–75%를 제거한다고 가정하면 갱신당 약 2.5–6.2 µs; 측정 상한 6.1–8.2 µs. 구현으로 입증한 절감값은 아니다.<br>원장 변경 없음 |
| A2 / (a) | context 복사와 사용하지 않은 scratch 정리<br>`src/core/settle/utils/settlement/createSettlementContext.ts:22`<br>`src/core/settle/utils/write/getSettlementScratch.ts:11`<br>`src/core/settle/utils/write/releaseSettlementScratch.ts:9` | readonly capability 참조와 호출별 mutable 상태를 분리하고 실제 사용한 작업군만 정리한다. 중첩·재진입 호출의 독립 scratch와 DirtyPathSet의 부모 색인은 보존한다. | sample-0 측정 묶음의 약 30–60%, 약 2–4 µs. 전체 mark 52%를 없앨 수 있다는 뜻이 아니다.<br>원장 변경 없음 |
| A3 / (a) | derived 의존성 등록과 delta 중복<br>`src/core/settle/utils/derivation/runDeriveRounds.ts:82`<br>`src/core/settle/utils/derivation/collectDeriveSourcePaths.ts:10`<br>`src/core/settle/utils/write/registerRecalculation.ts:19`<br>`src/core/settle/utils/compute/selectChildren.ts:94` | 누적 changedRaw는 롤백·오류 기록용으로 보존하고, 아직 전파하지 않은 delta만 역색인에 질의한다. 새 자동 쓰기/투영 세대가 생기면 다시 전파한다. derived-only target의 선행 output 계산 생략은 다른 control/gate 독자가 없다는 증명에 한정한다. 마지막 수렴 확인 round와 edge/rank 의미는 유지한다. | 의존성 묶음 약 22 µs 중 15–35%인 약 3–8 µs; target 선행 계산을 추가로 줄이는 몫은 별도 검증 전에는 합산하지 않는다.<br>원장 변경 없음 |
| A5 / (a) | 단일 scalar 쓰기의 dispatch·chain 호출 준비<br>`src/core/dispatch/utils/entry/dispatchSetValue.ts:18`<br>`src/core/settle/utils/write/writeSchemaNode.ts:59`<br>`src/core/settle/utils/settlement/finishSettlement.ts:22` | 정적 기능 부재·종류가 맞는 terminal 쓰기·구조 변화 없음이 입증된 경로에 한정해 호출 준비를 단순화한다. raw 쓰기, 변경 조상의 output, logical mark→compute→derive→transition→commit 순서, trace/오류·budget 및 listener-independent revision/payload는 그대로 실행한다. chain 재진입 또는 기능 존재 시 일반 경로에 남긴다. | sample-0의 facade/chain own 잔여 약 29 µs(29.5%)가 넓은 상한이다. guard·budget·onChange 등 필수 작업을 포함하므로 미세 helper 배분의 편향까지 고려해 실제 절감은 0–10 µs의 가설로 둔다. A1/A2와 다른 own span이지만 전체 최적화 절감은 함께 재측정하기 전 합산하지 않는다.<br>원장 변경 없음 |
| A4 / (b) | 구독자 없을 때 revision/payload를 생략하는 설계<br>`src/core/settle/utils/commit/markCommitDeliveries.ts:25`<br>`src/core/record/utils/SchemaNodeRevisionLedger.ts:18` | subscriber-only revision/payload 생성을 채택하려면 통지 대상 집합 및 마지막 통지 값의 독자 없는 경우도 계약을 바꿔야 한다. 65C-03에서 이미 기각된 설계로, 이 진단은 재채택하지 않는다. | branchless 후속 갱신의 delivery 전체 약 15–21%가 아주 느슨한 상한이며 실제 revision 생성만의 절감은 이보다 작다. commit 전체는 제거할 수 없다.<br>`EVENT-001` (`architecture/ledger/event.md:85`), `EVENT-007` (`architecture/ledger/event.md:172`), `EVENT-024` (`architecture/ledger/event.md:410`), `SETTLE-006` (`architecture/ledger/settle.md:163`) |

## (나) 분기 수에 따른 정착 비용

한 번의 oneOf 쓰기에서 computeNode=5, 실제 새 노드=3, 퇴장=3, transitionSettlement round=1은 분기 수와 무관합니다. 그런데 mark와 compute는 증가합니다. gate 평가가 8B(루트 스키마 2B + 자식 선언 6B), 선택 테이블 항목이 6B+4, 역의존성 owner가 3B+1입니다. untouched branch의 gate도 각 8회 평가됩니다. 실제 노드 생성이나 더 많은 derive round가 원인이 아닙니다.

| 폼 | old 원/보정 µs | old C / 빈 span ns | HEAD 원/보정 µs | HEAD C / 빈 span ns | 보정 배율 |
|---|---:|---:|---:|---:|---:|
| oneOf-5 | 113.17/74.39 | 259 / 149.7 | 597.50/421.26 | 1144 / 154.1 | 5.66× |
| oneOf-10 | 113.17/74.12 | 259 / 150.8 | 775.42/519.42 | 1659 / 154.3 | 7.01× |
| oneOf-20 | 115.29/76.32 | 259 / 150.5 | 1139.00/739.15 | 2689 / 148.7 | 9.69× |
| oneOf-40 | 113.08/73.03 | 259 / 154.7 | 1862.42/1172.00 | 4749 / 145.4 | 16.05× |
| if-then | 32.17/26.97 | 35 / 148.5 | 155.17/120.88 | 210 / 163.3 | 4.48× |
| if-then-guarded | 32.88/27.69 | 35 / 148.2 | 177.21/127.10 | 312 / 160.6 | 4.59× |

| 폼 / 단계 | old 원→보정 µs; C; ns/call | HEAD 원→보정 µs; C; ns/call | HEAD 보정 평균 몫 |
|---|---:|---:|---:|
| oneOf-5 / creation | 0.00→0.00; 0; 149.7 | 5.46→4.07; 9; 154.1 | 1.0% |
| oneOf-5 / mark | 17.83→12.59; 35; 149.7 | 98.20→75.25; 149; 154.1 | 17.8% |
| oneOf-5 / compute | 14.29→11.00; 22; 149.7 | 285.00→189.18; 622; 154.1 | 44.6% |
| oneOf-5 / derive | 2.46→1.56; 6; 149.7 | 1.54→1.08; 3; 154.1 | 0.3% |
| oneOf-5 / transition | 28.58→17.80; 72; 149.7 | 97.04→74.24; 148; 154.1 | 17.6% |
| oneOf-5 / commit | 0.00→0.00; 0; 149.7 | 73.79→47.60; 170; 154.1 | 11.6% |
| oneOf-5 / delivery | 49.41→30.85; 124; 149.7 | 35.76→29.59; 40; 154.1 | 7.0% |
| oneOf-5 / validation | 0.00→0.00; 0; 149.7 | 0.54→0.08; 3; 154.1 | 0.0% |
| oneOf-10 / creation | 0.00→0.00; 0; 150.8 | 5.54→4.15; 9; 154.3 | 0.9% |
| oneOf-10 / mark | 17.59→12.31; 35; 150.8 | 118.83→84.27; 224; 154.3 | 16.3% |
| oneOf-10 / compute | 14.62→11.31; 22; 150.8 | 441.54→277.67; 1062; 154.3 | 52.9% |
| oneOf-10 / derive | 2.54→1.64; 6; 150.8 | 1.50→1.04; 3; 154.3 | 0.2% |
| oneOf-10 / transition | 28.16→17.31; 72; 150.8 | 97.42→74.58; 148; 154.3 | 14.5% |
| oneOf-10 / commit | 0.00→0.00; 0; 150.8 | 74.67→48.44; 170; 154.3 | 9.5% |
| oneOf-10 / delivery | 49.67→30.98; 124; 150.8 | 35.84→29.66; 40; 154.3 | 5.7% |
| oneOf-10 / validation | 0.00→0.00; 0; 150.8 | 0.54→0.08; 3; 154.3 | 0.0% |
| oneOf-20 / creation | 0.00→0.00; 0; 150.5 | 5.46→4.12; 9; 148.7 | 0.6% |
| oneOf-20 / mark | 17.75→12.48; 35; 150.5 | 162.84→107.23; 374; 148.7 | 14.7% |
| oneOf-20 / compute | 15.75→12.44; 22; 150.5 | 756.83→468.05; 1942; 148.7 | 62.6% |
| oneOf-20 / derive | 2.46→1.55; 6; 150.5 | 1.50→1.05; 3; 148.7 | 0.2% |
| oneOf-20 / transition | 27.46→16.62; 72; 150.5 | 101.58→79.58; 148; 148.7 | 10.9% |
| oneOf-20 / commit | 0.00→0.00; 0; 150.5 | 76.71→51.43; 170; 148.7 | 7.1% |
| oneOf-20 / delivery | 50.79→32.13; 124; 150.5 | 34.54→28.59; 40; 148.7 | 4.0% |
| oneOf-20 / validation | 0.00→0.00; 0; 150.5 | 0.54→0.10; 3; 148.7 | 0.0% |
| oneOf-40 / creation | 0.00→0.00; 0; 154.7 | 5.62→4.32; 9; 145.4 | 0.4% |
| oneOf-40 / mark | 15.50→10.09; 35; 154.7 | 252.21→154.22; 674; 145.4 | 13.5% |
| oneOf-40 / compute | 16.67→13.27; 22; 154.7 | 1378.25→840.05; 3702; 145.4 | 71.1% |
| oneOf-40 / derive | 2.42→1.49; 6; 154.7 | 1.67→1.23; 3; 145.4 | 0.1% |
| oneOf-40 / transition | 25.79→14.66; 72; 154.7 | 107.87→86.36; 148; 145.4 | 7.5% |
| oneOf-40 / commit | 0.00→0.00; 0; 154.7 | 78.71→54.00; 170; 145.4 | 4.7% |
| oneOf-40 / delivery | 51.79→32.62; 124; 154.7 | 35.17→29.35; 40; 145.4 | 2.6% |
| oneOf-40 / validation | 0.00→0.00; 0; 154.7 | 0.54→0.11; 3; 145.4 | 0.0% |
| if-then / mark | 7.67→6.78; 6; 148.5 | 54.13→47.10; 43; 163.3 | 38.9% |
| if-then / compute | 7.37→6.63; 5; 148.5 | 56.17→40.16; 98; 163.3 | 33.4% |
| if-then / derive | 0.00→0.00; 0; 148.5 | 1.33→0.84; 3; 163.3 | 0.8% |
| if-then / transition | 0.00→0.00; 0; 148.5 | 5.42→4.11; 8; 163.3 | 3.6% |
| if-then / commit | 0.00→0.00; 0; 148.5 | 20.08→13.22; 42; 163.3 | 10.9% |
| if-then / delivery | 15.92→12.35; 24; 148.5 | 16.38→14.09; 14; 163.3 | 12.4% |
| if-then / validation | 0.00→0.00; 0; 148.5 | 0.21→-0.12; 2; 163.3 | -0.0% |
| if-then-guarded / mark | 7.75→6.86; 6; 148.2 | 47.59→40.36; 45; 160.6 | 31.5% |
| if-then-guarded / compute | 7.46→6.72; 5; 148.2 | 81.25→52.98; 176; 160.6 | 41.6% |
| if-then-guarded / derive | 0.00→0.00; 0; 148.2 | 1.29→0.81; 3; 160.6 | 0.7% |
| if-then-guarded / transition | 0.00→0.00; 0; 148.2 | 5.29→4.01; 8; 160.6 | 3.2% |
| if-then-guarded / commit | 0.00→0.00; 0; 148.2 | 19.21→11.50; 48; 160.6 | 9.3% |
| if-then-guarded / delivery | 17.00→13.44; 24; 148.2 | 18.54→15.33; 20; 160.6 | 12.1% |
| if-then-guarded / validation | 0.00→0.00; 0; 148.2 | 3.92→1.99; 12; 160.6 | 1.7% |

**한 갱신의 의미 있는 호출·루프 횟수.** 호출 census는 시간 계측 없이 별도 수집했고 해당 loop 값은 5개 트리에서 일정했습니다. contexts의 min/max는 한 호출 내부 여러 시점의 크기 차이도 포함하므로 호출 수의 변동으로 읽으면 안 됩니다.

| 폼 | computeNode | gate | select schema / children | 역 owner / dirty | fragment table / child gate | pending read occurrence | control node / parent 선언 | transition round / entry / input |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| oneOf-5 | 5 | 40 | 2/2 | 16/17 | 34/30 | 2 | 27/54 | 1/3/4 |
| oneOf-10 | 5 | 80 | 2/2 | 31/32 | 64/60 | 17 | 42/99 | 1/3/4 |
| oneOf-20 | 5 | 160 | 2/2 | 61/62 | 124/120 | 47 | 72/189 | 1/3/4 |
| oneOf-40 | 5 | 320 | 2/2 | 121/122 | 244/240 | 107 | 132/369 | 1/3/4 |
| if-then | 2 | 2 | 1/1 | 0/2 | 2/1 | 0 | 0/0 | 1/0/1 |
| if-then-guarded | 3 | 4 | 2/2 | 0/2 | 4/2 | 0 | 0/0 | 1/0/1 |

위치: 역 owner/dirty는 `src/core/settle/utils/write/registerRecalculation.ts:20,27`, fragment table/gate는 `src/core/settle/utils/compute/selectChildren.ts:146,160`, root gate 수집은 `src/core/settle/utils/compute/computeNode.ts:78,82,94`입니다. computeNode의 entries는 3B+2, child gate 수집은 3B입니다. `src/core/settle/utils/write/getDependencyIndex.ts:61–70`가 공유 fragment gate를 dormant leaf owner에도 등록해 dirty paths가 많아집니다. `src/core/settle/utils/gates/flushPendingGateReads.ts:101`의 occurrence는 2→107회, 이 fixture에서는 3B−13입니다. `dirtyChildren.ts:18` 순회도 40→355회입니다. 이는 전체 live tree를 순회한 결과가 아니라 authored fragment/의존성 테이블 크기에 따른 작업입니다.

`transitionSettlement.ts:61,66,120` 자체의 entry=3, depth=2, writtenInputs=4는 일정합니다. 그러나 transition에 포함된 finalizeExits가 exit 정책을 읽을 때 `getControlLayers.ts:66,80`에서 node 선언은 27→132(3B+12), parent 선언은 54→369(9B+9)회 훑습니다. 따라서 transition 본체 루프만 일정하다고 round 91 기준 (1)을 충족했다고 할 수 없습니다. (1)은 전체 전환 정착에 대해 **미충족**이고, 내부 exit control 수집에도 잔여 축이 있습니다. getControlLayers의 transition 전용 호출 수는 9로 일정해도 그 안의 loop는 커집니다.

| 묶음 / 폼 | 원→보정 평균 µs | C(own) 또는 C_sub / ns/call | 보정 평균 몫 |
|---|---:|---:|---:|
| B-registration / oneOf-5 | 36.65→22.63 | 91 / 154.1 | 5.2% |
| B-gates / oneOf-5 | 101.72→52.42 | 320 / 154.1 | 12.1% |
| B-table-and-gates / oneOf-5 | 247.94→159.21 | 576 / 154.1 | 36.8% |
| B-control-layers / oneOf-5 | 14.91→9.83 | 33 / 154.1 | 2.3% |
| B-pending-reads / oneOf-5 | 10.41→3.32 | 46 / 154.1 | 0.8% |
| B-transition-controls / oneOf-5 | 11.04→7.35 | 24 / 154.1 | 1.7% |
| B-table-residual / oneOf-5 | 135.82→103.47 | 210 / 154.1 | 23.9% |
| B-registration / oneOf-10 | 57.61→31.99 | 166 / 154.3 | 6.0% |
| B-gates / oneOf-10 | 191.38→92.62 | 640 / 154.3 | 17.5% |
| B-table-and-gates / oneOf-10 | 397.17→240.39 | 1016 / 154.3 | 45.4% |
| B-control-layers / oneOf-10 | 15.95→10.86 | 33 / 154.3 | 2.0% |
| B-pending-reads / oneOf-10 | 41.70→16.08 | 166 / 154.3 | 3.0% |
| B-transition-controls / oneOf-10 | 11.84→8.13 | 24 / 154.3 | 1.5% |
| B-table-residual / oneOf-10 | 164.09→131.68 | 210 / 154.3 | 24.9% |
| B-registration / oneOf-20 | 102.33→55.34 | 316 / 148.7 | 7.4% |
| B-gates / oneOf-20 | 369.51→179.17 | 1280 / 148.7 | 23.9% |
| B-table-and-gates / oneOf-20 | 696.13→414.19 | 1896 / 148.7 | 55.1% |
| B-control-layers / oneOf-20 | 19.17→14.26 | 33 / 148.7 | 1.9% |
| B-pending-reads / oneOf-20 | 103.06→42.69 | 406 / 148.7 | 5.7% |
| B-transition-controls / oneOf-20 | 14.23→10.66 | 24 / 148.7 | 1.4% |
| B-table-residual / oneOf-20 | 223.56→192.33 | 210 / 148.7 | 25.6% |
| B-registration / oneOf-40 | 191.07→101.51 | 616 / 145.4 | 8.6% |
| B-gates / oneOf-40 | 712.91→340.73 | 2560 / 145.4 | 29.0% |
| B-table-and-gates / oneOf-40 | 1279.82→748.31 | 3656 / 145.4 | 63.6% |
| B-control-layers / oneOf-40 | 24.92→20.12 | 33 / 145.4 | 1.7% |
| B-pending-reads / oneOf-40 | 223.01→94.21 | 886 / 145.4 | 8.0% |
| B-transition-controls / oneOf-40 | 18.70→15.21 | 24 / 145.4 | 1.3% |
| B-table-residual / oneOf-40 | 343.90→313.37 | 210 / 145.4 | 26.6% |

oneOf-40에서 gate 자체는 29.0%, selectChildren+selectNodeSchema는 63.6%입니다. gate가 후자의 자손이므로 둘을 합산하지 않습니다. 후속 update의 compute 71.1%를 전부 gate로 설명하는 것도 틀립니다. table 순회, 선택·inactive bookkeeping, output 조립이 남습니다. control 수집 전체의 B=5→40 추가 보정 평균은 10.30 µs이며, 그 50–80%를 줄인다는 B2 가정은 약 5.15–8.24 µs입니다.

**round 91 기준 (2), phase별 검사.**

| phase | oneOf-5..40 | if/then | 판정 및 분류 |
|---|---|---|---|
| mark | 공유 gate를 leaf owner로 확장: 16→121 owner, 17→122 dirty; index constructor는 0 | owner 확장은 0, context/scratch 준비는 동일 | B1/A2 (a); 불필요한 작업군·전파 후보가 남아 있어 충족 아님 |
| compute | 같은 fragment gate를 root와 3개 child 선언에서 각 wheel 재평가, 8B회; active.map은 selectNodeSchema 호출마다 두 번 | 원 fixture gate=2, guard 보충=4; guard는 각 현재 투영을 읽어야 함 | B2/B4/B5 (a), B3 (b); map 중복은 명확하나 gate를 생략하려면 규약 또는 동등 입력 증명이 필요 |
| derive | rule 없는 데도 runDeriveRounds/getDeriveState 각 1회, 실제 round는 0 | 동일 | A1 (a); 빈 phase scaffolding이 남음 |
| transition | entry/exit 각각 3은 필수; exit control가 모든 parent 선언을 반복 스캔 | actual entry/exit=0인 보충 표본에서도 phase·exit helper 진입 | B2/A1 (a); 아직 untouched branch 축 존재 |
| commit | selected ID 복사·revision·commit#·exit memo는 현행 계약. 빈 derive/exit helper는 분리 가능 | guard 보충도 state/schema commit 필요 | A1 (a), reader 없는 payload를 없애려면 A4 (b); 전체 commit를 unused로 판단하지 않음 |
| delivery | 실제 값/revision 대상 수는 분기 수에 무관; no listener여도 payload가 필요 | 동일, guard 조건과 값 의미는 별개 | 현행 계약의 필수 작업; 생략은 A4 (b) |

원 `if-then` 표본에는 validator가 없어 `if` guard가 없고 then이 비활성입니다. 이 표본만으로 조건 전환을 검증했다는 결론을 내리지 않았습니다. 보충 `if-then-guarded`는 이미 설치된 AJV guard를 제공했고 일반 validationMode는 0입니다. guard 비용은 validation으로 분리했습니다. guard가 4회 실행되는 동안 선택된 schema/현재 output이 바뀔 수 있으므로 입력 서명과 투영 세대가 같다는 증명 없이 캐시하지 않습니다. 0.16.0의 if/then 처리와 완전한 구문·전환 의미 동등성도 주장하지 않습니다. 보충 mount의 새 AJV compile 비용은 약 90%여서 원 mount 표와 섞지 않았습니다.

기준 (2) 역시 **미충족**입니다. 배율 개선안으로 기준 (1)/(2)를 대신하지 않았습니다. 아래 B3는 구조 질의이며 아직 선택·구현하지 않았습니다. untouched의 의미는 게이트 진릿값이 그대로인 branch입니다. 공통 /kind 변경은 모든 generic 조건의 의존성을 건드릴 수 있어, 일반식에 무조건 O(1)을 약속할 수 없습니다.

| ID / 분류 | 위치·진단 | 수정 명세 또는 바꿀 설계 | 예상 절감·상한 / 원장 변경 |
|---|---|---|---|
| B1 / (a) | dormant leaf의 역의존성·읽기 계획<br>`src/core/settle/utils/write/getDependencyIndex.ts:61`<br>`src/core/settle/utils/write/registerRecalculation.ts:20`<br>`src/core/settle/utils/gates/flushPendingGateReads.ts:101` | 공유 fragment gate의 의존성 owner를 실제 평가 host 또는 최저공통조상 L로 색인한다. 독립 leaf controls/derived watch와 wildcard 경로는 그대로 둔다. 읽기 계획은 같은 bound path의 최초 flush 순서를 유지하며 중복 occurrence를 접는다. | oneOf-40 등록 102 µs 중 branch-5 대비 추가 약 79 µs가 상한. 그 60–90% 제거 가정 시 약 47–71 µs(약 4–6%); pending-read 계획 절감은 겹침을 분리해 재검증한다.<br>원장 변경 없음 |
| B2 / (a) | controls 목적별 색인과 활성 ID 배열 재사용<br>`src/core/settle/utils/controls/getControlLayers.ts:66`<br>`src/core/settle/utils/controls/getControlLayers.ts:80`<br>`src/core/settle/utils/compute/selectNodeSchema.ts:49` | control key별 정적 contribution 목록을 만들고 선택된 ID에 대해서만 조회한다. node/fragment/children의 우선순위, committed fallback과 상대 경로는 보존한다. active.map 결과를 한 번 만들어 selectedDeclarationIds와 merge에 함께 쓴다. | getControlLayers의 branch-40−5 추가 비용 중 50–80%가 조건부 추정치. active.map 절감은 함수 자체 시간보다 작으며 독립 span이 없으므로 0–1 µs의 가설로만 기록한다.<br>원장 변경 없음 |
| B3 / (b) | 전체 fragment 게이트 휠과 선택 테이블<br>`src/core/settle/utils/compute/computeNode.ts:118`<br>`src/core/settle/utils/compute/selectNodeSchema.ts:21`<br>`src/core/settle/utils/compute/selectChildren.ts:160` | 인식 가능한 discriminator/pure read signature를 가진 fragment에 대한 선택 인덱스 또는 선택적 gate 휠을 새 계약으로 제시해야 한다. generic 조건은 같은 /kind 변경으로 모두 영향을 받을 수 있다. 직전 active set을 출발점으로 쓰는 안은 양의 순환·이력 의존 반례를 다시 판정해야 한다. 이 대안에만 추가로 적용되는 원장은 SETTLE-018/044이다. | oneOf-40 selectChildren+selectNodeSchema 묶음 약 64%가 전체 제거를 가정한 상한. 그 안의 gate 평가 약 29%는 중복 집계하지 않는다. 8B 중 6B 재평가를 접을 수 있다는 추가 증명하에서는 gate 몫의 75%, 전체 약 22%가 더 좁은 상한이다. 선택적 재평가 자체는 BLUEPRINT-007/SETTLE-020 변경 대상이며, 직전 active set 출발까지 채택하면 SETTLE-018/044도 추가로 바뀐다.<br>`BLUEPRINT-007` (`architecture/ledger/blueprint.md:158`), `SETTLE-020` (`architecture/ledger/settle.md:374`) |
| B4 / (a) | 같은 bound read의 pending-output flush 계획<br>`src/core/settle/utils/gates/flushPendingGateReads.ts:74`<br>`src/core/settle/utils/gates/flushPendingGateReads.ts:101` | READ_PLAN에서 동일한 bound read의 첫 등장 순서를 유지하는 정적 path 목록을 만든다. 같은 flush 호출 중 output을 다시 바꾸지 않는 구간만 접고, 재귀 template·opaque guard·서로 다른 relative host 및 새 projection 세대는 기존 경로에 남긴다. 최초로 관측되는 output의 publication 순서는 유지한다. | oneOf-40 묶음 94.2 µs(8.0%) 중 branch-5 대비 추가 90.9 µs의 50–80% 제거 가정: 약 45–73 µs(4–6%). B3의 부모 선택 테이블 몫과 겹치므로 구조안 상한에 더하지 않는다.<br>원장 변경 없음 |
| B5 / (a) | fragment 테이블의 선택·inactive metadata 준비<br>`src/core/settle/utils/compute/selectChildren.ts:146`<br>`src/core/settle/utils/compute/selectChildren.ts:171` | gate wheel의 현재 평가와 publication 순서는 그대로 두고, 정적 contribution/entry 관계를 한 번 색인해 gate 이후의 활성 필드 조합 및 실제 raw/latent/live 값이 있는 inactive 필드 처리만 준비한다. authored key 순서와 null·extras·배열 동작을 보존하며 재귀/opaque/복합 control은 기존 경로에 남긴다. | gate와 pending-read를 뺀 선택 묶음은 oneOf-40 약 313 µs(26.6%)가 느슨한 상한. 그 15–30%를 줄이는 보수적 가정은 약 47–94 µs(4–8%). gate 평가 감소는 B3로 별도 취급하고 이 추정에는 넣지 않는다.<br>원장 변경 없음 |

## (다) 남아 있는 마운트 간극

기존 93C-01 corrected 수치는 nested-d5 3.76×, flat-500 2.25×, 작은 표본 1.52–2.23×, derived 2.92×입니다. 이를 새 상세 계측 결과로 덮어쓰지 않습니다. 아래 공식 기준열과 이번 diagnostic 열은 phase boundary·span 밀도·컴파일 형태가 달라 다른 절대 시간이며, 새로운 합격 판정은 없습니다.

| 폼 | 기존 corrected 배율 | 이번 상세 보정 배율 | HEAD analysis / creation / compute / commit 평균 몫 |
|---|---:|---:|---:|
| sample-0 | 1.52× | 1.53× | 44.2% / 16.1% / 14.2% / 9.5% |
| sample-1 | 1.70× | 1.54× | 44.5% / 17.9% / 16.3% / 9.2% |
| sample-2 | 2.23× | 1.61× | 53.3% / 14.1% / 14.0% / 7.3% |
| sample-3 | 1.95× | 1.98× | 52.6% / 18.2% / 16.2% / 7.5% |
| flat-500 | 2.25× | 2.43× | 51.5% / 22.0% / 15.6% / 9.3% |
| nested-d3-f4 | 2.42× | 2.37× | 47.6% / 23.3% / 15.6% / 9.2% |
| nested-d5-f4 | 3.76× | 3.16× | 50.3% / 23.7% / 16.5% / 8.5% |
| computed-visible-derived | 2.92× | 2.52× | 22.8% / 5.4% / 13.0% / 11.4% |
| oneOf-20 | 4.22× | 3.77× | 33.0% / 2.5% / 10.7% / 2.5% |
| oneOf-40 | 4.88× | 4.11× | 32.4% / 1.7% / 11.0% / 1.6% |

| 폼 | old 원/보정 µs | old C / 빈 span ns | HEAD 원/보정 µs | HEAD C / 빈 span ns | 보정 배율 |
|---|---:|---:|---:|---:|---:|
| sample-0 | 291.13/266.72 | 147 / 166.0 | 479.58/407.68 | 475 / 151.4 | 1.53× |
| sample-1 | 442.46/367.51 | 478 / 156.8 | 782.04/564.49 | 1484 / 146.6 | 1.54× |
| sample-2 | 437.13/383.00 | 337 / 160.6 | 849.46/615.01 | 1601 / 146.4 | 1.61× |
| sample-3 | 1032.96/742.17 | 1972 / 147.5 | 2399.38/1471.29 | 6659 / 139.4 | 1.98× |
| nested-d3-f4 | 1568.13/1001.94 | 3925 / 144.3 | 4064.71/2370.83 | 12303 / 137.7 | 2.37× |
| nested-d5-f4 | 16544.00/7523.87 | 63125 / 142.9 | 51070.96/23746.29 | 196943 / 138.7 | 3.16× |
| computed-visible-derived | 463.16/416.83 | 287 / 161.4 | 1251.92/1048.40 | 1312 / 155.1 | 2.52× |
| flat-500 | 6464.66/3683.08 | 19569 / 142.1 | 18978.33/8933.88 | 72187 / 139.1 | 2.43× |
| oneOf-20 | 1323.54/939.71 | 2566 / 149.6 | 4843.50/3543.42 | 8963 / 145.1 | 3.77× |
| oneOf-40 | 2032.84/1320.59 | 4806 / 148.2 | 7785.96/5434.21 | 16303 / 144.3 | 4.11× |

| 폼 / 단계 | old 원→보정 µs; C; ns/call | HEAD 원→보정 µs; C; ns/call | HEAD 보정 평균 몫 |
|---|---:|---:|---:|
| sample-0 / analysis | 41.08→40.09; 6; 166.0 | 207.50→174.95; 215; 151.4 | 44.2% |
| sample-0 / creation | 162.38→153.24; 55; 166.0 | 92.50→66.16; 174; 151.4 | 16.1% |
| sample-0 / mark | 22.04→18.39; 22; 166.0 | 0.54→0.09; 3; 151.4 | 0.0% |
| sample-0 / compute | 6.71→5.55; 7; 166.0 | 62.54→57.85; 31; 151.4 | 14.2% |
| sample-0 / derive | 8.83→7.84; 6; 166.0 | 0.00→0.00; 0; 151.4 | 0.0% |
| sample-0 / transition | 0.54→0.37; 1; 166.0 | 0.00→0.00; 0; 151.4 | 0.0% |
| sample-0 / commit | 0.00→0.00; 0; 166.0 | 43.34→38.64; 31; 151.4 | 9.5% |
| sample-0 / delivery | 41.42→33.45; 48; 166.0 | 2.96→2.81; 1; 151.4 | 0.7% |
| sample-0 / other | 4.08→3.92; 1; 166.0 | 65.25→62.22; 20; 151.4 | 15.3% |
| sample-1 / analysis | 38.79→37.85; 6; 156.8 | 350.29→246.65; 707; 146.6 | 44.5% |
| sample-1 / creation | 257.38→227.11; 193; 156.8 | 187.00→101.97; 580; 146.6 | 17.9% |
| sample-1 / mark | 44.21→32.29; 76; 156.8 | 1.13→-0.34; 10; 146.6 | -0.1% |
| sample-1 / compute | 11.37→7.77; 23; 156.8 | 106.37→92.74; 93; 146.6 | 16.3% |
| sample-1 / derive | 16.08→12.94; 20; 156.8 | 0.00→0.00; 0; 146.6 | 0.0% |
| sample-1 / transition | 0.71→0.24; 3; 156.8 | 0.00→0.00; 0; 146.6 | 0.0% |
| sample-1 / commit | 0.00→0.00; 0; 156.8 | 63.21→52.51; 73; 146.6 | 9.2% |
| sample-1 / delivery | 67.58→43.27; 155; 156.8 | 3.13→2.98; 1; 146.6 | 0.5% |
| sample-1 / other | 4.00→3.84; 1; 156.8 | 68.92→65.98; 20; 146.6 | 11.6% |
| sample-2 / analysis | 43.71→42.75; 6; 160.6 | 490.33→325.59; 1125; 146.4 | 53.3% |
| sample-2 / creation | 247.79→226.91; 130; 160.6 | 138.38→87.42; 348; 146.4 | 14.1% |
| sample-2 / mark | 40.42→31.42; 56; 160.6 | 0.92→0.04; 6; 146.4 | 0.0% |
| sample-2 / compute | 8.75→7.14; 10; 160.6 | 93.66→86.05; 52; 146.4 | 14.0% |
| sample-2 / derive | 13.58→11.66; 12; 160.6 | 0.00→0.00; 0; 146.4 | 0.0% |
| sample-2 / transition | 0.67→0.34; 2; 160.6 | 0.00→0.00; 0; 146.4 | 0.0% |
| sample-2 / commit | 0.00→0.00; 0; 160.6 | 52.42→45.24; 49; 146.4 | 7.3% |
| sample-2 / delivery | 74.08→54.97; 119; 160.6 | 3.08→2.94; 1; 146.4 | 0.5% |
| sample-2 / other | 3.79→3.63; 1; 160.6 | 68.00→65.07; 20; 146.4 | 10.7% |
| sample-3 / analysis | 55.29→54.41; 6; 147.5 | 1277.04→775.86; 3596; 139.4 | 52.6% |
| sample-3 / creation | 596.74→478.48; 802; 147.5 | 593.54→263.37; 2369; 139.4 | 18.2% |
| sample-3 / mark | 102.37→54.74; 323; 147.5 | 7.76→0.79; 50; 139.4 | 0.1% |
| sample-3 / compute | 26.92→14.97; 81; 147.5 | 286.20→235.47; 364; 139.4 | 16.2% |
| sample-3 / derive | 46.79→34.70; 82; 147.5 | 0.00→0.00; 0; 139.4 | 0.0% |
| sample-3 / transition | 1.04→-0.29; 9; 147.5 | 0.00→0.00; 0; 139.4 | 0.0% |
| sample-3 / commit | 0.00→0.00; 0; 147.5 | 143.58→107.49; 259; 139.4 | 7.5% |
| sample-3 / delivery | 194.25→95.89; 667; 147.5 | 3.13→2.99; 1; 139.4 | 0.2% |
| sample-3 / other | 4.38→4.23; 1; 147.5 | 78.33→75.55; 20; 139.4 | 5.2% |
| nested-d3-f4 / analysis | 64.08→63.22; 6; 144.3 | 1964.63→1141.99; 5975; 137.7 | 47.6% |
| nested-d3-f4 / creation | 823.88→589.19; 1627; 144.3 | 1223.54→544.78; 4930; 137.7 | 23.3% |
| nested-d3-f4 / mark | 176.50→85.04; 634; 144.3 | 6.88→-4.82; 85; 137.7 | -0.2% |
| nested-d3-f4 / compute | 44.04→16.49; 191; 144.3 | 476.46→370.58; 769; 137.7 | 15.6% |
| nested-d3-f4 / derive | 72.57→48.05; 170; 144.3 | 0.00→0.00; 0; 137.7 | 0.0% |
| nested-d3-f4 / transition | 1.88→-1.15; 21; 144.3 | 0.00→0.00; 0; 137.7 | 0.0% |
| nested-d3-f4 / commit | 0.00→0.00; 0; 144.3 | 289.96→217.95; 523; 137.7 | 9.2% |
| nested-d3-f4 / delivery | 348.03→164.26; 1274; 144.3 | 3.75→3.61; 1; 137.7 | 0.2% |
| nested-d3-f4 / other | 5.29→5.15; 1; 144.3 | 105.38→102.62; 20; 137.7 | 4.3% |
| nested-d5-f4 / analysis | 289.79→288.93; 6; 142.9 | 25367.08→12062.22; 95895; 138.7 | 50.3% |
| nested-d5-f4 / creation | 8674.23→4920.86; 26267; 142.9 | 16587.20→5602.84; 79170; 138.7 | 23.7% |
| nested-d5-f4 / mark | 2185.54→723.17; 10234; 142.9 | 86.39→-103.00; 1365; 138.7 | -0.4% |
| nested-d5-f4 / compute | 512.53→73.70; 3071; 142.9 | 5432.50→3727.47; 12289; 138.7 | 16.5% |
| nested-d5-f4 / derive | 877.39→487.29; 2730; 142.9 | 0.00→0.00; 0; 138.7 | 0.0% |
| nested-d5-f4 / transition | 18.17→-30.55; 341; 142.9 | 0.00→0.00; 0; 138.7 | 0.0% |
| nested-d5-f4 / commit | 0.00→0.00; 0; 142.9 | 3072.89→1934.77; 8203; 138.7 | 8.5% |
| nested-d5-f4 / delivery | 3957.26→1031.67; 20474; 142.9 | 3.67→3.53; 1; 138.7 | 0.0% |
| nested-d5-f4 / other | 5.71→5.57; 1; 142.9 | 336.54→333.77; 20; 138.7 | 1.4% |
| computed-visible-derived / analysis | 34.50→33.53; 6; 161.4 | 295.13→238.66; 364; 155.1 | 22.8% |
| computed-visible-derived / creation | 233.92→220.19; 85; 161.4 | 66.75→55.89; 70; 155.1 | 5.4% |
| computed-visible-derived / mark | 63.96→55.40; 53; 161.4 | 111.67→102.21; 61; 155.1 | 9.8% |
| computed-visible-derived / compute | 10.75→8.81; 12; 161.4 | 188.67→136.23; 338; 155.1 | 13.0% |
| computed-visible-derived / derive | 35.50→30.49; 31; 161.4 | 197.25→165.76; 203; 155.1 | 15.8% |
| computed-visible-derived / transition | 0.54→0.38; 1; 161.4 | 101.17→83.17; 116; 155.1 | 7.9% |
| computed-visible-derived / commit | 0.00→0.00; 0; 161.4 | 135.63→119.03; 107; 155.1 | 11.4% |
| computed-visible-derived / delivery | 77.46→61.80; 97; 161.4 | 82.91→77.79; 33; 155.1 | 7.4% |
| computed-visible-derived / other | 4.38→4.21; 1; 161.4 | 68.37→65.27; 20; 155.1 | 6.3% |
| flat-500 / analysis | 184.67→183.82; 6; 142.1 | 9514.67→4634.16; 35075; 139.1 | 51.5% |
| flat-500 / creation | 3461.90→2321.49; 8023; 142.1 | 5916.40→1873.13; 29058; 139.1 | 22.0% |
| flat-500 / mark | 644.16→216.31; 3010; 142.1 | 32.41→-37.30; 501; 139.1 | -0.4% |
| flat-500 / compute | 425.22→282.65; 1003; 142.1 | 2016.86→1388.89; 4513; 139.1 | 15.6% |
| flat-500 / derive | 340.85→198.42; 1002; 142.1 | 0.00→0.00; 0; 139.1 | 0.0% |
| flat-500 / transition | 0.71→0.57; 1; 142.1 | 0.00→0.00; 0; 139.1 | 0.0% |
| flat-500 / commit | 0.00→0.00; 0; 142.1 | 1250.62→830.55; 3019; 139.1 | 9.3% |
| flat-500 / delivery | 1377.37→450.32; 6522; 142.1 | 3.62→3.49; 1; 139.1 | 0.0% |
| flat-500 / other | 5.54→5.40; 1; 142.1 | 181.00→178.22; 20; 139.1 | 2.0% |
| oneOf-20 / analysis | 53.58→52.68; 6; 149.6 | 1583.58→1342.94; 1659; 145.1 | 33.0% |
| oneOf-20 / creation | 651.50→523.16; 858; 149.6 | 119.08→90.80; 195; 145.1 | 2.5% |
| oneOf-20 / mark | 143.09→80.71; 417; 149.6 | 440.03→328.49; 769; 145.1 | 9.0% |
| oneOf-20 / compute | 43.12→21.58; 144; 149.6 | 507.24→389.32; 813; 145.1 | 10.7% |
| oneOf-20 / derive | 118.00→88.08; 200; 149.6 | 4.83→3.53; 9; 145.1 | 0.1% |
| oneOf-20 / transition | 49.54→43.41; 41; 149.6 | 2126.83→1354.59; 5324; 145.1 | 37.8% |
| oneOf-20 / commit | 0.00→0.00; 0; 149.6 | 107.00→87.42; 135; 145.1 | 2.5% |
| oneOf-20 / delivery | 254.72→120.39; 898; 149.6 | 91.58→85.93; 39; 145.1 | 2.4% |
| oneOf-20 / other | 4.75→4.60; 1; 149.6 | 76.50→73.60; 20; 145.1 | 2.0% |
| oneOf-40 / analysis | 68.13→67.24; 6; 148.2 | 2328.17→1881.13; 3099; 144.3 | 32.4% |
| oneOf-40 / creation | 1001.87→756.16; 1658; 148.2 | 123.08→94.95; 195; 144.3 | 1.7% |
| oneOf-40 / mark | 229.38→114.23; 777; 148.2 | 737.12→522.33; 1489; 144.3 | 9.3% |
| oneOf-40 / compute | 59.33→20.20; 264; 148.2 | 830.84→612.59; 1513; 144.3 | 11.0% |
| oneOf-40 / derive | 186.71→130.39; 380; 148.2 | 4.83→3.54; 9; 144.3 | 0.1% |
| oneOf-40 / transition | 51.83→45.76; 41; 148.2 | 3666.66→2252.41; 9804; 144.3 | 41.1% |
| oneOf-40 / commit | 0.00→0.00; 0; 148.2 | 109.00→89.53; 135; 144.3 | 1.6% |
| oneOf-40 / delivery | 425.12→176.44; 1678; 148.2 | 89.63→84.00; 39; 144.3 | 1.5% |
| oneOf-40 / other | 4.92→4.77; 1; 148.2 | 77.04→74.16; 20; 144.3 | 1.3% |

**2N과 실제 생성·분석을 구분한 census.**

| 폼 | runtime 생성 | blueprint build / collect declarations | static first 노드 | assemble / project | DFS loop | generic compute / derive round | constraint 적용 |
|---|---:|---:|---:|---:|---:|---:|---:|
| sample-0 | 3 | 3/3 | 3 | 3/3 | 5 | 0/0 | 6 |
| sample-1 | 10 | 10/10 | 10 | 10/10 | 19 | 0/0 | 20 |
| sample-2 | 6 | 16/16 | 6 | 6/6 | 11 | 0/0 | 22 |
| sample-3 | 41 | 51/51 | 41 | 41/41 | 81 | 0/0 | 92 |
| nested-d3-f4 | 85 | 85/85 | 85 | 85/85 | 169 | 0/0 | 170 |
| nested-d5-f4 | 1365 | 1365/1365 | 1365 | 1365/1365 | 2729 | 0/0 | 2730 |
| computed-visible-derived | 5 | 5/5 | 0 | 15/15 | 0 | 15/4 | 10 |
| flat-500 | 501 | 501/501 | 501 | 501/501 | 1001 | 0/0 | 1002 |
| oneOf-20 | 6 | 63/83 | 0 | 20/20 | 0 | 13/0 | 11 |
| oneOf-40 | 6 | 123/163 | 0 | 20/20 | 0 | 13/0 | 11 |

static first가 가능한 nested-d5/flat-500은 N=1,365/501 노드를 각 한 번 만들고 각 노드의 assemble와 project를 한 번씩 호출합니다. 그래서 2N은 인터페이스 슬롯 횟수이며 독립된 두 번의 전체 DFS라는 뜻이 아닙니다. `src/core/settle/utils/load/loadStaticFirstTree.ts:56`의 한 stack 루프가 entry/postorder를 다루며 반복은 2N−1회입니다. generic computeNode 및 registerRecalculation은 0회입니다. 따라서 현재 정적 폼을 예전의 두 generic settle로 설명할 수 없습니다. `src/core/settle/utils/load/assembleStaticFirstNode.ts:17–38`의 출력 슬롯+wrapper는 nested-d5 4.8%, flat-500 4.9%이고 전체 compute는 각각 16.5%/15.6%입니다. 나머지 compute에는 DFS 상태·호출·값 존재 여부 제어가 들어갑니다. 필수 output 연산 하나하나와 wrapper의 세부 보정은 summary에 남겼으며 극소 helper의 음수 값을 다른 큰 함수에 귀속하지 않았습니다.

생성 단계 22–24%의 대부분은 record allocation만이 아닙니다. `schemaNodeFactory.ts:46`의 runtime effective schema 병합을 빼면 record 생성+경로/전략 준비는 nested-d5 7.2%, flat-500 6.7%입니다. revision ledger 생성은 commit에서 별도로 각각 4.8%/5.4%입니다. 이는 리스너가 없어도 필요한 EVENT 계약이며 노드 constructor와 합쳐 creation 몫을 과장하지 않았습니다.

static 분석과 runtime 생성 각각 N번씩 effective schema를 구성해 applyConstraintKeywords는 2N회입니다. memo가 옵션·mode와 node identity로 분리되고 buildNodes가 정적 분석용 node 사본을 쓰기 때문에 ungated 형태에서도 두 번째 비용이 남습니다. static과 runtime의 contribution·오류 의미가 같은지 증명해야 C1이 (a)로 남을 수 있습니다. applyConstraintKeywords 자기 시간만 보면 보정 몫이 비정상적으로 커 보이지만 자손의 계측 종료 비용을 포함한 exclusive 잔여가 그 부모에 잡힙니다. 이 함수의 상한은 C_sub로 보정한 inclusive 묶음으로 구했습니다. 따라서 keyword family에 마운트 절반을 절감할 수 있다고 주장하지 않습니다.

| 묶음 / 폼 | 원→보정 평균 µs | C(own) 또는 C_sub / ns/call | 보정 평균 몫 |
|---|---:|---:|---:|
| C-output-slots / sample-0 | 20.04→17.62 | 16 / 151.4 | 4.3% |
| C-runtime-merge / sample-0 | 50.90→25.47 | 168 / 151.4 | 6.2% |
| C-keyword-families / sample-0 | 67.71→25.93 | 276 / 151.4 | 6.3% |
| C-revisions / sample-0 | 7.46→7.01 | 3 / 151.4 | 1.7% |
| C-node-record / sample-0 | 41.48→40.57 | 6 / 151.4 | 9.9% |
| C-fixed-mount-own / sample-0 | 64.55→63.19 | 9 / 151.4 | 15.4% |
| C-output-slots / nested-d5-f4 | 2176.32→1134.90 | 7506 / 138.7 | 4.8% |
| C-runtime-merge / nested-d5-f4 | 14515.92→3910.33 | 76440 / 138.7 | 16.5% |
| C-keyword-families / nested-d5-f4 | 18753.92→1330.45 | 125580 / 138.7 | 5.6% |
| C-revisions / nested-d5-f4 | 1321.12→1131.74 | 1365 / 138.7 | 4.8% |
| C-node-record / nested-d5-f4 | 2089.80→1711.03 | 2730 / 138.7 | 7.2% |
| C-fixed-mount-own / nested-d5-f4 | 205.82→204.57 | 9 / 138.7 | 0.9% |
| C-output-slots / flat-500 | 782.24→433.55 | 2506 / 139.1 | 4.9% |
| C-runtime-merge / flat-500 | 5266.23→1362.38 | 28056 / 139.1 | 15.3% |
| C-keyword-families / flat-500 | 6884.54→471.07 | 46092 / 139.1 | 5.3% |
| C-revisions / flat-500 | 552.63→482.92 | 501 / 139.1 | 5.4% |
| C-node-record / flat-500 | 741.44→602.01 | 1002 / 139.1 | 6.7% |
| C-fixed-mount-own / flat-500 | 130.19→128.94 | 9 / 139.1 | 1.4% |

**작은 폼도 내는 고정 준비비.** sample-0은 노드가 3개뿐이어도 per-tree runtime/PathKeyedMap·Set, chain budget/error 상태, dispatchMount, static-first finish와 root onChange 전달을 한 번씩 준비합니다. `src/core/SchemaNode/utils/schemaNodeFactory.ts:63`, `src/core/dispatch/utils/chain/enterSchemaNodeChain.ts:17`, `src/core/settle/utils/load/finishStaticFirstLoad.ts:19`가 위치입니다. 겹치지 않는 own span 준비 묶음 C-fixed-mount-own은 C=9, 빈 span 151.4 ns/call, 원→보정 평균 64.55→63.19 µs(15.4%)입니다. 실제 할당 객체 수와는 다르며, 반복 호출 횟수 1이 고정이라는 뜻이지 실행 시간이 모든 N에서 완전히 같다는 뜻은 아닙니다. 넓은 폼의 root emit/멤버 준비 등 입력 크기의 영향도 있습니다. runtime 오브젝트를 통째로 없애는 안은 오류·budget·revision 계약과 양립하지 않습니다. A2와 같은 부분적인 지연 준비만 (a) 후보이며 이 고정 묶음의 10–25% 정도(약 6.32–15.80 µs)를 보수적인 가설로 기록합니다.

**derived·oneOf의 분석.** derived mount는 runtime 노드 5개, generic compute 15회, derive round 4회입니다. static first=0으로 defaults/derived convergence가 필요해서 정적 폼의 2N 경로와 별개입니다. analysis 약 23%, derive 약 16%, compute 약 13%로, 노드 수 5개만으로 2.92×의 잔여를 설명하지 않습니다. 후속 derived의 두 round와 mount의 네 round를 혼동하지 않았습니다.

oneOf-20은 blueprint build 63, declaration collection 83이지만 runtime 노드는 6개만 생성합니다. 모든 dormant branch의 실제 노드를 만드는 것이 원인이 아닙니다. 기존 원표 oneOf-40 mount analysis의 0.17→1.17 ms에 대응하는 93C-01 phase는 old 0.169→0.100 ms; C=658; 105.4 ns/call, HEAD 1.167→1.167 ms; C=1; 109.6 ns/call입니다(화살표는 원 중앙값→대표 k로 산정한 근사 보정값이며, 기존 summary가 회차별 phase 보정 통계를 제공하지 않으므로 공식 보정 phase 값은 아닙니다). 현재 oneOf-20 상세 analysis는 1.34 ms 중앙값이고 C=1,659, 빈 span 145.1 ns/call, 원→보정 1.584→1.343 ms, 평균 몫 33.0%입니다. `collectGateEvaluationReads.ts:13`는 20회 호출되어 read path 정규식 재분석만 보정 평균 약 0.336 ms(전체 9.4%)입니다. 호출 C=20, 빈 span 비용은 같은 145.1 ns/call, 원 평균 0.339 ms입니다. lexical IR 공유는 (a), 비활성 fragment 분석 자체를 뒤로 미루는 안은 (b)입니다.

| ID / 분류 | 위치·진단 | 수정 명세 또는 바꿀 설계 | 예상 절감·상한 / 원장 변경 |
|---|---|---|---|
| C1 / (a) | 정적·runtime effective schema의 중복 병합<br>`src/core/blueprint/utils/analyze/buildNodes.ts:87`<br>`src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:41`<br>`src/core/SchemaNode/utils/schemaNodeFactory.ts:46` | ungated이며 정렬된 contribution ID, isAtomic/collect 옵션, 오류·warning 결과가 동등한 경우에만 분석 시 결과를 runtime 생성에 전달한다. 모드별 오류 발생 시점과 동일 활성 집합의 참조 안정성은 보존한다. 조건을 증명하지 못한 node는 기존 경로를 사용한다. | 조건 입증으로 runtime 병합의 40–70%를 재사용한다면 nested-d5 약 1.6–2.7 ms(7–12%), flat-500 약 0.5–1.0 ms(6–11%). 상한은 해당 생성 중 병합 묶음 전체이며 분석 전체가 아니다.<br>원장 변경 없음 |
| C2 / (a) | 없는 constraint family와 반복 gate 문자열 분석<br>`src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:43`<br>`src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:57`<br>`src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts:13` | 기여 스키마에 관련 키워드가 없을 때만 boolean/range/enum/const family를 건너뛴다. draft별 boolean bounds, sticky conflict, enum/type 교차 오류는 그대로 유지한다. gate 문자열의 path 토큰 IR은 compileBlueprintExpressions와 공유하되 절대/상대 경로·구문 의미를 보존한다. | constraint 묶음의 30–60% 절감 가정: nested-d5 약 0.4–0.8 ms(2–3%), flat-500 약 0.14–0.28 ms(2–3%). oneOf-20 read 토큰 분석 0.336 ms의 30–60%를 줄이면 별도로 약 0.10–0.20 ms(3–6%); IR 공유 조건의 검증이 필요하다.<br>원장 변경 없음 |
| C3 / (b) | local/emit 출력 계산을 읽기 시점으로 미루는 설계<br>`src/core/settle/utils/load/assembleStaticFirstNode.ts:17`<br>`src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:102` | assemble/project 2N 슬롯을 줄이려면 commit 때 output을 준비한다는 계약과 읽기 무계산 원칙을 바꿔야 한다. root onChange가 전체 emit을 읽는 현재 표본에서는 지연 출력이 다시 전부 materialize되어 절감 0이 될 수도 있다. | nested-d5·flat-500의 실제 assemble/project+wrapper 묶음 약 5%가 상한. compute 단계 전체 약 16%는 DFS/호출 제어까지 포함한 더 느슨한 상한으로, 2N 자체에 전부 귀속하지 않는다.<br>`VALUE-002` (`architecture/ledger/value.md:61`), `VALUE-013` (`architecture/ledger/value.md:230`), `SETTLE-003` (`architecture/ledger/settle.md:90`), `NODE-006` (`architecture/ledger/node.md:141`) |
| C4 / (b) | 비활성 fragment 분석의 지연<br>`src/core/blueprint/utils/analyze/buildNodes.ts:43`<br>`src/core/blueprint/utils/analyze/collectDeclarations.ts:27` | 비활성 branch의 정적 분석을 첫 활성화 시점으로 옮기려면 authored schema의 form 생성 시 분석 및 정적 충돌 오류의 발생 시점을 바꿔야 한다. | oneOf-20 전체 analysis 약 33%가 이론상 상한이며 도달 가능한 절감은 더 작다. ungated 오류 검증과 공통 경로 분석을 유지하면 전체 분석을 제거할 수 없다.<br>`BLUEPRINT-001` (`architecture/ledger/blueprint.md:63`), `BLUEPRINT-012` (`architecture/ledger/blueprint.md:237`), `BLUEPRINT-016` (`architecture/ledger/blueprint.md:299`), `NODE-029` (`architecture/ledger/node.md:471`) |
| C5 / (a) | 작은 폼의 per-tree 고정 준비<br>`src/core/SchemaNode/utils/schemaNodeFactory.ts:63`<br>`src/core/dispatch/utils/chain/enterSchemaNodeChain.ts:17`<br>`src/core/settle/utils/load/finishStaticFirstLoad.ts:19` | 정적 feature 부재가 입증된 빈 error/exit/derive 작업군의 준비만 첫 사용까지 미루거나 readonly capability를 공유한다. root runtime, commit/revision, error budget 및 재진입 독립성은 유지한다. | sample-0 고정 own 묶음 63.2 µs(15.4%)의 10–25% 감소를 가정한 약 6–16 µs. 넓은 폼의 입력 크기 의존 작업까지 같은 비율로 없앨 수 있다는 추정은 하지 않는다.<br>원장 변경 없음 |
| C6 / (a) | 필수 N개 record 생성과 경로 준비<br>`src/core/SchemaNode/utils/schemaNodeFactory.ts:36`<br>`src/core/SchemaNode/SchemaNode.ts:71` | 각 노드의 독립 record·identity·depth·parent 관계는 유지한다. 정적 child name에 escape가 불필요함을 입증한 경로의 regex/중간 문자열 준비만 줄인다. 배열·재귀 occurrence 및 ~ 또는 /가 있는 이름은 기존 escaping을 유지한다. | N개 identity allocation을 없애는 절감은 0으로 둔다. 준비 경로 own 비용의 5–15%를 줄이는 가설은 nested-d5 약 0.06–0.19 ms(0.3–0.8%), flat-500 약 0.02–0.06 ms(0.2–0.7%)이다. 이 작은 후보가 creation 22–24% 전체를 없애지는 않는다.<br>원장 변경 없음 |

**산출물·검증.** 이 보고서의 단계별 median/p99/mean, 함수·loop census, source file:line, node path 방문, calibrated 비용과 inclusive C_sub, 모든 음수 보정 및 가정별 절감 상한은 `diagnosis-94c03-summary.json`에 있습니다. `siteColumns`가 packed site 배열의 열 순서이며 raw timing 파일에는 숫자 시간 samples만 있습니다. 15개 timing 파일은 각각 5 MB 이하, 660개 phase sample 행의 보정식·phase 합계·303 samples·site C 합계·semantic hash를 재계산했습니다. HEAD와 제품 소스 SHA-256을 다시 확인했습니다. 최초 smoke/실패한 출력 및 임시 summary는 최종 산출물에서 제외합니다. 스크립트는 `tools/measure-diagnosis-94c03.mjs` 및 `tools/report-diagnosis-94c03.mjs`입니다. 재현 명령은 `DIAG94_STEM=diagnosis-94c03-final2 node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-diagnosis-94c03.mjs`이며 출력 파일이 존재하면 덮어쓰지 않고 실패하므로 재실행은 별도 DIAG94_STEM을 사용하고 report 스크립트의 REPORT94_INPUT에 그 measurement-summary 파일명을 지정해야 합니다. 현재 파일로 report만 재생성할 때는 최종 summary를 읽으므로 임시 summary가 필요 없습니다. 이 진단은 (a)/(b)의 구현·원장 수정·합격 승격을 수행하지 않았습니다.
