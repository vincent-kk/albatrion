import { expect, it } from 'vitest';

import { type HookMode, type ModelEvent, TrackableModel } from './helpers/TrackableModel';
import { TrackableSubject } from './helpers/TrackableSubject';

/** Stable seed; every failure includes the complete reproducing event prefix. */
const SEED = 0x5b0a7;

it('matches call-owned publication for thousands of seeded lifecycle event sequences', async () => {
  let random = SEED;
  const modes: HookMode[] = ['none', 'sync', 'async'];
  const kinds: ModelEvent['kind'][] = ['before', 'origin', 'throw', 'after', 'update', 'subscribe', 'unsubscribe'];
  for (const before of modes) for (const after of modes) for (const guarded of [true, false]) {
    for (let sequence = 0; sequence < 180; sequence++) {
      const model = new TrackableModel(guarded, before, after);
      const subject = new TrackableSubject(guarded, before, after);
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
        const diagnostic = JSON.stringify({ seed: SEED, before, after, guarded, sequence, events: events.slice(0, index + 1) });
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
