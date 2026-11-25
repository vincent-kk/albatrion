import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd6-plugin');

export default { pkg: '@canard/schema-form-antd6-plugin', fn: 'time range panel', input: 'bounded time range, start input opened', inputKind: 'repaired', kind: 'render', setup: () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const frames = []; globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const jsonSchema = { type: 'array', format: 'time-range', items: { type: 'string' }, presentation: { FieldInputProps: { minimum: '09:00:00+00:00', maximum: '18:00:00+00:00' } } }; const defaultValue = ['10:00:00+00:00', '15:00:00+00:00'];
  let container, root, ref, start;
  return {
    before: async () => { container = document.body.appendChild(document.createElement('div')); root = createRoot(container); ref = createRef(); flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }))); for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve)); start = container.querySelector('input[date-range=start]'); },
    run: () => flushSync(() => { start.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); start.dispatchEvent(new MouseEvent('click', { bubbles: true })); }),
    check: () => JSON.stringify(ref.current.getValue()) === JSON.stringify(defaultValue) && !!document.body.querySelector('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-panel'),
    after: () => { flushFrames(); root.unmount(); container.remove(); },
  };
} };
