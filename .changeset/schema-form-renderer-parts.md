---
"@canard/schema-form": minor
---

Breaking change: rename and retype presentation slots as `LabelRenderer`, `InputRenderer` and `ErrorMessageRenderer`, and use `Form.ErrorMessage` for standalone error content. A `FieldRenderer` receives bound `Label`, `Input` and `ErrorMessage` parts, so custom groups can reuse registered presentation without copying its markup.

Before:

```tsx
const Label = ({ name }: FieldRendererProps) => <>{name}</>;
registerPlugin({ FormLabelRenderer: Label });
<Form.Error path="/name" />;
```

After:

```tsx
const Label = ({ htmlFor, id, children }: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id}>{children}</label>
);
registerPlugin({ LabelRenderer: Label });
<Form.ErrorMessage path="/name" />;
<Form.Render path="/name">
  {({ Label, Input, ErrorMessage, errorMessage }) => (
    <><Label /><Input /><ErrorMessage>{errorMessage}</ErrorMessage></>
  )}
</Form.Render>;
```

Use `LabelRendererProps`, `InputRendererProps` and `ErrorMessageRendererProps` instead of group props for the three slots. Each renderer owns its root and applies its supplied styling and accessibility addresses. `Form.Label` accepts children; it and `Form.ErrorMessage` add no outer label/span. Bound Label defaults to the field name, not schema title; ErrorMessage content comes from its caller. Explicit props override defaults even when undefined, except Label children; node stays bound. Pass context explicitly to bound label/error parts when needed. Default and bundled plugin groups pass no context; Form.Label and Form.ErrorMessage pass the form context, so a renderer must tolerate its absence in groups.

`InputRenderer` is an optional frame with no default. Render its children exactly once, unconditionally at a stable position. Selection is Form, nearest FormProvider, then plugin. A nearer FormProvider without InputRenderer hides an outer provider’s frame and falls back to the plugin. Changing the path around children restarts the input from the current node value and loses focus/composition. Use `<Input unwrapped />` or `<Form.Input unwrapped />` to skip it. Keep unwrapped constant per position: while a frame is selected, toggling it on a bound Input replaces the input; toggling it on Form.Input remounts the whole field even without a frame. Child-component and presentation payloads named unwrapped still reach the real input. Keep renderer references and object props stable.

The default group omits an empty em, removes the non-required label’s trailing space and marks its required asterisk aria-hidden; a default standalone Form.Label now shows the same asterisk. A branch's descendant em selector may now find a child's message; scope it to the intended field. Old registration keys are silently ignored at runtime. TypeScript rejects old keys in object literals and JSX props; a plugin object typed elsewhere, such as one from an older plugin package, still compiles and its old keys are ignored. `registerPlugin` failure messages list the plugin’s slots by the new names. The standalone Form.Label data-path div moves from inside the label to outside it; update selectors such as `label > div`.
