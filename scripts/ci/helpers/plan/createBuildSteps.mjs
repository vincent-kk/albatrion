import { collectClosure } from '../selection/collectClosure.mjs';

/**
 * Emits manifest-topological builds with the schema-form/AJV declaration bootstrap.
 * @param {string[]} affected Names whose build dependencies must exist.
 * @param {object[]} workspaces Manifest dependency graph and current scripts.
 * @returns {object[]} Yarn commands restricted to eligible build workspaces.
 */
export function createBuildSteps(affected, workspaces) {
  const closure = collectClosure(affected, workspaces);
  const schemaForm = '@canard/schema-form';
  const ajvPlugins = [6, 7, 8].map((version) => `@canard/schema-form-ajv${version}-plugin`);
  if (closure.includes(schemaForm)) {
    for (const name of collectClosure(ajvPlugins, workspaces)) if (!closure.includes(name)) closure.push(name);
  }
  const buildNames = closure.filter((name) => workspaces.find((workspace) => workspace.name === name)?.scripts.build)
    .filter((name) => name !== '@albatrion/documents' && (name !== '@aileron/production-testbed' || affected.includes(name))).sort();
  const steps = [];
  if (buildNames.includes(schemaForm)) {
    const prerequisites = collectClosure([schemaForm, ...ajvPlugins], workspaces)
      .filter((name) => name !== schemaForm && !ajvPlugins.includes(name) && buildNames.includes(name));
    if (prerequisites.length) steps.push(createTopologicalBuild(prerequisites, 'Build schema-form prerequisites'));
    // schema-form typechecks import AJV declarations, whose own types require schema-form first.
    steps.push({ kind: 'build', label: 'Bootstrap schema-form runtime', args: ['workspace', schemaForm, 'exec', 'rolldown', '-c'] });
    steps.push({ kind: 'build', label: 'Bootstrap schema-form declarations', args: ['workspace', schemaForm, 'build:types'] });
    steps.push(createTopologicalBuild(ajvPlugins.filter((name) => buildNames.includes(name)), 'Build AJV declarations'));
  }
  if (buildNames.length) steps.push(createTopologicalBuild(buildNames, 'Build workspace closure'));
  return steps;
}

/**
 * Constructs a Yarn-managed manifest ordering over explicit workspace names.
 * @param {string[]} names Build-capable workspace names.
 * @param {string} label Human-readable command group.
 * @returns {object} Serializable build step.
 */
function createTopologicalBuild(names, label) {
  return { kind: 'build', label, args: ['workspaces', 'foreach', '--all', '--topological-dev', ...names.flatMap((name) => ['--include', name]), 'run', 'build'] };
}
