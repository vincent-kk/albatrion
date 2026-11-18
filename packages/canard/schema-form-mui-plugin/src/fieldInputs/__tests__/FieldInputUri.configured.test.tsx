import { Activity, createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Form, type FormHandle } from '@canard/schema-form';
import { FieldInputUriDefinition } from '../FieldInputUri';
beforeEach(() => {vi.stubGlobal('ResizeObserver', class {observe() {} unobserve() {} disconnect() {}});});
afterEach(() => {cleanup();vi.unstubAllGlobals();});
const input = () => document.querySelector<HTMLInputElement>('input#\\/link')!;
const choose = (label: string) => {
 fireEvent.mouseDown(document.querySelector('.ant-select-selector') ?? screen.getByRole('combobox'));
 const option = Array.from(document.querySelectorAll('.ant-select-item-option')).find(e=>e.textContent===label);
 if(option) fireEvent.click(option); else fireEvent.click(within(screen.getByRole('listbox')).getByText(label));
};

it.each([
  ['sms', 'sms:'],
  ['HTTP', 'HTTP://'],
  ['ftp', 'ftp://'],
  ['custom://', 'custom://'],
  ['http:', 'http:'],
  ['Custom:', 'Custom:'],
])('joins a configured protocol %j with %j', (configured, expected) => {
  const ref = createRef<FormHandle>();
  render(
    <Form
      ref={ref}
      fieldInputDefinitions={[FieldInputUriDefinition]}
      jsonSchema={{
        type: 'object',
        properties: {
          link: {
            type: 'string',
            format: 'uri',
 options: { omitEmpty: false },
            presentation: { FieldInputProps: { protocols: [configured] } },
          },
        },
      }}
    />,
  );
  fireEvent.change(input(), { target: { value: 'part' } });
  expect(ref.current!.getValue()).toEqual({ link: expected + 'part' });
});

it.each([
 ['sms','tel','https'], ['sms:','https://'],
])('keeps the selected custom scheme from %j', (...protocols) => {
 const ref=createRef<FormHandle>();
 render(<Form ref={ref} fieldInputDefinitions={[FieldInputUriDefinition]} jsonSchema={{type:'object',properties:{link:{type:'string',format:'uri',presentation:{FieldInputProps:{protocols}}}}}} />);
 fireEvent.change(input(),{target:{value:'part'}});
 expect(ref.current!.getValue()).toEqual({link:'sms:part'});
 choose('https://');
 expect(ref.current!.getValue()).toEqual({link:'https://part'});
});

it('keeps a dropdown choice through hiding, edits and clearing, then accepts reset and external writes', async () => {
 const ref=createRef<FormHandle>();
 const form = (mode: 'visible'|'hidden') => <Activity mode={mode}><Form ref={ref} fieldInputDefinitions={[FieldInputUriDefinition]} jsonSchema={{type:'object',properties:{link:{type:'string',format:'uri'}}}} defaultValue={{link:'http://original'}} /></Activity>;
 const view=render(form('visible'));
 choose('https://');
 view.rerender(form('hidden'));view.rerender(form('visible'));
 fireEvent.change(input(),{target:{value:'edited'}});
 expect(ref.current!.getValue()).toEqual({link:'https://edited'});
 fireEvent.change(input(),{target:{value:''}});
 expect(ref.current!.getValue()).toEqual({link:'https://'});
 await act(async()=>{await ref.current!.reset();});
 expect(ref.current!.getValue()).toEqual({link:'http://original'});
 act(()=>{ref.current!.setValue({link:'ftp://other'});});
 expect(input().value).toBe('other');
 expect(ref.current!.getValue()).toEqual({link:'ftp://other'});
});
