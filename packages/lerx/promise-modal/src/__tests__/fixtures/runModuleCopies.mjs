// Launched by moduleCopies.build.test.ts in a fresh V8 process against built package entries.
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const dom = new JSDOM(
  '<!doctype html><body><button id="opener">Open</button><div id="root"></div></body>',
  { url: 'https://example.test/' },
);
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'HTMLInputElement',
  'Element',
  'Node',
  'MutationObserver',
  'Event',
  'MouseEvent',
])
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
  });
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: dom.window.navigator,
});
globalThis.requestAnimationFrame = (callback) =>
  setTimeout(() => callback(0), 0);
globalThis.cancelAnimationFrame = clearTimeout;
window.requestAnimationFrame = globalThis.requestAnimationFrame;
window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const require = createRequire(import.meta.url);
const entry = new URL('../../../dist/index.mjs', import.meta.url);
const cjs = new URL('../../../dist/index.cjs', import.meta.url);
const load = async (kind, copy) =>
  kind === 'esm' ? import(`${entry.href}?copy=${copy}`) : require(cjs.pathname);
const [firstKind, secondKind] = process.argv.slice(2);
const first = await load(firstKind, 'first');
const registry = globalThis[Symbol.for('@lerx/promise-modal')];
const second = await load(secondKind, 'second');
assert.equal(globalThis[Symbol.for('@lerx/promise-modal')], registry);
assert.deepEqual(Object.keys(first).sort(), Object.keys(second).sort());
const added = [];
const removed = [];
const add = document.addEventListener.bind(document);
const remove = document.removeEventListener.bind(document);
document.addEventListener = (type, listener, options) => {
  if (type === 'keydown') added.push(listener);
  return add(type, listener, options);
};
document.removeEventListener = (type, listener, options) => {
  if (type === 'keydown') removed.push(listener);
  return remove(type, listener, options);
};
const opener = document.getElementById('opener');
opener.focus();
const pending = second.prompt({
  title: 'Shared prompt',
  defaultValue: 'initial',
  dimmed: true,
  Input: ({ value, onChange, onConfirm }) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement('input', { value: value ?? '', readOnly: true }),
      React.createElement(
        'button',
        { 'data-draft': '', onClick: () => onChange('draft') },
        'Draft',
      ),
      React.createElement(
        'button',
        { 'data-confirm': '', onClick: onConfirm },
        'Finish',
      ),
    ),
});
const root = createRoot(document.getElementById('root'));
flushSync(() =>
  root.render(
    React.createElement(first.ModalProvider, { options: { duration: 0 } }),
  ),
);
assert.equal(document.querySelector('input').value, 'initial');
assert.equal(registry.ids.length, 1);
assert.equal(added.length, 1);
assert.equal(opener.hasAttribute('inert'), true);
flushSync(() => document.querySelector('[data-draft]').click());
assert.equal(document.querySelector('input').value, 'draft');
flushSync(() => document.querySelector('[data-confirm]').click());
assert.equal(await pending, 'draft');
await new Promise((resolve) => setTimeout(resolve, 20));
flushSync(() => root.unmount());
await Promise.resolve();
assert.deepEqual(registry.ids, []);
assert.equal(removed.length, 1);
assert.equal(removed[0], added[0]);
assert.equal(opener.hasAttribute('inert'), false);
assert.notEqual(document.body.style.overflow, 'hidden');
assert.equal(document.activeElement, opener);
console.log(
  `MODULE_COPIES_OK ${firstKind}+${secondKind} prompt=draft keydown=1 cleanup=1 exports=${Object.keys(first).sort().join(',')}`,
);
dom.window.close();
