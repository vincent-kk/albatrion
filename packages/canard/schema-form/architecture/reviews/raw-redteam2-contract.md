# Red team round 2 — contract & conditional model

Env: Node 24, ajv 8.17.1 via `schema-form-ajv8-plugin`, plugin defaults (`allErrors:true, strictSchema:false, validateFormats:false`), draft-07 entry unless noted. Scripts: `scratchpad/rt2.mjs`, `rt2b.mjs`, `rt2c.mjs`.

## 1. Round-1: closed / not closed

| # | Verdict | Evidence |
|---|---|---|
| R1 validator fn unpinned | **not closed** | Reworded to "identically configured"; nothing detects drift (dialect warning is 미수락). G1 still claims "서버가 기각하는 일은 없다" — ADR 0001 no longer supports its own goal. |
| R2 verdict freshness | closed | Bound to revision; submit re-validates the sent snapshot. |
| R3 emitted ≠ serialized | **partial** | Unenforced. RAN: `{when:new Date()}` PASSes `{type:'object'}`, FAILs after `JSON.stringify` (E1). |
| R4 `&` strip position-blind | closed, opened F1 | Opt-in stripper is keyword-position-only. |
| R5 `None` = no verdict | closed | Stated. |
| R6 guards ⇒ no cycles | withdrawn, hazard remains | Cap + throw; see F5. |
| R7 determinism ≠ uniqueness | **not closed** | "Declaration order" undefined across keywords of one object (F10). |
| R8 destructive pruning | closed | RAN J1 (2020): `unevaluatedProperties:false` + inactive `then` passes. |
| R9 initial branch inference | **partial** | Heuristic improved; load→save still lossy (F6). |
| R10 OR→AND / forbidding | **partial** | Context added but self-contradictory (F9); `forbids` mis-reads `not:{required}` (F4). |
| R11 exclusivity / discriminator | **partial** | Static throw removed (good); identification misses dominant BE shapes (F2, F3, F7). |

## 2. New findings (ranked)

**F1 — N2 — BREAKS-INVARIANT — RAN (rt2c).** Handing the authored schema to Ajv unmodified crashes form creation when an FE keyword holds a cyclic or deep object. `{properties:{a:{type:'string',FormTypeInputProps:P}}}` with `P.self=P` → `ajv.compile` throws `RangeError: Maximum call stack size exceeded`, also under `validateSchema:false`. A dev-build React element (`_owner` cycle) at `FormTypeInputProps.alias` or `FormTypeRendererProps.label` does the same; an acyclic element is fine. Those are typed slots (`src/types/jsonSchema.ts:231-252`: `alias?: Dictionary<ReactNode>`, `[alt:string]: any`). Today `ValidationManager.ts:200` strips before compiling — **N2 removes an existing protection**. Actual: RangeError inside the plugin, no pointer to the cause. Fix: keep the position-aware pass on the default path, or cycle/depth-check before `compile` and throw naming the pointer; require in ADR 0003 that `&`-key values be JSON-representable.

**F2 — N6/N7 — BREAKS — RAN (rt2 D1).** OpenAPI 3.0 discriminated unions are unusable *and* permanently invalid. `oneOf:[{$ref:Cat},{$ref:Dog}]`, `Cat/Dog = allOf:[{$ref:Pet},{…}]`, `discriminator:{propertyName,mapping}`, no `const`: `{petType:'cat',huntingSkill:'lazy'}` → **FAIL** (both branches match, oneOf rejects). N7 finds no discriminator → manual selection guard; ADR 0001 then reports invalid whatever the user picks. G2 ("BE 스키마를 아무 가공 없이 넣어도 쓸 만한 폼") fails on the most common BE-generated union. Fix: let the ADR 0012 overlay *declare* a discriminator (round-1 §7-9); ADR 0001 names `discriminator`-only unions unsupported, not silently invalid.

**F3 — N6/N7 vs N4 — BREAKS (deadlock) — RAN (rt2 C2) + record contradiction.** ADR 0002: "존재 = 활성 조각들의 합집합". N6 adds `required:[k]` to every branch guard. On an empty form no guard is true → no fragment active → `k` is declared by nothing → no branch can ever be chosen. ADR 0005 §4 asserts the opposite ("`k`의 노드는 분기들의 선언에서 나온다") with no exemption in ADR 0002. RAN: `anyOf:[{properties:{k:{const:'a'},x}},{properties:{k:{const:'b'},y}}]` → `{}` PASSes, so the form renders zero fields and reports **valid**. Fix: ADR 0002 hoists an identified discriminator property into the base declaration set (schema = union of branch `const`/`enum`; `required` only if authored); cite from ADR 0005 §4.

**F4 — N5 — SEMANTIC-HOLE — RAN (rt2 B1).** `not:{required:['a','b']}` means "not ALL present". Ajv: `{}`, `{a:1}`, `{b:2}` PASS; `{a:1,b:2}` FAIL. N5 deactivates every listed name → the form hides both and emits neither, denying two legal inputs. Fix: restrict the forbidding shape to a **single** name; multi-name is unrepresentable, beside `maxProperties`/`propertyNames`.

**F5 — N3+N5 — BREAKS (crash on a legal schema) — RAN (rt2 A1) + construction.** Zero fixed points, no `default` needed: `{properties:{a:{type:'string'}},allOf:[{if:{required:['a']},then:{properties:{a:false}}}]}`. Ajv: `{}` PASS, `{a:'x'}` FAIL — a meaningful schema ("a must be absent"). Guards read the emitted value: a present → guard true → `a` forbidden → excluded → guard false → a present → … period-2, no fixed point. N11 discards and throws the moment the user types; the right behaviour is to show `a` carrying the validator's error. Fix: evaluate `forbids` against the pre-exclusion projection, keeping it out of the feedback edge.

**F6 — N8 — SEMANTIC-HOLE (silent data loss) — RAN (rt2 H1/L1) + design deduction.** Emitted value = f(node tree), so a loaded key with no node cannot be emitted. Smallest lossy round trip: schema `{"type":"object"}`, value `{"a":1}` → emits `{}`; both PASS, nothing surfaces. L1: `oneOf:[{properties:{a},additionalProperties:false},{properties:{b},…}]` with `{a:1,b:2}` — no branch passes (RAN FAIL), the fallback picks branch 0 by tie, emits `{a:1}` (RAN PASS). **An invalid server record becomes valid by deleting data, with no user action and no notice.** ADR 0001's invariant is one-directional and silent here. Fix: add "the form never removes a key it did not author" plus a `preserveUnknown` policy for node-less keys, or at minimum a form-level diff when `getValue()` ≠ the load.

**F7 — N7 — SEMANTIC-HOLE — RAN (rt2 O1/N1, rt2b #6).** N7 says "following `$ref`", nothing about `allOf`. `oneOf:[{allOf:[{$ref:Base},{properties:{kind:{const:'a'}},required:['kind']}]},…]` is a working discriminated union (RAN `{kind:'b',y:1}` PASS, `{}` FAIL) but its branch top level has no `properties` → demoted to manual selection. Same for `anyOf:[{$ref:A},{$ref:B},{type:'null'}]` (RAN `null` PASS, `{k:'a'}` PASS): the null branch constrains no property, so the union loses its discriminator. Fix: flatten each branch's `allOf`/`$ref` before the const/enum scan; drop `isNullBranch` members first.

**F8 — N6/ADR 0004 — COST — RAN (rt2 G1/G2, rt2b #3).** Both obvious guard-compilation strategies throw on real schemas: a plucked `{properties:{k:{$ref:'#/$defs/Kind'}},required:['k']}` → `can't resolve reference #/$defs/Kind from id #`; re-registering the root under its `$id` → `schema with key or id … already exists`. Verified shape: `ajv.addSchema(rootWithId)` once, then `ajv.compile({$id:'urn:form:guard:N', $ref:'urn:form:root#/allOf/0/if'})` — correct vacuous-truth semantics (`{kind:'cat'}` true, `{}` false), reusing the root's scope. Fix: put it in ADR 0004 instead of "구체 시그니처는 구현 단계에서".

**F9 — N4 — AMBIGUITY — RAN (rt2 I1).** "제약은 연언 문맥의 조각끼리만 교차한다" contradicts "분기가 정확히 하나만 활성이면 그 overlay를 넣는다" — putting an overlay into the effective schema *is* intersecting it with everything there (RAN: two singly-active branches from different `anyOf`s intersect to ∅, which ADR 0005 §3 then handles correctly). The "2+ branches of one union active" clause is **unreachable**: N7's pairwise-disjoint discriminators give ≤1 true and selection guards pick exactly one. Fix: "all active fragments' overlays intersect; a union contributes its single active branch's overlay"; delete the dead clause.

**F10 — N9/N10 — AMBIGUITY — reasoned.** "First-declared kind wins" and "나중 선언이 이긴다" both rest on JSON object key order, which is not part of the data model; fragments from `if/then` vs `allOf` of the *same* object have no defined relative order. The losing node's `value`/`errors`/`state`/emission is undefined while both declarations are active. Fix: a total order over (keyword rank, array index) with a fixed rank table; declare the losing node inert.

Stated without a fix: default **re-**injection on every re-activation (omitEmpty makes transient deactivation routine, so edits under a fragment may silently revert); N11's throw is unconditional and fires at mount for `default`-driven cycles (white screen in production; uncontrolled inputs keep DOM text the discarded commit never accepted); ADR 0012's `FormTypeInput` in an overlay makes a branch node terminal (ADR 0011 §3), so a presentation-only overlay deletes children, fragments and guards from the analysis view — "standard keywords rejected" does not cover it.

## 3. Survived

- **N3 "guards read the emitted value"** — the revision's strongest property. Attacked with `unevaluatedProperties:false` (J1): inactive keys are excluded, the emitted value passes, guard and validator see the same value. Every break found needs `forbids` (F5) — the edge N5 added, not the rule.
- **ADR 0005 §3 "empty intersection is a state, not a throw"** — I1 yields a satisfiable schema with an empty enum intersection; the form stays usable.
- **N2 for ordinary FE keys** — `&visible` strings and a function/class `FormTypeInput` compile cleanly, verdict unchanged; Ajv caches by object identity (rt2b #4), so the schema compiles once.
- **N7 disjointness cost/false positives** — `const:1` vs `const:1.0` are identical in JS; object enums need only deep equality. No false positive; O(branches²·|enum|²) is negligible below ~50 branches.

## 4. Still unasked

1. `additionalProperties: <schema>` / `patternProperties` — a declared-open extension point the node tree cannot represent (RAN H2: values pass, no node, keys vanish).
2. Is branch selection ever re-derived after edits, or does the value drift from the selected branch until the user switches manually?
3. Precedence when `forbids` and `declares`/`constrains` of one name are both active (RAN M1: unsatisfiable there, field hidden, error ownerless — the user cannot act).
4. What the ownerless-error sink renders, and whether a form can be "valid" with a non-empty sink.
5. Does the differential test (`02-target-overview.md` §5-1) feed `JSON.parse(JSON.stringify(getValue()))` to the second implementation? Without that, F1 and E1 stay invisible.
