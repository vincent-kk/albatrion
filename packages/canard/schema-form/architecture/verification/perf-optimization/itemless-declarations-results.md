# Itemless branch 배열의 선언 조회 제거 결과

fresh root/nested form의 빈 자리 조회가 N=1000/8000에서 실제1000/8000회→0회로 줄었습니다. 유일한 제품 변경은 완성된 유효 청사진의 전역 자리 선언 부재를 확인하는 E 조건7행입니다. **TEST-027·대기열60에서 수치 수용과 PR 병합을 보류하며 G13 독립 구현/수치 검토도 미완료입니다.** Node primary object-B0와 보조 대조군 세 행의 악화를 포함해 모든 수치를 보존합니다.

## 기준과 범위

검토 당시 기준은 `e714a3b491a38814da7e310e35868b13a1f70d38`, 실행 기준은 `6d7d78d32bfcd9b6822410ecec4fc769dc7aa3f5`입니다. zero-own-commit branch를 non-destructive rebase로 정렬했습니다. 두 기준의 누적 차등18경로는 architecture 문서이며 source/dist/dependencies/manifests/tools 차등0을 별도로 확인했습니다. 이전 PR422/round413의 metadata 수정으로 ancestry가 달라졌으므로 ancestry를 동일성 증명으로 대체하지 않았습니다.

branch는 `perf/schema-form-itemless-declarations`입니다. 보고서 전 구현 HEAD `1b238132bc169e2978d6a0437bf14defe8b4082f`, 전체 src Git tree `2e93c5346439bb7c5669b7c4e67446381e7de32d`, 실제 src regular-file digest `5f6175e5eeb79072de719130137e30feaf9a5f17d35c925505755a260f225f50`에는 검증 파일도 포함됩니다. owning DETAIL을 먼저 `6fcf9420b`로 커밋했고 guard/검증은 `69a0a49b1`, memo identity/측정 보강은 `1b238132b`입니다.

유일 제품 경로는 [declareArrayChildren.ts:23](../../../src/core/engine/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts#L23)이며 SHA256은 `18801a5af94dbb20c633571cc0c9f9353b4b7ef1b9ad87b41a17fd25076d7d39`입니다. production ESM/CJS는 각각 emitted 조건문 한 줄 삽입뿐입니다. agents-hashes는 generatedAt만 달랐습니다. INTENT·기존 시험 기대값·공개 index/manifest·의존성·설정은 불변이고 추적 build 산출물 차등0으로 별도 build 커밋은 없습니다. 새 runtime cache/global/public export는 없습니다. snapshot/extras 등 O(N) 복사는 남아 있으며 M3 whole Form end-to-end와 잔여 지연 수용은 후속 범위입니다.

## 정확한 자격과 memo 보존

branch-array의 완성된 불변 `node.blueprintNode`에서 다음 네 필드가 **모두 undefined**일 때 count/LAST를 읽기 전에 기존 공유 frozen EMPTY를 반환합니다.

```ts
template.item === undefined &&
template.prefixItems === undefined &&
template.itemCandidates === undefined &&
template.prefixItemCandidates === undefined
```

존재하는 빈 목록/null/falsey로 자격을 넓히지 않습니다. raw schema.items나 active branch만으로 판정하지 않습니다. 분석 근거는 package 기준 `src/core/engine/blueprint/buildNodes/buildNodes.ts:40–53,150–158`, `src/core/engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts:23–29,141–227`, `src/core/engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:126–231,247–276`, `src/core/engine/blueprint/blueprint.ts:94–125`입니다. 모든 기여와 inactive 후보를 수집한 뒤 네 필드를 완성하므로 E이면 모든 비음수 자리의 후보가 없고 기존 루프도 같은 EMPTY입니다.

어느 필드든 존재하면 기존 루프·후보 순서·gate/fold·memo를 유지합니다. 후보가 있는 conditional fragment/controls/tuple/additionalItems/recursive/ref는 보수적으로 fallback하며 union/terminal은 기존 dispatcher를 따릅니다. gate가 있어도 전역 부재는 증명될 수 있고 gate 평가 자체는 계속 수행합니다.

LAST(`declareArrayChildren.ts:6–12,31–32,39`)는 같은 함수만 읽고 씁니다. E에서는 모든 count의 result가 같은 EMPTY이므로 count memo 갱신 생략이 반환 참조를 바꾸지 않습니다. ENTRIES(`src/core/engine/blueprint/utils/itemEntry/getItemEntries.ts:5–8,20–25,69`)는 그 함수의 사설 WeakMap이며 빈 자리 선조회만 생략합니다. 다른 소비자의 lazy 조회와 이미 요청한 entry를 유지합니다. 같은 blueprint의 사전0번 entry를 mount/각 동사 뒤 직접 재조회해 source와 실제 두 dist에서 동일 참조를 단언했고 Node/Bun raw 관계는 `preRequested=2,after=2,same=true`입니다.

legacy/tests/barrel/type 선언을 제외한 소비자21파일은 다음과 같습니다. 경로는 이 package 기준이며 줄은 최종 제품 바이트 기준입니다.

| path:line | 소비 의미 |
| --- | --- |
| `src/core/engine/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts:35` | 전체 선언 순서 구성; 이번 변경의 유일한 제품 소비 지점 |
| `src/core/engine/blueprint/utils/itemEntry/getItemEntry.ts:14` | [0]만 반환; 빈 후보는 undefined |
| `src/core/engine/derive/evaluateDeriveRound/utils/inject/getInjectTarget.ts:35` | live 후보 우선/첫 후보·형제 목록; 빈 경우 target 부재 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:80,83` | 도착/출발 후보로 fold 이동 소유권 판단 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:63,93` | 제거 반환값/새 slot node 또는 extras |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/canApplyArrayTail.ts:26` | tail 후보와 live node 동일성 검사 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/prepareArrayAppend.ts:35` | append 자격·effective schema, 빈 경우 extras |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/prepareArraySplice.ts:64` | splice 자격, 빈 entry면 거절 |
| `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/isMissingStaticInput.ts:24` | 첫 후보의 기본값 부재 검사; 빈 경우 false |
| `src/core/engine/settle/utils/compute/childSelection/canReuseArrayChildren.ts:66` | 빈 경우 prior slot 부재 확인 후 계속 |
| `src/core/engine/settle/utils/compute/childSelection/canReuseSplicedChildren.ts:45` | 빈 경우 재사용 거절 |
| `src/core/engine/settle/utils/compute/childSelection/reuseArrayChildren.ts:38` | 빈 경우 continue, 선택 ID/compute 유지 |
| `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:444` | inactive 후보의 배열 fold 수·소유권 |
| `src/core/engine/settle/utils/input/interpretFieldNodeInput.ts:49` | live 또는 단일 후보 해석; 빈 경우 입력 그대로 |
| `src/core/engine/settle/utils/latent/captureArrayLatent.ts:30` | 빈 후보이면 undeclaredValues 저장 |
| `src/core/engine/settle/utils/latent/distributeMovedLatentInput.ts:58` | 이동 대상 후보 부재이면 continue |
| `src/core/engine/settle/utils/latent/readRawTree.ts:29` | 빈 후보이면 extras에서 raw 구성 |
| `src/core/engine/settle/utils/latent/utils/distributeLatentArrayValue.ts:41` | 첫 후보가 없으면 continue |
| `src/core/engine/settle/utils/transition/captureExitedRaw.ts:51` | 후보 수로 fold 퇴장 캡처 판단 |
| `src/core/engine/settle/utils/transition/utils/visitLatentPath.ts:29` | 모든 후보 순회; 빈 경우 하위 방문 없음 |
| `src/core/engine/write/utils/chain/markBatchArrayOperation.ts:57,68` | live 또는 단일 후보의 batch 입력 해석; 빈 경우 원소 그대로 |

object static-first의 다른 lexical ENTRIES는 별개입니다. 후속 interpret/latent/array 동사는 여전히 N개 조회를 할 수 있어 전체 엔진의 조회/메모가 상수라고 주장하지 않습니다.

## 가드와 관측

새 engine test-record 네 파일은 `src/core/engine/__tests__/itemless-declarations.{mount-cost,observations,operations,fallback}.test.ts`이고 exact 사례 수는 **8/21/13/24,합계66**입니다. generic codec/scenes/observer/측정 fixture는 core fixtures, private source adapter는 engine fixtures에 둡니다. 기존 importModel 기대를 유지하여 U/D/S1·B1 오류0을 확인했습니다.

- fail-first는 fresh root/nested×N1000/8000×form 재생성2의8실패이며 actual1000/8000회가 `ITEMLESS_LOOKUP_BOUND`의 상한4회를 초과했습니다. 계약은 **4회 이하**이고 정확히0회를 단언하지 않습니다. 최종 source8과 Node/Bun dist sidecar16행은 실제0회/children0/값·caller 소유 검사를 통과했습니다.
- 최초 D9는 새 시험 네 개와 source adapter의 승인된 배치 정정으로 해결했습니다. old source 부재·target 존재·import 외 본문 동일·literal66·실제 lookup module 동일·기존 surface entry 경유를 확인했습니다. 공개 export나 mock 경로/ignore/면제로 우회하지 않았습니다.
- 새 scene/validator/codec/caller를 매번 만들고 baseline-vs-baseline self와 실제 두 current dist를 비교했습니다. Node/Bun 각각 **58 completed/0 compile-rejected/0 difference**입니다.
- 원본8군은 positive-input11/load6/verbs13/retention4/fallback8/gating7/special-empty4/reuse5=58입니다. 과거49는 앞6군 요약 오류였고 ID 삭제/변경 없이 전체를 실행했습니다.
- 필수27채널은 `nodes,retiredNodes,operationResults,firstListenerCommitSnapshots,snapshot,commit,diagnostics,globalState,counts,deliveryOrder,latent,misfits,declarations,rules,ruleSources,ruleTargets,inactive,inactiveMemo,misfitsMemo,warnings,warningRecords,listenerHistory,onChangeHistory,referenceMatrix,callerBefore,callerAfter,callerOwnershipChecks`입니다. 외부 caller 변조는 별도 추가 채널에 보존합니다.
- typed codec은 sparse/own undefined/NaN/-0/키 순서와 graph 내 alias를 보존합니다. rule의 process-global target ID만 실제 path/kind/known occurrence와 일대일로 대응하며 나머지 key 내용·순서·source/target 연결은 유지합니다.
- `rules-omission,alias-loss,event-loss,rule-target-change` 네 실패 대조군은 각 runtime에서 실제 comparator exit1입니다. rule stores를 삭제하는 기존 observer를 완전 oracle로 사용하지 않았습니다.
- defaults/automatic writes·잘못된 종류·frozen input·모든 동사·Overwrite/Merge·batch·퇴장/복귀·inactive fragment·controls·tuple/boolean·union·recursive/ref·사전 memo·derive/inject를 포함합니다. derive/inject는 eligible list와 선언된 sibling target을 함께 검증하며 실제 blueprint 네 필드 present 여부를 기록합니다.

### 대기열59

engine API 전후 caller와 engine이 보관한 이전 컨테이너의 제자리 무변조는 단언합니다. 기존 baseline은 초기 defaultValue의 loadSnapshot이 caller array 자체여서 외부 push가 snapshot 길이2→3으로 보이고, 공유 nested 배열을 외부에서 수정하면 이전 extras/local/snapshot도 바뀝니다. 반례와 얕은 복사 근거(`src/core/engine/settle/utils/input/arrayExtras.ts:20`, `src/core/engine/settle/utils/input/interpretFieldNodeInput.ts:55`)를 보존했습니다. 이 외부 변조의 실제 관계/내용/이벤트를 두 판에서 비교해 차이0을 확인했으며 깊은 격리·초기 snapshot 새 보장은 **대기열59 미결**입니다. 이번 E에서 변경하거나 현재 별칭을 영구 수용하지 않습니다.

## 패키지 게이트와 readiness

최종 보강 입력의 네 명령을 직렬 실행했고 모두 exit0입니다. 이전 실패/성공 로그도 보존합니다.

| 명령 | 결과 |
| --- | --- |
| `yarn workspace @canard/schema-form typecheck` | exit0 |
| `yarn workspace @canard/schema-form lint` | exit0 |
| `yarn workspace @canard/schema-form test --run --reporter=default --reporter=json --outputFile=/Users/Vincent/Workspace/albatrion/l3e-direct-ownership/.seiri/tasks/itemless-declarations/run-task_b9d615956067/test-corrected.vitest.json` | 763파일/4851pass/1todo/0fail |
| `yarn workspace @canard/schema-form build` | exit0,추적 build 차등0 |

unit/render/react18/production/storybook(chromium)이 실제 포함됐고 story suite는100개입니다. 기존 todo/expectation은 그대로입니다. 사전 memo의 사후 직접 재조회 단언은 가드 틈 보완으로 추가한 뒤 이 네 게이트와 두 dist 전체 비교를 재실행했습니다. 앞선 red의 threshold/해석 module과8사례는 유지했습니다.

`bench/distEngine/check-mount-readiness.mjs`의 Node/Bun×adapter/first-batch 네 조합은 각각 **28pass/4unsupported/0fail**입니다. 그 도구·dist·runtime/dependency 입력의 동일성을 확인해 재사용했으며 새 실행이라고 쓰지 않습니다. 이 기존 nested 표면과 아래 직접 root legacy 비동기를 구별합니다.

실제 성공 marker는 `ITEMLESS_BASELINE_OK,ITEMLESS_PLAN_READY`(계획/기준), `ITEMLESS_COST_RED_OK,ITEMLESS_COST_GREEN_OK,ITEMLESS_OBSERVATIONS_OK,ITEMLESS_FALLBACK_OK,ITEMLESS_PACKAGE_GATES_OK,ITEMLESS_READINESS_OK,ITEMLESS_SCOPE_OK,ITEMLESS_MEASUREMENT_OK`입니다. 최종 handoff는 별도 실제 본문/표 검사로 확인하고 G13은 독립 검토입니다.

## 창과 완료 경계

원본 창 UTC **2026-10-18T15:10:52.832Z–15:10:58.782Z**은 Node1에서 callback0→drain1을 검출해 failed로 닫았습니다. 원본 고정 루프와 동일 입력 무타이머 재현상 첫 지원 legacy root-BN-N1000 warmup에 해당합니다. Bun/둘째 라운드와 유효 성능 결과는 없고 부분 표본을 섞지 않았습니다. 원본 tool SHA `5cf132a65a870590d91e26a6372c7454a0d0ea5ce62d251c02e2005cc8ab8033`와 driver/log/window를 보존했습니다.

교정 창 UTC **2026-10-18T15:43:31.021Z–2026-10-18T15:46:38.200Z**에서 Node **v24.20.0**/Bun **1.4.3**의 Node1→Bun1→Node2→Bun2를 직렬 실행하고 둘째 장면·판 순서를 뒤집었습니다. 이전 Node26 창의 절대값/비율과 연결하지 않습니다. supervisor idle,전/중간/후 PS 겹침0,source/dist/Winglet/14실행 입력의 전후 동일성,gate 종료 후 창 시작을 확인했습니다.

무타이머 preflight는 runtime당 primary9+reference5의14형상×3판=42행,합계84행입니다. 실제 동기 안정34/constructor 미지원4/async root 미측정4를 구분했습니다. 시간 행은 실행당 primary19(current18+동기 legacy object1)+reference15=34행이며 네 실행 **136행/13600표본/2720warmup**,primary current72행을 검산했습니다. 각 행 warmup20/sample100이며 factory+mount+canonical 후위 공개값 materialization을 clock 안에,fixture/검사/drain을 밖에 둡니다. 이후 전위치 값/키/경로/전략/caller/flags와 callback 안정성을 단언합니다.

legacy primary itemless4는 **CONSTRUCTOR_UNSUPPORTED**입니다. constructor가 지원하는 직접 root BN/terminal4는 **UNVERIFIED_ASYNC_ROOT**로 실제 비동기 완료 시간이 미측정이며 unsupported/0ms/PASS가 아닙니다. 기존 /h reference5는 같은 입력/완료 경계의 세 판이며 primary root 절대값·배율과 연결하지 않습니다. primary legacy object는 같은 직접 root fixture 안에서만 비교합니다. 직접 root 비동기 실제 완료 시간·M3 whole Form은 후속 범위입니다.

## 모든 수치

단위는 ms이며 Δ=(candidate/base−1)×100으로 음수가 더 빠릅니다. 범위는 두 바퀴 Δ의 min/max이며 0을 가로지르면 차이가 입증되지 않았습니다.

| runtime | primary 장면 | B1 | C1 | B2 | C2 | Δ1% | Δ2% | Δ min/max% | 관측 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| node | root-itemless-N1000 | 0.511354 | 0.186667 | 0.450813 | 0.133459 | -63.496 | -70.396 | -70.396 / -63.496 | 두 바퀴 모두 빠름 |
| node | root-itemless-N8000 | 2.084937 | 0.231792 | 2.258833 | 0.351000 | -88.883 | -84.461 | -88.883 / -84.461 | 두 바퀴 모두 빠름 |
| node | nested-itemless-N1000 | 0.770479 | 0.235396 | 1.022063 | 0.165979 | -69.448 | -83.760 | -83.760 / -69.448 | 두 바퀴 모두 빠름 |
| node | nested-itemless-N8000 | 2.099104 | 0.359687 | 2.333041 | 0.410604 | -82.865 | -82.400 | -82.865 / -82.400 | 두 바퀴 모두 빠름 |
| node | root-BN-N1000 | 3.129687 | 2.821312 | 2.958438 | 3.007605 | -9.853 | 1.662 | -9.853 / 1.662 | 차이 입증 안 됨 |
| node | root-BN-N8000 | 30.087562 | 28.245958 | 28.201750 | 27.955792 | -6.121 | -0.872 | -6.121 / -0.872 | 두 바퀴 모두 빠름 |
| node | root-terminal-N1000 | 0.133604 | 0.070041 | 0.115875 | 0.064833 | -47.575 | -44.049 | -47.575 / -44.049 | 두 바퀴 모두 빠름 |
| node | root-terminal-N8000 | 0.093521 | 0.085458 | 0.063958 | 0.071750 | -8.621 | 12.182 | -8.621 / 12.182 | 차이 입증 안 됨 |
| node | object-B0-N1000 | 1.103042 | 1.256250 | 0.956875 | 1.091417 | 13.890 | 14.061 | 13.890 / 14.061 | 두 바퀴 모두 느림 |
| bun | root-itemless-N1000 | 0.190459 | 0.207917 | 0.198167 | 0.140084 | 9.166 | -29.310 | -29.310 / 9.166 | 차이 입증 안 됨 |
| bun | root-itemless-N8000 | 1.203000 | 0.642250 | 1.353105 | 0.685062 | -46.613 | -49.371 | -49.371 / -46.613 | 두 바퀴 모두 빠름 |
| bun | nested-itemless-N1000 | 0.320209 | 0.172542 | 0.373666 | 0.108458 | -46.116 | -70.975 | -70.975 / -46.116 | 두 바퀴 모두 빠름 |
| bun | nested-itemless-N8000 | 1.237792 | 0.605417 | 1.346979 | 0.730354 | -51.089 | -45.778 | -51.089 / -45.778 | 두 바퀴 모두 빠름 |
| bun | root-BN-N1000 | 2.103000 | 2.004208 | 2.194103 | 2.124104 | -4.698 | -3.190 | -4.698 / -3.190 | 두 바퀴 모두 빠름 |
| bun | root-BN-N8000 | 19.041667 | 18.630791 | 18.947062 | 18.878979 | -2.158 | -0.359 | -2.158 / -0.359 | 두 바퀴 모두 빠름 |
| bun | root-terminal-N1000 | 0.065208 | 0.095729 | 0.106708 | 0.067041 | 46.806 | -37.173 | -37.173 / 46.806 | 차이 입증 안 됨 |
| bun | root-terminal-N8000 | 0.079146 | 0.084770 | 0.076063 | 0.069938 | 7.106 | -8.053 | -8.053 / 7.106 | 차이 입증 안 됨 |
| bun | object-B0-N1000 | 0.329938 | 0.482313 | 0.492583 | 0.296354 | 46.183 | -39.837 | -39.837 / 46.183 | 차이 입증 안 됨 |

다음 표는 각 행 안에서만 같은 fixture/완료 경계의 세 판을 비교합니다. `/h` reference의 절대값·배율을 primary root 행과 연결하지 않습니다. 초기 callback은 현재1/동기 legacy0을 유지합니다.

| runtime | cohort · 장면 | L1 | B1 | C1 | L2 | B2 | C2 | C/L1 | C/L2 | C/L min/max |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| node | reference /h · reference-BN-N1000 | 1.466729 | 3.171875 | 3.050688 | 1.259271 | 3.115749 | 3.089999 | 2.080 | 2.454 | 2.080 / 2.454 |
| node | reference /h · reference-BN-N8000 | 10.220917 | 30.765938 | 28.812708 | 10.513646 | 28.766124 | 25.307167 | 2.819 | 2.407 | 2.407 / 2.819 |
| node | reference /h · reference-terminal-N1000 | 1.411292 | 0.109416 | 0.512687 | 1.172062 | 0.302562 | 0.244813 | 0.363 | 0.209 | 0.209 / 0.363 |
| node | reference /h · reference-terminal-N8000 | 36.376062 | 0.111416 | 0.118146 | 36.338042 | 0.156917 | 0.159167 | 0.003 | 0.004 | 0.003 / 0.004 |
| node | reference /h · reference-object-B0-N1000 | 0.028895 | 0.783500 | 0.843166 | 0.052833 | 1.128812 | 1.164167 | 29.180 | 22.035 | 22.035 / 29.180 |
| node | primary root · object-B0-N1000 | 0.038501 | 1.103042 | 1.256250 | 0.028083 | 0.956875 | 1.091417 | 32.629 | 38.863 | 32.629 / 38.863 |
| bun | reference /h · reference-BN-N1000 | 1.042667 | 2.441416 | 2.238000 | 0.797979 | 2.533230 | 2.702624 | 2.146 | 3.387 | 2.146 / 3.387 |
| bun | reference /h · reference-BN-N8000 | 5.975584 | 18.688250 | 18.459063 | 5.797583 | 21.060229 | 20.854062 | 3.089 | 3.597 | 3.089 / 3.597 |
| bun | reference /h · reference-terminal-N1000 | 2.359979 | 0.063187 | 0.124458 | 2.123500 | 0.117020 | 0.263104 | 0.053 | 0.124 | 0.053 / 0.124 |
| bun | reference /h · reference-terminal-N8000 | 87.454521 | 0.067458 | 0.065479 | 87.673188 | 0.124292 | 0.121625 | 0.001 | 0.001 | 0.001 / 0.001 |
| bun | reference /h · reference-object-B0-N1000 | 0.205084 | 0.355041 | 0.294042 | 0.180208 | 0.542791 | 0.304813 | 1.434 | 1.691 | 1.434 / 1.691 |
| bun | primary root · object-B0-N1000 | 0.293270 | 0.329938 | 0.482313 | 0.121980 | 0.492583 | 0.296354 | 1.645 | 2.430 | 1.645 / 2.430 |

보조 `/h` cohort 안의 current 전후 차등도 별도로 보존합니다.

| runtime | reference 장면 | B1 | C1 | B2 | C2 | Δ1% | Δ2% | Δ min/max% | 관측 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| node | reference-BN-N1000 | 3.171875 | 3.050688 | 3.115749 | 3.089999 | -3.821 | -0.826 | -3.821 / -0.826 | 두 바퀴 모두 빠름 |
| node | reference-BN-N8000 | 30.765938 | 28.812708 | 28.766124 | 25.307167 | -6.349 | -12.024 | -12.024 / -6.349 | 두 바퀴 모두 빠름 |
| node | reference-terminal-N1000 | 0.109416 | 0.512687 | 0.302562 | 0.244813 | 368.567 | -19.087 | -19.087 / 368.567 | 차이 입증 안 됨 |
| node | reference-terminal-N8000 | 0.111416 | 0.118146 | 0.156917 | 0.159167 | 6.040 | 1.434 | 1.434 / 6.040 | 두 바퀴 모두 느림 |
| node | reference-object-B0-N1000 | 0.783500 | 0.843166 | 1.128812 | 1.164167 | 7.615 | 3.132 | 3.132 / 7.615 | 두 바퀴 모두 느림 |
| bun | reference-BN-N1000 | 2.441416 | 2.238000 | 2.533230 | 2.702624 | -8.332 | 6.687 | -8.332 / 6.687 | 차이 입증 안 됨 |
| bun | reference-BN-N8000 | 18.688250 | 18.459063 | 21.060229 | 20.854062 | -1.226 | -0.979 | -1.226 / -0.979 | 두 바퀴 모두 빠름 |
| bun | reference-terminal-N1000 | 0.063187 | 0.124458 | 0.117020 | 0.263104 | 96.967 | 124.836 | 96.967 / 124.836 | 두 바퀴 모두 느림 |
| bun | reference-terminal-N8000 | 0.067458 | 0.065479 | 0.124292 | 0.121625 | -2.934 | -2.146 | -2.934 / -2.146 | 두 바퀴 모두 빠름 |
| bun | reference-object-B0-N1000 | 0.355041 | 0.294042 | 0.542791 | 0.304813 | -17.181 | -43.843 | -43.843 / -17.181 | 두 바퀴 모두 빠름 |


두 바퀴 모두 느린 관측은 primary Node object-B0 **+13.890/+14.061%**,reference Node terminal8000 **+6.040/+1.434%**,reference Node object-B0 **+7.615/+3.132%**,reference Bun terminal1000 **+96.967/+124.836%**입니다. 비자격 경로에서도 이를 무해/노이즈로 수용하지 않으며 그 경로의 빠른 관측에도 E의 인과 효과를 부여하지 않습니다. 구현자의 자체 재계산이며 별도 독립 검증은 아닙니다. **대기열60이 TEST-027 수치 수용과 PR 병합을 보류**하며54/58 잔여 지연·legacy 차이,59 격리 정책,G13도 미완료입니다.

## Filid와 자동 제외

facts2600 accepted/0 rejected 뒤 scan summary→여섯 scope validate→전체 verification을 한 번 수행했고 세 snapshot은 `083a8fbee0c75a1aea39e919d7c385e5f391a26e9e96a08d4f5dc4918e2fc12c`로 같습니다. **전역 FAIL/분석 INDETERMINATE**입니다. 구조 raw384=error24/warning52/면제info308,non-exempt 고유76이며 check passed5112/failed19/skipped308과 raw error 수를 구별합니다. verification 위반24는 구조 finding에 중복 포함됩니다.

진단130(detail-document-contract33/intent-document-contract20/unresolved-local-dependency4/unowned-local-dependency73)과 모든 finding의 원문 signature는 기존 감사 대비 차등0입니다. 문서 수정·참조 해소/소유 증명·재검사 nextAction을 전체 원문에 보존했고 범위 밖 기존 계약을 고치거나 면제하지 않았습니다. facts exact2600도 미해결 dependency/동적 case를 PASS로 만들지 않습니다. 새 test-record 네 파일은 exact8/21/13/24이고 변경 경로 새 확정 finding0입니다.

기존 `**/fixtures`·`**/__benchmarks__`·`**/architecture` 제외를 유지합니다. adapter/generic·측정 fixtures/runner/report는 SHA·배치·import·실행으로 수동 확인하며 자동 role/cap/구조 PASS가 아닙니다. 교정 후 facts epoch `sha256:826785af7b05501b8e9b224629d47ba35609fd7806e71b77e5fa36485fd8722f`,2600exact/0missing/0needsResolution이 불변이고 수정은 제외 경로뿐이어서 전체 scan을 반복하지 않았습니다. 제품·test-document·public surface 감사 입력은 같습니다.

Scan complete: 76 findings

## 정체성과 원자료

| 항목 | SHA256 |
| --- | --- |
| baseline raw production ESM | `20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd` |
| candidate raw production ESM | `00d4f9d61241d9aa672f9e1bb7d6735d7e0088a8a9f741013233dc9f66e8d5d4` |
| baseline raw CJS | `6317f3af5139325b5e71f511f7f2f5cc417ca05a93d497ceb1384490cdaec8c5` |
| candidate raw CJS | `7e1cffb2933fb3b0f2e78188f97248d54205241d18064cf242cbe6fb8b9e4b88` |
| baseline agents-hashes | `d5eccbed92c97b9db22a8744905a70b19e5d1bd1a7185cc4128f05bba7e1e638` |
| candidate agents-hashes(generatedAt 차이) | `da93d8ff986f7cc20134063c7437e7a3e3e436b005f59cb987474e82e26ae764` |
| baseline export-only 실행물 | `7156e405b28533ec1d74a9b0f930318764b599c818fe42a6225f74cdaf8b8e32` |
| candidate export-only 실행물 | `f6e614978c8aa9c042afab906da3f01e50fce1e58127c5806941391cbf74181c` |
| legacy0.16.1 원본 | `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46` |
| legacy export-only 실행물 | `8724b4d98ceea5b27dae868ff228f8eb315fe8e70a34e2a540827499ffda605c` |
| compiled observation fixture | `aa1d1f976a321950653b1e7d5814bdba3e10dbea59a820bee468dadf1d1bce4a` |
| 14실행 입력 manifest | `d580481ed908a549f61e597b360b08d723919f5749c914524a3111cce5fe819f` |
| unchanged dependency1054파일 manifest | `a06ec8a88d3e7aa5d78d4d6580586df167c5c0d27b5610790841204d8eaab2d8` |
| baseline 산출물2209파일 manifest | `c997a4321c867442466a289e8da7d98f8ff6b63911abbd716159cb1abda8e6cc` |
| 이전 실행 도구55파일 manifest | `ff4acd0fcfa49d61bca8d11c0f187ae7009f223976788a78d9674da202152f08` |
| manifests73파일 manifest | `16ec58f06e53b5ac70c351c4c13f0fe576e49bbc94478bdb2b0e6413a4520140` |

manifest는 보존한 레코드 배열의 JSON SHA256입니다. 양 판은 같은 node_modules/Winglet resolution root와 dependency 바이트를 사용합니다. 계수 instrumented 사본은 시간 측정에 쓰지 않았습니다.

| 실행 도구/입력 | 버전 | SHA256 |
| --- | --- | --- |
| `node` | v24.20.0 | `9d050fd455b56426e25d4d603c7c501cbb2630348e836cf221dcce748e90588a` |
| `bun` | 1.4.3 | `28c7dd0a06916aba284d570ef44a2d70e9c538eaf2ba58dfe0910525563b3f79` |
| `yarn` | 4.12.0 | `9f6dcacd3a256eedf09e382b14c4fd6a9e62e8c8009e64116997621bbd6531dd` |
| `typescript` | 5.9.2 | `029ac2b6f5337e62071559dddd2fc7648d355e253392b03dc1e207276344d799` |
| `vitest` | 3.2.6 | `d207c396b9e41b3987bc24e335e808d9bd09c5841044d33b073cebbbc0154a37` |
| `esbuild` | 0.25.9 | `e233396b4bafde87ff97cc0c2297a78e13435e9693745e5fb73848921b361373` |
| `rolldown` | 1.2.0 | `8130b63b27d064688ed3799545c240c5a7c31db206ed7f956bc9239d31cc1545` |
| `packages/canard/schema-form/bench/distEngine/loadDistEngine.ts` | 동결 입력 | `343857dd924916ef59c369033bf654692506cb3024022a8a61065385ed8f8f7d` |
| `packages/canard/schema-form/bench/distEngine/check-mount-readiness.mjs` | 동결 입력 | `8323bbac69f80708ef2e4466478ba31126ba268e275a0c8c0631104e7900b664` |
| `packages/canard/schema-form/architecture/verification/perf-optimization/first-batch/b-a2/bench-common.mjs` | 동결 입력 | `2c28118bafe1b429d78a6840649acd38874ce46ddeb792ba0e7146a199b8ef95` |
| `packages/canard/schema-form/src/core/__benchmarks__/itemless-declarations.mjs` | 동결 입력 | `e9750cd22a587c6a1440e1076465f16d7c6845eab713971b82aa43a787223c96` |
| `packages/canard/schema-form/src/core/__tests__/fixtures/itemlessDeclarations/measurements.mjs` | 동결 입력 | `22e282801f1a9f878160164af9adef2bdecaf1f4c13c7a78a8aaab3ca8d8c187` |
| `.seiri/tasks/itemless-declarations/quiet-window.mjs` | 동결 입력 | `052f64aa1a108d37bec444d2097a66cb5cf056ed50f2138c4277cc53e1d6495e` |
| `.seiri/tasks/itemless-declarations/checks.mjs` | 동결 입력 | `9e291c96b089a3d19414c718f5737c10812e5f37237e99658ad902e4f093c748` |

로컬 raw root는 `.seiri/tasks/itemless-declarations/run-task_b9d615956067/`입니다. baseline-identity/reviewed-plan/baseline,cost-red,test-corrected,corrected-final 비교/preflight/count,corrected-quiet-window,corrected-measure 네 실행,measurement-summary/final-metadata,Filid 원문과 이전 실패를 보존했습니다. 기존 raw246 aggregate `a794cf1f1316e0e3e3b8d496889ac15cd29dd1dc06d161954b3b026e73b35bf3`는 불변이며 raw·ignored 자료를 Git에 넣지 않았습니다.

주요 실제 명령은 repo root에서 `node packages/canard/schema-form/src/core/__benchmarks__/itemless-declarations.mjs prepare --label=corrected-final`,Node/Bun의 `preflight/compare/count --label=corrected-final`와 원장 CHECK입니다. 측정은 별도 승인 driver가 `measure --label=corrected-final --measurement-prefix=corrected-measure --round=1/2`를 위 순서로 실행했습니다.
