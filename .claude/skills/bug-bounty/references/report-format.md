# Round documents

The record of round N lives in `bug-bounty/round-N/`. From round 3 on, write it in English, in complete sentences without abbreviations. Rounds 1 and 2 are written in Korean and stay as they are; their headings map to this format as "버그가 아니라고 확인한 가설" to "Hypotheses checked and not bugs", "확인하지 못한 가능성" to "Open leads", "다시 볼 영역" to "Areas to revisit", and "우선순위를 낮출 영역" to "Areas to lower".

## Layout

- `README.md`: the round index. Write it last; its presence marks the round finished.
- `<package-slug>.md`: one document per package that a hunter covered, such as `canard-schema-form.md` or `winglet-json.md`. A covered package without findings still gets a short document that says so and lists its checked hypotheses, so the next round does not repeat them.
- `probes/<package-slug>/<hunter-id>/`: copies of the probes. Rounds 1 and 2 used flatter folders; from round 3 on, every probe sits under its hunter id. Copies do not run in place, because path aliases and relative imports do not resolve there, and editors show TypeScript errors for them. Each document says where to copy them and which command runs them.
- `.progress/`: the working brief and progress note, deleted when the round is cleaned up.

## Rules

- Order findings by severity. Once a document is published, its item numbers never change, because other documents and the fix group cite them; a finding added later takes the next number.
- One root cause has one home: the document of the package that owns the cause. Documents of other affected packages list their own symptoms and cite that item by number.
- State the verification level of every finding that is not a failing public-API probe: an internal fixture, a built `dist`, or a static check.
- Cite an earlier round as `../round-K/<file>.md` plus the item number, and never edit it.

## Package document

```markdown
# <package name>: bug bounty round N

<Number of new findings. A sentence saying that items in earlier round documents (linked) were treated as fixed and excluded. A sentence saying that the main session re-ran every probe, with any exceptions.>

Probes: [probes/<package-slug>/](probes/<package-slug>/)

- <Where to copy them and the command that runs them.>
- <Failing tests that are not findings, with their roles, and the control tests that pass.>

Root-cause files: <common path>

## 1. <The observable failure in one sentence>

- Severity: <level>. <What goes wrong for whom.>
- Affected public API:
- Contract violated: <file:line or standard clause>
- Root cause: <file:line and mechanism>
- Relation to earlier rounds: <"Same class as round K item X" or "New class">
- Reproduction: <test name, actual result, expected result>
- Confidence: <level and verification level>

## Hypotheses checked and not bugs

## Open leads
```

Omit the last section when it would be empty.

## Round README

```markdown
# Bug bounty round N

<A sentence saying that earlier rounds (linked) were treated as fixed, the base commit, files already modified when the round started, the number of items and of distinct root causes, and how they were verified.>

## Areas and angles
<Per hunter: id, area, and angle ids used, marking the angles used in that area for the first time.>

## Package documents
<Table of package, count, and document link.>

## Priorities
<Each critical and high item in one sentence, then the medium items in one paragraph.>

## Cross-package classes
<Bug classes this round exposed, with their items. Next round's hunters look for siblings in this list.>

## Areas to revisit
<Areas whose hunter reached the cap, and areas whose new angles produced a high or critical finding.>

## Areas to lower
<Areas whose new angles produced nothing at medium or above in two consecutive rounds, or "None".>

## Probes and verification limits
<Where the probes are and how to run them, and the limits of the verification levels.>
```
