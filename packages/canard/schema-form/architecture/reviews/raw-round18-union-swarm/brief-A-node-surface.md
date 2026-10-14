# Lens A — node surface and type system

Read `brief-common.md` in this directory first; it binds. This lens owns the **public node interface and TypeScript types** for `union`, and any change to existing fields that makes the whole cleaner (breaking allowed).

## Questions to answer with a concrete proposal

1. **Fields.** Design the trio the owner asked for and name each:
   - `type` — the kind (single string, `'union'` added). Keep.
   - `nullable` — keep. Define it for a union (`null` in the list, or `nullable: true`, or a null branch).
   - the schema's own `type` as written — string or array — new field. Decide: is it the **as-written** value from the author's slot, or the **effective** one the blueprint computed (after merging fragments / collecting `anyOf` branch types)? The owner wrote "아마도 계산된?". Consider offering both only if each has a distinct consumer; otherwise pick one and say why. Name it (candidates: `schemaType` repurposed, `jsonSchemaType`, `declaredType`, `acceptedTypes`…).
   - today's `schemaType` (single `JSONSchemaType`, `PKG/src/core/nodes/AbstractNode/AbstractNode.ts:83`): keep, repurpose, or remove. Survey its consumers in `PKG/src` and `PLUG/*/src` (grep `schemaType`) before deciding.
   - Order: is the array order the author's order (stable, meaningful only as representation) or normalized? Rule A is order-free; the field is representation.
   - `integer` preserved in the array? (owner wants the written form; the kind folds it).
2. **`UnionNode` interface** as a member of the public discriminated union: fields, `value` type, `strategy: 'terminal'`, `children` absence, `valueTypeMismatch`. How `InferSchemaNode<Schema>` maps a `type` array (and a collected `anyOf`) to `UnionNode`.
3. **`InferValueType`** for `type` arrays including `object`/`array` members with `properties`/`items`; today's `NormalizeType` wrapper (`PKG/src/types/value.ts`) widens readonly arrays to `string[]` — fix spec. Check `@winglet/json-schema`'s implementation (`/Users/Vincent/Workspace/albatrion/packages/winglet/json-schema/src/types/value.ts`).
4. **`FormTypeInputProps` typing** for a union node: `value`, `onChange` parameter type, and how a plugin narrows by `type`.
5. **Guards**: `isUnionNode`; does `isTerminalNode(unionNode)` hold; any guard for "kind list contains X"?
6. **Same reference twice**: which of these fields are stable references per node lifetime, which change per commit.
7. What in today's public surface (`PKG/src/index.ts`) breaks, and the migration note for each.

Read: `PKG/src/index.ts`, `PKG/src/core/nodes/AbstractNode/AbstractNode.ts` (public members), `PKG/src/types/*.ts`, ledger NODE-002/015/041/046, SURFACE-052/056/058, BLUEPRINT-021 (effective schema), 18C-40 (`valueTypeMismatch`).
