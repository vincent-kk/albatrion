// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('distinguishes committed imperative references from current render snapshots in the shipped guide', () => {
  const guide = readFileSync(new URL('../../docs/agents/skills/react-utils-skill/knowledge/hooks.md', import.meta.url), 'utf8');
  expect(guide).not.toContain('is `useSnapshot` before the `.current` read');
  expect(guide).toContain('last committed snapshot');
  expect(guide).toContain('Use `useSnapshot` for values read during render');
});
