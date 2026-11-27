import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd6-plugin');

export default { pkg: '@canard/schema-form-antd6-plugin', fn: 'checkbox change', input: 'two options and unknown initial value', inputKind: 'repaired', kind: 'render', setup: async () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const frames = []; globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const jsonSchema = { type: 'array', items: { type: 'string', enum: ['news', 'sports'] }, presentation: { inputType: 'checkbox' } }; const defaultValue = ['legacy', 'sports'];
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set; const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve));
  let input;
  return { before: async () => { input = container.querySelectorAll('input[type=checkbox]')[0]; if (input.checked) flushSync(() => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))); flushSync(() => ref.current.setValue(['legacy', 'sports'])); await new Promise((resolve) => setImmediate(resolve)); input = container.querySelectorAll('input[type=checkbox]')[0]; setter.call(input, false); }, run: () => flushSync(() => input.dispatchEvent(new MouseEvent('click', { bubbles: true }))), check: () => { const value = ref.current.getValue(); return value.includes('news') && value.includes('sports'); } };
} };
