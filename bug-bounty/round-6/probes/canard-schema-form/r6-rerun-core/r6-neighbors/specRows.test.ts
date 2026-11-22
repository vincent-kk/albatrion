import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form';
import { WriteOption } from '@/schema-form/core/engine/types/value';

/** Independent round-five specification checks; expectations are authored from FIXES.md rows. */
const create = (jsonSchema: any, defaultValue: any) => nodeFromJSONSchema({ jsonSchema, defaultValue, validationMode: ValidationMode.None });

it('virtual tuples keep two absent positions, defaults and the last position through reset', () => {
  const r = create({type:'object', properties:{on:{type:'boolean'},a:{type:'string',default:'A',controls:{active:'/on === true'}},b:{type:'string',default:'B',controls:{active:'/on === true'}},c:{type:'string',default:'C'}},options:{virtual:{g:{fields:['a','b','c']}}}}, {on:true,a:'a0',b:'b0',c:'c0'});
  const g=r.find('/g')!;
  r.find('/a')!.setValue('edited-a');r.find('/b')!.setValue('edited-b');r.find('/on')!.setValue(false);
  expect(g.value).toEqual([undefined,undefined,'c0']);
  expect(g.defaultValue).toEqual(['a0','b0','c0']);
  r.batch(()=>{g.resetSubtree();r.find('/c')!.setValue('c1');});
  r.find('/on')!.setValue(true);
  expect(r.value).toEqual({on:true,a:'a0',b:'b0',c:'c1'});
});

it('virtual tuple identity updaters read typed earlier marks even with an absent middle constituent', () => {
  for(const mode of ['plain','batch','nested']) {
    const r=create({type:'object',properties:{on:{type:'boolean'},a:{type:'number'},b:{type:'string',controls:{active:'/on === true'}},c:{type:'number'}},options:{virtual:{g:{fields:['a','b','c']}}}}, {on:false,a:1,c:3});
    const seen:unknown[]=[];
    const call=()=>{r.find('/a')!.setValue('7');r.find('/g')!.setValue((v:any)=>{seen.push(v);return [v[0]*2,v[1],v[2]];});};
    if(mode==='plain')call();else if(mode==='batch')r.batch(call);else r.batch(()=>r.batch(call));
    expect(seen,mode).toEqual([[7,undefined,3]]);expect(r.value,mode).toEqual({on:false,a:14,c:3});
  }
});

it('batch reactions observe only the final caller number while updaters see each typed mark', () => {
  const seen:number[]=[];
  const r=create({type:'object',properties:{n:{type:'number',controls:{injectTo:(v:any)=>{seen.push(v);return {'../d':v*2};}}},d:{type:'number'}}},{n:1});
  seen.length=0;
  r.batch(()=>{r.find('/n')!.setValue('2');r.find('/n')!.setValue((v:any)=>v+1);});
  expect(r.value).toEqual({n:3,d:6});expect(seen).toEqual([3]);
});

it('array structure closes a batch segment and later writes settle once at the outer boundary', () => {
  const seen:number[]=[];
  const r=create({type:'object',properties:{n:{type:'number',controls:{injectTo:(v:any)=>{seen.push(v);return {'../d':v*2};}}},d:{type:'number'},list:{type:'array',items:{type:'string'}}}},{n:1,list:['a']});
  seen.length=0;
  r.batch(()=>{r.find('/n')!.setValue(2);(r.find('/list') as any).push('b');r.find('/n')!.setValue(3);});
  expect(r.value).toEqual({n:3,d:6,list:['a','b']});expect(seen).toEqual([2,3]);
});

it('the two ranked retention rows also hold for a nested object under a virtual parent address', () => {
  for(const reverse of [false,true])for(const target of ['object','virtual'])for(const mode of ['merge','batch','nested']) {
    const whole=target==='object'?{'../o/n':{z:'hz'}}:{'../g':[{n:{z:'hz'}}]};
    const key={'../o/n/y':'low'};
    const r=create({type:'object',options:{virtual:{g:{fields:['o']}}},properties:{on:{type:'boolean'},src:{type:'string',controls:{injectTo:(v:any)=>v?Object.assign({},...(reverse?[whole,key]:[key,whole])):{}}},o:{type:'object',controls:{active:'/on === true'},properties:{n:{type:'object',properties:{y:{type:'string'},z:{type:'string'}}}}}}},{on:true,o:{n:{y:'y0',z:'z0'}}});
    const apply=()=>{r.find('/on')!.setValue(false);r.find('/src')!.setValue('s');};
    if(mode==='merge')r.setValue({on:false,src:'s'},WriteOption.Merge);else if(mode==='batch')r.batch(apply);else r.batch(()=>r.batch(apply));
    const retained=Object.fromEntries(r.inactiveValues.map(({path,value})=>[path,value]));
    expect(retained,`${reverse}/${target}/${mode}`).toEqual(reverse?{'/o/n/y':'low','/o/n/z':'hz'}:{'/o/n/z':'hz'});
  }
});
