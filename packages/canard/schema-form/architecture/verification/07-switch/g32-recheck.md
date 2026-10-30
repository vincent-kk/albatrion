# G32 재검증 — 원장 대 구현 대조

대상은 `feat/schema-form-switch`의 HEAD `f9ae05d5e`이며, 기준은 `origin/1.0.0-beta`입니다. 범위는 직전 G32 이후의 `git log 8955aa173..HEAD -- packages/canard/schema-form/src` 커밋 41개입니다(perf 커밋 26개, `src/__legacy__` 제외). 계약은 기준 브랜치의 원장, 102–112라운드 마감·소유자 답 문서, 그리고 `analysis-records-design.md`입니다.

먼저 antigravity가 대조했고, 차단 0건이라고 보고했습니다. 그러나 보완 호출이 세션 오류로 실패해, 인용의 실재를 확인할 수 없었습니다. 그래서 원장 조건("멈추면 Claude verifier")에 따라 Claude verifier가 인용마다 원본을 열어 다시 대조했습니다. 판정은 아래 verifier의 것입니다.

## 판정

**G32: PASS. 차단 0건, 비차단 1건입니다.** 원장 계약이 깨진 자리는 없고, 원장 결정 없이 바뀐 공개 계약도 없습니다.

## 실행 확인

- unit·render·react18: 시험 파일 456개, 3,371건 통과, todo 1건, 실패 0건입니다.
- 운영 모드 프로젝트: 9개 파일, 20건 통과입니다.
- typecheck: 종료 코드 0입니다.
- 공개 표면의 코드 변화는 없습니다. `src/index.ts`, `src/types`, `src/core/SchemaNode`, `src/core/types`, `src/app`, `src/hooks`, `src/providers`, `src/components/Form`이 대상이며, 바뀐 것은 DETAIL 한 줄과 시험 파일의 이동뿐입니다.

## 대조 결과

1. **owned-inline 동결(103C-01, Q106, Q107, F52 행)은 계약대로입니다.** 근거는 다음과 같습니다.
   - 공개 값은 만든 자리에서 두 모드 모두 동결합니다: `freezeEffectiveSchema.ts:26-72`, `buildNodes.ts:64`, `createBlueprintGate.ts:12-21`.
   - hint 병합이 만든 객체만 동결합니다: `mergeHintGroup.ts:47-53`, `freezeCreatedHintObjects.ts:22,28`.
   - 소속 배열은 기록마다 소유하고, 개발 모드에서만 동결합니다: `blueprint.ts:88-121`.
   - Q106의 두 자리는 `blueprint.ts:75-78,110`과 `mergeSchemaContributions.ts:49`에서 고쳐졌습니다.
   - `DEFAULT_CHOICES`(`getStaticChoices.ts:22-27`)는 두 모드 모두 동결하는 내부 공유 값입니다.
2. **perf 커밋 26개에 관측 가능한 변화는 없습니다.** 커밋마다 지켜야 할 계약과, 그것을 고정하는 시험을 짝지었습니다. 근거는 코드 동치 대조, 또는 차등 시험입니다. 특히 c31ac77e3은 EVENT-007(`event.md:178`, "`revision`은 커밋 시 배달 집합 전체를 한 번에 올린다")을 지킵니다. 전역 노드를 먼저 방문하고, 나머지는 중복 없이 같은 순서로 방문하며, 순회 중에는 두 집합이 바뀌지 않습니다.
3. **EVENT-070 고침(27103f65e)은 EVENT-039·040·070과 112C-01대로입니다.** 근거는 다음과 같습니다.
   - 경계는 `withFormTypeInputErrorBoundary.tsx:15-23`에서 한 번 만들어집니다.
   - 원본 입력에만 `inputGeneration`이 key로 갑니다.
   - 모든 공급 경로가 같은 처리를 받습니다: `useFormTypeInput.ts:25`, `formTypeInputMap.ts:28,33`, `formTypeInputDefinitions.ts:67`, `SchemaNodeInputWrapper.tsx:56,58`.
   - 남은 key는 RequestRemount의 `SchemaNodeField.tsx:110` 하나입니다.
   - 시험 (ㄱ)(ㄴ)(ㄷ)은 48건이며 두 React 판에서 돕니다. 원래 시험은 바뀌지 않았습니다.
4. **filid 경계 커밋(661109e77, f9ae05d5e)에 동작 변화는 없습니다.** `src/core/DETAIL.md:172-176`의 면제는 규칙이 요구하는 선언 형식(소유 fractal의 DETAIL, 까닭 포함)을 따릅니다.

## 비차단 지적과 처리

F52 행(`analysis-records-design.md`)이 "105라운드 원장 답"을 근거로 들었는데, 기준 브랜치의 105라운드 마감 문서에는 기본 선택지가 없습니다. 이 행의 근거를 101C-01 조건 (1)(`round-101-closing.md:5 @origin/1.0.0-beta`)과 106라운드 채택 목록(`round-106-closing.md:3 @origin/1.0.0-beta`)으로 고쳤습니다. 106라운드 문서의 3행에 "기본 선택지 공유"가 있음을 확인했습니다.

## 범위 밖 관찰

`src/core/settle/utils/derivation/runDeriveRounds.ts:106`의 `process.env.NODE_ENV === 'test'` 그림자 평가가 제품 코드에 들어 있습니다. 소비자의 시험 실행기도 NODE_ENV를 test로 두면, 확인 라운드를 한 번 더 돌고 증명이 틀린 경우 일반 `Error`를 던질 수 있습니다. 98C-01(`round-98-closing.md:9`)이 "시험 방식에서는 … 그림자를 둔다"고 정했으므로 계약 위반은 아닙니다. 다만 "시험 방식"이 이 패키지의 시험만을 뜻하는지는 원장 관리자가 판단할 일입니다.

## 확인하지 못한 것

- af1904cf9와 ccfecf1b4는 표본으로만 읽었고, 동치는 두 차등 시험의 통과에 기댑니다.
- D1 차등 검증과 커밋 메시지의 성능 수치는 다시 재지 않았습니다.
- storybook 프로젝트는 G23 소관이라 돌리지 않았습니다.
- filid 재검사는 이 대조와 별도로 G31 기록(`f9ae05d5e`에서 경계 0, 순환 0)에 있습니다.

## 2026-10-11 재검증 — `f9ae05d5e..a76ebf44a`

대상은 HEAD `a76ebf44a`이며, 범위는 `git log f9ae05d5e..a76ebf44a -- packages/canard/schema-form/src ':!packages/canard/schema-form/src/__legacy__'`의 커밋 13개입니다. 여기에는 G27 2단계 수정(`9f6b4000f` B4 로드 수명, `67d7a8e42` 렌더 형 선언, `ad8cbd743` 시험 fixture 이동, `75fc421b4` 문서)과 그 앞의 perf·형 정비 커밋(`831805d27`, `4e8490a72`, `1a0176da3`, `65f74e669`, `e805074de`, `fe7ece01e`, `daca1d14a`)과 문서 커밋 둘(`3a637c4cd`, `e59e435aa`)이 들어 있습니다. 대조 담당은 antigravity(티어 high, 세션 `13fcda8b-c66c-4c1b-ae38-9fb7b994e4a6`)입니다.

### 판정

**G32: PASS. 차단 0건입니다.** 13개 커밋 모두에 원장 항목이나 라운드 결정이 대응하며, 원장 결정 없이 바뀐 공개 계약은 없습니다. 변경된 모듈 12곳의 DETAIL.md가 현재 구현을 기술합니다.

### 인용 확인

antigravity의 지난 대조에서 인용 경로가 실재하지 않은 일이 있어, 이번에는 인용을 직접 열어 확인했습니다.

- 원장 인용 19개(ERROR-044·090·114·117·202·204, SETTLE-004·017·045, CONTROLS-080, REACT-027·028·033, EVENT-039·040·042·070, LANDING-087·186)는 인용한 파일과 행 번호가 모두 실제 `### <id>` 머리와 일치합니다.
- 인용한 워크트리 경로 가운데 `src/types/formType.ts`는 없습니다. `FormTypeInputProps`의 실제 자리는 `src/types/formTypeInput.ts:29`입니다. 범위 안에서 `src/types` 전체의 차분은 `src/types/error.ts`의 문서 주석 두 줄뿐이므로 "공개 형 불변"이라는 결론은 그대로 성립합니다. `src/index.ts`와 `src/components/Form/type.ts`의 차분도 없습니다.
- B4가 더한 `FormErrorService.load`·`beginLoad`는 `src/index.ts`가 내보내지 않는 내부 형입니다.
- 비차단 1번(패키지 CLAUDE.md의 `normalizedValue`)은 이미 해결된 사항입니다. 소유자 승인에 따라 `78841d697`에서 고쳤고 현재 `CLAUDE.md`에 `normalizedValue`는 0건입니다.

### 비차단

- core 비시험 코드의 형 단언 14건은 소유자 질의 4항의 답을 기다립니다.
- G26의 `수용 대기` 행은 소유자 질의 5·7항의 답을 기다립니다.

## 2026-10-12 재검증 — `a76ebf44a..ee3b730c0`

대상은 HEAD `ee3b730c0`이며, 범위는 `git log a76ebf44a..ee3b730c0 -- packages/canard/schema-form/src ':!packages/canard/schema-form/src/__legacy__'`의 제품 커밋 다섯(`34b370eed`, `62e140d8d`, `0eb8e3ada`, `e1d3a8914`, `e9c408980`)입니다. G27 4단계([g27-phase4.md](g27-phase4.md))의 B2가 이 범위의 대조를 요구했습니다. 대조 담당은 antigravity(티어 high, 세션 `e879ebb3-c217-45e1-95d9-5f2c7af70c82`)입니다.

주 세션이 인용 원장 머리 가운데 SETTLE-017·044, TEST-027·070, NODE-046, LANDING-204, BLUEPRINT-030의 일곱을 워크트리에서 직접 열어 인용한 행의 `### <id>` 머리와 일치함을 확인했습니다. 메인 체크아웃에서는 TEST-027·070의 행 번호가 `1.0.0-beta`의 보충으로 밀려 있으므로 행 번호는 워크트리 기준입니다.

### 판정

**G32: PASS (차단: 0건)**

차단 0건, 비차단 4건입니다. 검토 대상 범위인 `a76ebf44a..ee3b730c0` 내 5개 제품 커밋(`34b370eed`, `62e140d8d`, `0eb8e3ada`, `e1d3a8914`, `e9c408980`) 모두 원장 항목 및 소유자 라운드 결정에 의해 승인되었으며, 원장 결정 없이 변경된 공개 계약이나 규정되지 않은 동작 변화는 없습니다.

### 실행 및 정적 검증 요약

- **typecheck**: `yarn workspace @canard/schema-form typecheck` 종료 코드 0 (성공).
- **관련 단위 시험**: 신규 추가/수정된 테스트 9개 파일 63건 전체 통과 (`vitest run` 종료 코드 0).
- **공개 표면 차분**: `P/src/index.ts`, 재내보내기 전체, `P/src/types/**`, `P/src/components/Form/type.ts`의 공개 인터페이스 변경 0건.

### 커밋별 원장·라운드 대조 표

| 커밋 | 권한 부여 원장 항목 / 라운드 결정 | 일치 여부 | 근거 (파일:행) | 핵심 구현 내용 |
| --- | --- | :---: | --- | --- |
| `34b370eed` | 146라운드 Vincent 답 (`round-146-owner-answers.md:7-9,11`), 147라운드 Vincent 답 (`round-147-owner-answers.md:7`), G27 게이트 (`error.md:3092`, `test.md:540`, `TEST-070` in `test.md:1276`, `NODE-046` in `node.md:782`) | 예 | `packages/canard/schema-form/src/core/blueprint/type.ts:48-69`<br>`packages/winglet/json/src/JSONPointer/utils/manipulator/getValue.ts:10-16,138`<br>`packages/canard/schema-form/src/core/blueprint/utils/analyze/resolveReference.ts:35`<br>`packages/canard/schema-form/src/core/nodeFromJSONSchema.ts:31,35`<br>`packages/canard/schema-form/src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:38-39`<br>`.changeset/json-get-value-unknown-overload.md:1-7` | • `BlueprintGate`를 kind 기반 판별 합집합으로 정의하여 `#2`, `#6` 단언 제거<br>• `@winglet/json` `getValue`에 unknown 입력 overload를 추가하여 `#5` 단언 제거<br>• `nodeFromJSONSchema`의 `isTerminal`을 불리언 스키마를 받는 타입으로 변경하여 `#14` 단언 제거<br>• `#12` `new Function`은 사유 주석을 기재하고 단언 보존 (소유자 승인)<br>• 방출 JS 번들 바이트 동일 |
| `62e140d8d` | 149라운드 Vincent 답 (`round-149-owner-answers.md:7`), 152라운드 Vincent 답 (`round-152-owner-answers.md:7`), G27 (`error.md:3092`, `TEST-070` in `test.md:1276`, `NODE-046` in `node.md:782`) | 예 | `packages/winglet/common-utils/src/utils/filter/isArray.ts:129-131`<br>`packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts:64-68`<br>`packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:30-35`<br>`packages/canard/schema-form/src/formTypeDefinitions/FormTypeInputUnion.tsx:19`<br>`packages/canard/schema-form/src/types/__tests__/formTypeInput.nullable.test.ts:25`<br>`packages/canard/schema-form/src/__legacy__/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:102`<br>`packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:26`<br>`packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:13,29,56,86`<br>`.changeset/common-utils-is-array-readonly-overload.md:1-7` | • `@winglet/common-utils` `isArray`에 readonly 배열 overload 추가하여 `buildNodes`(`#1`) 및 `mergeSchemaContributions`(`#10`) 선언부 단언 제거<br>• 좁혀진 타입으로 인해 영향받은 선언 6곳 확장 (제품 1곳, 시험 1곳, 소유자 승인된 레거시 5개 파일)<br>• 방출 JS 번들 바이트 동일 |
| `0eb8e3ada` | 153C-01 (`round-153-closing.md:5-7`), 146라운드 덧붙임 (`round-146-owner-answers.md:15`), 150라운드 Vincent 답 (`round-150-owner-answers.md:7`), G27, 닫는 항목: `TEST-070(보충)` (`test.md:1276`), `NODE-046(보충)` (`node.md:782`) | 예 | `packages/canard/schema-form/src/core/blueprint/utils/types/isBlueprintSchema.ts:8-10`<br>`packages/canard/schema-form/src/core/blueprint/utils/types/isObjectRecord.ts:6-9`<br>`packages/canard/schema-form/src/core/blueprint/utils/analyze/resolveReference.ts:48-54`<br>`packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts:15`<br>`packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils/freezeCreatedHintObjects.ts:18`<br>`packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:45-47`<br>`packages/canard/schema-form/src/core/blueprint/utils/types/readAllowedTypes.ts:27,58-64`<br>`packages/canard/schema-form/src/core/blueprint/utils/analyze/populateVirtualNodes.ts:41-42`<br>`packages/canard/schema-form/src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:55,66,71`<br>`packages/canard/schema-form/architecture/verification/07-switch/g27-runtime-guards-153.md:3,20-24` | • 5개 단언(#4, #8, #9, #11, #13)을 런타임 가드로 교체 (`isBlueprintSchema`, `isObjectRecord`, 로컬 `isAllowedTypeList`)<br>• #3과 #7은 150라운드 원칙 3에 따라 수락 값 변경을 막기 위해 사유 주석을 기재하고 단언 보존<br>• 153 판정 세션 결과 React ADOPT, Core ADOPT 및 회귀 0건 기록으로 가드 채택 확정 |
| `e1d3a8914` | 154C-01 (`round-154-closing.md:5-7`), 148C-01 (`round-148-closing.md:5`), 151C-01 (`round-151-closing.md:5`), 153C-01 (4) (`round-153-closing.md:5`), `TEST-027(보충)` (`test.md:548`) | 예 | `packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots.ts:35`<br>`packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots/utils/canApplyArrayTail.ts:10-26`<br>`packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots/utils/applyArrayTail.ts:28-115`<br>`packages/canard/schema-form/src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts:22-26,41`<br>`packages/canard/schema-form/src/core/settle/DETAIL.md:9,240-245`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.array-prefix.test.ts:9,11-40`<br>`packages/canard/schema-form/architecture/verification/07-switch/array-fix1-154.md:3,20-24` | • 배열 append 및 remove-last 시 접두 불변 조건을 `canApplyArrayTail`로 증명하고, `applyArrayTail`을 통해 꼬리 슬롯만 생성/소멸<br>• 접두 raw 재합성 및 불필요한 move 할당을 제거하고 `rekeyArrayRuntimePaths`의 `preservedPrefixCount` 적용<br>• 소멸 항목에 대한 분리 읽기 캡처 및 정착 생명주기 완전 일치<br>• 154 판정 세션 통과 (React ADOPT, Core ADOPT, 회귀 0건, push-100 -9.21 ms, push-remove-100 -14.40 ms) |
| `e9c408980` | 155C-01 (`round-155-closing.md:5-7`), 153C-01 (4) (`round-153-closing.md:5`), 154C-01 (5) (`round-154-closing.md:5`), `TEST-027(보충)` (`test.md:548`) | 예 | `packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts:81-84`<br>`packages/canard/schema-form/src/core/settle/utils/compute/selectChildren/utils/canReuseArrayChildren.ts:19-52`<br>`packages/canard/schema-form/src/core/settle/utils/compute/selectChildren/utils/reuseArrayChildren.ts:15-30`<br>`packages/canard/schema-form/src/core/settle/utils/compute/selectChildren/utils/staticIds.ts:11-21`<br>`packages/canard/schema-form/src/core/settle/DETAIL.md:5,7,246-250`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.array-selection-reuse.test.ts:12,14-30`<br>`packages/canard/schema-form/architecture/verification/07-switch/array-fix2-155.md:3,20-24` | • 게이트·식·파생이 없는 branchless 폼에서 접두가 보존된 배열 길이 변경 후 `canReuseArrayChildren`으로 정적 선택 재사용 자격을 증명<br>• `reuseArrayChildren`으로 정적 선언 ID를 공표하고 dirty 자식만 선별 계산하여 접두 자식 선택 본문 순회 0회 실현<br>• 155 판정 세션 통과 (React ADOPT, Core ADOPT, 회귀 0건, push-remove-100 -4.05 ms 이득) |

### 공개 표면 차분 (Public Surface Diff)

검토 대상: `P/src/index.ts`, `src/index.ts`가 재내보내는 모든 파일, `P/src/types/**`, `P/src/components/Form/type.ts`.

- `P/src/index.ts`: 차분 0건 (불변).
- `P/src/components/Form/type.ts`: 차분 0건 (불변).
- `P/src/types/**`: `src/types/__tests__/formTypeInput.nullable.test.ts:25`의 시험 내부 변수 타입 확장(`readonly unknown[]`) 1줄 외에 공개 타입 선언 파일 변경 0건.
- `P/src/index.ts` 재내보내기 심볼:
  - `src/app/plugin`: 불변.
  - `src/components/Form`: 불변.
  - `src/errors`: 불변.
  - `src/helpers/jsonPointer`: 불변.
  - `src/helpers/virtualization`: 불변.
  - `src/core`: `src/core/index.ts`가 내보내는 공개 심볼 42개 전체 불변. (34b370eed에서 변경된 `nodeFromJSONSchema`의 `isTerminal` 인자 선언은 `src/index.ts`에서 재내보내지 않는 코어 내부 함수임).
  - `src/hooks`, `src/providers`: 불변.
- **결론**: 공개 표면 계약 차분은 없으며 완벽하게 불변을 유지합니다.

### DETAIL.md 기술 현황 점검

해당 범위가 수정한 모듈의 `DETAIL.md`가 현재 구현(불변량, 비용, 수락 그룹)을 기술하는지 확인했습니다.

1. **`packages/canard/schema-form/src/core/blueprint/DETAIL.md`**
   - 런타임 가드 5건(#4, #8, #9, #11, #13) 적용 내역 및 가드 제거 시 실패하는 계약 기술 (5~7행).
   - `#3` (가상 필드) 및 `#7` (인라인 종단 경고)의 사유 주석 잔존 근거(함수 및 상속 필드를 가진 원시값 등 기존 수락 동작 보존) 명시 (5행).
   - 실행 비용: 고정 수의 가드 호출 외 새 순회·캐시·색인·보유 객체 없음 기술 (5, 7행).
   - 최종 갱신일: 2026-10-12 및 비용 기록 갱신 반영 (187행).

2. **`packages/canard/schema-form/src/core/settle/DETAIL.md`**
   - 배열 구조 꼬리 전용 처리(`applyArrayTail`, `canApplyArrayTail`, `rekeyArrayRuntimePaths`):
     - 불변량 및 적용 요건(공유 구간의 동일 위치, 살아 있는 노드·청사진 유지, 통째 raw 부재) 명시 (9행).
     - 실행 비용(접두 raw 재합성·재배치 map/set·move 할당 제거, O(P) 자격 검사 및 꼬리 비례 작업) 명시 (9행).
     - 수락 그룹: `settle-array-prefix` 정의 (240~245행).
   - 배열 정적 선택 재사용(`canReuseArrayChildren`, `reuseArrayChildren`, `staticIds`):
     - 불변량 및 적용 요건(branchless 청사진, 게이트·식·파생 부재, 통째 raw·분배 입력·경로 이동·pending exit 부재, prior 구조 일치) 명시 (5, 7행).
     - 실행 비용(일반 선택의 구조 복제·잠복/이탈 조회 제거, O(슬롯 수) 정체성 확인) 명시 (7행).
     - 수락 그룹: `settle-array-selection-reuse` 정의 (246~250행).

- **결론**: 변경된 모듈의 `DETAIL.md`는 현재 코드의 불변량, 비용, 수락 그룹을 빠짐없이 정확하게 기술하고 있습니다.

### 두 배열 단축 경로의 정착 계약(SETTLE-*) 검증

`e1d3a8914` 및 `e9c408980`의 두 배열 최적화 경로가 원장의 정착 계약을 준수하는지 검증했습니다.

1. **정착 주기 단계 및 순서 준수 (`SETTLE-001`, `SETTLE-002`, `SETTLE-003`, `SETTLE-004`, `SETTLE-005`, `SETTLE-006`)**
   - 두 단축 경로는 정착의 5단계(표시 → 계산 → 파생 → 전이 → 커밋) 구조를 변경하지 않고 구조 연산(`applyArraySlots`) 및 자식 선택(`selectChildren`) 내부에서만 조건부 분기로 동작합니다.
   - 꼬리 경로(`applyArrayTail`)는 `changedNodes`, `changedRaw`, `dirtyPaths`, `shapeDirtyPaths`를 등록하고, 신규 슬롯은 `entered` 및 `markWrite`를 호출하며, 제거 슬롯은 `perished` 등록 및 분리 읽기(`captureDetachedSchemaNodeReads`)를 완전하게 수행합니다.
   - 선택 재사용(`reuseArrayChildren`)은 정적 선언 ID를 공표하고 dirty 경로에 있는 자식 노드에 대해서만 기존 `computeChild`를 호출하여 계산 생명주기를 일치시킵니다.

2. **출발점 고정 및 활성 집합 독립성 (`SETTLE-044`, `SETTLE-050`)**
   - `SETTLE-044`는 이전 커밋의 `active` 상태를 가설로 삼아 게이트를 건너뛰는 최적화를 금지합니다(양의 순환 등 이력 의존성 방지).
   - `canReuseArrayChildren`은 `context.hasGates === false`, `capabilities.branchless === true`, `capabilities.hasExpressions === false`, `capabilities.hasDerive === false`를 진입 조건으로 강제합니다. 게이트가 없는 트리에서만 동작하므로 이전 커밋의 활성 집합에 의존한 게이트 건너뛰기가 원천적으로 발생하지 않습니다.
   - `applyArrayTail`은 호스트에 게이트가 존재할 경우(`context.hasGates === true`) 접두를 포함한 모든 자식의 게이트를 해제 후 재등록하여 고정 출발점 계약을 철저히 준수합니다.

3. **비용 상한 및 순회 범위 계약 (`SETTLE-017`, `SETTLE-047`, `SETTLE-048`)**
   - `SETTLE-017` 및 `SETTLE-047`이 요구하는 대로, 변경되지 않은 접두의 전체 재합성을 제거하여 증분 갱신 작업량을 입력 변경 폭에 비례하도록 줄였습니다.
   - 영구 캐시나 폼 인스턴스 간 공유를 일체 추가하지 않고 WeakMap 메모 및 현재 정착 문맥만을 사용합니다.
   - `settle.array-prefix.test.ts` (13건) 및 `settle.array-selection-reuse.test.ts` (13건) 차등 시험을 통해 일반 경로와의 출력, 분리 읽기, 배달 결과의 완전한 일치와 폴백 동작이 확인되었습니다.

- **결론**: 두 단축 경로는 원장의 `SETTLE-*` 계약을 온전히 만족합니다.

### 인용 원장 ID 목록 (Cited-ID List)

본 검토에서 인용한 모든 원장 항목은 원본 파일을 직접 열어 `### <ID>` 표제어의 실재를 확인했습니다.

| 인용 원장 ID | 파일 경로 | 행 번호 | 표제어 원문 |
| --- | --- | :---: | --- |
| `SETTLE-001` | `packages/canard/schema-form/architecture/ledger/settle.md` | 64 | `### SETTLE-001 정착 한 번의 자리와 순서 — 한 곳, 고정된 순서, 동기·단방향` |
| `SETTLE-002` | `packages/canard/schema-form/architecture/ledger/settle.md` | 78 | `### SETTLE-002 표시 단계` |
| `SETTLE-003` | `packages/canard/schema-form/architecture/ledger/settle.md` | 91 | `### SETTLE-003 계산 단계 — 호스트 바퀴, 게이트 둘, 끝에서 잠금·보임 결정, 원본을 읽기만 함` |
| `SETTLE-004` | `packages/canard/schema-form/architecture/ledger/settle.md` | 108 | `### SETTLE-004 파생 단계 — 같은 대상 규칙, 순위, 진 쓰기와 에지 소비, 재발화 금지` |
| `SETTLE-005` | `packages/canard/schema-form/architecture/ledger/settle.md` | 130 | `### SETTLE-005 전이 단계 — 생긴 노드의 채움, 나감의 비움, 전이 라운드 상한` |
| `SETTLE-006` | `packages/canard/schema-form/architecture/ledger/settle.md` | 168 | `### SETTLE-006 커밋 단계 — revision 일괄, 커밋 번호, controls.resetInteraction 판정` |
| `SETTLE-017` | `packages/canard/schema-form/architecture/ledger/settle.md` | 323 | `### SETTLE-017 비용의 상한(G6) — 순회 범위, 되돌림 기록, 역의존 표, 라운드 합산, 컴파일 공유` |
| `SETTLE-044` | `packages/canard/schema-form/architecture/ledger/settle.md` | 752 | `### SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다 — 출발점 고정, PR-2 벤치 게이트` |
| `SETTLE-047` | `packages/canard/schema-form/architecture/ledger/settle.md` | 829 | `### SETTLE-047 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만` |
| `SETTLE-048` | `packages/canard/schema-form/architecture/ledger/settle.md` | 846 | `### SETTLE-048 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기(setValue(V) 포함)는 직전 커밋` |
| `SETTLE-050` | `packages/canard/schema-form/architecture/ledger/settle.md` | 885 | `### SETTLE-050 직전 커밋의 활성 집합은 전이 판정에만 — 평가 순서 힌트(F13)로 쓰지 않음, 바퀴의 평가 순서는 청사진 전순서, 게이트` |
| `CONTROLS-080` | `packages/canard/schema-form/architecture/ledger/controls.md` | 1225 | `### CONTROLS-080 controls 식 언어 명세 — 문법·컴파일, 전역 이름, 경로 토큰, * 없음, 경로는 방출 트리를 읽음, 형상 밖은 undefined, 배열 색인·길이, @ 맥락` |
| `BLUEPRINT-017` | `packages/canard/schema-form/architecture/ledger/blueprint.md` | 327 | `### BLUEPRINT-017 명시 판별 controls.discriminator — 선언, 변환, 분기 스키마 불변, 청사진 단계에서 끝남, 판별 프로퍼티` |
| `BLUEPRINT-030` | `packages/canard/schema-form/architecture/ledger/blueprint.md` | 502 | `### BLUEPRINT-030 $ref 재귀의 정적 열거와 무한 형상 — 위치마다 한 번, 조각 안 순환 절단, 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 되풀이는 정착 오류` |
| `TEST-027` | `packages/canard/schema-form/architecture/ledger/test.md` | 548 | `### TEST-027 벤치 게이트 — 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합, 통제 가능하고 일정 수준 안` |
| `TEST-070` | `packages/canard/schema-form/architecture/ledger/test.md` | 1276 | `### TEST-070 PR-2 게이트 — 실제 공개 형으로 tsc --strict를 단언 없이 통과, children은 저장 배열과 같은 참조, 실패 시 소유자 물음` |
| `NODE-046` | `packages/canard/schema-form/architecture/ledger/node.md` | 782 | `### NODE-046 레코드 형 → 공개 판별 합집합은 단언 없이 선언 자리에서 — SchemaNodeRecord<Self>, 제네릭 탐색, this: AnyNode, 종류별 생성 표, overload` |
| `LANDING-204` | `packages/canard/schema-form/architecture/ledger/landing.md` | 2985 | `### LANDING-204 우산 1.0.0-beta와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환; 자식 PR은 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스, 단계 정의는 그대로` |

### 비차단 사항 (Non-blocking Notes)

1. **146~157 라운드 문서 참조 위치**: 워크트리 W에는 146~157 라운드 문서가 커밋되어 있지 않아, 브리프 지침에 따라 기본 저장소 경로(`/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/reviews/`)에서 직접 확인했습니다.
2. **155 판정 세션의 두 운영 기록**:
   - 준비 빌드 중 React 기준 번들에서 esbuild 초기화 코드 7줄이 누락된 변형이 발생했으나 고정 SHA-256 검사로 차단되었으며, 07b 개선 목록(개선-31)에 등록되었습니다 (`round-155-closing.md:5`, `performance.md:961`).
   - worker 209 실행 중 시스템 벽시계 역행(-4,035 ms)이 발생했으나 측정은 단조 시계(hrtime) 기반이어서 측정 결과에 영향이 없음을 확인했습니다 (`round-155-closing.md:4`).
3. **배열 3행 최종 재측정 결과 및 소유자 확정**:
   - 156라운드 최종 공식 재측정 결과(`array-push-100` +1.53 ms / 1.018×, `array-replace-200` +9.96 ms / 1.095×, `array-push-remove-100` −2.67 ms / 0.978×)에 대해 157라운드에서 소유자가 권고 (가)를 선택하여 세 행 모두 수용했습니다 (`round-157-owner-answers.md:7`).
   - `array-replace-200`의 잔여 지연(약 10 ms)은 200개 자식의 신규 마운트에 따른 React 렌더 층 고정 비용(오류 경계 컴포넌트, 훅 증가)으로 판명되어 최적화 단계 개선 항목(개선-32)으로 이월되었습니다.
4. **작업 트리 상태 유지**:
   - 워크트리 W의 작업 트리에 157라운드 내용을 반영한 `performance.md` 수정 사항 및 미추적 파일 `g27-phase4.md`가 존재하지만, 읽기 전용 검사 규칙에 따라 저장소 파일은 일체 수정하거나 커밋하지 않았습니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `1a0176da3d20`, `27103f65ee2c`, `3a637c4cd967`, `4e8490a72d50`, `65f74e669e10`, `661109e7701d`, `67d7a8e42993`, `75fc421b418c`, `831805d27d83`, `8955aa1735d3`, `9f6b4000fc5f`, `ad8cbd743f13`, `af1904cf9cc2`, `c31ac77e3500`, `ccfecf1b43ce`, `daca1d14a840`, `e59e435aa1fc`, `e805074de8a9`, `f9ae05d5ea5e`, `fe7ece01ec07`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
