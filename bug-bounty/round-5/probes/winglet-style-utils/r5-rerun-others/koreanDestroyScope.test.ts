// RG2 follow-up: the round-2 style-utils probes cite the README's destroyScope contract.
// The English API reference carries the round-2 fixes; this checks its Korean translation.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageRoot = resolve(__dirname, '../../..');
const read = (name: string) => readFileSync(resolve(packageRoot, name), 'utf8');

/** Returns the API reference section that starts at the `destroyScope(` heading. */
const destroyScopeSection = (markdown: string) => {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.startsWith('#### `destroyScope('));
  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith('#### '),
  );
  return { heading: lines[start], body: lines.slice(start, end).join('\n') };
};

describe('README-ko_kr.md destroyScope API reference matches README.md', () => {
  const english = destroyScopeSection(read('README.md'));
  const korean = destroyScopeSection(read('README-ko_kr.md'));

  it('control: the English heading carries the shadow-root config parameter', () => {
    expect(english.heading).toContain('config?: StyleManagerConfig');
    expect(english.body).toContain('shadowRoot');
  });

  it('the Korean heading states the same signature as the English one', () => {
    expect(korean.heading).toBe(english.heading);
  });

  it('the Korean section tells the reader to pass { shadowRoot } to release a shadow scope', () => {
    expect(korean.body).toContain('shadowRoot');
  });

  it('the Korean section tells the reader to discard the injector after destroyScope', () => {
    // English: "After destroying a scope, discard its existing injector and cleanup functions."
    expect(korean.body).toMatch(/팩토리|주입 함수|injector/);
  });
});
