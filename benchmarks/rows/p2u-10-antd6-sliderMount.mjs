import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd6-plugin');

export default { pkg: '@canard/schema-form-antd6-plugin', fn: 'slider mount', input: 'integer slider with one thumb', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const frames = []; globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const jsonSchema = { type: 'object', properties: { level: { type: 'number', title: 'Level', minimum: 0, maximum: 10, multipleOf: 1, format: 'slider', presentation: { inputType: 'slider' } } } }; const defaultValue = { level: 4 };
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); element = createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => ref.current.getValue().level === 4 && container.querySelector('.ant-slider-handle')?.getAttribute('aria-valuenow') === '4',
    after: () => { flushFrames(); root.unmount(); container.remove(); },
  };
} };
