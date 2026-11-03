import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

/**
 * Runs only Yarn argument arrays sequentially, retaining the first failure code.
 * @param {object[]} shards Named command groups from a selected plan.
 * @param {object} options Explicit cwd, environment, dry-run flag and logger.
 * @returns {object} Exit code and results, including commands skipped after failure.
 */
export function runPlanSteps(shards, { root, env, dryRun, log }) {
  const results = [];
  let exitCode = 0;
  for (const shard of shards) {
    for (const step of shard.steps) {
      if (!Array.isArray(step.args) || step.args.some((arg) => typeof arg !== 'string') || typeof step.label !== 'string') throw new Error('Invalid check-plan command');
      let status = exitCode ? 'skipped' : 'planned';
      const start = performance.now();
      if (!exitCode) {
        log(`::group::${shard.name}: ${step.label}\nyarn ${step.args.join(' ')}`);
        if (!dryRun) {
          const result = spawnSync('yarn', step.args, { cwd: root, env, stdio: 'inherit', shell: false });
          exitCode = result.status ?? 1;
          status = exitCode ? `failed (${exitCode}${result.signal ? `, ${result.signal}` : ''})` : 'passed';
          if (result.error) log(result.error.message);
        }
        log('::endgroup::');
      }
      results.push({ ...step, shard: shard.name, status, seconds: (performance.now() - start) / 1000 });
    }
  }
  return { exitCode, results };
}
