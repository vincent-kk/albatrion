# `CLAUDE.md` — `## Claude Docs Injector` section

Reference: `packages/canard/schema-form/CLAUDE.md`.

Append the section below to `${TARGET_PATH}/CLAUDE.md` if the file
exists. Substitute the sample package name in the chosen template
with `${PACKAGE_NAME}` — four occurrences. Skip the entire step if
`CLAUDE.md` does not exist (do not create one).

The template is intentionally terse: CLI usage + essential isolation
warnings. Architectural rationale lives in `knowledge/gotchas.md` —
do not duplicate it into every consumer's `CLAUDE.md`.

---

## Template (Korean — used by all consumers except `@winglet/style-utils`)

````markdown
## Claude Docs Injector

`docs/claude/**` 자산을 사용자 `.claude/` 에 주입. 엔진: `@slats/claude-assets-sync` (bin: `inject-claude-settings`). 엔진은 `devDependencies` 에만 있으므로 항상 `npx -p @slats/claude-assets-sync ...` 로 호출합니다.

```bash
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=project
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user --dry-run
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user --force
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**
````

---

## Template (English — `@winglet/style-utils` convention)

````markdown
## Claude Docs Injector

Inject `docs/claude/**` into the user's `.claude/`. Engine: `@slats/claude-assets-sync` (bin: `inject-claude-settings`). The engine is declared only in `devDependencies`, so always invoke via `npx -p @slats/claude-assets-sync ...`.

```bash
npx -p @slats/claude-assets-sync inject-claude-settings --package=@winglet/style-utils --scope=user
npx -p @slats/claude-assets-sync inject-claude-settings --package=@winglet/style-utils --scope=project
npx -p @slats/claude-assets-sync inject-claude-settings --package=@winglet/style-utils --scope=user --dry-run
npx -p @slats/claude-assets-sync inject-claude-settings --package=@winglet/style-utils --scope=user --force
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/claude-assets-sync`.
- **Never add `./docs/*` to `exports`.**
````

---

## Substitution Rules

- Replace the sample package name in the chosen template with
  `${PACKAGE_NAME}` — four occurrences.
- Preserve the Isolation Guardrails bullets verbatim — these are
  the sharp invariants that must stay consistent across consumers.

---

## Placement & Skip Conditions

- Append to end of `CLAUDE.md`. Ensure one blank line before the
  injected section.
- `${TARGET_PATH}/CLAUDE.md` does not exist → skip, report
  "skipped (no CLAUDE.md)".
- Section already present with identical content → skip, report
  "unchanged".
- Section present with different content → ask user, do not
  clobber.
