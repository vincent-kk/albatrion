import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { clone, stableEquals } from '../index';

it.each(['docs/agents/skills/common-utils-skill/SKILL.md', 'docs/agents/skills/common-utils-skill/knowledge/semantics.md', 'src/utils/object/equals/equals.ts'])('round-4 cycle guidance: %s', file => {
  const text = readFileSync(resolve(__dirname, '../..', file), 'utf8');
  expect(text).toContain('can fail to terminate');
  expect(text).toContain('stableEquals');
  expect(text).not.toMatch(/equals`? (?:overflows|overflows the stack)|Circular references cause stack overflow/);
});

it('the documented cycle-safe alternatives preserve cycles', () => {
  const input: { self?: unknown } = {};
  input.self = input;
  const copy = clone(input);
  expect(copy.self).toBe(copy);
  expect(stableEquals(input, copy)).toBe(true);
});
