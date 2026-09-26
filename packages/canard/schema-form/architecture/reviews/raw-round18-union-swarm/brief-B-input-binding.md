# Lens B — input binding and the UI-plugin contract

Read `brief-common.md` in this directory first; it binds. This lens owns **how an input gets chosen for a union node and what the input may rely on** — the Hint, test matching, `formTypeInputMap`, the default fallback, and what real plugin authors need.

## Questions to answer with a concrete proposal

1. **Survey today.** How do the repo's UI plugins pick inputs (`PLUG/schema-form-antd-plugin/src`, `PLUG/schema-form-mui-plugin/src`, and any other `schema-form-*-plugin` with `formTypeInputDefinitions`): which Hint fields do their tests read (`type`, `format`, `formType`, `jsonSchema.enum`, …)? Cite files. What would break for them when a union node appears with today's matching (`formTypeTestFnFactory`: `===` or `indexOf`)?
2. **Hint shape** for a union node: what `hint.type` carries (the kind `'union'`? the written list? both under different keys?), plus `nullable`, `jsonSchema`, `format`, `formType`. Align with Lens A's field names — propose names and say which A-field each Hint key mirrors.
3. **Test-object matching rules** when the hint carries an array: exact set equality? "contains all"? "any of"? Or keep object tests for single kinds and require function tests for unions? Give the rule, its predictability for authors, and 5 examples (`{type:'string'}`, `{type:['string','number']}`, `{type:'union'}`, `{type:['string','number','null']}`, `{type:'object'}` against nodes `['string','number']`, `['string','number','null']`, `['object','string']`, `['string','null']`).
4. **Priority order** (schema `FormTypeInput` > `formTypeInputMap` > form definitions > provider definitions > plugin definitions) — anything union-specific?
5. **Default fallback** (`formTypeDefinitions`): specify the union entry: reuses `FormTypeInputString` with the draft rule (option 나), `undefined` on empty, `null` on clear when nullable, read-only `JSON.stringify` + clear when the value is object/array, `enum`/`const` on a union slot (which definition), `format` on a union slot. State exactly what the fallback does NOT promise.
6. **What a union input may rely on** — the contract text for plugin authors: fields it can read, what it must send (one listed type or `undefined`/`null`), drafts, what happens when it sends a value outside the list (rule A → warning), and how it learns the warning state (`valueTypeMismatch`). Include the object/array whole-value case (a JSON editor input).
7. **Migration**: what existing plugin code changes.

Read: `PKG/src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts`, `PKG/src/helpers/formTypeInputDefinition/*.ts`, `PKG/src/formTypeDefinitions/*.tsx`, `PKG/src/types/formTypeInput.ts`, the plugins' `formTypeInputDefinitions` files, ledger REACT-027, NODE-028 (render-layer judgment), SURFACE-052, 18C-40.
