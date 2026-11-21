import { afterEach, expect, it, vi } from 'vitest';

import { destroyScope, styleManagerFactory } from '../index';

afterEach(() => {
  vi.unstubAllGlobals();
  document
    .querySelectorAll('[data-r6-fixture]')
    .forEach((node) => node.remove());
});

it('a same-document shadow root receives and releases its constructable sheet', () => {
  const host = document.createElement('div');
  host.dataset.r6Fixture = '';
  document.body.append(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  try {
    styleManagerFactory('r6-same-document', { shadowRoot })(
      'one',
      '.a{color:red}',
    );
    frames.shift()!(0);
    expect(shadowRoot.adoptedStyleSheets).toHaveLength(1);
  } finally {
    destroyScope('r6-same-document', { shadowRoot });
  }
  expect(shadowRoot.adoptedStyleSheets).toHaveLength(0);
});

it.each(['owner', 'foreign'] as const)(
  'uses the correct stylesheet path for the %s constructor in an iframe',
  (constructorRealm) => {
    const iframe = document.createElement('iframe');
    iframe.dataset.r6Fixture = '';
    document.body.append(iframe);
    const other = iframe.contentDocument!;
    const host = other.createElement('div');
    other.body.append(host);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    if (constructorRealm === 'foreign') {
      expect(() => {
        shadowRoot.adoptedStyleSheets = [new CSSStyleSheet()];
      }).toThrow();
      Object.defineProperty(iframe.contentWindow!, 'CSSStyleSheet', {
        configurable: true,
        value: CSSStyleSheet,
      });
    }
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const add = styleManagerFactory('r6-cross-document', { shadowRoot });
    try {
      add('first', '.a{color:red}');
      expect(() => frames.shift()!(0)).not.toThrow();
      add('second', '.b{color:blue}');
      frames.shift()!(0);
      if (constructorRealm === 'foreign') {
        expect(shadowRoot.adoptedStyleSheets).toHaveLength(0);
        expect(shadowRoot.querySelector('style')?.textContent).toBe(
          '.a{color:red}\n.b{color:blue}',
        );
      } else {
        expect(shadowRoot.adoptedStyleSheets).toHaveLength(1);
        expect(
          Array.from(
            shadowRoot.adoptedStyleSheets[0].cssRules,
            (rule) => rule.cssText,
          ),
        ).toEqual(['.a { color: red; }', '.b { color: blue; }']);
      }
    } finally {
      destroyScope('r6-cross-document', { shadowRoot });
    }
  },
);
