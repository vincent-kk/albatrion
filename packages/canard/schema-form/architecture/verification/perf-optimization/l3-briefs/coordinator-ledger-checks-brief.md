# Coordinator ledger checks brief (read-only)

Repository and workspace: /Users/Vincent/Workspace/albatrion. Package: packages/canard/schema-form. This worker validates coordinator documentation in the main workspace; do not cross into the nested Orca work folder, edit source, or create a PR.

Orca rules: do not run run-use or coordinator commands. Check follow-ups only with check --terminal <the live preamble handle>. Ask using the live preamble ask command. Do not start agents. Run CLIs standalone without pipes, semicolons, redirects, or environment prefixes. No installation, permission workaround, Git mutation, source edit, or edits to any tracked files. Generated artifacts and logs belong only under TMPDIR.

## 0. Baseline

Read repository rules and packages/canard/schema-form/CLAUDE.md. Record current HEAD and changed paths. Read architecture/AGENT-HANDOFF.md section 4 and HANDOFF.md section 4. The coordinator has recorded owner round 409 and updated orchestration briefs; the dispatch identifies later rounds if applicable. Do not assume that changing directories grants access to a tool-blocked path; report any boundary restriction instead.

## 1. Checks

Run the complete existing architecture ledger checks against the main workspace: verbatim-check, sup-check, ref-check, owner-cited, bundle, all seventeen sentence-check areas, tokens inventory and check, plan-links, doc-coverage, and git diff --check. Resolve documented command globs in the normal shell. Do not run expand-split-pointers unless split items actually changed; report whether it is applicable. Replace output paths with a unique TMPDIR subdirectory. Do not use the illustrative tail/head pipelines in HANDOFF: capture the entire output in the context-mode analysis subprocess and summarize it there. Run each executable command standalone. Do not weaken checks or treat exit zero alone as proof; inspect all missing/error counts.

Expected: verbatim/sup/ref failures zero, all owner answers cited, all seventeen sentence areas missing zero, token missing 468 after the round 409 diagnosis, plan links valid, doc-coverage only the established uncited LANDING-209 and LANDING-210. The inherited 471 was not reproduced: the original baseline was 470 and two reductions were traced to a newly satisfied owner quote and a historic round moved from HANDOFF to PLAN-LOG. Compare token deltas if the input changes; never hide an unexplained new missing token. If any other finding appears, report the exact current result and path:line; do not fix or infer acceptance. Verify the owner round 409 original-quote rows match their TSV and landing citations exactly.

No product typecheck/lint/test/build is needed for a coordinator documentation-only change. Do not claim those product gates were run.

## 2. Report

Write a report under TMPDIR with commands, complete check summaries and source tree identity. Also include the complete derived check-count table directly in the worker_done message so the coordinator can inspect the computation evidence without reading outside its tool workspace. Report in complete formal Korean sentences: HEAD, changed paths, each expected count, every unexpected finding, generated artifact/report paths, and unchanged source tree. Send worker_done exactly once with live Task and Dispatch IDs, explicit succeeded/failed and actual report path, then idle. A subsequent check cycle requires a new coordinator Dispatch.
