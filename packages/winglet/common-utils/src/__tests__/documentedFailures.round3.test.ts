import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

import { combination, digitSum, fromBase, permutation, toBase } from '../index';

const skillDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/agents/skills/common-utils-skill',
);

it.each([
  ['combination', () => combination(-1, 2)],
  ['permutation', () => permutation(2.5, 1)],
  ['digitSum', () => digitSum(1.5)],
  ['toBase', () => toBase(1.5, 2)],
  ['fromBase', () => fromBase('', 10)],
] as const)(
  'round-3 common-utils 9: guidance includes the actual %s failure',
  (name, run) => {
    const skill = readFileSync(resolve(skillDirectory, 'SKILL.md'), 'utf8');
    const semantics = readFileSync(
      resolve(skillDirectory, 'knowledge/semantics.md'),
      'utf8',
    );
    expect(run).toThrow();
    expect(skill).not.toMatch(/only exports that throw on invalid input/);
    const failures = semantics.split('## Input failures')[1]?.split('## ')[0];
    expect(failures).toContain('`' + name + '`');
  },
);
