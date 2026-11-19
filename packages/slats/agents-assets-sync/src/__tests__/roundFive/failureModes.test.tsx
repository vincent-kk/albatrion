import { chmodSync, mkdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import type { DefaultFlags } from '../../types/index.js';
import { runSurface } from '../roundFour/helpers/runSurface.js';
import { consumerOf, installPackage, makeRoot, removeRoot, writeAt } from '../roundThree/fixture.js';

/** Run-wide failure kinds are independent of their output view. */
const cases = ['manifest', 'source', 'conflict', 'file-read-only', 'document-read-only', 'dangling-document', 'containment', 'flags'] as const;
/** HOME changes stay inside the fixture and are restored before the next row. */
const originalHome = process.env.HOME;
/** Every case owns its temporary project. */
const roots: string[] = [];
afterEach(() => { process.env.HOME = originalHome; for (const root of roots.splice(0)) removeRoot(root); vi.restoreAllMocks(); });

it.each(cases)('%s has identical paths, stages, reasons and verdicts in plain, JSON and terminal output', async (kind) => {
  const outcomes = [];
  for (const mode of ['plain', 'json', 'ink'] as const) {
    const root = makeRoot(`failure-${kind}`);
    roots.push(root);
    const packageRoot = installPackage(root, { name: '@probe/a', assets: { 'rules/a.md': '# rule\n', 'skills/shared/a.md': '# skill\n' }, manifest: true, ...(kind === 'manifest' ? { manifestText: '{invalid' } : {}) });
    const targets = [consumerOf(packageRoot, '@probe/a', 'manifest')];
    const flags: DefaultFlags = { agent: [kind === 'file-read-only' || kind === 'containment' ? 'claude' : 'codex'], scope: 'project', force: true, yes: true };
    if (kind === 'source') writeAt(join(packageRoot, 'docs/agents/rules/a.md'), '~~~\nopen');
    if (kind === 'conflict') {
      const peer = installPackage(root, { name: '@probe/b', assets: { 'skills/shared/a.md': '# different\n' }, manifest: true });
      targets.push(consumerOf(peer, '@probe/b', 'manifest'));
    }
    const readonly = kind === 'file-read-only' ? join(root, '.claude/rules/a.md') : join(root, 'AGENTS.md');
    if (kind === 'file-read-only' || kind === 'document-read-only') { writeAt(readonly, '# original\n'); chmodSync(readonly, 0o444); }
    if (kind === 'dangling-document') {
      const home = join(root, 'home');
      mkdirSync(join(home, '.codex'), { recursive: true });
      symlinkSync(join(root, 'missing'), join(home, '.codex/AGENTS.md'));
      process.env.HOME = home;
      flags.scope = 'user';
    }
    if (kind === 'containment') {
      const outside = makeRoot('outside');
      roots.push(outside);
      mkdirSync(join(root, '.claude'), { recursive: true });
      symlinkSync(outside, join(root, '.claude/skills'));
    }
    if (kind === 'flags') flags.agent = ['invalid'];
    let transcript = '';
    const result = await runSurface(mode, root, targets, flags, false, undefined, (output) => { transcript = mode === 'ink' ? output.frame : mode === 'json' ? JSON.parse(output.stdout).failures.map((failure: { reason: string }) => failure.reason).join('\n') : output.stdout + output.stderr; });
    if (kind === 'file-read-only' || kind === 'document-read-only') chmodSync(readonly, 0o644);
    expect(result.code).toBe(kind === 'flags' ? 2 : 1);
    expect(result.model.failures?.length).toBeGreaterThan(0);
    for (const failure of result.model.failures ?? []) {
      expect(failure.path).toBeTruthy();
      expect(failure.stage).toBeTruthy();
      expect(failure.reason).toBeTruthy();
      expect(transcript.replace(/\s+/g, '')).toContain(failure.reason.split('<root>').join(root).replace(/\s+/g, ''));
    }
    outcomes.push({ code: result.code, failures: result.model.failures });
    process.env.HOME = originalHome;
  }
  expect(outcomes[1]).toEqual(outcomes[0]);
  expect(outcomes[2]).toEqual(outcomes[0]);
});
