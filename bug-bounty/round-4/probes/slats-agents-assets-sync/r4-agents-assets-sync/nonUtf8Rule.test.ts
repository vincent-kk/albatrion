// r4-agents-assets-sync, angle RG1 on round 3 item 1: the fix made the apply
// path a byte view (latin1), but the plan-time reader
// (core/buildPlan/utils/readDocument.ts) still decodes AGENTS.md as UTF-8.
// A rule source that is not valid UTF-8 is written byte for byte, then read
// back with U+FFFD and judged diverged on every later run. src/DETAIL.md:96-97
// promises idempotent repeated runs and that a run after --force settles.
// Public API: `runCli`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
} from '../../__tests__/roundThree/fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

const SOURCES: readonly (readonly [label: string, body: Buffer])[] = [
  // "# Café rules\n- Écrire en français.\n" saved in Windows-1252.
  [
    'Windows-1252',
    Buffer.concat([
      Buffer.from('# Caf'),
      Buffer.from([0xe9]),
      Buffer.from(' rules\n- '),
      Buffer.from([0xc9]),
      Buffer.from('crire en fran'),
      Buffer.from([0xe7]),
      Buffer.from('ais.\n'),
    ]),
  ],
  // "# 규칙\n" saved in CP949 (Korean Windows ANSI).
  [
    'CP949',
    Buffer.concat([
      Buffer.from('# '),
      Buffer.from([0xb1, 0xd4, 0xc4, 0xa2]),
      Buffer.from('\n'),
    ]),
  ],
];

describe.each(SOURCES)('a %s rule source', (_label, body) => {
  function setup(): string {
    const root = makeRoot('r4-nonutf8');
    roots.push(root);
    installPackage(root, {
      name: '@probe/kit',
      assets: { 'rules/r.md': body },
      manifest: true,
    });
    return root;
  }
  const args = (root: string, agent: string, ...extra: string[]) => [
    '--package=@probe/kit',
    `--agent=${agent}`,
    '--scope=project',
    `--root=${root}`,
    '--no-interactive',
    ...extra,
  ];

  it('codex: the second run is a no-op, as it is for claude', async () => {
    const root = setup();
    const claude = [
      await runCliCode(args(root, 'claude')),
      await runCliCode(args(root, 'claude')),
    ];
    const codex = [
      await runCliCode(args(root, 'codex')),
      await runCliCode(args(root, 'codex')),
    ];
    const written = readFileSync(join(root, 'AGENTS.md'));
    expect({
      claude,
      codex,
      blockHoldsSourceBytes: written.includes(body),
    }).toEqual({ claude: [0, 0], codex: [0, 0], blockHoldsSourceBytes: true });
  });

  it('codex: the run after --force settles', async () => {
    const root = setup();
    await runCliCode(args(root, 'codex'));
    const forced = await runCliCode(args(root, 'codex', '--force', '--yes'));
    const after = await runCliCode(args(root, 'codex'));
    expect({ forced, after }).toEqual({ forced: 0, after: 0 });
  });
});
