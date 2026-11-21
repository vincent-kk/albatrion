import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';
import { captureFrames, droppedAtEof, mulberry32, significantTokens, topLevelRules } from './cssSyntax';
import { sheet } from './generate';

afterEach(() => vi.unstubAllGlobals());

const injectShadow = (pieces: string[], skip: boolean) => {
  const frames = captureFrames();
  vi.stubGlobal('requestAnimationFrame', frames.request);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const add = styleManagerFactory('fz', { shadowRoot });
  pieces.forEach((p, i) => add('s' + i, p, skip));
  frames.flush();
  const text = shadowRoot.querySelector('style')?.textContent ?? '';
  destroyScope('fz', { shadowRoot });
  return text;
};

it('explore: shadow join of truncated fragments against separate sheets', () => {
  const random = mulberry32(0x5eed);
  const failures = new Map<string, string>();
  let checked = 0, qualified = 0;
  for (let n = 0; n < 3000; n++) {
    let first = sheet(random);
    if (random() < 0.8) first = first.slice(0, 1 + Math.floor(random() * first.length));
    const second = sheet(random);
    if (!first.trim()) continue;
    const skip = random() < 0.5;
    const text = injectShadow([first, second], skip);
    const stored = (css: string) => (skip ? css : compressCss(css));
    const expected = [...topLevelRules(stored(first)), ...topLevelRules(stored(second))];
    const actual = topLevelRules(text);
    checked++;
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      if (droppedAtEof.has(stored(first))) { qualified++; continue; }
      const tail = first.slice(-12);
      const key = tail.replace(/[a-z0-9]/gi, 'x');
      if (!failures.has(key) && failures.size < 40)
        failures.set(key, JSON.stringify({ skip, first, second, text, expected, actual }));
    }
  }
  writeFileSync(join(tmpdir(), 'r5srm-join.txt'), `checked ${checked}, qualified-prelude failures ${qualified}, other failing shapes ${failures.size}\n` + [...failures.values()].join('\n'));
});

it('explore: compressCss token preservation and flat/main path agreement', () => {
  const random = mulberry32(0xc0ffee);
  const failures: string[] = [];
  for (let n = 0; n < 4000; n++) {
    let css = sheet(random);
    if (random() < 0.3) css = css.slice(0, 1 + Math.floor(random() * css.length));
    const out = compressCss(css);
    const a = significantTokens(css), b = significantTokens(out);
    if (JSON.stringify(a) !== JSON.stringify(b) && failures.length < 30)
      failures.push(JSON.stringify({ css, out, firstDiff: a.findIndex((x, i) => x !== b[i]), a: a.slice(0, 60), b: b.slice(0, 60) }));
  }
  writeFileSync(join(tmpdir(), 'r5srm-compress.txt'), `failing ${failures.length}\n` + failures.join('\n'));
});
