/// <reference lib="es2021.weakref" />
// Run from this workspace: node --expose-gc --import tsx <this file> 100|1000.
import { useLayoutEffect, useRef } from 'react';

import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import type { FieldNode } from '@/schema-form/core';

import { useChildFields } from '../hooks/useChildFields';
import type { ChildField } from '../type';

const cycles = Number(process.argv[2] ?? 100);
assert.ok(cycles === 100 || cycles === 1000);
assert.equal(
  typeof global.gc,
  'function',
  'Run this diagnostic with --expose-gc',
);
const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>');
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: dom.window,
});
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: dom.window.document,
});
const parent = nodeFromJSONSchema({
  jsonSchema: { type: 'array', items: { type: 'string' } },
  defaultValue: ['survivor'],
});
const terminal: ChildField[] = [];
const EmptyProxy = () => null;
let current: ChildField[] = [];
let mounted = false;
function Probe({ tick }: { tick: number }) {
  const count = useRef(0);
  [current] = useChildFields(parent, EmptyProxy, count, terminal);
  useLayoutEffect(() => {
    mounted = true;
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <output>
      {tick}:{current.length}
    </output>
  );
}
const root = createRoot(document.getElementById('root')!);
let tick = 0;
const commit = () => flushSync(() => root.render(<Probe tick={tick++} />));
commit();
const survivor = parent.children![0];
const survivorField = current[0];
const removedNodes: WeakRef<FieldNode>[] = [];
const removedFields: WeakRef<ChildField>[] = [];
function cycle() {
  parent.push('transient');
  commit();
  removedNodes.push(new WeakRef(parent.children![1]));
  removedFields.push(new WeakRef(current[1]));
  parent.remove(1);
  commit();
}
for (let index = 0; index < cycles; index++) cycle();
// Extra commits release React's prior memo result; WeakRef keep-alive ends at the next task.
commit();
commit();
await setImmediate();
for (let index = 0; index < 12; index++) {
  const pressure = Array.from(
    { length: 4 },
    () => new Uint8Array(4 * 1024 * 1024),
  );
  global.gc!();
  assert.equal(pressure.length, 4);
  await setImmediate();
}
assert.equal(mounted, true);
assert.equal(parent.children![0], survivor);
assert.equal(current[0], survivorField);
assert.equal(current[0].key, '0');
assert.equal(parent.children!.length, 1);
console.log(
  JSON.stringify({
    cycles,
    removedNodesAlive: removedNodes.filter((ref) => ref.deref() !== undefined)
      .length,
    removedFieldsAlive: removedFields.filter((ref) => ref.deref() !== undefined)
      .length,
    parentStillMounted: mounted,
    liveSurvivorKey: current[0].key,
  }),
);
flushSync(() => root.unmount());
dom.window.close();
