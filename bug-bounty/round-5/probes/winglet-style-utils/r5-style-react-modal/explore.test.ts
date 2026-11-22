import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, it, vi } from 'vitest';

const log: string[] = [];
const out = (...a: unknown[]) => { log.push(a.map(String).join(' ')); writeFileSync(join(tmpdir(), 'r5srm-explore.txt'), log.join('\n')); };

import { compressCss, destroyScope, styleManagerFactory } from '../../index';
import { captureFrames, significantTokens, topLevelRules } from './cssSyntax';

afterEach(() => vi.unstubAllGlobals());

const inject = (pieces: string[], shadow: boolean, skip: boolean) => {
  const frames = captureFrames();
  vi.stubGlobal('requestAnimationFrame', frames.request);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const scope = 'x' + Math.random().toString(36).slice(2, 8);
  const add = styleManagerFactory(scope, shadow ? { shadowRoot } : undefined);
  pieces.forEach((p, i) => add('s' + i, p, skip));
  frames.flush();
  const el = shadow
    ? shadowRoot.querySelector('style')
    : document.head.querySelector('style.' + scope);
  const text = el?.textContent ?? '';
  destroyScope(scope, shadow ? { shadowRoot } : undefined);
  return text;
};

it('explore: nested statement join texts', () => {
  const layers = '@layer theme {\n  @layer light, dark;\n}\n.card { color: red; }';
  for (const shadow of [true, false]) {
    const text = inject([layers, '.btn { color: blue; }'], shadow, false);
    out('LAYERS', shadow ? 'shadow' : 'document', JSON.stringify({ text, rules: topLevelRules(text) }));
  }
});

it('explore', () => {
  const firsts = [
    '.a{color:red};',
    '.a { color: red; };',
    '.a{color:red}}',
    '.a{color:red}\n.b',
    'color: red;',
    '.a:is(.b',
    '.a{color:red}\n.c:is(.d',
  ];
  for (const first of firsts)
    for (const skip of [false, true]) {
      const text = inject([first, '.b{color:blue}'], true, skip);
      out(JSON.stringify({ first, skip, text, rules: topLevelRules(text) }));
    }
  for (const first of firsts) {
    const text = inject([first, '.b{color:blue}'], false, false);
    out('DOC', JSON.stringify({ first, text, rules: topLevelRules(text) }));
  }
  for (const css of ['--x: 1px + 2px', '.a{--x: 1px + 2px; width: calc(var(--x))}', '.a{--x: 1px + 2px; content:"a"}', '.a{--x:1 + .5}', '.a{--x: a + -2}']) {
    const result = compressCss(css);
    out('CMP', JSON.stringify({ css, result, same: JSON.stringify(significantTokens(css)) === JSON.stringify(significantTokens(result)) }));
  }
});
