# CLAUDE.md

`@winglet/react-utils` provides custom React hooks, HOCs, and utilities with sub-path exports.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations + agents-hashes.json
yarn build:hashes      # Regenerate only the docs/agents/** hash manifest
yarn test              # Vitest tests (jsdom)
yarn test --watch      # watch mode
yarn lint              # ESLint
```

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/react-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Sub-path Exports

```typescript
import { useHandle } from '@winglet/react-utils/hook';
import { withPortal, Portal } from '@winglet/react-utils/portal';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { isReactComponent } from '@winglet/react-utils/filter';
```

## Key APIs

**Hooks** (`@winglet/react-utils/hook`):
- `useHandle` — Stable event handler (used mainly by schema-form plugins)
- `useConstant` — Memoization of expensive computations
- `useLazyConstant` — Executes the factory once and guarantees identity (unlike useMemo, guarantees no recomputation; for resource-owning instances)
- `useMemorize` — Enhanced memoization
- `useEffectUntil` / `useLayoutEffectUntil` — Conditional effect
- `useWindowSize` — Tracks browser window size

**Portal System** (`@winglet/react-utils/portal`):
- `withPortal()` — Portal context HOC
- `Portal.Anchor` — Specifies the portal rendering location
- `Portal` — Renders children at the anchor location

**HOCs** (`@winglet/react-utils/hoc`):
- `withErrorBoundary()` — Error boundary wrapping

## Peer Dependencies

React 16-19, React DOM 16-19
