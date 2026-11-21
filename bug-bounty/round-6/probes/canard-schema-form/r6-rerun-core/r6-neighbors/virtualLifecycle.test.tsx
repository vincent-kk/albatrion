import * as React from 'react';
import { createRef, StrictMode } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, inject, it } from 'vitest';
import { Form, type FormHandle, type FieldInputProps, ValidationMode } from '@/schema-form';

afterEach(cleanup);
const schema={type:'object',properties:{on:{type:'boolean'},a:{type:'string'},b:{type:'string',controls:{active:'/on === true'}},c:{type:'string'}},options:{virtual:{g:{fields:['a','b','c']}}}} as const;

/** A consumer widget edits the documented tuple and leaves the absent middle position untouched. */
function TupleInput({value,onChange}:FieldInputProps) {
  return <button type="button" data-testid="tuple" onClick={()=>onChange(['next',(value as any)[1],(value as any)[2]])}>{JSON.stringify(value)}</button>;
}

it.each([false,true])('a virtual tuple stays stable across strict=%s mount, retained reset and native reset', async strict=>{
  const ref=createRef<FormHandle>();
  const form=<Form ref={ref} jsonSchema={schema} defaultValue={{on:true,a:'a0',b:'b0',c:'c0'}} fieldInputMap={{'/g':TupleInput}} validationMode={ValidationMode.None}/>;
  const view=render(strict?<StrictMode>{form}</StrictMode>:form);
  await act(async()=>{ref.current!.findNode('/b')!.setValue('edited');ref.current!.findNode('/on')!.setValue(false);});
  expect(view.getByTestId('tuple').textContent).toBe('["a0",null,"c0"]');
  fireEvent.click(view.getByTestId('tuple'));
  expect(ref.current!.getValue()).toEqual({on:false,a:'next',c:'c0'});
  await act(async()=>ref.current!.findNode('/g')!.resetSubtree());
  await act(async()=>ref.current!.findNode('/on')!.setValue(true));
  expect(ref.current!.getValue()).toEqual({on:true,a:'a0',b:'b0',c:'c0'});
  await act(async()=>ref.current!.findNode('/a')!.setValue('edit'));
  await act(async()=>{fireEvent.reset(view.container.querySelector('form')!);});
  expect(ref.current!.getValue()).toEqual({on:true,a:'a0',b:'b0',c:'c0'});
});

it.skipIf(inject('reactMajor')==='18')('Activity (React 19 only) preserves a virtual widget and its retained constituent through hidden writes', async()=>{
  const Activity=(React as any).Activity;
  const ref=createRef<FormHandle>();
  const form=<Form ref={ref} jsonSchema={schema} defaultValue={{on:true,a:'a0',b:'b0',c:'c0'}} fieldInputMap={{'/g':TupleInput}} validationMode={ValidationMode.None}/>;
  const view=render(<Activity mode="visible">{form}</Activity>);
  const handle=ref.current!;
  await act(async()=>{handle.findNode('/b')!.setValue('edited');view.rerender(<Activity mode="hidden">{form}</Activity>);});
  await act(async()=>{handle.findNode('/on')!.setValue(false);handle.findNode('/g')!.resetSubtree();});
  await act(async()=>view.rerender(<Activity mode="visible">{form}</Activity>));
  expect(view.getByTestId('tuple').textContent).toBe('["a0",null,"c0"]');
  await act(async()=>ref.current!.findNode('/on')!.setValue(true));
  expect(ref.current!.getValue()).toEqual({on:true,a:'a0',b:'b0',c:'c0'});
});
