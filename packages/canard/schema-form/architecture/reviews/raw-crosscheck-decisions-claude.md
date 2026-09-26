# 소유자 결정 D-1–D-6 교차검증 — claude

작성: 2026-09-22. 대상: `round-3.md` §4(D-1–D-6), §6(E1–E19), `round-3-spec.md` 원문과 §E. 다른 리뷰어의 교차검증 원문(`raw-crosscheck-decisions-*.md`)은 독립성을 위해 읽지 않았습니다.

근거 표기:

- **[코드 `file:line`]** — 현재 저장소의 코드. `src/`는 `packages/canard/schema-form/src/`, 플러그인은 `packages/canard/schema-form-ajv8-plugin/src/`입니다.
- **[테스트 `file:line`]** — 현재 테스트의 위치와 단언.
- **[기록 파일 §절]** — 검토 기록에 남은 실행 결과나 소유자 발언.
- **[실행 스크립트]** — 이번에 직접 돌린 것. 스크립트는 모두 `reviews/crosscheck-claude-*`이며 재현 명령은 문서 끝에 있습니다. ajv는 8.17.1이고 옵션은 플러그인 기본값(`allErrors: true, strictSchema: false, validateFormats: false`, `validatorPlugin.ts` `defaultSettings`)과 같습니다.
- **[추론]** — 실행이나 코드로 확인하지 않은 판단.

기록과 사실이 어긋난 곳을 먼저 모아 둡니다. 판단에 직접 영향을 줍니다.

| 기록 | 사실 | 근거 |
| ---- | ---- | ---- |
| `round-3.md` §4 D-1: "소비자는 레코드 전환에 `reset()` 또는 객체 V의 전체 교체를 써야 한다" | 레코드 B가 중첩 키에 `null`을 가지면 루트의 객체 Overwrite로도 A의 잠복 값이 지워지지 않습니다. E9가 중첩 호스트에서 적용되기 때문입니다. `reset()`은 생성 시의 V(레코드 A)로 돌아갑니다 | D-1 (1) |
| `round-3.md` §4 D-1: S4를 유지하려면 "세 번째 값(초기값) 칸이 필요" | C1·C2를 null에도 균일하게 적용하면 노드별 칸이 필요 없습니다(blank = raw 없음 + default 주입, 초기값 = 루트의 생성 시 V) | D-1 (1), [추론] |
| `round-3.md` §4 D-2: "현재 구현도 같은 스키마에서 `INFINITE_LOOP_DETECTED`다" | 재현되지 않습니다. 현재 구현은 `then.properties`와 `not`을 읽지 않아 자기 부정 스키마에서 루프 자체가 없습니다. 이 예외는 `derived` 순환에서만 납니다 | D-2 (1) |
| `open-questions.md` Q6: `SetValueOption`은 "11비트" | 10비트(`BIT_FLAG_00`–`09`)와 `None`입니다 | D-4 (1) |
| `round-3.md` §5, Q5: `BranchStrategy.ts:279,353,703`은 "값·required·omitEmpty 계산"에서 virtual을 제외한다 | 세 곳은 각각 하향 전파, `resetToBlank`, 비활성 자식 값 제거입니다. required·omitEmpty와는 무관합니다 | D-6 (1) |
| `round-3.md` §5: "보존해야 할 테스트 16개(`virtual.render.test.tsx`, `VirtualNode.test.ts`, `processVirtualSchema.test.ts`)", "(a)에서 `processVirtualSchema`의 required 펼치기만 사라진다" | 16개는 render 12개와 `VirtualNode.test.ts`의 `refresh behavior` 4개입니다. `processVirtualSchema.test.ts`는 들어 있지 않습니다. virtual 전용 테스트는 4파일 47개입니다 | D-6 (1) |
| `round-3.md` §5 (a): 참조 그룹은 "raw·local·emit 없음" | 16개 가운데 7개가 그룹의 튜플 `.value`를 읽습니다. 그룹에 파생 값이 없으면 이 7개는 살아남지 못합니다 | D-6 (4) |

---

## D-1 — #338 S4 폐기

### (1) 확인한 사실

**S4의 문구** [코드 `src/core/nodes/ObjectNode/DETAIL.md:19`]

> null인 동안 자식은 어떻게 null이 되었든 이 노드에 `defaultValue`를 주지 않은 폼과 같은 상태(…스키마 `default`…)를 가집니다. `null`로 버린 데이터는 되살아나지 않습니다.

- 짝이 되는 규칙은 둘입니다.
  - S2: null 여부는 의도된 쓰기로만 바뀝니다. 같은 값을 다시 써도 쓰기입니다(S6) [코드 `:12-17`].
  - S5: 객체가 될 때의 값은 빈 폼에 같은 쓰기를 한 값입니다 [코드 `:20`].
- 수용 기준은 `:37-48`에 있습니다.
- 자동 쓰기는 null 조상을 객체로 만들지 않습니다 [코드 `src/core/types/value.ts:46-47`, `AbstractNode/DETAIL.md:11,15`].

**구현** [코드, 직접 확인한 줄은 ✓]

1. null이 되면 `__propagate__`가 null 동안의 기록을 `__blankBase__`로 되돌립니다(`BranchStrategy.ts:272` ✓).
2. 그리고 **활성·비활성 분기를 포함한 모든** subnode(`:276` ✓)에 `__resetToBlank__`를 부릅니다(`:281-283` ✓).
3. 리프의 `__resetToBlank__`는 복원 값을 blank로 바꾸고 `StableReset`(`Automatic` 포함)으로 씁니다(`AbstractNode.ts:1127-1132`, `:1087-1092`).
4. null 동안 온 자식 쓰기는 `__blank__`에만 기록됩니다(`BranchStrategy.ts:808-813`).
5. 자식 쓰기가 오면 `{...__blank__, ...draft}`로 객체가 됩니다(`:815`, `:827`, `:232-233`).
6. 같은 값의 재쓰기는 `__hasNullAncestor__`를 따라 null 조상까지 전달됩니다(`AbstractNode.ts:1100-1119`).
7. 초기값과 복원값은 따로 둡니다: `__initialValue__`와 `__restoreValue__`(`AbstractNode.ts:278-310`). `resetSubtree()`는 복원값을 초기값으로 되돌립니다(`:1138-1144`).

**S4를 끄면 깨지는 테스트** [실행 — `src`를 `.crosscheck-d1/src`로 복사해 패치하고 vitest 전체를 돌렸습니다. 수는 JSON 보고서의 `numFailedTests`로 직접 확인했습니다]

두 변형을 돌렸습니다.

- P1: `setValue(null)`에서 blank 리셋만 건너뜁니다. 자식은 raw를 유지하고, null 동안의 기록은 스키마 default입니다.
- P2: P1에 더해, null 동안의 기록을 직전 객체로 채웁니다. "null이 풀릴 때 자식이 든 값으로 합성한다"는 폐기안의 뜻에 해당합니다.

```diff
@@ __propagate__(source, target, replace, option
+    previous?: ObjectValue | Nullish,
   ) {
     const nullify = target === null;
-    if (nullify) this.__blank__ = { ...this.__blankBase__ };
+    const d1 = process.env.D1_VARIANT;
+    if (nullify)
+      this.__blank__ =
+        d1 === 'P2' && previous ? { ...previous } : { ...this.__blankBase__ };
+    if (source === null && (d1 === 'P1' || d1 === 'P2')) return;
```

| 실행 | 통과 | 실패 |
| ---- | ---- | ---- |
| 기준(패치 전 복사본) | 3,860 | 0 |
| P1 | 3,836 | 24 |
| P2 | 3,835 | 25 |

- 실패는 **모두 nullable 계약 파일**에 있습니다: `ObjectNode.branch.nullable.{blankState, composition, interface, computed}`, `ObjectNode.branch.defaultAfterNull`, `ObjectNode.branch.pendingReadCache`, `ArrayNode.nullable.blankReset`, `nullable.object-blank-state.render`, `nullable.render`.
- blank를 직접 단언하는 테스트의 예:
  - `nullable.object-blank-state.render.test.tsx:31`: null이 되면 입력이 스키마 default로 돌아가야 하는데 `'typed'`를 받았습니다.
  - `nullable.render.test.tsx:205`: `bio`가 `undefined`여야 하는데 `'dev'`였습니다.
  - `ObjectNode.branch.nullable.blankState.test.ts:101`: A의 값이 그대로 남았습니다.
- 결과가 바뀌는 테스트의 예:
  - `nullable.object-blank-state.render.test.tsx:42`: `{note:'again', reason:'because'}`를 기대했는데 P2에서 `reason:'edited'`였습니다.
  - `ObjectNode.branch.nullable.composition.test.ts:204`: 분기를 바꾸면 `aValue:'stale'`가 돌아옵니다.
  - `ObjectNode.branch.nullable.computed.test.ts:57`: 숨긴 형제의 옛 값 `b:'kept'`가 방출됩니다(P2).
- `00-goals.md:122`는 기존 테스트를 회귀 오라클로 쓰지 않는다고 정했습니다. 그래서 실패 수 자체는 근거가 아닙니다. 다만 실패한 24–25개는 #338에서 정한 계약의 문장(수용 기준 `DETAIL.md:37-48`)을 그대로 옮긴 것입니다.
- 실험에 쓴 복사본 `packages/canard/schema-form/.crosscheck-d1/`은 권한 설정 때문에 지우지 못했습니다(아래 "남은 정리").

**잠복 값이 새는 경로** [실행 `crosscheck-claude-d1-library.mjs`(현재 라이브러리 복사본, P2), `crosscheck-claude-d1-proto.mjs`(3차안 프로토타입)]

레코드 A `{target: {note:'A-note', reason:'A-reason', rows:['A-row']}}`를 로드한 뒤 레코드 B `{target: null}`를 로드했습니다. **둘 다 루트의 Overwrite입니다.**

| # | 경로 | S4 유지(현재) | S4 폐기(P2) |
| - | ---- | ------------- | ----------- |
| L1 | null 동안 자식 `node.value` | `undefined`, `'because'`, `[]` | `'A-note'`, `'A-reason'`, `['A-row']` |
| L2 | 자식 하나에 입력 | `{note:'B-note', reason:'because'}` | `{note:'B-note', reason:'A-reason', rows:['A-row']}` |
| L3 | 호스트에 키가 있는 Merge | L2와 같음 | L2와 같음 |
| L4 | 호스트에 객체 Overwrite | `{note:'B-note'}` | `{note:'B-note'}` — 새지 않음 |
| L5 | `rows.push` | `{reason:'because', rows:['B-row']}` | `{note:'A-note', reason:'A-reason', rows:['A-row','B-row']}` |
| L6 | 사용자가 바꾼 `injectTo` 원천 | A 없음 | A의 형제가 방출됨 |
| L7 | 키가 없는 `{}` 로드 | 지워짐 | 지워짐 — 새지 않음 |
| L8 | 렌더 | null 동안 입력은 `''`/`'because'` | null 동안 입력에 `'A-note'`/`'A-reason'`이 **보입니다**. 입력하면 L2 |

- 자식은 부모가 null인 동안에도 마운트되어 있습니다 [테스트 `nullable.render.test.tsx:183-202`].
- 프로토타입에서도 같은 결과가 나왔습니다. null 호스트의 local이 A를 들고 있고, 부분 쓰기 하나로 A의 형제가 방출됩니다.
- 프로토타입이 명세와 다른 곳이 셋 있습니다.
  - `setValue(root, {})`가 null 호스트 아래 A를 남깁니다(`loop-v3.mjs:227-235`). C1 원문과 다릅니다.
  - `injectTo`가 출처와 무관하게 null을 풉니다(`:213-218`).
  - null 호스트 아래에 default를 주입합니다(`:393`, `:426-430`). E9와 다릅니다.

**루트 Overwrite로도 막히지 않습니다.** B가 중첩 키에 명시적 `null`을 가지면 E9("비객체 V는 자식 raw를 건드리지 않는다")가 그 중첩 호스트에서 적용됩니다. 그래서 루트의 객체 Overwrite를 해도 A가 남습니다(L2는 루트 Overwrite 두 번으로 재현). API가 빈 중첩 객체를 `null`로 돌려주는 것은 흔한 모양입니다 [추론].

따라서 `round-3.md` §4 D-1의 "소비자는 레코드 전환에 `reset()` 또는 객체 V의 전체 교체를 써야 한다"는 중첩 null에서 성립하지 않습니다. 또 `reset()`은 생성 시의 V(레코드 A)로 돌아가므로 레코드 B로 가는 수단이 아닙니다 [기록 `round-3-spec.md:114`].

**C1을 null에 그대로 적용하면 S4가 재현됩니다** [기록 `round-3.md` T9 (RL·C 실행), `codex3/results.jsonl:12`]. `{note:'typed', keep:'K1'}` → `null` → `note='Z'`는 다음과 같습니다.

- C1 해석: `{note:'Z'}`
- A6 해석: `{note:'Z', keep:'K1'}`

A6의 폐기 근거였던 "세 번째 값(초기값)을 담을 칸이 없다"는 이 균일 적용에는 해당하지 않습니다 [추론]. 이유는 셋입니다.

- blank는 저장할 값이 아닙니다. "raw 없음 + 로드 계약의 default 주입"으로 다시 만들어집니다.
- 초기값은 `reset()`을 위해 루트가 드는 생성 시 V 하나면 됩니다(E15).
- 노드마다 칸을 더 둘 필요가 없습니다.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| S4 폐기 (E9 원안) | null → 객체 토글에서 값이 돌아옵니다. 비활성과 null이 "원본은 남고 방출에서만 빠진다" 한 문장으로 설명됩니다(ADR 0006) | 누출 경로 여섯(L1·L2·L3·L5·L6·L8)이 생깁니다. 레코드 B의 중첩 null은 루트 Overwrite로도 A를 지우지 못해 **레코드 사이에 데이터가 섞입니다**. null 동안 입력에 A의 값이 보이거나, 이를 피하려고 자식을 숨기면(E18을 null에도 적용) #338의 "null이면 빈 양식" UX를 잃습니다. 24–25개 테스트에 담긴 계약이 뒤집힙니다. C1에 null 예외가 생깁니다 | `crosscheck-claude-d1-library.mjs`, 실험 |
| S4 유지 — 현재의 장치(blank 리셋) | 계약이 그대로입니다 | `__blank__`/`__blankBase__`, 복원 값의 blank화 같은 특수 장치가 새 작업 루프에 다시 들어옵니다 | `BranchStrategy.ts:272-283` |
| **S4 유지 — C1·C2의 균일 적용** | null과 비객체도 보통의 전체 교체 값이 됩니다: V에 없는 자식 raw는 지우고, 로드 계약대로 default를 넣되 호스트는 null로 둡니다. 누출 경로가 사라지고, S4·S5가 특수 장치 없이 로드 계약의 한 경우가 됩니다. 노드별 셋째 칸이 필요 없습니다. C1에 예외가 없어져 codex의 A6 모순도 풀립니다 | null로 버린 값은 돌아오지 않습니다(#338과 같습니다). C3에서 `17`을 복구하면 형제가 default로 돌아옵니다. ADR 0006 결정 5와 E9·E18을 고쳐야 합니다 | T9, codex3 `results.jsonl:12` |

### (3) 권장안

**S4를 폐기하지 마십시오. null(과 비객체 값)을 C1·C2가 똑같이 적용되는 보통의 전체 교체 값으로 다뤄, "null이 되면 자식 raw는 지워지고 default로 다시 채워진다"를 특수 장치 없이 얻으십시오.** 곧 E9의 "비객체 V는 자식 raw를 건드리지 않는다"를 삭제합니다.

이유는 두 가지입니다.

- 폐기안의 잠복 값은 루트 Overwrite로도 막히지 않습니다. 그래서 한 레코드의 값이 다른 레코드에 저장되는 경로(L2)가 열립니다.
- 폐기의 근거였던 "세 번째 칸"은 균일 적용에서는 필요하지 않습니다.

### (4) 소유자가 함께 알아야 할 대가

- **실수로 null 토글을 하면 입력한 값을 잃습니다**(#338과 같습니다). 되돌리기가 필요하면 null 토글 입력 컴포넌트가 직전 객체를 기억했다가 Overwrite로 되쓰면 됩니다. core 밖의 일입니다 [추론].
- **ADR 0006을 고칩니다.**
  - 결정 5의 "null 조상 아래의 노드도 원본을 유지한다" → "비활성 노드는 원본을 유지한다. null·비객체로의 전체 교체는 자식 원본을 지운다"
  - "결과"의 "null 계약이 '원본은 남고 방출에서만 빠진다' 하나로 설명된다" → "null 계약은 전체 교체(C1·C2)로 설명된다"
  - 자동으로 일어나는 형상 변화(비활성)와 호출자의 전체 교체를 가르는 codex의 권고(`round-2.md` §6)와 같은 선입니다.
- **E9를 고칩니다.** S4의 "null 동안 자식은 default를 든다"는 로드 계약의 default 주입이 null 호스트 아래에서도 일어나야 성립합니다(호스트는 객체가 되지 않습니다). 그래서 E9의 "null 호스트는 default 전이 주입을 하지 않는다"를 "전이 주입은 미루되, 전체 교체의 로드 주입은 한다"로 바꿉니다. D-5의 끄는 옵션이 켜지면 null 동안 자식은 비어 있습니다.
- **E18에서 null을 뺍니다.** null 동안 빈 양식을 보이는 현재 UX를 유지하려면 null을 "비객체 raw 호스트의 자식은 비활성"에서 빼야 합니다. null은 잘못된 종류가 아니라 nullable의 정상 값입니다. `17` 같은 잘못된 종류만 자식을 비활성으로 둡니다.
- **C3에서 `17`을 복구하면 형제가 원본이 아니라 default로 돌아옵니다**(RL이 지적한 것). 전체 교체의 뜻대로이므로 문서화합니다.
- **자동 쓰기는 여전히 null 호스트 아래 자식 raw를 바꿀 수 있고, 객체로 복귀할 때 나타납니다**(현재 S2와 같음, codex `results.jsonl:13`). "사용자가 일으킨 `injectTo`가 null을 푸는가"는 D-4에서 적은 E9/E19의 충돌로 따로 정해야 합니다.
- 프로토타입 `loop-v3.mjs`의 `setValue`(`:227-235`), `write`(`:213-218`), null 호스트의 default 주입(`:393`, `:426-430`)을 이 규칙으로 고친 뒤 4라운드에서 다시 공격합니다.

---

## D-2 — 조각 활성의 옵션 B (비단조 + 상한)

### (1) 확인한 사실

**현재 구현의 무한 루프 감지**

- 상한은 `MAX_LOOP_COUNT = 100`입니다 [코드 `src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:34`]. 노드마다 이벤트 배치를 만들 때 수를 세고, 100을 넘으면 `SchemaFormError('INFINITE_LOOP_DETECTED')`를 던집니다 [코드 같은 파일 `:95-106`]. 수는 매크로태스크마다 0으로 돌아갑니다 [코드 `:110-116`]. 메시지는 "Infinite loop detected in derived value computation"입니다 [코드 `src/helpers/error/formatErrorMessage/formatInfiniteLoopError.ts:21`].
- `derived` 순환(`a = ../b + 1`, `b = ../a + 1`)은 생성 후 18 ms에 `INFINITE_LOOP_DETECTED`로 끝납니다. `batchCount`는 101이고, 예외는 호출자의 스택 밖(`uncaughtException`)에서 납니다 [실행 `crosscheck-claude-current.ts derived-cycle`].

**현재 구현은 자기 부정 스키마를 읽지 않습니다**

- `if`/`then`에서 읽는 것은 `if.properties`의 `const`/`enum`과 `then.required`뿐입니다 [코드 `src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:44-61`]. `then.required`에 오른 필드에는 `computed.active`가 붙습니다 [코드 `.../mergeShowConditions/mergeShowConditions.ts:16-29`].
- `then.properties`는 읽지 않습니다. 자식 노드는 호스트의 `properties`에서만 만듭니다 [코드 `.../getChildNodeMap/getChildNodeMap.ts:45-72`]. `not`을 언급하는 곳은 null 경고의 키워드 목록 하나뿐입니다 [코드 `.../warnIfNullUnreachable.ts:42`].
- 같은 스키마를 현재 구현으로 돌린 결과는 다음과 같습니다. 모두 루프가 없고 예외도 없습니다 [실행 `crosscheck-claude-current.ts`].

| 경우 | 스키마 | 결과 |
| ---- | ------ | ---- |
| `selfneg-undeclared` | `if: {not: {required: [x]}}, then: {properties: {x: {default: 1}}}` | 노드 x 없음, 값 `{}`, 에러 없음 |
| `selfneg-declared` | 위 + x를 `properties`에도 선언 + `then.required: [x]` | x 노드는 있으나 default 없음, 값 `{}`, 에러 `/x required`와 `/ if` |
| `selfneg-active` | 현재 문법 `x: {default: 1, computed: {active: '../x === undefined'}}` | x 비활성, 값 `{}`, 에러 없음 |
| `mutual-active` | R7: a는 b가 없을 때, b는 a가 없을 때 활성 | `{b:'B'}` |

- 따라서 `round-3.md` §4 D-2 행의 "현재 구현도 같은 스키마에서 `INFINITE_LOOP_DETECTED`다"는 **거짓**입니다. 오늘 이 스키마는 조용히 `{}`로 끝나거나 검증 에러만 보입니다. 새 설계에서 처음으로 이 스키마가 형상으로 해석됩니다.

**ajv의 판정** [실행 `crosscheck-claude-ajv.mjs`]

- `then`에 `required`가 없는 자기 부정: `{}`와 `{x:1}` 모두 valid입니다.
- `then.required: [x]`가 있는 자기 부정: `{}`는 invalid(`/x required "must have required property 'x'"`, `/ if`)이고 `{x:1}`은 valid입니다.
- codex는 이 스키마에서 옵션 B가 상한 2이면 `{}`(invalid), 상한 3이면 `{x:1}`(valid)로 끝난다고 보고했습니다. 결과가 **상한의 홀짝**에 달립니다. 옵션 A는 `{x:1}`(valid)로 정상 종료했습니다 [기록 `raw-codex3-workloop.md` §3, `spikes/work-loop/codex3/results.jsonl:8`].

**옵션 A의 반례**

- 부정 가드와 다른 조각의 활성을 함께 쓰는 codex의 반례를 다시 돌렸습니다. A의 방출 `{seed, a:'A', x:1}`와 B의 방출 `{seed, x:1}`은 둘 다 valid입니다. 루트에 `unevaluatedProperties: false`를 더하면 A만 invalid입니다 [실행 `crosscheck-claude-ajv.mjs`, 기록 `raw-codex3-workloop.md` §2 "A3 step 4"].
- 제가 더한 경우: `if: {not: {required: [x]}}`의 `then`과 `else`가 같은 키 `kind`에 서로 다른 `const`(`'draft'`, `'final'`)를 선언하고, 다른 조각이 x를 켭니다. A에서는 `then`과 `else`가 동시에 활성이 되어 `kind`의 overlay가 `const 'draft' ∧ const 'final'`, 즉 공집합이 됩니다. 검증기는 최종 값에서 `else`만 적용하므로 `kind: 'draft'`는 invalid, `'final'`은 valid입니다 [실행 `crosscheck-claude-ajv.mjs` "then/else both on"]. 고정점이 있는 스키마에서도 A는 형상(UI 힌트)과 검증기의 `if` 판정을 어긋나게 합니다.

**부정 가드의 빈도**

- 계약 레드팀의 코퍼스 14종(pydantic 2.9, OpenAPI 3.0/3.1, zod, typebox, typescript-json-schema 출력을 본뜬 것)에 `if`와 `not`은 한 번도 없습니다. `not`이라는 글자는 주석에만 나옵니다 [실행 grep `spikes/guard-cost/redteam3/corpus.mjs`].
- 저장소의 테스트와 스토리에서 `if:`를 쓰는 파일은 42개입니다. 그 가운데 `if` 안에 `not`을 쓰는 곳은 없습니다. `not: {required: [..]}`는 `oneOf` 분기의 제약으로 한 번 나옵니다 [실행 grep, 테스트 `src/core/__tests__/ObjectNode.composition.nullUnreachableWarning.test.ts:152`].
- [추론] 생성기는 `if`를 거의 내지 않습니다. 부정 가드는 손으로 쓴 스키마에서 드물고, 자기 부정은 그보다 더 드뭅니다.

**관측 수단**

- `warnDevelopmentIssue`는 프로덕션에서 아무것도 하지 않습니다 [코드 `src/helpers/warning/warnDevelopmentIssue.ts:26`]. 프로덕션의 관측 통로가 될 수 없습니다.
- 쓸 수 있는 기존 장치는 `NodeState` 플래그 [코드 `src/core/types/state.ts:19-26`], `NodeEventType`과 공개 부분집합 [코드 `src/core/types/event.ts:45-96`], `globalErrors` [코드 `AbstractNode.ts:761-764`]입니다.

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| A 단조 | 종료가 구조로 보장됩니다(활성 집합은 커지기만 합니다). 자기 부정에서도 `{x:1}`로 결정적입니다 | 부정 가드가 뒤에 거짓이 되어도 켜진 채 남습니다. 그래서 `then`과 `else`가 동시에 활성이 되고, 쓰지 않을 키가 방출됩니다. `unevaluatedProperties: false`인 스키마에서는 폼이 스스로 invalid를 만듭니다. `additionalProperties`가 열려 있으면 어긋남이 에러 없이 남습니다. 원문의 "어긋남은 검증기의 에러로 드러난다"는 거짓입니다 | codex3 `results.jsonl:6-7`, `crosscheck-claude-ajv.mjs` |
| **B 비단조 + 상한** | 고정점이 있으면 검증기가 받는 고정점에 닿습니다. 형상이 최종 값에 대한 가드 판정과 같습니다 | 고정점이 없는 스키마(자기 부정)에서는 결과가 상한의 홀짝에 달립니다. 종료 이유를 따로 보고해야 합니다. 비용의 상한은 O(N²)의 가드 평가입니다(E4) | codex3 `results.jsonl:8`, `round-3.md` T2 |
| (참고) 현재 구현 | `then.properties`와 `not`을 읽지 않아 루프가 없습니다 | 표준 조건부 선언(`then.properties`)을 지원하지 못합니다. 재설계의 G2와 맞지 않습니다 | `crosscheck-claude-current.ts` |

### (3) 권장안

**옵션 B를 택하고, 상한 초과를 호스트의 상태와 루트 통지로 프로덕션에서도 관측할 수 있게 남기며, 자기 부정 스키마는 지원 범위 밖으로 문서화하십시오.**

이유는 두 가지입니다.

- A가 틀리는 경우는 고정점이 있는 현실적인 스키마입니다. `then`/`else` 동시 활성과 `unevaluatedProperties`에서 드러납니다.
- B가 틀리는 경우는 고정점이 없는 자기 부정뿐입니다. 이것은 생성기 코퍼스 14종과 저장소의 테스트·스토리 어디에도 없습니다. 현재 구현도 그 스키마를 형상으로 지원하지 않으므로 잃는 기능이 없습니다.

프로덕션에서 관측할 수 있게 남기는 형태는 다음을 제안합니다. 기존 장치의 모양을 따랐습니다.

1. **호스트 노드의 읽기 전용 칸 `settle`.** 값은 `{ status: 'stable' | 'budget-exceeded', sweeps, cap, flipping }`이고 커밋과 함께 확정됩니다. `flipping`은 마지막 두 바퀴 사이에 뒤집힌 조각의 스키마 위치입니다(예: `#/allOf/0/if`).
2. **루트 디스패처의 통지 한 종류.** 호스트의 `status`가 `stable`에서 `budget-exceeded`로 **바뀐 커밋에서만** 한 번 보냅니다. payload는 위 칸에 노드 경로와 종류(`fragment` 또는 `derive`, 즉 E7의 파생 라운드 상한)를 더한 것입니다. 키 입력마다 되풀이하지 않으므로 로그가 폭주하지 않습니다.
3. **공개 통로.** `PublicNodeEventType`에 넣거나 Form에 `onDiagnostic` 같은 콜백을 두어, 소비자가 오류 수집기(Sentry 등)로 보낼 수 있게 합니다.
4. **검증 에러에 섞지 않습니다.** `errors`/`globalErrors`에 넣으면 폼의 판정이 검증기의 판정과 달라져 G1(`00-goals.md:19`)이 깨지고 제출이 막힙니다.
5. **개발 모드에서는 커밋 뒤에 동기로 throw합니다**(ADR 0007:55의 기존 결정). 프로덕션에서는 throw하지 않습니다.

### (4) 소유자가 함께 알아야 할 대가

- **자기 부정 스키마의 결과는 임의의 형상입니다.** 상한의 홀짝에 따라 `{}`(invalid)이거나 `{x:1}`(valid)입니다. 문서화하고 관측으로만 알립니다.
  - 완화책 [추론, 미실행]: 상한을 넘은 호스트를 단조 규칙(A)으로 한 번 더 돌려 그 결과로 고정합니다. 그러면 홀짝 의존이 사라집니다. codex의 실행에서 A의 결과는 `{x:1}`, valid였습니다. 4라운드에서 E6의 "마지막 바퀴로 고정"과 비교할 만합니다.
- **진동하는 호스트는 매 커밋 상한까지 돕니다.** 비용은 (조각 수 + 1) × 조각 수의 가드 평가입니다. 모든 조각을 매 바퀴 평가하는 비용(E4, 역순 200단에서 40,200회 275 ms — `round-3.md` T2)은 A와 B에 공통입니다.
- **새 공개 표면이 생깁니다.** `settle` 칸, 통지 종류, Form 콜백입니다. C7의 메이저 변경에 들어갑니다.
- **이주 문서의 사실을 고쳐야 합니다.** 이주 문서(C8)에 "현재도 터지던 스키마"라고 쓰면 틀립니다. 오히려 [추론] 현재 문법의 자기 참조 `computed.active`(`selfneg-active`)는 오늘 조용히 정착합니다. 그런데 새 설계에서 `&active`가 방출 값을 읽으면 이것이 새로 진동할 수 있습니다. 4라운드에서 `&active`가 자기 값을 읽는 경우를 공격 대상에 넣으십시오.

---

## D-3 — 금지 조각의 의미

### (1) 확인한 사실

**현재 코드는 금지 조각을 읽지 못하고, 모양에 따라 죽거나 무시합니다** [실행 `crosscheck-claude-current.ts`]

- 최상위 `properties: {x: false}`: 생성 시점에 동기 예외 `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA`로 죽습니다 [코드 `src/core/nodes/schemaNodeFactory.ts:116`, 호출 경로 `getChildNodeMap.ts:65`].
- x를 `properties`에 선언하고 `allOf: [{properties: {x: false}}]`를 더한 경우: `TypeError: Cannot use 'in' operator to search for 'allOf' in false`로 죽습니다 [코드 `src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:39`].
- `then` 안의 금지는 읽지 않습니다(`then.properties`와 `not`은 읽히지 않습니다, D-2 (1)). 그래서 x는 보통 필드로 남고 값은 그대로 방출됩니다. **오늘의 조건부 금지는 사실상 (iii)**입니다.
  - `then: {properties: {x: false}}`: x 노드에 `false schema: boolean schema is false`, 루트에 `if: must match "then" schema`가 붙습니다.
  - `then: {not: {required: [x]}}`와 최상위 `not: {required: [x]}`: 루트에만 `not: must NOT be valid`가 붙습니다. `x.errors`는 비어 있습니다.

**ajv가 내는 에러의 경로와 메시지** [실행 `crosscheck-claude-ajv.mjs`]

| 스키마 | 입력 | 판정 | 에러 (dataPath keyword "message") |
| ------ | ---- | ---- | ------------------------------- |
| `properties: {x: false}` | `{x:'secret'}`, `{x:''}`, `{x:null}` | invalid | `/x false schema "boolean schema is false"` — 값이 아니라 존재만 봅니다 |
| 같음 | `{}` | valid | — |
| `not: {required: [x]}` | `{x:'secret'}`, `{x:''}` | invalid | `/ not "must NOT be valid"` — **x가 아니라 호스트를 가리킵니다** |
| 같음 (x는 string) | `{x:null}` | invalid | 위 + `/x type "must be string"` |
| `if mode=ban then properties.x=false` | `{mode:'ban', x:'secret'}` | invalid | `/x false schema`, `/ if "must match "then" schema"` |
| `if mode=ban then not.required[x]` | 같음 | invalid | `/ not`, `/ if` — 둘 다 호스트 |

플러그인은 `required` 에러에만 `missingProperty`를 붙이고 나머지는 `instancePath`를 그대로 씁니다 [코드 플러그인 `src/validator/utils/transformErrors.ts:39-51`]. 그래서 `false` 에러는 x 노드로 가고, `not` 에러는 호스트로 갑니다.

**(i)의 반례 — 대칭 배타** [실행 `crosscheck-claude-d3-mutex.mjs`]

3차안 프로토타입의 (i) 구현(`spikes/work-loop/proto/loop-v3.mjs`의 `prohibits`)을 그대로 썼습니다. 금지는 투영에서만 빼고, 가드는 투영 전의 L을 봅니다(E5 (2)). 스키마는 "a와 b 중 하나만"을 금지 조각으로 쓴 모양입니다: `if required a then b: false`, `if required b then a: false`.

| 경우 | raw | emit | 검증(emit) |
| ---- | --- | ---- | ---------- |
| (i) 둘 다 가진 레코드 로드 `{a:'A', b:'B'}` | `{a, b}` | `{}` | valid |
| (ii)/(iii) 같은 로드 | `{a, b}` | `{a, b}` | invalid: `/a false schema`, `/b false schema` |
| (i) a 입력 → (b 입력) → a 지움 | … | `{a}` → `{}` → `{b}` | 모두 valid |

- (i)에서 서버의 무효 레코드는 **두 값을 모두 잃고 조용히 유효가 됩니다.**
- [추론] (i)에서 금지는 비활성화이므로 a와 b 필드가 둘 다 숨겨집니다. 사용자는 어느 쪽도 지울 수 없습니다. E5 (2) 때문에 가드는 계속 raw의 a와 b를 보므로, `reset()`이나 `setValue` 전까지 이 상태가 풀리지 않습니다.
- 입력 경로에서는 (i)이 자연스럽습니다. a를 채우면 b가 숨고, a를 지우면 b가 돌아옵니다.

**소유자의 발언과 기록**

- 2라운드: "`if` 블록 내부는 통째로 검증기가 판단한다. **그래도 값 조작은 알아야 값을 처리할 수 있다.**" [기록 `round-2.md` §5]. 당시의 방향은 (i)이었고, ADR 0002의 현 본문도 (i)입니다 [기록 `adr/0002` "금지하는 조각"].
- 같은 라운드의 새 원칙: "field가 가려지면서 값을 빼내는 걸 제외하고는 입력을 막지 않고 error를 보여준다" [기록 `round-2.md` §5, ADR 0013].
- (i)이 요구하는 특칙은 셋입니다. E5 (2)(금지 제외를 가드 입력에 적용하지 않음), E8(판별식 k에 대한 금지는 무시), ADR 0002의 "이름이 하나일 때만" 규칙입니다 [기록 `round-3.md` §6].
- C2("주인 없는 검증 에러의 폼 수준 표시")는 채택되었습니다 [기록 `00-goals.md` C2].
- (i)의 UX는 표현 층에서 명시적으로 얻을 수 있습니다. x에 `&active: "../mode !== 'ban'"`를 달면 비활성화, 즉 방출 제외가 됩니다. 목표 문서는 표현 층이 값을 지울 수 있고 그 결과는 작성자 책임이라고 이미 적었습니다 [기록 `00-goals.md:133`].

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| (i) 비활성화와 같다 | BE 스키마의 조건부 금지(`if cash then cardNumber: false`)가 추가 작성 없이 "숨김 + 방출 제외"가 됩니다. 조건을 되돌리면 값이 돌아옵니다. 소유자의 2라운드 방향이고 ADR 0002의 현 본문입니다 | 로드한 무효 레코드를 폼이 조용히 유효로 만듭니다. 대칭 배타에서는 두 값이 모두 사라지고 두 필드가 모두 숨어 사용자가 풀 수 없습니다. 특칙 셋(E5 (2), E8, 단일 이름)이 필요합니다. 가드가 금지 대상 자신을 읽으면(S5 모양) 첫 글자를 치는 순간 필드가 사라집니다 [추론] | `crosscheck-claude-d3-mutex.mjs`, `round-3.md` T6 (SP D2) |
| (ii) 보이고 에러를 붙인다 | 폼이 값을 고치지 않습니다. 에러를 x에 붙이므로 사용자가 무엇을 지울지 압니다 | 폼이 여전히 금지 조각을 읽어야 합니다. `not` 에러를 x로 옮기는 라우팅과, 다른 곳에 선언되지 않은 x를 보여 줄 특별한 입력 종류가 필요합니다. `properties: {x: false}`로만 선언된 x에는 입력 종류가 없어 사용자가 고칠 수 없습니다 | `crosscheck-claude-ajv.mjs` (`/x` 대 `/`) |
| **(iii) 검증기에만 맡긴다** | 폼이 읽는 구조가 가장 적습니다(G3). 특칙 셋과 S5 순환이 사라집니다. 오늘의 조건부 금지 동작과 같습니다. (i)의 UX가 필요하면 `&active`로 명시합니다 | `false` 서브스키마가 노드를 만들지 않는다는 규칙 하나는 필요합니다(오늘은 생성 시 예외). `not` 에러는 호스트에 "must NOT be valid"로 떨어집니다. BE의 조건부 금지 스키마를 그대로 넣으면, 금지 조건에서 x가 보인 채 에러가 뜨고 사용자가 직접 지워야 합니다 | `crosscheck-claude-current.ts`, `crosscheck-claude-ajv.mjs` |

### (3) 권장안

**(iii)을 택하십시오. 폼은 금지 조각을 형상에 반영하지 않고 검증기에 맡기며, "`false` 서브스키마는 아무것도 선언하지 않는다"는 청사진 규칙 하나만 둡니다.**

이유는 세 가지입니다.

- (i)은 로드한 무효 레코드의 값을 사용자 행위 없이 지우는 경로를 새로 엽니다. 대칭 배타에서는 두 값을 모두 지웁니다.
- 그 UX가 필요한 작성자는 `&active`로 명시할 수 있습니다.
- (ii)가 (iii)보다 더 주는 것은 "`not` 에러를 x에 붙이는 것" 하나입니다. 이것은 에러 라우팅(Q12)으로 따로 얻을 수 있습니다. 반면 폼이 금지 조각을 읽는 부담은 (ii)에서도 그대로 남습니다.

### (4) 소유자가 함께 알아야 할 대가

- **소유자의 2라운드 방향을 뒤집습니다**("그래도 값 조작은 알아야 값을 처리할 수 있다"). 고칠 곳:
  - ADR 0002의 "금지하는 조각" 절 삭제
  - 규칙 5의 괄호 "(금지하는 조각이 끄지 않는 한)" 삭제
  - E5 (2)와 E8의 특칙 삭제
- **BE 스키마를 그대로 넣었을 때 조건부 금지 필드가 보인 채 에러를 띄웁니다.** G2의 "가공 없이 쓸 만한 폼"에서 품질이 떨어지는 지점입니다. 숨기려면 FE가 `&active`를 얹어야 합니다.
- **`properties: {x: false}`만으로 금지된 키를 가진 레코드는 폼 안에서 고칠 수 없습니다.** 그런 레코드를 로드하면 x는 extra(E16)로 보관되고 방출됩니다. 에러는 주인 없는 폼 수준 에러(C2)로 뜨고 저장은 막힙니다. 소비자가 로드 전에 걸러야 합니다.
- **`not` 에러의 메시지 "must NOT be valid"는 사용자에게 무의미합니다.** 에러 표시 규칙(Q12, `formatError`)에 다음을 둘 수 있습니다: "`schemaPath`가 `…/not`이고 대상이 단일 이름 `required`이면 그 자식에게 옮기고 '이 조건에서는 비워야 합니다'로 보인다." 이것은 형상 규칙이 아니라 표시 규칙입니다.

---

## D-4 — 쓰기 종류의 호출자 선언

### (1) 확인한 사실

**비트의 목록**

- 비트는 11개가 아니라 **10개(`BIT_FLAG_00`–`09`)와 `None`**입니다 [코드 `src/core/types/value.ts:26-47`]. 합성값은 9개입니다(`Default`, `BatchDefault`, `BatchedEmitChange`, `Reset`, `IsolateReset`, `StableReset`, `IsolateStableReset`, `Merge`, `Overwrite`) [코드 `:49-65`].
- 공개된 것은 `Merge`와 `Overwrite`뿐입니다 [코드 `value.ts:69-74`]. 패키지는 이를 `SetValueOption`이라는 이름으로 내보냅니다 [코드 `src/index.ts:45`]. 둘의 차이는 `Replace` 한 비트입니다 [코드 `value.ts:63-65`].
- 다만 노드 타입의 `setValue`는 `UnionSetValueOption`을 받습니다. 내부 비트가 타입 수준에서 새어 있습니다 [코드 `AbstractNode.ts:358`].

**비트를 읽는 곳** (OB = ObjectNode `strategies/BranchStrategy/BranchStrategy.ts`, OT·AB·AT = ObjectNode Terminal·ArrayNode Branch·ArrayNode Terminal 전략, AN = `AbstractNode.ts`)

| 비트 | 읽는 곳과 하는 일 | 성격 |
| ---- | ----------------- | ---- |
| Replace | OB:161·229-231·285 — object 분기에서 병합 대 교체를 가릅니다(교체면 V에 없는 자식이 `undefined`). OT·AT·리프에서는 "같은 값이면 무시"를 끄는 것뿐입니다. AB는 읽지 않고 항상 재구성합니다 | 의미 + 기계 |
| EmitChange | 부모 `onChange` 호출 (OB:190 외 7곳) | 라이프사이클 |
| Propagate | OB:196 → `__propagate__` :263-297 | 라이프사이클 |
| Refresh | `RequestRefresh` 발행 (OB:198 외 8곳) | 렌더러 명령 |
| Batch | 부모의 커밋을 미룹니다 (OB:181·193 외) | 라이프사이클 |
| Isolate | UpdateValue를 미정착으로 표시하고 조건 필터링을 켭니다 (OB:163·205-206·331) | 라이프사이클 |
| Normalize | 미선언 키를 제거합니다 (OB:162 → :247, OT:50 → :90). `StableReset` 계열에서만 설정됩니다 | 의미 |
| PublishUpdateEvent | UpdateValue 발행 (OB:201 외 8곳) | 라이프사이클 |
| PreventInjection | UpdateValue의 `inject` 옵션을 끕니다. 그러면 AN:971-975가 `RequestInjection`을 내지 않습니다. Reset 계열과 `minItems` 채우기에서 설정됩니다 | 의미 |
| Automatic | 폼이 스스로 쓴 값이라는 출처 표시입니다. null 부모가 객체가 되지 않습니다 (AN:1117, OB:808-813) | 의미 |

(비트별 전체 위치는 에이전트 보고와 같고, 위 대표 위치는 직접 확인했습니다 [코드].)

**기본값**

- `node.setValue(v)`의 기본은 `Overwrite`입니다 [코드 `AbstractNode.ts:358`]. `FormHandle.setValue`도 그대로 넘깁니다 [코드 `src/components/Form/Form.tsx:155`]. 문서도 "Overwrite (default)"입니다 [기록 `docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:18`].
- 실행 결과 [실행 `crosscheck-claude-d4-write-kinds.ts`]:
  - `{a:1, b:2}`에 `setValue({a:9})`: 옵션 없음과 Overwrite는 `{a:9}`, Merge는 `{a:9, b:2}`입니다.
  - 선언되지 않은 키 x는 Overwrite에서 사라지고 Merge에서 남습니다.
  - 배열은 모든 옵션에서 결과가 같습니다(AB는 항상 재구성, AB:322-348).
  - 터미널 object도 모든 옵션에서 통째로 받습니다.

**리프 입력**

- 입력의 기본 옵션은 `HANDLE_CHANGE_OPTION = Replace | Propagate | EmitChange | PublishUpdateEvent`입니다 [코드 `src/components/SchemaNode/SchemaNodeInput/type.ts:33-37`]. Refresh가 없으므로 타이핑 중에 리마운트가 없습니다.
- 리프의 쓰기는 부모 draft의 한 키만 바꾸고 `Default`로 커밋합니다 [코드 OB:827-837]. 즉 **구조상 부모에 대한 부분 쓰기**입니다 [실행 §6: `/a` 쓰기 → `{a:9, b:2}`].
- 반면 branch object에 `formTypeInputMap`으로 붙인 입력이 `onChange({test:'wow'})`를 하면, HCO의 `Replace` 때문에 형제가 지워집니다 [실행 §1 HCO 행].

**Refresh**

- 소비 측은 입력의 `key`를 올려 리마운트합니다 [코드 `useFormTypeInputControl.ts:36-37`]. `RequestRefresh`는 공개 이벤트가 아닙니다 [코드 `event.ts:83-96`].
- 공개 preset 둘이 모두 Refresh를 포함합니다. 그래서 오늘 호출자는 Refresh를 따로 고를 수 없습니다 [코드 `value.ts:63-65`].
- 강제 리마운트의 탈출구는 이미 있습니다. 공개 `RequestRemount`입니다 [코드 `event.ts:94-95`].
- ADR 0007의 미결 제안이 있습니다: "커밋된 원본이 그 입력이 방금 보고한 값과 다른 노드에만 `RequestRefresh`" [기록 `adr/0007` §미결].

**의미 비트 셋의 새 설계에서의 처지**

- `Normalize`: 목적(extra 제거)이 E16(extra 보존)으로 사라집니다. 오늘 `resetSubtree()`는 로드한 extra를 지웁니다 [실행 §3]. 새 설계의 reset(생성 시 V의 재적용)은 extra를 되살립니다.
- `PreventInjection`: 오늘 reset은 `injectTo`를 돌리지 않습니다. 생성 결과는 `{a:1, b:10}`, `resetSubtree` 결과는 `{a:1}`입니다 [실행 §7]. 새 설계의 기록은 reset이 `injectTo`를 일으키는지 정하지 않았습니다 [기록 — 미정].
- `Automatic`: 오늘 사용자가 일으킨 `injectTo`는 출처를 물려받아 null 조상을 객체로 만듭니다 [코드 AN:965, 기록 `docs/en/SPECIFICATION.md:1048`]. E19는 `injectTo`를 core의 자동 쓰기로 분류하고, E9는 자동 쓰기가 null 조상을 객체로 만들지 않는다고 합니다. 두 규칙이 충돌합니다 [기록 `round-3.md` §6].

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| 셋 유지 (`Overwrite`/`Merge`/`Refresh`) | 원문 D-4 그대로입니다. 호출자가 리마운트를 직접 통제합니다 | Refresh는 오늘도 독립적으로 고를 수 없는 비트입니다. ADR 0007의 규칙과 두 곳에서 판단하게 됩니다 | `value.ts:63-65`, ADR 0007 §미결 |
| **둘 유지 (`Overwrite`/`Merge`), Refresh는 core가 판단** | 공개 API가 오늘과 같습니다(공개된 것이 이 둘뿐입니다). 호출자가 틀릴 수 있는 선택이 줄어듭니다. 강제 리마운트는 공개 `RequestRemount`로 가능합니다 | core가 "입력이 방금 보고한 값"을 알아야 합니다(쓰기에 출처 표시). 파서의 강제 변환이 core에 남으면 타이핑 중 리마운트가 납니다 | `event.ts:94-95`, `round-2.md` §6 |
| 현행 10비트 유지 | 이주 비용이 없습니다 | 라이프사이클 비트 다섯이 작업 루프(ADR 0007)와 양립하지 않습니다. 내부 비트가 타입으로 샙니다 | `AbstractNode.ts:358` |
| 기본값 Overwrite | 오늘의 기본과 문서가 같습니다. D-1 권장안(null도 전체 교체)과 짝을 이뤄, `setValue(recordB)` 하나로 레코드 A의 흔적(비활성 조각과 중첩 null 아래 포함)이 지워집니다 | 부분 갱신을 원하는 호출자는 Merge를 명시해야 합니다(오늘과 같음) | `AbstractNode.ts:358` |
| 기본값 Merge | 실수로 형제를 지우는 일이 없습니다 | 레코드 A 뒤에 `setValue(B)`를 하면 B에 없는 A의 키가 남습니다(D-1의 누출과 같은 모양). 오늘의 기본과 반대라 조용한 동작 변화입니다 | codex의 반례(`round-2.md` §6) |

### (3) 권장안

**호출자가 고르는 공개 옵션은 `Overwrite`(기본)와 `Merge` 둘로 하고, `Refresh`는 호출자 비트가 아니라 ADR 0007의 규칙으로 core가 정하며, 나머지 여덟 비트는 모두 제거하십시오.**

이유는 네 가지입니다.

- 오늘도 공개된 것은 이 둘뿐이고, Refresh는 독립적으로 고를 수 없는 비트였습니다.
- 라이프사이클 비트 다섯은 작업 루프가 대체합니다.
- `Normalize`·`Automatic`·`PreventInjection`의 일은 새 설계의 규칙(E16, E9/E19, E15)이 맡습니다.
- 기본값을 Overwrite로 두면 D-1 권장안(null도 전체 교체)과 짝을 이뤄, 레코드 전환이 기본 API 하나로 이전 레코드의 흔적을 지웁니다.

리프 입력은 구조상 부모에 대한 부분 쓰기이므로, 리프에서는 두 종류가 같습니다.

### (4) 소유자가 함께 알아야 할 대가

- **입력 컴포넌트의 `onChange(value, option)`에서 두 번째 인자는 object·array 입력에서만 의미가 남습니다.** 입력 컴포넌트 계약이 바뀝니다(C7).
- **branch object에 붙인 입력의 `onChange(obj)` 기본을 명시해야 합니다.** 오늘은 형제를 지우는 교체입니다. 권장은 "입력이 넘긴 값은 그 노드 전체에 대한 Overwrite"(오늘과 같음)이고, 부분 쓰기는 입력 작성자가 Merge로 명시합니다.
- **배열의 Merge는 오늘 Overwrite와 같습니다.** 새 설계에서 배열 Merge의 뜻(인덱스별 패치인지)은 R13(identity)과 함께 미정입니다. 그때까지 "배열에서 Merge ≡ Overwrite"로 문서화합니다.
- **`PreventInjection`을 없애면 reset이 `injectTo`를 일으킵니다.** "reset = 생성 상태의 재현"(E15)과는 일관되지만 오늘의 동작과 다릅니다.
- **`Automatic`을 호출자 비트에서 없애면 E9와 E19의 충돌을 먼저 정해야 합니다.** 쟁점은 "사용자가 일으킨 `injectTo`가 null 조상을 객체로 만드는가"입니다. 오늘은 만듭니다.
- **Refresh를 core가 판단하려면 쓰기에 "어느 입력이 보고했는가"를 실어야 합니다.** 그리고 파서의 강제 변환(`parseNumber`의 절삭 등)을 입력 컴포넌트로 옮기는 것(`round-2.md` §6)이 전제입니다.
- `SchemaNode.setValue`의 타입에서 내부 비트를 걷어냅니다(C4).

---

## D-5 — 로드 시 default 주입 옵션

### (1) 확인한 사실

**현재의 주입 경로**

- Form의 `defaultValue`는 복제되고 [코드 `Form.tsx:94`] `nodeFromJSONSchema`로 갑니다 [코드 `src/core/nodeFromJSONSchema.ts:44-55`].
- 각 노드의 생성자는 `__setDefaultValue__(defaultValue !== undefined ? defaultValue : getDefaultValue(jsonSchema))`를 부릅니다 [코드 `AbstractNode.ts:1197-1199`]. `getDefaultValue`는 `schema.default`, virtual이면 `[]`, 그 밖에는 타입별 빈 값을 돌려줍니다 [코드 `src/helpers/defaultValue/getDefaultValue/getDefaultValue.ts:19-23`].
- branch object의 자식은 `inputDefault !== undefined ? inputDefault : schema.default`를 받습니다 [코드 `getChildNodeMap.ts:69-70`]. oneOf 분기도 같습니다 [코드 `getCompositionNodeMapList.ts:115-116`].
- 따라서 **현재도 "없는 키(또는 명시적 `undefined`)에만 default"**입니다. `''`·`null`·`0`·`false`·`{}`는 그대로 둡니다.
- 터미널 object 경로는 다릅니다. `getObjectDefaultValue`는 `preserveNull: false`로 **있는 `null`을 default 객체로 바꾸고** 입력 객체를 제자리에서 고칩니다 [코드 `getObjectDefaultValue.ts:20,33-36`, 테스트 `getObjectDefaultValue.test.ts:157`, 실행 `crosscheck-claude-d5-load-defaults.ts`].

**빈 폼과 로드의 구분**

- 현재 코드에는 **없습니다.** `defaultValue` 검사는 모두 노드 단위입니다(`AbstractNode.ts:1198`, `getChildNodeMap.ts:70`, `ArrayNode.ts:196-198` 등) [코드].
- 그래서 로드한 레코드에서 빠진 배열 키도 빈 폼처럼 `minItems`까지 채워집니다 [테스트 `src/__tests__/scenarios/default-value.render.test.tsx:417`].

**dirty와 touched**

- dirty는 비교로 계산하지 않고 UI의 입력이 세웁니다: `handleChange` 안에서만 설정됩니다 [코드 `SchemaNodeInput.tsx:55-56`].
- touched는 blur 뒤 `requestAnimationFrame`에서 설정됩니다 [코드 `:81-85`].
- 실행: 로드 `{b:'x'}` 뒤 a에는 default `'A'`가 들어가지만, a와 루트의 state는 `{}`입니다. **로드 시 주입은 dirty를 만들지 않습니다** [실행].
- antigravity의 "sparse 레코드 로드에서 default 주입만으로 dirty"는 폼의 dirty가 아닙니다. 앱이 로드한 V와 `getValue()`를 비교하는 경우에 대한 주장입니다 [기록 `raw-antigravity3-boundary.md` §3 127행].
- 그 비교는 오늘도 어긋납니다 [실행]:
  - 로드 `{b:'x'}` → `getValue()` `{a:'A', b:'x'}`
  - 로드 `{a:'', b:'x'}` → `{b:'x'}` (`omitEmpty` 기본 true)
  - 생성 시 루트 `onChange`는 만든 값이 V와 다를 때만 불립니다. Form은 준비될 때 한 번 더 방출합니다 [코드 `Form.tsx:135-139`].

**이름의 톤**

- `omitEmpty`(기본 true, [코드 `src/types/jsonSchema.ts:266`])와 `omitTrailing`(기본 false, [코드 `:173,182`])은 Form prop이 아니라 **스키마의 `options` 키**입니다. 모양은 동사 + 대상입니다.
- Form prop의 불리언은 `readOnly`, `disabled`이고, 동사 + 대상 모양으로는 `showError`가 있습니다 [코드 `src/components/Form/type.ts:44-105`].
- default를 보존하거나 무시하는 기존 옵션은 없습니다 [코드 grep].

**현재 동작을 고정한 테스트**

- 부분 `defaultValue`에 중첩 default를 채웁니다 [테스트 `src/core/__tests__/BranchStrategy.composition.defaultValue.test.ts:40`].
- 빠진 배열을 `minItems`까지 채웁니다 [테스트 `default-value.render.test.tsx:417`].
- nullable object에 로드한 `null`을 보존합니다 [테스트 `nullable.object-initial-null.render.test.tsx:45,107`].

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| **계약 "없는 키에만 default" + 끄는 옵션 하나** (E16) | 빈 폼과 로드가 같은 규칙을 탑니다. 현재 branch 경로와 같아 대부분의 사용자에게 동작 변화가 없습니다. 왕복 보존이 필요한 소비자(PUT, 앱의 V 비교)는 옵션으로 해결합니다 | 옵션이 켜지면 처음으로 "빈 폼 대 로드"의 구분이 생깁니다. 로드 커밋에서 V가 켠 조각의 전이 주입(E1 (2))도 같은 옵션이 막아야 합니다 | `getChildNodeMap.ts:69-70`, 실행 |
| 계약만, 옵션 없음 (C2 원안) | 규칙이 하나입니다 | 앱의 V 비교가 로드 직후 어긋납니다. 스키마에 default가 있는 새 필드가 손대지 않은 저장에서 레코드에 기록됩니다 | antigravity §3 |
| 로드 시 미주입을 기본으로 (2라운드 codex 권고) | 로드 → 저장에서 키가 늘지 않습니다 | 빈 폼과 로드가 다른 규칙을 탑니다. 현재 동작과 반대여서 조용한 동작 변화이고 위 테스트들이 뒤집힙니다 | `round-3.md` §4 D-5 |
| 이름 `preserveDefaultValue` | 소유자의 발언("최초 주입된 defaultValue를 … 바꾸지 않는 옵션")과 대응합니다 | 약속이 뜻보다 넓습니다. 옵션을 켜도 `getValue()`는 V와 같지 않습니다(`omitEmpty`가 `''`를 빼고, 비활성 조각의 키가 빠집니다) | 실행 `{a:''}` → `{}` |
| 이름 `fillDefaults` (기본 `true`) | 뜻과 이름이 같습니다. `omitEmpty: false`, `showError`와 같은 동사 + 대상 모양입니다 | 새 이름이라 소유자의 발언과 직접 대응하지 않습니다 | `jsonSchema.ts:266`, `Form/type.ts` |
| 이름 `injectDefaults` | 기록의 용어("default 주입")와 같습니다 | FE 키워드 `injectTo`와 혼동됩니다 | — |

### (3) 권장안

**기본 계약은 "로드한 값에 없는 키에만 `default`"로 두고, 끄는 옵션은 Form prop 하나로 두되 이름을 `preserveDefaultValue` 대신 `fillDefaults`(기본 `true`) 같은 좁은 이름으로 하십시오.**

이유는 두 가지입니다.

- 현재 branch 경로가 이미 이 계약이라 기본 동작이 바뀌지 않습니다.
- 새 설계에서 `getValue()`는 옵션을 켜도 V와 같지 않습니다. "preserve"는 지킬 수 없는 약속입니다.

### (4) 소유자가 함께 알아야 할 대가

- **"로드"를 정의해야 합니다.** 생성 시 `defaultValue !== undefined`, `reset()`, `setValue(V, Overwrite)`(E15의 전체 교체)를 모두 로드로 봐야 합니다. 그렇지 않으면 레코드 B를 `setValue`로 로드할 때만 default가 들어갑니다. 로드 커밋을 E1 (2) 전이의 기준선으로 삼아, V가 켠 조각의 자식에도 주입하지 않아야 합니다.
- **새 레코드 폼에 `defaultValue={}`를 주는 소비자는 옵션을 켜면 default를 하나도 받지 못합니다.** 문서에 "새 레코드 폼에는 `defaultValue`를 주지 않는다"고 적어야 합니다.
- **터미널 object의 null 치환이 사라집니다**(`getObjectDefaultValue.test.ts:157`). 새 계약과 어긋나므로 동작이 바뀝니다. 입력 객체를 제자리에서 고치는 것도 없어집니다.
- **옵션은 폼의 dirty·touched에 영향이 없습니다**(UI가 세우므로). 영향은 앱의 V 비교, 생성 시 `onChange`의 호출 여부, 저장되는 키 집합에 한정됩니다. 이 점을 옵션 설명에 적어야 소비자가 dirty 문제로 오해하지 않습니다.

---

## D-6 — `virtual`의 자리

### (1) 확인한 사실

**core에 얽힌 자리** [코드]

- 선언 검사와 역색인: `.../getVirtualReferencesMap/getVirtualReferencesMap.ts:24-75`. 호스트 자신의 `virtual`만 읽습니다(`BranchStrategy.ts:853-854`).
- 그룹 노드의 생성과 배치: `.../getChildren/getChildren.ts:44-76`. `onChange`는 NOOP이고(`:65`) `required`를 넘기지 않습니다(`:57-69`).
- 구성 필드에 `virtual` 플래그를 달고, 그룹의 active를 구성 필드에 병합합니다: `getChildNodeMap.ts:53-64,81-96`.
- 팩터리의 `case 'virtual'`: `schemaNodeFactory.ts:111-114`.
- 값 미러: 참조 노드의 `UpdateValue` **이벤트를 구독해** 튜플을 갱신합니다 (`VirtualNode.ts:116-131`, 직접 확인).
- 부채질 쓰기와 길이 검사: `VirtualNode.ts:39-88`.
- 경로 조회: `findNode.ts:68-86`.

**기록의 정정**

- `BranchStrategy.ts:279,353,703`은 각각 부모 쓰기의 하향 전파(`__propagate__`), `resetToBlank`, 비활성 자식의 값 제거에서 virtual을 건너뜁니다 [코드, `:279` 직접 확인]. 기록의 "값·required·omitEmpty 계산"과 다릅니다.
- 그룹이 부모 값에 기여하지 않는 이유는 `onChange`가 NOOP이기 때문입니다 [코드 `getChildren.ts:65`].

**required 펼치기는 React에서만 일어납니다**

- 펼치기는 React `<Form>`의 전처리에서만 일어납니다 [코드 `Form.tsx:91` `preprocessSchema`]. `nodeFromJSONSchema`는 전처리하지 않습니다 [코드 `nodeFromJSONSchema.ts:34-56`].
- [추론] core만 쓰는 소비자에게 `required: ['period']`는 펼쳐지지 않은 채 검증기에 가서 항상 실패합니다.
- `virtual`·`virtualRequired` 키는 지워지지 않고 검증기에 갑니다 [코드 `stripSchemaExtensions.ts:43-51`].

**값 미러가 ADR 0007과 충돌합니다**

- 값 미러는 이벤트 구독으로 상태를 바꿉니다(`VirtualNode.ts:118-131`). ADR 0007의 원칙 "이벤트는 출력 전용이다. 어떤 내부 로직도 이벤트를 구독해서 상태를 바꾸지 않는다"와 충돌합니다 [기록 `adr/0007` §원칙].
- 그래서 **(c) 현행 유지를 택해도 내부 구현은 바뀌어야 합니다.**

**테스트의 수** [테스트]

| 파일 | 수 |
| ---- | -- |
| `src/__tests__/scenarios/virtual.render.test.tsx` | 12 |
| `src/core/__tests__/VirtualNode.test.ts` | 10 (기록의 16에는 `refresh behavior`의 4개만 들어 있습니다) |
| `src/helpers/jsonSchema/preprocessSchema/utils/__tests__/processVirtualSchema.test.ts` | 15 |
| `src/helpers/jsonSchema/__tests__/preprocessSchema.virtaul.test.ts` | 10 |

이 밖에 `flattenConditions.test.ts`의 `virtualRequired` 병합 8개가 있습니다(`:542` 등).

**생존 수** (U = 그대로, S = 문법 교체만, R = 바인딩 테스트로 재작성, D = 소멸)

| 범위 | (a) | (b) | (c) |
| ---- | --- | --- | --- |
| 기록의 16개 | S 16 (그 가운데 7개는 그룹이 파생 튜플 `.value`를 노출할 때만) | R 9, S 1, D 6 | U 16 |
| virtual 전용 4파일 47개 | U 1, S 22, D 24 | U 1, S 1, R 11, D 34 | U 47 |

- (b)에서 소멸하는 6개는 그룹 `setValue`의 부채질과 그룹의 `RequestRefresh`를 고정한 것입니다: render `:165`, `:184`, `VirtualNode.test.ts:247`, `:281`, `:315`, `:355`.
- (a)에서 소멸하는 24개는 모두 required 펼치기를 고정한 것입니다: `processVirtualSchema` 15개, `preprocessSchema.virtaul` 9개.

**다른 렌더러로의 이식** [코드 대응, 추론]

- (a)에서 Vue 바인딩이 새로 써야 하는 것은 둘입니다.
  - 플래그가 달린 자식을 건너뛰는 한 줄(React에서는 `useChildNodeComponents.tsx:61`)
  - 기본 그룹 렌더러(React로 약 12줄, `FormTypeInputVirtual.tsx:10-21`)
- (b)에서는 바인딩마다 다음을 다시 구현해야 합니다.
  1. 선언 검사
  2. 배치 순서
  3. 구성 필드 건너뛰기
  4. 튜플 파생과 기본 튜플
  5. 부채질과 길이 검사
  6. 그룹 refresh
  7. 그룹 활성(구성 필드마다 `&active`를 반복)
  8. 터미널 전환
  9. 경로 조회
- 오늘의 공통 장애물은 `getNodeGroup.ts:2,22-29`의 `isReactComponent`입니다. Vue 컴포넌트 객체는 감지되지 않습니다 [추론]. C3이 이미 "있고 null이 아니다"로 바꾸기로 제안했습니다 [기록 `00-goals.md` C3 세부 2].

**미확인 결함 후보** [추론, 미실행]

- object에 `oneOf`/`anyOf` 분기가 활성이면 `children`을 다시 만들 때 그룹이 빠질 수 있습니다(`BranchStrategy.ts:597-611`). 그러면 구성 필드는 `virtual: true`로 남아 어디에도 렌더되지 않을 수 있습니다.
- `oneOf` 분기 안의 `virtual`은 required만 펼쳐지고 노드는 생기지 않습니다(`getCompositionNodeMapList`에 처리가 없습니다).

### (2) 옵션별 비교

| 옵션 | 이익 | 손해 | 근거 |
| ---- | ---- | ---- | ---- |
| **(a) `&` 계열 + 참조 그룹 노드 종류** | 표준 `required`에서 가상 이름이 사라져 ADR 0001 충돌과 React 전용 전처리의 불일치가 함께 없어집니다. 기록의 16개가 모두 문법 교체로 살아남습니다. 렌더러 독립 로직(튜플, 부채질, 그룹 활성)이 core에 남아 바인딩이 얇습니다 | 노드 종류가 하나 늘어납니다(ADR 0011 표의 셋째 행). 그룹의 파생 튜플을 계산 단계에서 만들어야 합니다. 스키마 문법이 바뀝니다. required 펼치기 테스트 24개(+ `flattenConditions` 8개)가 사라집니다 | 위 표, `VirtualNode.ts:116-131` |
| (b) 렌더 계층으로 완전히 이동 | core가 가장 작아집니다. core가 virtual을 모릅니다 | 바인딩마다 아홉 가지 책임을 다시 구현합니다(C3의 이식 목표에 불리합니다). `node.find('/period')`, `setValue` 부채질, 그룹 `RequestRefresh`가 사라집니다. 16개 가운데 6개가 소멸하고 9개를 다시 씁니다 | 위 표 |
| (c) 현행 유지 | 테스트 47개가 모두 그대로입니다 | ADR 0001 위반(`required`에 가상 이름)이 남습니다. core만 쓰는 경로에서 required가 항상 실패합니다 [추론]. 값 미러의 이벤트 구독은 ADR 0007 때문에 어차피 다시 써야 합니다 | `Form.tsx:91`, `VirtualNode.ts:118-131` |

### (3) 권장안

**(a)를 택하십시오. `&virtual`(이름은 ADR 0003과 함께 정합니다)로 옮기고, core에 값을 소유하지 않는 "참조 그룹" 노드 종류를 두되, 그룹의 튜플 `value`는 계산 단계에서 형제의 값으로부터 파생하는 읽기 전용 값으로 두십시오.**

이유는 세 가지입니다.

- 표준 `required`에서 가상 이름을 없애 ADR 0001 충돌과 React 전용 전처리의 불일치를 함께 없앱니다.
- 기록의 16개 테스트가 모두 문법 교체로 살아남습니다.
- 렌더러마다 아홉 가지 책임을 다시 구현하게 하는 (b)보다 C3(다른 렌더러 이식)에 유리합니다.

### (4) 소유자가 함께 알아야 할 대가

- **`round-3.md` §5 (a)의 "raw·local·emit 없음"을 고쳐야 합니다.** 그룹은 raw가 없되 파생 `value`(읽기 전용 튜플)는 있어야 합니다. 이 튜플은 이벤트 구독이 아니라 계산 단계에서 만듭니다(ADR 0007). 그룹의 `UpdateValue` 통지가 필요한 테스트(`VirtualNode.test.ts:128`)는 루트 디스패처가 그룹의 튜플 참조가 바뀐 커밋에 통지하는 것으로 살립니다.
- **스키마 문법이 바뀝니다.** `virtual`은 `&virtual`이 되고, `required`의 가상 이름은 실제 필드로 풀어 써야 합니다. 이주 프롬프트(C8)의 항목입니다.
- **경로를 정리해야 합니다.** 오늘은 그룹의 `subnodes`가 참조 노드여서 `find('/period/startDate')`가 실제 노드로 별칭되고, 경로 갱신이 참조 노드를 두 번 방문합니다 [코드 `AbstractNode.ts:143-145`, 추론]. 참조 그룹은 자식을 소유하지 않으므로 경로 조회에서 이 별칭을 둘지 정해야 합니다.
- **그룹의 `&active`를 구성 필드에 병합하는 오늘의 동작을 유지할지 정해야 합니다.** 유지하면 그룹 비활성화는 곧 구성 필드의 방출 제외입니다(render `:264`, `:280`이 이것을 고정합니다).
- **`oneOf` 분기 안의 `virtual`을 지원할지 정해야 합니다.** 오늘도 노드가 생기지 않습니다.

---

## 요약

- **D-1**: S4를 폐기하지 않습니다. null·비객체도 C1·C2가 똑같이 적용되는 전체 교체 값으로 다루고(E9의 예외 삭제), 특수 장치 없이 "null이면 자식 raw를 지우고 default로 다시 채운다"를 얻습니다. 폐기안은 중첩 null을 가진 레코드 B를 루트 Overwrite로 로드해도 A의 값이 새어 레코드 사이에 데이터가 섞입니다.
- **D-2**: 옵션 B를 택하고, 상한 초과는 호스트의 `settle` 칸과 상태가 바뀐 커밋의 루트 통지로 프로덕션에서도 남기며(검증 에러에는 섞지 않음), 자기 부정 스키마는 지원 범위 밖으로 둡니다. 현재 구현이 같은 스키마에서 `INFINITE_LOOP_DETECTED`라는 기록은 틀렸습니다.
- **D-3**: (iii) — 금지 조각은 검증기에만 맡기고 `false` 서브스키마는 아무것도 선언하지 않는다는 규칙 하나만 둡니다. (i)은 대칭 배타 레코드의 두 값을 조용히 지웁니다. 숨김이 필요하면 `&active`로 명시합니다.
- **D-4**: 공개 쓰기 종류는 `Overwrite`(기본)와 `Merge` 둘입니다. `Refresh`는 ADR 0007 규칙으로 core가 정하고, 나머지 여덟 비트는 제거합니다(비트는 10개입니다).
- **D-5**: "없는 키에만 default"를 기본 계약으로 둡니다(현재 branch 경로와 같습니다). 끄는 옵션은 Form prop 하나로 두되 이름은 `fillDefaults`처럼 좁게 짓습니다. 폼의 dirty에는 영향이 없습니다. (수렴 라운드에서 이름을 `skipDefaultsOnLoad`로 고쳤습니다.)
- **D-6**: (a) — `&virtual`과 값 없는 참조 그룹 노드 종류를 두되, 튜플 `value`는 계산 단계의 읽기 전용 파생 값으로 둡니다. 기록의 16개 테스트가 문법 교체로 모두 살아남습니다.

---

## 재현

```
cd packages/canard/schema-form
# ajv (D-2·D-3)
node architecture/reviews/crosscheck-claude-ajv.mjs
# 3차안 프로토타입의 금지 조각 (D-3)
node architecture/reviews/crosscheck-claude-d3-mutex.mjs
# 현재 구현 — 경우마다 새 프로세스
VN="node /Users/Vincent/Workspace/albatrion/node_modules/.bin/vite-node --config architecture/spikes/work-loop/vite.spike.config.mjs"
$VN architecture/reviews/crosscheck-claude-current.ts <case>
#   case: selfneg-undeclared selfneg-declared selfneg-active mutual-active derived-cycle
#         false-property false-property-declared-elsewhere not-required ban-false ban-not-required ban-then-required
$VN architecture/reviews/crosscheck-claude-d4-write-kinds.ts
$VN architecture/reviews/crosscheck-claude-d4-propagate.ts
$VN architecture/reviews/crosscheck-claude-d5-load-defaults.ts
# D-1 — 3차안 프로토타입의 누출 경로
node architecture/reviews/crosscheck-claude-d1-proto.mjs
```

D-1의 테스트 실험과 `crosscheck-claude-d1-library.mjs`는 `src`의 복사본에서만 돕니다(제품 코드를 제자리에서 고치지 않기 위해서입니다).

1. `src`를 `.crosscheck-d1/src`로 복사합니다.
2. D-1 (1)의 패치를 복사본의 `ObjectNode/strategies/BranchStrategy/BranchStrategy.ts`에 적용합니다.
3. `@/schema-form`을 복사본으로 가리키는 vitest 설정에서 `D1_VARIANT=P1|P2`로 돌립니다. 탐침은 복사본의 `src/__crosscheck__/*.test.mjs`로 옮겨 돌립니다(파일 머리의 주석).

## 남은 정리

- `packages/canard/schema-form/.crosscheck-d1/`(추적되지 않는 `src` 복사본, vitest 설정, JSON 보고서)을 권한 설정 때문에 지우지 못했습니다. 확인이 끝나면 `rm -rf packages/canard/schema-form/.crosscheck-d1`로 지워 주십시오. `src/`는 바뀌지 않았습니다(`git status`로 확인).
- 같은 디렉터리의 `crosscheck-decisions-ajv.mjs`, `crosscheck-decisions-current.ts`, `crosscheck-decisions-evidence.md`는 이 교차검증이 만든 것이 아닙니다.

---

## 수렴 라운드

antigravity의 주장은 이 라운드에 전달된 요약으로만 읽었습니다. 이번에 새로 돌린 것:

- `crosscheck-claude-current.ts`의 `ban-false-undeclared-load`, `ban-false-undeclared-switch`
- `crosscheck-claude-ajv.mjs`의 "then-only false", "additionalProperties:false extra"

### D-1 — 방어

- **(1) "세 상태를 한 칸에 담을 수 없으니 폐기가 필수다"** — 전제가 반대입니다.
  - 세 상태를 동시에 들어야 하는 것은 현재 #338 구현뿐입니다. 이 구현은 null 동안 옛 값을 보존하면서 blank를 보이고 나중에 되살리기 때문에 `__blank__`·`__restoreValue__`·`__initialValue__`를 둡니다.
  - 균일 적용에서는 null이 옛 raw를 지우므로 보존할 것이 없습니다. blank는 저장값이 아니라 그 쓰기에서 로드 계약이 넣는 default입니다. 초기값은 `reset()`용으로 루트가 드는 생성 시 V 하나입니다.
  - 그래서 노드당 칸은 raw 하나로, 폐기안과 같습니다.
- **(3) E1의 순수 함수** — 유지됩니다.
  - E1이 순수하다고 한 것은 계산이 (schema, 현재 raw, selection)만 **읽는다**는 뜻입니다. raw를 보존한다는 뜻이 아닙니다. E1은 "raw 자체는 사용자 쓰기의 이력을 담는다"고 스스로 적었습니다.
  - null로의 전체 교체가 자식 raw를 지우고 default를 넣는 것은 표시 단계의 쓰기이고, 계산은 그 결과를 읽기만 합니다. C1이 객체 V에 없는 키를 지워도 순수성이 깨지지 않는 것과 같습니다.
  - 따라서 (3)은 두 안을 가르지 못합니다.
- **(2) 실수로 누른 null의 유실** — 대가로 인정합니다(#338과 같습니다).
  - 다만 core는 "실수로 누른 null 토글"과 "null을 가진 레코드 B의 로드"를 구별하지 못합니다. 둘 다 `setValue(null)`입니다. 폐기안에서 실수를 구해 주는 장치가 곧 다른 레코드의 값을 되살리는 장치입니다.
  - 되돌리기는 자신이 토글임을 아는 입력 컴포넌트가 맡는 것이 맞습니다. 직전 객체를 기억해 두었다가 Overwrite로 되쓰면 됩니다.
- **(4) 이주 가이드로 강제한다** — 실행으로 반박되었습니다(D-1 (1)의 L2). 중첩 null에서는 루트 Overwrite도 막지 못하므로 가이드가 강제할 수단이 없습니다.
- **소유자께 — ADR 0006 결정 5를 고쳐야 하는 이유.** 결정 5는 성격이 다른 두 사건을 한 문장에 묶었습니다. 비활성화는 폼이 스스로 일으키는 형상 변화입니다. 다른 필드를 입력하다 조각이 잠깐 꺼져도 사용자는 지우라고 한 적이 없으니 원본을 남기는 것이 옳습니다. null은 호출자가 쓴 값, 곧 "이 객체는 없다"는 명령입니다. 그 뒤에도 옛 자식을 들고 있으면, 폼은 현재 값이 "없다"고 말하는 데이터를 숨겨 두었다가 다음 키 입력 한 번에 되살립니다. 그 데이터는 다른 레코드의 것일 수도 있습니다. C1은 이미 "전체 교체는 V에 없는 원본을 지운다"이고, null은 키가 하나도 없는 V입니다. 그래서 결정 5를 그대로 두면 C1에 null 예외를 새로 만들어야 합니다(codex가 짚은 A6·C1 모순). 고친 문장은 "비활성 노드는 원본을 유지한다. null을 포함한 전체 교체는 V에 없는 원본을 지운다"입니다.

### D-3 — 방어 (다만 제 (4)의 한 줄은 고칩니다)

- **질문에 대한 답: 노드는 없습니다.** (iii)에서 `then` 안에서만 `false`인 x는 "`false`는 아무것도 선언하지 않는다"는 규칙 때문에 노드가 없고, extra(E16)로 보관·방출됩니다. 현재 구현이 바로 이렇게 동작합니다 [실행 `ban-false-undeclared-load`].
  - 로드 `{mode:'ban', x:'secret'}`: 노드 x가 없고, 값에 x가 남습니다. `/x false schema`는 `globalErrors`에만 있고 어느 노드에도 붙지 않습니다.
  - 더 나쁘게는, 유효한 `{mode:'ok', x:'secret'}`에서 사용자가 mode를 ban으로 바꾸는 것만으로 같은 상태가 됩니다 [실행 `ban-false-undeclared-switch`].
  - 이 하위 경우에는 antigravity의 "고칠 수 없는 에러로 제출이 막힌다"가 맞습니다. 사용자 행위로도 생기므로, 제 (4)의 "소비자가 로드 전에 걸러야 한다"는 불충분했습니다. 이 한 줄을 고칩니다.
- **그래도 (i)로 가지 않는 이유 1 — 금지 조각만의 문제가 아닙니다.**
  - `additionalProperties: false`에 extra가 있어도 에러가 `/ additionalProperties`로 호스트에 가고, 고칠 입력이 없습니다 [실행 ajv].
  - (i)은 이 부류를 풀지 못합니다. 풀려면 폐기한 `Normalize`가 돌아와야 합니다.
  - 그러므로 일반 규칙이 어차피 필요합니다: **검증기가 기각한 extra 키는 폼 수준 에러(C2)로 이름과 값을 보이고, 그 키를 지우는 Merge 쓰기인 "삭제" 동작을 붙입니다.** 이 규칙이 있으면 (iii)의 노드 없는 경우도 고칠 수 있는 에러가 됩니다.
- **이유 2 — "어느 필드인지 모른다"는 좁은 경우에만 맞습니다.** 본체에 선언된 x는 에러가 `/x`로 그 필드에 붙고, 비우면 풀립니다(현재 구현 `ban-false`에서 `x.errors`에 붙었습니다). 위치를 모르는 것은 `not`뿐이고, 단일 이름 `not.required`의 에러를 그 자식에게 옮기는 표시 규칙(Q12)으로 풉니다.
- **이유 3 — (i)의 손실은 표시로 고칠 수 없습니다.** 배타 쌍 반례에서 두 값이 사라지고, E5 (2) 때문에 가드가 계속 raw를 보므로 두 필드가 숨겨진 채 풀리지 않습니다. antigravity가 든 "S5 순환이 없다"는 바로 이 특칙 덕분인데, 그 특칙이 함정을 만듭니다. 보이는 에러로 막힌 제출이 조용한 손실보다 낫습니다.
- **대가를 추가합니다.** "기각된 extra의 표시와 삭제" 규칙은 선택 사항이 아니라 (iii)의 전제입니다. ADR 0004 또는 Q12에 적어야 합니다.

### D-5 — 수정 (`fillDefaults`(기본 true) → `skipDefaultsOnLoad`(기본 false))

- **Form prop의 관례 — 상대가 옳습니다.** Form의 불리언 prop은 모두 기본이 꺼진 스위치입니다: `readOnly`(default false, `Form/type.ts:47-48`), `disabled`(default false, `:49-50`), `virtualization`(default off, `:88`). 제 `fillDefaults`는 `fillDefaults={false}`로만 쓰이는 반대 모양이어서 이 관례에 어긋납니다. 다만 두 리뷰어가 근거로 든 `omitEmpty`·`omitTrailing`이 Form prop이 아니라 스키마 `options`의 키라는 지적은 유지합니다.
- **`omit`은 받지 않습니다.** 이 패키지에서 omit은 방출 단계의 제외입니다.
  - `omitTrailing`: "normalized value(부모 전파·루트 검증·외부 방출)에서 제거, 자식 노드는 raw를 유지"(`src/types/jsonSchema.ts:172,181`)
  - `omitEmpty`: "Omit empty values from form data"(`:265`)
  - 실행에서도 로드한 `''`는 노드에 남은 채 `getValue()`에서만 빠졌습니다(`crosscheck-claude-d5-load-defaults.ts`).
  - 새 옵션은 raw에 default를 **넣는 것**을 막는 것이지 방출에서 빼는 것이 아닙니다. 그래서 `omitDefaultsOnLoad`는 "default와 같은 값을 방출에서 뺀다"로 오독될 수 있습니다.
- **`OnLoad` 접미사는 받습니다.** 제 `fillDefaults`는 범위를 감췄습니다. `false`가 "default를 전혀 넣지 않는다"로 읽히지만, 실제로 조각의 OFF → ON 전이 주입(E1 (2))과 빈 폼의 default는 그대로 일어납니다. 접미사는 적어도 "범위가 있다"는 사실을 드러냅니다.
- **다만 드러낼 뿐 정의하지는 않습니다.** Form의 공개 어휘에는 "load"가 없습니다(`Form/type.ts`, `types/formTypeInput.ts`에서 찾지 못했습니다). 그래서 JSDoc이 정의해야 합니다:
  - load = 모든 전체 교체: 생성 시 `defaultValue`, `reset()`, `setValue(V, Overwrite)`, null로의 전체 교체(D-1)의 자식
  - 그 커밋에서 V가 켠 조각도 포함
  - 빈 폼(`defaultValue` 없음)은 해당하지 않음
  - 이 정의가 없으면 "OnLoad"는 "생성 시 한 번"이라는 오해를 부릅니다.
- **결론:** `skipDefaultsOnLoad?: boolean`(기본 false). 기본이 꺼진 스위치(Form 관례), 주입을 가리키는 동사(`omit`의 오독을 피함), 범위 접미사(`OnLoad`)를 함께 갖춘 이름입니다.
