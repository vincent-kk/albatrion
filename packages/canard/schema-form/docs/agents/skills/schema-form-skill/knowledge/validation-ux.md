# Validation UX

Choose when to validate separately from when to show errors. A stored error is not automatically a message the user should see.

Use public imports from `@canard/schema-form`. These examples assume an application-selected `validator` (`ValidatorFactory`); register a validator plugin in application setup or supply that factory to Form. Without a validator, an empty list is not evidence that the schema passed.

## Choose the validation moment

- `OnChange` schedules validation after loading and after value changes. Load validation, described below, produces the initial verdict only if no later validation request has superseded it. Continuous edits are grouped, with a trailing run when they stop and a 100 ms cap measured from the last automatic run that started.
- `OnRequest` prepares validation after loading but produces no verdict until `validate()` or submit. Edits alone can leave the previous errors in place. A schema without `if` conditions still compiles in the background after the first paint.
- A load is the start of a form's tree: first mount, same-schema `reset()`, root-replacing `reset()`, `rebuild()` or a validator change. Only the newest load runs this load work, once, after the next frame, including with `showError={true}` or `ShowError.Always`; a load replaced before that frame is not validated on its own, and `None` runs none.
- `None` skips whole-schema validation, including explicit requests; it does not provide a successful verdict. Conditional if guards can still run while fields settle.

Explicit validation and submit start immediately in validating modes. Await the result instead of reading errors immediately after render or after a change. With a validator in a validating mode, submit validates the value captured by that call; invalid input rejects its promise and does not reach `onSubmit`. In `None`, or without a validator, submit passes the captured value to `onSubmit` without a verdict. For an imperative submit flow, call `showError()` when you want to reveal untouched fields.

A native submission (Enter in a field, or a submit button inside the Form) handles an invalid verdict itself: the Form reveals its errors, as `showError()` does, and focuses the first invalid field in tree order. Nothing reaches `onError` or the host's `reportError`, and `onSubmit` is not called. It neither reveals nor focuses when error display is disabled: the Form's `showError`, else the FormProvider's, is `false`, or includes `ShowError.Never` without `ShowError.Always`. A field's own `ErrorVisible` state still wins over that policy. A Form with `disabled` or `readOnly` reveals without focusing, and when the chosen field's input cannot take focus (a field the layout does not render, or one inside a virtualization placeholder that has not been revealed), focus stays where it is. Tree order is screen order only for default rendering. The handle's `submit()` and `useFormSubmit` still reject with the verdict and reveal nothing.

## Show errors after the relevant interaction

Use `ShowError.Touched` for feedback after blur, or `EditedTouched` when both editing and blur should be required. Programmatic `setValue` does not simulate user input in a test; what marks a field edited is described in [interaction state](interaction-state.md).

A custom input publishes edits through `onChange` and renders messages behind `errorVisible`; this input also sets Touched on blur so a test can assert immediately (when Form records Touched itself is described in [interaction state](interaction-state.md)):

```tsx
function NameInput({
  value,
  onChange,
  node,
  errors,
  errorVisible,
}: FieldInputProps<string>) {
  return (
    <>
      <input
        aria-label="Name"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
        onBlur={() => node.setState({ [FieldNodeState.Touched]: true })}
      />
      {errorVisible && errors[0] && (
        <span role="alert">{errors[0].message}</span>
      )}
    </>
  );
}
```

This input prints the validator's raw message, so `presentation.errorMessages` and `formatError` do not apply to it; to keep formatted copy, render `errorMessage` from a FieldRenderer instead ([error feedback](error-feedback.md)).

Let this input own its message instead of drawing it again in the surrounding renderer:

```tsx
const InputOnly = ({ Input }: FieldRendererProps) => <Input />;
```

In `OnChange` mode, an error that newly becomes eligible to show waits until pending validation settles (about two frames when none is pending) or until the form's `validate()` verdict is accepted, so an older verdict never looks like the answer to new input; hiding is immediate. An already visible error can remain until the next verdict. Raw `errors` props, the values `Form` children and `Form.Render` receive, `node.errors` and `getErrors()` are not filtered by this policy. OnRequest and None use the live display policy without this hold. A child node's `node.validate()` routes its verdict to its own subtree, keeps pending automatic validation and releases nothing.

## Declare required and conditional fields

`required` checks property presence in the emitted value; content constraints check whether that value is acceptable. The name below can be present but too short, so checking only for a `required` error misses invalid input:

```ts
const nameSchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;
```

Declare a conditional input and its requirement together. The validator also evaluates the condition, so it needs the same rule as the form:

```ts
const receiptSchema = {
  type: 'object',
  properties: { receipt: { type: 'boolean' } },
  allOf: [
    {
      if: { properties: { receipt: { const: true } }, required: ['receipt'] },
      then: {
        properties: { email: { type: 'string', minLength: 3 } },
        required: ['email'],
      },
    },
  ],
} satisfies JSONSchema;
```

Verify both directions: selecting receipt creates a required email input; clearing receipt removes that branch and its value from the output. Hiding with `controls.visible` alone keeps the value and does not waive required; a hidden field keeps its aggregate errors. When a `oneOf` or `anyOf` branch is not active, issues that only that branch produced are not shown on its fields; `getErrors()` and the `validate()` result still list them.

`if` guards are synchronous: asynchronous formats or keywords cannot decide conditional field participation. Whole-schema validation may be asynchronous.

## Verify value, verdict, and displayed message

Configure the name example with the chosen validator and display policy:

```ts
const formProps = {
  jsonSchema: nameSchema,
  defaultValue: { name: 'ab' },
  validatorFactory: validator,
  validationMode: ValidationMode.OnRequest,
  showError: ShowError.Touched,
  fieldInputMap: { '/name': NameInput },
  FieldRenderer: InputOnly,
};
```

This Testing Library/Vitest check uses React's `createRef`. It starts with an invalid value, awaits a verdict, then blurs the field to reveal it:

```tsx
const formRef = createRef<FormHandle>();
const view = render(<Form ref={formRef} {...formProps} />);
expect(formRef.current!.getErrors()).toEqual([]);
await act(async () => {
  await formRef.current!.validate();
});
expect(formRef.current!.getErrors()).toEqual([
  expect.objectContaining({ dataPath: '/name', keyword: 'minLength' }),
]);
expect(view.queryByRole('alert')).toBeNull();
fireEvent.blur(view.getByLabelText('Name'));
expect(view.getByRole('alert').textContent).not.toBe('');
```

Then type a valid name, await `validate()`, and assert the output value, an empty error list, and no alert. For OnChange, wait for the observable verdict and message; one microtask is not proof of completion. For OnRequest, assert that editing alone produces no new verdict. For `None`, assert that `validate()` resolves to an empty list and that the validator's whole-schema `compile` is not called; do not label that case valid.

## Deliver server errors through the form

Pass server issues through Form's `errors` prop with a field `dataPath`. The display policy still applies; use the handle’s `showError()` to reveal them after a failed submission. In the mounted name example:

```tsx
const serverErrors: ValidationIssue[] = [
  { dataPath: '/name', keyword: 'server', message: 'This name is taken.' },
];
view.rerender(<Form ref={formRef} {...formProps} errors={serverErrors} />);
act(() => formRef.current!.showError());
```

A successful schema validation does not clear external issues. Replace the prop with an empty list when the server error is no longer relevant; assert both `getErrors()` and the message after adding and clearing it.

Use an empty `dataPath` for a root issue; `/` addresses a child with an empty name. For a node-local message, use its `setExternalErrors`/`clearExternalErrors`; these issues also appear in form-wide `getErrors()`, and clearing them removes them from that aggregate. Typing into the affected field clears its server error through the input’s `onChange`.

For message copy and section summaries, read [error feedback](error-feedback.md). For interaction flags, unsaved changes and reset, read [interaction state](interaction-state.md). For `onError` origins and operation recovery, read [validation failures](validation-failures.md).

## Account for display timing limits

Debounce input publication in FieldInput when needed; validation scheduling groups published edits rather than buffering the widget's local text. Validation still completes in background tabs and without `requestAnimationFrame`: the form falls back to a task, and to a 100 ms timer when a frame never arrives.
Background tabs throttle that timer, and a slow validator delays the result. Schemas with `if` compile those conditions when the form is built or a condition is first evaluated.

If your application changes `context` contents on every frame, newly eligible messages in `OnChange` mode can stay hidden until those changes stop. A fresh function counts as changed content; a fresh `Date`, `Map` or class instance with equal contents does not, because Form and FormProvider compare `context` by content first.

Known display limits: when React defers a field's render (a transition, Suspense or time slicing) past the next result, its message can appear without waiting; a write between a result and the next paint can leave that result's message visible for one or two frames. Writes grouped in one public `node.batch()` or `visitSubtree()` walk count as a single state for the hold, while separate public calls inside one React batch still count their intermediate states. The renderer and the input count only active and visible fields for the hold (see [error feedback](error-feedback.md) for `useChildFieldErrors`). Check timing-sensitive transitions in the real UI.
