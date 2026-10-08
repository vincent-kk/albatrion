# 분기 변경 1d 구현 기록

`branch1d-design.md`의 설계를 HEAD `4981390bc` 위에 구현했습니다. 시간 측정은 하지 않았습니다. 변경은 패치 파일로만 남기고 작업 트리는 HEAD로 되돌렸으며, 이 문서만 새로 더했습니다. 아래에서 `S`는 세션 scratchpad(`/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`)를 뜻합니다.

## 바뀐 파일

- 문서(코드보다 먼저 고침)
  - `src/core/blueprint/DETAIL.md`: 노드 기록의 `multiBranchUnion` 계약을 더했습니다.
  - `src/core/settle/DETAIL.md`: 1d 경로의 요구 사항, 런타임 병합 목록, 수용 기준 두 묶음(`settle-child-selection-differential`, `settle-union-child-selection-counts`)을 더했습니다.
- 제품 코드
  - `blueprint/type.ts`: `BlueprintNode.multiBranchUnion`과 그 문서 주석을 더했습니다.
  - `blueprint/utils/analyze/buildNodes.ts`: 노드 리터럴의 `childEntries` 바로 뒤에 표시를 둡니다. 판정은 같은 파일의 내보내지 않는 보조 함수 `isMultiBranchUnion`이 합니다. 첫 소유 선언의 스키마가 객체이고 `oneOf`나 `anyOf`가 원소 둘 이상의 배열이면 참이며, 판정식은 1c의 것과 같습니다. 배열 검사는 `isArray`를 씁니다.
  - `blueprint/utils/analyze/populateVirtualNodes.ts`: 두 번째 노드 리터럴인 가상 노드에도 같은 자리에 `multiBranchUnion: false`를 둡니다.
  - `settle/utils/compute/computeNode.ts`: `multiBranchUnion && kind !== 'load' && hasGates && behavior.type === 'object'`을 한 번 계산해 지역 변수 `union`에 둡니다. 이 값으로 `primeUnionHost`·`selectUnionChildren`과 HEAD 함수 가운데 하나를 고릅니다.
  - 새 파일 `settle/utils/compute/selectUnionChildren.ts`, `primeUnionHost.ts`, `selectUnionChildren/utils/getDirectChildSelectionPlan.ts`를 더했습니다.
- 시험
  - 새 파일 `settle/__tests__/selectUnionChildren.path-counts.test.ts`에 13개 사례를 두었습니다.
  - `settle/__tests__/helpers/childSelection/buildChildSelectionRuntime.ts`는 차등 시험이 `selectUnionChildren`도 계측하도록 고쳤습니다.
  - `core/__tests__/fixtures/captureBlueprintObservables.ts`와 `blueprint/__tests__/fixtures/createEffectiveSchemaNode.ts`는 새 칸에 맞추어 고쳤습니다(아래 설명).
- HEAD와 바이트까지 같은 함수: `selectChildren`(`staticShape`·`staticIds` 포함), `primeHost`, `flushPendingGateReads`, `evaluateGate`입니다.

## 설계와 다르게 한 점

1. **`analyze/type.ts`는 고치지 않았습니다.** `MutableNode`는 `BlueprintNode`의 모든 키를 쓰기 가능하게 옮기는 매핑 형이라, 새 칸이 저절로 들어갑니다. 따로 더하면 같은 선언이 두 벌이 됩니다.
2. **가상 노드 리터럴에도 칸을 두었습니다.** 설계의 "모든 노드 리터럴"에는 `populateVirtualNodes.ts`의 리터럴도 들어가고, 형이 그 칸을 요구합니다.
3. **계획 함수를 정리했습니다.** 1c의 `prepare` 인자는 1d에서 늘 참이므로 없앴습니다. 함수 안의 캐시 재조회는 호출자가 먼저 조회하므로 없앴습니다. oneOf/anyOf 개수 판정은 청사진 표시가 맡으므로 없앴습니다. 구조와 게이트에 대한 자격 검사는 1c 그대로입니다.
4. **`selectUnionChildren`에는 단계 경로만 남겼습니다.** 호출 조건(객체, 게이트 있음, load 아님)과 계획의 보장(이름 유일, 단일 선언, 가상 아님)으로 도달할 수 없는 부분을 뺐습니다.
   - 뺀 것: 정적 형상 확인, 가상·배열 분기, 계획 없는 일반 반복, `seen` 집합, `hasGates` 조건식입니다.
   - 단계마다 `if (immediate && context.pendingOutputs?.size) flushPendingGateReads(...)`를 그대로 둡니다.
5. **청사진 차등 시험의 포착에서 새 칸을 뺐습니다.**
   - 고정 HEAD 기준선을 비교하는 청사진 시험 세 개(`blueprint.cold-binding`, `owned-inline-differential`, `path-key-once`)는 노드의 모든 칸을 직렬화합니다. 그래서 새 칸 때문에 실패했습니다.
   - `captureBlueprintObservables`는 문서 주석대로 최적화용 칸을 빼는 도구이므로, 새 칸도 포착에서 뺐습니다. 기준선 파일은 다시 만들지 않았습니다.
   - 표시 값의 정확성은 계수 시험이 행동으로 확인합니다. 표시가 늘 참이거나 늘 거짓인 변형이 모두 실패합니다.
6. **filid 구조 경고가 있습니다.** `compute/selectUnionChildren/utils/`는 organ `utils` 안의 하위 디렉터리라는 경고를 받았습니다. 설계가 정한 경로라서 그대로 두었습니다. 이 결정은 검토자가 판단해야 합니다.

## 차등 시험

- `selectChildren.head-differential.test.ts`(고정 HEAD `3a637c4cd`)가 1d 작업 트리에서 7개 모두 통과했습니다.
  - 59개 코퍼스(루트 리스너와 모든 노드 리스너)
  - oneOf-5/10/20/40 고정 축의 첫 전환과 준비 뒤 전환(모든 노드 리스너)
  - if-then 자동 쓰기 OFF/ON, 가드 방식 네 가지, 중첩 경로
  - 비교 대상: 결과, 공표 지점, 배달 순서, `changedNodes`, payload
- 계측 도우미는 `selectUnionChildren`의 끝을 `selectChildren`과 같은 공표 지점으로 기록합니다. 계획이 null이라 일반 선택으로 넘긴 호출은 안쪽 지점 하나로만 셉니다.
- 민감도 확인: `selectUnionChildren`의 `pendingOutputs` 추가를 잠시 끈 변형에서는 oneOf 네 사례가 실패했습니다. 따라서 이 시험은 실제로 새 경로를 지납니다.

## 계수 시험 (`settle-union-child-selection-counts`)

런타임 호출 수만 셉니다. 제품 소스 텍스트는 읽지 않습니다.

| 실행 | 결과 | 실패 내용 |
| --- | --- | --- |
| HEAD 소스 | 파일 실패 | `Cannot find module '../utils/compute/primeUnionHost'` — 새 기호가 없어서 실패합니다 |
| 표시 늘 거짓(HEAD와 같은 동작) | 13개 중 5개 실패 | 바깥 호스트 사례(합집합 호스트 `[]`)와 oneOf 전환 네 사례 |
| 표시 늘 참 | 13개 중 5개 실패 | if-then 두 사례, 단일 oneOf·anyOf, 바깥 호스트(`['/outer', '']`) |
| 가드된 사전 공표 호출 제거 | 13개 중 4개 실패 | oneOf 전환 네 사례(pending 진입 수가 HEAD와 다름) |
| 1d | 13개 모두 통과 | 없음 |

- 망가뜨린 변형의 원본은 `S/d1-impl/variants/`에 있습니다. 실행 도구는 `S/d1-impl/run-variants.mjs`, 기록은 `S/d1-impl/variant-*.log`입니다.
  - 도구는 변형을 작업 트리에 잠시 복사해 실행하고, 매번 1d 파일을 되돌린 뒤 바이트까지 같은지 확인했습니다.
  - scratch 사본에는 `node_modules`가 없어서, 그 안에서 직접 실행할 수 없었기 때문입니다.
- 측정한 계수(HEAD 값은 같은 방법으로 HEAD에서 먼저 쟀습니다):
  - 마운트(B=5/10/20/40): 두 새 함수 호출 0회, 계획 생성 0회입니다. 사전 공표의 빈 진입 40/70/130/250회와 pending 진입 28/58/118/238회는 HEAD와 같습니다.
  - 전환 kind_4→kind_0→kind_4→kind_0:
    - 계획 생성은 1/0/0/0회입니다.
    - 합집합 경로를 타는 호스트는 루트뿐입니다.
    - 무관 분기 하나당 후보 접근은 HEAD 18/9/9/9회에서 1d 3/0/0/0회로 줄었습니다. 첫 전환의 3회는 계획이 아직 없어 `primeHost`로 넘긴 몫입니다.
  - 사전 공표의 pending 진입 수는 HEAD와 같습니다.
    - B=5: 4/14/2/14, B=10: 34/29/17/29, B=20: 94/59/47/59, B=40: 214/119/107/119
  - 빈 진입은 HEAD에서 1d로 다음과 같이 0이 되었습니다.
    - B=5: 64/20/32/20 → 0, B=10: 94/35/47/35 → 0, B=20: 154/65/77/65 → 0, B=40: 274/125/137/125 → 0
- 설계의 예상과 다른 점: 설계는 oneOf-20의 flush 호출이 248→4, 124→59, 124→2회가 된다고 예상했습니다. 이 시험의 진입 계수로는 1d의 호출 수가 HEAD의 pending 진입 수(94/59/47/59)와 같습니다. 둘째 쓰기의 59회만 일치하며, 시제품 도구가 무엇을 셌는지는 확인하지 못했습니다.

## 다섯 함수의 동일성 확인

- `S/d1-check-identity.mjs`는 네 파일(`selectChildren.ts`에는 `selectChildren`·`staticShape`·`staticIds`, 나머지 세 파일에는 함수가 하나씩)을 `git show HEAD:<path>`와 바이트 단위로 비교하는 독립 스크립트입니다.
  - 결과는 `PASS: compared with HEAD 4981390bc`이며 네 파일 모두 identical이었습니다.
  - `git diff --quiet HEAD -- <네 파일>`도 차이가 없었습니다.
- 번들 수준에서도 확인했습니다. `d-head.cjs`와 `d-1d.cjs`의 `selectChildren`·`staticShape`·`staticIds`·`primeHost`·`flushPendingGateReads`·`evaluateGate` 본문은 import 별칭 번호만 정규화하면 모두 같았습니다. `primeHost`는 정규화하지 않아도 같았습니다.

## 명령 결과 (패키지 디렉터리에서 실행)

- `npx vitest run --project unit --project render --project react18 --reporter=dot`: 460개 파일, 3398개 통과, todo 1개, 실패 0개입니다.
- `yarn test:production`: 9개 파일, 20개 통과입니다.
- `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json`: 오류가 없습니다.
- `npx eslint "src/**/*.{ts,tsx}"`: 종료 코드 0이며 출력이 없습니다.
- `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`: `LEGACY_ISOLATED: 1678 files checked`입니다.

## 패치와 번들

- `S/branch1d.patch`(55,293 B, sha256 `0d30514912a2547c710315ef868be4a3c49c2630150da3c818803981d13fc85a`)에는 src 변경 9개 파일과 새 파일 4개가 들어 있습니다.
  - `S/d1-impl/make-patch.mjs`로 HEAD 내보내기에 단독으로 적용해 보았고, 바뀐 13개 파일이 모두 바이트까지 같게 재현되었습니다.
- 번들은 `S/bundles/`에 있으며 명세는 `d-manifest.json`입니다.
  - `d-head.cjs`: sha256 `6b6ac5c2…af54a`, 545,174 B
  - `d-headx.cjs`: `d-head.cjs`에 꼬리 주석 한 줄을 더한 것, sha256 `74c6e84c…0a1e4`
  - `d-1d.cjs`: sha256 `095af0e1…30da`, 557,299 B
- 빌드 도구는 `D/tools/prepare-patch-bundles.mjs`의 빌드 함수를 `S/d1-impl/build-d-bundles.mjs`로 복사한 것입니다. esbuild 옵션은 같습니다.
  - 다른 점은 변형 목록, 파일 접두 `d-`, 실행 진입부입니다.
  - "모든 패치 파일이 번들에 실림" 확인에서는 형만 가진 `blueprint/type.ts`를 뺐습니다. esbuild가 이 파일을 읽지 않기 때문입니다.

- 작업 도중 다른 에이전트가 `390cd0b05`(측정 도구만 바꾼 커밋)를 HEAD에 더했습니다. `packages/canard/schema-form/src`와 `packages/aileron`은 `4981390bc`와 같으므로, 패치는 두 커밋 모두에 적용됩니다. 번들 명세의 `revision`은 `4981390bc`입니다. 동일성 스크립트는 되돌린 뒤 새 HEAD 기준으로도 PASS였습니다.

## 확인하지 못한 것

- 시간과 V8 최적화 상태는 재지 않았습니다. 판정은 129라운드의 측정 방법으로 `d-head`/`d-headx`/`d-1d`를 재야 합니다.
- 설계 예상 flush 계수와 다른 점(위)의 원인은 확인하지 못했습니다.
