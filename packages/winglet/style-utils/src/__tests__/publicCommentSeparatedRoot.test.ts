import { describe, expect, it } from 'vitest';

import { destroyScope } from '../index';
import { styleManagerFactory } from '../index';

const flushAnimationFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function emitted(css: string, compressed: boolean): Promise<string> {
  const scopeId = `comment-root-${compressed ? 'raw' : 'compressed'}`;
  styleManagerFactory(scopeId)('sheet', css, compressed);
  await flushAnimationFrame();
  const text =
    document.head.querySelector(`style.${scopeId}`)?.textContent ?? '';
  destroyScope(scopeId);
  return text;
}

describe('css-scoping — a comment between the colon and the pseudo name', () => {
  it.each([
    [':/*c*/root', ':root'],
    [':/*c*/host', ':host'],
  ])(
    '%s is the same global token sequence as %s in both input modes (self-hunt style-utils 7, 8)',
    async (commented, plain) => {
      const sheet = (selector: string) =>
        `${selector}{color:red}.a,${selector}{color:blue}`;
      expect(await emitted(sheet(commented), false)).toBe(
        await emitted(sheet(plain), false),
      );
      expect(
        (await emitted(sheet(commented), true)).split(commented).join(plain),
      ).toBe(await emitted(sheet(plain), true));
      expect(await emitted(sheet(plain), true)).toBe(
        `${plain}{color:red}.comment-root-raw .a,${plain}{color:blue}`,
      );
    },
  );
});
