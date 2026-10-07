// Bundled by prepare-branch1-bundles.mjs --react-fa; the Form import is the measured public surface.
import React, { createRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/profiling';

import { Form } from '../../../../src/index';
export { Form };
export { nodeFromJSONSchema } from '../../../../src/core/nodeFromJSONSchema';
export { blueprint } from '../../../../src/core/blueprint';
export { equivalentFixtures } from '../../../../../../aileron/benchmark-form/fixtures/equivalent';

export const registry = new Map<string, (value: unknown) => void>();

function CtlInput({ path, value, onChange }: any) {
  registry.set(path, onChange);
  return <input value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
}

function UnctlInput({ path, defaultValue, onChange }: any) {
  registry.set(path, onChange);
  return <input defaultValue={defaultValue ?? ''} onChange={(event) => onChange(event.target.value)} />;
}

export const schema = {
  type: 'object',
  properties: {
    a: { type: 'string' }, b: { type: 'string' },
    o: { type: 'object', properties: { x: { type: 'string' }, y: { type: 'string' } } },
  },
};
export const arraySchema = {
  type: 'object', properties: { arr: { type: 'array', items: { type: 'string' } } },
};
export let setHostProps: (props: any) => void = () => {};

/** Mount a small controlled or uncontrolled form for identical scripted writes. */
export function mount(mode: 'ctl' | 'unctl', scenario: 'flat' | 'array') {
  registry.clear();
  const Input = mode === 'ctl' ? CtlInput : UnctlInput;
  const ref = createRef<any>();
  const props = {
    jsonSchema: scenario === 'flat' ? schema : arraySchema,
    defaultValue: scenario === 'flat'
      ? { a: 'a0', b: 'b0', o: { x: 'x0', y: 'y0' } }
      : { arr: ['i0', 'i1', 'i2'] },
    formTypeInputDefinitions: [{ test: { type: 'string' }, Component: Input }],
    validationMode: 0 as const, onChange: () => {}, context: { k: 1 },
  };
  function Host() {
    const [overrides, setOverrides] = useState({});
    setHostProps = (next) => setOverrides((previous) => ({ ...previous, ...next }));
    return <Form ref={ref} {...props} {...overrides} />;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<Host />));
  return { ref, container, root, unmount: () => {
    flushSync(() => root.unmount());
    container.remove();
  } };
}
