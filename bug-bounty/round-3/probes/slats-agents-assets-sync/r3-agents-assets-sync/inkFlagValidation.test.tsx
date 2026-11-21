// r3-agents-assets-sync: invalid --asset / --agent values on the TTY path.
// src/DETAIL.md: invalid --agent and --asset values exit 2. Only renderPlain and
// renderJSON validate them; useInjectSession filters unknown --asset values out
// ("the CLI layer already rejected unknown values") and useResolveStep drops
// unknown --agent values, so the Ink path never sees an error.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPlain } from '../../commands/runCli/renderers/renderPlain.js';
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
  vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
    throw Object.assign(new Error('exit'), { exitCode: code });
  }) as never);
  try {
    return await renderPlain(targets, flags, originCwd);
  } catch (error) {
    return (error as { exitCode: number }).exitCode;
  } finally {
    vi.restoreAllMocks();
  }
}

// A rule to refresh, and a skill the user edited locally.
function setup(root: string): { target: ConsumerPackage; skill: string } {
  const packageRoot = installPackage(root, {
    name: '@probe/kinds',
    assets: {
      'rules/r.md': 'rule body\n',
      'skills/s/SKILL.md': '# shipped\n',
    },
  });
  const skill = join(root, '.claude/skills/s/SKILL.md');
  writeAt(skill, '# edited by user\n');
  return { target: consumerOf(packageRoot, '@probe/kinds', 'directory'), skill };
}

describe('r3-agents-assets-sync: invalid flag values on the TTY path', () => {
  it('--asset=rule (a typo for rules) with --force --yes is rejected, not widened to every kind', async () => {
    const flags: DefaultFlags = {
      agent: ['claude'],
      scope: 'project',
      asset: ['rule'],
      force: true,
      yes: true,
      dryRun: false,
      interactive: true,
    };
    const plainRoot = makeRoot('asset-plain');
    const inkRoot = makeRoot('asset-ink');
    roots.push(plainRoot, inkRoot);
    const plainSetup = setup(plainRoot);
    const inkSetup = setup(inkRoot);

    const plain = await plainExitCode([plainSetup.target], flags, plainRoot);
    const ink = await inkExitCode([inkSetup.target], flags, inkRoot);
    expect({
      plain,
      ink,
      skillEditKept: {
        plain: readFileSync(plainSetup.skill, 'utf8') === '# edited by user\n',
        ink: readFileSync(inkSetup.skill, 'utf8') === '# edited by user\n',
      },
    }).toEqual({
      plain: 2,
      ink: 2,
      skillEditKept: { plain: true, ink: true },
    });
  });

  it('--agent=claude,codx (a typo) is rejected on the TTY path too', async () => {
    const flags: DefaultFlags = {
      agent: ['claude', 'codx'],
      scope: 'project',
      force: false,
      yes: false,
      dryRun: false,
      interactive: true,
    };
    const plainRoot = makeRoot('agent-plain');
    const inkRoot = makeRoot('agent-ink');
    roots.push(plainRoot, inkRoot);
    const target = (root: string) =>
      consumerOf(
        installPackage(root, {
          name: '@probe/agents',
          assets: { 'skills/a/SKILL.md': '# a\n' },
        }),
        '@probe/agents',
        'directory',
      );

    const plain = await plainExitCode([target(plainRoot)], flags, plainRoot);
    const ink = await inkExitCode([target(inkRoot)], flags, inkRoot);
    expect({ plain, ink }).toEqual({ plain: 2, ink: 2 });
  });
});
