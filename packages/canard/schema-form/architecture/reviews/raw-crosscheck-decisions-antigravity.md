# 소유자 설계 결정 6종(D-1~D-6) 교차검증 보고서

본 문서는 `@canard/schema-form` 전면 재설계 과정에서 소유자가 확정해야 하는 여섯 가지 핵심 설계 결정(D-1~D-6)에 대해, 코드베이스 검증(`file:line`), 적대적 검토 기록 인용, Ajv 8.17.1 직접 실행 결과를 근거로 교차검증한 결과를 기록합니다.

---

## D-1. 이슈 #338의 null 계약 S4 폐기 여부

### (1) 확인한 사실

- **현재 코드의 S4 구현 방식**:
  - `ObjectNode`의 브랜치 전략은 부모 노드의 값이 `null`로 커밋될 때 모든 자식 노드에 대해 `(node as AbstractNode).__resetToBlank__(base?.[node.name])`를 호출하여 자식을 blank 상태로 재구성합니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:282, 354`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts#L282)
  - `__resetToBlank__`는 자식을 "`defaultValue` 없는 폼이 만드는 상태"로 되돌리고, 노드의 복원값(`__restoreValue__`)을 blank 값으로 덮어씁니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:1127-1145`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts#L1127-L1145), [`packages/canard/schema-form/src/core/nodes/AbstractNode/DETAIL.md:12-13, 81-82`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/DETAIL.md#L12-L13)
  - 자식 노드에서 값이 입력되어 `null` 부모를 객체로 승격시킬 때는 `__hasNullAncestor__` 조회를 통해 상위 `null` 조상 노드로 의도된 쓰기(`intended`)를 거슬러 올라가 전파합니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:1100-1118`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts#L1100-L1118), [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:180`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts#L180)
- **S4를 고정하고 있는 테스트**:
  - `nullable.object-blank-state.render.test.tsx` 시나리오 전반:
    - 객체가 `null`이 될 때 자식 인풋이 스키마 기본값으로 갱신됨을 검증: lines 31–40
    - `null` 상태에서 자식 필드 입력 시 blank 기본값과 사용자 입력만 결합되어 객체로 승격됨을 검증: lines 42–51
    - `null` 상태를 거친 뒤의 초기값 복원 동작 검증: lines 69–100
    - 근거 (a): [`packages/canard/schema-form/src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx:31-100`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/__tests__/scenarios/nullable.object-blank-state.render.test.tsx#L31-L100)
  - `ArrayNode.nullable.blankReset.test.ts`: lines 15–40
    - 근거 (a): [`packages/canard/schema-form/src/core/__tests__/ArrayNode.nullable.blankReset.test.ts:15-40`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/__tests__/ArrayNode.nullable.blankReset.test.ts#L15-L40)
- **폐기 시 깨지는 테스트**:
  - `nullable.object-blank-state.render.test.tsx`의 "refreshes the child inputs to their schema defaults when the object is set to null" (lines 31–40):
    - `target: { note: 'typed', reason: 'edited' }` 상태에서 `setValue({ target: null })` 실행 시, 현재는 `form.value('/target/note') === ''`, `form.value('/target/reason') === 'because'`가 되지만, S4 폐기 시에는 자식 raw가 보존되어 이전 값 `'typed'`, `'edited'`가 그대로 유지되므로 즉시 실패합니다.
  - 동일 파일의 lines 42–51:
    - `null` 상태에서 `/target/note`에 `'again'` 입력 시 현재는 `{ target: { note: 'again', reason: 'because' } }`로 승격되나, 폐기 시에는 보존되어 있던 이전 값 `'edited'`가 합쳐져 `{ target: { note: 'again', reason: 'edited' } }`가 되므로 실패합니다.
- **남는 잠복 값이 실제로 새어 나올 수 있는 구체적 경로**:
  - 레코드 A(`{ target: { note: 'secret', reason: 'confidential' } }`)를 보던 폼에 `target`이 `null`인 레코드 B(`{ target: null }`)를 로드(`setValue`)하는 시나리오.
  - 근거 (b): `reviews/round-3.md` §4 D-1, §3.1 T9, `reviews/raw-codex3-workloop.md` 236행.
  - **경로 1 (사용자 입력에 의한 승격 누출)**: 소비자가 명시적 `reset()` 없이 `setValue({ target: null })`로 레코드를 전환한 뒤, 사용자가 레코드 B 상태에서 `target`의 사소한 하위 필드(예: 체크박스)를 조작하거나 타이핑하면 `target`이 객체로 승격되면서 레코드 A의 민감 정보(`'secret'`)가 그대로 합쳐져 백엔드로 방출(emit)됩니다.
  - **경로 2 (UI 직접 참조 노출)**: 비제어 컴포넌트나 노드 뷰가 `node.find('/target/note').value`를 직접 조회할 경우 레코드 A의 값이 화면에 그대로 잔존하여 사용자에게 시각적으로 노출됩니다.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **S4 폐기 (E9 채택)**<br>(부모가 null이 되어도 자식 raw 유지) | 1. 단일 raw 칸으로 상태를 완전히 표현 가능(Fiber 모델 ADR 0006 완성).<br>2. null ↔ 객체 왕복 시 사용자의 입력 데이터 보존.<br>3. 작업 루프가 (schema, raw, selection)의 순수 함수가 됨(E1). | 레코드 A 로드 후 null인 레코드 B 로드 시, reset/전체 교체를 쓰지 않으면 A의 잠복 값이 잔존하여 승격 시 데이터 누출 위험. | `round-3.md` §4 D-1, §6 E9, `round-3-spec.md` A6, `adr/0006-single-value-ownership.md:67` |
| **S4 유지**<br>(부모가 null이 되면 자식을 blank로 리셋) | 레코드 전환 시 이전 레코드의 잠복 데이터 누출 위험이 원천 차단됨. | 1. 노드마다 초기값·복원값·편집값 등 3개 이상의 상태 칸이 필요하여 단일 값 소유 원칙 붕괴.<br>2. 실수로 null을 거친 사용자의 편집 데이터 영구 유실.<br>3. 작업 루프 3차안 A6과 정면 모순. | `BranchStrategy.ts:282`, `AbstractNode/DETAIL.md:13, 81`, `round-3.md` T9 |

### (3) 권장안 및 이유

> **권장안**: 이슈 #338의 S4를 폐기하고, "자식 raw를 지우는 것은 객체 V에 없는 키뿐이며 null·비객체 할당은 자식 raw를 건드리지 않는다"는 개정 E9를 채택합니다.

**이유**: 중앙 데이터 모델 없이 노드 트리가 상태를 소유하는 구조(ADR 0006)에서 원본·blank·초기값의 3중 상태를 단일 raw 칸에 담는 것은 아키텍처상 불가능하며, 작업 루프를 결정론적 순수 함수(E1)로 정립하기 위한 필수 전제이기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

레코드 전환(`Record A` -> `Record B(null)`)을 처리하는 애플리케이션 소비자는 단순히 `setValue({ target: null })`만 호출해서는 안 되며, 폼을 초기화하는 `form.reset()`을 호출하거나 `Overwrite` 전체 교체를 사용해야 한다는 점을 릴리스 노트 및 마이그레이션 가이드에 명시적으로 강제해야 합니다.

---

## D-2. 조각 활성 계산에서 옵션 B(비단조 + 상한) 채택 여부

### (1) 확인한 사실

- **현재 구현의 루프 감지 동작 및 위치**:
  - 현재 구현은 파생값 및 이벤트 캐스케이드의 무한 루프 감지를 `EventCascadeManager`에서 수행하며, 상한 임계값은 `MAX_LOOP_COUNT = 100`으로 하드코딩되어 있습니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:34`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts#L34)
  - 루프 횟수가 100을 초과하면 마이크로태스크 비동기 컨텍스트 내부에서 `throw new SchemaFormError('INFINITE_LOOP_DETECTED', ...)`를 던집니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:95-107`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts#L95-L107)
  - 이 비동기 throw는 호출자의 동기 `try/catch`로 잡히지 않고 Unhandled Rejection이 되어 프로세스나 브라우저 탭을 비정상 종료시킵니다.
    - 근거 (b): `reviews/raw-redteam-lifecycle.md` 30행, `reviews/round-1.md` R6.
- **실제 스키마 코퍼스에서 부정 가드의 빈도**:
  - `if-then-else`의 상호 배타 조건이나 `not: { required: ['x'] }`와 같은 일반적인 부정 가드는 실제 비즈니스 폼에서 흔히 발생합니다 (추론).
  - 단조 평가(옵션 A)를 택하면, 부정 가드와 타 조각의 활성이 결합될 때 `then`과 `else`가 동시에 켜져 검증기와 폼 판정의 동치(G1)가 깨지는 치명적 결함이 실행으로 입증되었습니다 (근거 (b): `reviews/round-3.md` §3.1 T5, codex 실행).
  - 반면 옵션 B에서 진동을 유발하는 `if not required x then x default` 형태의 자기 부정(self-negating) 스키마는 논리적 패러독스를 담은 스키마 작성자의 설계 결함이며, 정상적인 스키마 코퍼스에서는 거의 나타나지 않습니다 (추론).
- **상한 초과를 프로덕션에서 관측 가능하게 남기는 구체적 형태**:
  - 근거 (b): `reviews/round-3.md` §6 E6.
  - 상한 계산: `상한 = 조각 수 + 1`.
  - 상태 플래그: 호스트 노드에 `host.settleStatus = 'budget-exceeded'` (정상 수렴 시 `'stable'`) 플래그 기록.
  - 이벤트/통지: `onChange` 또는 `onSettle` 통지 페이로드에 `{ status: 'budget-exceeded', loopCount, activeFragments }` 메타데이터 전달.
  - 런타임 제어: 개발 모드에서는 상세 경고 콘솔 및 throw, 프로덕션 모드에서는 프로세스를 죽이지 않고 마지막 바퀴의 활성 집합으로 고정(freeze)한 뒤 `console.warn/error`와 상태 플래그를 유지.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **옵션 B (비단조 + 상한)**<br>(거짓이면 끄고, 조각수+1 바퀴 초과 시 고정 및 관측성 확보) | 1. 현실의 복잡한 부정 가드 조합에서 검증기가 수락하는 올바른 고정점에 도달.<br>2. 무한 루프 발생 시 탭 정지 없이 마지막 상태로 안전하게 동결.<br>3. 프로덕션 APM/모니터링 연동 가능. | 자기 부정 스키마(`if not required x then x default`)에서 고정점이 없어 상한까지 바퀴를 소모하고 정지. | `round-3.md` §3.1 T5, §4 D-2, §6 E6, codex3 실행 |
| **옵션 A (단조)**<br>(한번 켜진 조각은 끌 수 없음) | 활성 플래그가 단조 증가하므로 무조건 조각 수 이내에 루프 종료가 수학적으로 보장됨. | 부정 가드가 포함된 스키마에서 `then`과 `else`가 동시에 켜져 폼 방출 데이터가 검증기를 통과하지 못함(G1 위반). | `round-3.md` §3.1 T5 (RL·C 실행 반례), `round-3-spec.md` A3 4항 |

### (3) 권장안 및 이유

> **권장안**: 조각 활성 계산에서 옵션 B(비단조 재평가 + 조각 수 + 1 상한 고정 + 프로덕션 상태 플래그/통지 관측성 확보)를 채택합니다.

**이유**: 옵션 A는 실무에서 빈번한 정상적 부정 가드 조건문에서 `then`과 `else`를 동시에 활성화하는 치명적인 G1 위반을 초래하는 반면, 옵션 B는 현실적인 모든 정상 스키마를 올바르게 수렴시키며 자기 부정 불량 스키마에 대해서도 상한 제어와 프로덕션 관측성으로 안전하게 격리할 수 있기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

자기 부정 스키마(`if not required x then x default`)는 지원 범위 밖(Out of Scope)으로 공식 선언해야 하며, 상한 도달 시 마지막 바퀴 상태로 폼이 고정되므로 작성자/운영자가 이를 감지할 수 있도록 에러 로깅 체계와 개발 모드 진단 가이드를 갖추어야 합니다.

---

## D-3. 금지 조각의 의미 규정

### (1) 확인한 사실

- **현재 코드의 금지 조각 해석 여부**:
  - 현재 코드는 `properties: { x: false }`나 `not: { required: ['x'] }`를 별도의 금지 조각으로 특별히 해석하지 않습니다.
  - `not` 키워드는 미평가 키워드(`UNCOUNTED_KEYWORDS`)로 분류되어 있습니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:41-42`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts#L41-L42), [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo/INTENT.md:31`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo/INTENT.md#L31)
- **Ajv 8.17.1 직접 실행 결과 (근거 (c))**:
  - 실행 스크립트:
    ```javascript
    const Ajv8 = require('./packages/canard/schema-form-ajv8-plugin/node_modules/ajv');
    const ajv = new Ajv8({ allErrors: true });

    // Case 1: properties: { x: false }
    const v1 = ajv.compile({ type: 'object', properties: { x: false } });
    console.log('v1({x:1}):', v1({ x: 1 }), v1.errors);
    console.log('v1({}):', v1({}));

    // Case 2: not: { required: ['x'] }
    const v2 = ajv.compile({ type: 'object', not: { required: ['x'] } });
    console.log('v2({x:1}):', v2({ x: 1 }), v2.errors);
    console.log('v2({}):', v2({}));
    ```
  - 실행 출력:
    ```json
    v1({x:1}): false [
      {
        "instancePath": "/x",
        "schemaPath": "#/properties/x/false schema",
        "keyword": "false schema",
        "params": {},
        "message": "boolean schema is false"
      }
    ]
    v1({}): true

    v2({x:1}): false [
      {
        "instancePath": "",
        "schemaPath": "#/not",
        "keyword": "not",
        "params": {},
        "message": "must NOT be valid"
      }
    ]
    v2({}): true
    ```
- **각 옵션에서의 사용자 경험(UX)**:
  - **옵션 (i) (비활성화와 동일)**: 필드가 화면에 나타나지 않거나 비활성화되며, 방출(emit) 값에서 제외됩니다. 백엔드가 금지하려던 필드를 폼이 조용히 삭제(drop)하여 유효한 상태로 제출합니다. 사용자는 에러를 겪지 않으나, 백엔드가 거부하려 했던 데이터가 폼에 의해 조용히 정제됩니다.
  - **옵션 (ii) (필드를 보이고 검증기 에러 부착)**: 필드가 화면에 렌더링되지만 값을 입력하면 검증 에러가 발생합니다. 특히 `properties: { x: false }`는 어떤 값을 입력해도 `false schema` 에러가 발생하여 사용자가 통과시킬 수 없습니다. 더욱이 `not: { required: ['x'] }`는 Ajv의 에러 경로가 루트 `instancePath: ""`이고 메시지가 `"must NOT be valid"`이므로, 사용자는 어느 필드가 잘못되었는지 전혀 인지할 수 없는 치명적인 UX 혼란에 빠집니다.
  - **옵션 (iii) (폼은 읽지 않고 검증기에 전적 위임)**: 폼 core는 금지 개념을 두지 않고 일반 필드로 노출하며, 검증기가 뱉는 에러를 그대로 표시합니다. 결과적으로 옵션 (ii)와 동일한 UX 파탄이 발생합니다.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **옵션 (i)**<br>(비활성화와 동일 — 방출 제외, 검증 통과) | 1. 폼 UI에 입력 불가능한 필드가 노출되지 않음.<br>2. S5 순환 참조가 없음.<br>3. ADR 0013의 유일한 방출 제외 메커니즘과 일관성 유지. | 백엔드가 거부하려던 값을 폼이 조용히 지워 유효하게 만드는 "값 임의 수정" 논란(S6 패턴). | `round-3.md` §3.1 T6, §4 D-3, `spikes/work-loop/REPORT-v3.txt` D2 |
| **옵션 (ii)**<br>(필드 노출 + 검증기 에러 부착) | 폼이 사용자의 값을 임의로 버리지 않으며 원본 보존 원칙 준수. | 1. 사용자가 어떤 입력을 해도 고칠 수 없는 필드에 에러가 발생.<br>2. `not: {required: ['x']}` 시 루트에 `"must NOT be valid"` 에러가 떠서 원인 식별 불가. | Ajv 8.17.1 직접 실행 결과 (instancePath: ""), `round-3.md` T6 |
| **옵션 (iii)**<br>(폼은 특별 취급 안 하고 검증기 위임) | core 엔진에 금지 조각 해석 로직이 없어 구현이 단순함. | 옵션 (ii)의 치명적 UX 파탄과 해결 불가능한 에러 노출 문제를 그대로 답습. | `open-questions.md` Q11, `round-3.md` D-3 |

### (3) 권장안 및 이유

> **권장안**: 옵션 (i)(금지 조각을 비활성화와 동일하게 취급하여 폼 방출에서 제외하고 필드를 비활성화)을 채택합니다.

**이유**: Ajv 8.17.1 실행 결과 확인되었듯 `not: { required: ['x'] }`나 `properties: { x: false }`에 필드를 노출하고 에러를 붙이는 옵션 (ii)/(iii)는 사용자가 UI 상에서 교정할 수 없는 에러(`"boolean schema is false"`, 루트 경로의 `"must NOT be valid"`)를 발생시켜 폼 제출을 영구 차단하는 심각한 UX 파탄을 초래하기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

백엔드가 부정한 입력으로 판정하여 거부하려 했던 불량 레코드를 폼이 로드했을 때, 금지된 필드를 조용히 탈락시켜 유효한 페이로드로 정제(sanitize)해 방출하는 현상(S6 패턴)이 발생하므로, 이를 "비활성 필드 방출 제외 규약"의 공식 동작으로 문서화해야 합니다.

---

## D-4. 쓰기 종류의 호출자 선언 방식

### (1) 확인한 사실

- **현재 `core/types/value.ts`의 11개 비트/플래그 및 참조 위치**:
  - 근거 (a): [`packages/canard/schema-form/src/core/types/value.ts:26-66`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/types/value.ts#L26-L66)
  1. `Replace` (0x01): 전체 교체 여부 플래그 (`BranchStrategy.ts:285`)
  2. `EmitChange` (0x02): 부모로 `onChange` 보고 (`AbstractNode.ts:1118`, `BranchStrategy.ts:274`)
  3. `Propagate` (0x04): 자식 노드로 전파 (`BranchStrategy.ts:360`, `ArrayNode.ts:116`)
  4. `Refresh` (0x08): 비제어 입력 재읽기 `RequestRefresh` 발행 (`TerminalStrategy.ts:99`)
  5. `Batch` (0x10): 부모 보고 시 배치 지연 모드 적용 (`TerminalStrategy.ts:96`, `AbstractNode.ts:1118`)
  6. `Isolate` (0x20): computed 즉시 격리 평가 (`BranchStrategy.ts`)
  7. `Normalize` (0x40): 미선언 키 삭제 (`ObjectNode/DETAIL.md`)
  8. `PublishUpdateEvent` (0x80): `UpdateValue` 이벤트 발행 (`TerminalStrategy.ts:101`)
  9. `PreventInjection` (0x100): `injectTo` 트리거 억제 (`TerminalStrategy/DETAIL.md:24`)
  10. `Automatic` (0x200): 엔진 자동 쓰기 표시 (`AbstractNode.ts:1117`, `BranchStrategy.ts:218`)
  11. `None` (0x00): 플래그 없음
- **기본값**:
  - 현재 `setValue(input, option = SetValueOption.Overwrite)`로 기본값은 `SetValueOption.Overwrite`입니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:355-364`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts#L355-L364)
  - 새 설계에서도 루트 또는 브랜치 노드에 외부에서 값을 주입할 때의 기본값은 호출자의 일반적인 직관("새 값으로 갈아끼운다")에 부합하는 `Overwrite`가 타당합니다.
- **리프 입력의 구조적 성격**:
  - 사용자가 텍스트 인풋 등 리프 노드에 한 글자씩 타이핑할 때 부모 객체 관점에서는 다른 형제 필드들을 그대로 보존한 채 해당 키만 갱신해야 하므로 **구조상 Merge(부분 쓰기)**입니다.
    - 근거 (b): `reviews/round-3.md` §6 E15, `reviews/round-3-spec.md` §E E15.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **호출자 선언 3종으로 정돈**<br>(`Overwrite`, `Merge`, `Refresh`만 유지, 나머지 제거) | 1. 작업 루프 3차안과 완벽 일치(내부 캐스케이드 플래그 불필요).<br>2. 쓰기의 의도가 명확해지고 추론 모호성 제거.<br>3. API 표면이 단순해져 학습 곡선 대폭 감소. | 기존 내부 비트 플래그를 조합해 쓰던 기존 테스트 및 확장 코드의 대대적 마이그레이션 발생. | `round-3.md` §4 D-4, §6 E15, `open-questions.md` Q6 |
| **11비트 체계 유지**<br>(기존 비트마스크 보존) | 기존 테스트 및 레거시 내부 유틸리티와의 호환성 유지. | 1. 동기 작업 루프 정착 모델과 맞지 않는 구시대 이벤트 플래그들이 남아 엔진을 오염시킴.<br>2. 내부 사정이 공용 API에 유출됨. | `core/types/value.ts`, `round-1.md` R12 |

### (3) 권장안 및 이유

> **권장안**: 기존의 11비트 플래그 체계를 폐기하고, 쓰기의 종류를 호출자가 명시하는 `Overwrite`(전체 교체), `Merge`(부분 쓰기), `Refresh`(비제어 재읽기) 3가지로 단순화하여 정돈합니다.

**이유**: 3차안의 동기 작업 루프(work-loop) 체계에서는 비동기 마이크로태스크 배치와 이벤트 버스를 제어하기 위한 8개의 내부 비트가 완전히 무의미해졌으며, 쓰기의 의미를 전체 교체와 부분 쓰기로 엄격히 구분하는 것이 책임 경계(ADR 0013)의 핵심이기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

기본값이 `Overwrite`이므로, 하위 객체의 일부 필드만 부분적으로 패치하고자 하는 외부 소비자는 반드시 `{ option: 'Merge' }`를 전달해야 하며, 리프 노드의 입력 핸들러는 내부적으로 항상 부분 쓰기(`Merge`) 경로를 타도록 렌더러 바인딩 계층을 정비해야 합니다.

---

## D-5. 로드 시 default 주입 옵션

### (1) 확인한 사실

- **현재 코드의 default 주입 경로**:
  - 노드 생성 시 `defaultValue` 파라미터가 없으면 `getDefaultValue(jsonSchema)`를 호출하여 스키마 기본값을 계산하고, 이를 `__setDefaultValue__`를 통해 `__initialValue__` 및 `__restoreValue__`에 기록합니다.
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts:303-310, 1198`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/AbstractNode/AbstractNode.ts#L303-L310), [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:343`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts#L343)
- **빈 폼과 로드의 현재 구분 위치**:
  - 폼 생성자에 `defaultValue` 인자가 명시적으로 전달되었는지 여부로 구분됩니다.
  - 그러나 현재 코드는 로드된 `defaultValue` 객체에 특정 키가 빠져있으면(`undefined`), 해당 자식 노드 생성 시 `defaultValue === undefined`로 판정되어 스키마 기본값을 자동으로 채워 넣습니다.
- **옵션 부재 시 dirty/touched에 미치는 영향**:
  - 백엔드에서 sparse 레코드(예: `{ id: 101 }`)를 로드했을 때, 스키마에 `status: { type: 'string', default: 'pending' }`이 정의되어 있으면 폼이 누락된 `status`에 `'pending'`을 주입합니다.
  - 이로 인해 사용자가 폼에 아무런 타이핑도 하지 않았음에도 폼이 "수정됨(dirty)" 상태로 인식되어 저장 버튼이 활성화되거나, 저장 시 백엔드가 원치 않는 필드가 덮어써지는 문제가 발생합니다.
    - 근거 (b): `reviews/round-3.md` §3.3 C2 ("sparse 레코드 로드에서 default 주입만으로 dirty가 되므로 '옵션 불필요'는 반례 (A)").
- **이름의 일관성 및 후보군 검토**:
  - 기존 폼 레벨 옵션들은 `omitEmpty`, `omitTrailing`, `trim` 등 **생략/제외 동작**을 표현하는 `omit*` 접두사나 동사형을 일관되게 사용하고 있습니다.
  - 후보 명칭인 `preserveDefaultValue`는 "기본값을 보존한다"는 것인지 "기본값 주입을 억제한다"는 것인지 의미가 모호합니다.
  - **대안 후보**:
    1. `omitDefaultOnLoad`: 로드 시 빠진 키에 대한 기본값 주입 생략 (기존 `omitEmpty`, `omitTrailing`과 완벽히 동일한 톤).
    2. `injectDefaultOnLoad`: 기본값 주입 여부 (boolean, 기본값 true).
    3. `preserveMissingKeys`: 로드된 데이터의 누락 키 상태를 그대로 보존.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **default 주입 opt-out 옵션 제공**<br>(기본: 빠진 키 주입, 옵션으로 끔) | 1. 빈 폼과 로드 폼의 기본 일관성 유지.<br>2. sparse 레코드 로드 시 허위 dirty 발생 및 백엔드 데이터 오염 방지 가능. | 폼 옵션이 하나 증가하고, 옵션 활성화 시 필수 필드 누락에 따른 검증 에러 처리 필요. | `round-3.md` §3.3 C2, §4 D-5, §6 E16 |
| **옵션 미제공 (항상 주입)** | 옵션이 없어 API가 단순함. | sparse 레코드 로드 시 무조건 폼이 dirty 상태가 되어 저장 흐름을 왜곡함. | `round-3.md` C2 반례 실행 결과 |
| **기본 계약을 "주입 안 함"으로 변경** | sparse 레코드 로드 시 안전함. | 빈 폼 생성 시에도 기본값이 채워지지 않아 신규 작성 폼의 UX가 크게 저하됨. | `round-2.md` §6, `round-3.md` D-5 |

### (3) 권장안 및 이유

> **권장안**: 로드 계약의 기본 동작(로드 시 누락된 키에 default 주입)을 유지하되, 이를 끌 수 있는 옵션을 제공하며 이름은 기존 명명 톤과 일치하는 `omitDefaultOnLoad`를 채택합니다.

**이유**: 신규 폼 생성과 일반적인 로드 환경에서 스키마 기본값을 채워주는 기본 UX를 보존하면서도, sparse 레코드 로드 시 발생하는 허위 dirty 상태 및 백엔드 원본 왜곡 문제를 해결할 수 있는 유일한 표준 탈출구를 제공하기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

`omitDefaultOnLoad: true`를 활성화한 상태에서 스키마의 `required`에 포함된 필드가 누락된 sparse 레코드를 로드할 경우, 폼 로드 직후 즉시 유효성 검증 에러가 발생할 수 있으므로 이에 대한 UI 표시 정책이 조율되어야 합니다.

---

## D-6. `virtual`의 위치와 처리 방식

### (1) 확인한 사실

- **현재 `VirtualNode`가 core에 얽혀 있는 위치**:
  - 객체의 값 계산, 자식 리셋, computed 프로퍼티 처리에서 virtual 노드를 명시적으로 건너뜁니다:
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:279, 353, 703`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts#L279)
  - 스키마 전처리 단계에서 `required`, `then.required`, `else.required`에 포함된 가상 필드 이름을 실제 구성 필드로 강제 치환(펼치기)합니다:
    - 근거 (a): [`packages/canard/schema-form/src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/processVirtualSchema.ts:13-29`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/processVirtualSchema.ts#L13-L29)
    - 이는 표준 검증기 불변 원칙(ADR 0001)과 정면 충돌하는 유일한 지점입니다.
  - 가상 필드의 값 비추기 및 쓰기 부채질:
    - 근거 (a): [`packages/canard/schema-form/src/core/nodes/VirtualNode/VirtualNode.ts:39-96, 112-139`](file:///Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/nodes/VirtualNode/VirtualNode.ts#L39-L96)
- **각 옵션에서 보존 대상 테스트 16개의 생존 여부**:
  - 보존 대상: `src/__tests__/scenarios/virtual.render.test.tsx` (12개), `src/core/__tests__/VirtualNode.test.ts` (4개), `processVirtualSchema.test.ts`.
  - **옵션 (a)**: core에 "참조 그룹" 노드가 유지되므로 `VirtualNode.test.ts`(4개)와 `virtual.render.test.tsx`(12개) 등 16개 핵심 시나리오가 거의 온전히 보존됩니다. 유일하게 표준을 위반하던 `processVirtualSchema`의 required 펼치기 테스트만 제거/수정됩니다.
  - **옵션 (b)**: core에서 `VirtualNode`가 완전히 제거되므로 core 단위 테스트 4개가 전멸하며, 렌더 테스트 12개 중 다수가 `node.find('/period')` 부채질 인터페이스 상실로 깨집니다.
  - **옵션 (c)**: 16개 테스트 모두 유지되나 ADR 0001 위반이 영구 고착됩니다.
- **다른 렌더러(Vue·Svelte)로 core 이식 시 (a)와 (b)의 차이**:
  - **(a) 참조 그룹 노드**: core가 가상 튜플 뷰, 쓰기 부채질(`setValue` -> 구성 필드 분배), `RequestRefresh`를 스스로 완결하여 제공하므로, Vue/Svelte 바인딩은 단순히 해당 노드를 바인딩하기만 하면 됩니다. 렌더러 구현이 극도로 단순해지며 플랫폼 간 동작이 100% 동일합니다.
  - **(b) 렌더 계층 완전 이동**: core가 가상 개념을 전혀 모르므로, React 훅 외에도 Vue 컴포저블, Svelte 스토어/액션마다 형제 노드를 탐색하고 쓰기를 수동으로 쪼개어 전달하는 복잡한 바인딩 코드를 매 프레임워크마다 중복 구현해야 합니다.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| :--- | :--- | :--- | :--- |
| **(a) `&virtual` + 참조 그룹 노드**<br>(core에 값 없는 참조 그룹 노드 신설) | 1. ADR 0001 위반 완전 해소.<br>2. 16개 핵심 테스트 계약 보존.<br>3. `node.find()`, 쓰기 부채질, `RequestRefresh`의 강력한 DX 유지.<br>4. Vue/Svelte 이식성 극대화. | core 노드 종류에 "참조 그룹"이라는 별도 노드 사양이 추가됨 (ADR 0011 개정 필요). | `round-3.md` §5, §4 D-6, `open-questions.md` Q5 |
| **(b) 렌더 계층으로 완전 이동**<br>(core에서 virtual 완전 제거) | core 엔진이 순수 JSON Schema 모델로 극단적으로 단순화됨. | 1. `VirtualNode.test.ts` 등 기존 테스트 대량 파괴.<br>2. `setValue` 부채질 상실.<br>3. Vue/Svelte 등 타 프레임워크마다 래퍼 컴포넌트를 중복 재구현해야 함. | `round-3.md` §5 (b), `00-goals.md` C3 |
| **(c) 현행 유지**<br>(required에 가상 이름 허용) | 기존 코드 및 테스트 수정 비용 제로. | 스키마 전처리가 required를 조작하여 표준 검증기 불변 원칙(ADR 0001)을 영구히 위반함. | `processVirtualSchema.ts:13-29`, ADR 0001 |

### (3) 권장안 및 이유

> **권장안**: 선택지 (a)(`&virtual` 네임스페이스로 이동하고, core에 값과 방출이 없는 "참조 그룹" 노드 종류를 신설하는 방안)를 채택합니다.

**이유**: 스키마 전처리에서 표준 `required`를 변조하던 ADR 0001 위반을 완벽히 제거하면서도, 16개의 기존 테스트 계약과 복합 입력 컴포넌트 제어(`setValue` 부채질, `RequestRefresh`)의 우수한 DX를 지켜낼 수 있으며, 향후 Vue나 Svelte로의 확장 시 바인딩 복잡도 증가를 원천 봉쇄할 수 있기 때문입니다.

### (4) 소유자가 함께 알아야 할 대가

스키마 작성자는 가상 필드 이름을 표준 `required` 배열에 직접 기재할 수 없으며 실제 구성 필드들을 `required`에 적어야 한다는 점을 공지해야 하고, core 노드 종류 표(ADR 0011)에 raw·local·emit 칸이 모두 비어 있는 "참조 그룹" 사양을 공식 편입해야 합니다.

---

## 요약

1. **D-1 (#338 S4 폐기)**: 이슈 #338의 S4를 폐기하고 부모가 `null`이 되어도 자식 raw를 보존하는 개정 E9를 채택합니다.
2. **D-2 (비단조 옵션 B)**: 비단조 평가와 조각 수 + 1 상한을 적용하고 프로덕션 관측성을 확보하는 옵션 B를 채택합니다.
3. **D-3 (금지 조각 의미)**: 금지 조각을 비활성화와 동일하게 취급하여 폼 방출에서 제외하는 옵션 (i)을 채택합니다.
4. **D-4 (쓰기 종류 선언)**: 11비트 플래그를 폐기하고 호출자가 의도를 선언하는 `Overwrite`, `Merge`, `Refresh` 3종으로 정돈합니다.
5. **D-5 (로드 시 default 주입)**: 로드 시 누락 키 default 주입을 기본으로 하되, sparse 레코드 보호를 위한 `omitDefaultOnLoad` 옵션을 도입합니다.
6. **D-6 (`virtual`의 자리)**: `&virtual` 네임스페이스로 이동하고 core에 값 없는 "참조 그룹" 노드 종류를 신설하는 방안 (a)를 채택합니다.

---

## 수렴 라운드

다른 두 리뷰어(codex, claude)가 제시한 실행 증거와 아키텍처 분석을 면밀히 재검토한 결과, 본 검토자가 제안했던 기존 완화책의 결함과 상대 논거의 우월성이 명백히 입증되었으므로 D-1, D-3, D-4에 대해 다음과 같이 입장을 수정합니다.

### D-1. 이슈 #338의 null 계약 S4 유지 여부 — **수정** (S4 유지 수락)

- **이유**:
  1. claude의 전체 테스트 회귀 검증(vitest 3,860개 중 24~25개 실패)과 레코드 A 로드 후 `{target: null}`인 레코드 B를 로드했을 때 하위 필드 하나만 입력해도 A의 형제 값(`reason`, `rows`)이 방출되는 실행 반례는 결정적입니다.
  2. 본 검토자가 제시했던 완화책("루트 Overwrite")은 레코드 B의 중첩 `target: null`에 도달했을 때 E9(비객체 V는 자식 raw를 건드리지 않는다)가 그대로 적용되어 자식 raw를 지우지 못하므로, 루트 교체로도 데이터 누출을 막을 수 없다는 상대의 반론을 인정합니다.
  3. 또한 "원본 칸 하나로 세 값을 담지 못한다"는 전제 역시, `null` 할당을 C1의 일반 전체 교체(자식 키가 없으므로 raw 부재)로 취급하고 C2(누락 키에 default 주입)를 연계하면 제3의 상태 칸 없이도 S4의 blank 복귀가 모순 없이 자연스럽게 도출된다는 상대의 증명에 동의합니다.
  4. 따라서 데이터 누출을 방지하고 24개 이상의 회귀 테스트를 보존하기 위해 S4를 유지하는 것으로 입장을 수정합니다.

### D-3. 금지 조각의 의미 — **수정** (옵션 (iii) 수락: 폼은 금지 조각을 읽지 않고 검증기에 위임)

- **이유**:
  1. 상호 배타 필드 a, b를 모두 가진 불량 레코드를 로드했을 때, 옵션 (i)은 두 필드를 모두 숨기고 방출에서 제거하여 유효한 `{}`로 둔갑시키며, 사용자가 UI에서 이를 수정하거나 복구할 수 없는 치명적 교착(deadlock) 상태를 유발한다는 claude의 실행 반례가 결정적입니다.
  2. 현재 코드베이스(`schemaNodeFactory.ts:116`)가 이미 boolean false를 거부하고 `then` 내부의 금지 조각을 읽지 않고 있어 사실상 오늘날의 동작이 옵션 (iii)이었다는 사실을 확인했습니다.
  3. 본 검토자가 우려했던 "고칠 수 없는 에러"는 본체 선언 필드의 경우 값을 비움(`clear`)으로써 사용자가 스스로 해결할 수 있으며, `not: { required: ['x'] }`의 루트 에러는 에러 라우팅 규칙(Q12)으로 풀어야 할 문제이지 폼 엔진이 값을 임의 삭제해야 할 이유가 아닙니다.
  4. 옵션 (iii)을 채택하면 S5 순환, E5 예외 (2), E8 모순이 core 작업 루프에서 통째로 소멸되어 엔진 복잡도가 획기적으로 낮아지므로 옵션 (iii)으로 입장을 수정합니다.

### D-4. 쓰기 종류의 선언 방식 — **수정** (공개 옵션은 Overwrite와 Merge 2종, Refresh는 core 규칙으로 이관)

- **이유**:
  1. 기존 공개 API 계약(`PublicSetValueOption`, `value.ts:69-74`, `index.ts:45`)에서도 이미 `Merge`와 `Overwrite` 2종만 노출되어 있었으며, 두 공개 프리셋 모두 이미 내부적으로 `Refresh` 비트를 내포하고 있어 호출자가 독립적으로 취사선택할 대상이 아닙니다.
  2. 비제어 입력 요소의 재읽기 신호(`RequestRefresh`)를 외부 호출자가 임의로 지정하게 만들면, 컴포넌트 갱신 시점을 core와 호출자가 이중으로 판단하게 되어 ADR 0013의 책임 경계를 훼손합니다.
  3. 따라서 외부 호출자가 명시하는 쓰기 옵션은 전체 교체(`Overwrite`)와 부분 쓰기(`Merge`) 2종으로 명확히 좁히고, `Refresh` 발행 여부는 core가 작업 루프 정착 규칙(ADR 0007)에 따라 일관되게 판단하도록 입장을 수정합니다.

