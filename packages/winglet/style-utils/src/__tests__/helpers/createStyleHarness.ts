import { vi } from 'vitest';
import { destroyScope, styleManagerFactory } from '../../index';

/** Record actual constructable-sheet writes without applying CSSOM's documented ordering restrictions. */
export const createStyleHarness = (shadow: boolean, scope = 'r5target') => {
  const frames: FrameRequestCallback[] = [];
  let text = '';
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('CSSStyleSheet', class {
    /** Capture the exact text consumed by the independent Syntax reader. */
    replaceSync(value: string) { text = value; }
  });
  const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
  const root = shadow ? shadowRoot : document;
  if (!('adoptedStyleSheets' in root)) Object.defineProperty(root, 'adoptedStyleSheets', { configurable: true, writable: true, value: [] });
  const config = shadow ? { shadowRoot } : undefined;
  return {
    add: styleManagerFactory(scope, config),
    flush: () => { for (const callback of frames.splice(0)) callback(0); return text; },
    destroy: () => destroyScope(scope, config),
    root,
  };
};
