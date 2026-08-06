# `CLAUDE.md` — `## Agent Docs Injector` section

Reference: `packages/canard/schema-form/CLAUDE.md`. Every wired consumer carries this section with the same wording; only the package name differs.

Append the section below to `${TARGET_PATH}/CLAUDE.md` if that file exists. Skip the entire step if it does not — do not create one.

The template is intentionally terse: CLI usage plus the two isolation invariants. Architectural rationale lives in `knowledge/gotchas.md` — do not duplicate it into every consumer's `CLAUDE.md`.

The heading is `## Agent Docs Injector`, not `## Claude Docs Injector`. Match it exactly: a search for any other heading finds no existing section and appends a second one, which is how this step loses its idempotency.

---

## Template

Prose is Korean in every deployed consumer. If the target's `CLAUDE.md` is written in English, translate the prose only — headings, commands and the guardrail structure stay as they are.

````markdown
## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — `claude` 는 `.claude/{skills,rules,commands}`, `codex`/`agents` 는 `.agents/skills` + `AGENTS.md` 마커 블록(project scope 기준).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/agents-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**
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
