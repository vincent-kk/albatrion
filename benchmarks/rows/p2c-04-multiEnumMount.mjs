import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd6-plugin');

export default { pkg: '@canard/schema-form-antd6-plugin', fn: 'multi enum mount', input: 'two options and an unknown object', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const jsonSchema = { type: 'array', items: { type: 'string', enum: ['news', 'sports'] } }; const defaultValue = [{ legacy: 'data' }, 'sports']; let container, root, ref; const frames = [];
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  return { before: () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); }, run: () => flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))), check: () => Array.isArray(ref.current.getValue()) && !!container.querySelector('.ant-select'), after: () => { flushFrames(); root.unmount(); container.remove(); } };
} };
