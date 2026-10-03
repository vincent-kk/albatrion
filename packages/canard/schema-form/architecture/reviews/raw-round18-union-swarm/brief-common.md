# Swarm brief — the `union` node: interface, behavior and contract

Read-only: edit nothing under the repository. Scratch files go under `$TMPDIR`. Answer in Korean; keep identifiers, paths and schema keywords as they are. Every claim about today's code cites `path:line`; every claim about the design cites a ledger ID. Say "모름" rather than guess.

ARCH = `/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture`
PKG  = `/Users/Vincent/Workspace/albatrion/packages/canard/schema-form` (today's code)
PLUG = `/Users/Vincent/Workspace/albatrion/packages/canard/` (sibling packages: `schema-form-antd-plugin`, `schema-form-mui-plugin`, `schema-form-ajv8-plugin`, … — real UI plugins that bind inputs)
S    = `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/a8be555b-9dd3-4b7e-ac18-a45022199e69/scratchpad`

## 0. What this swarm is for

The owner (Vincent) is adding a new node kind, `union`, to the redesign of `@canard/schema-form`. The core rule is confirmed; the **public interface and the contracts around it are not**. The owner's instruction, verbatim:

> 일단 이게 좀 복잡하니까, 기존 사용성을 기반하되 파괴적 변화를 해도 되니까 폭넓게 가장 최선의 인터페이스와 기능, 그리고 신뢰할 수 있고 예측 가능한 계약을 만들 수 있도록 에이전트 스웜을 구성해보자.

So: start from today's usability, breaking changes are allowed, and the goal is the best interface plus a contract a caller can trust and predict. You propose; the owner decides.

## 1. Design values (tie-breakers)

- Consistent, predictable behavior: where behavior could go either way, follow the consistency the public interface leads a caller to expect.
- Speed first, minimal computation, the same value read twice returns the same reference. Every proposal states its speed and memory cost.
- P1′ (owner): the form reads from the schema only the syntax that shapes the node tree (`type`, `properties`, `items`, `if/then/else`, `oneOf`/`anyOf` branches). Validation semantics belong to the validator plugin (ajv), which is optional; core rules must be complete without it.
- Nothing is silently ignored: an author's declaration that the form cannot honor is a blueprint error or a dev-mode warning, never dropped.

## 2. Facts already settled (do not reopen; build on them)

### Node model (17–18 rounds)
- One class `SchemaNode`, no subclasses; per-kind behavior rows `BEHAVIORS[type][strategy]` (ledger NODE-002). Public node types (`StringNode`, `ObjectNode`, …) are members of a discriminated union of interfaces narrowed by `type` (NODE-015, NODE-046); `InferSchemaNode<Schema>` maps a schema to the member.
- Kinds today: string, number (`integer` folded in), boolean, null, object, array, virtual; `union` is added (BLUEPRINT-032). Nullability is a flag (`nullable`), not a kind.
- Strategy: `branch` (object/array with child nodes) or `terminal` (one input owns the whole value). Decided statically by the blueprint: `options.terminal` → render-layer judgment (inline `FormTypeInput` present) → `type` (NODE-028, NODE-042). A single-row kind with a contradicting `options.terminal` is blueprint error ERROR-200 `TERMINAL_OPTION_UNSUPPORTED`.
- Conversion table WRITE-075: number node converts a numeric string (integer: safe integers only, never truncates a number); string node converts finite numbers and booleans; boolean node converts exactly `"true"`/`"false"` and 1/0; `null` never converts; a value already of the node's type is kept. Failure keeps the value and turns on the per-node warning light `valueTypeMismatch` (VALUE-030/033, SURFACE-052) and emits warning `VALUE_TYPE_MISMATCH` once per lighting (ERROR-186).
- Input contract REACT-027: the input holds drafts itself; sends the node only a value of its type or `undefined`; empty field → `undefined`; a clear action → `null` if nullable else `undefined`; an uninterpretable draft on blur reverts the display.
- Fill (`controls.default` > `default`) happens only when a node is created (mount, `reset()`, `resetSubtree()`, branch turning on, array item created) — owner answer row 26 (WRITE-090).

### `union` — owner-confirmed (owner answers row 24, 2026-09-26; ledger BLUEPRINT-033/034/035, NODE-041)
- Purpose: accept a field whose `type` lists several types. NOT a type-choice UI; type choice is expressed with `if/then/else` or `controls.active`.
- Rule A (interpretation on every write): ① value is of a listed type → keep; ② else try the conversion table for each listed type, convert only when exactly one accepts; ③ none or ≥2 accept → keep and light the warning. No declared-order rule, no validator rule. A single-type node is the one-element case. Rule A is order-independent (verified by codex and antigravity; the only ambiguous input is number 1/0 with `['string','boolean']`).
- Input contract: the input sends a value of one listed type or `undefined`; the UI plugin decides which type.
- Default input (`formTypeDefinitions`, the minimal fallback when no UI plugin exists): reuse the string input, no new component.
- Terminology: primitive multi-type leaf = `union` (guard `isUnionNode`, module `unionBehavior/`); `oneOf`/`anyOf` host = variant host; a branch = variant.

### Owner decisions from the 2026-09-26 review (not yet in the ledger — treat as given)
- **Object/array in a union are allowed, terminal only** (option (c)): when the folded set (null removed, `integer`→`number`) has ≥2 kinds and contains `object` or `array`, the node is `union` with strategy forced `terminal`; no child nodes; `properties`/`items` on that slot stay validation-only; `options.terminal: false` is ERROR-200; no conversion to/from object/array (membership by `typeof`/`Array.isArray`); `find('/slot/key')` finds nothing (NODE-020); `controls` expressions read the emitted value so `./slot/key` reads (CONTROLS-080); `omitEmpty` looks at the current whole value; `default` applies as a whole value once at creation; an incoming `{}` is an existing value and is not overwritten by `default` (contrast object-host WRITE-082). `['object','null']` stays a nullable object (not union). The default fallback shows `JSON.stringify(value)` read-only with a clear action when the value is object/array. Mixed `oneOf`/`anyOf` (object branch + string branch) is a **separate, pending decision**; do not decide it, but say what your proposal implies for it.
- **Primitive `anyOf`/`oneOf` without own `type`** (option 나): read the union of gate-less branch `type`s as the slot's list; branch constraints stay validation-only. Whether typeless `const`/`enum` branches infer a kind from the literal values is **open** (codex: require explicit `type`; antigravity: infer).
- **Narrowing a body union in `then`/`allOf` is validation-only** (node stays union); recorded as an explicit exception to BLUEPRINT-011/012; non-subset redeclaration stays a kind conflict.
- **Default input drafts** (option 나): the default input sends only text that rule A resolves to a listed type; otherwise holds it as a draft and reverts on blur. With `string` in the list this equals today's behavior.
- **`integer` in a union**: membership follows JSON Schema (`integer` = integer-valued finite number, `number` = finite number, so `NaN`/`Infinity` never match); conversion per listed type; equal results count once; `['integer','number']` uses the number rule.
- **`default` values go through rule A** too (a `default: 0` on `['string','boolean']` lights the warning at mount — an author error, surfaced).
- `valueTypeMismatch === false` means "value is of an accepted JSON type", never "validation passed".
- Validator mutation (`coerceTypes`/`useDefaults`/`removeAdditional` on a bound ajv): decision pending between "warn" and "refuse or copy the value for that instance only" (codex ranks it risk #1). Say what your area needs.

### The owner's latest direction on node fields (verbatim, 2026-09-26)
> 스키마에 쓴 배열 타입을 그대로 출력하는 필드와 node 의 현재 타입을 출력하는 필드를 구분하고, nullable 필드도 남겨두길 바랍니다. 어차피 지금까지 보고있던 node 타입은 여전히 단일 문자열일거고(union 이 추가될 뿐) 스키마 타입은 배열이나 단일 문자열일거고. jsonSchema type 을 그대로 보는거니. nullable 도 속성값으로 남겨두고싶어. 정리하자면, 기존 속성을 유지하고, schema 의 원본타입(이 노드의 jsonSchema Type, 아마도 계산된?)을 추가하는 방향.

Read this as: keep `node.type` (the kind, a single string, now including `'union'`), keep `nullable`, and add a field that exposes the schema's own `type` as written — a string or an array — possibly the *computed/effective* one (the owner is unsure: "아마도 계산된?"). Today's `schemaType` (a single `JSONSchemaType`, e.g. `'integer'`, `PKG/src/core/nodes/AbstractNode/AbstractNode.ts:83`) must find its place in this scheme; breaking it is allowed if the result is cleaner. The Hint for input selection (`PKG/src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:69-77`) passes `type: node.schemaType` today; test objects match with `===` or `indexOf` (`PKG/src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts`, `formTypeTestFnFactory`).

## 3. Reports you may read (verified quotes; do not re-verify)
- `S/reports/standards-research-1.md` — JSON Schema spec, generators (TypeBox/pydantic/zod emit `anyOf` for primitive unions; ts-json-schema-generator emits `type` arrays), validators (ajv coerces in declared order; `strictTypes: "log"` warns on union `type` arrays), rjsf/JSON Forms/formly (first type or rank; never interpret values), RHF/Formik/Final Form defaults.
- `S/reports/standards-research-2-branch.md` — how rjsf/JSON Forms/formly handle multi-type on object/array and `oneOf`/`anyOf` (user-facing selectors; switching never converts).
- `S/reports/t1a-union-consistency.md` — internal consistency test of the ledger's union rules (M1–M4, G1–G12).
- `S/reports/crosscheck-codex-union.md`, `S/reports/crosscheck-antigravity-union.md` — independent reviews, including the terminal-only object/array spec.
- `S/drafts/union-design-decision.md` — the consolidated summary the owner reviewed.

Ledger: `ARCH/ledger/*.md`; an item is `### <ID> <title>` with 결정/보충/상태/출처 fields; only `현행`, `현행(부정 결정)`, `현행(기록)` bind. Closing record: `ARCH/reviews/round-18-closing.md` (18C-02 is lines 53–89; its lines 67, 68, 71 are superseded).

## 4. Output shape (every lens)

```
# <lens name> — 제안
## 요약 (5줄 이내)
## 제안 (규칙을 한 문장씩, 번호 붙여; 각 문장에 근거 ID 또는 path:line)
## 대안과 버린 이유
## 다른 렌즈에 넘기는 요구 (이 제안이 성립하려면 다른 영역이 지켜야 할 것)
## 비용 (속도·메모리·구현 크기)
## 실패 장면 (이 제안이 틀렸다면 어떻게 드러나는가)
## 소유자가 정해야 할 것 (이유와 함께; 원리로 닫을 수 있는 것은 여기 넣지 말 것)
```
