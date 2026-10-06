# 분석 기록 설계안 검증 대조 (1차)

대상: `analysis-records-design.md`(HEAD e39503af5 기준으로 작성됨). 대조 시점 HEAD는 da734b40d입니다. 검증자는 파일 읽기, grep, `git show`만 사용했고 시험과 프로세스는 실행하지 않았습니다.

판정: **조건부 승인**입니다. 구현 전에 아래 F1–F6을 설계안에 반영해야 합니다.

## 지적

1. [중, 확인] 설계안의 기준 시점이 지났습니다.
   - (a) da734b40d는 template-key streaming을 제품 코드에 반영하지 않았습니다(객체 12.0→7.0/node, 시간 이득 없음). 설계안 :315의 13단계, :143의 template-keys 예산 6, :330의 흡수 행은 채택을 가정하므로 54.1918 예산이 성립하지 않습니다. template-keys를 11.64로 두면 59.84이고, 측정값 7.0으로 재채택하면 55.19입니다.
   - (b) 1단계(:303, :66)는 5f50768e5로 이미 들어갔습니다. 측정된 묶음은 33.6→13.0/node로, :140의 effective-merge 예산 10보다 높습니다.
   - (c) `blueprint.cold-binding.test.ts` 인용이 밀렸습니다. 옛 줄 :17/:32/:36/:38/:42/:48/:54/:58/:64/:69/:74는 지금 :69/:84/:88/:90/:130/:136/:142/:146/:152/:157/:162입니다(설계안 :237, :273, :284, :285, :291, :294, :317). 새 key 동일성 시험(:19–67, :94–128)이 언급되지 않았습니다.
   - (d) :214의 `flushPendingGateReads.ts:21/:40`은 HEAD 기준입니다. 이 파일과 `settle/utils/gates` 아래 파일은 다른 작업이 커밋 전에 수정 중입니다.
2. [중, 경로 확인] 조건 1의 빈틈: `populateVirtualNodes.ts:115`가 `(host.childEntries as BlueprintChildEntry[]).push(...)`를 합니다. 4단계(:306)와 동결 표(:166)는 populateNodeChildren 경로만 다룹니다. `{type:'object', options:{virtual:{v:{fields:[]}}}}`는 :40–62 검증을 통과하고, 속성 entry가 없어 host가 공유 동결 빈 배열을 가지므로 push가 strict 모듈에서 TypeError를 냅니다.
3. [중, 가능성] 9단계(:311, :60)의 반환 벡터 scratch화는 위험합니다. `populateVirtualNodes.ts:75/94/96/108`이 collectDeclarations의 반환 배열을 보관하고 push한 뒤 가상 노드의 `node.declarations`로 동결합니다. 깊이별 재사용 벡터를 반환하면 scratch가 출판·동결되어 다음 collect가 TypeError를 내거나 데이터가 오염됩니다.
4. [하, 확인] 조건 2의 "먼저 고칠 두 곳"(:182–189, 0단계 :302)은 오판입니다. `selectEffectiveDeclarations.ts:35`의 `entry === declarations[0]`는 한 호출 안에서 같은 `active` 배열의 원소끼리 비교하고, `resolveNodeTypes.ts:115`의 `group.declarations`는 같은 입력의 부분집합입니다. 두 목록 모두 ID가 유일하고(`collectDeclarations.ts:77`), 바인딩 view는 `entry.declarations`에만 들어가는데 두 함수 모두 그 배열을 읽지 않습니다.
5. [하, 확인] 조건 2 목록에서 빠진 유지 지점(본안에서 키가 바뀌지 않아 깨지지 않음): `behaviors/utils/options/getStaticChoices.ts:18`(`WeakMap<EffectiveSchema>`), `assembleObject.ts:21–22`, `assembleArray.ts:24`(`stable.schema === node.schema`), `computeNode.ts:130`(seenGates), 기존 alias 선례 `populateVirtualNodes.ts:119`, `getItemEntry.ts:33`. 시험: `arrayBehavior.test.ts:51/:58`, `union.mismatch-light.test.ts:23/:25`, `settle.array-verbs.test.ts:90/:94`.
6. [하, 확인] 2단계(:304)는 원본 gates 배열과 바인딩 gates 배열이라는 두 생산 종류를 한 변경에 묶어 :298의 "한 변경에 한 종류"와 맞지 않습니다.

## 대조로 확인된 것

- (가)/(나)의 산술과 V8 family 값이 summary JSON과 일치합니다(예: 236,708.24/1365 = 173.41). 예산 합 54.1918도 산술로는 맞습니다.
- 세 폼에서 K=0이 성립합니다.
- 조건 1의 인용한 동결 지점이 모두 실제로 있습니다. 출판된 배열에 쓰는 곳은 분석 중 push 자리(`collectDeclarations.ts:75/92/95`, `populateNodeChildren.ts:182`, `populateVirtualNodes.ts:94/115`)뿐입니다.
- 조건 2: declaration, fragment, order/gates/declarations/childEntries 배열을 키로 쓰는 Map/Set/WeakMap은 없습니다. 동결 빈 배열 공유 선례가 이미 있습니다(`declareArrayChildren.ts:10`, `blueprint.ts:11/13`, `selectChildren.ts:26`).
- 조건 3: 인용한 정착 경로는 저장된 필드만 읽고, 설계가 getter와 Proxy를 금지하므로 읽을 때마다 할당하는 경로는 생기지 않습니다.

## 고칠 명세

- F1: 기준을 da734b40d로 다시 고정하고 인용 줄을 고칩니다. 1단계는 완료로 적고 측정값 13.0을 씁니다. 13단계는 삭제하거나 재채택 근거를 적고, 54.1918과 :148의 "46개/node"를 다시 계산합니다.
- F2: :166과 :306에 `populateVirtualNodes.ts:115`를 두 번째 append 지점으로 적고, 그 자리에서도 소유 배열을 처음 만들도록 명시합니다. 차등 폼에 빈 fields 가상 그룹 스키마를 넣습니다.
- F3: :60과 :311에 `populateVirtualNodes.ts:75–108`을 반환 배열을 보관하는 소비자로 적고, 그 호출은 새 배열이나 복사본을 받도록 요구합니다.
- F4: :180과 :182–189의 판정을 "영향 없음"으로 고치고 0단계는 삭제하거나 선택 사항으로 내립니다.
- F5: 위 소스와 시험 지점을 :204–226, :232–246 표에 "유지"로 추가합니다.
- F6: 2단계를 원본·조각 gates와 바인딩 gates의 두 변경으로 나눕니다.

## 확인하지 못한 것

- 시험, 계측, 59종 차등은 실행하지 않았습니다. 59종 corpus에 빈 fields 가상 그룹이 있는지 확인하지 못했습니다.
- V8 표본이 실제로 얼마나 줄지는 확인할 수 없습니다.

# 2차 대조 (F1–F6 반영 확인)

판정: **승인**입니다. F1–F6은 모두 정확하고 완전하게 반영되었습니다. 검증자는 인용 약 100곳(`blueprint.cold-binding.test.ts`와 `populateVirtualNodes.ts`의 인용은 전부)을 대조했고 모두 맞았습니다. 예산 62.8365개/node는 summary JSON에서 다시 계산해 산술이 맞음을 확인했습니다(합 `8+6+6+13+6+4+11.6447+0+8.1918`).

조건으로 붙은 두 가지는 반영했습니다.

1. 적용 순서 표의 구분선 뒤 빈 줄 때문에 1–12단계 행이 표로 렌더링되지 않던 서식 오류를 고쳤습니다.
2. template-keys의 "현재 11.6447개"를 "101 관측 11.6447개"로 고치고, family 예산은 각 행의 측정 방식으로 비교하며 effective-merge만 인라이닝 억제 진단 기준이라는 문장을 더했습니다(effective-merge의 13.0은 `--no-turbo-inlining` 진단 값이고 그 기준의 HEAD 값 33.6425는 101 기준값 29.7001과 다릅니다).
