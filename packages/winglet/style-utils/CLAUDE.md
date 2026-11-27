# CLAUDE.md

`@winglet/style-utils` provides scoped CSS injection, CSS compression, and className utilities. It has no runtime dependencies and is framework-agnostic.

## Commands

```bash
yarn build             # ESM + CJS build + type declarations
yarn test              # Vitest tests (jsdom)
yarn lint              # ESLint
```

## Sub-path Exports

```typescript
import { styleManagerFactory, destroyScope } from '@winglet/style-utils/style-manager';
import { cx, cxLite, compressCss } from '@winglet/style-utils/util';
```

## Key APIs

**StyleManager** manages a scoped CSS singleton:
```typescript
const addStyle = styleManagerFactory('my-scope');
const removeStyles = addStyle('style-id', css);   // Returns a cleanup function
destroyScope('my-scope');                          // Cleans up the entire scope
// Shadow DOM: styleManagerFactory('scope', { shadowRoot: el.shadowRoot })
```

**ClassName**:
```typescript
cx('base', { active: isActive }, ['a', 'b'])   // Supports objects/arrays
cxLite('base', isActive && 'active', size)      // Lightweight variant
```

## Key Details

- **CSS Scoping**: Automatically prefixes `.scopeId .selector` (excluding `@rules`, `:root`, and `:host`)
- **DOM API**: Automatically selects `adoptedStyleSheets` (modern) or `<style>` elements (legacy)
- **Batch Updates**: Optimizes DOM updates with `requestAnimationFrame`
- **Memory**: Calling `destroy()` cancels AnimationFrame, removes DOM, and clears caches

## Agent Docs Injector

Inject `docs/agents/**` assets into the selected agent's locations. Engine: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
Select agents with `--agent`: `claude` uses `.claude/{skills,rules,commands}`; `codex`/`agents` use `.agents/skills` and marker blocks in `AGENTS.md` (at project scope).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@winglet/style-utils --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` MUST NOT import from `docs/**` or `@slats/agents-assets-sync`.
- **Never add `./docs/*` to `exports`.**
