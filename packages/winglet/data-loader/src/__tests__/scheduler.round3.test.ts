import { describe, expect, it } from 'vitest';
import { DataLoader } from '../DataLoader';

const TIMEOUT = Symbol('pending');
/** Observes a load without allowing a stalled scheduler to stall the test. */
const observe = async (load: () => Promise<number>) => {
  try {
    return await Promise.race([load(), new Promise<typeof TIMEOUT>(resolve => setTimeout(()=>resolve(TIMEOUT),30))]);
  } catch (error) { return error; }
};

/** Browser operations accept an absent or global receiver, never a loader instance. */
function browserScheduler(this: unknown, task: () => void) {
  if (this != null && this !== globalThis) throw new TypeError('Illegal invocation');
  queueMicrotask(task);
}

describe('round-3 scheduler equivalence', () => {
  it('a bare receiver-checked scheduler behaves like an arrow wrapper', async () => {
    const bare = new DataLoader<number,number>(async keys=>keys.map(key=>key*10),{batchScheduler:browserScheduler});
    const wrapped = new DataLoader<number,number>(async keys=>keys.map(key=>key*10),{batchScheduler:task=>browserScheduler(task)});
    for (const key of [1,2,1]) expect(await observe(()=>bare.load(key))).toEqual(await observe(()=>wrapped.load(key)));
  });

  it('retries after a throwing scheduler like a fresh loader', async () => {
    let first = true;
    const loader = new DataLoader<number,number>(async keys=>keys.map(key=>key*10),{batchScheduler:task=>{if(first){first=false;throw new Error('scheduler');}queueMicrotask(task);}});
    const reference = new DataLoader<number,number>(async keys=>keys.map(key=>key*10),{batchScheduler:queueMicrotask});
    expect(()=>loader.load(1)).toThrow('scheduler');
    for(const key of [2,1,2]) expect(await observe(()=>loader.load(key))).toEqual(await observe(()=>reference.load(key)));
  });
});
