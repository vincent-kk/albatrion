# Micro-hygiene device

The product baseline is the merged branch-switch stage head. This adapter reuses IV-2's window structure, the B9-1 immutable public/stage preparation, the original 22-row alternating CLI, and IV-1's row summary, `weightedExchange` and `judgeStage` without changing their timing loops. Stage reductions are reported; this cleanup promises no speedup. Every public row must avoid an outside-width regression, including mounts, and weighted exchange must be at most zero. Zero is acceptable.

IV-2 allocation diagnostics, exit-only self attribution, cold lazy-scope costs and the wide-bucket allocation history probe are excluded. This change introduces no lazy scope, resident cache or allocation hypothesis requiring those measurements. The ordinary Node/Bun heap protocol and four retained-state rows remain.

Run the adapter with Node 26. All source and device files must be committed before preparation, and every prepared root must end in `.noindex`. Pass existing archived and built baseline bytes; these scripts never fetch or install dependencies.

```sh
node tools/micro-hygiene/prepare.mjs --baseline="$BASELINE_PACKAGE" --root="$PREPARED_ROOT" --baseline-commit="$BASELINE_SHA" --candidate-commit="$CANDIDATE_SHA"
node tools/micro-hygiene/checkLoad.mjs "$PREPARED_ROOT"
node tools/micro-hygiene/rehearse.mjs "$PREPARED_ROOT"
# Request coordinator permission before the short pilot.
node tools/micro-hygiene/pilot.mjs "$PREPARED_ROOT" --authorized "$AGENT_PID"
# Request separate permission after presenting the 1.2–1.4 pilot ratio.
node tools/micro-hygiene/window.mjs "$PREPARED_ROOT" --authorized --agent-pid="$AGENT_PID"
node tools/micro-hygiene/summarize.mjs "$PREPARED_ROOT" "$RAW_OUTPUT"
```

Paths above are relative to `architecture/verification/branch-switch`. The real-CLI rehearsal is one row, one worker, warmups 1 / samples 1, with no formal marker. The pilot runs one paired process per row with 20/100, and the formal window uses ten processes per lane per row with 20/100 and legacy quality. Preserve every refusal or failure and ask the coordinator; never rerun automatically. The shared quiet gate retains 120 seconds for ordinary load and 600 seconds for Spotlight-class load, with top-ten name/CPU evidence.

`checkDeclarations.mjs <baseline-package> <candidate-package> <output>` compares the full declaration graph after expanding only the canonical aileron utility synonyms. The seven generic type proofs are retained with the raw results. Raw changed declaration bytes and hashes remain available even when normalized ASTs agree.

## Owner-authorized short window

Candidate 2 uses four real processes per lane (176 paired processes total), warmups 20 / samples 100 and legacy quality. The explicit `--short-window=true` flag permits four in the canonical CLI; its default ten-process path, worker timing loop and original row estimator stay unchanged. A and A-prime contain two disjoint A processes each, and B uses all four. Wider uncertainty is retained. The owner omits the pilot, stage ledger and retention; Node/Bun heap checks remain.

After all static gates are green, prepare a fresh root and run the same untimed smoke. Use `rehearse.mjs "$PREPARED_ROOT" --short-window` for one real worker / warmups 1 / samples 1 without a formal marker. Then run `short-window.mjs "$PREPARED_ROOT" --authorized --agent-pid="$AGENT_PID"` once and `short-summarize.mjs "$PREPARED_ROOT" "$RAW_OUTPUT"`. Preserve every refusal or failure and ask instead of retrying. Source and device bytes must be committed before preparation.
