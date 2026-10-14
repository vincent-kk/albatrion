import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('F-F runs zero layout effects for one input write', () => {
  const tool = fileURLToPath(
    new URL(
      '../../FieldProxy/__tests__/helpers/runtimeCounts.mjs',
      import.meta.url,
    ),
  );
  const report = JSON.parse(
    execFileSync(process.execPath, [tool, 'current', '--counts-only'], {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 8 * 1024 * 1024,
    }),
  );
  for (const scenario of report.scenarios) {
    const write = scenario.writes.find(
      (row: { write: string }) => row.write === 'input write /a again',
    );
    expect(write.layoutEffects).toBe(0);
  }
}, 120000);
