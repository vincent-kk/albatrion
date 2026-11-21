import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

it.each([null, 'wrong', 17, false])('a child undefined write preserves its nonobject parent %j in a batch', (incoming) => {
  const run = (batched: boolean) => {
    const root = nodeFromJSONSchema({ jsonSchema: { type: 'object', properties: {
      o: { type: ['object', 'null'], properties: { n: { type: 'number' }, s: { type: 'string' } } },
      other: { type: 'boolean' },
    } }, defaultValue: { o: { n: 1, s: 'initial' } }, validationMode: ValidationMode.None });
    const n = root.find('/o/n')!;
    const calls = () => { root.find('/o')!.setValue(incoming); n.setValue(undefined); };
    if (batched) root.batch(calls); else calls();
    return root.value;
  };
  expect(run(true)).toEqual(run(false));
});

it('a throwing updater commits previous nested marks and allows caught continuation', () => {
  const root = nodeFromJSONSchema({jsonSchema: {type: 'object', properties: {n: {type:'number'}, s:{type:'string'}}}, defaultValue: {n:1,s:'old'},validationMode:ValidationMode.None});
  root.batch(() => {
    root.find('/n')!.setValue('2');
    try { root.batch(() => root.find('/s')!.setValue(() => {throw new Error('stop');})); } catch {}
    root.find('/n')!.setValue((v: unknown) => Number(v) + 1);
  });
  expect(root.value).toEqual({n:3,s:'old'});
});

it('a child updater sees the same sibling after nonobject and child writes', () => {
  const run = (batched: boolean) => {
    const root = nodeFromJSONSchema({jsonSchema: {type:'object',properties:{o:{type:['object','null'],properties:{n:{type:'number'},s:{type:'string'}}}}},defaultValue:{o:{n:1,s:'old'}},validationMode:ValidationMode.None});
    let seen: unknown;
    const calls = () => { root.find('/o')!.setValue(null); root.find('/o/n')!.setValue(undefined); root.find('/o')!.setValue((v:unknown) => {seen=v;return v;}); };
    if(batched)root.batch(calls);else calls();
    return seen;
  };
  expect(run(true)).toEqual(run(false));
});

it('a branch Merge uses the earlier coercion when retaining an omitted child', () => {
  const run = (batched:boolean) => {
    const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{o:{type:'object',properties:{n:{type:'number'},s:{type:'string'}}}}},defaultValue:{o:{n:1,s:'old'}},validationMode:ValidationMode.None});
    let seen:unknown;
    const calls=()=>{root.find('/o')!.setValue({n:'2'});root.find('/o')!.setValue({s:'new'},WriteOption.Merge);root.find('/o')!.setValue((v:unknown)=>{seen=v;return v;});};
    if(batched)root.batch(calls);else calls();
    return {seen,value:root.value};
  };
  expect(run(true)).toEqual(run(false));
});
