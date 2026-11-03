// Loaded by CI and local Node invocations; CHECK_PLAN or --plan supplies command data.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { formatPlanSummary } from './helpers/runner/formatPlanSummary.mjs';
import { runPlanSteps } from './helpers/runner/runPlanSteps.mjs';

/** CLI options use explicit files locally and environment JSON in Actions. */
const args = process.argv.slice(2);
/** Parsed plan is never interpolated into a shell program. */
const plan = JSON.parse(args.includes('--plan') ? readFileSync(args[args.indexOf('--plan') + 1], 'utf8') : process.env.CHECK_PLAN ?? 'null');
if (!plan || !Array.isArray(plan.shards) || !Array.isArray(plan.changed) || !Array.isArray(plan.dependents)) throw new Error('A valid plan is required through --plan or CHECK_PLAN');
/** Optional shard selects one matrix leg; local runs default to both in order. */
const shardName = args.includes('--shard') ? args[args.indexOf('--shard') + 1] : undefined;
/** Unknown shard names fail instead of silently running nothing. */
const shards = shardName ? plan.shards.filter(({ name }) => name === shardName) : plan.shards;
if (shardName && shards.length !== 1) throw new Error(`Unknown shard: ${shardName}`);
/** Test commands see CI consistently in local and hosted runs. */
const outcome = runPlanSteps(shards, { root: fileURLToPath(new URL('../../', import.meta.url)), env: { ...process.env, CI: 'true' }, dryRun: args.includes('--dry-run'), log: console.log });
/** Result table is also visible locally when no Actions summary file exists. */
const summary = formatPlanSummary(plan, outcome.results);
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (args.includes('--results')) writeFileSync(args[args.indexOf('--results') + 1], `${JSON.stringify(outcome, null, 2)}\n`);
process.exitCode = outcome.exitCode;
