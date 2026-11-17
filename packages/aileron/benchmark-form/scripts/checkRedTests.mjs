// Gate G1: run the named test targets and confirm every failure is an intended expectation failure
// (an AssertionError or vitest's `expect(...).rejects` / `.resolves` message), never an import or runtime error.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseScriptArgs } from './utils/parseScriptArgs.mjs';

/** Workspace root resolving the designated Vitest configuration and dependencies. */
const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** Validated CLI options; unknown or duplicate flags are rejected before artifact inspection. */
const options = parseScriptArgs(process.argv.slice(2), [
  '--out',
  '--targets',
  '--expect-failing',
]);
/** Test target paths that must all be collected in the red-phase run. */
const targets = (options['--targets'] ?? '').split(',').filter(Boolean);
/** Required failing test names proving that the intended behavior is still absent. */
const expected = (options['--expect-failing'] ?? '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);
if (!targets.length || !expected.length || !options['--out'])
  throw new Error(
    'Usage: checkRedTests.mjs --out <file> --targets <a,b> --expect-failing <name,name>',
  );

/** Installed Vitest entry resolved from this workspace without fetching executable code. */
const vitest = join(
  dirname(
    createRequire(join(packageDir, 'package.json')).resolve(
      'vitest/package.json',
    ),
  ),
  'vitest.mjs',
);
/** JSON evidence destination or report content used by this verification entry. */
const report = join(mkdtempSync(join(tmpdir(), 'red-tests-')), 'vitest.json');
/** Child Vitest exit status and captured output used to reject an unexpected green run. */
const run = spawnSync(
  process.execPath,
  [
    vitest,
    'run',
    '--root',
    packageDir,
    '--config',
    'vite.config.ts',
    '--reporter=json',
    '--outputFile',
    report,
    ...targets,
  ],
  { cwd: packageDir, encoding: 'utf8' },
);
/** Parsed Vitest evidence, including assertion failures and collection errors. */
const results = JSON.parse(readFileSync(report, 'utf8'));
/** Collected test-file results; every requested target must appear here. */
const files = results.testResults ?? [];
/** Accumulated gate failures; any entry makes the process exit nonzero. */
const problems = [];
for (const target of targets)
  if (!files.some((file) => file.name.includes(target)))
    problems.push(`target not collected: ${target}`);
/** Names of tests that failed by assertion rather than import or runtime setup. */
const failed = [];
for (const file of files) {
  if (file.status === 'failed' && !file.assertionResults.length)
    problems.push(
      `runtime failure without assertions: ${file.name} ${String(file.message).split('\n')[0]}`,
    );
  for (const test of file.assertionResults) {
    if (test.status !== 'failed') continue;
    failed.push(test.fullName);
    for (const message of test.failureMessages)
      if (
        !/^AssertionError|instead of rejecting|instead of resolving/.test(
          message,
        )
      )
        problems.push(
          `not an assertion failure: ${test.fullName}: ${message.split('\n')[0]}`,
        );
  }
}
for (const name of expected)
  if (!failed.some((fullName) => fullName.includes(name)))
    problems.push(`expected failing test did not fail: ${name}`);
if (run.status === 0) problems.push('vitest exited 0: no test failed');
writeFileSync(
  options['--out'],
  JSON.stringify(
    { targets, expected, failed, problems, vitestStatus: run.status },
    null,
    2,
  ) + '\n',
);
console.log(`failed tests: ${failed.length}; report: ${options['--out']}`);
for (const problem of problems) console.log(problem);
console.log(problems.length ? 'RED_CHECK_FAILED' : 'RED_BY_ASSERTION');
process.exit(problems.length ? 1 : 0);
