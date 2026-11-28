---
'@canard/schema-form': patch
---

Field errors from a `oneOf`/`anyOf` branch the form did not select are now hidden for recursive definitions, references whose target holds another reference, alias chains and references the validator compiles separately (`inlineRefs: false`); they used to stay visible next to the selected branch's errors. A real error is no longer hidden when the root schema has its own `oneOf` and nested items repeat it: such an item's error was attributed to the root's branch, so the selected branch's error disappeared while another branch's error showed. An error the form cannot attribute to a branch stays visible, such as an error inside a separately compiled reference whose `schemaPath` shows neither a branch nor a definition. `validate()`, `getErrors()` and the validity verdict are unchanged.
