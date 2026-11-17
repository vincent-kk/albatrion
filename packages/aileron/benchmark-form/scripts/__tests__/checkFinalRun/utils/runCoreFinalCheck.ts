import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { createCoreFinalFixture } from './createCoreFinalFixture';

/**
 * Run the actual final-run gate on disposable synthetic artifacts.
 * @param fixture - Comparison summary and raw measurements, optionally damaged by the calling test.
 * @param args - Additional CLI flags, passed verbatim to exercise option validation.
 * @returns Captured process result; all temporary artifacts are removed after the check.
 */
export function runCoreFinalCheck(
  fixture: ReturnType<typeof createCoreFinalFixture>,
  args: string[] = [],
) {
  const directory = mkdtempSync(join(tmpdir(), 'core-final-gate-'));
  try {
    for (const [name, value] of Object.entries({
      summary: fixture.summary,
      samples: fixture.samples,
      run: { conclusion: 'success' },
    }))
      writeFileSync(join(directory, name + '.json'), JSON.stringify(value));
    return spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('../../../checkFinalRun.mjs', import.meta.url)),
        join(directory, 'summary.json'),
        join(directory, 'samples.json'),
        '--run-json',
        join(directory, 'run.json'),
        '--baseline',
        'baseline-fixture',
        '--head',
        'candidate-fixture',
        '--runs',
        '20',
        '--cases',
        fixture.summary.cases.map((row) => row.id).join(','),
        ...args,
      ],
      { encoding: 'utf8' },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
