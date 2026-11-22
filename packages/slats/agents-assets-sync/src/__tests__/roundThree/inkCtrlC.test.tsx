// r3-agents-assets-sync: cancelling the TTY force dialog with Ctrl-C.
// `renderInjectApp` renders with `exitOnCtrlC: true` and returns its local
// `exitCode`, which only `onExit` ever changes. Only Ink's streams are swapped
// for in-memory ones here; `exitOnCtrlC` and the rest of the options are kept.
import { chmodSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DefaultFlags } from '../../types/index.js';
import { renderInjectApp } from '../../ui/InjectApp/utils/renderInjectApp.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './fixture.js';

const streams = vi.hoisted(() => ({
  __r3Stdin: { write: (_data: string) => {} },
  __r3Stdout: { frames: [] as string[], lastFrame: (): string => '' },
}));

vi.mock('ink', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ink')>();
  const { WriteStream } = await import('node:tty');
  const { Socket } = await import('node:net');
  class Stdout extends WriteStream {
    constructor() {
      super(1);
    }
    frames: string[] = [];
    columns = 100;
    write = (
      frame: string | Uint8Array,
      encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void,
    ) => {
      if (String(frame)) this.frames.push(String(frame));
      if (typeof encodingOrCallback === 'function') encodingOrCallback();
      else callback?.();
      return true;
    };
    lastFrame = () => this.frames.at(-1) ?? '';
  }
  class Stdin extends Socket {
    isRaw = false;
    isTTY = true;
    data: string | null = null;
    write = (data: string | Uint8Array) => {
      this.data = String(data);
      this.emit('readable');
      this.emit('data', data);
      return true;
    };
    setEncoding() {
      return this;
    }
    setRawMode(mode: boolean) {
      this.isRaw = mode;
      return this;
    }
    resume() {
      return this;
    }
    pause() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    read = () => {
      const { data } = this;
      this.data = null;
      return data;
    };
  }
  return {
    ...actual,
    render: (tree: Parameters<typeof actual.render>[0], options?: object) => {
      const stdout = new Stdout();
      const stdin = new Stdin();
      streams.__r3Stdout = stdout;
      streams.__r3Stdin = stdin;
      return actual.render(tree, {
        ...options,
        stdout: stdout,
        stderr: new Stdout(),
        stdin: stdin,
        debug: true,
        patchConsole: false,
      });
    },
  };
});

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

async function waitForFrame(text: string): Promise<boolean> {
  for (let i = 0; i < 100; i += 1) {
    if (streams.__r3Stdout?.lastFrame().includes(text)) return true;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return false;
}

describe('r3-agents-assets-sync: cancelling the TTY force dialog', () => {
  it.each([
    ['answering "No, cancel"', ['j', '\r'], 2, true],
    ['pressing Ctrl-C', ['\u0003'], 2, true],
    // The dialog footer reads "y:accept · n:cancel" (Footer.tsx:19).
    ['pressing "n" as the footer hint says', ['n'], 2, true],
    ['pressing Escape', ['\u001b'], 2, true],
    ['pressing y', ['y'], 0, false],
    ['unadvertised a followed by cancel', ['a', 'n'], 2, true],
  ] as const)(
    '%s at the --force dialog produces its advertised decision',
    async (_label, keys, expectedCode, keepUserEdit) => {
      const root = makeRoot('ctrlc');
      roots.push(root);
      const packageRoot = installPackage(root, {
        name: '@probe/diverged',
        assets: { 'skills/d/SKILL.md': '# shipped\n' },
      });
      const installed = join(root, '.claude/skills/d/SKILL.md');
      writeAt(installed, '# edited by user\n');
      const flags: DefaultFlags = {
        agent: ['claude'],
        scope: 'project',
        force: true,
        yes: false,
        dryRun: false,
        interactive: true,
      };

      const pending = renderInjectApp({
        targets: [consumerOf(packageRoot, '@probe/diverged', 'directory')],
        flags,
        originCwd: root,
      });
      const dialogShown = await waitForFrame('need --force confirmation');
      // Let the dialog's input subscription attach before typing.
      await new Promise((resolve) => setTimeout(resolve, 300));
      for (const key of keys) {
        streams.__r3Stdin.write(key);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      const exitCode = await Promise.race([
        pending,
        new Promise<string>((resolve) =>
          setTimeout(() => resolve('timeout'), 2000),
        ),
      ]);
      // A dialog still waiting is torn down so the next case starts clean.
      if (exitCode === 'timeout') streams.__r3Stdin.write('\u0003');
      expect({
        dialogShown,
        exitCode,
        userEditKept: readFileSync(installed, 'utf8') === '# edited by user\n',
      }).toEqual({ dialogShown: true, exitCode: expectedCode, userEditKept: keepUserEdit });
    },
    15_000,
  );
});

it.each([
  ['agent', {}],
  ['scope', { agent: ['claude'] }],
] as const)('Ctrl-C cancels the %s picker', async (picker, _supplied) => {
  const root = makeRoot('picker-cancel');
  roots.push(root);
  const packageRoot = installPackage(root, {
    name: '@probe/picker',
    assets: { 'rules/r.md': '# rule' },
  });
  const pending = renderInjectApp({
    targets: [consumerOf(packageRoot, '@probe/picker', 'directory')],
    flags: {
      force: false,
      yes: false,
      dryRun: false,
      interactive: true,
      ...(picker === 'scope' ? { agent: ['claude'] } : {}),
    },
    originCwd: root,
  });
  expect(await waitForFrame(`Select the target ${picker}`)).toBe(true);
  await new Promise((resolve) => setTimeout(resolve, 300));
  streams.__r3Stdin.write('\u0003');
  expect(await pending).toBe(2);
});

/** Supply the terminal signal to the public CLI; Ink still handles the bytes. */
async function runTerminal(root: string, ...args: string[]) {
  const tty = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
  Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value: true });
  try {
    return await runCliCode(['--agent=claude', '--scope=project', `--root=${root}`, ...args]);
  } finally {
    if (tty) Object.defineProperty(process.stdout, 'isTTY', tty);
    else Reflect.deleteProperty(process.stdout, 'isTTY');
  }
}

it.each([
  ['y', 0],
  ['n', 2],
  ['\u001b', 2],
  ['\u0003', 2],
] as const)('public terminal: key %j gives exit %i on a confirmed deletion', async (key, expected) => {
  const root = makeRoot('public-terminal-orphan');
  roots.push(root);
  installPackage(root, {
    name: '@probe/terminal',
    assets: { 'skills/unit/SKILL.md': '# package\n' },
  });
  const retired = join(root, '.claude/skills/unit/retired.md');
  writeAt(retired, '# orphan\n');
  const pending = runTerminal(root, '--package=@probe/terminal', '--force');
  expect(await waitForFrame('need --force confirmation')).toBe(true);
  const prompt = streams.__r3Stdout.lastFrame();
  expect(prompt).toContain('retired.md');
  expect(prompt).toMatch(/Yes, delete/i);
  expect(prompt).not.toMatch(/a:accept/i);
  await new Promise((resolve) => setTimeout(resolve, 100));
  streams.__r3Stdin.write(key);

  expect(await pending).toBe(expected);
  expect(existsSync(retired)).toBe(expected === 2);
});

it.each([
  ['prepare failure', '{', false, 1],
  ['unconfirmed retirement', undefined, true, 2],
] as const)('public terminal: %s keeps a good participant and reports exit %i', async (_label, manifestText, orphan, code) => {
  const root = makeRoot('public-terminal-partial');
  roots.push(root);
  installPackage(root, { name: '@probe/good', assets: { 'skills/good/SKILL.md': '# good\n' } });
  installPackage(root, {
    name: '@probe/other',
    assets: { 'skills/shared/SKILL.md': '# other\n' },
    ...(manifestText ? { manifestText } : {}),
  });
  const retired = join(root, '.claude/skills/shared/retired.md');
  if (orphan) writeAt(retired, '# orphan\n');
  expect(await runTerminal(root, '--package=@probe/other,@probe/good')).toBe(code);
  expect(existsSync(join(root, '.claude/skills/good/SKILL.md'))).toBe(true);
  if (orphan) expect(existsSync(retired)).toBe(true);
});

it.each(['--agent=bad', '--scope=bad', '--asset=bad'])(
  'public terminal: rejects invalid input %s',
  async (flag) => {
    const root = makeRoot('public-terminal-flag');
    roots.push(root);
    expect(await runTerminal(root, flag)).toBe(2);
  },
);

it('public terminal: labels both agents and applies a repeated package only once per agent', async () => {
  const root = makeRoot('public-terminal-dedup');
  roots.push(root);
  installPackage(root, { name: '@probe/kit', assets: { 'skills/shared/SKILL.md': '# skill\n' } });
  expect(await runTerminal(root, '--package=@probe/kit,@probe/kit', '--agent=codex')).toBe(0);
  const frame = streams.__r3Stdout.frames.filter((value) => value.includes('created')).at(-1) ?? '';
  expect(frame).toMatch(/claude/i);
  expect(frame).toMatch(/codex/i);
  expect(frame.split('\n').filter((line) => line.includes('▸ @probe/kit'))).toHaveLength(2);
  expect(frame).toMatch(/created\s+2/);
  expect(existsSync(join(root, '.claude/skills/shared/SKILL.md'))).toBe(true);
  expect(existsSync(join(root, '.agents/skills/shared/SKILL.md'))).toBe(true);
});

it('public terminal: shows the write refusal path and reason', async () => {
  const root = makeRoot('public-terminal-refusal');
  roots.push(root);
  installPackage(root, { name: '@probe/kit', assets: { 'rules/a.md': '# shipped\n' } });
  const path = join(root, '.claude/rules/a.md');
  writeAt(path, '# user\n');
  chmodSync(path, 0o444);
  expect(await runTerminal(root, '--package=@probe/kit', '--force', '--yes')).toBe(1);
  const summary = streams.__r3Stdout.frames.filter((value) => /read.only/i.test(value)).at(-1) ?? '';
  expect(summary).toContain('a.md');
  expect(summary).toMatch(/read.only/i);
  expect(readFileSync(path, 'utf8')).toBe('# user\n');
});

it('public terminal: lists a shared relative path once for each diverged agent', async () => {
  const root = makeRoot('public-terminal-shared-path');
  roots.push(root);
  const asset = 'skills/kit/SKILL.md';
  installPackage(root, { name: '@probe/kit', assets: { [asset]: '# shipped\n' } });
  writeAt(join(root, '.claude', asset), '# local Claude\n');
  writeAt(join(root, '.agents', asset), '# local Codex\n');
  const pending = runTerminal(root, '--package=@probe/kit', '--agent=codex', '--force');
  expect(await waitForFrame('need --force confirmation')).toBe(true);
  expect(streams.__r3Stdout.lastFrame().split(asset)).toHaveLength(3);
  await new Promise((resolve) => setTimeout(resolve, 100));
  streams.__r3Stdin.write('n');
  expect(await pending).toBe(2);
});
