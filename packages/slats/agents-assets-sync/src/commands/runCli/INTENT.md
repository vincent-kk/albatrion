# runCli

## Purpose

Sole `inject-agents-settings` CLI driver. Parses `--package <name...>` from argv — each value is a scope alias (`@<scope>`), a scoped package (`@<scope>/<name>`), or an unscoped package (`<name>`). Resolves every target, then hands off to exactly one of three renderers.

## Structure

- `index.ts` — barrel export (`runCli`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `__tests__/` — spec-documents bound to this document's acceptance groups
- `targets/` — argv `--package` values → `ConsumerPackage[]` (organ):
  `classifyTarget`, `resolvePackage`, `resolveScopeAlias`, `resolveTargets`, `toConsumerPackages`
- `flags/` — one CLI flag value → a validated value (organ):
  `resolveScopeFlag`, `resolveAgentFlag`, `resolveAssetFlag`
- `renderers/` — the three mutually exclusive output paths (organ):
  `renderOrFallback`, `renderPlain`, `renderJson`

## Conventions

- The organs are the pipeline's stages and the dependency runs one way: `runCli.ts` drives `targets/` then `renderers/`, and `renderers/` reads `flags/`. Nothing in `targets/` touches the other two. `targets/` does filesystem and module resolution while `flags/` is pure value validation — that difference is why they are not one directory.
- Each flag validator has two forms: `resolve*Flag` exits 2, `parse*Flag` returns the failure as a value — `renderJson` cannot exit mid-document.

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Call `renderOrFallback` exactly once after targets resolve; it owns the ordered branch — `--json`, then non-TTY / `--no-interactive`, then Ink

### Ask first

- Adding top-level subcommands — the CLI is intentionally single-action

### Never do

- Walk `node_modules` outside `targets/resolveScopeAlias.ts`
- Import from `ui/` statically; only `renderers/renderOrFallback.ts` may dynamic-import it
- Import from `core/` internals; always go through `core/index.ts`
