// r3-agents-assets-sync: the Ink (TTY) renderer against the plain renderer.
// src/DETAIL.md: renderers do not re-judge targets, so the exit code does not
// depend on the output mode. Same targets, same flags, two renderers.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderOrFallback } from '../../commands/runCli/renderers/renderOrFallback.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

const FLAGS: DefaultFlags = {
  agent: ['claude'],
  scope: 'project',
  force: false,
  yes: false,
  dryRun: false,
  interactive: true,
};

function inkExitCode(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
): Promise<number | 'timeout'> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      app.unmount();
      resolve('timeout');
    }, 8000);
    const app = render(
      <InjectApp
        targets={targets}
        flags={flags}
        originCwd={originCwd}
        onExit={(code) => {
          clearTimeout(timer);
          app.unmount();
          resolve(code);
        }}
      />,
    );
  });
}

async function plainExitCode(
  targets: readonly ConsumerPackage[],
  flags: DefaultFlags,
  originCwd: string,
): Promise<number> {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  try {
    return await renderOrFallback(
      targets,
      { ...flags, json: false },
      originCwd,
      [],
      { isTTY: false },
    );
  } finally {
    vi.restoreAllMocks();
  }
}

describe('r3-agents-assets-sync: Ink exit code matches the plain renderer', () => {
  it('a clean unit beside a blocked unit is applied on the TTY path as on the plain path', async () => {
    const setup = (root: string): ConsumerPackage[] => {
      const cleanRoot = installPackage(root, {
        name: '@probe/clean',
        assets: { 'skills/c/SKILL.md': '# clean\n' },
      });
      const divergedRoot = installPackage(root, {
        name: '@probe/diverged',
        assets: { 'skills/d/SKILL.md': '# shipped\n' },
      });
      writeAt(join(root, '.claude/skills/d/SKILL.md'), '# edited by user\n');
      return [
        consumerOf(cleanRoot, '@probe/clean', 'directory'),
        consumerOf(divergedRoot, '@probe/diverged', 'directory'),
      ];
    };
    const plainRoot = makeRoot('ink-d-plain');
    const inkRoot = makeRoot('ink-d-ink');
    roots.push(plainRoot, inkRoot);

    const plain = await plainExitCode(setup(plainRoot), FLAGS, plainRoot);
    const ink = await inkExitCode(setup(inkRoot), FLAGS, inkRoot);
    expect({
      plain,
      ink,
      cleanApplied: {
        plain: existsSync(join(plainRoot, '.claude/skills/c/SKILL.md')),
        ink: existsSync(join(inkRoot, '.claude/skills/c/SKILL.md')),
      },
    }).toEqual({
      plain: 2,
      ink: 2,
      cleanApplied: { plain: true, ink: true },
    });
  });
});
