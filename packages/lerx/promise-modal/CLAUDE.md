# CLAUDE.md

`@lerx/promise-modal` is a Promise-based React modal utility. Use `alert`, `confirm`, and `prompt` both inside and outside React components.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations
yarn test              # Vitest tests (jsdom, development React) — Delegates to root Vitest
yarn test:prod         # Runs the entire suite with production React (including *.prod.test.*)
yarn lint              # ESLint (use `yarn run -T eslint` when the root binary is needed)
yarn storybook         # Storybook dev (port 6006)
yarn size-limit        # Checks bundle size
```

> The test/test:prod scripts delegate to the root workspace Vitest binary through `yarn run -T`
> to centralize build tooling. Switch to devDependencies when separating the subpackage.

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@lerx/promise-modal --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@lerx/promise-modal --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@lerx/promise-modal --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@lerx/promise-modal --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Architecture

```
src/
├── index.ts                      # Public API
├── core/handle/                  # alert / confirm / prompt functions
├── core/node/                    # AbstractNode, AlertNode, ConfirmNode, PromptNode
├── app/ModalManager.ts           # Singleton — modal lifecycle, DOM anchors, style injection
├── bootstrap/BootstrapProvider/  # ModalProvider component
├── providers/                    # Separate contexts (configuration, modal management, user data)
└── components/                   # UI including Anchor, Background, Foreground
```

## Key Design

- **Promise API**: Modal functions return Promises → resolve through user interaction
- **Singleton**: `ModalManager` manages global state
- **Styling**: Runtime CSS injection through `@winglet/style-utils` (polynomial hashing scoping)

## Dependencies

`@winglet/common-utils`, `@winglet/react-utils`, `@winglet/style-utils`, React 18-19 (peer)
