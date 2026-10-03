# Red-team: contract & conditional model

Ajv 8.17.1 from `schema-form-ajv8-plugin` (`ajv` draft-07 entry + `ajv/dist/2020`), plugin's `{strictSchema:false,allErrors:true}`. Scripts: `$TMPDIR/rt/v1..v5.cjs`. "ran" = executed.

---

## F1 — C1 fails across validator implementations (BREAKS-INVARIANT, ran)

C1 fixes the validator's **inputs**; G1 promises agreement with a **different validator**. Fixing inputs does not fix the function.

| schema | value | plugin entry | server |
|---|---|---|---|
| `dependentRequired:{card:['cvv']}` | `{card:'1'}` | `/default` (draft-07) **true** | 2019+ **false** |
| `unevaluatedProperties:false` | `{a:'x',junk:1}` | `/default` **true** | 2020 **false** |
| `email:{format:'email'}` | `{email:'zzz'}` | **true**, every entry | asserting server **false** |

No `ajv-formats` dependency exists and 2019-09+ makes `format` annotation-only, so every format passes client-side while asserting servers reject. Converse crash: draft-07 tuple `items:[{type:'string'},{type:'number'}]` under `/2020` → **compile throws**; G2's "BE schema as-is" dies at form creation. Three dialect entries ship; nothing binds the consumer's choice to `$schema`.

**Fix:** contract becomes "pass under an *identically configured* validator"; plugin declares `dialect`+`assertFormat`; analysis reads `$schema` and throws on mismatch. No fix keeps the unqualified wording.

## F2 — C6's strip rule is position-blind as written (BREAKS-INVARIANT, ran)

ADR 0001/0003 state one rule — "remove keys starting with `&`" — justified by "unknown *keywords* are ignored", which covers keyword positions only. Applied literally:

| schema | value | authored | stripped (form sees) |
|---|---|---|---|
| `properties:{'&secret':{type:'integer'},a:{type:'string'}}` | `{'&secret':'hello',a:'x'}` | **false** | **true** ← form-pass/server-reject |
| same + `additionalProperties:false` | `{'&note':'x',a:'y'}` | true | false |
| `properties:{cfg:{const:{'&mode':'auto',v:1}}}` | `{cfg:{'&mode':'auto',v:1}}` | true | false |
| `properties:{cfg:{enum:[{'&mode':'auto'}]}}` | `{cfg:{'&mode':'auto'}}` | true | false |
| `$defs:{'&Addr':{…}}` + `$ref:'#/$defs/&Addr'` | any | false | **compile throws** |

Name-map positions (`properties`, `$defs`, `patternProperties`, `dependentSchemas`) and data positions (`const`, `enum`, `default`, `examples`) hold author content, not keywords.

**Fix:** strip `&` keys **at keyword positions only**, via a dialect-aware walker. Consequence: C6's soundness is dialect-dependent, so **Q9 blocks C1** — a container the walker doesn't know (draft-07 `dependencies`) is mis-descended or leaks `&` keys to the validator.

## F3 — Guards see a different value than the verdict (SEMANTIC-HOLE, ran)

ADR 0007 orders Resolve(2) before Commit(5), where the emitted value is computed — so at guard time the emitted value **does not exist**, and the step order has already answered Q3 with "raw".

`if:{required:['nickname']}, then:{properties:{alias:…},required:['alias']}`. Guard on raw `{nickname:''}` → **true**; on normalized `{}` (omitEmpty) → **false**. Type into nickname (fragment ON, fill `alias`) → select-all+delete → fragment flips → Q1 pruning drops `alias`. One keystroke destroys a sibling's value; the shape oscillates while typing.

**Fix:** insert Normalize **before** Resolve; Commit becomes a pure read.

## F4 — C4's static throw refuses schemas ADR 0002 recommends (SEMANTIC-HOLE, ran)

```json
{"properties":{"k":{"enum":["a","b"]}},"required":["k"],"allOf":[
 {"if":{"properties":{"k":{"const":"a"}},"required":["k"]},"then":{"properties":{"v":{"type":"string"}},"required":["v"]}},
 {"if":{"properties":{"k":{"const":"b"}},"required":["k"]},"then":{"properties":{"v":{"type":"number"}},"required":["v"]}}]}
```
Validates correctly (`k=a,v="s"` true; `k=b,v=3` true; `k=a,v=3` false). Same name `v`, different type, neither `then↔else` nor `oneOf` siblings → C4 row 3 → **static throw at form creation**. ADR 0002 rule 2 names `allOf[{if,then}]` as *the* idiom for multiple independent conditions: the model forbids its own recommendation.

Second face: base `name:{type:['string','null']}` narrowed by `then:{properties:{name:{type:'string'}}}` (verified legal) — is that "the same type"? Undefined, and if not, a very common nullable narrowing throws. Equally undefined: overlays with no `type` (`{const}`, `{enum}`, `{$ref}`).

**Fix:** replace structural exclusivity with **guard disjointness** — throw only when two same-name/different-type fragments can be guard-true together; a type union is compatible with its members; a `type`-less overlay is compatible.

## F5 — "oneOf siblings are exclusive" is false at runtime (SEMANTIC-HOLE, ran)

```json
{"oneOf":[{"properties":{"k":{"enum":["a","x"]},"v":{"type":"string"}},"required":["k","v"]},
          {"properties":{"k":{"enum":["b","x"]},"v":{"type":"number"}},"required":["k","v"]}]}
```
Discriminator-only guards on `{k:'x'}`: branch0 **true**, branch1 **true**, while `{k:'x',v:'s'}` is a **valid** document. C4 allowed `v` to differ in type *because* these are oneOf siblings; at runtime both fragments are active, two incompatible `v` nodes are live, no tie-break. The check meant to catch this ran statically. Fix as F4.

## F6 — `⊕` cannot represent removal; C3 makes base fields unremovable (SEMANTIC-HOLE, ran)

`{properties:{kind:{enum:['a','b']},aOnly:{type:'string'}},allOf:[{if:{properties:{kind:{const:'b'}},required:['kind']},then:{not:{required:['aOnly']}}}]}`, value `{kind:'b',aOnly:'typed'}` → **false**, errors `<root> not` / `<root> if`. C3 makes `aOnly` base ⇒ always present, so the form renders it, accepts typing, emits it, and routes the failure to the `<root>` sink — an error with no fixable location. Same for `then:{properties:{x:false}}`, `maxProperties`, `propertyNames`, `unevaluatedProperties:false` (verified `{kind:'b',detail:'x'}` → false). `⊕` is additive; these keywords are subtractive.

**Fix:** fragments carry `forbids: name[]` from `not:{required:[…]}` and `properties:{x:false}`; an active forbid deactivates the base node. Richer negation is unrepresentable — state the limit.

## F7 — "first passing branch" silently destroys loaded data (UX-TRAP, ran)

`anyOf:[{properties:{note}}, {properties:{note,detail,owner},required:['detail','owner']}]`. Load `{note:'n',detail:'d',owner:'o'}`: branch0 **true**, branch1 **true**. ADR 0002 takes the *first* passer → branch0 → Q1 pruning removes `detail`/`owner` → emits `{note:'n'}`, still **valid**. C1 survives; the record is gutted on mount with no error anywhere. Surveyed prior art (RJSF `getClosestMatchingOption`) scores precisely to avoid this.

**Fix:** score by match specificity; never prune on *initial* selection, only on user-initiated switches.

## F8 — the canonical discriminated `oneOf` never takes the discriminator path (UX-TRAP, ran)

ADR 0005's candidate rule: "a branch that **redeclares** a base `properties` entry with `const`/`enum` is a guard". The OpenAPI-idiomatic shape has **no base `properties`**: `oneOf:[{properties:{kind:{const:'a'},a},required:['kind','a']}, …]`. Nothing is redeclared, so the rule never fires and the commonest discriminated union degrades to a manual selector beside a `kind` field the user must also set — two controls for one decision, free to disagree. False positive inverse: a branch narrowing a base `enum` for constraint reasons is promoted to a guard.

**Fix:** discriminator = a property every branch constrains with `const`/single-`enum`, values pairwise disjoint — computed from the branch set, not from redeclaration.

## F9 — `anyOf` with several active branches gives an unsatisfiable effective schema (AMBIGUITY, ran)

`anyOf:[{properties:{code:{maxLength:3}}},{properties:{code:{minLength:5}}}]`: `"ab"` **true**, `"abcdef"` **true**. Both active → `intersect(maxLength:3,minLength:5)`, unsatisfiable, while the schema is satisfiable. `anyOf` is disjunctive; `⊕` is conjunctive. The model has no disjunctive combinator.

## F10 — compileGuard cost is the opposite of where the mitigation sits (COST, measured)

One Ajv2020 instance, 100 distinct fragment guards: **compile 26.9 ms (0.269 ms/guard)**; **eval of all 100 on one value: 7.6 µs (0.076 µs each)**. The only stated skip ("host reference unchanged ⇒ skip evaluation", ADR 0005 §2 / 0007) optimizes the half that is already free, while ADR 0005 enumerates every fragment statically and ADR 0004 demands a `compileGuard` each — paid synchronously at form creation (200 fragments ≈ 54 ms before first paint, plus full `compile`). RJSF #3692 was per-keystroke *full validation*; that lesson transfers to compile, not eval.

**Fix:** budget compile in ADR 0009 (lazy, deduplicated, shared instance); drop reference-skip from the perf argument.

## F11 — `ValidationMode.None` (BREAKS-INVARIANT, reasoned)

Under `None` the form emits without calling `compile()`, so "form-pass" is asserted with no validator behind it, while ADR 0004 still requires a plugin for guards. Either `None` means "no verdict offered" or the mode contradicts C1. Unaddressed.

---

## Claims that survived

- **C1 relative to one fixed validator instance.** Strongest attack: error routing as a display filter hiding a real failure. It does not — routing picks *where* an error renders; the verdict stays `errors.length` and `<root>` orphans reach the sink (F1, F6 confirm).
- **C2 for conjunctive constructs.** Attacked with `if` without `then` (no fragment, no validation effect); `else`-only (guard = ¬`if`); `if` nested in `then` (recursion terminates — guards read values, not effective schemas); `if` reaching a nested path (host is the object carrying `if`). Does not extend to `not` (F6) or `anyOf` (F9).
- **C5 "structure, not semantics".** Enum narrowing, fragment defaults, required markers and array `min/max` are structure reads of the effective schema; no validator is re-implemented. Per F10 no dependency parsing is needed for speed either.

## Questions the design has not asked itself

1. What binds the plugin's dialect and format config to the authored `$schema`? Q9 is a blocker, not a side question (F1).
2. Where is the emitted value computed relative to Resolve? ADR 0007's order and ADR 0001's "verdict on the emitted value" cannot both stand (F3).
3. Can two fragments be active with conflicting declarations, and who wins? Asked statically, never dynamically (F5, F9).
4. How is a fragment that *forbids* something represented? `⊕` has no inverse (F6).
5. `$dynamicRef`/`$recursiveRef` inside a fragment's `if` — `compileGuard(subschema)` has no dynamic scope to resolve against.
6. May initial branch inference mutate the loaded value (F7), and does `validate()` on an untouched form emit the orphan errors ADR 0001 predicts — opening every conditional form red?

## Unverified

Server behaviour reasoned from spec and the absent `ajv-formats`, not run against a real server. F11 read from ADR 0004 and current `ValidationMode`. F2 assumes the literal ADR rule — today's `stripSchemaExtensions` is position-aware via `JSONSchemaScanner`, so F2 is a specification defect and regression risk, not a current bug. Array fragments not attacked: ADR 0005 marks them 미결.
