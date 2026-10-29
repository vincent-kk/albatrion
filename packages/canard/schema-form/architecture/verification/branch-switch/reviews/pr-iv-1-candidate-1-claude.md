# Ⅳ-1 후보 독립 검토 판정 (읽기 전용)

검토 대상은 perf/schema-form-iv-1-local-wheel 브랜치이며 기준은 99f6ce04f입니다. 검토 중 머리가 b9e508436에서 4e02ac625를 거쳐 0cc800d28로 움직였습니다. 제품 소스 변경은 65f008680에서 끝나고, 그 뒤 다섯 커밋은 시험과 측정 장치만 바꿉니다. 아래 경로는 모두 packages/canard/schema-form 기준입니다.

## 판정

**FAIL**입니다. P1 0건, P2 2건, P3 9건입니다.

제품 쪽에서는 관측 차이를 만드는 결함을 코드 읽기로 찾지 못했습니다. 범위 표 규칙, 쓰기 시점 후퇴, 국소 바퀴, verify 증인은 설계대로 배선되어 있습니다. FAIL 사유는 두 P2이며 둘 다 시험 결함입니다. 첫째, 런타임 검사로 막을 수 없는 if 게이트 규칙을 지키는 시험이 그 규칙 없이도 통과합니다. 둘째, DETAIL이 검증한다고 적은 후퇴 조건 다수와 계산 뒤 후퇴 경로에 시험이 없습니다. 두 수정은 시험과 DETAIL만 바꾸므로 제품 바이트와 측정 창 번들은 그대로입니다(P2-2의 조건부 한 줄은 예외이며 아래에 적었습니다).

## 발견

### P2-1 (확인됨) if 호스트 규칙의 시험이 required 간선 때문에 규칙 없이도 통과합니다

- 근거: src/core/engine/blueprint/__tests__/blueprint.local-wheel-scopes.test.ts:87-100의 then이 `{ required: ['n'] }`입니다(95행). 이 overlay 선언은 src/core/engine/blueprint/utils/settlement/collectSettlementScopeEdges.ts:45-52에서 required 간선 `/h → /h/n`을 만듭니다. 이 간선 하나만으로 /h/n이 닫히지 않아 범위가 /h로 올라갑니다. 따라서 if 간선을 만드는 같은 파일 68-69행을 지워도 이 시험은 '/h'로 통과합니다.
- 왜 중요한가: if 게이트에는 런타임 방어선이 없습니다. 역의존 색인은 active 식만 게이트 식으로 찾고(src/core/engine/settle/utils/gates/getGateExpression.ts:24), blueprint.dependencies는 watch와 식 컨트롤만 등록합니다. 그래서 if 조건의 읽기는 dependencyOwnerPaths에 들어가지 않습니다. registerRecalculation.ts:109-111이 if 호스트를 shape dirty로 표시해도 resolveSettlementScope.ts는 shapeDirtyPaths를 보지 않습니다. 22행과 79장면에도 비루트 범위 아래 if 게이트가 없습니다(Ⅳ-0 후보 1 검토 P2-3). 정적 if 간선이 유일한 방어선인데 그 방어선을 지키는 시험이 없습니다.
- 실패 시나리오: 이후 변경이 68-69행을 깨뜨려도 모든 시험이 통과합니다. 그러면 `/h`의 if가 `/h/a/b`를 읽는 스키마에서 `/h/a/b` 쓰기가 `/h/a`에서 국소로 돌고 then/else 전환을 놓칩니다. 값, children, 이벤트가 루트 정착과 달라지며, 그 형상의 시험이 없으므로 verify 증인도 잡지 못합니다.
- 같은 종류의 불일치: blueprint/DETAIL.md:116은 "공유 참조의 보수 후퇴를 검증합니다"라고 적지만, 재결합되지 않은 occurrence(collectSettlementScopeEdges.ts:37-39), virtual 노드(:36), 불완전한 식 읽기(:101-105)의 시험이 없습니다.
- 수정 명세(시험만 바꿉니다):
  1. blueprint.local-wheel-scopes.test.ts:95의 `then: { required: ['n'] },`를 `then: { properties: { y: { type: 'number' } } },`로 바꿉니다. 기대값 '/h'는 그대로 둡니다.
  2. 같은 describe에 'raises a candidate below an if host that reads inside it' 시험을 더합니다.
     expect(blueprint({ type: 'object', properties: { h: { type: 'object', properties: { a: { type: 'object', properties: { b: { type: 'number' } } } }, if: { properties: { a: { properties: { b: { const: 1 } } } } }, then: { properties: { y: { type: 'number' } } } } } }).settlementScopes?.get('/h/a/b')).toBe('/h');
     이 스키마에는 if 간선 말고 다른 간선이 없으므로, 규칙이 없으면 '/h/a'가 나옵니다.
  3. virtual 노드(options.virtual 형제 필드)를 가진 스키마와, 청사진 안에 `entry.node.path !== appendSegment(node.path, entry.name)`인 child entry가 실제로 생기는 재귀 $ref 스키마에 대해 시험을 하나씩 더합니다. 각 시험은 먼저 그 전제(virtual 노드가 있음, 경로가 다른 child entry가 있음)를 단언하고, 그다음 표의 모든 값이 ''인지 단언합니다. 전제 단언이 있어야 공허하게 통과하지 않습니다.
  4. 확인 방법: 새 단언마다 대응하는 규칙 줄(68-69, 36, 37-39)을 지역적으로 지웠을 때 실패하는지 보고 되돌립니다. 지운 상태는 커밋하지 않습니다.

### P2-2 (확인됨) 쓰기 시점 후퇴 조건 다수와 계산 뒤 후퇴 경로에 시험이 없습니다

- 근거: settle/DETAIL.md:356은 split host 후퇴와 "재결합하지 않은 공유 occurrence의 표는 사용하지 않습니다"를 검증 기준으로 적습니다. 그러나 src/core/engine/settle/__tests__/settle.local-wheel-resolution.test.ts:40-99는 외부 소유자, load, batch, distributedInputs, pathChanges, cause, pending exit 안팎만 다룹니다. 다음 절에는 시험이 없습니다.
  - src/core/engine/settle/utils/settlement/resolveSettlementScope.ts의 21행 loadScope, 22행 writeEpoch, 28-29행 예산 초과, 30행 occurrence 경로 불일치, 35행 detached 또는 terminal 호스트, 39-40행 범위 밖 changedRaw, 41-47행 split bucket, 51-52행 wrong-kind 조상입니다.
  - src/core/engine/settle/utils/compute/computeSettlement.ts:20-24(파생과 전이 재진입 때의 사전 재확인)와 26-30(국소 바퀴 뒤 재확인)의 루트 후퇴입니다. 이 경로는 국소 바퀴가 이미 소비한 dirty 집합 위에서 루트 바퀴를 다시 도는 유일한 곳입니다.
- 실패 시나리오: 이 절 가운데 하나를 지우거나 조건을 뒤집어도 새 시험은 모두 통과합니다. seiri_test-validity 4절과 DETAIL의 검증 주장에 어긋납니다.
- 추가 위험(가능성): 계산 뒤 후퇴는 한 번도 시험되지 않았습니다. 코드를 따라가면 branchless이면서 게이트가 없는 청사진에서는 이 후퇴가 verify 모드에서 S6 단언으로 던질 수 있습니다. computeStableNode가 국소 호스트를 consume하면 부모의 children 간선은 남습니다(scratch/DirtyPathSet.ts:285-296). 이어지는 루트 바퀴의 dirtyChildren(부모)이 소비된 호스트를 돌려주고, compute/dirtyChildren.ts:33-41의 S6 검사가 던집니다. 출하 모드에서는 소비된 자식이 바로 돌아오므로 해가 없습니다.
- 수정 명세:
  1. settle.local-wheel-resolution.test.ts에 다음 경우를 더합니다. 모두 기존 setup()을 씁니다.
     - `context.writeEpoch = 1;`이면 root입니다.
     - `context.changedRaw.add('/sibling');`이면 root입니다.
     - `context.wrongKindHosts.add(root);`이면 root이고, `context.wrongKindHosts.add(h);`이면 h입니다(현재 동작 고정).
     - `context.splitHitEpochs = new Map([[{ hostPath: '', firstRank: 0, ranksByName: new Map(), runs: [], runByName: new Map() }, 1]]);`이면 root이고, 같은 객체의 hostPath가 '/h/x'이면 h입니다.
  2. settle.local-wheel-compute.test.ts 첫 시험의 fixture(h/n/x와 sibling/stable)로 계산 뒤 후퇴 시험을 더합니다.
     const compute = calculation.computeNode; const calls: string[] = [];
     vi.spyOn(calculation, 'computeNode').mockImplementation((node, context) => { calls.push(node.path); compute(node, context); if (node === n) context.dependencyOwnerPaths.add('/sibling'); });
     writeFieldNode(x, 2, 'callerReplace', WriteOption.Overwrite);
     expect(calls.slice(0, 2)).toEqual(['/h/n', '']);
     expect(root.emit).toEqual({ h: { n: { x: 2, y: 'same' } }, sibling: { stable: 7 } });
     같은 쓰기를 resolveSettlementScope를 root로 강제한 짝과 비교해 root.emit, root.children, sibling의 local 참조가 같음도 단언합니다.
  3. P2-1의 재귀 $ref fixture를 마운트하고, 재결합되지 않은 occurrence 아래 대상에서 resolveSettlementScope가 root를 돌려주는지 단언합니다(30행).
  4. 2번 시험이 test:verify의 verify-unit에서 "S6 dirtyChildren returned a consumed child"로 실패하면, computeSettlement.ts:27-28을 `context.wheelHost = undefined; context.dirtyPaths.add(host.path); computeNode(context.root, context);`로 바꿉니다. 이 경우에만 제품 바이트가 바뀌므로 창 번들과의 관계는 코디네이터가 정합니다.
  5. 확인 방법: 각 단언이 대응하는 절을 지역적으로 지웠을 때 실패하는지 확인합니다.

### P3-1 (확인됨, 공개 영향 미확인) releaseWrongKindHosts가 국소 wheelHost를 남긴 채 루트 바퀴를 돕니다

- 근거: writeFieldNode.ts:136-138은 computeSettlement 뒤 wheelHost를 지우지 않고 releaseWrongKindHosts를 부릅니다. releaseWrongKindHosts.ts:34-35는 computeNode(context.root)를 직접 부릅니다. resolveSettlementScope.ts:51-52는 범위 안 wrong-kind 호스트를 허용하므로 이 경로에 도달합니다. 그러면 루트 바퀴 안에서 computeNode.ts:206-208의 selectNodeSchema(H)가 추가로 돌고, 327-336행의 마감 처리(flushPresenceTemplates, gateSelectionRounds.clear 등)가 루트 바퀴 도중에 실행됩니다. 조상이 full wheel 중이면 그 round 기록이 지워집니다. 같은 상황에서 restoreSourceB.ts:40과 verifyLocalSettlement.ts:36은 wheelHost를 지웁니다.
- 실패 시나리오: `{ h: { n: 'oops' } }`로 적재해 /h/n을 wrong-kind로 만든 뒤 /h/n/x에 씁니다. 공개 값 차이는 찾지 못했지만 "마감 처리는 바퀴 꼭대기에서 한 번"이라는 불변식이 깨집니다.
- 수정 명세: releaseWrongKindHosts.ts:35 바로 앞에 `context.wheelHost = undefined;`를 넣습니다. 시험은 위 시나리오에서 commitSettlement를 감싸 context.wheelHost가 undefined인지 단언합니다. 제품 바이트가 바뀌므로 이번 PR에 넣을지는 코디네이터가 정합니다.

### P3-2 (가능성) 국소 바퀴 뒤 재확인이 범위 밖 shape 표시를 보지 않고, 증인도 그것을 다시 일으키지 않습니다

- 근거: computeSettlement.ts:26의 재확인은 소유자, changedRaw, split, pending exit, wrong-kind, 실패만 봅니다. registerPresenceChanges.ts:134-170은 소유자를 늘리지 않고 H 위 조상을 shapeDirtyPaths에 넣을 수 있습니다. 루트 경로라면 그 조상이 full wheel로 승격되지만(computeNode.ts:121-151) 국소 경로는 무시합니다. verifyLocalSettlement는 이미 정착한 트리 위에서 원래 입력만 다시 넣으므로, 바퀴 도중의 presence 등록이 다시 일어나지 않아 이 차이에 둔감합니다. 정적 닫힘이 이 경우를 막는다고 보지만 그 연결을 증명하는 시험은 없습니다.
- 수정 명세(방어, 선택): computeSettlement.ts:25 앞에서 H의 엄격한 조상 가운데 이미 shape dirty인 경로를 기록하고, 26행 뒤에 새로 표시된 엄격한 조상이 있으면 루트로 후퇴합니다. 비용은 국소 쓰기마다 깊이에 비례합니다. 제품 바이트 변경이므로 P3-1과 같이 판단합니다.

### P3-3 gate-table 국소 짝 비교가 commits 절 전체를 뺍니다

- src/core/engine/settle/__tests__/fixtures/gate-table/assertLocalGateTableHistory.ts:46-61이 'commits'와 'revivals'를 통째로 제외합니다. 그래서 changedNodes, entered, revived, failures 차이를 보지 않습니다. 국소에서 달라져야 하는 것은 stateDirtyNodes의 조상 누락뿐입니다.
- 수정 명세: 'commits'와 'revivals'를 제외 목록에서 빼고, 각 commit에서 stateDirtyNodes만 지운 뒤 비교합니다. 지운 차이가 host의 엄격한 조상 경로뿐인지는 따로 단언합니다.

### P3-4 head-differential 국소 분기가 "조상만 생략" 규칙을 확인하지 않습니다

- src/core/engine/settle/__tests__/selectChildren.head-differential.test.ts:220에서 wheelAncestors를 받아 버리고 points 전체를 비교에서 뺍니다. settle/DETAIL.md는 "실제 wheelHost와 그 조상만 생략을 허용"한다고 적습니다.
- 수정 명세: HEAD의 points에서 path가 wheelAncestors에 있는 지점만 지운 목록과 국소 points가 같은지 단언합니다.

### P3-5 국소 oneOf 시험이 국소 바퀴를 꺼도 통과합니다

- settle.local-wheel-compute.test.ts:65-111은 조상에서 selectChildren이 불리지 않음만 봅니다. 루트 경로에서도 /outer와 ''는 shape dirty가 아니어서 selectChildren이 불리지 않으므로, 이 단언은 국소 바퀴를 증명하지 않습니다.
- 수정 명세: computeNode를 감싸 첫 외부 호출의 node가 inner인지 단언을 더합니다.

### P3-6 fixture 시험의 개수 단언이 느슨합니다

- src/core/__tests__/local-wheel-fixtures.test.ts:80은 확인 수를 `>= 27`로, 98-99행은 두 중첩 행만 단언합니다.
- 수정 명세: 코퍼스 확인 수를 정확한 값으로 단언하고, 22행 시험에서는 두 중첩 행을 뺀 모든 행이 0인지 단언합니다.

### P3-7 summarize의 0에서 0 허용이 문서보다 넓습니다

- architecture/verification/branch-switch/tools/iv-1/summarize.mjs:164의 `A === 0 ? B === 0 : B < A`는 두 행의 네 단계 모두에 0에서 0 유지를 허용합니다. README와 결과 문서는 정적 중첩 행의 selectChildren에만 허용한다고 적습니다.
- 수정 명세: 조건을 `id === 'single-nested-d6-f4' && name === 'selectChildren' && A === 0 ? B === 0 : B < A`로 좁힙니다. 이번 창의 판정은 바뀌지 않을 것으로 봅니다.

### P3-8 test 접두 커밋이 제품 코드를 바꿉니다

- 65f008680(`test(schema-form): ...`)이 collectSettlementScopeEdges.ts의 문맥 토큰 판정을 바꿉니다. 이 저장소에서는 커밋 메시지가 동작 변경의 유일한 기록입니다.
- 수정 명세: PR 본문에 이 제품 변경을 명시합니다.

### P3-9 기존 두 시험이 test:verify에서 verify 모드 검사를 잃었습니다

- settle.presence-evaluation-counts.test.ts:15와 settle.derive-locality.test.ts:10이 setupShippedGateEvaluation을 가져와 verify 묶음에서도 table 모드로 돕니다. 이유(증인의 추가 계산이 호출 수와 방문 함정을 깸)는 DETAIL에 있지만, 이 파일들의 강제 루트 짝은 이제 S 검사 없이 돕니다.
- 수정 명세(선택): 같은 fixture를 verify 모드로 한 번 더 돌려 값과 이벤트만 비교하는 짝을 더합니다.

## 확인한 것

1. 범위 표(항목 1): 들어오는 무관 간선 허용, 조상 원천(빈 루트 포함) 거절, 안에서 밖으로 나가는 간선 거절, required 양방향, if 호스트, wildcard, 함수형 injectTo가 모두 구현되어 있습니다. 판정 식은 classifyClosure와 같습니다(isClosedSettlementScope.ts:15-28). 제품은 virtual, 경로 불일치, 불완전 읽기, 자기 active의 부모 승격을 더해 더 보수적입니다. 차분 시험은 Ⅳ-0의 classifyClosure와 collectDependencyEdges를 기록된 hosts와 owners로 실제로 돌립니다(src/core/engine/__tests__/blueprint.local-wheel-corpus.test.ts:30-108). 22행 204쓰기는 정확히 같고, 79장면 175쓰기는 자손이 아님을 단언합니다. 두 행만 손으로 쓴 시험이 아닙니다.
2. 런타임 후퇴(항목 2): wheelHost를 세우는 곳은 writeFieldNode.ts:127-135뿐입니다. arrangeFieldNodeItems, changeFieldNodeContext, restoreSourceB, 증인은 루트로 갑니다. 여러 출처 batch, load와 reset(kind 'load'), static first-load 호스트 전체 쓰기(writeEpoch)는 루트입니다. detached 대상은 writeFieldNode.ts:46에서 바로 돌아옵니다. split의 host와 split 소유자는 항상 hit와 함께 나오므로 splitHitEpochs 검사가 덮습니다(getDependencyIndex.ts:370-392).
3. 관측 동등(항목 3): 조상은 updateOutput만 하고, 값이 바뀌면 changedNodes에 들어갑니다(updateOutput.ts:118-119). required 순회는 changedNodes를 돌고, 루트는 늘 배달 후보입니다(markCommitDeliveries.ts:82-112). 국소 경로에서 빠지는 것은 조상의 stateDirtyNodes 등록과 shape dirty 조상의 full wheel입니다. 조상 상태식이나 게이트가 범위 안을 읽으면 표가 닫히지 않으므로 공개 차이는 찾지 못했습니다. 1003에서 1002로 줄어든 것은 루트 ''의 computeNodeBody 진입 하나가 updateOutput으로 바뀐 것이며, 시험이 강제 루트 짝과 관측과 전체 이벤트를 비교합니다. 비루트 selectNodeSchema는 mergeEffectiveSchema가 노드와 선언 id 집합으로 캐시하므로(mergeEffectiveSchema.ts:46-49) 부모 선택과 같은 참조를 냅니다. 저장된 원시의 배달 A/B 차이와 diagnoseDelivery 차이는 둘 다 0입니다.
4. 증인(항목 4): 잘못된 범위를 주입한 시험과 후보만 더하는 시험이 각각 던짐을 확인합니다(settle.local-wheel-witness.test.ts:20-50, 84-104). verify-unit과 verify-render는 setup 파일에서 gateSelection을 verify로 켜므로(vite.config.ts:157-178, setupDeriveShadowEvaluation.ts:15) fixture 시험과 다른 모든 국소 쓰기가 증인을 지납니다. 출하 경로에는 모드 검사만 있습니다(writeFieldNode.ts:130, finishSettlement.ts:112).
5. 시험 무결성(항목 5): 바뀐 기존 시험은 실제 wheelHost를 단언하고 강제 루트 짝을 둡니다. 삭제된 시험은 없습니다. record와 shadow 모드에서 국소 정착을 끄는 코드는 없습니다.
6. 경계와 바이트(항목 6): src/index.ts는 바뀌지 않았고 Blueprint는 이름으로 공개되지 않습니다. 다만 emit된 내부 d.ts(dist/core/engine/blueprint/types/blueprint.d.ts)에는 settlementScopes가 들어갑니다. 그래서 "선언 차분 0"은 공개 이름 열거 기준에서만 성립합니다. DETAIL 면제 선언은 실제 import와 맞고, importModel 변경은 __tests__ 아래 선언된 소비자만 면제합니다. FCA 발견은 202건 그대로입니다. 측정 장치는 tools/iv-1 신규 파일뿐이고 b9-1과 iv-0 장치는 바뀌지 않았습니다.
7. 루트 행 비용(항목 7): 루트 후보는 Map 조회 한 번과 빈 문자열 검사로 끝나며 할당이 없습니다(resolveSettlementScope.ts:15-18). computeSettlement 감싸기 호출 하나와 computeNode의 비교 몇 개가 더해집니다. 표 생성은 마운트 때 선언 수와 간선 수에 비례하고, 서로 다른 후보 호스트 수 곱하기 간선 수의 검사가 더해집니다. unknown일 때도 표 전체를 채웁니다(buildSettlementScopes.ts:18-33).

## 미확인

- 지시대로 빌드, 시험, 벤치는 하나도 돌리지 않았습니다. 위 결론은 모두 코드 읽기와 저장된 원시에서 나왔습니다.
- 결과 문서는 최종 머리의 test:verify가 아직 진행 중이라고 적습니다. 0cc800d28은 정적 관문 뒤에 verify 전용 gate-table 시험을 바꿨습니다. 전체 unit은 global-errors.timing.test.ts 하나가 44.308 ms로 40 ms 한도를 넘었고 단독 재실행만 통과했습니다. 최종 머리에서 다섯 프로젝트와 test:verify가 깨끗하게 통과했는지는 확인하지 못했습니다.
- 배달 차이 0 원시가 어느 SHA에서 만들어졌는지, 선언 차분 도구가 무엇을 비교하는지 확인하지 못했습니다.
- 정적 중첩 행 selectChildren의 0에서 0 판정을 코디네이터가 승인했다는 기록은 보지 못했습니다.
- 계속 throw하는 형제 게이트가 shape dirty 부모 아래 있을 때, 루트 경로는 실패를 다시 기록하고 국소 경로는 기록하지 않을 가능성이 있습니다. verify 증인은 이 차이를 잡지만 그 형상의 시험은 없습니다.
- 마운트 세 행이 표 생성 비용을 A 폭 안에 담는지는 창 결과로만 알 수 있습니다. pilot과 창은 아직 돌지 않았습니다.

## 실행한 명령

- git log, git diff, git diff --stat, git diff --name-status, git diff-tree, git show, git status, git grep(모두 worktree 대상)
- cat, sed, grep, head, wc, ls, find(소스, DETAIL, 시험, 설계 문서, Ⅳ-0 도구와 검토, tools/iv-1, raw/iv-1 요약, dist의 d.ts 검색)
- 브리프 iv-1.md 읽기
- 빌드, 시험, lint, typecheck, yarn, npm, npx는 실행하지 않았습니다.

## 추가 판정 — 머리 0cc800d28까지 (판정 불변: FAIL, P1 0 / P2 2 / P3 9)

### 4e02ac625 (항목 5, 항목 6)

- 워커 주장이 맞습니다. 이 커밋은 tools/iv-1/README.md와 tools/iv-1/summarize.mjs 두 파일만 바꿉니다. 제품 src와 시험은 바뀌지 않았습니다.
- summarize.mjs:177-185의 보호 행 판정이 `row.decision !== 'regressed'`에서 `Math.abs(row.B.ms - row.A.ms) <= row.widthMs`로 좁아졌습니다. 이제 보호 행은 느려져도, 폭을 넘게 빨라져도 실패합니다. 브리프의 "A 폭 안" 문구와 글자 그대로 맞고, 거짓 통과가 아니라 보수적인 쪽으로 움직인 변경입니다. 다만 보호 행이 우연히 폭 밖으로 개선되어도 채택 불가가 된다는 점은 창 결과를 읽을 때 알고 계셔야 합니다.
- 앞 판정의 P3-7(목표 행 네 단계 모두에 0에서 0 허용)은 이 커밋과 무관하게 남아 있습니다.

### 0cc800d28 (항목 5)

- 이 커밋은 앞 판정에 이미 포함했습니다. 기존 golden은 resolveSettlementScope를 root로 강제한 짝으로 유지됩니다(observeGateTableModes.ts의 rootScope mock). 그 짝은 wheelHost가 늘 undefined인지 단언합니다. 이어서 같은 중첩 fixture를 off, table, verify 모드와 shadow, skip 조합으로 돌리고, 실제 commit 시점의 context.wheelHost가 기대 호스트와 같은지 단언합니다(assertLocalGateTableHistory.ts:39-45). 따라서 국소 해석을 root로 바꾸면 실패한다는 워커의 음성 probe 주장은 코드와 맞습니다. 다만 probe를 직접 돌리지는 않았습니다.
- 남은 약점은 앞 판정의 P3-3 그대로입니다.

### 장치 의미 불변 (항목 6)

- 99f6ce04f에서 0cc800d28까지 tools 아래 바뀐 파일은 모두 tools/iv-1/ 안의 새 파일입니다. b9-1, b9-0, iv-0, window 장치는 바뀌지 않았습니다. 따라서 A 레인과 이전에 기록된 창의 의미는 그대로입니다.
- tools/iv-1/prepare.mjs는 b9-1/prepare.mjs를 그대로 실행한 뒤 manifest에 항목을 더합니다. tools/iv-1/verifyInputs.mjs는 b9-1의 verifyInputs를 먼저 부른 뒤 scope-builder와 진단 번들 해시를 추가로 확인합니다.
- b9e508436은 rehearse.mjs에서 원장 worker에 넘기는 경로를 getStageRoot(root, 'B')로 고칩니다.

### 실행한 명령

git show --stat, git show(4e02ac625, b9e508436, a93a36b3f, 27bc828c1), git diff --name-only, cat. 빌드, 시험, 벤치, yarn은 실행하지 않았습니다.
