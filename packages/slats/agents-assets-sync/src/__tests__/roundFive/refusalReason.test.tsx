import { chmodSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from 'ink-testing-library';
import { afterEach, expect, it, vi } from 'vitest';

import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
} from '../../__tests__/roundThree/fixture.js';
import { renderJSON } from '../../commands/runCli/renderers/renderJSON.js';
import { renderPlain } from '../../commands/runCli/renderers/renderPlain.js';
import type { DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';

const roots: string[] = [];
const savedHome = process.env.HOME;
afterEach(() => {
  process.env.HOME = savedHome;
  for (const root of roots.splice(0)) {
    try {
      chmodSync(join(root, 'AGENTS.md'), 0o644);
    } catch {
      /* absent or a link */
    }
    removeRoot(root);
  }
  vi.restoreAllMocks();
});

function setup(kind: 'read-only' | 'dangling') {
  const root = makeRoot('r5-refusal');
  roots.push(root);
  const packageRoot = installPackage(root, {
    name: '@probe/kit',
    assets: { 'rules/r.md': '# rule\n' },
    manifest: true,
  });
  const agents = join(root, 'AGENTS.md');
  if (kind === 'read-only') {
    writeFileSync(agents, '# Team\n');
    chmodSync(agents, 0o444);
  } else {
    // User scope: ~/.codex/AGENTS.md links to a dotfiles file not cloned yet.
    const home = join(root, 'home');
    mkdirSync(join(home, '.codex'), { recursive: true });
    mkdirSync(join(root, 'dotfiles/codex'), { recursive: true });
    symlinkSync(
      join(root, 'dotfiles/codex/AGENTS.md'),
      join(home, '.codex/AGENTS.md'),
    );
    process.env.HOME = home;
  }
  return { root, target: consumerOf(packageRoot, '@probe/kit', 'manifest') };
}

const flagsFor = (kind: 'read-only' | 'dangling'): DefaultFlags => ({
  agent: ['codex'],
  scope: kind === 'dangling' ? 'user' : 'project',
  asset: ['rules'],
  yes: true,
  interactive: true,
});

async function capture(
  mode: 'plain' | 'json' | 'ink',
  kind: 'read-only' | 'dangling',
) {
  const { root, target } = setup(kind);
  let output = '';
  const record = (...values: unknown[]) => {
    output += values.map(String).join(' ') + '\n';
  };
  if (mode === 'ink') {
    const code = await new Promise<number>((resolve, reject) => {
      const app = render(
        <InjectApp
          targets={[target]}
          flags={flagsFor(kind)}
          originCwd={root}
          onExit={(value) => {
            clearTimeout(timer);
            output = app.lastFrame() ?? '';
            app.unmount();
            resolve(value);
          }}
        />,
      );
      const timer = setTimeout(() => {
        app.unmount();
        reject(new Error('terminal timeout'));
      }, 4000);
    });
    return { code, output };
  }
  vi.spyOn(console, 'log').mockImplementation(record);
  vi.spyOn(console, 'warn').mockImplementation(record);
  vi.spyOn(console, 'error').mockImplementation(record);
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    record(chunk);
    return true;
  });
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    record(chunk);
    return true;
  });
  const code = await (mode === 'plain' ? renderPlain : renderJSON)(
    [target],
    flagsFor(kind),
    root,
  );
  vi.restoreAllMocks();
  return { code, output };
}

it.each([
  ['plain', 'read-only', /read-only/i],
  ['json', 'read-only', /read-only/i],
  ['ink', 'read-only', /read-only/i],
  ['ink', 'dangling', /dangling/i],
  ['plain', 'dangling', /dangling/i],
  ['json', 'dangling', /dangling/i],
] as const)(
  '%s: a refused %s AGENTS.md names the reason, not only the rule path',
  async (mode, kind, reason) => {
    const { code, output } = await capture(mode, kind);
    expect({ code, namesReason: reason.test(output) }).toEqual({
      code: 1,
      namesReason: true,
    });
  },
);

it.each(['plain', 'json'] as const)(
  'control: %s reports only the generic failure for the read-only document',
  async (mode) => {
    const { code, output } = await capture(mode, 'read-only');
    expect({
      code,
      generic: output.includes('Failed to apply: rules/r.md'),
    }).toEqual({ code: 1, generic: true });
  },
);

it('ink: an apply failure names the failed rule in the summary, as the plain transcript does', async () => {
  const { code, output } = await capture('ink', 'read-only');
  expect({ code, namesPath: output.includes('rules/r.md') }).toEqual({
    code: 1,
    namesPath: true,
  });
});

it('measurement: the terminal summary frame for a refused read-only AGENTS.md', async () => {
  const { output } = await capture('ink', 'read-only');
  process.stdout.write(`\n----- frame -----\n${output}\n-----------------\n`);
  expect(output.length).toBeGreaterThan(0);
});
