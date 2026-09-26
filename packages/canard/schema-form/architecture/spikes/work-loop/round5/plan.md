# Round 5 cost analysis plan

Planning method: seiri:write-plan default, constrained by the user's read-only engineering brief.

1. Read HANDOFF decisions, round-4 corrections, inherited constraints and v3/v4 reports. Treat F29–F32 as superseding earlier text; compare retired options without recommending them.
2. Map each option to v4 slots, stages and public surfaces. Search all src test directories; record exact declarations and distinguish required assertion/fixture rewrites from unchanged regression coverage and missing cases.
3. Measure costs not represented by existing reports with isolated Node processes per case and repeated samples, reporting medians and limitations. Keep scratch only in this directory; never edit src or existing prototypes.
4. Write architecture/reviews/raw-round5-cost.md in Korean with every option, evidence, API sketches and reversibility/interactions. Verify citations, counts, measurement records and source immutability.

Review: grounded-only. Referenced paths were found through rg and local reads. No implementation direction or public contract is being chosen. This read-only analysis uses direct execution rather than the implementation gate workflow; no production build/test rerun is required for a report-only change. The report's citations, counts, scratch measurements and source hashes are the verification surface.
