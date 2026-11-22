import { fork } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { expect, it } from 'vitest';

import {
  TSX_LOADER,
  makeRoot,
  removeRoot,
  sha256,
} from '../../../__tests__/roundThree/fixture.js';

it('merges two owners through physical aliases after both processes read the old record', async () => {
  const root = makeRoot('concurrent-record');
  const parent = join(root, '.claude');
  const alias = join(root, 'same-claude');
  mkdirSync(parent);
  symlinkSync(parent, alias, 'dir');
  const file = 'agents-assets-sync.json';
  const childPath = fileURLToPath(new URL('./helpers/writeInstalledAssets.ts', import.meta.url));
  const owners = [
    ['@probe/first', parent],
    ['@probe/second', alias],
  ];
  const writers = owners.map(([owner, directory]) => {
    const child = fork(childPath, [join(directory, file), owner, sha256(owner)], {
      execArgv: ['--import', pathToFileURL(TSX_LOADER).href],
      stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
    });
    return { child, ready: once(child, 'message'), exit: once(child, 'exit') };
  });
  try {
    await Promise.all(writers.map(({ ready }) => ready));
    for (const { child } of writers) child.send('record');
    expect(await Promise.all(writers.map(({ exit }) => exit))).toEqual([
      [0, null],
      [0, null],
    ]);
    expect(JSON.parse(readFileSync(join(parent, file), 'utf8'))).toEqual(
      Object.fromEntries(
        owners.map(([name]) => [name, { 'rules/installed.md': sha256(name) }]),
      ),
    );
  } finally {
    for (const { child } of writers)
      if (child.exitCode === null && child.signalCode === null) child.kill();
    removeRoot(root);
  }
});
