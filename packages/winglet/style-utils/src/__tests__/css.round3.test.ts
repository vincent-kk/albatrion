import postcss, { type Rule } from 'postcss';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '../index';

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
});

describe('styleManagerFactory: a statement at-rule that ends one injected style', () => {
  it('control: with its semicolon, the next style keeps its rule', () => {
    const add = scoped('r3stmtok');
    add('layers', '@layer reset, base;');
    add('button', '.btn { color: red; }');
    flush();
    expect(rulesOf(injected('r3stmtok'))).toEqual([
      '.r3stmtok .btn{color:red}',
    ]);
  });

  it('an @layer statement without its semicolon does not swallow the next style', () => {
    const add = scoped('r3stmt');
    add('layers', '@layer reset, base');
    add('button', '.btn { color: red; }');
    flush();
    const root = postcss.parse(injected('r3stmt'));
    const layer = root.first;
    if (layer?.type !== 'atrule') throw new Error('Expected a layer statement');
    expect({
      type: layer.type,
      params: layer.params,
      nodes: layer.nodes,
    }).toEqual({
      type: 'atrule',
      params: 'reset,base',
      nodes: undefined,
    });
    expect(rulesOf(injected('r3stmt'))).toEqual(['.r3stmt .btn{color:red}']);
  });
});

describe('styleManagerFactory: spelling variants of :root', () => {
  it('treats ":root /* light theme */" like :root', () => {
    const add = scoped('r3rootcomment');
    add('vars', ':root /* light theme */ { --bg: #fff; }');
    flush();
    expect(rulesOf(injected('r3rootcomment'))).toEqual([
      ':root{--bg:#fff}',
    ]);
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

it('round-3 style-utils 2: separate style identifiers match one sheet with statement boundaries', () => {
  for (const statement of [
    '@layer reset, base',
    '@import url("x.css")',
    '@namespace svg url(http://x)',
  ]) {
    for (const shadow of [false, true]) {
      const shadowRoot = shadow
        ? document.createElement('div').attachShadow({ mode: 'open' })
        : undefined;
      const config = shadowRoot ? { shadowRoot } : undefined;
      const add = styleManagerFactory('r3composition', config);
      add('first', statement);
      add('second', '.a { color: red; }');
      flush();
      const read = () =>
        shadowRoot
          ? (shadowRoot.querySelector('style')?.textContent ?? '')
          : injected('r3composition');
      const separate = rulesOf(read());
      destroyScope('r3composition', config);
      styleManagerFactory('r3composition', config)(
        'whole',
        statement + '; .a { color: red; }',
      );
      flush();
      expect(separate).toEqual(rulesOf(read()));
      destroyScope('r3composition', config);
    }
  }
});
