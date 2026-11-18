import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('round-3 style-utils 8: every packaged guide describes the same shadow cleanup contract', () => {
  for (const path of [
    'docs/agents/skills/style-utils-skill/SKILL.md',
    'docs/agents/skills/style-utils-skill/knowledge/style-manager.md',
    'docs/en/SPECIFICATION.md',
    'docs/ko/SPECIFICATION.md',
  ]) {
    const text = readFileSync(
      new URL('../../' + path, import.meta.url),
      'utf8',
    );
    expect(text).toContain('destroyScope(scopeId, { shadowRoot })');
    expect(text).not.toMatch(
      /cannot reach shadow|not directly targeted|직접 대상으로 삼지/,
    );
  }
});
