# U8 — 렌더 시험 처분과 하니스 실행 보고

기준: `feat/schema-form-switch` / `ff549bfb7`. 작업 범위는 stage-07 worktree입니다. git 쓰기·설치·빌드 산출물 변경은 하지 않았습니다. 승인 근거는 `origin/1.0.0-beta`의 `2ea4baa10`에 있는 77C-01이며, 로컬에 없는 문서는 `git show`로 읽었습니다.

## 판정

**78C-01의 중단 파일 처분 완료.** 원장 충돌로 보존했던 다섯 파일은 78C-01에 따라 "버리고 새로 쓴다"로 옮겨 삭제했습니다. 재작성 처분은 기존 31파일에서 36파일로 늘었으며 레거시 공개 Form 시험 2파일의 삭제도 유지합니다. 유효한 관찰의 U9 e2e 파일·원장 ID로 시작하는 예정 사례 이름은 렌더 처분표에, 소비자가 볼 변경 다섯 가지는 이주 점검표에 교차 기록했습니다. 별도 재귀 확장·placeholder 경로 결함은 29d061941·fc651e734로 고쳤습니다. 아래 중단 표와 이전 명령 결과는 처분 전 진단 기록이며 관리자 답 대기는 78C-01로 닫혔습니다. U9의 대체 e2e는 이 단위에서 구현하지 않았으며 이 판정은 U8 전체 완료를 뜻하지 않습니다.

## 파일별 처분

파일 경로는 `packages/canard/schema-form` 기준입니다. `kept (중단)`은 성공한 이주가 아니라 관리자 답을 기다리며 원문을 보존한다는 뜻입니다.

| 파일 | 실행 처분 | 한 줄 이유 |
| --- | --- | --- |
| `src/__tests__/harness.smoke.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__tests__/scenarioHarness.render.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__tests__/scenarios/array.mutation-identity.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/array.omit-trailing.composite.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/array.omit-trailing.conditional.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/array.omit-trailing.injection.render.test.tsx` | deleted | VALUE-034·TEST-020·021의 기대 변경을 78C-01로 처분하고 omitTrailing 관찰을 U9 예정 사례로 인계했습니다. |
| `src/__tests__/scenarios/array.omit-trailing.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/array.prefixItems-terminal.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.allOf-ifThenElse.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.anyOf.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.nested-branch.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.oneOf.concurrentMount.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.oneOf.initial.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/composition.oneOf.switch.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/computed.derived.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/computed.readonly-disabled.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/computed.visibility.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/controlled-interaction.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/default-value.input-immutability.render.test.tsx` | deleted | NODE-005·WRITE-071에 따라 78C-01로 처분하고 호출자 defaultValue 불변 관찰을 U9 예정 사례로 인계했습니다. |
| `src/__tests__/scenarios/default-value.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/deferred-mount.render.test.tsx` | deleted | TEST-020·021의 마운트 기대 변경을 78C-01로 처분하고 getValue·controls 아래 지연 필드 관찰을 U9 예정 사례로 인계했습니다. |
| `src/__tests__/scenarios/deferred-mount.strict.render.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__tests__/scenarios/formType-resolution.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/injectTo.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/multi-render-split-brain.render.test.tsx` | deleted | LANDING-115·VALIDATE-010·036의 오류 기대 변경을 78C-01로 처분하고 분기 자식·오류 동기 관찰을 U9 예정 사례로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-initial-null.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-null-branch.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-pending-read-readers.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-pending-read.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.object-validation.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/nullable.object-write-provenance.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/nullable.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/override-props.render.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__tests__/scenarios/refSchema-context-provider.render.test.tsx` | surface-fixed (엔진 차단 1건) | controls·presentation 표면 3건은 복구했고 재귀 형상 오류 1건은 아래에 구체적인 원인을 기록했습니다. |
| `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/renderProp.value.render.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__tests__/scenarios/reset.pristine.render.test.tsx` | deleted | LANDING-148의 find 기대 변경을 78C-01로 처분하고 reset 뒤 비활성 잔여 없음 관찰을 U9 예정 사례로 인계했습니다. LANDING-157은 이름 이주입니다. |
| `src/__tests__/scenarios/schema-props-renderer.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/state-management.render.test.tsx` | surface-fixed | SchemaNodeState·SchemaNodeEventType·FormTypeGroupRenderer·presentation만 맞춰 14건 모두 통과했습니다. |
| `src/__tests__/scenarios/terminal-mode.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/union.migration-shapes.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/upload-file.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/validation.async-race.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/validation.branch-marker.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/__tests__/scenarios/validation.errors.render.test.tsx` | surface-fixed | 새 API·스키마 위치·검증기 모양만 맞췄으며 기존 단언은 모두 동일합니다. |
| `src/__tests__/scenarios/virtual.render.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx` | deleted | 기대가 바뀌는 옛 시험을 삭제하고 처분표의 새 e2e 자리와 보존 상황으로 인계했습니다. |
| `src/helpers/virtualization/__tests__/VirtualizationManager.test.ts` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/hooks/__tests__/useSchemaNodeSubscribe.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/hooks/__tests__/useSchemaNodeTracker.test.tsx` | kept | 파일은 고치지 않았고 새 공통 하니스 또는 기존 독립 연결로 통과했습니다. |
| `src/__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx` | deleted | 73C-01·75C-01에 따라 사례별 새 자리와 시험 이름을 처분표에 기록한 뒤 삭제했습니다. |
| `src/__legacy__/core/__tests__/NullableFormScenarios.test.tsx` | deleted | 73C-01·75C-01에 따라 사례별 새 자리와 시험 이름을 처분표에 기록한 뒤 삭제했습니다. |

## 중단 파일과 관리자에게 전달할 물음

77C-01(A)는 충돌이 있는 파일 전체를 수정하지 않도록 정합니다. 아래 5파일은 HEAD 원문과 동일하며 글롭에도 그대로 포함됩니다. 관찰은 기대값을 유지한 표면 이주 진단에서 확인했습니다. 원문 복구 후에는 같은 파일의 옛 API·키가 먼저 실패하는 경우도 있으므로 다음 절에서 최종 실행과 구분합니다.

| 파일 (src/__tests__/scenarios/) | 시험 | 원장 ID | 기존 기대 | 표면 이주 시 관찰 | 관리자에게 필요한 결정 |
| --- | --- | --- | --- | --- | --- |
| `array.omit-trailing.injection.render.test.tsx` | `trims a node-level setValue injection and preserves leading undefined` | VALUE-034 | `[undefined, 1]` | `[null, 1]` | 방출의 null 변환을 반영해 재작성 처분할지 결정 |
| `array.omit-trailing.injection.render.test.tsx` | `emits the trimmed value from the very first defaultValue hydration` | TEST-020·021 | `changeLog()[0]?.arr === [1]` | `undefined` (마운트 onChange 없음) | 마운트 방출 단언의 처분 결정 |
| `default-value.input-immutability.render.test.tsx` | `does not mutate the user-supplied defaultValue prop` | NODE-005·WRITE-071 | `{name:'Alice', age:99}` | `{name:'Alice'}` | 터미널의 자식 기본값 채움 단언 처분 결정 |
| `default-value.input-immutability.render.test.tsx` | `renders with a frozen defaultValue without throwing` | NODE-005·WRITE-071 | `{theme:'dark', size:10}` | `{theme:'dark'}` | 호출자 불변 단언은 유효하나 터미널 값 단언의 처분 결정 |
| `deferred-mount.render.test.tsx` | `getValue/onChange include values of deferred fields` | TEST-020·021 | `lastValue().f19 === 'v19'` | `lastValue() === undefined` (마운트 onChange 없음) | 동기 생성 후 값 조회와 최초 방출 단언의 처분 결정 |
| `multi-render-split-brain.render.test.tsx` | `oneOf switch updates the child set AND the error message together` | LANDING-115·VALIDATE-010·036 | `errorTexts().length > 0` | `0` (표준 oneOf에서 다른 분기가 유효하여 검증 성공) | 검증 marker 제거 이후 오류 단언의 처분 결정 |
| `reset.pristine.render.test.tsx` | `drops the non-default branch on reset leaving no inactive-branch residue` | LANDING-148 | `node('/advancedSetting')?.enabled === false` | `undefined` (비활성 노드 findNode는 null) | 비활성 탐색 변경에 맞는 단언의 처분 결정 |

`default-value.input-immutability`는 최종 원문 실행에서 통과하지만, 옛 `terminal` 키가 무시된 결과이므로 이주 완료로 세지 않았습니다. `state-management`는 표면 누락을 복구했으므로 중단 목록에서 제외했습니다. `refSchema-context-provider`도 원장으로 기대가 변경된 증거가 없어 중단 목록에서 제외하고, 수정 가능한 표면은 모두 수정했습니다.

## 기존 render 실패 30건의 후속 분류

각 행은 후속 요청 직전 실패 1건에 대응합니다. 기대값은 고치지 않았습니다. 원장 중단 파일에 속한 표면 오류는 파일 전체 보존 규칙 때문에 남아 있습니다.

| 파일 (src/__tests__/scenarios/) | 시험 | 분류 및 조치 | 최종 관찰 / 기존 기대 |
| --- | --- | --- | --- |
| `array.omit-trailing.injection.render.test.tsx` | `trims a node-level setValue injection and preserves leading undefined` | 원장 변경 → 중단(VALUE-034) | `[null,1]` / `[undefined,1]` |
| `array.omit-trailing.injection.render.test.tsx` | `emits the trimmed value from the very first defaultValue hydration` | 원장 변경 → 중단(TEST-020·021) | `undefined` / `[1]` |
| `deferred-mount.render.test.tsx` | `getValue/onChange include values of deferred fields` | 원장 변경 → 중단(TEST-020·021) | `lastValue()` undefined / f19=`v19` |
| `deferred-mount.render.test.tsx` | `renders neither placeholder nor field for a computed-invisible node, and gates it once visible` | 표면(computed→controls), 같은 파일 중단으로 미수정 | `exists('/f15')` true / false |
| `deferred-mount.render.test.tsx` | `oneOf switch drops the old branch placeholders and gates the new branch` | 표면(&if→controls.active), 같은 파일 중단으로 미수정 | `deferred('/platform')` true / false |
| `deferred-mount.render.test.tsx` | `keeps a revealed item eager across sibling removal (reveal ledger)` | 중단 파일 안의 별도 가상화 구현 문제; 기대 변경 근거 없음 | 형제 삭제 뒤 `deferred('/items/10')` true / false |
| `multi-render-split-brain.render.test.tsx` | `oneOf switch updates the rendered child set AND the discriminator value together` | 표면(&if→controls.active), 같은 파일 중단으로 미수정 | 최초 `exists('/director')` true / false |
| `multi-render-split-brain.render.test.tsx` | `oneOf switch updates the child set AND the error message together` | 표면 오류가 먼저 발생; 이주 시 LANDING-115·VALIDATE-010·036 충돌로 중단 | 최초 director 존재 true / false; 이주 후 오류 0 / 1개 이상 |
| `refSchema-context-provider.render.test.tsx` | `grows a self-recursive ($ref: "#") array item with the referenced fields` | 표면 수정 후 별도 엔진 차단; 아래 원인 참조(BLUEPRINT-030·ERROR-190) | `exists('/children/0/children')` false / true |
| `reset.pristine.render.test.tsx` | `clears dirty/touched state so reset nodes are pristine, matching the default DOM` | 표면(NodeState→SchemaNodeState), LANDING-148로 파일 중단 | `NodeState.Dirty` 접근 TypeError / Dirty 상태 관찰 |
| `reset.pristine.render.test.tsx` | `drops the non-default branch on reset leaving no inactive-branch residue` | 표면(&if)이 먼저 실패; 이주 시 LANDING-148 충돌로 중단 | 원문 branch DOM true / false; 이주 후 enabled undefined / false |
| `reset.pristine.render.test.tsx` | `reset re-primes exactly one active branch with no duplicate fields` | 표면(&if→controls.active), 같은 파일 중단으로 미수정 | 비활성 분기 DOM 수 1 / 0 |
| `reset.pristine.render.test.tsx` | `clears dirty state on nested children after reset, matching the DOM` | 표면(NodeState→SchemaNodeState), LANDING-148로 파일 중단 | `NodeState.Dirty` 접근 TypeError / 중첩 Dirty 상태 관찰 |
| `state-management.render.test.tsx` | `typing sets Dirty on the edited node and renders the dirty indicator` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `blurring a typed field sets Touched in the tree and the indicator` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `leaves an untouched sibling clean in both layers` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `clears Dirty flags across the tree while preserving DOM and tree values` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `reflects global Dirty via getState() then empties it after clearState()` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `setState({Dirty,Touched,ShowError}) shows the error <em> without changing values` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `setState({ShowError}) alone forces the error visible regardless of dirty/touched` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `clearState() hides the error <em> again while the tree error persists` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `setSubtreeState on /address flags only that subtree (tree + indicator)` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `clearSubtreeState on /address clears only that subtree, keeping siblings` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `reset() restores defaults and remounts the input (clearing flags)` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `clearState() keeps the modified value (diverging from reset)` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `resetSubtree() on /address resets only that subtree to defaults, keeping siblings` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `state-management.render.test.tsx` | `setSubtreeState on a pushed item flags only that item subtree` | 표면 복구(SURFACE-056·060, LANDING-157; 렌더러·presentation) | 통과, 기존 기대 유지 |
| `refSchema-context-provider.render.test.tsx` | hides a context-gated &active field when the context disables it | 표면 복구(controls·presentation) | 통과, 기존 기대 유지 |
| `refSchema-context-provider.render.test.tsx` | drives computed.readOnly from context both ways (@.mode) | 표면 복구(controls·presentation) | 통과, 기존 기대 유지 |
| `refSchema-context-provider.render.test.tsx` | renders a field via a FormProvider-supplied formTypeInputDefinition | 표면 복구(controls·presentation) | 통과, 기존 기대 유지 |

합계: **표면 복구 17건 통과 + 중단 파일 12건 실패 + 별도 엔진 차단 1건 실패 = 기존 30건**입니다.

### 중단 판정으로 숨기지 않은 구현 차단

- 파일: `src/__tests__/scenarios/refSchema-context-provider.render.test.tsx`, 시험: `grows a self-recursive ($ref: "#") array item with the referenced fields`.
- 구체적인 원인: `core/settle/utils/compute/hasRecursiveExpansion.ts`는 같은 청사진의 조상에서 raw·extras·분배 입력·잠복 값·자식 원본이 없으면 확장을 거부합니다. 배열을 경유해 push한 빈 객체 아래의 `/children/0/children`도 이 조건에 걸립니다. `selectChildren.ts`는 해당 자식을 만들기 전에 `RECURSIVE_SHAPE_DIVERGED`를 기록합니다. 실제 값은 `{id:'root',children:[{}]}`이고 `/children/0/id`는 있지만 중첩 children DOM이 없습니다.
- BLUEPRINT-030·18C-01은 배열 아이템을 순환을 끊는 자리로 지정합니다. 이 시험은 끝없는 객체 프로퍼티 재귀가 아니므로 LANDING-128의 기대 변경으로 분류하지 않았습니다. 하니스가 넣는 임의 기본값이나 가짜 노드로 우회하지 않았습니다. 정착의 재귀 판정 구현을 수정해야 하며 U8의 하니스·표면 수정 범위를 넘습니다.
- `deferred-mount`의 reveal 시험도 기대 변경 근거가 없습니다. 하니스는 실제 remove 버튼을 누르고 입력은 `node.remove(index)`를 호출합니다. 이전에 드러낸 노드가 이동한 `/items/10`에서 다시 placeholder가 되는 실패입니다. 이 파일은 마운트 onChange 충돌로 원문 보존 대상이며, 가상화의 노드별 reveal 유지 동작은 별도 U7 구현 확인이 필요합니다.

### TypeScript 잔여 1건

`src/__tests__/scenarios/reset.pristine.render.test.tsx(6,10)`의 `TS2305: NodeState`입니다. 대체 공개 이름 `SchemaNodeState`는 구현하고 다른 소비자는 모두 이주했습니다. 이 import 자체는 표면 수정 가능하지만 LANDING-148 단언 충돌로 파일 전체를 보존하라는 77C-01(A)가 적용되어 그대로 두었습니다. 그 외 `src/__tests__/**` 및 `bench/**`의 오류는 0건이며, 제외나 별칭으로 숨기지 않았습니다.

## 레거시 N/M과 14사례

삭제 전 HEAD의 레거시 시험은 **157파일·2311건**입니다. 렌더 처분표와 같은 줄 시작 `it`·`test` 선언 호출 기준이며 each 행은 펼치지 않았습니다. 두 공개 Form 파일 2파일·14건을 삭제한 뒤 참고용으로 남는 시험은 **155파일·2297건**입니다. unit·render 양쪽에서 레거시 전체를 제외했습니다.

추가한 14행은 조건부 IfThenElse 2건과 NullableFormScenarios 12건입니다. if/then 또는 oneOf·`&if`가 있는 3건은 재작성, 조합·옛 키가 없는 11건은 기대값 보존으로 분류했습니다. 각 행에 e2e 파일과 새 시험 이름이 있으며 기존 try/catch가 단언 실패를 삼키는 방식을 U9에 옮기지 않도록 명시했습니다.

재현 가능한 집계는 worktree 루트에서 다음과 같습니다.

```sh
python3 - <<'PY'
import re, subprocess
prefix = 'packages/canard/schema-form/src/__legacy__/'
files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD', '--', prefix], text=True).splitlines()
files = [f for f in files if re.search(r'\.(test|spec)\.tsx?$', f)]
case = re.compile(r'^\s*(?:it|test)(?:\.(?:fails|each|skip|only|todo|concurrent|sequential))*\s*\(', re.MULTILINE)
count = sum(len(case.findall(subprocess.check_output(['git', 'show', 'HEAD:' + f], text=True))) for f in files)
print(len(files), count)
PY
```

## 스토리와 설정

49개 평면 스토리는 모두 원문 그대로 남겼습니다. 02의 처분표를 대조하여 07 표의 각 파일에 (가) 데이터 모듈·새 시나리오 스토리 이름 또는 (나) 네 사용법 스토리로의 통합을 지정했습니다. 02의 회귀 사례를 단순 삭제하지 않았으며, 옛 인라인 스키마 파일은 U9 끝에 대체 후 삭제합니다. Storybook과 tsconfig 제외는 임시이며 U9에서 옛 파일과 함께 제거하도록 명시했습니다.

`stories/components/validator/index.ts`는 임시로 유지되는 기존 어댑터와 같은 배포 패키지 형을 참조하게 했습니다. 기존 어댑터는 배포판의 ValidatorPlugin을 쓰므로 새 src의 compileGuard 필수 계약과 혼합할 수 없습니다. U9의 새 시나리오에는 이 옛 어댑터를 연결하지 않아야 합니다. 벤치 `compute-recalculate.bench.ts`도 레거시 구현에 맞는 레거시 스키마 형만 사용하도록 맞췄습니다. 런타임 벤치 이식은 U13의 몫입니다.

## 하니스

- 루트 사본별 AJV 등록과 동기 `compileGuard`를 구현하여 로컬 `$ref` 가드가 같은 루트에서 해석됩니다.
- `sinkErrors()`는 주인 없는 reportError·window error/rejection·console 경로의 원본 오류를, `errorRecords()`는 Form onError 기록을 따로 관찰합니다. 사용자 onError도 호출하며 host 훅은 언마운트 또는 afterEach에 복구합니다.
- `flushOnMount: false`는 추가 React/호스트 대기만 생략합니다. 엔진은 이미 동기 정착했습니다. reset 래퍼는 동기 로드 후 React 커밋 재대조를 기다립니다.
- container에 핸들과 화면 어댑터를 등록하고 명시 unmount에서 해제합니다. `playScenario(scenario, container)`로 DOM 입력과 reset을 실제 실행했습니다.
- U9가 쓰는 기본 값·형상·상태·오류·identity·스냅숏 관찰과 배열/배치/제출 동사를 제공합니다. 현재 공개 FormHandle에 없는 reset 호출별 automaticWrites 옵션, 추가 계측이 필요한 deliveryOrder·validationRequestCount는 조용히 무시하지 않고 명시 오류로 남깁니다. 해당 U9 전용 실행기는 선행 공개 표면과 계측을 보완해야 합니다.
- 수정한 생존 시험 8파일의 expect 호출 AST 826개(단언 체인의 내부 호출 포함)를 HEAD와 비교했습니다. 원장에 따른 NodeState 식별자 치환을 정규화하면 모두 동일하며 기대값은 바꾸지 않았습니다.

## 상태 표면 복구

SURFACE-056·060, LANDING-157에 따라 `core/types/state.ts`의 enum을 `SchemaNodeState`로 개명하고 core·패키지 진입점에 명시해 내보냈습니다. 비트 값과 알고리즘은 그대로이며 옛 이름의 alias는 추가하지 않았습니다. 기존 상태 시험 14건의 import/renderer 실패가 수정 뒤 모두 통과했습니다. 별도 상태 사전 형인 `NodeStateFlags`의 모양은 변경하지 않았습니다.

### 추가로 수정한 코드 파일

| 파일 | 실행 처분 | 한 줄 이유 |
| --- | --- | --- |
| `bench/compute-recalculate.bench.ts` | surface-fixed | 레거시 벤치 구현과 같은 스키마 형을 가져오도록 맞췄습니다. |
| `src/core/SchemaNode/__tests__/global-state.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/__tests__/regression/r7-port-notify.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/__tests__/dispatch.binding-input.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/__tests__/dispatch.binding-reset.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/__tests__/dispatch.budget.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/__tests__/dispatch.standalone-errors.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/__tests__/dispatch.state.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/dispatch/utils/entry/dispatchWriteInput.ts` | surface-fixed | 상태 enum 소비 이름만 바꾸고 동작을 유지했습니다. |
| `src/core/index.ts` | surface-fixed | 원장에 정해진 상태 enum을 공개 경계에서 이름으로 내보냈습니다. |
| `src/core/settle/__tests__/settle.context.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.delivery-watch-index.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.delivery.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.derive-exit-policy.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.derive-selection-baselines.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.derive-selection.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.derive.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.global-state.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.transition.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/__tests__/settle.value-layers.test.ts` | surface-fixed | 상태 enum 식별자만 바꾸고 기존 단언을 유지했습니다. |
| `src/core/settle/utils/commit/commitDeriveRules.ts` | surface-fixed | 상태 enum 소비 이름만 바꾸고 동작을 유지했습니다. |
| `src/core/types/state.ts` | surface-fixed | 상태 enum의 이름만 바꾸며 비트 값과 상태 사전 모양을 유지했습니다. |
| `src/index.ts` | surface-fixed | 원장에 정해진 상태 enum을 공개 경계에서 이름으로 내보냈습니다. |
| `stories/components/validator/index.ts` | surface-fixed | 임시 옛 검증 어댑터가 사용하는 배포 패키지와 형의 출처를 맞췄습니다. |

## 명령 결과

모두 패키지 디렉토리에서 실행했습니다. npx에는 설치를 방지하는 `--no-install`을 사용했습니다. 검증 대상으로 중단 파일도 그대로 포함했습니다.

| 명령 | 결과 |
| --- | --- |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 실패(exit 2), 1건. 원문 보존한 reset.pristine(6,10)의 NodeState import만 남음 |
| `npx --no-install eslint "src/**/*.{ts,tsx}" --format json` | 통과(exit 0), 오류·경고 0 |
| `npx --no-install vitest run --project unit --reporter=dot` | 통과(exit 0), 249파일, 2108 passed·1 todo |
| `npx --no-install vitest run --project render --reporter=dot --reporter=json` | 실패(exit 1), 33파일 통과·5파일 실패, 218 passed·13 failed |
| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 통과, `LEGACY_ISOLATED: 1528 files checked` |
| `grep -rnE --include='*.ts' --include='*.tsx' "from ['\"][^'\"]*__legacy__" src --exclude-dir=__legacy__` | 출력 없음(exit 1 = 일치 없음) |
| 두 처분표의 Markdown 셀·TBD 검사 | 빈 셀 0, TBD 0 |
| `git diff --check` (worktree 루트) | 통과 |

하니스 계약 시험은 변경 전 3건 모두 실패했습니다: DOM 등록 없음, 동기 guard의 detail 누락, errorRecords 없음. 구현 후 전체 render 실행에서 세 시험은 모두 통과했습니다. 중단 파일에 12실패가 있고, 중단으로 분류하지 않은 ref/context 파일의 재귀 엔진 차단 1실패가 남습니다. 최종 G3(TypeScript)·G4(render)는 미충족으로 유지합니다.

## D-A·D-B 구현 차단 수정 검증 (2026-10-03)

- **D-A / BLUEPRINT-030**: `hasRecursiveExpansion`이 배열 아이템 에지를 넘어 원본 없는 같은 청사진 조상을 검사한 것이 원인입니다. 배열 부모에서 조상 탐색을 끝내어 빈 객체 아이템도 참조 필드와 빈 자식 배열을 만들도록 했습니다. 빈 배열은 아이템을 만들지 않고, 객체 프로퍼티만의 청사진 오류와 아이템 내부의 원본 없는 게이트 순환 정착 오류는 유지합니다(18C-01, LANDING-128).
- **D-B / LANDING-087**: reveal 기록은 이미 노드 identity의 `WeakSet`이며 경로나 위치 키가 아니었습니다. `DeferrableNodeProxy`가 `UpdatePath`를 추적하지 않아 미노출 형제 placeholder가 이전 경로에 남고, 이동한 노출 필드의 `/items/10`과 겹쳤습니다. 경로 사건을 추적하여 placeholder 주소만 현재 노드 경로로 갱신합니다. 노드·입력 DOM identity와 defer-once는 유지합니다. 06-array 계획·검증에서 `reveal`/`defer-once` 기록은 발견하지 못했으며, 현행 LANDING-087과 PKG/CLAUDE.md 계약을 적용했습니다.
- 새 회귀 파일은 `core/settle/__tests__/settle.array-recursion.test.ts`(4사례)와 `components/SchemaNode/__tests__/virtualization.rekey.render.test.tsx`(1사례)입니다. 수정 전에는 push의 `RECURSIVE_SHAPE_DIVERGED`와 삭제 후 placeholder 판정으로 2실패·3통과였고, 수정 후 5사례 모두 통과했습니다. 기존 두 문제 렌더 사례도 원문 그대로 통과했습니다.

아래 명령은 PKG에서 실행했고 npx의 offline/설치 거부 설정을 사용했습니다. git 쓰기·설치 및 `src/__tests__/**`·`src/__legacy__/**` 편집은 하지 않았습니다.

| 명령 | 결과 |
| --- | --- |
| `npx vitest run --project unit --reporter=dot` | exit 0, 250파일, 2112 passed·1 todo |
| `npx vitest run --project render --reporter=dot` | exit 1, 35파일 통과·4파일 실패, 221 passed·11 failed |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 2, 알려진 `reset.pristine.render.test.tsx(6,10)`의 `NodeState` TS2305 1건만 남음 |
| `npx eslint "src/**/*.{ts,tsx}"` | exit 0, 출력 없음 |

남은 render 실패는 중단 표 안의 `array.omit-trailing.injection.render.test.tsx` 2건, `deferred-mount.render.test.tsx` 3건, `multi-render-split-brain.render.test.tsx` 2건, `reset.pristine.render.test.tsx` 4건입니다. 중단 표 밖의 실패는 없으며, D-A·D-B 구현 차단은 해소했습니다. 기존 U8 전체 완료 판정과 원장 관리자 보류는 이 수정으로 닫지 않습니다.

## 78C-01 처분 후 검증 (2026-10-03)

다섯 중단 파일을 삭제한 뒤 PKG에서 실행했습니다. npx에는 `--no-install`과 offline·설치 거부 설정을 사용했습니다. 위 실패 수와 보류는 처분 전 기록이며, 이번 결과는 U9 대체 e2e 구현 완료를 뜻하지 않습니다.

| 명령 | 결과 |
| --- | --- |
| `npx --no-install vitest run --project render --reporter=dot` | exit 0, 34파일·181사례 통과 |
| `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0, 오류 0 |
| `npx --no-install eslint "src/**/*.{ts,tsx}"` | exit 0, 출력 없음 |
| `node architecture/verification/07-switch/tools/extract-migration-rows.mjs --check architecture/verification/07-switch/migration-check.md` | exit 0, 이주 ID 128행 점검 통과 |
| `grep -nE '\|[[:space:]]*\|' architecture/verification/07-switch/render-disposition.md`와 TBD 검사 | 출력 없음, 빈 셀 0·TBD 0 |
