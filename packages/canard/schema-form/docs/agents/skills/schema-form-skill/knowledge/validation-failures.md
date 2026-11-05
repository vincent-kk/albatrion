# Handle failures separately from invalid input

Treat `onError` as an occurrence channel for diagnostics and operation failures.
It is not a current list of field errors and does not announce that an earlier problem has resolved.
Use the issue list for input corrections, and use records to decide which application operation needs attention.
Read [validation UX](validation-ux.md) for verdicts and server issues, and [error feedback](error-feedback.md) for their messages.

## Route a report to the operation that can recover

Inspect a record's origin together with its code and severity; origin alone does not say whether a form is unusable.
The origin identifies the operation that opened the reporting chain, not the component that happened to receive the callback.

| Origin     | Where it comes from                                                                                   | Consumer response                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `load`     | Construction diagnostics and the load that mount, `reset()`, `rebuild()` or a validator change starts | Check schema, defaults and validator setup; inspect the resulting form before deciding whether to retry the load.               |
| `write`    | Public value/state/array/context/external-error writes and the listeners they notify                  | Inspect the write or listener that failed; re-read the result rather than assuming an exception rolled back the edit.           |
| `validate` | Whole-schema compilation, automatic or explicit validation, verdict delivery and its listeners        | Distinguish validator failure from invalid input; catch explicit call rejection and correct the validator/schema configuration. |
| `submit`   | A degraded form blocking submit, or a failure first captured by native submit                         | Stop the submission flow, preserve input, and handle the underlying failure before retrying.                                    |
| `render`   | Injected component boundaries and render warnings                                                     | Fix the component/configuration at the reported field; do not translate a rendering failure into a validation issue.            |

Construction records remain `load` even if a different operation requested construction.
An operation nested inside another keeps the origin of the operation that started it: a write in reset's onChange can be `load`, while reset from a write listener can be `write`.
A failure already reported during validation keeps `validate` when submit encounters it; do not recategorize it as submit merely because the submit promise rejected.
The errors prop is applied with `load` at first commit and with `write` when replaced later.
Some development console warnings are not onError records, so the console and callback need not contain identical lists.

## Handle an imperative failure at its caller

Await `validate()` and `submit()` and catch their rejection where the operation starts.
An input-validation rejection is different from a compile/run failure: the former asks for input correction, the latter has no valid verdict to display.
Use the public error guards and record codes instead of relying on message text or importing internal error classes.
A failure record does not consume the caller's rejection; both channels can describe the same occurrence for different purposes.
Do not put compile/run failures in Form's `errors` prop: the user cannot repair a broken validator by changing a field.
If the validator cannot compile the schema, the form still mounts or resets to it; the failure reaches onError with origin `validate`, once per load, instead of being thrown by `reset()` or `rebuild()`. `validate()` and `submit()` reject with it.
Editing fields never retries a failed compilation. A compile failure is cached for the schema object and validator that produced it, and `rebuild()` with the same schema object and validator reuses it. The one exception is a failure caused by another mounted form registering the same `$id`: once that form releases it, the next full validation retries the compilation once.
To recover from any other failure, fix the cause and supply a corrected schema object or a different validator instance. A new `jsonSchema` prop alone keeps the current tree and does not compile again; the corrected schema object takes effect after its props commit and `reset()` (or a load that replaces the tree).
Without a validator, `validate()` resolves to an empty list without checking anything, and an `if` condition cannot be decided: the fields of both its `then` and its `else` branch stay inactive, so neither branch appears.
`onError` then receives `FormWarningCode.ValidatorMissing` (not in `None` mode) and, for a schema with `if` conditions, `FormWarningCode.ConditionalSchemaWithoutValidator` (in every mode). Both are warning-level records, not load failures; check `record.level` and `record.code` before disabling the form.

## Keep diagnostics from causing another failure

Keep onError handlers small and non-throwing; send records to application diagnostics and let the operation's caller own recovery UI.
A handler exception is itself a failure and does not replace the original one.
Failures with no caller to reject, such as automatic validation and listener exceptions, also go to `globalThis.reportError` (else a window `error` event, else `console.error`); onError does not replace that report.
An exception thrown by a callback that receives a validation result, such as `onValidate`, does not reject `validate()`; it goes to that global report.
If your onError handler throws while a `validate()` or `submit()` failure is reported, the call rejects once with a `FormErrorCode.MultipleErrors` error that holds the original failure and the handler's exception.
Render error boundaries and React can log the original thrown value; duplicate-looking host output is not proof of duplicate onError records.

## Keep reporting valid when a form is hidden

A Form that has been visible once keeps calling onChange, onStateChange, onValidate, onDiagnosticsChange and onError while hidden (a hidden `<Activity>` or a Suspense fallback); showing it again does not replay them. A Form whose first render is hidden calls nothing until first shown; it then delivers the onError records raised while it was built and mounted, and drops the other callbacks from that period. When `reset()` or `rebuild()` replaces the tree (`reset()` after a `jsonSchema` change, a new validator, or `rebuild()`), its records reach onError before the handle switches, so `formRef.current.node` in the handler is still the old root, and the old tree reports nothing afterwards. Each handler failure is isolated, and mount records arrive before the records buffered while the new tree was built. Unmounting does not stop a retained handle or node from writing and calling these callbacks; drop references and stop your own producers when you retire a form. Warnings from rendering fields and writes in their layout effects arrive when the form is shown again. While hidden, the callbacks use the last connected commit except onError, which stays current, and the Form ref is null.
These lifetime rules matter for diagnostics ownership: a record can arrive without a visible input to focus.

## Verify the recovery flow

Exercise each origin your application handles and assert the record code and origin together.
For explicit failures, assert both the rejected operation and the onError occurrence; do not replace either assertion with a console spy.
For listener failures, inspect the resulting value as well as the error because reporting is not rollback.
For rendering failures, assert the affected fallback and that the rest of the form remains usable when its boundary permits it.
For hidden forms or retained references, verify cleanup and prevent retired application work from continuing to write.
Do not count a resolved promise or an empty error list as evidence that validation actually ran.
