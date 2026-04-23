import { relative } from 'node:path';

import pc from 'picocolors';

import { discover } from '../discover.js';

const ANSI_SGR_PATTERN = new RegExp(
  `${String.fromCharCode(0x1b)}\\[[0-9;]*m`,
  'g',
);

export interface ListOptions {
  cwd?: string;
  json?: boolean;
}

export async function listConsumers(opts: ListOptions = {}): Promise<void> {
  const consumers = await discover({ cwd: opts.cwd });

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(consumers, null, 2)}\n`);
    return;
  }

  if (consumers.length === 0) {
    process.stdout.write(
      `${pc.dim('No consumer packages with claude.assetPath found in this tree.')}\n`,
    );
    return;
  }

  const headers = ['NAME', 'VERSION', 'ASSET PATH', 'HASHES'];
  const rows = consumers.map((c) => [
    c.name,
    c.version,
    relative(c.packageRoot, c.assetRoot) || '.',
    c.hashesPresent ? pc.green('✓') : pc.red('✗'),
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => stripAnsi(r[i] ?? '').length)),
  );

  process.stdout.write(
    `${headers.map((h, i) => pc.bold(padRight(h, widths[i]))).join('  ')}\n`,
  );
  process.stdout.write(`${widths.map((w) => '─'.repeat(w)).join('  ')}\n`);
  for (const row of rows) {
    process.stdout.write(
      `${row.map((cell, i) => padWithAnsi(cell ?? '', widths[i])).join('  ')}\n`,
    );
  }
}

function stripAnsi(s: string): string {
  return s.replace(ANSI_SGR_PATTERN, '');
}

function padRight(s: string, width: number): string {
  return s + ' '.repeat(Math.max(0, width - s.length));
}

function padWithAnsi(s: string, width: number): string {
  const visibleLength = stripAnsi(s).length;
  return s + ' '.repeat(Math.max(0, width - visibleLength));
}
