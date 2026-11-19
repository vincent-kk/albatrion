import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'ink-testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import * as core from '../../core/index.js';
import type { RunResult } from '../../core/index.js';
import { renderPlain } from '../../commands/runCli/renderers/renderPlain.js';
import { renderJSON } from '../../commands/runCli/renderers/renderJSON.js';
import { InjectApp } from '../../ui/InjectApp/InjectApp.js';
import type { ConsumerPackage, DefaultFlags } from '../../types/index.js';
import { consumerOf, installPackage, makeRoot, removeRoot, writeAt } from '../roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => { vi.restoreAllMocks(); roots.splice(0).forEach(removeRoot); });

/** Records only destination bytes, independently of the reported plan. */
function written(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const visit = (relative: string) => {
    if (!existsSync(join(root, relative))) return;
    for (const entry of readdirSync(join(root, relative), { withFileTypes: true })) {
      const path = `${relative}/${entry.name}`;
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files[path] = readFileSync(join(root, path)).toString('hex');
    }
  };
  visit('.claude'); visit('.agents');
  if (existsSync(join(root, 'AGENTS.md'))) files['AGENTS.md'] = readFileSync(join(root, 'AGENTS.md')).toString('hex');
  return files;
}

/** Run a real surface, observing the core result without changing it. */
async function surface(mode: 'plain' | 'json' | 'ink', root: string, targets: ConsumerPackage[], flags: DefaultFlags, choices = false) {
  const original = core.runInjection;
  let model: RunResult | undefined;
  vi.spyOn(core, 'runInjection').mockImplementation(async input => { model = await original(input); return model; });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let code: number;
  if (mode !== 'ink') {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    code = await (mode === 'plain' ? renderPlain : renderJSON)(targets, flags, root);
  } else {
    code = await new Promise<number>((resolve, reject) => {
      const app = render(<InjectApp targets={targets} flags={flags} originCwd={root} onExit={value => { clearTimeout(timer); app.unmount(); resolve(value); }} />);
      const timer = setTimeout(() => { app.unmount(); reject(new Error('terminal timeout')); }, 4000);
      if (choices) {
        const answer = () => {
          const frame = app.lastFrame() ?? '';
          if (frame.includes('Select the target agent') || frame.includes('Select the target scope')) app.stdin.write('\r');
          else if (frame.includes('overwrite') && frame.includes('Yes,')) app.stdin.write('y');
        };
        const interval = setInterval(answer, 20);
        setTimeout(() => clearInterval(interval), 450);
      }
    });
  }
  vi.restoreAllMocks();
  expect(model).toBeDefined();
  const normalized = JSON.stringify(model).split(realpathSync(root)).join('<root>').split(root).join('<root>');
  return { code, model: JSON.parse(normalized), files: written(root) };
}

/** Exercise the same application request through each output mode twice. */
async function compare(kind: string, overrides: Partial<DefaultFlags> = {}, interactive = false) {
  const outcomes = [];
  for (const mode of ['plain', 'json', 'ink'] as const) {
    const root = makeRoot('r4-model'); roots.push(root);
    const names = kind === 'shared' || kind === 'conflict' ? ['a', 'b'] : ['a'];
    const targets = names.map(name => consumerOf(installPackage(root, {
      name: `@probe/${name}`,
      assets: { [kind === 'conflict' ? 'skills/shared/SKILL.md' : `skills/shared/${name}.md`]: name },
      ...(kind === 'broken' ? { manifestText: '{' } : {}),
    }), `@probe/${name}`, kind === 'broken' ? 'manifest' : 'directory'));
    if (kind === 'diverged') writeAt(join(root, '.claude/skills/shared/a.md'), 'user');
    if (kind === 'orphan') writeAt(join(root, '.claude/skills/shared/old.md'), 'orphan');
    const flags: DefaultFlags = { agent: ['claude'], scope: 'project', yes: true, interactive: true, ...overrides };
    const inputFlags = mode === 'ink' && interactive ? { ...flags, agent: undefined, scope: undefined } : flags;
    const selected = kind === 'empty' ? [] : targets;
    const first = await surface(mode, root, selected, inputFlags, interactive);
    const second = await surface(mode, root, selected, inputFlags, interactive);
    outcomes.push({ first, second });
    if (kind === 'conflict') {
      expect(first.code).toBe(1);
      expect(Object.keys(first.files)).toEqual([]);
    } else if (kind === 'overlap') {
      expect(first.model.units).toHaveLength(1);
    }
    if (second.code === 0 && !overrides.dryRun) {
      expect(second.model.units.flatMap((unit: core.RunUnit) => unit.plan.actions).every((action: core.Action) => action.kind === 'skip-uptodate' || action.kind === 'skip-unsupported')).toBe(true);
    }
  }
  expect(outcomes[1]).toEqual(outcomes[0]);
  expect(outcomes[2]).toEqual(outcomes[0]);
}

it.each([
  ['shared', {}], ['conflict', {}], ['overlap', { agent: ['codex', 'agents'] }],
  ['shared', { agent: ['claude', 'claude'] }], ['shared', { agent: ['claude', 'codex'] }],
  ['shared', { force: true }], ['diverged', { force: true }], ['diverged', {}],
  ['diverged', { dryRun: true }], ['orphan', { force: true }], ['broken', {}],
  ['empty', { agent: ['codx'] }], ['empty', { asset: ['rule'] }], ['empty', { scope: 'bad' }],
] satisfies [string, Partial<DefaultFlags>][] )('same plans, files, exit and settled rerun: %s %j', compare);

it.each(['shared', 'diverged'])('interactive choices equal explicit flags: %s', kind => compare(kind, { force: true }, true));
