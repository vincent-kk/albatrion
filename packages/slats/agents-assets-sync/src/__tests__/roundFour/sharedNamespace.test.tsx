import { existsSync } from 'node:fs';
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
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

function setup(): { root: string; targets: ConsumerPackage[] } {
  const root = makeRoot('r4-shared-ns');
  roots.push(root);
  const targets = (['a', 'b'] as const).map((name) =>
    consumerOf(
      installPackage(root, {
        name: `@probe/${name}`,
        assets: { [`skills/shared/${name}.md`]: `# ${name}\n` },
        manifest: true,
      }),
      `@probe/${name}`,
      'manifest',
    ),
  );
  return { root, targets };
}

function quiet(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
}

async function run(
  surface: 'plain' | 'json' | 'ink',
  root: string,
  targets: ConsumerPackage[],
  force = false,
) {
  const flags: DefaultFlags = {
    agent: ['claude'],
    scope: 'project',
    force,
    yes: true,
    interactive: true,
  };
  let code: number | 'timeout';
  if (surface === 'ink') {
    code = await new Promise<number | 'timeout'>((resolve) => {
      const timer = setTimeout(() => {
        app.unmount();
        resolve('timeout');
      }, 4000);
      const app = render(
        <InjectApp
          targets={targets}
          flags={flags}
          originCwd={root}
          onExit={(value) => {
            clearTimeout(timer);
            app.unmount();
            resolve(value);
          }}
        />,
      );
    });
  } else {
    quiet();
    code = await (surface === 'plain' ? renderPlain : renderJSON)(
      targets,
      flags,
      root,
    );
    vi.restoreAllMocks();
  }
  const files = (['a', 'b'] as const).filter((name) =>
    existsSync(join(root, `.claude/skills/shared/${name}.md`)),
  );
  return { code, files };
}

it('a first install of two packages sharing a skill namespace gives the same result on every output path', async () => {
  const results: Record<string, unknown> = {};
  for (const surface of ['plain', 'json', 'ink'] as const) {
    const { root, targets } = setup();
    results[surface] = await run(surface, root, targets);
  }
  expect(results.json).toEqual(results.plain);
  expect(results.ink).toEqual(results.plain);
});

it('two packages sharing a skill namespace settle after --force instead of deleting each other on every run', async () => {
  const { root, targets } = setup();
  const runs = [
    await run('plain', root, targets, true),
    await run('plain', root, targets, true),
    await run('plain', root, targets),
  ];
  expect(runs.at(-1)).toEqual({ code: 0, files: ['a', 'b'] });
});
