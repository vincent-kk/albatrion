import { afterEach, expect, it, vi } from 'vitest';

import { makeRoot, removeRoot, runCliCode } from './roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  roots.splice(0).forEach(removeRoot);
  vi.restoreAllMocks();
});

it.each([
  ['plain output on a terminal', ['--no-interactive'], true],
  ['plain output without a terminal', [], false],
  ['--json on a terminal', ['--json'], true],
  ['--json without a terminal', ['--json'], false],
] as const)('a missing --agent exits 2 for %s', async (_label, extra, isTTY) => {
  const root = makeRoot('missing-agent');
  roots.push(root);
  const tty = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
  Object.defineProperty(process.stdout, 'isTTY', { configurable: true, value: isTTY });
  vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  try {
    expect(
      await runCliCode([
        '--package=@probe/none',
        '--scope=project',
        `--root=${root}`,
        ...extra,
      ]),
    ).toBe(2);
  } finally {
    if (tty) Object.defineProperty(process.stdout, 'isTTY', tty);
    else Reflect.deleteProperty(process.stdout, 'isTTY');
  }
});
