# Hunter brief template

Copy only the text below the divider to `bug-bounty/round-N/.progress/brief.md`, fill every `{{…}}` placeholder, and point every hunter at that file.

---

# Bug bounty round {{N}}: shared hunter brief

You hunt bugs in the albatrion monorepo at `{{REPO_PATH}}` (yarn workspaces, branch `{{BRANCH}}`, base commit `{{BASE_COMMIT}}`). Your hunter id and area are in your prompt.

Files already modified in the working tree when the round started: {{UNCOMMITTED_FILES}}. Their lines may differ from the base commit; cite what you read.

## Scope of reading

Read, search, and cite only the main working tree at `{{REPO_PATH}}`. Other git worktrees inside it ({{OTHER_WORKTREES}}) are copies that a fix group is editing; exclude them from every search, for example by passing a path under `{{REPO_PATH}}/packages/` to Grep and Glob.

## Earlier rounds count as fixed

Earlier findings are recorded in {{EARLIER_ROUND_DIRS}}. Each folder has a `README.md` index and one document per package. Read the documents your area names before you start.

- Do not report an earlier finding again, and do not report a finding with the same root cause (same function, same mechanism).
- A new instance of an earlier class in a different function or package is a new finding. Name the earlier item it is a sibling of.
- Items an earlier document lists under "Open leads" (Korean in rounds 1 and 2: "확인하지 못한 가능성") are open leads. Confirming one with a failing probe is a new finding; cite the document.
- If a probe trips over a known bug, work around it rather than report it.
- Do not re-check the hypotheses an earlier document lists under "Hypotheses checked and not bugs" (Korean in rounds 1 and 2: "버그가 아니라고 확인한 가설").

Classes found so far, to generalize into your area:

{{CLASS_LIST}}

## Quality bar

Correct behavior means, in this order: compliance with any standard the package implements, predictable behavior, and a reasonable interface. Predictable means that equivalent inputs and equivalent call orders give equivalent results, and that nothing changes silently across lifecycles. A reasonable interface is one whose types, names, and documents say what happens, and whose failures surface instead of vanishing. Use this order to decide the expected result a probe asserts, above all where the documents are silent.

Report a finding only when all three hold:

1. A consumer can hit it through the public API, or a documented extension point, with usage or input that a real application plausibly produces.
2. It contradicts a contract, basic correctness, or predictability. Contracts are README files, `docs/**`, `docs/agents/**`, `INTENT.md` and `DETAIL.md`, JSDoc, public types, `.changeset/*.md` at the repository root, and any standard the package claims to implement. Basic correctness covers crashes, hangs, leaks, stack overflows, wrong or stale values, lost updates, data loss, failure reported as success, and a crossed security or isolation boundary. Equivalent inputs that give different results qualify even where no document addresses them, and so does an input that the public types accept but the implementation mishandles.
3. A probe you ran fails because of it, and you can state in one sentence what goes wrong for whom.

Not findings:

- Style, naming, typos, and refactoring wishes.
- Performance short of pathological. Pathological means super-linear growth on realistic input, ReDoS, or a hang.
- Inputs that the types or documents exclude (for example `Infinity` as a hash seed, or `NaN` where the type says JSON), unless the code claims to accept them.
- Behavior that a document and a test both pin deliberately. Report a contract conflict only when a consumer-facing document contradicts it.
- A documentation slip that would not change what a reader does.

A quality defect without a strict contract qualifies when its consumer impact is concrete: console noise in production, packaging that silently installs a second copy of a peer, or broken accessibility of a core interaction.

## Severity

- Critical: crosses a security or isolation boundary, or destroys data outside the intended scope.
- High: silently wrong, lost, or dropped data in common usage; a broken core guarantee (immutability, idempotence); failure reported as success.
- Medium: a crash, leak, or visibly wrong behavior in plausible but less common usage; broken accessibility of a core interaction.
- Low: rare inputs, development-only noise, misleading documentation, packaging problems found only statically.

## Method

- Learn the contract from the documents, form hypotheses from the code, and write a minimal probe that fails when the bug exists. Run it.
- Your area lists angle ids. They are defined, with examples, in `{{REPO_PATH}}/.claude/skills/bug-bounty/references/angles.md`; start with the equivalence checks among them.
- For differential testing, the root `node_modules` holds reference implementations installed as transitive dependencies: `lodash`, `lodash-es`, `es-toolkit`, `fast-json-patch`, `dataloader`, `clsx`, `postcss`, and `ajv`. Check a library's version in `node_modules/<name>/package.json` before relying on version-specific behavior. `fast-check` is not installed, so write a small seeded generator.
- Prefer the public API that consumers import. State the verification level of each finding: public API, internal fixture, a built `dist`, or static only.

## Rules

- Write probe files only under `<package path>/src/__bounty__/<your hunter id>/`, where `<package path>` is the workspace directory (such as `packages/canard/schema-form`). Name test files to match the package's Vitest include globs (read its `vite.config.ts`). In `@canard/schema-form`, `*.test.ts` runs in project `unit` and `*.test.tsx` in projects `render` (React 19) and `react18`. A type-level probe may add its own tsconfig in the same folder, run with `yarn workspace <workspace name> exec tsc -p src/__bounty__/<your hunter id>/<tsconfig file>`. Modify no other file, and leave your probes in place when you finish.
- Others work in this repository during the round, and commits may land. Never run state-changing git (`commit`, `add`, `stash`, `checkout`, `reset`, `restore`, `clean`); read-only git is fine. If code you depend on changes under you, re-run your probe before reporting.
- Do not fix bugs, and do not rebuild packages.
- Run tests with `yarn workspace <workspace name> test --run <path relative to the package>`; add `--project unit|render|react18` for `@canard/schema-form`.
- Sandbox rules: `yarn` and `git` must each be the only command in their Bash call, with no pipe, no `cd`, no environment-variable prefix, no `2>/dev/null`, and no `| tail`. Long output is saved to a file automatically; read it in a separate call. Read source with Read, Grep, and Glob.
- A probe that writes files works only inside a temporary directory under `os.tmpdir()`. Never point a tool at `~/.claude`, `~/.agents`, or the repository.
- `@slats/agents-assets-sync`: its existing end-to-end suites skip themselves while files under `src/` are newer than `dist/`; ignore those skips.

## Output

Your final message is all the main session sees, so report derived results and no raw dumps.

Report up to 20 findings ranked by severity. Never pad the list to reach the cap. For each finding give:

- A one-sentence title stating the observable failure.
- Severity, with the reason.
- Consumer impact: one sentence on what goes wrong for whom.
- Affected public API.
- The contract violated, cited as file:line or a standard clause.
- Root cause as file:line, with a mechanism of two or three sentences.
- Sibling of: an earlier item, or "new class".
- Reopens: if `git log -L` on the root-cause lines shows a commit that fixed an earlier bug bounty item, that item and commit; otherwise "no".
- Probe path, test name, actual versus expected, and the command that runs it.
- Verification level and confidence.

Then add four lists:

- Saturation: qualifying findings beyond the cap, one line each, or "none".
- Failing tests in your probe files that are not findings, each with its role (diagnostic, measurement, or rejected hypothesis).
- Hypotheses you checked that are not bugs, one line each, grouped by package.
- Angle ids you used.

Zero findings is an acceptable, honest result.
