# promise-modal contributor guidance

Read the repository-level `CLAUDE.md` and `DOCUMENTATION.md` first. Module boundaries
and acceptance criteria live in the relevant `INTENT.md` and `DETAIL.md` files.

## Commands

Use `yarn workspace @lerx/promise-modal <script>` from the repository root.

- `build`: bundle ESM/CJS, generate declarations and agent hashes, and typecheck.
- `test --run`: development React with jsdom; build first for public artifact tests.
- `test:prod`: production React without Testing Library render suites.
- `test:react18`: the same development contract using package-local React 18 aliases.
- `typecheck`: source and stories.
- `lint`: source and tests.
- `storybook`: development server on port 6006.
- `build-storybook`: static Storybook verification; keep output out of commits.

Vitest and Storybook are root-owned tools. Their scripts use `yarn run -T` so Yarn
resolves the root workspace binary rather than expecting a package-local dependency.
Build `@winglet/common-utils`, `@winglet/style-utils`, and `@winglet/react-utils`
before this package in a fresh worktree.

## Runtime boundaries

The public names and props are declared by `src/index.ts`; node classes and the
manager are internal. The manager owns global DOM effects and shared runtime state.
DOM-free import and server rendering must remain effect-free; open modals only in
the browser. Preserve both React 18 and 19 behavior.

## Packaged agent assets

`docs/agents/**` supplies consumer integration guidance through
`@slats/agents-assets-sync`. Read the skill alongside the published declarations;
keep its behavioral advice aligned with the English README and its translation.

- Source must not import `docs/**` or `@slats/agents-assets-sync`.
- Never add a `./docs/*` package export.
- Do not commit generated runtime bundles or Storybook output in source changes.
