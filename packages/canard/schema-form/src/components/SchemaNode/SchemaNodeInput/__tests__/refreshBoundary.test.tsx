import { useLayoutEffect } from 'react';

import { act, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { observeErrorSink } from '@/schema-form/__tests__/helpers/observeErrorSink';
import { registerPlugin, type FormTypeInputProps } from '@/schema-form';

import { INPUT_SUPPLIES, renderInputSupply } from './helpers/renderInputSupply';

afterEach(() => {
  cleanup();
  registerPlugin(null);
  vi.restoreAllMocks();
});

it.each(INPUT_SUPPLIES)('EVENT-070 failed field stays failed after peer write and explicit Refresh (%s)', (supply) => {
  observeErrorSink();
  let fail = true;
  let renders = 0;
  const Field = ({ path, defaultValue }: FormTypeInputProps) => {
    renders++;
    if (fail) throw new Error('FIELD_FAILED');
    return <input id={path} defaultValue={defaultValue} />;
  };
  const Peer = ({ node, value, onChange }: FormTypeInputProps) => {
    useLayoutEffect(() => {
      if (value === 'write') node.parentNode!.find('./field')!.setValue('committed');
    }, [node, value]);
    return <input id="/peer" value={value} onChange={(event) => onChange(event.target.value)} />;
  };
  const view = renderInputSupply(Field, supply, undefined, undefined, Peer);
  const errors = view.container.textContent;
  expect(view.container.querySelector('[id="/field"]')).toBeNull();
  expect(errors).toContain('An unexpected error has occurred');
  const stoppedAt = renders;
  fail = false;
  fireEvent.change(view.container.querySelector('[id="/peer"]')!, { target: { value: 'write' } });
  expect(view.ref.current!.findNode('/field')!.value).toBe('committed');
  expect(view.container.querySelector('[id="/field"]'), 'Peer write must preserve the failed boundary').toBeNull();
  expect(renders).toBe(stoppedAt);
  expect(view.container.textContent).toBe(errors);
  act(() => view.ref.current!.refresh('/field'));
  expect(view.container.querySelector('[id="/field"]')).toBeNull();
  expect(renders).toBe(stoppedAt);
});

it.each(INPUT_SUPPLIES)('EVENT-040 RequestRemount restores a failed field (%s)', (supply) => {
  observeErrorSink();
  let fail = true;
  const Field = ({ path, defaultValue }: FormTypeInputProps) => {
    if (fail) throw new Error('FIELD_FAILED');
    return <input id={path} defaultValue={defaultValue} />;
  };
  const view = renderInputSupply(Field, supply);
  expect(view.container.querySelector('[id="/field"]')).toBeNull();
  const peer = view.container.querySelector('[id="/peer"]');
  fail = false;
  act(() => view.ref.current!.remount('/field'));
  expect((view.container.querySelector('[id="/field"]') as HTMLInputElement).value).toBe('initial');
  expect(view.container.querySelector('[id="/peer"]')).toBe(peer);
});

it.each(INPUT_SUPPLIES)('EVENT-070 Form key replacement restores a failed field (%s)', (supply) => {
  observeErrorSink();
  let fail = true;
  const Field = ({ path, defaultValue }: FormTypeInputProps) => {
    if (fail) throw new Error('FIELD_FAILED');
    return <input id={path} defaultValue={defaultValue} />;
  };
  const view = renderInputSupply(Field, supply);
  expect(view.container.querySelector('[id="/field"]')).toBeNull();
  fail = false;
  view.replaceForm();
  expect((view.container.querySelector('[id="/field"]') as HTMLInputElement).value).toBe('initial');
});
