# Cross-package defect classes

These are the shapes of defect that earlier bug bounty rounds found in more than one package. A hunter looks for siblings of them in its own area, and a round that finds a new shape appends it with the next number.

## Earlier shapes without numbers

- An indirect reference such as `$ref` moves the location that a decision is keyed on, so a rule reads or writes the wrong place.
- Paths and names that differ only in spelling (encoding, letter case, normalization, byte order marks, empty segments) are handled differently by different code paths.
- Work that happens only inside effects: a hidden `<Activity>` runs cleanup functions without a real unmount, and a server render never runs effects, so state is lost or never created.
- More than one copy of a package in one environment, including peer ranges that are wider than the dependency ranges.
- A Shadow DOM host that the code treats as the document.
- Recursion depth that overflows the stack on deep input.
- Errors that vanish, or state that stays stuck after a callback throws.
- Copy or immutability guarantees that an uncommon path bypasses, so the caller's input is modified.
- Uncontrolled widgets whose display diverges from the form value.
- Scanners that ignore string context or token boundaries.
- Documented examples, configurations and controls that do not work as described.

## Numbered classes

21. A fix that left a case out while its contract still stands: the neighboring inputs and the other surfaces (terminal, documents, other plugins) that the earlier fix did not touch still fail, or a document the fix should have updated still describes the old behavior. For each earlier fix, test its neighbors.
22. Composed operations that differ from the same calls made one by one, such as a batch write against sequential writes, or styles injected separately against one sheet.
23. One identifier shared by every instance or copy on a page: element ids and radio names, nested forms rendered through a portal, a registry that is global to the realm, and a class identity checked with `instanceof` across installed copies.
24. Lookups that read inherited prototype keys from a plain object, such as label maps indexed by a user-provided value.
25. Work done in effects that `<Activity>` re-runs or that a server render never runs.
26. Errors that vanish or state that sticks: a failure swallowed on the way to a report, a degraded status that never recovers, or a callback that throws and leaves a flag set.
27. Documented examples and packaged knowledge that do not match the code, including settings, controls and examples of a plugin that the library does not honor.
28. Scanners that ignore escapes or token boundaries, so a pattern is found inside a string, a comment or an escaped sequence.
29. Values from another realm or another installed copy of a package, which fail checks written for the local constructors.
30. Declarations and `exports` fields that the shipped files do not support.
31. Identifiers derived from a scoped id by a suffix that equal another field's scoped id, so two fields end up with the same DOM id.
32. Sibling implementations of one contract that disagree, such as two plugins that diverge from the core, or default behavior of one plugin that differs from the others.
33. Shared mutable state read across an asynchronous gap or between instances, such as the `errors` property of a compiled validator read after an `await`, schemas that arrive late, or scheduler ids reused after teardown.
34. A virtual or alias path used as the address of stored data, or an absolute path with `..` or `.` segments that is never normalized.
35. State that a hidden, re-suspended or abandoned React tree leaves stale, such as focus or attachments.
36. Recursive or iterative walks without cycle detection that never finish.
37. Inherited prototype members read as data.
38. Scanners that ignore lexical context, including a console format string that is treated as a template.
39. Documents and translations that a fix or a later change did not update.
40. Run-time APIs and type requirements that are newer than the documented environment or consumer configuration, such as an old browser version, an older `lib` setting, `node10` module resolution, `exactOptionalPropertyTypes`, or `require` under `nodenext`.
41. Results that depend on the output mode of a command-line tool, such as terminal against pipe, or machine-readable against human-readable output.
42. Spelling variants of one value that are handled differently, such as a lowercase `z`, Unicode normalization, full Unicode case mapping, or empty reference tokens.
43. Ownership inferred from incomplete evidence about state that another path created: an environment cached by the application is not found where the plugin looks, an overwritten application alias is not recorded because only absent keys are, or a private copy keeps data after the application removes it.
44. Cleanup and bookkeeping scoped to an owner that can disappear or fail first, such as a collected adapter that takes its `FinalizationRegistry` with it, a cap counted per adapter instead of globally, or a failed participant whose plan is dropped from a run-wide set.
45. Accessible names that only the plugin's own renderer supplies, while the core's own inputs read the label identifier directly, including the duplicate-id variant.
46. Numeric schema constraints that a UI value picker does not fully honor: exclusive bounds, steps written with an exponent, a shift step, and keyboard steps from an off-grid stored value.
47. Fallbacks keyed to one error message or one input shape that the fix tested: an asynchronous retry that recognizes only one message, a wrapper that works only when the library inlines the root schema, or any `Error` with an `errors` array taken for the library's own validation error.
48. Batch composition that rebuilds or merges a stored value without consulting the address's own state: recursion only into live children, so a hidden branch is replaced, or any non-object ancestor rebuilt as an object before knowing whether the child emits a value.
49. Walks and identities that cover only the common spelling of a target: a compile-fact walk that misses anchor fragments, keyword subschemas, percent-encoded pointers, or array elements under non-standard keys; `realpath` used instead of the file's inode; `Object.keys` used instead of every own enumerable key.
50. Display state that a fix converted on one surface or at mount only, such as a read-only transition, a tooltip that still shows library coordinates, or a label reference that overrides the visible label.
51. Identity scoped to one module copy or realm that the code assumes is the only one, such as `useId` counters per `react-dom` copy, or a stylesheet built with the importing realm's constructor for another document.
52. Retry or reset keyed to a callback's identity, which a reporting callback then changes.
53. Verification profiles whose class labels are not tied to the inputs they construct.
