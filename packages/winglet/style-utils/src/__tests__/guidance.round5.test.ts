import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, it } from 'vitest';

it('keeps the Korean destroyScope contract aligned with its English source', () => {
  const sections = ['README.md', 'README-ko_kr.md'].map(file => {
    const markdown = readFileSync(resolve(__dirname, '../..', file), 'utf8');
    return markdown.split('#### `destroyScope(')[1]?.split('\n#### ')[0] ?? '';
  });
  expect(sections[1].split('\n')[0]).toBe(sections[0].split('\n')[0]);
  expect(sections.every(section => section.includes('{ shadowRoot }'))).toBe(true);
  expect(sections[0]).toContain('reuse the injector');
  expect(sections[1]).toContain('주입 함수를 재사용할 수 있습니다');
});
