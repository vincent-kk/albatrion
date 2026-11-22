import { expect, it, vi } from 'vitest';

import { StyleManager } from '../StyleManager';

it.each([
  ['is unavailable', { value: undefined }],
  [
    'throws on access',
    {
      get() {
        throw new Error('Constructor getter failed');
      },
    },
  ],
  [
    'throws on prototype inspection',
    {
      value: new Proxy(class {}, {
        get() {
          throw new Error('Prototype inspection failed');
        },
      }),
    },
  ],
] as const)(
  'selects the style-element fallback when the owner constructor %s',
  (_, descriptor) => {
    vi.useFakeTimers();
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    Object.defineProperty(iframe.contentWindow!, 'CSSStyleSheet', {
      ...descriptor,
      configurable: true,
    });
    const owner = iframe.contentDocument!;
    const host = owner.body.appendChild(owner.createElement('div'));
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const parentReplaceSync = vi.fn();
    vi.stubGlobal(
      'CSSStyleSheet',
      class {
        replaceSync() {
          parentReplaceSync();
        }
      },
    );
    Object.defineProperty(shadowRoot, 'adoptedStyleSheets', {
      value: [],
      writable: true,
    });

    const manager = StyleManager.get('iframe-fallback', { shadowRoot });
    try {
      manager.add('one', '.a{color:red}');
      vi.runAllTimers();
      expect(parentReplaceSync).not.toHaveBeenCalled();
      expect(shadowRoot.querySelector('style')?.textContent).toBe(
        '.a{color:red}',
      );
    } finally {
      manager.destroy();
      iframe.remove();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  },
);
