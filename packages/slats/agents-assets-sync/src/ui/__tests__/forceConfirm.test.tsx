import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../InjectApp/InjectApp.js';

let root: string;
let target: ConsumerPackage;

function writeAt(rel: string, body: string): void {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
}

function renderRun(flags: DefaultFlags) {
  const exit = vi.fn();
  const app = render(
    <InjectApp
      targets={[target]}
      flags={{
        agent: ['claude'],
        scope: 'project',
        interactive: true,
        ...flags,
      }}
      originCwd={root}
      onExit={(code) => exit(code, app.lastFrame())}
    />,
  );
  return { app, exit };
}

describe('ui — force confirmation covers what the run deletes', () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'slats-confirm-'));
    // Project-scope anchor, so the plan resolves inside the scratch root.
    writeAt('AGENTS.md', '');
    writeAt('pkg/agents/skills/pp/SKILL.md', '# skill\n');
    writeAt('.claude/skills/pp/SKILL.md', '# skill\n');
    writeAt('.claude/skills/pp/stale.md', 'stale');
    target = {
      name: '@slats-test/confirm',
      version: '1.0.0',
      packageRoot: join(root, 'pkg'),
      assetRoot: join(root, 'pkg/agents'),
      assetPath: 'agents',
      hashesPresent: false,
      hashSource: 'directory',
    };
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it.each([
    { answer: 'y', code: 0, remains: false },
    { answer: 'n', code: 2, remains: true },
  ])(
    'waits to delete an orphan until the user answers $answer',
    async ({ answer, code, remains }) => {
      const orphan = join(root, '.claude/skills/pp/stale.md');
      const { app, exit } = renderRun({ force: true });
      try {
        await vi.waitFor(
          () => {
            expect(app.lastFrame()).toContain('Yes, delete 1 path(s)');
            expect(app.lastFrame()).toContain('skills/pp/stale.md');
            // Ink attaches its terminal reader after the dialog is drawn.
            expect(app.stdin.listenerCount('readable')).toBeGreaterThan(0);
          },
          { timeout: 4_000 },
        );
        expect(existsSync(orphan)).toBe(true);
        expect(exit).not.toHaveBeenCalled();
        app.stdin.write(answer);
        await vi.waitFor(
          () => expect(exit).toHaveBeenCalledWith(code, expect.any(String)),
          { timeout: 4_000 },
        );
        expect(existsSync(orphan)).toBe(remains);
      } finally {
        app.unmount();
      }
    },
    10_000,
  );

  it('lets --dry-run preview a plan that needs --force without failing', async () => {
    writeAt('.claude/skills/pp/SKILL.md', '# edited\n');
    const { app, exit } = renderRun({ dryRun: true });
    try {
      await vi.waitFor(
        () =>
          expect(exit).toHaveBeenCalledWith(
            0,
            expect.stringContaining('skills/pp/SKILL.md'),
          ),
        { timeout: 4_000 },
      );
      expect(exit).toHaveBeenCalledWith(
        0,
        expect.stringContaining('local differs from source'),
      );
      expect(
        readFileSync(join(root, '.claude/skills/pp/SKILL.md'), 'utf8'),
      ).toBe('# edited\n');
    } finally {
      app.unmount();
    }
  });
});
