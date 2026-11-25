# Recovering speed without changing behavior

These techniques apply when a measured row is over its limit and the code must get faster while every observable behavior stays the same. Each states the failure it prevents. [`DESIGN.md`](DESIGN.md) covers how the row is measured; this file covers what to do with the number.

## 1. Let the profile choose the change

Profile the baseline and the candidate on the row (`compare/run.mjs --profile`) and name the functions that hold the extra time, with their share. Change the smallest thing that removes that time. A change designed from reading the code alone usually does not pay when measured, and it still costs a review and a verification.

## 2. Prove correctness before measuring

The package typecheck and its whole test suite pass, unmodified, before any speed number is taken. A change that fails a test is fixed or discarded, never measured: a number from a build that does not pass its tests describes a different program. Tests and assertions are not edited to make a change fit.

## 3. Keep only changes that pay

Keep a change only when min and p10 both improve by more than 2% of the baseline time on a valid run of at least 12 rounds, or 24 rounds when the gain is under 5%. Measure the other rows of the same package in the same run so a gain on one row is not a loss on another. A change that does not pay is discarded before it is committed: unpaid code is complexity with no return, and it hides which commit bought the gain.

Spend rounds by the decision they serve: 6 while exploring, 12 to decide whether a change pays, 24 once per row for the number that is reported. Repeat at 24 any 12-round result that is void or within 3% of the decision line.

## 4. Compare numbers only within one runtime version

A "before" and an "after" are comparable only when both were measured on the same runtime version. The cost of built-in work, such as capturing an error stack, differs between Node versions by more than most improvements, so a before taken on one version and an after taken on another reports a regression or a gain that no commit caused.

## 5. Attribute what remains with a diagnostic build

When a row stays over its limit and the remaining time is work a fix requires, prove it instead of asserting it. Make a temporary build that skips only that work, show with the kit that the gap closes, and name the public test that fails or the behavior that is lost without it. This is the one build that may be measured although it fails tests, and it is never committed. Without it, "the rest is the cost of the fix" cannot be told apart from "the rest was not found".

## 6. Stop on a rule

Stop when the row is within its limit, or when two consecutive profile-guided attempts bring no paid change. What is left then goes to the owner with the attribution numbers, as a decision to accept the cost or to approve a redesign. A redesign is not started without that approval.

## 7. Verify by difference, independently of the author

Before a change merges, someone other than its author compares the build with the change against the build without it, from outside the repository:

- **Drive the public entry**, both the ESM and the CommonJS one, and compare everything a consumer can observe: return values, the class and message of thrown errors, and the calls made on objects the caller supplied.
- **Count the inputs that reach the new code.** An input that falls back to the old path proves nothing about the new one, so generated inputs are steered until a large share takes the new path, and that share is reported.
- **Attack what the author's own tests did not generate**: the boundaries between the readers or passes the change merged, shared mutable state that survives a call (a `lastIndex` on a sticky or global pattern, a cache), re-entrancy, and inputs large or deep enough to throw. A change must not alter which inputs throw.
- **Time each class of input** and flag anything that grows faster than linearly.
- **Plant one deliberate difference** in a temporary copy and confirm the comparison reports it. A harness that has never failed has not shown that it can.

The report states the number of inputs compared, the number that took the new path and the number that differed. A difference is closed by narrowing where the new path applies, not by arguing that the input is unlikely.

## 8. Record behavior defects, do not fix them

A defect found while optimizing is written down with a reproduction and left unchanged in the speed change. Fixing it there changes behavior under a title that promises none, and makes the before and after numbers describe two different behaviors.
