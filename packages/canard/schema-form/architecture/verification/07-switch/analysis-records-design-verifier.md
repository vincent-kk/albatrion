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

# 3차 대조 (운영 모드 동결의 범위, 102C-01)

판정: **재작업**입니다. 근거는 HEAD 237678927의 코드이며 시험·빌드·스크립트는 실행하지 않았습니다.

확인된 것: blueprint의 동결 표현식은 정확히 49개이고 인용 줄과 일치합니다(분류는 (1) 6개, (2) 8개, 개발 전용 35개). 모드 판정은 `markCommitDeliveries.ts:14`, `commitStaticFirstNode.ts:5`의 `process.env.NODE_ENV !== 'production'`으로 EVENT-024 payload 동결과 같습니다. 49행 분류로 변경 전 실측 계수(nested 24,911, flat 9,019)가 다시 나옵니다. 화면·훅·provider·helpers·app 계층에는 `blueprintNode`, `runtime`, `behavior`를 읽는 코드가 없습니다.

지적(심각도 순):

1. [높음] 설계안은 공개 유효 스키마를 깊게 동결하면서 함수, React element, exotic component, 소비자 인스턴스까지 내려갑니다. 공개 타입이 이 값들을 허용하고(`src/types/jsonSchema.ts:267`, `:273`, `:284`), inline lazy 컴포넌트도 받습니다(`useFormTypeInput.ts:22-26`). React 19.2.6의 lazy 객체는 `_payload._status`에 쓰고(strict mode), 개발 빌드의 element는 열거 가능한 `_owner`(Fiber)와 `_store`를 가집니다. 운영 모드의 lazy 입력은 첫 렌더에서, 개발 모드의 render 중 JSX label은 이후 React의 쓰기에서 TypeError가 납니다. 또 결정문의 "지금처럼 깊이"는 사실이 아닙니다. 지금은 `finalizeEffectiveSchema.ts:45`의 얕은 동결뿐이고, 새 배열인 required(`applySchemaContribution.ts:68`), allOf(`:78`), pattern clause(`finalizeEffectiveSchema.ts:21`), 빈 enum(`:43`)도 동결되지 않습니다. 깊은 동결은 두 모드 모두에서 소비자 소유 입력을 새로 동결하는 계약 변경입니다.
2. [중간] 빠진 공개 경로: 루트에 작성된 `controls.children[*].controls.default`가 `getControlLayers.ts:101,108,110` → `readDefault.ts:22` → `transitionSettlement.ts:87,108` → `markWrite.ts:41-44` → `interpretIdentity` → `node.value`, `defaultValue`, UpdateValue payload, `FormTypeInputProps.value`로 나갑니다. 이 객체는 어떤 유효 스키마 그래프에도 들지 않아 두 모드 모두에서 동결되지 않으므로, 캐시된 청사진을 공유하는 다른 폼으로 변조가 샙니다.
3. [중간, 편집자 확인] order(F18)와 gates(F19)를 (2)로 두었으나 결정문은 "순서 배열"을 개발 전용의 예로 들었습니다. 두 배열은 실제로 fragment와 declaration이 공유합니다(`collectDeclarations.ts:87-88`). 개발 전용으로 바꾸면 nested 3.4989, flat 3.0020, oneOf 3.4921개/node입니다.
4. [낮음~중간] 공유 gate(F27)는 얕게만 동결되는데 그 evaluationReads(F21, F22, F28)와 discriminator descriptor(F37, F38)는 gate를 빌리는 모든 기록에서 닿습니다. (2)로 올리면 oneOf는 6.4444개/node입니다.
5. [낮음] F34(분석 실패 때만 공개), F40·F41(수집마다 새로 만듦)은 청사진 보유 값이 아니므로 개발 전용입니다. 오류 details 가운데 일부만 동결하는 문장도 일관되지 않습니다.
6. [낮음] 작성된 루트 동결은 function children일 때만 일어나고 위치와 깊이가 정해져 있지 않습니다.
7. [낮음] 깊은 동결의 멈춤 규칙과 일의 양이 정해져 있지 않습니다.

고칠 명세: 깊은 동결은 plain object(프로토타입이 Object.prototype 또는 null)와 배열에만 적용하고, 함수, 자체 `$$typeof`를 가진 객체, plain이 아닌 프로토타입의 객체는 동결하지도 내려가지도 않습니다. 운영 모드의 lazy inline 입력 렌더와 개발 모드의 render 중 JSX label을 음성 시험으로 더합니다. `readDefault`가 돌려줄 수 있는 모든 객체를 (1)로 넣습니다. F34·F40·F41은 개발 전용으로 옮깁니다. 동결 시점은 청사진 완료 하나로 정하고, 멈춤 규칙은 모듈 수준 WeakSet으로 명시하며, 계수 표에 노드당 순회 방문 수 열을 더합니다. 1번(소비자 입력의 동결), 3번, 4번, 6번은 편집자 확인이 필요합니다.

# 4차 대조 (동결 범위, Q104 답 반영 뒤)

판정: **조건부 승인**입니다. 근거는 HEAD e60490572의 코드이며 시험과 프로세스는 실행하지 않았습니다.

확인된 것: 3차 지적 1–7과 원장 답 (1)–(4)가 반영되었습니다. 51개 동결 표현식과 분류 4/13/34가 코드와 일치하고, 동결 수(nested 5,801 = 노드당 4.2498, flat 2,005 = 4.0020, oneOf 282 = 4.4762)가 다시 계산해도 맞습니다. 51개 표현식은 모두 청사진이 만든 값의 얕은 동결이라 두 모드 모두 소비자가 작성한 값(함수, React element, lazy)을 동결하지 않습니다. 집합 (2)에 빠진 것이 없습니다. 작성된 default를 제자리에서 바꾸는 쓰기는 core, React 계층, 저장소의 플러그인 어디에도 없습니다.

지적(심각도 순):

1. [중간] 청사진이 공개 유효 스키마 안에 새로 만든 배열이 아닌 객체(controls 봉투 `applySchemaContribution.ts:99-103`, `mergeSingleStaticContribution.ts:48-51`; pattern clause 객체 `finalizeEffectiveSchema.ts:23`; exclusive 경계 clause 객체 `applyConstraintKeywords.ts:48-55`; hint group 복사본 `mergeHintGroup.ts:23`, `:36`)가 분류되지 않았습니다. 이들은 `node.jsonSchema`의 `.controls`, `.allOf[k]`, `.options`로 닿고 청사진 캐시로 폼 사이에 공유되므로 102C-01의 규칙상 (1)입니다. 청사진 완료 때 얕게 동결하고, merge가 안에 만든 하위 객체는 이유를 적고 동결하지 않습니다. 세 고정 폼의 계수는 변하지 않습니다.
2. [낮음~중간] F34(`populateVirtualNodes.ts:96`)는 임시값이 아니라 가상 `BlueprintNode.fields`로 보유되고 런타임이 읽습니다. 공개 타입에 없고 소유자가 하나이므로 개발 전용 분류는 맞지만 근거를 "가상 노드가 단독 소유하는 내부 기록"으로 고칩니다.
3. [낮음~중간] F47–F49(`getItemEntry.ts:30`, `:32`, `:44`)는 청사진 완료 뒤 slot을 처음 요청할 때 만들어져 모듈 수준 WeakMap으로 공유됩니다. 생성 시점에 개발 모드에서만 동결한다고 적고, mount 뒤 새 배열 slot을 만드는 시험을 두 모드 모두 더합니다.
4. [낮음] default 대조 표에 검증 경로(`runSchemaNodeValidation.ts:17`, `evaluateGate.ts:102`; 안전성은 ajv 플러그인의 `assertBindableInstance`가 데이터를 바꾸는 옵션을 거부하는 데 달림), 새 객체에만 쓰는 경로(`readRawTree.ts:40-48`, `readLatentSlotSource.ts:39-47`), draft·복사본에만 쓰는 경로(`alignArraySnapshotSlots.ts:36,85,90`, `replaceAtPath.ts:27-32`, `markBatchArrayOperation.ts:30`, `arrangeSchemaNodeItems.ts:59-64`, `shallowPatch.ts:14`)를 더하고, 데이터를 바꾸는 소비자 validator는 계약 밖이라고 적습니다.
5. [낮음] 운영 모드 시험이 React 개발 빌드로 돌 수 있습니다. React를 불러오기 전에 NODE_ENV=production을 정한 별도 프로젝트나 프로세스에서 실행하고 운영 빌드가 로드되었음을 단언합니다.
6. [낮음] 분석 중에 버려지는 정적 schema를 완료 동결 대상에 올린 문장은 도달 가능성 기준과 맞지 않으므로 지우거나 근거를 적습니다.
