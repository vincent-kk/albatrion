import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTrackableHandler } from '../getTrackableHandler';

describe('round-3 lifecycle failures', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('completion errors reach the host without hiding later subscribers or the result', async () => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const error = new Error('listener');
    const handler = getTrackableHandler(async () => 'done');
    const reference = getTrackableHandler(async () => 'done');
    const referenceSeen: boolean[] = [];
    reference.subscribe(() => { referenceSeen.push(reference.pending); });
    handler.subscribe(() => { if (!handler.pending) throw error; });
    const seen: boolean[] = [];
    handler.subscribe(() => { seen.push(handler.pending); });
    const [actual, expected] = await Promise.all([handler(), reference()]);
    expect(actual).toBe(expected);
    expect(seen).toEqual(referenceSeen);
    expect(seen).toEqual([true,false]); expect(report).toHaveBeenCalledWith(error);
  });

  it('start errors still reject after every subscriber is notified', async () => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const error = new Error('start'); const seen: boolean[] = [];
    const handler = getTrackableHandler(async () => 1);
    handler.subscribe(() => { if (handler.pending) throw error; });
    handler.subscribe(() => { seen.push(handler.pending); });
    await expect(handler()).rejects.toBe(error);
    expect(seen).toEqual([true,false]); expect(handler.pending).toBe(false);
  });

  it('beforeExecute cannot reenter the guarded handler', async () => {
    let reentered = false;
    const origin = vi.fn(async () => 1);
    const handler = getTrackableHandler(origin,{beforeExecute:()=>{ if(!reentered){reentered=true;void handler();} }});
    await handler(); expect(origin).toHaveBeenCalledTimes(1);
  });

  it.each(['beforeExecute','afterExecute'] as const)('%s rejection behaves like a synchronous throw', async position => {
    const error = new Error('hook');
    const rejected = Promise.reject(error); void rejected.catch(() => {});
    const origin = vi.fn(async () => 1);
    const handler = getTrackableHandler(origin,{[position]:()=>rejected});
    const synchronous = getTrackableHandler(async () => 1, { [position]: () => { throw error; } });
    const referenceError = await synchronous().catch((reason: unknown) => reason);
    await expect(handler()).rejects.toBe(referenceError);
    expect(origin).toHaveBeenCalledTimes(position==='beforeExecute'?0:1);
    expect(handler.pending).toBe(false);
  });

  it.each(['beforeExecute','afterExecute'] as const)('%s stays pending while its promise does not settle', async position => {
    const origin = vi.fn(async () => 1);
    const handler = getTrackableHandler(origin,{[position]:()=>new Promise<void>(()=>{})});
    let settled = false; void handler().then(()=>{settled=true;});
    for(let i=0;i<5;i++) await Promise.resolve();
    expect(settled).toBe(false);
    if(position==='beforeExecute') expect(origin).not.toHaveBeenCalled();
  });
  it.each(['beforeExecute','afterExecute'] as const)('%s resolved async updates are folded into the lifecycle notification', async position => {
    const snapshots: number[] = [];
    const handler = getTrackableHandler(async () => 1, {initialState:{count:0},[position]:async (_args: [], manager: { update: (value: {count:number}) => void }) => {
      manager.update({count:1}); await Promise.resolve(); manager.update({count:2});
    }});
    handler.subscribe(()=>{snapshots.push(handler.state.count);});
    await expect(handler()).resolves.toBe(1);
    expect(snapshots).toEqual(position==='beforeExecute'?[2,2]:[0,2]);
  });

  it.each([true,false])('same-tick calls preserve preventConcurrent=%s while a hook waits', async preventConcurrent => {
    let release!: () => void;
    const wait = new Promise<void>(resolve=>{release=resolve;});
    const origin = vi.fn(async()=>1);
    const handler = getTrackableHandler(origin,{preventConcurrent,beforeExecute:()=>wait});
    const calls = [handler(),handler()];
    expect(origin).not.toHaveBeenCalled();
    expect(handler.pending).toBe(true);
    release(); await Promise.all(calls);
    expect(origin).toHaveBeenCalledTimes(preventConcurrent?1:2);
    expect(handler.pending).toBe(false);
  });

  it('an afterExecute reentry is guarded until hook settlement', async () => {
    const origin = vi.fn(async()=>1); let reentered=false;
    const handler = getTrackableHandler(origin,{afterExecute:()=>{if(!reentered){reentered=true;void handler();}}});
    await handler(); expect(origin).toHaveBeenCalledTimes(1);
  });

  it.each(['beforeExecute','afterExecute'] as const)('%s treats thenables like native promises and ordinary returns synchronously', async position => {
    const error = new Error('thenable');
    const rejection = Promise.reject(error); void rejection.catch(() => {});
    const thenable = { then(_resolve: unknown, reject: (reason: unknown) => void) { reject(error); } };
    const native = getTrackableHandler(async()=>1,{[position]:()=>rejection});
    const other = getTrackableHandler(async()=>1,{[position]:()=>thenable});
    expect(await other().catch((reason: unknown)=>reason)).toBe(await native().catch((reason: unknown)=>reason));
    for (const returned of [undefined,null,false,0,{then:1}]) {
      const origin = vi.fn(async()=>1);
      const sync = getTrackableHandler(origin,{[position]:()=>returned});
      const pending = sync(); expect(origin).toHaveBeenCalledTimes(1);
      await expect(pending).resolves.toBe(1);
    }
  });

  it('a completion subscriber can start a synchronously throwing call without replacing the first result', async () => {
    const error = new Error('second'); let calls = 0; let reentered = false;
    let second: Promise<unknown> | undefined;
    const handler = getTrackableHandler(() => { if (++calls === 2) throw error; return Promise.resolve('first'); }, { beforeExecute:()=>{}, afterExecute:()=>{} });
    handler.subscribe(()=>{ if(!handler.pending&&!reentered){reentered=true;second=handler().catch((reason: unknown)=>reason);} });
    await expect(handler()).resolves.toBe('first');
    expect(await second).toBe(error);
  });

});
