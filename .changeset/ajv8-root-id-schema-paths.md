---
"@canard/schema-form-ajv8-plugin": patch
---

Validation issues from a root schema that declares `$id` now report `schemaPath` as the authored `#/…` fragment, such as `#/properties/a/type`, in all three entry points. Before, they carried an internal `https://canard.invalid/ajv8/root/N/…` address, so the form could not match them to `oneOf` and `anyOf` branches and showed inactive-branch errors on array item fields.

A `not` issue no longer borrows `rejectedKey` from the root's `required` list. In a root with `$id`, a `not: { const }` error on a required string field now stays on that field instead of moving to the root, and a root-level `not: { required: [key] }` reports its key. An issue inside a nested `$id` resource that validation reaches through `$ref` keeps AJV's path (for example `urn:item/not`), carries no `rejectedKey` and stays on the object that holds the value.
