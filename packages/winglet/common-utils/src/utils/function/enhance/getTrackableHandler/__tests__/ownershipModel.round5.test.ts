import { expect, it, vi } from 'vitest';

import { type CallbackPlan, type HookMode, type ModelEvent, TrackableModel } from './helpers/TrackableModel';
import { TrackableSubject } from './helpers/TrackableSubject';

/** Stable seed; every failure includes the complete reproducing event prefix. */
const SEED = 0x5b0a7;

it('matches call-owned publication for thousands of seeded lifecycle event sequences', async () => {
  let random = SEED;
  const modes: HookMode[] = ['none', 'sync', 'async', 'reject', 'throw', 'thenable', 'never'];
  const kinds: ModelEvent['kind'][] = ['before', 'origin', 'throw', 'after', 'update', 'equal', 'empty', 'updateThrow', 'subscribe', 'unsubscribe'];
  for (const before of modes) for (const after of modes) for (const guarded of [true, false]) {
    for (let sequence = 0; sequence < 36; sequence++) {
      const origin = (['async', 'reject', 'throw', 'never'] satisfies import('./helpers/TrackableModel').OriginMode[])[sequence % 4];
      const model = new TrackableModel(guarded, before, after, origin, sequence % 2 === 0);
      const subject = new TrackableSubject(guarded, before, after, origin, sequence % 2 === 0);
      const events: ModelEvent[] = [{ kind: 'subscribe', id: 0 }];
      let nextId = 0;
      for (let step = 0; step < 36; step++) {
        random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
        if (step % 6 === 0) events.push({ kind: 'call', id: nextId++ });
        else events.push({ kind: kinds[random % kinds.length], id: (random >>> 8) % Math.max(nextId, 1) });
      }
      for (let id = 0; id < nextId; id++) for (const kind of ['before', 'origin', 'after'] satisfies ModelEvent['kind'][]) events.push({ kind, id });
      for (let index = 0; index < events.length; index++) {
        const event = events[index];
        model.apply(event);
        await subject.apply(event);
        const diagnostic = JSON.stringify({ seed: SEED, before, after, origin, guarded, sequence, events: events.slice(0, index + 1) });
        expect(subject.notifications, diagnostic).toEqual(model.notifications);
        expect(subject.counts, diagnostic).toEqual(model.counts);
        expect(subject.handler.pending, diagnostic).toBe(model.pending);
        expect(subject.handler.state.value, diagnostic).toBe(model.value);
      }
    }
  }
}, 120000);

it('publishes the same sequence for non-overlapping calls under either admission option', async () => {
  const modes: HookMode[] = ['none', 'sync', 'async'];
  for (const before of modes) for (const after of modes) {
    const subjects = [new TrackableSubject(true, before, after), new TrackableSubject(false, before, after)];
    for (let id = 0; id < 8; id++) {
      const events: ModelEvent[] = [
        { kind: 'subscribe', id: 0 }, { kind: 'call', id }, { kind: 'update', id: id - 1 },
        { kind: 'update', id }, { kind: 'before', id }, { kind: 'update', id },
        { kind: id % 2 ? 'throw' : 'origin', id }, { kind: 'update', id: id - 1 },
        { kind: 'update', id }, { kind: 'after', id }, { kind: 'update', id },
      ];
      for (const subject of subjects) for (const event of events) await subject.apply(event);
      expect(subjects[0].notifications, `${before}/${after}/${id}`).toEqual(subjects[1].notifications);
      expect(subjects[0].counts).toEqual(subjects[1].counts);
    }
  }
});

it('models generated hook, origin, live-listener and timer reentrancy', async () => {
  const modes: HookMode[] = ['none', 'sync', 'async', 'reject', 'throw', 'thenable', 'never'];
  const sites: CallbackPlan['site'][] = ['before', 'origin', 'after', 'publish'];
  let random = SEED;
  vi.stubGlobal('reportError', () => {});
  try {
    for (const before of modes) for (const after of modes) for (const guarded of [true, false]) for (const site of sites) for (let trial = 0; trial < 8; trial++) {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const updates: ModelEvent['kind'][] = ['update', 'equal', 'empty', 'updateThrow'];
      const actions: ModelEvent[] = [
        { kind: updates[random % updates.length], id: [0, 1, 100][trial % 3] },
        { kind: 'unsubscribe', id: 1 }, { kind: 'subscribe', id: 2 }, { kind: 'subscribe', id: 0 },
      ];
      if (trial % 2 === 0) actions.push({ kind: 'call', id: 1000 });
      const callbacks: CallbackPlan[] = [{ site, id: 0, events: actions, throws: trial % 4 === 0 }];
      const origin = trial % 3 === 0 ? 'throw' : trial % 3 === 1 ? 'reject' : 'async';
      const model = new TrackableModel(guarded, before, after, origin, trial % 2 === 0, callbacks);
      const subject = new TrackableSubject(guarded, before, after, origin, trial % 2 === 0, callbacks);
      const events: ModelEvent[] = [
        { kind: 'call', id: 100 }, { kind: 'before', id: 100 }, { kind: 'origin', id: 100 }, { kind: 'after', id: 100 },
        { kind: 'subscribe', id: 0 }, { kind: 'subscribe', id: 1 }, { kind: 'call', id: 0 }, { kind: 'call', id: 1 },
      ];
      for (const id of [0, 1, 1000]) for (const kind of ['update', 'before', 'update', 'origin', 'update', 'after', 'update'] satisfies ModelEvent['kind'][]) events.push({ kind, id });
      for (let index = 0; index < events.length; index++) {
        const event = events[index];
        if (trial % 4 === 1 && event.kind === 'update') {
          await new Promise<void>(resolve => setTimeout(() => { model.apply(event); void subject.apply(event).then(resolve); }, 0));
        } else { model.apply(event); await subject.apply(event); }
        const diagnostic = JSON.stringify({ seed: SEED, before, after, guarded, site, trial, callbacks, events: events.slice(0, index + 1) });
        expect(subject.notifications, diagnostic).toEqual(model.notifications);
        expect(subject.counts, diagnostic).toEqual(model.counts);
        expect(subject.handler.pending, diagnostic).toBe(model.pending);
        expect(subject.handler.state.value, diagnostic).toBe(model.value);
      }
    }
  } finally { vi.unstubAllGlobals(); }
}, 120000);
