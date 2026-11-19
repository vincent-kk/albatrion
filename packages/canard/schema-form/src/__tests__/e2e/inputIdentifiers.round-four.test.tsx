import { createRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type FieldInputProps, type FormHandle, ValidationMode } from '../../index';

afterEach(cleanup);

it('supplies opaque input and title ids from one lineage with stable keyed resolution', async () => {
  const snapshots = new Map<string, FieldInputProps>();
  const Input = (props: FieldInputProps) => {
    snapshots.set(props.path, props);
    return <input id={props.inputId} aria-labelledby={props.labelId} />;
  };
  const keys = ['plan', 'plan-1', 'name', 'name-label', 'first name', '~', '/', '\u001f', '\r', '\0', '\ud800'];
  const handle = createRef<FormHandle>();
  const view = render(<><Form ref={handle} validationMode={ValidationMode.None} fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input, controlled: true }]} jsonSchema={{ type: 'object', properties: Object.fromEntries(keys.map(key => [key, { type: 'string' }])) }} /><Form jsonSchema={{ type: 'string' }} validationMode={ValidationMode.None} /></>);
  const ids = Array.from(view.container.querySelectorAll('[id]'), element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const props of snapshots.values()) {
    expect(typeof props.inputId).toBe('string');
    expect(props.id).toBeUndefined();
    expect(props.inputId).not.toMatch(/[\u0000-\u0020\u007f-\u009f\ud800]/);
    expect(document.getElementById(props.labelId)?.getAttribute('for')).toBe(props.inputId);
    expect(props.getInputId(1)).toBe(props.getInputId('1'));
    expect(props.getInputId(0)).not.toBe(props.inputId);
    expect(ids).not.toContain(props.getInputId(1));
    expect(ids).not.toContain(props.inputId + '-label');
  }
  const before = snapshots.get('/plan')!;
  await act(async () => { handle.current!.setValue('/plan', 'next'); });
  expect(snapshots.get('/plan')!.getInputId).toBe(before.getInputId);
});
