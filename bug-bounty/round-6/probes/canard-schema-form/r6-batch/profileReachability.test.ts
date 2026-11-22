import { expect, it, vi } from 'vitest';

const counts=vi.hoisted(()=>{
  process.env.SCHEMA_FORM_TEST_PROFILE='pr';
  return [] as number[];
});

vi.mock('@/schema-form/__tests__/fixtures/nodeFromJSONSchema',async(importOriginal)=>{
  const original=await importOriginal<typeof import('@/schema-form/__tests__/fixtures/nodeFromJSONSchema')>();
  return {...original,nodeFromJSONSchema:(props:Parameters<typeof original.nodeFromJSONSchema>[0])=>{
    const schema=props.jsonSchema as {options?:{virtual?:{group?:{fields:readonly string[]}}}};
    const fields=schema.options?.virtual?.group?.fields;
    if(fields)counts.push(fields.length);
    return original.nodeFromJSONSchema(props);
  }};
});

import '@/schema-form/core/engine/__tests__/virtualStorageModel.round-five.test';

it('the PR profile constructs the zero-constituent group its class list names',()=>{
  expect(counts.length).toBeGreaterThan(0);
  expect([...new Set(counts)].sort()).toEqual([0,1,2,3,4,5]);
});
