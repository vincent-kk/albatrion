import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

it.each(['inactive', 'leaving', 'revived'] as const)('derived and injectTo agree for a %s child address', (state) => {
  const observe=(derived:boolean)=>{
    const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{
      on:{type:'boolean'},
      src:{type:'object',options:{terminal:true},...(derived?{}:{controls:{injectTo:(value:unknown)=>({'../o':value})}})},
      o:{type:'object',...(derived?{controls:{derived:'/src'}}:{}),properties:{y:{type:'string',controls:{active:'/on === true'}},z:{type:'string'}}},
      ...(state==='revived'?{reopen:{type:'string',controls:{injectTo:(v:unknown)=>v?{'../on':true}:{}}}}:{}),
    }},defaultValue:{on:state!=='inactive',src:{y:'old',z:'old'},o:{y:'old',z:'old'}},validationMode:ValidationMode.None});
    root.batch(()=>{
      if(state!=='inactive')root.find('/on')!.setValue(false);
      root.find('/src')!.setValue({y:'new',z:'new'});
      if(state==='revived')root.find('/reopen')!.setValue('yes');
    });
    return {o:root.find('/o')!.value,retained:root.inactiveValues.map(({path,value})=>({path,value}))};
  };
  expect(observe(true)).toEqual(observe(false));
});

it.each(['schema default','controls default'] as const)('a transient %s fill does not acquire retention rights', (fill) => {
  const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{
    on:{type:'boolean'},
    src:{type:'string',controls:{injectTo:(v:unknown)=>v?{'../on':true}:{}}},
    o:{type:'object',controls:{active:'/on === true'},properties:{
      y:{type:'string',...(fill==='schema default'?{default:'filled'}:fill==='controls default'?{controls:{default:'filled'}}:{})},
    }},
    end:{type:'string',controls:{derived:'/o/y === "filled" ? "close" : /end',injectTo:(v:unknown)=>v==='close'?{'../on':false}:{}}},
  }},defaultValue:{on:false},validationMode:ValidationMode.None});
  root.find('/src')!.setValue('run');
  expect(root.find('/on')!.value).toBe(false);
  expect(root.inactiveValues.map(({path,value})=>({path,value}))).toEqual([]);
});
