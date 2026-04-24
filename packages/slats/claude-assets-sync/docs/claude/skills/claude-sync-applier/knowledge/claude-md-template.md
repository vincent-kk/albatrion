# `CLAUDE.md` — `## Claude Docs Injector` section

Reference: `packages/canard/schema-form/CLAUDE.md`.

Append the section below to `${TARGET_PATH}/CLAUDE.md` if the file exists.
Substitute `@canard/schema-form` → `${PACKAGE_NAME}`. Skip the entire step if
`CLAUDE.md` does not exist (do not create one).

The template is intentionally terse: CLI usage + essential isolation warnings.
Architectural rationale (three-layer isolation model, silent no-op design,
stub mechanics) lives in this skill's `knowledge/gotchas.md` — do not
duplicate it into every consumer's `CLAUDE.md`.

---

## Template

````markdown
## Claude Docs Injector

Thin CLI stub that injects `docs/claude/` assets into the user's `.claude`
directory. Engine: `@slats/claude-assets-sync`.

```bash
npx claude-sync --scope=user                 # ~/.claude
npx claude-sync --scope=project              # nearest existing .claude walking up from cwd
npx claude-sync --scope=user --dry-run       # preview
npx claude-sync --scope=user --force         # overwrite local edits

npx -p @canard/schema-form claude-sync --scope=user  # transitive-dep context
```

### Isolation Guardrails

- `src/**` MUST NOT import from `bin/**`, `docs/**`, or `@slats/claude-assets-sync`.
- **Never add `./bin/*` to `exports`.**
- `yarn depcheck` enforces the isolation in CI.
````

---

## Substitution Rules

- Replace `@canard/schema-form` with `${PACKAGE_NAME}` (one occurrence, in the
  `npx -p` line).
- Preserve the Isolation Guardrails bullets verbatim — these are the sharp
  invariants that must stay consistent across consumers.

---

## Placement & Skip Conditions

- Append to end of `CLAUDE.md`. Ensure one blank line before the injected
  section.
- `${TARGET_PATH}/CLAUDE.md` does not exist → skip, report "skipped (no CLAUDE.md)".
- Section already present with identical content → skip, report "unchanged".
- Section present with different content → ask user, do not clobber.

---

## What Was Deliberately Removed

If a previous version of this skill injected a longer template, these parts
were intentionally dropped:

- Intro paragraph explaining the stub mechanics — belongs in `gotchas.md`,
  not per-package docs.
- `--scope=project` cwd-walk blockquote — the comment beside the command is
  enough.
- Per-package structure list (`bin/`, `scripts/`, `docs/claude/`,
  `claude.assetPath` convention) — mechanical, same across all consumers,
  not useful as per-package documentation.
- Verbose Isolation Guardrails prose — reduced to three one-line rules.

The principle: per-package `CLAUDE.md` should carry only what an agent or
human needs **specific to this package**. Shared architecture belongs in the
skill's knowledge files.
