import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it.each([undefined,null])('a virtual Merge replacing a nested branch with %s has the same retained scope in a batch', value=>{
  const run=(batch:boolean)=>{
    const root=nodeFromJSONSchema({jsonSchema:{type:'object',properties:{on:{type:'boolean'},outside:{type:'string'},obj:{type:'object',properties:{branch:{type:['object','null'],properties:{kept:{type:'string',controls:{active:'../../../on === true'}}}}}}},options:{virtual:{group:{fields:['obj']}}}},defaultValue:{on:true,outside:'outside',obj:{branch:{kept:'retained'}}},validationMode:ValidationMode.None});
    root.find('/on')!.setValue(false);
    const write=()=>{root.find('/group')!.setValue([{branch:value}],WriteOption.Merge);root.find('/outside')!.setValue('outside');};
    if(batch)root.batch(write);else write();
    root.find('/on')!.setValue(true);
    return {value:root.value,retained:root.inactiveValues};
  };
  expect(run(true)).toEqual(run(false));
});
