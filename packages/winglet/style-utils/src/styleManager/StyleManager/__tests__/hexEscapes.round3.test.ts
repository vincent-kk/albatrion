import { expect, it } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';

it('round-3 style-utils 1: hex newline terminators remain inside selector strings', () => {
  for (const quote of ["'", '"'])
    for (const newline of ['\n', '\r', '\r\n', '\f']) {
      const token = quote + '\\41' + newline + '{;}  text' + quote;
      const css = `[data-x=${token}] { color: red; } .tail { color: blue; }`;
      expect(new RuleScoper(css, '.scope').scopeSheet().replace(token, '"control"')).toBe(new RuleScoper(css.replace(token, '"control"'), '.scope').scopeSheet());
    }
});

it('round-3 style-utils 5: escaped and comment-separated global pseudo tokens agree with their literal spellings', () => {
  for (const [selector, plain] of [[String.raw`:/**/root`, ':root'], [String.raw`:\72 oot`, ':root'], [String.raw`:r\6fot`, ':root'], [String.raw`:\000052oot`, ':root'], [String.raw`:/**/host`, ':host'], [String.raw`:h\6fst`, ':host']]) {
    const css = `${selector} { color: red; } .tail { color: blue; }`;
    expect(new RuleScoper(css, '.scope').scopeSheet().replace(selector, plain)).toBe(new RuleScoper(css.replace(selector, plain), '.scope').scopeSheet());
  }
});
