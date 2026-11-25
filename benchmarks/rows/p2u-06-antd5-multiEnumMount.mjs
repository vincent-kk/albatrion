import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd5-plugin');

export default { pkg: '@canard/schema-form-antd5-plugin', fn: 'multi enum mount', input: 'two options and an unknown object', inputKind: 'repaired', kind: 'render', setup: () => {
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const frames = []; globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const jsonSchema = { type: 'array', items: { type: 'string', enum: ['news', 'sports'] } }; const defaultValue = [{ legacy: 'data' }, 'sports']; const records = []; const onError = (record) => records.push(record);
  let container, root, ref, element;
  return {
    before: () => { container = document.body.appendChild(document.createElement('div')); ref = createRef(); records.length = 0; element = createElement(Form, { ref, jsonSchema, defaultValue, onError, validationMode: ValidationMode.None, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer }); },
    run: () => { root = createRoot(container); flushSync(() => root.render(element)); },
    check: () => JSON.stringify(ref.current.getValue()) === JSON.stringify(defaultValue) && !!container.querySelector('.ant-select-multiple') && records.some((record) => record.code === 'SCHEMA_FORM_WARNING.MISFIT' && record.path === '/0'),
    after: () => { flushFrames(); root.unmount(); container.remove(); },
  };
} };
