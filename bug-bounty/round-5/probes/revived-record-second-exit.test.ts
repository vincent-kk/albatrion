import {it,expect,afterAll} from 'vitest';
import {nodeFromJSONSchema} from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {ValidationMode} from '../types/state';
import {WriteOption} from '../types/value';
import {writeFileSync} from 'node:fs';
const rows:any[]=[];
const inject=(path:string,value:any)=>({type:'string',controls:{injectTo:(s:any)=>s?{[path]:value}:{}}});
it('a recorded write survives revival and a second exit',()=>{
 for(const mode of ['merge','batch','nested'])for(const whole of [false,true]){
 const errors:any[]=[];
 const schema:any={type:'object',properties:{on:{type:'boolean'},src:inject(whole?'../o':'../o/y',whole?{y:'new'}:'new'),o:{type:'object',controls:{active:'/on === true'},properties:{y:{type:'string'}}},reopen:inject('../on',true),closeAgain:{type:'string',controls:{derived:'/o/y === "new" ? "closed" : /closeAgain',injectTo:(v:any)=>v==='closed'?{'../on':false}:{}}}}};
 const r=nodeFromJSONSchema({jsonSchema:schema,defaultValue:{on:true,o:{y:'y0'}},validationMode:ValidationMode.None,errorReporter:{hasConsumer:()=>true,report:(e:any)=>errors.push(String(e))}});
 const val={on:false,src:'s',reopen:'r'}; const f=()=>Object.entries(val).forEach(([k,v])=>r.find('/'+k)!.setValue(v));
 if(mode==='merge')r.setValue(val,WriteOption.Merge);else if(mode==='batch')r.batch(f);else r.batch(()=>r.batch(f));
 rows.push({mode,whole,value:r.value,retained:Object.fromEntries(r.inactiveValues.map(({path,value})=>[path,value])),errors});
 }
 for(const row of rows)expect(row.retained,JSON.stringify(row)).toEqual({'/o/y':'new'});
});
afterAll(()=>writeFileSync('/tmp/bb5-form2-confirm2/second-exit.json',JSON.stringify(rows,null,2)));
