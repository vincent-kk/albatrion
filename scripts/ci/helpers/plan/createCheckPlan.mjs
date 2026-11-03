import { classifyChangedFile } from '../selection/classifyChangedFile.mjs';
import { collectClosure } from '../selection/collectClosure.mjs';
import { createShard } from './createShard.mjs';

/**
 * Produces conservative selection and independently executable matrix shards.
 * @param {object[]} workspaces Current named workspace graph and scripts.
 * @param {string[]} files Changed repository-relative paths.
 * @param {string|null} reason Nonempty fallback reason selects every workspace.
 * @returns {object} JSON-serializable plan including changed, dependents, steps and shards.
 */
export function createCheckPlan(workspaces, files, reason = null) {
  const owners = files.map((file) => classifyChangedFile(file, workspaces));
  const changed = reason || owners.includes('global') ? workspaces.map(({ name }) => name).sort()
    : workspaces.filter(({ name }) => owners.includes(name)).map(({ name }) => name).sort();
  const affected = collectClosure(changed, workspaces, true, 'selectionDependencies');
  const shards = [];
  const main = affected.filter((name) => name !== '@canard/schema-form');
  if (main.length) shards.push(createShard('main', main, changed, workspaces));
  if (affected.includes('@canard/schema-form')) shards.push(createShard('schema-form', ['@canard/schema-form'], changed, workspaces));
  return { changed, dependents: affected.filter((name) => !changed.includes(name)), affected, reason, any: affected.length > 0,
    browser: shards.some((shard) => shard.browser), steps: shards.flatMap((shard) => shard.steps), shards };
}
