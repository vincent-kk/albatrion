import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCheckPlan } from '../helpers/plan/createCheckPlan.mjs';
import { readTrackedFiles } from '../helpers/workspaces/readTrackedFiles.mjs';
import { readWorkspaces } from '../helpers/workspaces/readWorkspaces.mjs';
import { scanImportDependencies } from '../helpers/selection/scanImportDependencies.mjs';
const root = new URL('../../../', import.meta.url).pathname;
const files = readTrackedFiles(root);
const workspaces = scanImportDependencies(root, files, readWorkspaces(root, files));
for (const tier of ['pr', 'pre-release']) test(`${tier} isolates all plugins without dropping a workspace test`, () => {
  const plan = createCheckPlan(workspaces, ['package.json'], null, tier);
  const plugins = workspaces.filter(w => w.name.startsWith('@canard/schema-form-') && w.name.endsWith('-plugin')).map(w => w.name).sort();
  const shard = plan.shards.find(s => s.name === 'plugins');
  assert.ok(shard);
  assert.deepEqual(shard.affected, plugins);
  assert.equal(shard.browser, false);
  const main = plan.shards.find(s => s.name === 'main');
  assert.ok(main.affected.every(name => !plugins.includes(name)));
  for (const plugin of plugins) assert.equal(plan.steps.filter(s => s.kind === 'test' && s.args[1] === plugin).length, 1);
  for (const workspace of workspaces.filter(w => w.scripts.test && w.name !== '@canard/schema-form'))
    assert.equal(plan.steps.filter(s => s.kind === 'test' && s.args[1] === workspace.name).length, 1, workspace.name);
  assert.deepEqual(plan.shards.find(s => s.name === 'schema-form').affected, ['@canard/schema-form']);
});
