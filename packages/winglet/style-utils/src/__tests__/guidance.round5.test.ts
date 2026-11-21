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
  expect(sections[0]).toMatch(/discard.*injector.*cleanup/);
  expect(sections[1]).toMatch(/주입 함수와 정리 함수를 버립니다/);
});
