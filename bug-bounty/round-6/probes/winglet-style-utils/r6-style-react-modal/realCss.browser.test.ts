import { afterEach, expect, it, vi } from 'vitest';
import { compressCss, destroyScope, styleManagerFactory } from '../../index';

afterEach(() => { vi.unstubAllGlobals(); document.querySelectorAll('[data-r6-fixture]').forEach(node => node.remove()); });

it('B0 a same-document shadow root receives and releases its constructable sheet', () => {
  const host = document.createElement('div');
  host.dataset.r6Fixture = '';
  document.body.append(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  try {
    styleManagerFactory('r6-same-document', { shadowRoot })('one', '.a{color:red}');
    frames.shift()!(0);
    expect(shadowRoot.adoptedStyleSheets).toHaveLength(1);
  } finally { destroyScope('r6-same-document', { shadowRoot }); }
  expect(shadowRoot.adoptedStyleSheets).toHaveLength(0);
});

it('B1 a shadow root in another document receives a constructable sheet like this document', () => {
  const iframe = document.createElement('iframe');
  iframe.dataset.r6Fixture = '';
  document.body.append(iframe);
  const other = iframe.contentDocument!;
  const host = other.createElement('div');
  other.body.append(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const add = styleManagerFactory('r6-cross-document', { shadowRoot });
  let failure: unknown;
  try {
    add('first', '.a{color:red}');
    try { frames.shift()!(0); } catch (error) { failure = error; }
    add('second', '.b{color:blue}');
    frames.shift()!(0);
    expect({ error: (failure as DOMException | undefined)?.name, sheets: shadowRoot.adoptedStyleSheets.length }).toEqual({ error: undefined, sheets: 1 });
  } finally { destroyScope('r6-cross-document', { shadowRoot }); }
});

it('B2 conditional value behavior survives compression in Chromium', () => {
  const input = '.r6condition{--theme: ;color:if(style(--theme: ):red;else:blue)}';
  const output = compressCss(input);
  const element = document.createElement('div');
  element.className = 'r6condition';
  element.dataset.r6Fixture = '';
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  document.body.append(element);
  try {
    sheet.replaceSync(input);
    const before = getComputedStyle(element).color;
    sheet.replaceSync(output);
    const after = getComputedStyle(element).color;
    expect({ supported: CSS.supports('color', 'if(style(--theme: ):red;else:blue)'), before, after }).toEqual({ supported: true, before: 'rgb(255, 0, 0)', after: 'rgb(255, 0, 0)' });
  } finally { document.adoptedStyleSheets = document.adoptedStyleSheets.filter(value => value !== sheet); }
});
