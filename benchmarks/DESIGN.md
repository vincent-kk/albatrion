# Designing a speed comparison

These techniques apply to any harness that decides whether one build is slower than another. Each states the failure it prevents. [`compare/`](compare/README.md) is one implementation of them.

## 1. Fix the question before the design

Write down the verdict the measurement must produce (for example "candidate / baseline by min and p10, pass at 1.03 or less") and the unit it is produced for (one public call with one fixed input). Everything the harness does must be needed for that verdict. A feature that does not change a verdict is cost: it delays the first number and adds its own defects. A harness that has not produced a number yet has proven nothing, so reach a first real measurement with the smallest design and extend only from an observed problem.

## 2. Make wrong setups impossible instead of detecting them

Prefer a structure in which the mistake cannot happen over code that checks for it. The standing example is dependency identity. A harness that lives outside the measured tree and loads the product from it can load a second React, or resolve a third-party package from the wrong tree, and then needs resolution hooks and comparisons to detect that. A harness copied into the measured tree and run there resolves every bare import the way a consumer of that tree does: one React, the tree's own dependency versions, the package's published entry. No check is needed because there is nothing left to get wrong.

## 3. Measure what ships

Import the package by name so the manifest `exports` choose the built entry. Never import `src`, never pass a `source` condition, and never reach an internal file: internals differ between the two builds, and source runs through a different compiler path than the artifact a consumer receives. When the behavior of interest is internal, drive it through the public call that reaches it and say so in the row.

## 4. Build both arms the same way, from frozen trees

Each arm is a full checkout at one commit with its own install and build, never a mix of one tree's source and another's dependencies. Record the commit of each tree in the output. When the lockfiles differ in a dependency that affects a row, measure that row against a variant tree with the dependency aligned, and record the variant.

## 5. One fresh process per measurement, order rotated

JIT state, heap shape and inline caches from one arm change the next arm's numbers when they share a process. Run each arm in its own process. Machine drift (thermal state, background load) is correlated with time, so interleave the arms and rotate through every order equally; a fixed order turns drift into a false difference.

## 6. Carry a control in every row

Measure the baseline twice per round (A1 and A2) and the candidate once (B). The verdict is B/A1; the control is A2/A1. Two runs of the same code must agree, so a control outside its window (0.98 to 1.02) means the row's noise is larger than the effect being judged, and the row is void rather than pass or fail. A control measured once for the whole run does not protect a noisy row.

## 7. Validate the harness by measurement

Two runs prove a comparison harness better than unit tests of its parts:

- **Null run**: both arms point at the same tree. Every ratio must be near 1.00. This shows the noise floor per kind of row.
- **Planted slowdown**: a row whose candidate arm does a known amount of extra work (10%). The reported ratio must match. This shows the harness can see an effect of the size it is asked to judge.

Rerun both whenever the timing or statistics code changes.

## 8. Statistics that match the noise

Noise in timing is one-sided: interference only adds time. The minimum and a low percentile (p10) estimate the undisturbed cost; the mean and median move with interference and are diagnostic only.

A minimum over single operations is an extreme value and is unstable for anything slower than a tight loop. Time a batch (enough operations to last 5 to 10 ms) and use the per-operation mean of each batch as one sample. Calibrate the batch size once per row and give the same size to every arm: different batch sizes change the mix of warm and cold work and bias the ratio.

## 9. Warm up by time, time only the operation

Warm up for a fixed duration, not a fixed count: a count that suits a nanosecond call leaves a millisecond render half optimized, which shows up as samples still falling during measurement. Inside the timed region keep only the operation. Build inputs before it; check the result, unmount and reset after it. Check every result, since a row that silently measures an error path produces a confident wrong ratio, and keep the result alive so the call cannot be optimized away.

## 10. Hold the environment constant and state it

Use the same runtime flags and environment for every arm, set by the harness rather than inherited: `NODE_ENV=production` for React, an empty `NODE_OPTIONS`, garbage collection exposed and triggered before sampling. Run one measurement at a time on the machine, and enforce it with a lock rather than a convention when several people or agents can start one. Record the runtime version and CPU in the output.

## 11. One row, one file, one stated input

A row is a small module: its identity, the fixed input, and the operation. A reader can audit it without knowing the harness, and a new row never edits shared code. Record where the input comes from and whether it is ordinary input or input that reaches a deliberately changed code path; that classification decides whether a slowdown is a regression or the cost of a fix.

## 12. A failing row is void, the run continues

A row that throws, fails its check or exceeds its time limit is recorded as void with the reason, and the next row runs. Write the output after every row so an interrupted run keeps what it measured.

## 13. Treat borderline results as unmeasured

A ratio within the null-run noise of the threshold is not a verdict. Rerun that row with more rounds before acting on it.
