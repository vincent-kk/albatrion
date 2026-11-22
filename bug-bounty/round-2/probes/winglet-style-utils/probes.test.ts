import postcss from 'postcss';
import { afterEach, describe, expect, it } from 'vitest';

import { compressCss, destroyScope, styleManagerFactory } from '@/style-utils/index';

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 50));

const firstAtRuleParams = (css: string) => {
  let params: string | undefined;
  postcss.parse(css).walkAtRules((atRule) => {
    if (params === undefined) params = atRule.params;
  });
  return params;
};

describe('compressCss keeps the space between an identifier and a parenthesis', () => {
  // DETAIL.md: whitespace between an identifier character and an opening parenthesis is kept
  it.each([
    ['underscore', '@container sidebar_main (min-width: 400px) { .a { color: red } }', 'sidebar_main (min-width:400px)'],
    ['trailing digit', '@container card2 (min-width: 400px) { .a { color: red } }', 'card2 (min-width:400px)'],
    ['non-ASCII name', '@container 카드 (min-width: 400px) { .a { color: red } }', '카드 (min-width:400px)'],
  ])('container name with %s', (_label, input, expectedParams) => {
    expect(firstAtRuleParams(compressCss(input))).toBe(expectedParams);
  });

  it('control: an ASCII-letter container name keeps the space', () => {
    expect(firstAtRuleParams(compressCss('@container card (min-width: 400px) { .a { color: red } }'))).toBe(
      'card (min-width:400px)',
    );
  });
});

describe('compressCss corpus differential against postcss', () => {
  it('keeps the rule tree of a real-world corpus apart from whitespace outside strings', () => {
    const corpus = [
      '@supports (display: grid) and (not (display: inline-grid)) { .a { display: grid } }',
      "@font-face { font-family: 'My Font'; src: url('a b.woff2') format('woff2'), url(a.woff) format('woff'); }",
      '@media screen { @media (min-width: 10px) { .a { color: red } } }',
      '.a { color: red !important; --gap: 1px 2px; margin: 0 auto; }',
      '.a > .b + .c ~ .d { transform: translate(1px) rotate(2deg); }',
      '@media (400px <= width <= 700px) { .a { color: blue } }',
      '.a:nth-child(2n - 1) { color: red }',
      '.a { & .b { color: red } &:hover { color: blue } }',
    ];
    const signature = (css: string) => {
      const out: string[] = [];
      postcss.parse(css).walk((node) => {
        if (node.type === 'rule') out.push('rule ' + node.selector.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1'));
        else if (node.type === 'atrule') out.push('@' + node.name + ' ' + node.params.replace(/\s+/g, '').toLowerCase());
        else if (node.type === 'decl')
          out.push('decl ' + node.prop + '=' + node.value.replace(/\s+/g, ' ').replace(/\s*([(),/])\s*/g, '$1') + (node.important ? '!' : ''));
      });
      return out.join('\n');
    };
    const failures = corpus.filter((css) => signature(css) !== signature(compressCss(css)));
    expect(failures).toEqual([]);
  });
});

describe('StyleManager lifecycle', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('destroyScope removes the styles of a shadow-root scope, as the README Shadow DOM example relies on', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const addStyle = styleManagerFactory('bounty-shadow', { shadowRoot });
    addStyle('host-styles', ':host { display: block; }');
    await nextFrame();
    const before = shadowRoot.querySelectorAll('style').length + (shadowRoot.adoptedStyleSheets?.length ?? 0);
    expect(before).toBe(1);
    destroyScope('bounty-shadow');
    await nextFrame();
    const after = shadowRoot.querySelectorAll('style').length + (shadowRoot.adoptedStyleSheets?.length ?? 0);
    expect(after).toBe(0);
  });

  it('an injector created before destroyScope does not resurrect an unregistered manager that destroyScope cannot reach', async () => {
    const addStyle = styleManagerFactory('bounty-zombie');
    addStyle('one', '.a { color: red; }');
    await nextFrame();
    destroyScope('bounty-zombie');
    await nextFrame();
    addStyle('two', '.b { color: blue; }');
    await nextFrame();
    destroyScope('bounty-zombie');
    await nextFrame();
    expect(document.querySelectorAll('style.bounty-zombie').length).toBe(0);
  });

  it('removing a style while its flush is pending leaves no rules behind', async () => {
    const addStyle = styleManagerFactory('bounty-pending');
    const remove = addStyle('x', '.a { color: red; }');
    remove();
    await nextFrame();
    const text = Array.from(document.querySelectorAll('style.bounty-pending'))
      .map((element) => element.textContent)
      .join('');
    expect(text).toBe('');
    destroyScope('bounty-pending');
  });
});
