// Bundled by runtimeCounts.mjs; this current API fixture drives the archived count diagnostic.

/* eslint-disable react-refresh/only-export-components -- Bundled for Node profiling diagnostics without HMR. */
import { createRef, useState } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/profiling';

import { Form } from '@/schema-form/components/Form';

export const registry = new Map<string, (value: unknown) => void>();

/**
 * Render a controlled input and register its writer for scripted count checks.
 * @param props - Current field identity, value and write callback.
 * @returns The controlled input used by the diagnostic.
 */
function CtlInput({ path, value, onChange }: any) {
  registry.set(path, onChange);
  return (
    <input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/**
 * Render an uncontrolled input and register its writer for scripted count checks.
 * @param props - Current field identity, initial value and write callback.
 * @returns The uncontrolled input used by the diagnostic.
 */
function UnctlInput({ path, defaultValue, onChange }: any) {
  registry.set(path, onChange);
  return (
    <input
      defaultValue={defaultValue ?? ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const schema = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    o: {
      type: 'object',
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    },
  },
} as const;
const arraySchema = {
  type: 'object',
  properties: { arr: { type: 'array', items: { type: 'string' } } },
} as const;
export let setHostProps: (props: any) => void = () => {};

/**
 * Mount the Form surface for controlled or uncontrolled scripted writes.
 * @param mode - Whether input values are controlled by the form.
 * @param scenario - The flat or array schema exercised by the diagnostic.
 * @returns The form handle, DOM container, React root and cleanup callback.
 */
export function mount(mode: 'ctl' | 'unctl', scenario: 'flat' | 'array') {
  registry.clear();
  const Input = mode === 'ctl' ? CtlInput : UnctlInput;
  const ref = createRef<any>();
  const props = {
    jsonSchema: scenario === 'flat' ? schema : arraySchema,
    defaultValue:
      scenario === 'flat'
        ? { a: 'a0', b: 'b0', o: { x: 'x0', y: 'y0' } }
        : { arr: ['i0', 'i1', 'i2'] },
    fieldInputDefinitions: [
      { test: { type: 'string' as const }, Component: Input },
    ],
    validationMode: 0 as const,
    onChange: () => {},
    context: { k: 1 },
  };
  /** Render the form with the current diagnostic overrides. */
  function Host() {
    const [overrides, setOverrides] = useState({});
    setHostProps = (next) =>
      setOverrides((previous) => ({ ...previous, ...next }));
    return <Form ref={ref} {...props} {...overrides} />;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<Host />));
  return {
    ref,
    container,
    root,
    unmount: () => {
      flushSync(() => root.unmount());
      container.remove();
    },
  };
}
