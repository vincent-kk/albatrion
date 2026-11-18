import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTrackableHandler } from '../getTrackableHandler';

describe('round-3 lifecycle failures', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('completion errors reach the host without hiding later subscribers or the result', async () => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const error = new Error('listener');
    const handler = getTrackableHandler(async () => 'done');
    handler.subscribe(() => { if (!handler.pending) throw error; });
    const seen: boolean[] = [];
    handler.subscribe(() => { seen.push(handler.pending); });
    await expect(handler()).resolves.toBe('done');
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
    await expect(handler()).rejects.toBe(error);
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

});
