import {expect,it} from 'vitest';
import {nodeFromJSONSchema} from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {ValidationMode} from '@/schema-form/core/engine/types/state';
import {WriteOption} from '@/schema-form/core/engine/types/value';

it.each([false,true])('a refused reset retains partial overlap after a caught updater failure, nested=%s',(nested)=>{
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{
    on:{type:'boolean'},other:{type:'string'},
    o:{type:'object',properties:{n:{type:'object',controls:{active:'/on === true'},properties:{x:{type:'string'},y:{type:'string'}}}}},
  }},defaultValue:{on:true,other:'old',o:{n:{x:'x0',y:'y0'}}},validationMode:ValidationMode.None});
  const n=root.find('/o/n')!;
  const apply=()=>{
    n.setValue({x:'earlyX',y:'earlyY'});
    root.setValue({on:false,o:{n:{x:'lateX'}}},WriteOption.Merge);
    n.resetSubtree();
    try{root.find('/other')!.setValue(()=>{throw new Error('caught');});}catch{}
    root.find('/other')!.setValue('continued');
  };
  root.batch(()=>nested?root.batch(apply):apply());
  expect(root.find('/o/n')).toBeNull();
  expect(Object.fromEntries(root.inactiveValues.map(({path,value})=>[path,value]))).toEqual({'/o/n/x':'lateX','/o/n/y':'earlyY'});
  expect(root.find('/other')!.value).toBe('continued');
});
