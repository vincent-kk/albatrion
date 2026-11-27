---
"@canard/schema-form": major
---

Breaking change: input ids and label associations now include a stable per-Form scope, so sibling Forms and repeated radio fields no longer share DOM identifiers. In 0.x the built-in inputs used the field's `path` as their element id and `Form.Label` pointed `htmlFor` at the `path`, so a custom input that copied that convention is no longer associated with its label. Use the new `inputId` prop for the element id; `path` keeps its JSON Pointer meaning.

Before:

```tsx
const Input = ({ path, defaultValue }: FormTypeInputProps) => (
  <input id={path} defaultValue={defaultValue} />
);
```

After:

```tsx
const Input = ({ inputId, defaultValue }: FieldInputProps) => (
  <input id={inputId} defaultValue={defaultValue} />
);
```

`Label` and `Form.Label` use the scoped id for `htmlFor`; title ids and radio/checkbox group `aria-labelledby` use opaque identifiers supplied by the core. A FieldRenderer receives `labelId` for its title or legend. The built-in radio input uses its `inputId` as the native group name of every option, where 0.x used the `name` prop (the leaf name, for example `method`). Native submission and `FormData` therefore use distinct scoped keys for billing and shipping radios; `FormHandle.getValue()` keeps the schema-shaped value. Other native input names are unchanged. Custom radio inputs migrate `name={name}` to `name={inputId}` on every radio option; their `name` prop stays the leaf name and remains available for a label fallback or data naming.

React 18 and 19 server rendering and hydration preserve the same scope. Give each independent server-rendered React root a distinct `identifierPrefix` and use the same value on the server and client. Also use distinct prefixes when multiple roots with separate copies of `react-dom` render Forms in the same document, as in separately bundled applications, micro-frontends and widgets. Each renderer copy starts its client `useId` sequence at the same value. Without distinct prefixes, clicking one application's label can act on another application's input.

Labels and ARIA references resolve identifiers across the document, regardless of which native form owns an input. Separate native form elements therefore cannot prevent identifier collisions. Inputs rendered through portals may also share a native form owner or have none, so every Form uses the same unique identifier rule.

Composite inputs receive `getInputId(key: string | number)` for additional controls, and `labelId` for the renderer-owned title. Replace ids built from `path`, such as `` `${path}-${index}` ``, with `getInputId(index)`. Keys compare as strings. Do not parse ids or concatenate library-part suffixes yourself.

In 0.x an `id` passed to a child component, `Form.Input`, `Form.Group` or `Form.Render` reached the input as an extra prop. In 1.0.0 the props of child components, `Form.Input`, `Form.Field` and `Form.Render` type `id`, `inputId`, `labelId` and `getInputId` as `never`, although they still accept other custom keys.
