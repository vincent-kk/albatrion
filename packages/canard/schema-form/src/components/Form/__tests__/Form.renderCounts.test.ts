import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

it('F-C keeps Form rerenders at eleven component calls with a stable submit handler', () => {
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
    const update = scenario.writes.find(
      (row: { write: string }) =>
        row.write === 'Form re-render, new inline onChange',
    );
    expect(update.renders.byComponent.Host['(form)']).toBe(1);
    expect(
      update.renders.total - update.renders.byComponent.Host['(form)'],
    ).toBe(11);
    expect(update.remounts).toEqual([]);
  }
}, 120000);
