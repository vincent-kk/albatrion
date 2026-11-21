import { afterEach, expect, it, vi } from 'vitest';
import { compressCss } from '../../index';
import { readStylesheet } from '../../__tests__/helpers/cssSyntax/readStylesheet';
import { readSignificantTokens } from '../../__tests__/helpers/cssSyntax/readSignificantTokens';
import { createStyleHarness } from '../../__tests__/helpers/createStyleHarness';

afterEach(() => vi.unstubAllGlobals());

it('E1 compression agrees with Syntax on varied declaration and nested-rule contexts', () => {
  const bodies = [
    '--x: a + 2px; width:calc(var(--x))',
    '--x: ; --y:var(--x, )',
    'width:calc(1px + 2px); content:";)}"',
    'color: red; & :hover { color : blue }',
    'color: red; p :hover { color : blue }',
    '@media (width > 0px) { & .b { color : blue } }',
    '@supports (color: red) { & .b { color : blue } }',
    '--x: { a : b ; c : d }; color:red',
    'background: url(data:image/svg+xml;base64,abc); color:red',
    'font: 12px / 1.2 sans-serif; opacity: .5',
    '--x: /**/ ; --y: /**/; color:red',
    '--x: fn( 1 , 2 ); --y: [ a ; b ]',
  ];
  const selectors = ['.a', '.a :hover', '.a > .b', ':is(.a, .b)', '[x ~= "a"]', 'a |div', ':nth-child(2n + 1)'];
  const wrappers = [(s: string) => s, (s: string) => '@media (width > 0px) {' + s + '}', (s: string) => '@layer theme {' + s + '}'];
  const failures: unknown[] = [];
  for (const body of bodies) for (const selector of selectors) for (const wrap of wrappers) {
    const css = wrap(`${selector} { ${body}; }`);
    const output = compressCss(css);
    if (JSON.stringify(readSignificantTokens(output)) !== JSON.stringify(readSignificantTokens(css))) failures.push({ css, output });
  }
  expect(failures).toEqual([]);
});

it('E2 shadow joins preserve isolated Syntax trees for truncated nested contexts', () => {
  const corpus = [
    '@media(x){@supports(y){@layer a,b',
    '.a{--x:fn([a {b:c',
    '.a{--x:"abc\\',
    '@supports selector(:is(.a, .b',
    '@layer a{@layer b,c}.a{color:red}',
    '@unknown x{.a{color:red}',
    '@media(x){.a{color:red}} .dangling',
    '.a{color:red}/* open',
    '<!-- .a{color:red} -->',
  ];
  const failures: unknown[] = [];
  for (const css of corpus) for (const raw of [false, true]) {
    const harness = createStyleHarness(true, 'r6join');
    try {
      harness.add('one', css, raw);
      harness.add('two', '.next{color:blue}', raw);
      const output = harness.flush();
      const expected = [...readStylesheet(raw ? css : compressCss(css)), ...readStylesheet('.next{color:blue}')];
      if (JSON.stringify(readStylesheet(output)) !== JSON.stringify(expected)) failures.push({ css, raw, output, expected, actual: readStylesheet(output) });
    } finally { harness.destroy(); }
  }
  expect(failures).toEqual([]);
});
