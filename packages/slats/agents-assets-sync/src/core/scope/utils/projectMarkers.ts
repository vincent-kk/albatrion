/**
 * Names the repository and the package manager themselves place at a project
 * root — the version-control directory, workspace manifests and lockfiles.
 * The first tier of root detection; order does not affect the verdict.
 */
export const PROJECT_ROOT_MARKERS = [
  '.git',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'bun.lock',
  'bun.lockb',
] as const;

/**
 * Names an agent keeps its settings under. The second tier of root detection,
 * consulted only when no ancestor owns a root marker: a tool may create one in
 * any directory, so it is weaker evidence. Order does not affect the verdict.
 */
export const PROJECT_ANCHORS = [
  '.claude',
  'AGENTS.md',
  '.agents',
  '.codex',
  '.git',
] as const;
