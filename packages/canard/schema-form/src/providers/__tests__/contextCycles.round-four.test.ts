import { expect, it } from 'vitest';
import { areContextsEqual } from '../hooks/contextSnapshot/utils/areContextsEqual';

it.each(['object','array','map'] as const)('cyclic %s contexts keep the corresponding tree comparison result',kind=>{
  const reads={count:0};
  const make=(value:number):object=>{
    const node=kind==='array'?[value]:{value};
    const root=kind==='map'?new Map([['entry',node]]):node;
    Object.defineProperty(node,kind==='array'?'1':'next',{enumerable:true,get(){
      if(++reads.count>1000)throw new Error('comparison revisited a cycle without terminating');
      return root;
    }});
    return root;
  };
  expect(areContextsEqual(make(1),make(1))).toBe(areContextsEqual({value:1},{value:1}));
  expect(areContextsEqual(make(1),make(2))).toBe(areContextsEqual({value:1},{value:2}));
  expect(reads.count).toBeLessThan(100);
});
