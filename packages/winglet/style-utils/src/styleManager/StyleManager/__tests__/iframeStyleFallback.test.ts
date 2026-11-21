import { expect, it, vi } from 'vitest';

import { StyleManager } from '../StyleManager';

it('selects the style-element fallback when only the parent realm supports constructable sheets', () => {
  vi.useFakeTimers();
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  Object.defineProperty(iframe.contentWindow!, 'CSSStyleSheet', {
    value: undefined,
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
});

it('applies, updates, and removes a fallback style when the iframe constructor lookup is blocked', () => {
  vi.useFakeTimers();
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const owner = iframe.contentDocument!;
  const host = owner.body.appendChild(owner.createElement('div'));
  const shadowRoot = host.attachShadow({ mode: 'open' });
  Object.defineProperty(iframe.contentWindow!, 'CSSStyleSheet', {
    configurable: true,
    get() {
      throw new DOMException('Stylesheet access is blocked', 'SecurityError');
    },
  });

  const manager = StyleManager.get('iframe-blocked-lookup', { shadowRoot });
  try {
    manager.add('first', '.a{color:red}');
    vi.runAllTimers();
    const style = shadowRoot.querySelector('style');
    expect(style?.textContent).toBe('.a{color:red}');

    manager.add('second', '.b{color:blue}');
    vi.runAllTimers();
    expect(shadowRoot.querySelectorAll('style')).toHaveLength(1);
    expect(shadowRoot.querySelector('style')).toBe(style);
    expect(style?.textContent).toContain('.a{color:red}');
    expect(style?.textContent).toContain('.b{color:blue}');

    manager.destroy();
    expect(shadowRoot.querySelector('style')).toBeNull();
  } finally {
    manager.destroy();
    iframe.remove();
    vi.useRealTimers();
  }
});
