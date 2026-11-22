// r4-agents-assets-sync, angle EQ9 (terminal output): one package with two
// agents gives two (package, agent) plans. src/DETAIL.md:11 says two agents
// make one plan per pair, and TargetCard's own `agent` prop exists because
// "one package can have several". The terminal keys every list row by package
// name alone and never passes the agent, so React reports duplicate keys (the
// CLI loads React's development build unless NODE_ENV is set) and the two
// cards cannot be told apart. Internal fixture: `InjectApp` rendered with
// ink-testing-library, the component `renderInjectApp` mounts.
import { render } from 'ink-testing-library';
import { afterEach, expect, it, vi } from 'vitest';

import type { DefaultFlags } from '../../types/index.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
  vi.restoreAllMocks();
});

it('a terminal run with --agent=claude,codex raises no duplicate-key error and labels each card with its agent', async () => {
  const root = makeRoot('r4-ink-agents');
  roots.push(root);
  const target = consumerOf(
    installPackage(root, {
      name: '@probe/kit',
      assets: { 'skills/kit/SKILL.md': '# kit\n', 'rules/r.md': '# rule\n' },
      manifest: true,
    }),
    '@probe/kit',
    'manifest',
  );
  const errors: string[] = [];
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(args.map(String).join(' '));
  });
  const flags: DefaultFlags = {
    agent: ['claude', 'codex'],
    scope: 'project',
    yes: true,
    interactive: true,
  };
  const frames: string[] = [];
  const code = await new Promise<number | 'timeout'>((resolve) => {
    const timer = setTimeout(() => {
      app.unmount();
      resolve('timeout');
    }, 4000);
    const app = render(
      <InjectApp
        targets={[target]}
        flags={flags}
        originCwd={root}
        onExit={(value) => {
          clearTimeout(timer);
          frames.push(app.lastFrame() ?? '');
          app.unmount();
          resolve(value);
        }}
      />,
    );
  });
  const summary = frames.at(-1) ?? '';
  console.log(summary);
  console.log(errors.find((line) => /same key/.test(line)));
  expect({
    code,
    duplicateKeyErrors: errors.filter((line) => /same key/.test(line)).length,
    cardsNameEachAgent: /claude/.test(summary) && /codex/.test(summary),
  }).toEqual({ code: 0, duplicateKeyErrors: 0, cardsNameEachAgent: true });
});

// resolveAgentFlag.ts JSDoc: "`--agent claude,codex` and `--agent claude
// --agent claude --agent codex` behave alike" — the plain and --json paths
// drop the repeated agent; the terminal path plans it twice.
it('a terminal run with --agent=claude,claude plans one unit, as the plain and --json paths do', async () => {
  const root = makeRoot('r4-ink-dup-agent');
  roots.push(root);
  const target = consumerOf(
    installPackage(root, {
      name: '@probe/kit',
      assets: { 'skills/kit/SKILL.md': '# kit\n' },
      manifest: true,
    }),
    '@probe/kit',
    'manifest',
  );
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const flags: DefaultFlags = {
    agent: ['claude', 'claude'],
    scope: 'project',
    yes: true,
    interactive: true,
  };
  const summary = await new Promise<string>((resolve) => {
    const timer = setTimeout(() => {
      app.unmount();
      resolve('timeout');
    }, 4000);
    const app = render(
      <InjectApp
        targets={[target]}
        flags={flags}
        originCwd={root}
        onExit={() => {
          clearTimeout(timer);
          const frame = app.lastFrame() ?? '';
          app.unmount();
          resolve(frame);
        }}
      />,
    );
  });
  expect({
    cards: summary.split('\n').filter((line) => line.includes('▸ @probe/kit'))
      .length,
    created: /created\s+(\d+)/.exec(summary)?.[1],
  }).toEqual({ cards: 1, created: '1' });
});
