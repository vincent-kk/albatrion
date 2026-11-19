---
"@canard/schema-form": major
---

Breaking change: input ids and label associations now include a stable per-Form scope, so sibling Forms and repeated radio fields no longer share DOM identifiers. Custom inputs must use the new `inputId` prop for their element id instead of `path`; `path` keeps its JSON Pointer meaning.

Before:

```tsx
const Input = ({ path, defaultValue }: FieldInputProps) => (
  <input id={path} defaultValue={defaultValue} />
);
```

After:

```tsx
const Input = ({ inputId, defaultValue }: FieldInputProps) => (
  <input id={inputId} defaultValue={defaultValue} />
);
```

`Label` and `Form.Label` use the scoped id for `htmlFor`; title ids and radio/checkbox group `aria-labelledby` use opaque identifiers supplied by the core. A FieldRenderer receives `labelId` for its title or legend. The `name` prop always remains the leaf name (for example `method`), regardless of presentation hints or which input definition is selected. Each radio input uses its `inputId` prop as the native group name instead of forwarding the `name` prop; a radio hint alone never changes a text fallback or a custom input's name. Native submission and `FormData` therefore use distinct scoped keys for billing and shipping radios; `FormHandle.getValue()` retains the schema-shaped value. Other native input names remain unchanged. Custom radio inputs migrate `name={name}` to `name={inputId}` on every radio option; their `name` prop remains available for a label fallback or data naming.

React 18 and 19 server rendering and hydration preserve the same scope. Applications with independent server-rendered React roots supply distinct, matching `identifierPrefix` values on the server and client.

Labels and ARIA references resolve identifiers across the document, regardless of which native form owns an input. Separate native form elements therefore cannot prevent identifier collisions. Inputs rendered through portals may also share a native form owner or have none, so every Form uses the same unique identifier rule.

Composite inputs receive `getInputId(key: string | number)` for additional controls, and `labelId` for the renderer-owned title. Replace `id + "-" + index` with `getInputId(index)`. Keys compare as strings. The removed `id` prop has an `id?: never` type guard; the id getters and strings cannot be overridden through child props. Do not parse ids or concatenate library-part suffixes yourself.

Child and presentation overrides also reject the removed `id` prop, even when their extension index signatures accept other custom keys.
