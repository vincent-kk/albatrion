// r3-agents-assets-sync: cancelling the TTY force dialog with Ctrl-C.
// `renderInjectApp` renders with `exitOnCtrlC: true` and returns its local
// `exitCode`, which only `onExit` ever changes. Only Ink's streams are swapped
// for in-memory ones here; `exitOnCtrlC` and the rest of the options are kept.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DefaultFlags } from '../../types/index.js';
import { renderInjectApp } from '../../ui/InjectApp/utils/renderInjectApp.js';
import {
  consumerOf,
  installPackage,
  makeRoot,
  removeRoot,
  writeAt,
} from './fixture.js';

interface FakeStdin {
  write(data: string): void;
}
interface FakeStdout {
  lastFrame(): string;
}
const streams = globalThis as unknown as {
  __r3Stdin: FakeStdin;
  __r3Stdout: FakeStdout;
};

vi.mock('ink', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ink')>();
  const { EventEmitter } = await import('node:events');
  class Stdout extends EventEmitter {
    frames: string[] = [];
    columns = 100;
    write = (frame: string) => {
      this.frames.push(frame);
      return true;
    };
    lastFrame = () => this.frames.at(-1) ?? '';
  }
  class Stdin extends EventEmitter {
    isTTY = true;
    data: string | null = null;
    write = (data: string) => {
      this.data = data;
      this.emit('readable');
      this.emit('data', data);
    };
    setEncoding() {}
    setRawMode() {}
    resume() {}
    pause() {}
    ref() {}
    unref() {}
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
        stdout: stdout as never,
        stderr: new Stdout() as never,
        stdin: stdin as never,
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
    ['answering "No, cancel"', ['j', '\r']],
    ['pressing Ctrl-C', ['\u0003']],
    // The dialog footer reads "y:accept · n:cancel" (Footer.tsx:19).
    ['pressing "n" as the footer hint says', ['n']],
  ] as const)(
    '%s at the --force dialog applies nothing and exits non-zero',
    async (_label, keys) => {
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
      }).toEqual({ dialogShown: true, exitCode: 2, userEditKept: true });
    },
    15_000,
  );
});
