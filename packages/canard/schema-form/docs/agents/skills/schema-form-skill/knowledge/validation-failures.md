# Handle failures separately from invalid input

Treat `onError` as an occurrence channel for diagnostics and operation failures.
It is not a current list of field errors and does not announce that an earlier problem has resolved.
Use the issue list for input corrections, and use records to decide which application operation needs attention.
Read [validation UX](validation-ux.md) for verdicts and server issues, and [error feedback](error-feedback.md) for their messages.

## Route a report to the operation that can recover

Inspect a record's origin together with its code and severity; origin alone does not say whether a form is unusable.
The origin identifies the operation that opened the reporting chain, not the component that happened to receive the callback.

| Origin | Where it comes from | Consumer response |
| --- | --- | --- |
| `load` | Construction diagnostics and the mount/reset/rebuild/validator-change load chain | Check schema, defaults and validator setup; inspect the resulting form before deciding whether to retry the load. |
| `write` | Public value/state/array/context/external-error writes and the listeners they notify | Inspect the write or listener that failed; re-read the result rather than assuming an exception rolled back the edit. |
| `validate` | Whole-schema compilation, automatic or explicit validation, verdict delivery and its listeners | Distinguish validator failure from invalid input; catch explicit call rejection and correct the validator/schema configuration. |
| `submit` | A degraded form blocking submit, or a failure first captured by native submit | Stop the submission flow, preserve input, and handle the underlying failure before retrying. |
| `render` | Injected component boundaries and render warnings | Fix the component/configuration at the reported field; do not translate a rendering failure into a validation issue. |

Construction records remain `load` even if a different operation requested construction.
Within an existing engine chain, nested operations keep the outer origin: a write in reset's onChange can be `load`, while reset from a write listener can be `write`.
A failure already reported during validation keeps `validate` when submit encounters it; do not recategorize it as submit merely because the submit promise rejected.
The errors prop is applied with `load` at first commit and with `write` when replaced later.
Some development console warnings are not onError records, so the console and callback need not contain identical lists.

## Handle an imperative failure at its caller

Await `validate()` and `submit()` and catch their rejection where the operation starts.
An input-validation rejection is different from a compile/run failure: the former asks for input correction, the latter has no valid verdict to display.
Use the public error guards and record codes instead of relying on message text or importing internal error classes.
A failure record does not consume the caller's rejection; both channels can describe the same occurrence for different purposes.
Do not put compile/run failures in Form's `errors` prop: the user cannot repair a broken validator by changing a field.
The automatic load validation slot keeps an adopted tree when compilation fails and reports the failure rather than undoing that tree.
An explicit validate/submit can still reject; the asynchronous load-slot failure itself is not a synchronous reset exception.
Repeated input does not repair a cached compile failure. Resolve configuration or registration conflicts and use the supported reset/rebuild/validator lifecycle as appropriate.
With no validator selected, an empty issue list means no verdict, and if branches cannot be evaluated; a warning can explain the configuration omission.
The missing-validator warning is suppressed in None mode; an if condition without a validator can still produce its separate conditional-schema warning. A missing validator is not itself a fatal load failure. Check the code/severity before disabling the form.

## Keep diagnostics from causing another failure

Keep onError handlers small and non-throwing; send records to application diagnostics and let the operation's caller own recovery UI.
A handler exception is itself a failure and does not replace the original one.
Automatic work and failures without a caller also use the host error channel; adding onError does not make those failures disappear.
Validation-result listener failures are callerless even during explicit validation, so validate can resolve while a failing listener is reported to the host.
A rejected aggregate can remain one value for its caller while onError delivers individual occurrence records.
Do not rely on the host always receiving individual leaves: malformed, cyclic, unreadable or over-budget aggregates remain opaque.
Render error boundaries and React can log the original thrown value; duplicate-looking host output is not proof of duplicate onError records.

## Keep reporting valid when a form is hidden

After the first layout preparation, a current load continues delivering engine-chain callbacks while hidden; showing it does not replay them.
A never-prepared load buffers construction records but drops ordinary changes, state notifications and diagnostics.
On a root-replacing reset, mount records precede buffered construction records and are delivered before the handle binding switches, so onError can still read the old handle.node. A retired load drops subsequent records. Do not retain an old node to observe the replacement form.
React hiding and unmounting cannot be distinguished by this binding, so retained handles/nodes can still deliver callbacks after unmount.
Release subscriptions you own and stop external producers when the application retires a form.
While hidden, ordinary callbacks use the last connected commit, whereas onError stays current; the Form ref is null.
Render-time warnings and child layout-effect writes can arrive when the form is shown again.
These lifetime rules matter for diagnostics ownership: a record can arrive without a visible input to focus.

## Verify the recovery flow

Exercise each origin your application handles and assert the record code and origin together.
For explicit failures, assert both the rejected operation and the onError occurrence; do not replace either assertion with a console spy.
For listener failures, inspect the resulting value as well as the error because reporting is not rollback.
For rendering failures, assert the affected fallback and that the rest of the form remains usable when its boundary permits it.
For hidden forms or retained references, verify cleanup and prevent retired application work from continuing to write.
Do not count a resolved promise or an empty error list as evidence that validation actually ran.
