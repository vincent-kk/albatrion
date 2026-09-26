# Lens C — blueprint: reading the schema into a union node

Read `brief-common.md` in this directory first; it binds. This lens owns **how the blueprint decides that a slot is a union, what list it carries, and every error/migration around it**.

## Questions to answer with a concrete proposal (one decision procedure, then its corollaries)

1. **Decision procedure for a slot**, as an ordered list that always terminates in exactly one of: primitive leaf (with nullable), union leaf (primitive-only), union leaf (terminal-forced, contains object/array), object/array node (branch or terminal, with nullable), variant host, null leaf, blueprint error. Inputs: own `type` (string/array/absent), `nullable: true` keyword (OpenAPI 3.0), gate-less `oneOf`/`anyOf` branches (with/without `type`, with `const`/`enum` only, null branch, object branches with `properties`, `$ref`), `controls.discriminator`, `options.terminal`, inline `FormTypeInput`. Mark where the pending decisions sit (typeless `const`/`enum` branches; mixed object+primitive `oneOf`) and give the default you recommend for each with reasons.
2. **The list the node carries** (feeds Lens A's new field): as-written vs effective. Define the effective list when the slot is re-declared in fragments (`allOf` item, `then`, `$ref` target): same folded set → shared node; subset narrowing in a gated declaration → validation-only (the owner's exception) — write the exact rule and say what the effective `type` in `node.jsonSchema` is while the gate is on; superset/different set → kind conflict (BLUEPRINT-011/012). Include `['string','number']` vs `['number','string']`, `['integer','string']` vs `['number','string']`, and adding `'null'` in a gated declaration.
3. **Nullability sources** and their interaction: `'null'` in the array, `nullable: true`, a null branch; and how `['object','null']`/`['array','null']` stay nullable object/array while `['object','string']` is a terminal union.
4. **Terminal forcing** for object/array-containing unions: the rule in NODE-042 terms; ERROR-200 for `options.terminal: false`; inline `FormTypeInput` present (fine); `properties`/`items`/`controls`/`presentation` written inside such a slot → validation-only + dev warning (spec the warning: code, level, dedupe key).
5. **Error codes**: which existing codes cover each error case (`UNKNOWN_JSON_SCHEMA`, `SHARED_NODE_KIND_CONFLICT`, `TERMINAL_OPTION_UNSUPPORTED`, …); no new code unless unavoidable — argue it.
6. **ajv `strictTypes` warning** on union `type` arrays: recommend on `allowUnionTypes: true` in the ajv8 plugin default (and ajv7/ajv6 status).
7. **Migration rows** (today → new): list every schema shape whose outcome changes, with today's behavior verified in `PKG/src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts` and `PKG/src/core/nodes/schemaNodeFactory.ts`.
8. **Corpus**: which generator outputs (from `S/reports/standards-research-1.md`) now build, which still fail, and 6 test schemas to add.

Read: ledger BLUEPRINT-009/010/011/012/017/021/032/033/034, FRAGMENT-001/007/008, NODE-028/042/047, ERROR-164/200, LANDING-129/130, TEST-067; `ARCH/reviews/round-18-closing.md:53-89`.
