import '../dom.mjs';
globalThis.MessageChannel = undefined;
const { createElement, createRef } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { Form, ValidationMode, ErrorVisibility, registerPlugin } = await import('@canard/schema-form');
const { plugin } = await import('@canard/schema-form-antd6-plugin');

export default { pkg: '@canard/schema-form-antd6-plugin', fn: 'branch error validation', input: 'array minItems error', inputKind: 'repaired', kind: 'render', setup: async () => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  const schedule = globalThis.setTimeout; globalThis.setTimeout = (...args) => { const timer = schedule(...args); timer.unref?.(); return timer; };
  const frames = []; globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback); const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const jsonSchema = { type: 'object', properties: { field: { type: 'array', items: { type: 'string' }, minItems: 2 } } }; const defaultValue = { field: ['a'] };
  registerPlugin({ validator: { compile: () => (value) => Array.isArray(value?.field) && value.field.length < 2 ? [{ keyword: 'minItems', dataPath: '/field', message: 'minItems constraint' }] : null, compileGuard: () => { throw new Error('unexpected guard'); } } });
  const ref = createRef(); const container = document.body.appendChild(document.createElement('div')); const root = createRoot(container);
  flushSync(() => root.render(createElement(Form, { ref, jsonSchema, defaultValue, validationMode: ValidationMode.OnRequest, errorVisibility: ErrorVisibility.Always, fieldInputDefinitions: plugin.fieldInputDefinitions, FieldRenderer: plugin.FieldRenderer, LabelRenderer: plugin.LabelRenderer, ErrorMessageRenderer: plugin.ErrorMessageRenderer })));
  for (let turn = 0; turn < 3; turn++) await new Promise((resolve) => setImmediate(resolve));
  return { before: () => flushSync(() => ref.current.reset()), run: async () => { await ref.current.validate(); await new Promise((resolve) => setImmediate(resolve)); flushSync(() => {}); }, check: () => ref.current.getErrors().some((error) => error.dataPath === '/field' && error.keyword === 'minItems') };
} };
