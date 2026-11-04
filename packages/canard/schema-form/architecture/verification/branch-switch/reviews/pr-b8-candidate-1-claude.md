# B8 독립 검토 — perf/schema-form-b8-reinforcement

- 범위: `c4d442c44..93c22a2de`. 제품 소스의 마지막 변경은 `7e7475544`입니다. 그 뒤 제품 트리 변경은 시험 커밋 `57becc34f`, `93c22a2de` 두 개이며 범위에 넣었습니다. 나머지 뒤 커밋은 측정 도구입니다.
- 헤드: `93c22a2de`. 날짜: 2026-10-28. 검토자: claude 검증 에이전트(코디네이터 소유).
- 정적 검토만 했습니다. 명령은 실행하지 않았고 git 조회, 검색, 파일 읽기만 했습니다(측정 창과 겹치지 않기 위한 제약).
- 경로는 작업 트리의 `packages/canard/schema-form/` 기준입니다.

## 판정

**CONDITIONAL PASS**입니다. P1 0건, P2 2건, P3 5건입니다.

병합 조건은 세 가지입니다.
1. 아래 P2 두 건을 고칩니다.
2. 측정 창이 끝나면 mount 단계 장부와 정식 A/B 결과를 결과 문서에 적습니다. 결과 문서 5절은 아직 "정식 장부 실행 대기"이므로, 작업 항목 5의 남은 증가분이 정당한지는 그 전에는 판정할 수 없습니다.
3. 추적되지 않은 `b8-results.md`와 `raw/b8/`, 커밋되지 않은 `tools/b8/README.md` 수정을 커밋합니다.

## 작업 항목별 확인

1. 배달 장면: keep 장면 6개와 별표 장면 1개로 79장면입니다. 새 장면의 관측점은 각각 9개와 7개라서 430 + 61 = 491이며 결과 문서와 맞습니다. 새 장면은 두 엔진 모두에서 나감 뒤 `inactiveValues`, 재진입 뒤 값과 `inactiveValues`, keep 게이트를 연 뒤 복원 값을 독립 기대값으로 단언합니다(`architecture/verification/branch-switch/tools/b4-2/delivery.mjs:338-369`). 새 장면은 떼어진 참조 쓰기 단계를 건너뜁니다(같은 파일 392행). 지시 범위 밖이므로 결함으로 보지 않습니다.
2. B6 P3 네 건은 모두 반영되었습니다.
   - `selectNodeSchema.ts:39-42`는 의존 색인이 청사진 준비 때 같은 문자열로 만든 배열을 받습니다(`getDependencyIndex.ts:131-135`). 해석 결과가 같고, `readOneOfBranch`는 `slice`로 복사하므로 공유 배열을 바꾸지 않습니다.
   - `#` 조립 세 곳이 `joinPointerWithPrefixOf`로 바뀌었습니다. `resolveReference.ts:27`이 선행 `#`를 이미 보장하므로 반환 주소는 이전과 같습니다.
   - live-paths 양성 대조는 B6 검토의 수정 명세와 같습니다.
   - 빈 이름 세 곳이 `!== undefined`로 바뀌었습니다. 규칙 키는 `JSON.stringify`라서 `undefined`와 `''`가 겹치지 않습니다(`getDeriveRuleKey.ts:36-45`).
3. 공개 표면: 스냅샷에서 바뀐 줄은 `FormErrorCode` 하나입니다. 제품 코드에 `UnknownJsonSchema`로 분기하는 곳이 없어서 기존 소비 동작은 그대로입니다. 영문·한글 명세와 공개 개수 시험 42가 갱신되었습니다.
4. 생존 0개 배열: 폐기는 빠른 경로(`createExitSlotOverlay.ts:57`)와 압축 계획이 없는 경로(같은 파일 77행)에서 지움 정책이 실제로 적용될 때만 일어납니다. `retainExitedSlot`은 `finalizeExits.ts:91`에서만 불립니다. 그 시점은 구조 복원 뒤이며 load 범위와 소멸 범위는 빠집니다. 그래서 표시를 받은 노드가 다시 붙는 경로를 찾지 못했습니다. 칸은 보유 복제와 같은 발생의 옛 참조 사이에서만 공유되므로, 표시는 같은 논리 아이템의 쓰기만 버립니다. 이는 압축 경로와 같은 의미입니다. 작업자가 약점으로 적은 "이미 비활성인 후보" 경로는 추적상 결함이 없지만 실행하는 시험이 없습니다(P2-2).
5. gate 예산 캐시: `getGateBudgetCap.ts:47-59`의 Map은 `getIndex` 한 번의 호출 안에서만 삽니다. 키는 gate 객체이고 값은 `gate.schemaPath`만의 순수 함수입니다. `add` 순서, 선언별 `else if`, `transitionCap = decisions.size + 1`은 그대로입니다. 청사진별 색인 캐시는 기존 그대로라 재구축이나 적재에서 무효화 문제가 새로 생기지 않습니다. 예산에 드는 gate나 그 순서를 바꿀 길은 없습니다.
6. 규칙: 커밋 메시지, 추가 줄, 결과 문서에 기계 경로·공동 저자·세션 줄·이름 문자열이 없습니다. `as any`, `as never`, 네이티브 `hasOwnProperty`·`Array.isArray`의 새 사용도 없습니다. 새 파일은 함수 하나만 내보내고 영어 TSDoc을 갖습니다. `joinPointerWithPrefixOf`는 fractal 밖 제품 파일 세 곳이 씁니다. 바뀐 fractal은 모두 DETAIL 변경을 같은 커밋에 갖습니다. 새 간선 `compute → gates/getGateRegistry`는 기존 `evaluateGate` 간선과 같은 방향이라 순환이 없습니다.
7. 범위: 공개 표면 변화는 한 이름뿐입니다. 빈 이름 수정은 fields 층 규칙에도 미칩니다(P3-3).

## P2 — PR 전에 고칠 것

### P2-1. [확인됨] 새 시험이 선언 없이 jsonPointer 내부 모듈을 감쌉니다
- 위치: `src/core/engine/settle/utils/gates/__tests__/getGateBudgetCap.pointer-work.test.ts:10-25`. 선언 목록은 `src/core/engine/DETAIL.md:123-130`입니다.
- 문제: engine DETAIL은 `utils/parsePointerSegments`를 `vi.mock`으로 감싸는 시험을 일곱 파일로 못 박고, "여기에 없는 시험은 같은 방식으로 내부를 감쌀 수 없다"고 적습니다. 새 시험은 여덟 번째인데 목록에 없습니다.
- 실패 시나리오: jsonPointer에서 그 파일을 옮기는 사람은 목록의 일곱 시험만 고칩니다. 이 시험은 예고 없이 깨지고, 목록이 닫힌 계약이라는 문서 진술도 거짓이 됩니다.
- 수정 명세: 123행의 "다음 일곱 시험은"을 "다음 여덟 시험은"으로 바꿉니다. 130행 뒤에 다음 줄을 더합니다.
  `  - \`settle/utils/gates/__tests__/getGateBudgetCap.pointer-work.test.ts\`: gate 예산 색인 준비가 같은 active gate의 schema 경로를 gate마다 한 번만 \`utils/parsePointerSegments\`로 해석함을 센다.`
- 확인: `grep -n "getGateBudgetCap.pointer-work" src/core/engine/DETAIL.md`가 한 줄을 돌려줍니다.

### P2-2. [확인됨: 시험 공백, 결함은 찾지 못함] 생존 0개 폐기의 중첩·비활성 경로를 실행하는 시험이 없습니다
- 위치: `src/core/engine/settle/utils/slots/createExitSlotOverlay.ts:57,77`, `discardClearedArrayItems.ts:12-15`. 시험은 `src/core/surface/__tests__/surface.clearing-array-zero-survivors.test.ts`입니다.
- 문제: 지금 두 시험은 루트 바로 아래 배열이 스스로 나가는 경우만 봅니다. 다음 두 경우는 동작이 바뀌었는데 실행하는 시험이 없습니다.
  - 살아남는 행 안의 keep 없는 지움 배열은 이제 빠른 경로에서 아이템을 폐기합니다. 수정 전에는 그 옛 참조 쓰기가 생존 행의 보유 슬롯에 잠재 값을 다시 만들었습니다.
  - 이미 비활성인 자손(아이템의 inactive slot)은 77행 뒤의 폐기 재귀로만 표시됩니다. 작업자가 스스로 적은 약점입니다.
- 실패 시나리오: `child.parent === node` 거르기나 inactive slot 순회를 잘못 바꾸거나 빠른 경로 호출을 `context`가 있을 때로 좁혀도 지금 시험은 모두 초록입니다.
- 수정 명세: 위 시험 파일 끝에 두 시험을 더합니다. 각 시험이 `createExitSlotOverlay.ts`의 57행과 77행 호출을 잠시 지운 상태에서 실패하는지 확인한 뒤 되돌립니다.
  - 중첩 사례의 스키마는 `{ type: 'object', properties: { open: { type: 'boolean' }, list: { type: 'array', controls: { active: '#/open', unsetOnInactive: true }, items: { type: 'object', properties: { keep: { type: 'number', controls: { unsetOnInactive: false } }, inner: { type: 'array', items: { type: 'object', properties: { x: { type: 'number' } } } } } } } } }`입니다. `root.setValue({ open: true, list: [{ keep: 1, inner: [{ x: 2 }] }] })` 뒤 `const old = root.find('/list/0/inner/0/x')!`를 잡고 `/open`을 false로 씁니다. `const before = root.inactiveValues` 뒤 `old.setValue(9)`를 하고 `expect(root.inactiveValues).toEqual(before)`를 단언합니다. `/open`을 true로 쓴 뒤 `expect(root.find('/list/0/keep')!.value).toBe(1)`과 `expect(JSON.stringify(root.find('/list')!.value)).not.toContain('9')`를 단언합니다.
  - 비활성 자손 사례는 `surface.clearing-array-keep.test.ts:236`의 스키마를 그대로 쓰고 초기 값만 `{ open: true, show: true, list: [{ drop: 1 }] }`로 바꿉니다. `const emptyKeep = root.find('/list/0/keep')!`, `/show` false, `/open` false, `const before = root.inactiveValues`, `emptyKeep.setValue(5)`, `expect(root.inactiveValues).toEqual(before)`, `/open` true, `/show` true, `expect(root.find('/list')!.value).toEqual([])` 순서입니다.
  - 두 시험 중 하나가 호출을 지운 상태에서도 통과하면, 그 사실을 결과 문서 4절에 적고 질문으로 올립니다.
  - 배열 자체의 inactive slot 순회(`discardClearedArrayItems.ts:14-15`)는 이 두 시험으로도 실행되지 않습니다. 그 상태를 만드는 fixture가 없으면 결과 문서에 "코드 읽기로만 확인"이라고 적습니다.

## P3 — 사소한 것

### P3-1. [확인됨] 맨 이름 표의 "원장 순서" 주석이 틀려졌습니다
- 위치: `src/errors/constants/JSONSchemaErrorSpecific.ts:1-4`.
- 문제: 머리 주석은 "in ledger order"인데 새 멤버가 맨 앞에 있습니다. `FormErrorCode`에서는 맨 뒤라서 두 표의 순서도 다릅니다.
- 수정 명세: 3-4행(문서 주석과 `ReservedPropertyName` 줄)을 `InvalidControlShape` 줄 뒤로 옮깁니다. `codeGroups.test.ts`는 같은 표에서 만든 키끼리 비교하므로 초록으로 남습니다.

### P3-2. [확인됨, 추적] DETAIL의 "한 번 순회" 문장이 중첩 폐기와 맞지 않습니다
- 위치: `src/core/engine/settle/DETAIL.md:21`.
- 문제: 안쪽 keep 없는 지움 배열은 바깥 정책 평가 중에 자기 아이템을 폐기합니다. 그 뒤 바깥 행이 버려지면 바깥 폐기 재귀가 같은 아이템을 다시 순회합니다. 비용은 중첩된 지움 배열 수에 비례해 늘어납니다.
- 수정 명세: "Discard walks the discarded item's retained subtree once"를 "Each discard walks the discarded item's retained subtree once, and a nested clearing array that already discarded its items is walked again by an enclosing discard"로 바꿉니다.

### P3-3. [확인됨] 빈 이름 수정의 범위가 DETAIL과 시험보다 넓습니다
- 위치: `src/core/engine/derive/DETAIL.md:19`, `derive/__tests__/derive.empty-name-target.test.ts`.
- 문제: 같은 검사가 `controls.fields[].targets: ['']` 규칙에도 적용되지만 DETAIL은 조각 규칙만 적습니다. 시험에는 watch나 context 의존이 없어서 `getDependencyIndex.ts:165`와 `getContextOwners.ts:45` 변경을 실행하지 않습니다.
- 수정 명세: DETAIL의 "조각 규칙의"를 "조각 규칙과 fields 규칙의"로 바꿉니다. 빈 이름 자식이 watch 경로를 선언하는 사례 하나를 더합니다. watch 표기는 `derive/__tests__`의 기존 watch 시험을 따릅니다.

### P3-4. [그럴듯함] 격리 시험이 `#` 처리의 일부 형태를 놓칩니다
- 위치: `src/__tests__/pointerIsolation.test.ts:187-199`, 기존 사례 `src/core/engine/utils/controls/getFragmentOwnerPaths.ts:20`.
- 문제: 비교 규칙은 피연산자 이름이 path·pointer 계열일 때만 걸립니다. 그래서 `reference[0] === '#'`, 템플릿 `` `#${x}` ``, 초기값 `let prefix = '#'`은 잡히지 않습니다. 마지막 것은 기준부터 있던 조립 씨앗입니다.
- 수정 명세: 템플릿 머리가 `#`로 시작하면 `fragment prefix template`으로 기록하는 규칙과 탐침 시험 하나를 더합니다. `getFragmentOwnerPaths.ts:20`은 후속 정리 항목으로 결과 문서에 적습니다.

### P3-5. [확인됨] 한 커밋의 작성자와 언어가 다릅니다
- 위치: `3fa35fa35`. 작성자 이름과 제목 언어가 다른 커밋들과 다릅니다(보조 작업자의 커밋으로 보임).
- 판단: 이력을 다시 쓰면 측정 중인 `57becc34f`와 결과 문서의 SHA가 바뀝니다. 스쿼시 병합이 개별 커밋을 지우므로 코디네이터는 그대로 둔다.

## 범위 밖으로 남은 B6 P3

`resolveGateOccurrence`의 `@param readSegments` 누락, jsonPointer DETAIL의 역참조 부재, `getDependencyIndex.ts:170`의 `?? []`는 그대로입니다. B8 지시에 없었으므로 결함으로 세지 않았습니다.

## 정적으로 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다. 결과 문서의 관문 표는 작업자의 기록입니다.
- 실패 우선 수치(4→0, 2→0, 560→80, 41→42)를 실행으로 보지 않았습니다. 80회 단언은 `createDispatchTree`가 예산 색인을 미리 만들지 않는다는 가정에 기댑니다.
- `writeSlotPath` 이름공간 spy는 node 환경 unit 프로젝트에서만 가로챕니다. `settle.empty-phases.test.ts`에 같은 방식의 선례가 있습니다.
- 배달 비교 차이 0과 mount 배달은 실행하지 않았습니다. 장면 구성과 관측점 산술만 확인했습니다.
- 선언 차이는 작업자의 원시 파일과 스냅샷만 보았고 빌드하지 않았습니다.
- mount 단계 장부와 정식 A/B 창은 아직 결과가 없습니다.
- P2-2 제안 시험의 수정 전 실패 여부는 추적으로만 예측했습니다.
