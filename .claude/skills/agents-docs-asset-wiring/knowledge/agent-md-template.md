# `CLAUDE.md` — `## Agent Docs Injector` section

Reference: `packages/canard/schema-form/CLAUDE.md`. Every wired consumer carries this section with the same wording; only the package name differs.

Append the section below to `${TARGET_PATH}/CLAUDE.md` if that file exists. Skip the entire step if it does not — do not create one.

The template is intentionally terse: CLI usage plus the two isolation invariants. Architectural rationale lives in `knowledge/gotchas.md` — do not duplicate it into every consumer's `CLAUDE.md`.

The heading is `## Agent Docs Injector`, not `## Claude Docs Injector`. Match it exactly: a search for any other heading finds no existing section and appends a second one, which is how this step loses its idempotency.

---

## Template

The template prose is English. Copy it as written — headings, commands, and the guardrail structure stay as they are.

````markdown
## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent location. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` selects the target agent — `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` uses `.agents/skills` plus the `AGENTS.md` marker block (project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` must not import either `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**
````

---

## Substitution Rules

- Replace `@canard/schema-form` with `${PACKAGE_NAME}` — four occurrences, one per command line.
- Keep `--agent` on every command. It is required wherever the CLI cannot prompt, so a command without it is not a shorter form of the same thing — it is one that exits 2.
- Preserve the Isolation Guardrails bullets verbatim — these are the sharp invariants that must stay consistent across consumers.

---

## Placement & Skip Conditions

- Append to end of `CLAUDE.md`. Ensure one blank line before the injected section.
- `${TARGET_PATH}/CLAUDE.md` does not exist → skip, report "skipped (no CLAUDE.md)".
- Section already present with identical content → skip, report "unchanged".
- Section present with different content → ask user, do not clobber.
