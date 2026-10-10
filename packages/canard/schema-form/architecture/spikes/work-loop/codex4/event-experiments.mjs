/** Loaded by run.mjs; assertions distinguish dispatcher guarantees from policy gaps. */
import assert from 'node:assert/strict';
import { Dispatcher } from './Dispatcher.mjs';

export function eventExperiments(record) {
  {
    const d = new Dispatcher(), observations = [];
    const root = d.add('root', 0, 0), child = d.add('child', 0, 1), signalB = d.add('signalB', 0, 2), signalA = d.add('signalA', 0, 3);
    for (const n of [root, child, signalB, signalA]) n.listeners.push((p, n, signals) => observations.push({ id: n.id, revision: n.revision, payload: p, signals }));
    d.commit({ child: 1, root: 1 }, [{ id: 'signalA', bit: 'Focus' }, { id: 'signalB', bit: 'Select' }, { id: 'signalA', bit: 'Refresh' }]);
    assert.deepEqual(observations.map((x) => x.id), ['root', 'child', 'signalA', 'signalB']); assert(observations.every((x) => x.revision === 1));
    assert.deepEqual(observations[2].signals, ['Focus', 'Refresh']);
    record('B3-order-set-ledger', { observations });
  }
  {
    const d = new Dispatcher(), root = d.add('root', 0, 0), child = d.add('child', 0, 1), log = [];
    root.listeners.push(() => { throw Error('first listener'); }, () => { log.push('root-survivor'); child.attached = false; });
    child.listeners.push(() => log.push('detached-child'));
    d.commit({ root: 1, child: 1 }, [{ id: 'child', bit: 'Focus' }]);
    assert.deepEqual(log, ['root-survivor']); assert.equal(child.revision, 0); assert.deepEqual(d.errors, ['first listener']);
    record('B3-detach-isolate', { delivered: log, errors: d.errors, skipped: d.log, revisions: { root: root.revision, child: child.revision }, pending: d.queue.length });
  }
  {
    const d = new Dispatcher(), root = d.add('root', { local: { n: 0 }, emit: { n: 0 } }, 0), chain = [], returnOrder = [];
    root.listeners.push((p) => {
      chain.push(p);
      if (p.current.emit.n === 1) {
        d.commit({ root: { local: { n: 2 }, emit: { n: 2 } } }); returnOrder.push('write2-return');
        d.commit({ root: { local: { n: 3 }, emit: { n: 3 } } }); returnOrder.push('write3-return');
      } else returnOrder.push(`notify${p.current.emit.n}`);
    });
    d.commit({ root: { local: { n: 1 }, emit: { n: 1 } } }); returnOrder.push('outer-return');
    assert.deepEqual(chain.map((p) => [p.previous.emit.n, p.current.emit.n]), [[0, 1], [1, 2], [2, 3]]);
    assert.deepEqual(returnOrder, ['write2-return', 'write3-return', 'notify2', 'notify3', 'outer-return']);
    record('B4-payload-chain', { chain, returnOrder, policy: 'per-commit FIFO; no coalescing of listener commits' });
  }
  {
    const d = new Dispatcher(), n = d.add('root', 0, 0);
    n.listeners.push((p) => d.commit({ root: p.current + 1 })); d.commit({ root: 1 });
    assert.equal(d.waves, 25); assert.equal(n.value, 26); assert.equal(n.revision, 25); assert.equal(d.queue.length, 1);
    record('B3-unbounded-waves', { writes: 'each payload n commits n+1', deliveredWaves: d.waves, liveValue: n.value, revision: n.revision, pending: d.queue.length, diagnosticStop: true, inference: 'draining pending calls repeats the same recurrence; this stop is instrumentation, not claimed compliant behavior' });
  }
  {
    const d = new Dispatcher(), n = d.add('root', 0, 0);
    n.listeners.push((p) => { if (p.current < 26) d.commit({ root: p.current + 1 }); }); d.commit({ root: 1 });
    const stopped = { delivered: d.waves, pending: d.queue.length, live: n.value };
    d.drain();
    assert.equal(stopped.pending, 1); assert.equal(d.queue.length, 0);
    record('B3-finite-overflow', { stopped, extraDeliveryNeeded: d.waves, totalRequired: stopped.delivered + d.waves, secondDrainIsDiagnostic: true });
  }
  {
    const d = new Dispatcher(), root = d.add('root', 0, 0), child = d.add('child', 0, 1), validationStamps = [], observations = [];
    root.listeners.push((p) => {
      if (p.current === 1) {
        for (const value of [2, 3]) {
          d.commit({ child: value });
          validationStamps.push({ value: child.value, stamp: child.revision });
        }
        observations.push({ live: child.value, revision: child.revision, staleFirstAcceptedByStamp: validationStamps[0].stamp === child.revision });
      }
    });
    d.commit({ root: 1, child: 1 });
    assert.deepEqual(validationStamps.map((x) => x.stamp), [0, 0]);
    record('B3-validation-stamp', { validationStamps, duringListener: observations, finalChildRevision: child.revision, inference: 'a synchronous/custom completion before queued delivery cannot distinguish the two commits by revision; native Promise completion runs later and may instead discard both' });
  }
  {
    const d = new Dispatcher(), n = d.add('root', { n: 0 }, 0), seen = [];
    n.listeners.push((p) => { p.current.n = 99; }, (p) => seen.push(p.current.n));
    d.commit({ root: { n: 1 } });
    assert.deepEqual(seen, [99]); assert.equal(n.value.n, 1);
    record('B4-payload-mutation', { firstListener: 'payload.current.n=99', secondListener: seen[0], live: n.value, limitation: 'same-wave equality requires readonly contract or freezing/cloning per listener, none stated' });
  }
  {
    const d = new Dispatcher(), n = d.add('root', 0, 0), observed = [];
    const late = (p) => observed.push(['late', p.current]);
    n.listeners.push((p) => { observed.push(['early', p.current]); n.listeners.push(late); });
    d.commit({ root: 1 }); d.commit({ root: 2 });
    assert.deepEqual(observed, [['early', 1], ['early', 2], ['late', 2]]);
    record('B3-late-subscription', { observed, interpretation: 'listener array snapshot chosen; B3 fixes nodes but not listener membership' });
  }
  {
    const before = { status: 'stable', sweeps: 2 }, after = { status: 'stable', sweeps: 1 };
    assert.notDeepEqual(before, after);
    record('B4-settle-only', { before, after, valueChanged: false, eventUnderStructuralEquality: 'UpdateSettle', missing: 'whether status-only or entire settle object defines change; outer-round and dispatcher counters have no schema' });
  }
}
