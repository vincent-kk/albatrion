import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createCheckPlan } from '../helpers/plan/createCheckPlan.mjs';
import { createBuildSteps } from '../helpers/plan/createBuildSteps.mjs';
import { scanImportDependencies } from '../helpers/selection/scanImportDependencies.mjs';
import { readTrackedFiles } from '../helpers/workspaces/readTrackedFiles.mjs';
import { readWorkspaces } from '../helpers/workspaces/readWorkspaces.mjs';

/** Repository scripts drive plans dynamically, including future typecheck additions. */
const root = new URL('../../../', import.meta.url).pathname;
/** Shared tracked paths avoid filesystem enumeration. */
const files = readTrackedFiles(root);
/** Separate manifest and import edges model real selection cycles. */
const workspaces = scanImportDependencies(root, files, readWorkspaces(root, files));

test('lint runs only for changed owners while dependents still receive checks', () => {
  const plan = createCheckPlan(workspaces, ['packages/winglet/common-utils/src/index.ts']);
  assert.deepEqual(plan.steps.filter(({ kind }) => kind === 'lint').map(({ args }) => args[1]), ['@winglet/common-utils']);
  assert.ok(plan.dependents.includes('@canard/schema-form'));
});

test('build closure includes manifest prerequisites and Yarn topological-dev ordering', () => {
  const plan = createCheckPlan(workspaces, ['packages/winglet/style-utils/src/index.ts']);
  const build = plan.steps.find(({ label }) => label === 'Build workspace closure');
  assert.ok(build.args.includes('@slats/agents-assets-sync'));
  assert.ok(build.args.includes('--topological-dev'));
  assert.ok(!createBuildSteps(['@winglet/style-utils'], workspaces).some(({ label }) => label.includes('Bootstrap')));
});

test('schema-form closure bootstraps runtime and declarations before AJV and full builds', () => {
  const plan = createCheckPlan(workspaces, ['packages/canard/schema-form/src/index.ts']);
  for (const shard of plan.shards) {
    const labels = shard.steps.map(({ label }) => label);
    assert.ok(labels.indexOf('Bootstrap schema-form runtime') < labels.indexOf('Bootstrap schema-form declarations'));
    assert.ok(labels.indexOf('Bootstrap schema-form declarations') < labels.indexOf('Build AJV declarations'));
    assert.ok(labels.indexOf('Build AJV declarations') < labels.indexOf('Build workspace closure'));
    const build = shard.steps.find(({ label }) => label === 'Build workspace closure');
    for (const version of [6, 7, 8]) assert.ok(build.args.includes(`@canard/schema-form-ajv${version}-plugin`));
  }
});

test('documents gets typecheck and never a site build', () => {
  const plan = createCheckPlan(workspaces, ['documents/src/index.ts']);
  assert.ok(plan.steps.some(({ kind, args }) => kind === 'typecheck' && args[1] === '@albatrion/documents'));
  assert.ok(!plan.steps.some(({ kind, args }) => kind === 'build' && args.includes('@albatrion/documents')));
});

test('production-testbed uses its manifest name and only builds when affected', () => {
  const plan = createCheckPlan(workspaces, ['packages/aileron/production-test/src/index.ts']);
  assert.deepEqual(plan.changed, ['@aileron/production-testbed']);
  assert.ok(plan.steps.some(({ kind, args }) => kind === 'build' && args.includes('@aileron/production-testbed')));
});

test('shards isolate schema-form suites and browser installation', () => {
  const plan = createCheckPlan(workspaces, ['packages/canard/schema-form/src/index.ts']);
  assert.deepEqual(plan.shards.map(({ name }) => name), ['main', 'schema-form']);
  const schema = plan.shards.find(({ name }) => name === 'schema-form');
  assert.equal(schema.browser, true);
  assert.equal(plan.shards[0].browser, false);
  assert.deepEqual(schema.steps.filter(({ kind }) => kind === 'test').map(({ args }) => args.slice(2)), [
    ['test', '--run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--project', 'storybook'],
    ['test:verify', '--run'], ['test:production'],
  ]);
  assert.ok(!plan.shards[0].steps.some(({ kind, args }) => kind === 'test' && args[1] === '@canard/schema-form'));
});

test('a leaf has one main shard and markdown-only changes have no steps', () => {
  const leaf = createCheckPlan(workspaces, ['packages/winglet/style-utils/src/index.ts']);
  assert.deepEqual(leaf.shards.map(({ name }) => name), ['main']);
  assert.equal(leaf.browser, false);
  const markdown = createCheckPlan(workspaces, ['packages/winglet/style-utils/README.md']);
  assert.equal(markdown.any, false);
  assert.deepEqual(markdown.shards, []);
});

test('fallback reasons and unowned packages select every workspace', () => {
  for (const plan of [createCheckPlan(workspaces, [], 'unreachable base'), createCheckPlan(workspaces, ['packages/aileron/common/x.d.ts'])]) assert.equal(plan.changed.length, workspaces.length);
});

test('future standalone typecheck scripts are read dynamically', () => {
  const workspace = { name: 'future', directory: 'packages/future', dependencies: [], selectionDependencies: [], scripts: { typecheck: 'tsc' } };
  assert.equal(createCheckPlan([workspace], ['packages/future/x.ts']).steps[0].kind, 'typecheck');
});
