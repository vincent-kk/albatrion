// r3-agents-assets-sync: what the report says after --force overwrites.
// `InjectReport.updated` (public type, core/injectDocs/DETAIL.md:30, README.md
// JSON example) has no writer: `summarize` files an applied overwrite under
// `warnings` with reason `diverged`, the same entry a blocked run gets.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { runCli } from '../../index.js';
import { installPackage, makeRoot, removeRoot, writeAt } from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

async function runJSON(args: readonly string[]): Promise<{
  document: {
    exitCode: number;
    units: {
      report: {
        updated: string[];
        warnings: { relPath: string; reason: string }[];
      };
    }[];
  };
}> {
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation(
    (chunk: string | Uint8Array) => {
      stdout += chunk;
      return true;
    },
  );
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  vi.spyOn(process, 'exit').mockImplementation(
    (code?: string | number | null) => {
      throw new Error(`exit ${code}`);
    },
  );
  try {
    await runCli(['node', 'inject-agents-settings', ...args]);
  } catch {
    // A non-zero exit still leaves the document on stdout.
  }
  vi.restoreAllMocks();
  return { document: JSON.parse(stdout) };
}

describe('r3-agents-assets-sync: the --force report', () => {
  it('a diverged file that --force overwrote is reported as updated, not as an unapplied divergence', async () => {
    const root = makeRoot('force-report');
    roots.push(root);
    installPackage(root, {
      name: '@probe/force',
      assets: { 'skills/d/SKILL.md': '# shipped\n' },
    });
    const installed = join(root, '.claude/skills/d/SKILL.md');
    writeAt(installed, '# edited by user\n');
    const base = [
      '--package=@probe/force',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
      '--json',
    ];

    const blocked = await runJSON(base);
    const forced = await runJSON([...base, '--force', '--yes']);
    expect({
      overwritten: readFileSync(installed, 'utf8') === '# shipped\n',
      blockedReport: blocked.document.units[0]?.report,
      forcedReport: forced.document.units[0]?.report,
    }).toMatchObject({
      overwritten: true,
      blockedReport: {
        updated: [],
        warnings: [{ relPath: 'skills/d/SKILL.md', reason: 'diverged' }],
      },
      forcedReport: { updated: ['skills/d/SKILL.md'], warnings: [] },
    });
  });
});
