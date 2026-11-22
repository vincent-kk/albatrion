// r3-agents-assets-sync: bytes outside this tool's blocks in a shared AGENTS.md.
// README.md:60 and core/DETAIL.md:14 promise that everything outside the
// tool's own blocks is carried through byte for byte.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  installPackage,
  makeRoot,
  removeRoot,
  runCliCode,
  writeAt,
} from './fixture.js';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) removeRoot(root);
});

const CASES: readonly (readonly [label: string, prose: Buffer])[] = [
  // "# 팀 메모\n- 규칙\n" saved by an editor in CP949 (EUC-KR).
  [
    'CP949 (Korean Windows ANSI)',
    Buffer.concat([
      Buffer.from('# '),
      Buffer.from([0xc6, 0xc0, 0x20, 0xb8, 0xde, 0xb8, 0xf0]),
      Buffer.from('\n- '),
      Buffer.from([0xb1, 0xd4, 0xc4, 0xa2]),
      Buffer.from('\n'),
    ]),
  ],
  // "# Café notes\n" in Windows-1252.
  [
    'Windows-1252',
    Buffer.concat([
      Buffer.from('# Caf'),
      Buffer.from([0xe9]),
      Buffer.from(' notes\n'),
    ]),
  ],
  // Windows PowerShell 5.1 `Out-File` / `>` default: UTF-16LE with a BOM.
  ['UTF-16LE with BOM', Buffer.from('﻿# Notes\r\n', 'utf16le')],
];

describe('r3-agents-assets-sync: AGENTS.md prose outside the blocks survives a codex run', () => {
  it.each(CASES)(
    'a %s AGENTS.md keeps its own bytes after a rule block is added',
    async (_label, prose) => {
      const root = makeRoot('bytes');
      roots.push(root);
      installPackage(root, {
        name: '@probe/rules',
        assets: { 'rules/r.md': 'rule body\n' },
      });
      writeAt(join(root, 'AGENTS.md'), prose);

      const code = await runCliCode([
        '--package=@probe/rules',
        '--agent=codex',
        '--scope=project',
        `--root=${root}`,
        '--no-interactive',
      ]);
      const after = readFileSync(join(root, 'AGENTS.md'));
      expect({
        code,
        proseKept: after.subarray(0, prose.length).equals(prose),
        head: after.subarray(0, prose.length).toString('hex'),
      }).toEqual({ code: 0, proseKept: true, head: prose.toString('hex') });
    },
  );
});
