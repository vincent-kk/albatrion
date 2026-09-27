# Merge restructure review

Reviewed the merge correction committed as `f09033cf` against baseline `f7eef9ed9` and the preceding module contracts. No blocking discrepancy was found in this correction. This verdict does not complete foundation-and-blueprint stage 02 or its PR gates.

## Source and boundary checks

- The former flat `src/utils/object/merge.ts` is absent. The independent merge module contains its documents, named-export entry point, dispatch wrapper, internal recursive implementations and owner-local verification files.
- The public wrapper chooses default/options mode once and evaluates `options.arrayStrategy === 'replace'` once. `mergeWithOptions` receives `replaceArrays: boolean` on every recursive call; neither implementation recurses through the public wrapper.
- Default recursion preserves the baseline body after the function/callee rename and removal of the option dispatch. Parent/root exports reach the module entry point, including `MergeOptions`.
- The option implementation directly imports ancestor property primitives. Inspection of those primitives and the filter entry found no return dependency to merge. This is a scoped import check, not a full dependency scan.
- Both existing test suites moved into the merge owner's `__tests__`. The default suite changes only its import. The ten existing option cases preserve their assertions apart from formatting; its contract marker/import changed and one getter regression case was added.
- Benchmark and loader now live inside the same owner's verification tree. The benchmark configuration discovers the new path. Ordinary test patterns exclude these filenames; declaration configuration excludes `**/__tests__/**`. The generated dist inventory contains no benchmark/loader paths.

## Evidence reviewed

The final raw logs in `/tmp/schema-form-foundation-blueprint/` were inspected directly. Designated common-utils `lint`, `typecheck`, `test --run` and `build` all exited 0; tests passed 145 files and 1,166 cases. Tests and scans were not duplicated for this review.

`merge-restructure-regression.log` retains worker-captured diagnostic excerpts: the original two suites passed 22 cases before relocation, and the getter case failed with `expected 6 to be 1` during a temporary pre-hoist probe. These are summaries rather than complete raw transcripts. The final full test log and source inspection confirm the restored boolean implementation and passing getter case.

## Performance limits and outstanding work

The fixture and loader use the same TypeScript compilation/injection mechanism for both baseline and candidate. The initial loading-path mismatch is retained and excluded from performance interpretation. Earlier pre-hoist measurements remain separate from final measurements.

All four final paired JSON reports were reviewed. Throughput changes vary: default ranges from -8.15% to +63.89%, replacement from +0.41% to +19.60%, and index merging from -4.61% to +10.58%. The fourth run, after benchmark relocation, reports -3.38%, +12.33% and +10.58%, respectively. Default run 3 has identical medians despite its large throughput difference. These measurements do not establish performance non-regression or consistent acceleration.

The detailed distributions, source hashes and evidence links are in [merge-restructure.md](./merge-restructure.md). Slower observations remain visible for owner acceptance where the stage gate requires it. PR-wide filid/seiri gates, broader benchmarks and the unfinished stage 02 work remain outstanding; no full scan was run during this correction review.
