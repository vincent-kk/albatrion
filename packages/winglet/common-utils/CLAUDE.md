# CLAUDE.md

`@winglet/common-utils` is a general-purpose TypeScript utility library with no runtime dependencies. Sub-path exports optimize tree-shaking.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations + agents-hashes.json
yarn build:hashes      # Regenerate only the docs/agents/** hash manifest
yarn test              # Vitest tests (Node environment)
yarn test --coverage   # Include coverage
yarn lint              # ESLint
```

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/common-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**

## Sub-path Exports

```typescript
import { chunk } from '@winglet/common-utils/array';
import { isArray, isObject } from '@winglet/common-utils/filter';
import { debounce, throttle } from '@winglet/common-utils/function';
import { delay, timeout } from '@winglet/common-utils/promise';
// Or import the full package: import { ... } from '@winglet/common-utils';
```

## Utility Categories

| Path | Main Functions |
|------|---------|
| `array` | `chunk`, `unique`, `groupBy`, `difference`, `intersection`, `forEach*` |
| `filter` | `isString/Number/Boolean/Object/Array/Nil/Date...` type checks |
| `object` | `clone`, `merge`, `equals`, `stringifyGraph`, `createFingerprint`, `transformKeys` |
| `function` | `debounce`, `throttle`, `getTrackableHandler` |
| `promise` | `delay`, `timeout`, `withTimeout`, `waitAndExecute` |
| `scheduler` | `scheduleMicrotask`, `scheduleMacrotask`, `scheduleNextTick` |
| `hash` | Murmur3, Polynomial hash (base36) |
| `libs` | `cacheMapFactory`, `cacheWeakMapFactory`, `counterFactory`, `getRandomString` |

## Error Classes

`BaseError` → `AbortError` / `InvalidTypeError` / `TimeoutError`
