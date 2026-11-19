import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

it.each(['native', 'message-channel'])('pins the %s host ordering against microtasks and timers', mode => {
  const scheduler = new URL('../scheduleMacrotask.ts', import.meta.url).href;
  const cleanup = new URL('../MessageChannelScheduler/handler.ts', import.meta.url).href;
  const script = `
    import assert from 'node:assert/strict';
    import {readFile} from 'node:fs';
    const nativeImmediate = globalThis.setImmediate;
    const fallback = ${JSON.stringify(mode)} === 'message-channel';
    if (fallback) {
      globalThis.setImmediate = undefined;
      globalThis.clearImmediate = undefined;
    }
    const {scheduleMacrotask} = await import(${JSON.stringify(scheduler)});
    const {destroyGlobalScheduler} = await import(${JSON.stringify(cleanup)});
    const events = [];
    await new Promise((resolve, reject) => readFile(new URL(${JSON.stringify(scheduler)}), error => {
      if (error) { reject(error); return; }
      events.push('sync');
      Promise.resolve().then(() => events.push('promise'));
      queueMicrotask(() => events.push('microtask'));
      nativeImmediate(() => events.push('immediate-before'));
      scheduleMacrotask(() => {
        events.push('first');
        queueMicrotask(() => events.push('nested-microtask'));
        scheduleMacrotask(() => events.push('nested-task'));
      });
      scheduleMacrotask(() => events.push('second'));
      nativeImmediate(() => events.push('immediate-after'));
      setTimeout(() => events.push('timer'), 0);
      setTimeout(resolve, 30);
    }));
    destroyGlobalScheduler();
    const position = label => {
      assert.equal(events.filter(event => event === label).length, 1, label);
      return events.indexOf(label);
    };
    for (const task of ['first', 'second', 'timer', 'immediate-before', 'immediate-after']) {
      assert.ok(position('sync') < position(task));
      assert.ok(position('promise') < position(task));
      assert.ok(position('microtask') < position(task));
    }
    assert.ok(position('first') < position('second'));
    assert.ok(position('second') < position('nested-task'));
    assert.ok(position('nested-microtask') < position('nested-task'));
    if (fallback) {
      assert.ok(position('second') < position('nested-microtask'));
    } else {
      assert.ok(position('immediate-before') < position('first'));
      assert.ok(position('nested-microtask') < position('second'));
      assert.ok(position('second') < position('immediate-after'));
      assert.ok(position('immediate-after') < position('timer'));
    }
  `;
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', script], { timeout: 5000 });
  expect(result.status, result.error?.message ?? result.stderr.toString()).toBe(0);
});
