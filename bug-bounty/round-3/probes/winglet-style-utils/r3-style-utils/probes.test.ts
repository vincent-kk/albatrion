import postcss, { type AtRule, type Rule } from 'postcss';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../../index';

const flush = () => vi.advanceTimersByTime(20);
const injected = (scope: string): string =>
  Array.from(document.querySelectorAll(`style.${scope}`))
    .map((element) => element.textContent ?? '')
    .join('\n');

/** Top-level and nested style rules as `selector{prop:value;...}`, in document order. */
const rulesOf = (css: string): string[] => {
  const rules: string[] = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    const declarations: string[] = [];
    rule.each((node) => {
      if (node.type === 'decl') declarations.push(`${node.prop}:${node.value}`);
    });
    rules.push(`${rule.selector}{${declarations.join(';')}}`);
  });
  return rules;
};

const declarationValues = (css: string, prop: string): string[] => {
  const values: string[] = [];
  postcss.parse(css).walkDecls(prop, (decl) => values.push(decl.value));
  return values;
};

const scopes: string[] = [];
const scoped = (scope: string) => {
  scopes.push(scope);
  return styleManagerFactory(scope);
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  scopes.splice(0).forEach((scope) => destroyScope(scope));
  vi.useRealTimers();
  document.head.innerHTML = '';
});

describe('compressCss: a backslash-escaped quote outside a string', () => {
  // Tailwind arbitrary values escape quotes in class names: content-['x'] -> .content-\[\'x\'\]
  it('control: without an escaped quote the string value and the next rule survive', () => {
    const css = `.content-x::after { content: '/*'; } .b { color: red; }`;
    expect(rulesOf(compressCss(css))).toEqual(rulesOf(css));
  });

  it('keeps the string value after a selector with an escaped quote', () => {
    const css = String.raw`.content-\[\'a\'\]::after { content: 'a  b'; }`;
    expect(declarationValues(compressCss(css), 'content')).toEqual([`'a  b'`]);
  });

  it('keeps the rules after a selector with an escaped quote and a "/*" string', () => {
    const css = String.raw`.content-\[\'x\'\]::after { content: '/*'; } .b { color: red; }`;
    expect(compressCss(css)).toBe(
      String.raw`.content-\[\'x\'\]::after{content:'/*'}.b{color:red}`,
    );
  });

  it('keeps every rule of a Tailwind-like sheet with arbitrary content values', () => {
    const css = [
      String.raw`.after\:content-\[\'\'\]::after { --tw-content: ''; content: var(--tw-content); }`,
      String.raw`.before\:content-\[\'\/\*\'\]::before { --tw-content: '/*'; content: var(--tw-content); }`,
      `.p-4 { padding: 1rem; }`,
    ].join('\n');
    expect(compressCss(css)).toContain('.p-4{padding:1rem}');
  });

  it('styleManagerFactory keeps the rules after a selector with an escaped quote', () => {
    const add = scoped('r3esc');
    add(
      'tw',
      String.raw`.content-\[\'x\'\]::after { content: '/*'; } .b { color: red; }`,
    );
    flush();
    expect(injected('r3esc')).toContain('.r3esc .b{color:red}');
  });

  it('keeps the descendant combinator when an escaped quote precedes a later string', () => {
    const css = String.raw`.a :is(.content-\[\'x\'\]) { color: red; } .b { content: 'y;'; }`;
    expect(compressCss(css)).toBe(
      String.raw`.a :is(.content-\[\'x\'\]){color:red}.b{content:'y;'}`,
    );
  });
});

describe('styleManagerFactory: a statement at-rule that ends one injected style', () => {
  it('control: with its semicolon, the next style keeps its rule', () => {
    const add = scoped('r3stmtok');
    add('layers', '@layer reset, base;');
    add('button', '.btn { color: red; }');
    flush();
    expect(rulesOf(injected('r3stmtok'))).toEqual(['.r3stmtok .btn{color:red}']);
  });

  it('each snippet parses on its own, so the one-shot reading has the rule', () => {
    expect(postcss.parse('@layer reset, base').first?.type).toBe('atrule');
    expect(rulesOf('.btn { color: red; }')).toEqual(['.btn{color:red}']);
  });

  it('an @layer statement without its semicolon does not swallow the next style', () => {
    const add = scoped('r3stmt');
    add('layers', '@layer reset, base');
    add('button', '.btn { color: red; }');
    flush();
    const root = postcss.parse(injected('r3stmt'));
    const layer = root.first as AtRule;
    expect({ type: layer.type, params: layer.params, nodes: layer.nodes }).toEqual({
      type: 'atrule',
      params: 'reset,base',
      nodes: undefined,
    });
    expect(rulesOf(injected('r3stmt'))).toEqual(['.r3stmt .btn{color:red}']);
  });

  it('in a shadow root, an @layer statement without its semicolon does not swallow the next style', () => {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const add = styleManagerFactory('r3stmtshadow', { shadowRoot });
    add('layers', '@layer reset, base');
    add('button', '.btn { color: red; }');
    flush();
    const text = Array.from(shadowRoot.querySelectorAll('style'))
      .map((element) => element.textContent ?? '')
      .join('\n');
    destroyScope('r3stmtshadow', { shadowRoot });
    expect(rulesOf(text)).toEqual(['.btn{color:red}']);
  });

  it('an @import statement without its semicolon does not swallow the next style', () => {
    const add = scoped('r3import');
    add('font', `@import url("https://example.com/font.css")`);
    add('button', '.btn { color: red; }');
    flush();
    expect(rulesOf(injected('r3import'))).toEqual(['.r3import .btn{color:red}']);
  });
});

describe('styleManagerFactory: spelling variants of :root', () => {
  it('control: :root keeps no prefix', () => {
    const add = scoped('r3root');
    add('vars', ':root { --bg: #fff; }');
    flush();
    expect(rulesOf(injected('r3root'))).toEqual([':root{--bg:#fff}']);
  });

  it('treats :ROOT like :root (pseudo-class names are ASCII case-insensitive)', () => {
    const add = scoped('r3rootcase');
    add('vars', ':ROOT { --bg: #fff; }');
    flush();
    expect(rulesOf(injected('r3rootcase'))).toEqual([':ROOT{--bg:#fff}']);
  });

  it('treats ":root /* light theme */" like :root', () => {
    const add = scoped('r3rootcomment');
    add('vars', ':root /* light theme */ { --bg: #fff; }');
    flush();
    expect(rulesOf(injected('r3rootcomment'))[0]).not.toMatch(/^\.r3rootcomment /);
  });
});

describe('styleManagerFactory: an empty member of a selector list', () => {
  // Selectors 4: a selector list with an empty member is invalid, so the browser drops the rule.
  it('does not turn a commented-out last selector into the scope container itself', () => {
    const add = scoped('r3emptysel');
    add('x', '.btn-primary,\n/* .btn-legacy */\n{ padding: 8px; }');
    flush();
    expect(injected('r3emptysel')).not.toMatch(/,\.r3emptysel\s*\{/);
  });

  it('does not turn a trailing comma into a rule for the scope container', () => {
    const add = scoped('r3trailcomma');
    add('x', '.a, { color: red; }');
    flush();
    expect(injected('r3trailcomma')).not.toMatch(/,\.r3trailcomma\{/);
  });
});

describe('styleManagerFactory: a byte order mark before a rule', () => {
  // Sass compressed output starts with U+FEFF when the sheet has non-ASCII text;
  // concatenated files carry it in the middle.
  it('control: a BOM before a style rule is dropped and the rule is scoped', () => {
    const add = scoped('r3bomrule');
    add('x', '﻿.a { color: red; }');
    flush();
    expect(injected('r3bomrule')).toBe('.r3bomrule .a{color:red}');
  });

  it('control: without a BOM the @media rule is scoped', () => {
    const add = scoped('r3nobom');
    add('x', '@media (min-width: 1px) { .a { color: red; } }');
    flush();
    expect(injected('r3nobom')).toBe('@media (min-width:1px){.r3nobom .a{color:red}}');
  });

  it('scopes an @media rule that follows a BOM like the same rule without it', () => {
    const add = scoped('r3bommedia');
    add('x', '﻿@media (min-width: 1px) { .a { color: red; } }');
    flush();
    expect(injected('r3bommedia')).toBe(
      '@media (min-width:1px){.r3bommedia .a{color:red}}',
    );
  });

  it('keeps a @font-face that follows a BOM in the middle of a concatenated sheet', () => {
    const add = scoped('r3bomfont');
    add(
      'x',
      '.a { color: red; }\n﻿@font-face { font-family: "Nanum"; src: url("n.woff2"); }',
    );
    flush();
    expect(injected('r3bomfont')).toBe(
      '.r3bomfont .a{color:red}@font-face{font-family:"Nanum";src:url("n.woff2")}',
    );
  });
});

describe('styleManagerFactory: an unterminated string ends at the newline (CSS Syntax 4.3.5)', () => {
  it('keeps the rule after a declaration whose string lost its closing quote', () => {
    const add = scoped('r3badstr');
    add('x', '.a { content: "oops;\n}\n.b { color: red; }');
    flush();
    // A browser reads `"oops;` as a bad string, drops that declaration, closes `.a` at `}`
    // and applies `.b`.
    expect(injected('r3badstr')).toContain('.r3badstr .b');
  });
});

describe('escaped whitespace at the end of a selector', () => {
  it('compressCss keeps an escaped space that ends a selector', () => {
    const css = '.a\\  { color: red; } .b { color: blue; }';
    expect(compressCss(css)).toBe('.a\\ {color:red}.b{color:blue}');
  });

  it('styleManagerFactory keeps an escaped space that ends a selector', () => {
    const add = scoped('r3escspace');
    add('x', '.a\\ , .b { color: red; } .c { color: blue; }', true);
    flush();
    expect(rulesOf(injected('r3escspace'))).toEqual([
      '.r3escspace .a\\ ,.r3escspace .b{color:red}',
      '.r3escspace .c{color:blue}',
    ]);
  });
});

describe('compressCss: a comment that separates two tokens', () => {
  it('does not glue two dimensions into one token', () => {
    // CSS Syntax: a comment ends the token before it, so 1px/**/2px is two dimensions.
    expect(compressCss('.a { margin: 1px/**/2px; }')).not.toContain('1px2px');
  });
});
