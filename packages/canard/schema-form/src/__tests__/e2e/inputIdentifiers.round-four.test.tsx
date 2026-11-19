import { createRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Form, type FieldInputProps, type FormHandle, ValidationMode, isArrayNode, useFieldErrors } from '../../index';

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
    // eslint-disable-next-line no-control-regex -- Assert the HTML-unsafe code-unit boundary.
    expect(props.inputId).not.toMatch(/[\u0000-\u0020\u007f-\u009f\ud800]/);
    expect(document.getElementById(props.labelId)?.getAttribute('for')).toBe(props.inputId);
    expect(props.getInputId(1)).toBe(props.getInputId('1'));
    expect(props.getInputId(0)).not.toBe(props.inputId);
    expect(ids).not.toContain(props.getInputId(1));
    expect(ids).not.toContain(props.inputId + '-label');
  }
  const before = snapshots.get('/plan')!;
  await act(async () => { handle.current!.findNode('/plan')!.setValue('next'); });
  expect(snapshots.get('/plan')!.getInputId).toBe(before.getInputId);
});

it('updates keyed identity on array moves without replacing the surviving control', async () => {
  const seen = new Map<object, FieldInputProps>();
  const Input = (props: FieldInputProps) => { seen.set(props.node, props); return <input id={props.inputId} />; };
  const handle = createRef<FormHandle>();
  const view = render(<Form ref={handle} validationMode={ValidationMode.None} jsonSchema={{ type: 'array', items: { type: 'string' } }} defaultValue={['a']} fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input, controlled: true }]} />);
  const before = [...seen.values()][0];
  const control = document.getElementById(before.inputId);
  const list = handle.current!.findNode('');
  if (!isArrayNode(list)) throw new Error('Expected array');
  await act(async () => { list.insert(0, 'new'); });
  const after = seen.get(before.node)!;
  expect(after.path).toBe('/1');
  expect(after.getInputId).not.toBe(before.getInputId);
  expect(after.getInputId(0)).not.toBe(before.getInputId(0));
  expect(document.getElementById(after.inputId)).toBe(control);
  view.unmount();
});

it('retains keyed identity through a published validation error', async () => {
  const seen: { getInputId: FieldInputProps['getInputId']; errorCount: number }[] = [];
  const Input = (props: FieldInputProps) => {
    const { errors } = useFieldErrors(props.node);
    seen.push({ getInputId: props.getInputId, errorCount: errors.length });
    return <input id={props.inputId} value={props.value ?? ''} onChange={event => props.onChange(event.target.value)} />;
  };
  const handle = createRef<FormHandle>();
  const view = render(<Form ref={handle} jsonSchema={{ type: 'string' }} defaultValue="okay" validationMode={ValidationMode.OnRequest}
    validatorFactory={{ compileGuard: () => () => true, compile: () => value => value === 'bad' ? [{ dataPath: '', message: 'invalid' }] : [] }}
    fieldInputDefinitions={[{ test: { type: 'string' }, Component: Input, controlled: true }]} />);
  const before = seen[seen.length - 1];
  expect(typeof before.getInputId).toBe('function');
  await act(async () => {
    handle.current!.node!.setValue('bad');
    await handle.current!.validate();
  });
  expect(handle.current!.getErrors()).toHaveLength(1);
  expect(seen[seen.length - 1].errorCount).toBe(1);
  expect(seen[seen.length - 1].getInputId).toBe(before.getInputId);
  view.unmount();
});
