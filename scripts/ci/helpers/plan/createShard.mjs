import { createBuildSteps } from './createBuildSteps.mjs';

/**
 * Assembles one independently installable shard in lint/build/typecheck/test order.
 * @param {string} name Matrix shard identifier.
 * @param {string[]} affected Workspaces checked in this shard.
 * @param {string[]} changed Workspaces whose sources changed.
 * @param {object[]} workspaces Manifest scripts and build edges.
 * @returns {object} Named shard with browser requirement and serial steps.
 */
export function createShard(name, affected, changed, workspaces) {
  const selected = workspaces.filter((workspace) => affected.includes(workspace.name));
  const steps = selected.filter((workspace) => changed.includes(workspace.name) && workspace.scripts.lint)
    .map((workspace) => ({ kind: 'lint', label: `Lint ${workspace.name}`, args: ['workspace', workspace.name, 'lint'] }));
  const builds = createBuildSteps(affected, workspaces);
  steps.push(...builds);
  for (const workspace of selected) {
    const built = builds.some((step) => step.args.includes(workspace.name));
    if (workspace.scripts.typecheck && !built) steps.push({ kind: 'typecheck', label: `Typecheck ${workspace.name}`, args: ['workspace', workspace.name, 'typecheck'] });
  }
  for (const workspace of selected.filter((workspace) => workspace.scripts.test)) {
    if (workspace.name === '@canard/schema-form') {
      steps.push({ kind: 'test', label: 'Test schema-form unit/render/React18/Storybook', args: ['workspace', workspace.name, 'test', '--run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--project', 'storybook'] });
      steps.push({ kind: 'test', label: 'Verify schema-form', args: ['workspace', workspace.name, 'test:verify', '--run'] });
      steps.push({ kind: 'test', label: 'Test schema-form production bundles', args: ['workspace', workspace.name, 'test:production'] });
    } else steps.push({ kind: 'test', label: `Test ${workspace.name}`, args: ['workspace', workspace.name, 'test', '--run'] });
  }
  return { name, affected, browser: affected.includes('@canard/schema-form'), steps };
}
