import { findWorkspaceOwner } from './findWorkspaceOwner.mjs';

/**
 * Classifies a changed path, prioritizing shared inputs over ignored markdown.
 * @param {string} file Repository-relative POSIX path, including deleted paths.
 * @param {object[]} workspaces Named directories from the checkout.
 * @returns {string} global, ignored, or the owning workspace name.
 */
export function classifyChangedFile(file, workspaces) {
  const owner = findWorkspaceOwner(file, workspaces);
  const rootInputs = ['package.json', 'yarn.lock', '.yarnrc.yml', '.nvmrc', 'tsconfig.base.json', 'eslint.config.mjs', 'vitest.workspace.ts', '.github/workflows/ci.yml'];
  if (rootInputs.includes(file) || ['.yarn/', 'eslint/', 'scripts/ci/'].some((prefix) => file.startsWith(prefix)) || (file.startsWith('packages/') && !owner)) return 'global';
  if (!owner) return 'ignored';
  const testMarkdown = ['packages/canard/schema-form/architecture/ledger/error.md', 'packages/canard/schema-form/src/core/surface/DETAIL.md'];
  if (file.endsWith('.md') && !file.startsWith(`${owner.directory}/docs/agents/`) && !testMarkdown.includes(file)) return 'ignored';
  return owner.name;
}
