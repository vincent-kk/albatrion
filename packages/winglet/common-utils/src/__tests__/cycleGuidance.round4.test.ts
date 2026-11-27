import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it.each(['docs/agents/skills/common-utils-skill/SKILL.md', 'docs/agents/skills/common-utils-skill/knowledge/semantics.md', 'src/utils/object/equals/equals.ts'])('round-4 cycle guidance: %s', file => {
  const text = readFileSync(resolve(__dirname, '../..', file), 'utf8');
  expect(text).toContain('RangeError');
  expect(text).toContain('stableEquals');
  expect(text).not.toMatch(/equals`? (?:overflows|overflows the stack)|Circular references cause stack overflow/);
});
