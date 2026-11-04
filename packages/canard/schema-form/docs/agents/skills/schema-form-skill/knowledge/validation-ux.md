# Validation UX

Choose when to validate separately from when to show errors. A stored error is not automatically a message the user should see.

Use public imports from `@canard/schema-form`. These examples assume an application-selected `validator` (`ValidatorFactory`); register a validator plugin in application setup or supply that factory to Form. Without a validator, an empty list is not evidence that the schema passed.

## Choose the validation moment

- `OnChange` validates after loading and schedules validation after value changes. Load work runs after the next frame, even with `showError={true}`. Continuous edits are grouped, with a trailing run when they stop and a 100 ms cap measured from the last automatic run that started.
- `OnRequest` prepares validation after loading but produces no verdict until `validate()` or submit. Edits alone can leave the previous errors in place.
- `None` skips whole-schema validation, including explicit requests; it does not provide a successful verdict. Conditional if guards can still run while fields settle.

Explicit validation and submit start immediately in validating modes. Await the result instead of reading errors immediately after render or after a change. Submit validates the value captured by that call; invalid input rejects its promise and does not reach `onSubmit`. For an imperative submit flow, call `showError()` when you want to reveal untouched fields.

## Show errors after the relevant interaction

Use `ShowError.Touched` for feedback after blur, or `EditedTouched` when both editing and blur should be required. Programmatic `setValue` does not mark a field edited, so it does not simulate user input in a test.

A custom input publishes edits through `onChange`, marks blur through node state, and renders messages behind `errorVisible`:

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

Let this input own its message instead of drawing it again in the surrounding renderer:

```tsx
const InputOnly = ({ Input }: FieldRendererProps) => <Input />;
```

In OnChange mode, a newly eligible error waits for the validation/display release; hiding is immediate. An already visible error can remain until the next verdict. Raw `node.errors` and `getErrors()` are not filtered by this policy. OnRequest and None use the live display policy without this hold.

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

Verify both directions: selecting receipt creates a required email input; clearing receipt removes that branch and its value from the output. Hiding with `controls.visible` alone keeps the value and does not waive required.

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

Then type a valid name, await `validate()`, and assert the output value, an empty error list, and no alert. For OnChange, wait for the observable verdict and message; one microtask is not proof of completion. For OnRequest, assert that editing alone produces no new verdict. For None, assert that the validator is not called and do not label that case valid.

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

Use an empty `dataPath` for a root issue; `/` addresses a child with an empty name. For a node-local message, use its `setExternalErrors`/`clearExternalErrors`; local issues are not added to form-wide `getErrors()`.

Compilation or execution failure is a rejected validation operation, not an input error. Keep it out of the server-error list, observe `onError` for the occurrence, and handle rejection from imperative validate/submit calls.
