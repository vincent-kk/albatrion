import { expect, it, vi } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it.each([null, {}, ['short'], ['too', 'many', 'slots']])('invalid virtual input %j is rejected before storage changes', input => {
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'},b:{type:'string'}},options:{virtual:{group:{fields:['a','b']}}}},defaultValue:{a:'a',b:'b'},validationMode:ValidationMode.None});
  const before=root.value; expect(()=>root.find('/group')!.setValue(input)).toThrow();expect(root.value).toBe(before);
});
it('undefined and sparse slots clear an active invisible constituent',()=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string',controls:{visible:false}},b:{type:'string'}},options:{virtual:{group:{fields:['a','b']}}}},defaultValue:{a:'a',b:'b'},validationMode:ValidationMode.None});
  root.find('/group')!.setValue([,'tail']);expect(root.value).toEqual({b:'tail'});root.find('/group')!.setValue(undefined);expect(root.value).toEqual({});
});
it.each([false,true])('virtual object Merge preserves the ordinary partial-write contract (batch=%s)', batch=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{on:{type:'boolean'},outside:{type:'string'},obj:{type:'object',properties:{a:{type:'string'},b:{type:'string',controls:{active:'../../on === true'}}}}},options:{virtual:{group:{fields:['obj']}}}},defaultValue:{on:true,outside:'outside',obj:{a:'a',b:'b'}},validationMode:ValidationMode.None});
  root.find('/on')!.setValue(false);
  const run=()=>{root.find('/group')!.setValue([{a:'edit'}],WriteOption.Merge);root.find('/outside')!.setValue('outside');};
  if(batch)root.batch(run);else run();root.find('/on')!.setValue(true);expect(root.value).toEqual({on:true,outside:'outside',obj:{a:'edit',b:'b'}});
});
it('nested virtual names and duplicate fields reject while empty fields stay empty',()=>{
  for(const fields of [['a','a'],['first']])expect(()=>nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'}},options:{virtual:{first:{fields:['a']},second:{fields}}}},validationMode:ValidationMode.None})).toThrow();
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'}},options:{virtual:{empty:{fields:[]}}}},defaultValue:{a:'a'},validationMode:ValidationMode.None});root.find('/empty')!.setValue([]);root.find('/empty')!.resetSubtree();expect(root.find('/empty')!.value).toEqual([]);expect(root.value).toEqual({a:'a'});
});
it('virtual output paths stay absent to expressions and parent JSON writes',()=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'},seen:{type:'boolean',controls:{derived:'../group === undefined'}}},options:{virtual:{group:{fields:['a']}}}},defaultValue:{a:'a'},validationMode:ValidationMode.None});expect(root.find('/seen')!.value).toBe(true);expect(root.find('/group')!.outputValue).toBeUndefined();root.setValue({group:['ignored']});expect(root.value).toEqual({});
});
it('external errors and subtree interaction keep their distinct node scopes',()=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'},b:{type:'string',controls:{active:false}},outside:{type:'string'}},options:{virtual:{group:{fields:['a','b']}}}},validationMode:ValidationMode.None});
  const group=root.find('/group')!;group.setExternalErrors([{dataPath:'/group',keyword:'external'}]);expect(group.errors.map(e=>e.keyword)).toEqual(['external']);expect(root.find('/a')!.errors).toEqual([]);group.clearExternalErrors();expect(group.errors).toEqual([]);group.setSubtreeState({touched:true});expect(root.find('/a')!.state).toEqual({touched:true});expect(root.find('/outside')!.state).toEqual({});group.clearSubtreeState();expect(root.find('/a')!.state).toEqual({});
});
it('validation keeps inactive issues global without moving them to tuple neighbours',async()=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'},b:{type:'string',controls:{active:false}}},options:{virtual:{group:{fields:['a','b']}}}},validationMode:ValidationMode.OnRequest,validator:{compile:()=>()=>[{dataPath:'/b',keyword:'required'}],compileGuard:()=>()=>true}});const group=root.find('/group')!;await group.validate();expect(root.globalErrors.map(e=>e.dataPath)).toEqual(['/b']);expect(group.errors).toEqual([]);expect(root.find('/a')!.errors).toEqual([]);
});
it('same-value tuples produce no new output callback or validator request',async()=>{
  const changed=vi.fn(),validate=vi.fn(()=>[]);const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{n:{type:'number'}},options:{virtual:{group:{fields:['n']}}}},defaultValue:{n:NaN},validationMode:ValidationMode.OnChange,onChange:changed,validator:{compile:()=>validate,compileGuard:()=>()=>true}});await root.validate();changed.mockClear();validate.mockClear();const group=root.find('/group')!;group.setValue([NaN]);await Promise.resolve();expect(changed).not.toHaveBeenCalled();expect(validate).not.toHaveBeenCalled();
});

it('virtual gate detachment does not detach its borrowed constituents',()=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{on:{type:'boolean'},a:{type:'string'}},options:{virtual:{group:{fields:['a'],controls:{active:'../on === true'}}}}},defaultValue:{on:true,a:'a'},validationMode:ValidationMode.None,errorReporter:{hasConsumer:()=>true,report:()=>{}}});
  const field=root.find('/a'), group=root.find('/group')!;root.find('/on')!.setValue(false);group.setValue(['detached']);group.resetSubtree();expect(root.find('/a')).toBe(field);expect(root.value).toEqual({on:false,a:'a'});root.find('/on')!.setValue(true);expect(root.find('/group')!.value).toEqual(['a']);
});
it.each(['default','derived'] as const)('virtual %s writes preserve the physical shape', control=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{a:{type:'string'}},options:{virtual:{group:{fields:['a'],controls:control==='default'?{default:['fallback']}:{derived:'["derived"]'}}}}},validationMode:ValidationMode.None});
  expect(root.value).toEqual({a:control==='default'?'fallback':'derived'});
});
