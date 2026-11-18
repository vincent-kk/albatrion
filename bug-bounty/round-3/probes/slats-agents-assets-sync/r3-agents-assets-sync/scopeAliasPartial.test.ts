// r3-agents-assets-sync: a scope alias over an install that holds a partially
// written package.json (an interrupted `npm install`). src/DETAIL.md (AC-JSON):
// every target the run skipped carries its reason in `errors`, so a reader can
// tell an empty run from a crash.
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { runCli } from '../../index.js';
import { installPackage, makeRoot, removeRoot, writeAt } from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

async function runJSON(
  args: readonly string[],
): Promise<{ exitCode: number; errors: string[]; units: unknown[] } | null> {
  let stdout = '';
  vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: string) => {
    stdout += chunk;
    return true;
  }) as never);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
    throw new Error(`exit ${code}`);
  }) as never);
  try {
    await runCli(['node', 'inject-agents-settings', ...args]);
  } catch {
    // A non-zero exit may still leave a document.
  }
  vi.restoreAllMocks();
  return stdout ? JSON.parse(stdout) : null;
}

describe('r3-agents-assets-sync: a scope alias over a partial install', () => {
  it('a scope member whose package.json is truncated is reported in errors, like a member without agents.assetPath', async () => {
    const root = makeRoot('alias-partial');
    roots.push(root);
    installPackage(root, {
      name: '@probe/ok',
      assets: { 'skills/ok/SKILL.md': '# ok\n' },
    });
    // A member without agents.assetPath: the documented soft skip.
    writeAt(
      join(root, 'node_modules/@probe/plain/package.json'),
      JSON.stringify({ name: '@probe/plain', version: '1.0.0' }),
    );
    // A member whose package.json was cut off mid-write.
    writeAt(
      join(root, 'node_modules/@probe/partial/package.json'),
      '{ "name": "@probe/partial", "version": "1.0.0", "agents": { "asse',
    );
    writeAt(
      join(root, 'node_modules/@probe/partial/docs/agents/skills/p/SKILL.md'),
      '# p\n',
    );

    const document = await runJSON([
      '--package=@probe',
      '--agent=claude',
      '--scope=project',
      `--root=${root}`,
      '--json',
    ]);
    const errors = document?.errors ?? [];
    expect({
      exitCode: document?.exitCode,
      units: document?.units.length,
      mentionsPlain: errors.some((e) => e.includes('@probe/plain')),
      mentionsPartial: errors.some((e) => e.includes('partial')),
    }).toEqual({
      exitCode: expect.any(Number),
      units: 1,
      mentionsPlain: true,
      mentionsPartial: true,
    });
  });
});
