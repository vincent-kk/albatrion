import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listConsumers } from '../../src/commands/list.js';

describe('commands/list (subcommand handler)', () => {
  let tmp: string;
  let stdoutWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'slats-cmd-list-'));
    stdoutWrite = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(async () => {
    stdoutWrite.mockRestore();
    vi.clearAllMocks();
    await rm(tmp, { recursive: true, force: true });
  });

  it('emits JSON containing discovered consumers', async () => {
    await mkdir(join(tmp, 'packages', 'alpha'), { recursive: true });
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({
        name: '@fixture/root',
        version: '0.0.0',
        workspaces: ['packages/*'],
        private: true,
      }),
    );
    await writeFile(
      join(tmp, 'packages', 'alpha', 'package.json'),
      JSON.stringify({
        name: '@fixture/alpha',
        version: '1.0.0',
        claude: { assetPath: 'docs/claude' },
      }),
    );

    await listConsumers({ cwd: tmp, json: true });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    const parsed = JSON.parse(emitted);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('@fixture/alpha');
    expect(parsed[0].hashesPresent).toBe(false);
  });

  it('prints a table with headers and rows for the discovered set', async () => {
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({
        name: '@fixture/only',
        version: '1.2.3',
        claude: { assetPath: 'docs/claude' },
      }),
    );

    await listConsumers({ cwd: tmp, json: false });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    expect(emitted).toContain('NAME');
    expect(emitted).toContain('VERSION');
    expect(emitted).toContain('@fixture/only');
    expect(emitted).toContain('1.2.3');
  });

  it('emits the no-consumers message when nothing matches', async () => {
    await writeFile(
      join(tmp, 'package.json'),
      JSON.stringify({ name: '@fixture/empty', version: '0.0.0' }),
    );
    await listConsumers({ cwd: tmp, json: false });
    const emitted = stdoutWrite.mock.calls.map((c) => c[0] as string).join('');
    expect(emitted).toContain('No consumer packages');
  });
});
