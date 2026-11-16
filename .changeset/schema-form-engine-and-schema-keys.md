---
"@canard/schema-form": major
---

Breaking change: 1.0.0 replaces the 0.x form engine and regroups the library's schema keys under `presentation`, `controls` and `options`. The 0.x spellings have no compatibility aliases, and the form neither reads nor warns about an old top-level key, so a schema that is not migrated silently loses that setting.

Move each key to its group:

| 0.x key | 1.0.0 location |
| --- | --- |
| `formType` | `presentation.inputType` |
| `FormTypeInput` | `presentation.FieldInput` |
| `FormTypeInputProps` | `presentation.FieldInputProps` |
| `FormTypeRendererProps` | `presentation.FieldRendererProps` |
| `errorMessages` | `presentation.errorMessages` |
| `computed.active`, `&active` | `controls.active` |
| `computed.visible`, `&visible` | `controls.visible` |
| `computed.readOnly`, `&readOnly` | `controls.readOnly` |
| `computed.disabled`, `&disabled` | `controls.disabled` |
| `computed.derived`, `&derived` | `controls.derived` |
| `computed.watch`, `&watch` | `controls.watch` (an array of paths) |
| `computed.pristine`, `&pristine` | `controls.resetInteraction` |
| `computed.if`, `&if` | `controls.active` on the branch |
| `injectTo` | `controls.injectTo` |
| `terminal` | `options.terminal` |
| `propertyKeys` | `options.propertyOrder` |
| `virtual`, `type: 'virtual'` | `options.virtual: { <name>: { fields: [...] } }` |

Before:

```ts
const schema = {
  type: 'string',
  formType: 'textarea',
  computed: { visible: '../showNote === true' },
};
```

After:

```ts
const schema = {
  type: 'string',
  presentation: { inputType: 'textarea' },
  controls: { visible: '../showNote === true' },
};
```

Migrate schema configuration first, component and type imports next, and node state and validation-issue handling last. The [migration guide](https://vincent-kk.github.io/albatrion/docs/canard/schema-form/migration-from-0x) lists every renamed component, type, hook and node member, and the behavior to re-check after conversion. The other entries of this release that begin with "Breaking change" each describe one of those changes with its own migration.

The root entry point also exports the node kinds and their guards (`BranchNode`, `TerminalNode`, `UnionNode`, `isBranchNode`, `isTerminalNode`, `isUnionNode`), the schema types `JSONSchema` and `InferJSONSchema`, and `FormWarningCode`.
