import { expect, it } from 'vitest';

import { RuleScoper } from '../utils/RuleScoper';

it('round-3 style-utils 5: root and host spellings receive the same scope treatment', () => {
  const scope = (selector: string) => new RuleScoper(selector + '{x:y}', '.s').scopeSheet();
  for (const name of ['root', 'host']) for (const selector of [':' + name.toUpperCase(), ':' + name + '/**/', '/**/:' + name, ':' + name + ' /*x*/']) {
    expect(scope(selector).replaceAll(/\/\*.*?\*\//g, '').replaceAll(/\s/g, '').toLowerCase()).toBe(scope(':' + name));
  }
  expect(scope(':root .child')).toBe('.s :root .child{x:y}');
});

it('round-3 style-utils 6: escaped whitespace stays a selector token across list boundaries', () => {
  for (const whitespace of [' ', '\t', '\n', '\r', '\f']) {
    const selector = '.a\\' + whitespace;
    const scoped = new RuleScoper(selector + ',.b{x:y}', '.s').scopeSheet();
    expect(scoped.replace(selector, '.a')).toBe(new RuleScoper('.a,.b{x:y}', '.s').scopeSheet());
  }
});

it('round-3 style-utils 4: bad strings recover equally at each CSS newline spelling', () => {
  for (const newline of ['\n', '\r', '\r\n', '\f']) {
    const result = new RuleScoper('.a{content:"bad' + newline + '} .b{x:y}', '.s').scopeSheet();
    expect(result.slice(result.indexOf('.s .b'))).toBe(new RuleScoper('.b{x:y}', '.s').scopeSheet());
    expect(result).toContain('.s .b');
  }
  expect(new RuleScoper('.a{content:"escaped\\\r\n} string"}.b{x:y}', '.s').scopeSheet()).toContain('.s .b');
});
