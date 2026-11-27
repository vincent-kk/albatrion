// Loaded by pluginMigration.test.ts in an isolated process; argv[2] selects the installed release tree.
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
/** Resolve React, the core and the plugin from one installation to avoid duplicate React instances. */
const requireRelease = createRequire(resolve(process.argv[2], 'package.json'));
const { JSDOM } = requireRelease('jsdom');
/** This comparison observes input semantics and DOM identity markers, not CSS layout. */
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});
for (const key of [
  'window',
  'document',
  'HTMLElement',
  'Element',
  'Node',
  'HTMLInputElement',
  'MutationObserver',
  'Event',
  'MouseEvent',
  'ShadowRoot',
  'SVGElement',
])
  global[key] = dom.window[key];
global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
window.matchMedia = () => ({
  matches: false,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});
require.extensions['.css'] = () => {};
const React = requireRelease('react');
const { createRoot } = requireRelease('react-dom/client');
const { flushSync } = requireRelease('react-dom');
const core = requireRelease('@canard/schema-form');
const plugin = requireRelease(
  `@canard/schema-form-${process.argv[3]}-plugin`,
).plugin;
/** Detect the public API generation without rewriting either release's implementation. */
const current = !!core.ErrorVisibility;
const results = [];
const errorCodes = [];
const originalError = console.error;
console.error = (...args) => {
  for (const arg of args) if (arg?.code) errorCodes.push(arg.code);
};

/** Mount the supplied schema, observe the selected input, and perform a native edit when present. */
async function observe(type, definitions) {
  let handle;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  errorCodes.length = 0;
  try {
    flushSync(() =>
      root.render(
        React.createElement(core.Form, {
          ref: (value) => {
            handle = value;
          },
          jsonSchema: { type },
          defaultValue: type === 'integer' ? 3 : '42',
          validationMode: 0,
          [current ? 'fieldInputDefinitions' : 'formTypeInputDefinitions']:
            definitions ??
            (current
              ? plugin.fieldInputDefinitions
              : plugin.formTypeInputDefinitions),
        }),
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
    const input = container.querySelector('input');
    const result = {
      type,
      nodeType: handle?.node?.type,
      schemaType: handle?.node?.schemaType,
      value: handle?.getValue(),
      inputClass: input?.className,
      inputType: input?.type,
      marker: input?.dataset.selected,
      errors: [...errorCodes],
    };
    if (input) {
      flushSync(() => {
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set.call(input, '21');
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        input.dispatchEvent(
          new window.FocusEvent('focusout', { bubbles: true }),
        );
      });
      await new Promise((resolve) => setTimeout(resolve, 30));
      result.afterEdit = handle.getValue();
    }
    return result;
  } finally {
    flushSync(() => root.unmount());
    container.remove();
  }
}

(async () => {
  try {
    for (const type of [
      ['string', 'number'],
      ['number', 'boolean'],
      ['string', 'null'],
      'integer',
    ])
      results.push(await observe(type));
    let hint;
    let inputProps;
    const Probe = (props) => {
      inputProps = {
        type: props.type,
        schemaType: props.schemaType,
        nullable: props.nullable,
        misfit: props.misfit,
      };
      return React.createElement('input', { 'data-selected': 'probe' });
    };
    await observe('integer', [
      {
        test: (value) => {
          hint = { type: value.type, schemaType: value.schemaType };
          return true;
        },
        Component: Probe,
      },
    ]);
    const integerInputProps = inputProps;
    const numberTest = await observe('integer', [
      { test: { type: 'number' }, Component: Probe },
    ]);
    const warning = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warning.push(String(args[0]));
    let unknownTest;
    try {
      unknownTest = await observe('string', [
        { test: { type: 'string', typo: 'must-not-match' }, Component: Probe },
      ]);
    } finally {
      console.warn = originalWarn;
    }
    console.log(
      'MIGRATION_RESULT ' +
        JSON.stringify({
          current,
          results,
          hint,
          inputProps: integerInputProps,
          numberTest,
          unknownTest,
          warning,
        }),
    );
  } finally {
    console.error = originalError;
    dom.window.close();
  }
})().catch((error) => {
  originalError(error);
  process.exitCode = 1;
});
