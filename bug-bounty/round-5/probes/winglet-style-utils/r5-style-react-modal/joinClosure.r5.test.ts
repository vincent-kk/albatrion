/**
 * Hunter r5-style-react-modal: the join of several style identifiers.
 * The top-level rules are read with the CSS Syntax Level 3 reader in `cssSyntax.ts`.
 * Public API: `styleManagerFactory` and `destroyScope` from the package source entry.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { destroyScope, styleManagerFactory } from '../../index';
import { captureFrames, topLevelRules } from './cssSyntax';

afterEach(() => vi.unstubAllGlobals());

let counter = 0;
/** Inject each piece as its own style identifier and return the written text. */
const inject = (
  pieces: string[],
  mode: 'shadow' | 'document',
  skipCompression = false,
): { text: string; scope: string } => {
  const frames = captureFrames();
  vi.stubGlobal('requestAnimationFrame', frames.request);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const scope = `r5join${counter++}`;
  const config = mode === 'shadow' ? { shadowRoot } : undefined;
  const add = styleManagerFactory(scope, config);
  pieces.forEach((piece, index) => add(`s${index}`, piece, skipCompression));
  frames.flush();
  const element =
    mode === 'shadow'
      ? shadowRoot.querySelector('style')
      : document.head.querySelector(`style.${scope}`);
  const text = element?.textContent ?? '';
  destroyScope(scope, config);
  return { text, scope };
};

/** The serialized prelude of a top-level `.btn` rule, with or without a scope prefix. */
const BTN = 'delim-token:.|ident-token:btn => {ident-token:color|colon-token|ident-token:blue}';
const SCOPED_BTN = (scope: string) =>
  `delim-token:.|ident-token:${scope}| |delim-token:.|ident-token:btn => {ident-token:color|colon-token|ident-token:blue}`;

const LAYERS = '@layer theme {\n  @layer light, dark;\n}\n.card { color: red; }';
const NEXT = '.btn { color: blue; }';

describe('a nested statement at-rule that ends its block', () => {
  it('J1 shadow root, default compression: the next identifier keeps its first rule', () => {
    const { text } = inject([LAYERS, NEXT], 'shadow');
    expect({ text, rules: topLevelRules(text) }).toEqual({
      text: expect.any(String),
      rules: expect.arrayContaining([BTN]),
    });
  });

  it('J2 document, default compression: the next identifier keeps its first rule', () => {
    const { text, scope } = inject([LAYERS, NEXT], 'document');
    expect({ text, rules: topLevelRules(text) }).toEqual({
      text: expect.any(String),
      rules: expect.arrayContaining([SCOPED_BTN(scope)]),
    });
  });

  it('J3 shadow root, compression skipped, nested statement written without its optional semicolon', () => {
    const { text } = inject(
      ['@layer theme { @layer light, dark }\n.card { color: red }', NEXT],
      'shadow',
      true,
    );
    expect({ text, rules: topLevelRules(text) }).toEqual({
      text: expect.any(String),
      rules: expect.arrayContaining([BTN]),
    });
  });

  it('J0 control: the same identifiers keep the rule when a block rule follows the nested statement', () => {
    const { text } = inject(
      ['@layer theme {\n  @layer light, dark;\n  @layer light { .x { color: red } }\n}\n.card { color: red; }', NEXT],
      'shadow',
    );
    expect(topLevelRules(text)).toEqual(expect.arrayContaining([BTN]));
  });
});

describe('a shadow root identifier that ends inside a top-level rule prelude', () => {
  it('J4 a stray semicolon after the last rule (`};`) does not swallow the next identifier', () => {
    const { text } = inject(['.a { color: red; };', NEXT], 'shadow');
    expect({ text, rules: topLevelRules(text) }).toEqual({
      text: expect.any(String),
      rules: expect.arrayContaining([BTN]),
    });
  });

  it('J5 an extra closing brace does not swallow the next identifier', () => {
    const { text } = inject(['.a { color: red; }}', NEXT], 'shadow');
    expect(topLevelRules(text)).toEqual(expect.arrayContaining([BTN]));
  });

  it('J6 an unfinished selector is not turned into a valid descendant selector for the next identifier', () => {
    const { text } = inject(['.a { color: red; }\n.card:is(.open', NEXT], 'shadow');
    expect({ text, rules: topLevelRules(text) }).toEqual({
      text: expect.any(String),
      rules: expect.arrayContaining([BTN]),
    });
  });

  it('J0b control: in document mode the same stray semicolon keeps the next rule', () => {
    const { text, scope } = inject(['.a { color: red; };', NEXT], 'document');
    expect(topLevelRules(text)).toEqual(expect.arrayContaining([SCOPED_BTN(scope)]));
  });

  it('J0c control: each identifier injected alone keeps its rules', () => {
    for (const first of ['.a { color: red; };', '.a { color: red; }}', LAYERS]) {
      const { text } = inject([NEXT], 'shadow');
      expect(topLevelRules(text)).toEqual([BTN]);
      expect(topLevelRules(inject([first], 'shadow').text).length).toBeGreaterThan(0);
    }
  });
});
