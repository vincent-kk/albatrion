# 07 전환 이주 점검표

`reviews/round-68-closing.md`의 68C-02에 따른 PR-7 이주 점검 게이트입니다. `ledger/landing.md`에서 `### LANDING-nnn 이주...`로 시작하는 행 전부를 포함하며, 상태는 원문의 대체·중복·분할 대상까지 그대로 옮깁니다. 오늘 동작과 새 동작은 각 행의 결정에서 요약했습니다. 결정에 오늘 동작이 따로 없는 경우에는 그 사실을 표시했습니다.

처분 범례:

- (가) 오늘 동작의 기록과 새 동작의 렌더·e2e 단언을 대조 — 시험 이름 필수.
- (나) 02–06의 코어 시험이 이미 덮음 — 시험 이름 인용 필수.
- (다) 08·09의 몫 — 처분 근거에 `08` 또는 `09` 명시.
- 현행 아님: 상태가 현행이 아닌 행의 처분.

U10에서 128개 행을 모두 처분했습니다. 오늘 동작은 0.16.0에 대한 원장·T1-B의 역사 기록이며 런타임 비교가 아닙니다. 시험은 새 공개 진입점만 사용하고 `src/__legacy__`를 가져오지 않습니다. 시험 인용은 저장소 루트 기준 `파일 > 정확한 시험 제목`입니다(`파일::제목`과 같은 의미이며 검사기의 구분자를 사용). 여러 시험은 `<br>`로 나눕니다. 매개변수 시험의 E4 같은 셀 ID는 실행 시 제목이고, `%s`가 남은 인용은 파일의 제목 템플릿입니다. (나)의 단계 근거는 `plan/02-foundation-and-blueprint/verification.md`부터 `plan/06-array/verification.md`까지의 소유 범위입니다.

원장 기준 행·상태·제목 표 본문 재생성 명령(architecture에서 실행):

```sh
node verification/07-switch/tools/extract-migration-rows.mjs
```

재추출한 행·상태를 아래 표에 반영하고, 오늘 동작·새 동작은 원장의 결정에 맞춰 갱신합니다. `--check verification/07-switch/migration-check.md`는 ID 집합을, `--check-complete verification/07-switch/migration-check.md`는 처분과 시험 근거까지 점검합니다.

| 행 | 상태 | 오늘 동작 | 새 동작 | 처분 | 처분 근거 | 시험 이름 |
| --- | --- | --- | --- | --- | --- | --- |
| LANDING-004 | 현행 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-004 first screen exposes the explicitly active branch and defaults` |
| LANDING-005 | 현행 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-005 branches expose active nodes without branch selection APIs` |
| LANDING-006 | 현행 | `&if`(분기의 조건) | `controls.active`로 흡수 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/deferred-mount.test.tsx > LANDING-006 deferred branch placeholders follow controls active` |
| LANDING-007 | 현행 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/deferred-mount.test.tsx > LANDING-007 deferred fields follow controls visibility` |
| LANDING-008 | 현행 | `&pristine` | `controls.resetInteraction` | (나) | 04: resetInteraction의 거짓→참 에지에서 상태 초기화. | `packages/canard/schema-form/src/core/settle/__tests__/settle.derive.test.ts > SETTLE-006 resetInteraction clears flags on a false to true edge` |
| LANDING-009 | 현행 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 | (나) | 03·04: unsetValue, 계층 default·children·discriminator·나감 정책을 코어에서 검증. | `packages/canard/schema-form/src/core/settle/__tests__/settle.derive.test.ts > WRITE-028 load unset clears a true target but leaves its input`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.defaults.test.ts > CONTROLS-073 value layer orders own, children, fragment, and standard defaults`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.gates.test.ts > 25C-06 combines discriminator tags and branch active expressions`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.exit-latent.test.ts > WRITE-038 updates a node expression while that node remains in shape` |
| LANDING-010 | 현행 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-010 allOf conditional fragments contribute rendered children` |
| LANDING-011 | 현행 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-011 switching branches does not refill a shared existing node` |
| LANDING-012 | 현행 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR | (나) | 04: 표준 readOnly와 controls.readOnly의 OR. | `packages/canard/schema-form/src/core/settle/__tests__/settle.controls.test.ts > CONTROLS-082 standard readOnly is OR merged with controls` |
| LANDING-013 | 현행 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR | (나) | 02: allOf 표준 readOnly의 OR 병합. | `packages/canard/schema-form/src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts > unions required, overwrites annotations, and combines standard readOnly locally` |
| LANDING-014 | 현행 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/derive.test.tsx > LANDING-014 dependency edges settle a derived chain and preserve manual edits` |
| LANDING-015 | 현행 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 | (나) | 04: 루트 제어는 로컬이며 Form 전체 잠금과 구별. | `packages/canard/schema-form/src/core/settle/__tests__/settle.controls.test.ts > CONTROLS-045 no root inheritance keeps root state local` |
| LANDING-016 | 현행 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR | (나) | 04: 로컬 잠금의 OR로 false가 참을 덮지 못함. | `packages/canard/schema-form/src/core/settle/__tests__/settle.controls.test.ts > CONTROLS-082 readOnly OR keeps a true parent item over own false` |
| LANDING-017 | 현행 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-017 active visible and disabled are read from controls` |
| LANDING-018 | 현행 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-018 nested branches preserve inner edits across outer activation` |
| LANDING-019 | 현행 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 | (나) | 02: virtual 참조는 required를 재작성하지 않음. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.fragments.test.ts > groups virtual fields as references without rewriting required` |
| LANDING-020 | 현행 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 | (나) | 03: 터미널 아래 경로는 노드 없음. | `packages/canard/schema-form/src/core/navigation/__tests__/navigation.test.ts > returns no node for an out-of-shape path or below a terminal` |
| LANDING-021 | 현행 | 10비트 `SetValueOption` | 비트 넷 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-021 write options expose four independent bits` |
| LANDING-022 | 현행 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 | (나) | 05: 최외곽 진입 뒤 최종 방출로 onChange 한 번. | `packages/canard/schema-form/src/core/dispatch/__tests__/dispatch.onChange.test.ts > EVENT-026 invokes once after the final wave with final emit` |
| LANDING-023 | 현행 | `normalizedValue` | `outputValue` | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/array-projection.test.tsx > LANDING-023 branch arrays inject projected output and retain edited slots` |
| LANDING-024 | 현행 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-024 validation errors use ValidationIssue without the retired alias` |
| LANDING-025 | 현행 | 예산 초과는 커밋 없이 throw; 컴파일 실패·렌더 오류·검증기 부재는 제각각 처리 | 원본 커밋·통지 뒤 throw; 검증 실패는 요청·제출 거부, 바운더리는 격리·보고, 검증기 부재는 경고 | (가) | 07: 원본 커밋·통지 뒤 실패, 검증 컴파일 거부, 렌더 격리·보고를 대조. 05의 예산/검증기 부재 통로도 동일 계약. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-025 settlement failure commits and notifies the caller value before throwing`<br>`packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-025 compile failure rejects validation and submission`<br>`packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-046 field render failures are isolated and reported with componentStack` |
| LANDING-026 | 현행 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) | (나) | 05: 가드 위치별 컴파일·캐시 공유. 원장의 ms는 과거 측정치이며 현재 속도 단언 아님. | `packages/canard/schema-form/src/core/validation/__tests__/validation.guard.test.ts > VALIDATE-048 compiles all authored guards once per cache entry in development` |
| LANDING-027 | 현행 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-027 conditional required does not select node presence` |
| LANDING-028 | 현행 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 | (나) | 02: const 자동 감지 없이 조건 없는 분기는 모두 활성 후보. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.discriminator.test.ts > does not infer discriminator gates from const values without explicit controls` |
| LANDING-029 | 현행 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 | (나) | 02·04: 조각·children 식의 호스트 기준. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.expressions.test.ts > keeps fragment and children expression origins on the host`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.controls.test.ts > CONTROLS-073 children item expression uses its host for every target` |
| LANDING-030 | 현행 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(ADR 0010) | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/derive-observers.test.tsx > LANDING-030 derive budget reports the committed fallback through onError` |
| LANDING-031 | 현행 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(§3.4). strict 검증기에는 동작 변화 | (나) | 02·05: 키워드 위치의 controls/options/presentation 제거, 리터럴 데이터 보존. | `packages/canard/schema-form/src/core/blueprint/__tests__/stripSchema.test.ts > removes the three reserved groups from nested schema positions` |
| LANDING-032 | 현행 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-032 branch round trips retain shared nodes and edited raw values` |
| LANDING-033 | 현행 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-033 flat control aliases no longer drive the input` |
| LANDING-034 | 현행 | 맨 키 `terminal`·`virtual`·`propertyKeys`, 입력·렌더·오류 표시 키, `options.trim`과 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation` 표시 키·자유 칸; `options.trim`은 유지 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/controls-input.test.tsx > LANDING-034 presentation props and custom renderer receive the committed value` |
| LANDING-035 | 현행 | `FormGroup`·`FormLabel`·`FormInput`·`FormError`, `CustomFormTypeRenderer`·`FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`로 변경; `Form.*` 이름은 유지 | (가) | 07: 이름을 바꾼 네 renderer prop을 기존 Form 컴파운드 컴포넌트로 렌더하여 연결을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-035 named renderer props drive the retained Form compound components` |
| LANDING-036 | 현행 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(§11) | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-036 validatorFactory compiles validation and synchronous guards` |
| LANDING-037 | 현행 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 | (나) | 05: ajv6·7·8의 동기 guard·rejectedKey 계약 시험. UI 플러그인 08과 별개인 검증기 단계. | `packages/canard/schema-form-ajv6-plugin/src/validator/__tests__/bind-refusal.test.ts > accepts a non-mutating instance and exposes both optional methods`<br>`packages/canard/schema-form-ajv7-plugin/src/validator/__tests__/bind-refusal.test.ts > exposes synchronous guards and release with a non-mutating instance`<br>`packages/canard/schema-form-ajv8-plugin/src/validator/__tests__/direct-guard-compile.test.ts > directGuardCompile gives the root-pointer verdict`<br>`packages/canard/schema-form-ajv6-plugin/src/validator/__tests__/rejected-key.test.ts > identifies one rejected key`<br>`packages/canard/schema-form-ajv7-plugin/src/validator/__tests__/rejected-key.test.ts > identifies the rejected property` |
| LANDING-038 | 현행 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(§4·§7·§9) | (가) | 07: 활성 조각 변경 시 유효 title과 스키마 통지가 바뀌고, 돌아오면 원래 스키마 참조를 재사용함을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-038 effective schemas are memoized per active fragment set and notify changes` |
| LANDING-039 | 현행 | `reset`은 provider 아래를 재마운트해 새 prop을 반영; `showError` 유지, 검증·`onChange`는 항상 실행 | 같은 스키마는 루트 로드·참조 유지, 다르면 트리 교체; 입력만 선별 재마운트, `showError` 초기화, 검증·통지는 조건부 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-039 same-schema reset retains nodes clears state and refreshes only inputs`<br>`packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-039 changed-schema reset switches the handle before returning` |
| LANDING-040 | 현행 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 | (다) | 08: UI 플러그인의 presentation 자유 칸 이주와 수정 목록은 LANDING-206·68C-07 소유. options 닫힌 목록은 02 청사진에서 구현. | 해당 없음 |
| LANDING-041 | 현행 | 마운트 때 검증 모드와 무관하게 한 번 검증 | 로드 뒤 `OnChange` 비트일 때만 한 번 검증; 마운트는 폼 커밋 뒤, reset은 진입 끝, core 호스트는 직접 요청 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-041 OnRequest skips mount and reset validation while OnChange runs once` |
| LANDING-042 | 현행 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | EVENT-071·LANDING-199에 따라 원본이 실제 바뀐 노드의 입력만 Refresh. 쓴 입력 자신은 제외하며 대체된 입력의 늦은 쓰기는 버림 | (가) | 07: 터미널 입력 갱신·브랜치 유지. 충돌 문장은 EVENT-071·LANDING-199의 실제 변경 노드 한정 규칙을 따름. | `packages/canard/schema-form/src/__tests__/e2e/proxy-refresh.test.tsx > LANDING-042 a terminal object refreshes while the ordinary object wrapper remains` |
| LANDING-043 | 현행 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-043 node strategy replaces group for rendered branch and terminal nodes` |
| LANDING-044 | 현행 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(4번 안 B, §11.3, ADR 0014 §3). 오류·경고 코드 목록이 공개 계약이 된다 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-044 onError observes mismatch warnings without replacing the value` |
| LANDING-045 | 현행 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | stable 또는 degraded; cause 다섯(writeShape 포함), 예산 넷(recursion 포함), commit. 폼 로드만 초기화하며 setValue·resetSubtree는 유지, degraded 제출 거부 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-045 degraded diagnostics survive writes and subtree reset and reject submit` |
| LANDING-046 | 현행 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(§12). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-046 field render failures are isolated and reported with componentStack` |
| LANDING-047 | 대체됨(→ LANDING-145) | `options.trim: true`이면 `StringNode`가 내부 사건 `Blurred`를 구독해 흐림 때 원본을 잘린 값으로 덮는다(`StringNode.ts:118-122`) | 포커스 아웃 때 자르는 동작은 같다. 판단은 문자열 동작 행의 `finishInput` 칸이 하고 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다. 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, §3.3). 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다 | 현행 아님 | 원장 상태대로 LANDING-145에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-048 | 현행 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경) | (나) | 03: 터미널 객체·배열·union의 전략과 형 좁힘. LANDING-188 보충 적용. | `packages/canard/schema-form/src/core/SchemaNode/__tests__/type-contract.test.ts > narrows kinds, schemaType, and terminal object strategy` |
| LANDING-049 | 현행 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) | (나) | 03–05: findNodes가 있는 공개 멤버 목록에 findAll 없음. | `packages/canard/schema-form/src/core/SchemaNode/__tests__/surface.test.ts > 26C-01 PR-4 member list matches the DETAIL table exactly` |
| LANDING-050 | 대체됨(→ LANDING-149) | 잎의 `options.terminal: false`는 `'branch'`가 되어 `FormGroupRenderer`가 fieldset으로 그리고, 가상의 `options.terminal: true`와 인라인 `FormTypeInput`은 `'terminal'`이 되어 자식 구성 요소를 비운다 | `BEHAVIORS[type][strategy]`에 행이 없는 조합이다. 처리와 이주는 18라운드 안건이다 | 현행 아님 | 원장 상태대로 LANDING-149에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-115 | 중복(→ VALIDATE-010) | `ENHANCED_KEY` 마커 주입 | 검증기 입력 불변; 활성 조각 기반 `schemaPath` 필터 | 현행 아님 | 원장 상태대로 VALIDATE-010에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-116 | 중복(→ WRITE-022) | `minItems` 채움·`maxItems` 차단, `Normalize` 미선언 키 제거, `null`→`{}` 변환·비객체 값 버리기 | 입력 컴포넌트·유효 스키마로 제한 처리; `extras` 보존·방출, 비객체 값 보존·방출과 type 에러 | 현행 아님 | 원장 상태대로 WRITE-022에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-117 | 중복(→ EVENT-002) | 배열 연산이 Promise 반환; `await` 뒤도 구독자 관찰을 뜻하지 않음 | 배열 연산은 동기 API | 현행 아님 | 원장 상태대로 EVENT-002에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-118 | 대체됨(→ WRITE-090) | `setValue(getValue())`로 값 유지 | 전체 교체의 로드 계약으로 지운 키에 `default` 재주입; 호출 단위 억제 옵션 필요 | 현행 아님 | 원장 상태대로 WRITE-090에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-119 | 중복(→ EVENT-036) | `useEffect`로 파생 값 쓰기 | 새 진입으로 키 입력당 `onChange` 2회; `&derived`·`injectTo`·리스너 권장 | 현행 아님 | 원장 상태대로 EVENT-036에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-120 | 분할됨(→ LANDING-125, LANDING-126, LANDING-127) | 파서가 문자 제거·정수 자르기·빈 값 치환·불리언 진릿값 변환 | 뜻을 보존하는 parse만 수행; 실패 값 유지·방출·제출, 정합 상태와 검증기 무관 warning 기록 | 현행 아님 | 원장 상태대로 LANDING-125, LANDING-126, LANDING-127에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-125 | 현행 | 파서가 문자 제거·정수 자르기·빈 값 치환·불리언 진릿값 변환 | 뜻을 보존하는 parse만 수행; 실패 값 유지·방출·제출, 노드 정합 상태가 공개 형 판별자 | (나) | 03: 뜻 보존 변환 목록과 변환 불가 값의 원본 유지. | `packages/canard/schema-form/src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts > preserves every unconvertible input, including TEST-077 values` |
| LANDING-126 | 현행 | 결정에 오늘 동작 별도 명시 없음 | onError level warning; typeMismatch가 켜질 때마다 SCHEMA_FORM_WARNING.TYPE_MISMATCH 한 번(SURFACE-061 확정 이름) | (나) | 03·05: 경고등이 켜질 때마다 warning. SURFACE-061 확정 이름 TYPE_MISMATCH. | `packages/canard/schema-form/src/core/behaviors/unionBehavior/__tests__/union.mismatch-light.test.ts > records TYPE_MISMATCH once while on and again after an off-to-on transition` |
| LANDING-127 | 현행 | 결정에 오늘 동작 별도 명시 없음 | core parse의 변환 실패 기록은 검증기 유무와 무관하게 발송 | (나) | 03: 검증기를 설치하지 않은 코어 쓰기에서도 변환 실패 경고 기록. | `packages/canard/schema-form/src/core/behaviors/unionBehavior/__tests__/union.mismatch-light.test.ts > records TYPE_MISMATCH once while on and again after an off-to-on transition` |
| LANDING-128 | 현행 | 재귀 객체 스키마가 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침으로 실패 | 폼이 서지 않는 것은 같고 명시적 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED` | (나) | 02: 무한 재귀 형상은 명시 RECURSIVE_SHAPE_UNBOUNDED. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.recursion.test.ts > rejects required eager object shape, including nullable recursion` |
| LANDING-129 | 현행 | 원시 타입 둘 이상의 `type` 배열은 `UNKNOWN_JSON_SCHEMA`로 폼 생성 실패 | `union` 잎과 문자열 입력으로 폼 생성 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-129 union leaves render the default string draft input` |
| LANDING-130 | 현행 | `['integer','number']`는 `UNKNOWN_JSON_SCHEMA` | `['integer','number']`는 수 노드 | (나) | 02: 매개변수 행 E4의 실제 시험 제목; integer·number 합은 number. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-syntax.test.ts > E4` |
| LANDING-131 | 현행 | `dependentSchemas`·`dependencies` 사용의 개발 모드 경고 없음 | 해당 스키마 사용 시 개발 모드 경고 신설 | (나) | 02: dependencies·dependentSchemas 개발 경고. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.diagnostics.test.ts > emits dependency warnings separately from dependentRequired` |
| LANDING-132 | 현행 | 조건부 `required` 필드의 필수 표시가 항상 켜짐 | 켜진 `then`에 따라 필수 표시 변경 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-132 conditional required updates the input required flag` |
| LANDING-133 | 현행 | 같은 값인 객체·배열 `const`끼리의 `allOf`가 `JSONSchemaError` | 새 설계·레거시 모두 통과(결함 수정) | (나) | 02: 객체·배열 const의 깊은 동등성 병합. | `packages/canard/schema-form/src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts > intersects enum and const by deep equality without conflating keywords` |
| LANDING-134 | 현행 | 여러 `pattern`을 `(?=a)(?=b)` 합성 문자열로 `node.jsonSchema`에 표현 | 첫 패턴과 `allOf`의 `{pattern}` 항목으로 표현 | (나) | 02: 패턴 첫 항목+allOf 표현. | `packages/canard/schema-form/src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts > preserves the first pattern and appends other distinct patterns as allOf` |
| LANDING-135 | 현행 | 결정에 오늘 동작 별도 명시 없음 | 식의 `*` 조각은 청사진 오류 | (나) | 02: 경로 조각 wildcard는 청사진 오류. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.expressions.test.ts > rejects wildcard dependencies and non-path watch values` |
| LANDING-136 | 현행 | `../name === ''` 같은 빈 문자열 비교 식 사용 | `omitEmpty` 아래에서는 `undefined` 관찰; `!../name`으로 변경하거나 `omitEmpty` 해제 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/schema-controls.test.tsx > LANDING-136 expressions observe omitted empty strings as undefined` |
| LANDING-137 | 현행 | `controls.watch`의 `watchValues`에서 빈 문자열 사용 | `omitEmpty` 아래에서는 빈 문자열을 `undefined`로 전달 | (나) | 04: watchValues는 투영된 undefined를 관찰. | `packages/canard/schema-form/src/core/settle/__tests__/settle.controls.test.ts > LANDING-137 watchValues omitEmpty sees an omitted empty string` |
| LANDING-138 | 현행 | `injectTo` 반환의 `undefined` 항목으로 덮어쓰기 | `undefined` 항목은 쓰지 않음 | (나) | 04: undefined 주입 항목은 무쓰기. | `packages/canard/schema-form/src/core/settle/derive/__tests__/derive.injectTo.test.ts > CONTROLS-079 undefined entry skips values and uses the last array pair` |
| LANDING-139 | 현행 | 입력·`Merge`의 `null` 아래 자식은 기본값 상태 표시 | 채움 없이 없음 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-139 null ancestors do not fill branch defaults before input promotion` |
| LANDING-140 | 현행 | 입력이 넘긴 `Merge`가 `Refresh` 비트로 자기 입력 재마운트 | 입력을 재마운트하지 않음 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/form-lifecycle.test.tsx > LANDING-140 input Merge retains its own DOM instance` |
| LANDING-141 | 현행 | `Overwrite \| Merge`가 `Overwrite`로 동작 | `INVALID_WRITE_OPTION` throw | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-141 Overwrite combined with Merge throws INVALID_WRITE_OPTION` |
| LANDING-142 | 대체됨(→ WRITE-090) | `setValue(undefined)`의 기본 `Overwrite`는 채움 없이 비움 | `default` 자리의 기본값 재주입; 채움 없이 비우려면 `Merge`·`DisableAutomaticWrites` | 현행 아님 | 원장 상태대로 WRITE-090에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-143 | 대체됨(→ WRITE-090) | 값을 빼는 입력이 `onChange(undefined, SetValueOption.Overwrite)` 사용 | 로드로 기본값 재주입; 값을 빼려면 `Overwrite` 제거, 스토리 넷 수정·입력 작성자 안내 | 현행 아님 | 원장 상태대로 WRITE-090에 이관. 대체 행의 결정이 우선. | 해당 없음 |
| LANDING-144 | 현행 | 로드·부모가 준 `{}`는 호스트 `default`를 막음 | `{}`여도 호스트가 `default`를 받음 | (나) | 03: 부모가 준 빈 객체에도 호스트 기본값 채움. | `packages/canard/schema-form/src/core/settle/__tests__/settle.transition.test.ts > WRITE-082 fills a host from controls.default before default and distributes through interpret` |
| LANDING-145 | 현행 | 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh` 없음 | `finishInput`의 자동 쓰기; 바깥 오류·dirty 유지, 같은 값이면 쓰지 않고 비제어 입력 재마운트 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/controls-input.test.tsx > LANDING-145 uncontrolled blur trim refreshes the input while typing preserves spaces` |
| LANDING-146 | 현행 | `batch` 없음; `setValue`·updater는 호출 자리의 값으로 곧바로 적용 | `batch(fn)` 안 updater는 이어지지만 일반 읽기는 직전 커밋; 읽어 다음 쓰기에 쓰던 코드는 updater로 변경 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/derive-observers.test.tsx > LANDING-146 batch parent reads stay committed while updater writes compose` |
| LANDING-147 | 현행 | 가상 노드의 틀린 모양 쓰기는 `JSONSchemaError`; 같은 길이 문자열은 글자로 분해 | 오류는 `SchemaFormError`; 같은 길이 문자열 쓰기는 거부 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-147 same-length strings cannot be split into virtual field writes` |
| LANDING-148 | 현행 | `find`가 꺼진 `oneOf` 변형 노드를 반환할 수 있음 | `null` 반환. 07 U8 처분 78C-01: `reset.pristine.render.test.tsx` | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/exit.test.tsx > LANDING-148 reset leaves no inactive branch residue and find returns null` |
| LANDING-149 | 현행 | 잎 `terminal: false`·가상 `terminal: true` 허용; 가상 인라인 입력은 `'terminal'`이고 자식 구성 요소 비움 | 지원 없는 terminal 조합은 청사진 오류; 가상 인라인 입력은 `'branch'`·`ChildNodeComponents`, `isTerminalNode`는 거짓 | (가) | 07: 공개 Form의 스키마 수용·노드 종류·입력을 대조. | `packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-149 inline virtual inputs remain branches with referenced children`<br>`packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-149 unsupported terminal combinations fail with blueprint diagnostics` |
| LANDING-152 | 현행 | `globalState` 키는 루트에서만 비움 | 참인 노드가 없으면 키 제거 | (나) | 03·05: 참인 노드 수 0에서 집계 키 제거. | `packages/canard/schema-form/src/core/SchemaNode/__tests__/global-state.test.ts > counts true keys across nodes and removes a key only at zero` |
| LANDING-153 | 현행 | `globalState`는 마지막으로 쓴 참인 값을 그대로 보유 | 비불리언 상태 값도 `true`로 집계 | (나) | 03·05: 비불리언 참 값을 true로 집계. | `packages/canard/schema-form/src/core/SchemaNode/__tests__/global-state.test.ts > normalizes truthy nonboolean state values to true` |
| LANDING-154 | 현행 | `node.key`·`node.schemaPath` 존재 | 두 속성 없음 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-154 node key and schemaPath are absent from the public surface` |
| LANDING-155 | 현행 | `defaultValue`는 노드 생성 뒤 바뀌지 않음 | 해당 경로의 로드마다 새 로드 값; 배열 아이템은 구조 연산을 따라 자기 값 유지 | (나) | 03·06: 로드 스냅숏과 아이템 구조 이동의 정렬. | `packages/canard/schema-form/src/core/settle/__tests__/settle.array-write.test.ts > WRITE-095 aligns snapshot slots after replacement and Merge`<br>`packages/canard/schema-form/src/core/settle/__tests__/settle.transition.test.ts > SETTLE-049 and EVENT-072 resetSubtree loads only its subtree snapshot` |
| LANDING-156 | 현행 | `find('@')`·`findAll('@')`가 맥락 노드 반환 | `null`·빈 배열 반환 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-156 context is not a navigable node` |
| LANDING-157 | 현행 | 공개 형 `NodeState` | 공개 형 `SchemaNodeState` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-157 LANDING-158 public state and event names have no old aliases` |
| LANDING-158 | 현행 | 공개 이벤트 형 `NodeEventType` | 공개 이벤트 형 `SchemaNodeEventType` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-157 LANDING-158 public state and event names have no old aliases` |
| LANDING-160 | 현행 | `NumberNode.__equals__`는 `isClose` 근사 비교 | 정확한 비교 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-160 close numeric values remain distinct writes` |
| LANDING-161 | 현행 | `ObjectNode`의 `equals`는 키 순서 무시 | 키 순서 비교 | (나) | 03: 객체 키 순서가 다르면 다른 값. | `packages/canard/schema-form/src/core/settle/__tests__/settle.same-value.test.ts > 18C-50 sameValue compares nested plain values and SameValueZero primitives` |
| LANDING-162 | 현행 | `ObjectNode.__equals__`는 내장 객체를 내부 상태로, 클래스 인스턴스를 구조로 비교 | 내장 객체·클래스 인스턴스를 참조로 비교 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-162 class instances compare by identity rather than structure` |
| LANDING-163 | 현행 | 계산 속성이 한 의존 배열을 공유해 `active`만의 경로 변경도 `derived` 재계산 | `derived`는 자기 의존 집합에서만 발화 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/derive.test.tsx > LANDING-163 active dependencies do not retrigger an unchanged derived edge` |
| LANDING-164 | 현행 | 배열 통째 쓰기가 `clear` 뒤 전량 `push`여서 아이템 상태·키 모두 재생성 | 아이템 키 유지; `dirty`·`touched`·바깥 오류·가상화·입력 상태·노드 참조가 위치를 따름 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/array-identity.test.tsx > LANDING-164 whole-array reorder retains positional nodes and unchanged focused input` |
| LANDING-165 | 현행 | 닫힌 튜플 뒤의 값 버림 | 뒤의 값도 방출 | (나) | 06: 닫힌 튜플 뒤의 원본도 extras로 방출. | `packages/canard/schema-form/src/core/settle/__tests__/settle.array-write.test.ts > NODE-052 and 25C-11 retain tuple extras and template schemaType reference` |
| LANDING-166 | 현행 | 사용자 쓰기의 `injectTo`가 null 조상을 객체로 변경 | null 조상 유지; 아래 값은 그려지지만 방출되지 않음 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/derive.test.tsx > LANDING-166 input-triggered injection preserves a null ancestor while updating its child` |
| LANDING-167 | 현행 | 가상 인라인 입력 아래 경로의 `find`가 그 가상 노드 반환 | 참조된 노드 반환 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/controls-input.test.tsx > LANDING-167 inline virtual input receives children and resolves the referenced node` |
| LANDING-168 | 현행 | 노드 자체 잠금만 `onChange`를 버리고 Form 잠금은 입력 prop으로 전달 | Form `readOnly`·`disabled` 잠금 동안 입력 `onChange`도 버림 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/schema-node-props-flow.test.tsx > LANDING-168 root readOnly rejects input value dirty and error changes`<br>`packages/canard/schema-form/src/__tests__/e2e/schema-node-props-flow.test.tsx > LANDING-168 root disabled rejects input callbacks` |
| LANDING-169 | 현행 | 루트 검증 오류의 공개 `dataPath`는 `'/'` | 루트 `dataPath`는 `''` | (나) | 05: 루트 dataPath는 빈 문자열. | `packages/canard/schema-form/src/core/validation/__tests__/validation.run.test.ts > VALIDATE-043 FRAGMENT-053 routes root and child issues without altering the verdict` |
| LANDING-171 | 현행 | 빈 중첩 객체·배열의 `normalizedValue`는 `{}`·`[]`; 부모·`getValue()`에는 키 없음 | `omitEmpty` 아래 `outputValue`는 `undefined`; `node.value`는 `{}`·`[]`, 부모·`getValue()`의 키 없음은 유지 | (나) | 03·06: 빈 중첩 호스트 output은 undefined, raw는 유지. | `packages/canard/schema-form/src/core/settle/__tests__/settle.commit.test.ts > VALUE-034 keeps an empty root object but omits a nested empty host` |
| LANDING-172 | 현행 | 객체·배열을 포함한 이종 `type` 배열은 `UNKNOWN_JSON_SCHEMA` | 터미널 강제 union; 안쪽 `find` 없음, `{}`·`[]` 방출에는 `omitEmpty: false` | (나) | 02: 매개변수 행 E7; object 포함 union은 terminal. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-syntax.test.ts > E7` |
| LANDING-173 | 현행 | 배열 `type` 경로는 `nullable:true`를 무시 | 비 union 배열도 `nullable: true` 적용 | (가) | 07: 공개 Form의 스키마 수용·노드 종류·입력을 대조. | `packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-173 singleton type arrays honor nullable true` |
| LANDING-174 | 현행 | 형 없는 원시 `anyOf`·`oneOf`는 `UNKNOWN_JSON_SCHEMA` | union·원시 잎과 nullable 처리 | (나) | 02: 매개변수 행 E11·E13; 형 없는 원시 분기의 union·nullable. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-inference.test.ts > E11`<br>`packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-inference.test.ts > E13` |
| LANDING-175 | 현행 | 형 없는 null 분기만의 스키마는 `UNKNOWN_JSON_SCHEMA` | nullable null 노드 | (나) | 02: 매개변수 행 E32; null 전용 형 없는 분기는 nullable null. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-inference.test.ts > E32` |
| LANDING-176 | 현행 | 형 없는 `{allOf:[{type:'string'}]}`는 병합 처리기가 없어 오류 | string 노드 | (가) | 07: 공개 Form의 스키마 수용·노드 종류·입력을 대조. | `packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-176 typeless allOf infers a string node and input` |
| LANDING-177 | 현행 | `['null','null']`은 nullable null 노드 | `UNKNOWN_JSON_SCHEMA` | (나) | 02: 중복 null 목록은 UNKNOWN_JSON_SCHEMA. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-syntax.test.ts > E10 rejects invalid, empty and duplicated explicit types` |
| LANDING-178 | 현행 | nullable 기반의 형 없는 `allOf` 항목 `{nullable:false}`가 null 제거 | 그 항목은 효과 없음 | (가) | 07: 공개 Form의 스키마 수용·노드 종류·입력을 대조. | `packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-178 typeless nullable false overlay does not remove null` |
| LANDING-179 | 현행 | string·null과 number·null의 `allOf` 교집합이 `ALL_OF_TYPE_REDEFINITION` | nullable null 노드 | (나) | 02: 매개변수 행 E30; string/null과 number/null의 교집합. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-static-intersection.test.ts > E30` |
| LANDING-180 | 현행 | number와 number·string의 `allOf` 교집합이 `ALL_OF_TYPE_REDEFINITION` | 교집합인 number 노드 | (나) | 02: 매개변수 행 E24; number와 number/string의 교집합. | `packages/canard/schema-form/src/core/blueprint/__tests__/blueprint.type-static-intersection.test.ts > E24` |
| LANDING-181 | 현행 | `Hint.type`·`FormTypeInputProps.type`이 `node.schemaType`; 정수는 `'integer'` | `node.type` 사용; 정수는 `'number'`, 별도 `schemaType` 신설 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-181 integer hints and input props use number plus integer schemaType` |
| LANDING-182 | 현행 | 입력 선택 시험은 `{type:['number','integer']}` | `{type:'number'}` 사용; 정수만이면 `{schemaType:'integer'}` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-182 number selection includes integer and schemaType selects integer alone` |
| LANDING-183 | 현행 | 함수 시험의 `type === 'integer'` 절 | 죽은 조건이므로 제거(TS2367) | (다) | 08: UI 플러그인별 수·정수 입력 동작 수정은 LANDING-206·68C-07 담당. | 해당 없음 |
| LANDING-184 | 현행 | mui 수 입력은 빈 칸 `null`, `type === 'integer'`·`parseInt` 정수 처리, `step` 사용 | 빈 칸 `undefined`, `schemaType === 'integer'`, 자르지 않음, 해석 못한 글은 초안 | (다) | 08: UI 플러그인별 수·정수 입력 동작 수정은 LANDING-206·68C-07 담당. | 해당 없음 |
| LANDING-185 | 현행 | `FormTypeTestObject`는 `type: JSONSchemaType \| JSONSchemaType[]` | `type: SchemaNodeType \| SchemaNodeType[]`, 새 키 `schemaType` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-185 test objects accept node kinds and a separate schemaType` |
| LANDING-186 | 현행 | 시험 객체의 모든 키 비교로 `{typo: undefined}`가 우연히 일치 | 모르는 키는 대조에서 제외하고 개발 모드 경고 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-186 unknown test keys are ignored and reported in development` |
| LANDING-187 | 현행 | 코어 기본 입력 정의 열 개 | `{type:'union'}` 감싸개 추가로 열한 개 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-187 default union input is available without a user definition` |
| LANDING-188 | 현행 | 가드는 `node.group` 판정, `isTerminalNode`가 원시 잎 넷으로 좁힘 | `strategy` 판정·`UnionNode` 추가; 좁힌 뒤 `switch (node.type)`에 `case 'union'` 필요 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-188 LANDING-190 union narrowing reaches the terminal union node` |
| LANDING-189 | 현행 | `InferValueType`의 `as const` `type` 배열은 `any` | 정확한 합 형; 새 형 오류 가능 | (가) | 07: 공개 Form의 스키마 수용·노드 종류·입력을 대조. | `packages/canard/schema-form/src/__tests__/migration/schema-types.test.tsx > LANDING-189 readonly type arrays infer the precise public value union` |
| LANDING-190 | 현행 | `InferJSONSchema<A\|B>` 분배로 `StringNode \| NumberNode` | `UnionSchema`·`UnionNode` | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/node-surface.test.tsx > LANDING-188 LANDING-190 union narrowing reaches the terminal union node` |
| LANDING-191 | 현행 | `SchemaNode` 합집합·`FormTypeRendererProps.type`에 `UnionNode`·`'union'` 없음 | 망라 `switch`에 `case 'union'` 추가 | (가) | 07: 공개 Form으로 이주 행의 새 동작을 검증. | `packages/canard/schema-form/src/__tests__/migration/input-selection.test.tsx > LANDING-191 renderers receive union in the public node kind union` |
| LANDING-192 | 현행 | 값 변경 옵션을 켠 ajv `bind` 허용; 살아 있는 폼 값 제자리 변경 | `bind`가 `VALIDATOR_BIND_REFUSED` throw; 값을 바꾸지 않는 별도 인스턴스 사용 | (나) | 05: 값을 바꾸는 ajv 옵션을 bind에서 거부하며 기존 바인딩 보존. | `packages/canard/schema-form-ajv6-plugin/src/validator/__tests__/bind-refusal.test.ts > refuses mutating options before replacing the instance`<br>`packages/canard/schema-form-ajv7-plugin/src/validator/__tests__/bind-refusal.test.ts > refuses value-changing options before replacing the binding`<br>`packages/canard/schema-form-ajv8-plugin/src/validator/__tests__/bind-refusal.test.ts > refuses modifying options without replacing the bound instance` |
| LANDING-193 | 현행 | 검증기에 주는 스키마 사본은 얕음 | 깊은 사본을 한 번 생성 | (나) | 05: 루트별 깊은 사본을 검증·가드가 공유. | `packages/canard/schema-form/src/core/validation/__tests__/validation.cache.test.ts > VALIDATE-048 shares one copy and whole-schema compile per validator and authored root`<br>`packages/canard/schema-form/src/core/validation/__tests__/validation.copy.test.ts > VALIDATE-034 VALIDATE-050 strips extensions only at schema positions and leaves required intact` |
| LANDING-194 | 현행 | ajv8 union `type`에 `strictTypes` 로그 경고 | `allowUnionTypes`로 경고 없음 | (나) | 05: ajv8의 default·2019·2020 진입에서 union 컴파일 무경고. | `packages/canard/schema-form-ajv8-plugin/src/validator/__tests__/union-types.test.ts > compiles a union without a warning in the %s entry` |
| LANDING-195 | 현행 | 터미널 아래 경로의 검증 에러 버림 | 터미널(union) 노드가 에러 수신 | (나) | 05: 터미널 아래 오류를 터미널 노드로 라우팅. | `packages/canard/schema-form/src/core/validation/__tests__/validation.route.test.ts > VALIDATE-043 FRAGMENT-053 assigns rejected keys to their host and terminal descendants to the terminal` |
| LANDING-196 | 현행 | 기본 문자열 입력은 글 그대로, 수 입력은 `valueAsNumber` 전달 | 빈 칸은 `undefined`; 해석 못한 초안은 흐림 때 되돌림 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/controls.test.tsx > LANDING-196 empty default inputs write undefined despite omitEmpty false` |
| LANDING-197 | 현행 | 터미널 object·array 값 안 JSON 부정합 검사 없음 | 개발 모드 `NON_JSON_WHOLE_VALUE` 경고 | (나) | 05: 통째 객체·배열의 JSON 부정합 개발 경고. | `packages/canard/schema-form/src/core/dispatch/__tests__/dispatch.report.test.ts > WRITE-099 31C-02 checks whole non-JSON values only in development` |
| LANDING-199 | 현행 | 호출자의 `setValue(V)` `Overwrite`는 브랜치에도 Refresh·하위 트리 전체 재마운트 | 원본이 실제로 바뀐 노드만 재마운트 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/proxy-refresh.test.tsx > LANDING-199 external replacement refreshes changed inputs and preserves unchanged inputs` |
| LANDING-200 | 현행 | `setValue(null)` 뒤 자식 쓰기로 객체 복원 시 자식이 든 기본값 표시; T1-B §6 P3c: {o:{a:"x",c:3}} | 채우지 않음 | (가) | 07: LANDING-203의 새 결과를 노드·DOM으로 검증. 오늘 결과는 T1-B §6의 P3c 기록을 인용. | `packages/canard/schema-form/src/__tests__/migration/fill-timing.test.tsx > LANDING-200 child input restores a null object without refilling its sibling` |
| LANDING-201 | 현행 | 입력 `onChange(v, SetValueOption.Overwrite)`가 `Refresh` 비트로 자기 입력 재마운트; T1-B §6 P5: Overwrite RequestRefresh 1회(실제 DOM은 미실행) | 입력을 재마운트하지 않음 | (가) | 07: LANDING-203의 새 결과를 노드·DOM으로 검증. 오늘 결과는 T1-B §6의 P5(이벤트 탐침, DOM 미실행) 기록을 인용. | `packages/canard/schema-form/src/__tests__/migration/fill-timing.test.tsx > LANDING-201 input Overwrite preserves the input instance and caret` |
| LANDING-202 | 현행 | 배열 통째 `setValue`가 아이템을 재생성하고 모두 채움; T1-B §6 P8: [{a:"x"},{a:"x"}] | 위치로 이어 남은 아이템은 채우지 않고 뒤에 새로 생긴 아이템만 채움 | (가) | 07: LANDING-203의 새 결과를 노드·DOM으로 검증. 오늘 결과는 T1-B §6의 P8 기록을 인용. | `packages/canard/schema-form/src/__tests__/migration/fill-timing.test.tsx > LANDING-202 whole-array replacement fills only the newly created tail` |
| LANDING-207 | 현행 | 형 없는 객체 `oneOf`·`anyOf`는 `UNKNOWN_JSON_SCHEMA` | object variant 호스트; 게이트 없는 객체 프로퍼티 순환은 `RECURSIVE_SHAPE_UNBOUNDED` | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-207 typeless object branches render successfully`<br>`packages/canard/schema-form/src/__tests__/e2e/union-validation.test.tsx > LANDING-207 ungated recursive object variants report RECURSIVE_SHAPE_UNBOUNDED with fallback DOM` |
| LANDING-208 | 현행 | `type` 없이 `const`·`enum`만 있는 프로퍼티는 `UNKNOWN_JSON_SCHEMA` | 리터럴 종류의 원시 잎 | (가) | 07: 공개 Form의 노드·DOM·방출을 이주 행의 새 동작으로 검증. | `packages/canard/schema-form/src/__tests__/e2e/union.test.tsx > LANDING-208 typeless literal properties render primitive leaves` |

코어 전용 진입의 서명 변경: 옛 `nodeFromJSONSchema({ jsonSchema, defaultValue, onChange, validationMode, validatorFactory, contextNode })` → 새 서명(plan/07-switch/execution-adr.md D3), 이주 행 아님(70C-01)


공개 표면 잔여의 거취: 형 별칭 `JSONSchemaError`(= `ValidationIssue`, 34C-02·50C-01 "PR-7까지")는 07 전환 커밋에서 공개 index에서 빠짐(74라운드 소유자 답, 75C-01). 옛 이름의 별칭은 두지 않음. throw 클래스의 판별 함수 `isJSONSchemaError`는 오류 분류의 현행 공개 함수로 남음. 이주 안내 본문은 PR-8(LANDING-068)

globalErrors·getErrors()의 내용: 변경 없음(루트 외부 오류 + 검증 목록, 79C-01)

- 마운트 정착 동안 onChange가 나지 않음(TEST-020·021). 초기 값은 동기 정착 뒤 getValue로 읽습니다. 07 U8 처분 78C-01: `array.omit-trailing.injection.render.test.tsx`, `deferred-mount.render.test.tsx`.
- 터미널 호스트는 값을 통째로 들고 자식 기본값을 채우지 않음(NODE-005); 호출자 defaultValue 불변은 유지합니다(WRITE-071). 07 U8 처분 78C-01: `default-value.input-immutability.render.test.tsx`.
- 검증 마커 제거 뒤 표준 oneOf에서 다른 분기가 유효하면 오류가 없음(LANDING-115·VALIDATE-010·036). controls.active는 표준 검증의 분기 선택 마커가 아닙니다. 07 U8 처분 78C-01: `multi-render-split-brain.render.test.tsx`.
- 배열 잎 아이템의 방출 없는 빈자리는 undefined가 아니라 null로 방출하며, omitTrailing은 후행 빈자리만 자름(VALUE-034). 07 U8 처분 78C-01: `array.omit-trailing.injection.render.test.tsx`.

## 공개 표면 잔여 대조 — SURFACE-059·18C-87

기준 19개 FormProps는 전환 직전 `3911b7591`의 `src/components/Form/type.ts`와 SURFACE-059의 목록입니다. 아래 경로는 PKG 기준입니다. 형 시험은 패키지 `tsc`가 실제로 검사하며 Vitest의 `expectTypeOf` 실행만으로 형 검사를 대신하지 않습니다.

| 근거 키 | 형 시험 파일 > 정확한 제목 |
| --- | --- |
| P | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 FormProps retains nineteen baseline fields with declared replacements and additions` |
| H | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 FormHandle has exactly eighteen typed members` |
| V | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 ValidationMode retains None OnChange and OnRequest` |
| E | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 six public event names remain available after the enum rename` |
| C | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 commands use request with four kinds and omit retired methods` |
| K | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 five public hooks retain their callable contracts` |
| F | `src/types/__tests__/migrationSurface.type.test.ts > SURFACE-059 Form compound component names remain available` |

### FormProps — 기준 19개와 신규 세 칸

`유지`는 이름의 유지입니다. 형·의미가 달라진 칸은 같은 행에 변화를 명시합니다. 기준 19개에서 렌더러 하나를 개명하고, 신규 세 칸 및 진단 콜백 하나·전용 렌더러 셋을 더하여 현재는 26개입니다. P는 키 집합과 각 필드의 타입을 별도로 작성한 기대 인터페이스와 정확히 비교합니다.

| 구분 | 오늘 이름 | 새 이름·거취 | 형·동작 근거 | 형 시험 |
| --- | --- | --- | --- | --- |
| 기존 01 | jsonSchema | 유지 | 스키마 제네릭 유지 | P |
| 기존 02 | defaultValue | 유지 | 값 제네릭 유지; 로드 의미는 LANDING-039·155 | P |
| 기존 03 | readOnly | 유지 | boolean; Form 잠금은 LANDING-168 | P |
| 기존 04 | disabled | 유지 | boolean; Form 잠금은 LANDING-168 | P |
| 기존 05 | onChange | 유지 | 값 콜백; 동기 진입당 통지는 LANDING-022 | P |
| 기존 06 | onValidate | 유지 | ValidationIssue 배열로 개명(LANDING-024); readonly 변경은 아래 미등록 물음 | P |
| 기존 07 | onSubmit | 유지 | 값 → void 또는 Promise<void> | P |
| 기존 08 | onStateChange | 유지 | SchemaNode.globalState; 집계 의미는 LANDING-152·153 | P |
| 기존 09 | formTypeInputDefinitions | 유지 | Hint.type·schemaType은 LANDING-181–186 | P |
| 기존 10 | formTypeInputMap | 유지 | 경로별 입력 컴포넌트 | P |
| 기존 11 | CustomFormTypeRenderer | 개명: FormTypeGroupRenderer; 옛 이름 제거 | LANDING-035, 나머지 전용 렌더러는 아래 신규 표면 | P·F |
| 기존 12 | errors | 유지 | readonly ValidationIssue[]; LANDING-024, readonly 물음 별도 | P |
| 기존 13 | formatError | 유지 | FormTypeRendererProps.formatError | P |
| 기존 14 | showError | 유지 | boolean 또는 ShowError; reset 의미는 LANDING-039 | P |
| 기존 15 | validationMode | 유지 | ValidationMode | P·V |
| 기존 16 | validatorFactory | 이름 유지·서명 변경 | 함수 → compile·compileGuard 객체(LANDING-036) | P |
| 기존 17 | virtualization | 유지 | boolean 또는 VirtualizationOptions | P |
| 기존 18 | context | 유지 | Dictionary | P |
| 기존 19 | children | 유지 | ReactNode 또는 FormChildrenProps 렌더 함수 | P |
| 신규 01 | 없음 | 추가: onError | 오류·경고 관찰자(LANDING-044) | P |
| 신규 02 | 없음 | 추가: unsetOnInactive | Form 기본 나감 정책(WRITE-031) | P |
| 신규 03 | 없음 | 추가: disableAutomaticWrites | Form 자동 쓰기 억제(WRITE-015) | P |
| 추가 표면 | 없음 | 추가: onDiagnosticsChange | 진단 변경 관찰; LANDING-045·SURFACE-007 | P |
| 추가 표면 | 없음 | 추가: FormTypeLabelRenderer | 라벨 렌더러(LANDING-035) | P |
| 추가 표면 | 없음 | 추가: FormTypeInputRenderer | 입력 렌더러(LANDING-035) | P |
| 추가 표면 | 없음 | 추가: FormTypeErrorRenderer | 오류 렌더러(LANDING-035) | P |

### FormHandle — 18개 멤버

H는 이름 18개뿐 아니라 반환·인자·옵션까지 정확히 비교합니다. 런타임 키와 무경로 명령은 `src/components/Form/__tests__/Form.binding.test.tsx > SURFACE-059 EVENT-073 exposes exactly eighteen handle members and optional-path commands`도 검증합니다.

| 멤버 | 거취 | 현재 서명·변경 근거 | 형 시험 |
| --- | --- | --- | --- |
| node | 유지 | 선택적 InferSchemaNode | H |
| focus | 이름 유지·확장 | (path?: string) → void; EVENT-073·SURFACE-059 보충 | H·C |
| select | 이름 유지·확장 | (path?: string) → void; EVENT-073·SURFACE-059 보충 | H·C |
| refresh | 추가 | (path?: string) → void; EVENT-073 | H·C |
| remount | 추가 | (path?: string) → void; EVENT-073 | H·C |
| reset | 유지 | () → void; 같은 트리·교체 동작은 LANDING-039. 옵션 인자는 아래 계약 차이 | H |
| findNode | 유지 | (path: string) → SchemaNode 또는 null | H |
| findNodes | 유지 | (path: string) → readonly SchemaNode[]; readonly 물음 별도 | H |
| getState | 유지 | () → SchemaNode.globalState | H |
| setState | 유지 | (state: SchemaNode.state) → void | H |
| clearState | 유지 | () → void | H |
| getValue | 유지 | () → Value; outputValue(LANDING-023) | H |
| setValue | 유지 | Value 또는 updater, 선택적 네 비트(LANDING-021·141) | H |
| getErrors | 유지 | () → readonly ValidationIssue[]; 내용 불변(79C-01), readonly 물음 별도 | H |
| getAttachedFilesMap | 유지 | () → Map<string, File[]> | H |
| validate | 유지 | () → Promise<readonly ValidationIssue[]>; readonly 물음 별도 | H |
| showError | 유지 | (visible?: boolean) → void | H |
| submit | 유지 | TrackableHandlerFunction; 거부는 LANDING-025·045 | H |

### 검증 모드·이벤트·명령·훅

| 표면 | 거취 | 새 공개 계약 | 형 시험 |
| --- | --- | --- | --- |
| ValidationMode.None | 유지 | 0 | V |
| ValidationMode.OnChange | 유지 | 1 | V |
| ValidationMode.OnRequest | 유지 | 2 | V |
| UpdateValue | 유지 | SchemaNodeEventType.UpdateValue | E |
| UpdateState | 유지 | SchemaNodeEventType.UpdateState | E |
| UpdateError | 유지 | SchemaNodeEventType.UpdateError | E |
| RequestFocus | 유지 | SchemaNodeEventType.RequestFocus | E |
| RequestSelect | 유지 | SchemaNodeEventType.RequestSelect | E |
| RequestRemount | 유지 | SchemaNodeEventType.RequestRemount | E |
| NodeEventType | 개명·옛 별칭 제거 | SchemaNodeEventType(LANDING-158) | `src/__tests__/migration/node-surface.test.tsx > LANDING-157 LANDING-158 public state and event names have no old aliases` |
| publish·setReadOnly·setDisabled·setVisible | 제거 | request(kind), 제어는 controls; LANDING-170·68C-03 | C |
| request | 유지·명령 전용 | SchemaNodeRequestType 한 종류씩; Focus·Select·Refresh·Remount | C |
| useSchemaNodeTracker | 유지 | node 또는 null, 선택적 mask → number | K |
| useSchemaNodeSubscribe | 유지 | node·listener·선택적 onSubscribe → void | K |
| useChildNodeComponentMap | 유지 | 자식 컴포넌트 목록 → 필드별 컴포넌트 맵 | K |
| useChildNodeErrors | 유지 | node·선택적 disabled → 표시 상태·포맷 오류·readonly 오류 행렬 | K |
| useFormSubmit | 유지 | FormHandle ref → submit·pending | K |
| useSchemaNode | 내부 전용 유지 | 공개 진입점에 없음 | K |
| Form.Render·Group·Label·Input·Error | 유지 | 컴파운드 컴포넌트 이름 | F |
| JSONSchemaError 인터페이스 | 개명·옛 별칭 제거 | ValidationIssue(LANDING-024); isJSONSchemaError 함수는 유지 | `src/__tests__/migration/node-surface.test.tsx > LANDING-024 validation errors use ValidationIssue without the retired alias` |

## 원장 관리자에게 넘길 물음

- **미등록 이주 후보 M1:** `focus`·`select`의 필수 path가 선택적으로 바뀐다는 SURFACE-059 보충은 이주 행에 넣도록 명시하지만, 추출 대상인 `### LANDING-nnn 이주` 128개 행에는 해당 서명 행이 없습니다. `refresh`·`remount` 추가와 함께 별도 이주 행이 필요한지 원장 관리자가 결정해야 합니다. U10은 행을 추가하지 않았습니다.
- **미등록 이주 후보 M2:** 기존 mutable 오류 배열과 노드 배열이 `readonly`로 바뀌었습니다(`FormProps.errors`·`onValidate`, `FormHandle.getErrors`·`validate`·`findNodes`, `useChildNodeErrors.errorMatrix`의 내부 배열). LANDING-024는 오류 형의 개명만, LANDING-049는 findAll 개명만 정합니다. 기존 배열을 수정하거나 mutable 배열에 대입하던 소비자의 형 오류를 다루는 이주 행은 없습니다. U10은 현행 형을 증명하고 물음만 남깁니다.
- **기존 행의 구현 차이:** LANDING-039 원문은 `FormHandle.reset(option?)`에 억제 비트 둘을 허용하지만 현재 공개 서명은 `reset(): void`입니다. 이는 빠진 이주 행이 아니라 기존 행의 미구현 서명이며, 위 H는 현행 서명을 기록합니다. 별도 구현 단위에서 결정·보완해야 합니다.
- 코어 전용 `nodeFromJSONSchema` 서명 변경은 70C-01이 이주 행이 아니라고 명시하므로 위 후보에 포함하지 않습니다. 신규 진단 콜백·명령 추가도 기존 소비자를 깨는 변경과 구별합니다.

## U10 검증 범위

- 처분: (가) 69, (나) 46, (다) 3(모두 08), 현행 아님 10. 09로 미룬 실행 동작은 없습니다.
- LANDING-132의 `required` 갱신 누락과 LANDING-021·141의 복합 비트 잔재를 새 시험의 실패로 확인하고 해당 코어 통로를 보완했습니다. 조건부 required는 값·존재와 별개로 직접 자식에게 계산 상태 통지를 보냅니다.
- LANDING-190의 `FormTypeInputProps<string | number>` 노드 추론도 변경 전 타입 검사의 실패로 확인했습니다. 서로 다른 비-null 종류는 하나의 type 튜플로 추론하며 nullable 표지를 보존합니다.
- T1-B P5는 이벤트 수와 코드 경로를 측정했으며 과거 DOM 재마운트를 실행한 증거는 아닙니다. 새 LANDING-201 시험은 실제 입력 인스턴스와 캐럿을 검사합니다.

### 실행 결과

아래 npx 실행에는 설치를 방지하는 `--no-install`을 더했습니다. 시험은 새 소스만 사용하며 0.16.0 실행 대조는 하지 않습니다.

| 실행 위치 | 명령 | 결과 |
| --- | --- | --- |
| architecture | `node verification/07-switch/tools/extract-migration-rows.mjs --check-complete verification/07-switch/migration-check.md` | 성공: 128개 행 |
| package | `npx --no-install vitest run --project render --reporter=dot src/__tests__/migration` | 6개 파일, 47개 시험 통과 |
| package | `npx --no-install vitest run --project unit --project render --reporter=dot` | 319개 파일 통과, 2,577개 시험 통과, 기존 todo 1개 |
| package | `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 통과 |
| package | `npx --no-install eslint "src/**/*.{ts,tsx}"` | 통과 |
| package | `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | 통과: 1,561개 파일 |

독립 검토에서 LANDING-182 시험이 number 선택자의 integer 포함을 직접 검증하지 않는 점을 확인했습니다. number 정의만 등록한 integer 루트 장면을 추가한 뒤 시험과 재검토를 통과했습니다. 위 계약 차이와 이주 후보는 해결로 간주하지 않습니다.
