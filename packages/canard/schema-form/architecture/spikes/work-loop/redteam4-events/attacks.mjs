/**
 * Pure-model attacks on round-4-spec.md §B (no React). Run:
 *   node attacks.mjs
 * Each block prints `## <item>` then the executed input/output.
 */
import { EV, Root, WAVE_CAP, flat, order } from './model.mjs';

const log = (...a) => console.log(...a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))));

// ---------------------------------------------------------------------------
log('## B3-1 order sanity: write leaf f2 → delivery order');
{
  const r = flat(3);
  const seen = [];
  for (const n of [r, ...r.children]) n.subscribe((e) => seen.push(`${n.path || '/'}#w${e.wave}`));
  r.children[2].setValue('x');
  log({ preorder: order(r), delivered: seen });
}

// ---------------------------------------------------------------------------
log('\n## 2. B3-4 ping-pong: A-listener writes B, B-listener writes A, every wave');
for (const capPolicy of ['deliver-last', 'drop']) {
  const r = flat(3, { capPolicy });
  const [A, B, C] = r.children;
  let calls = 0;
  A.subscribe(() => {
    calls++;
    B.setValue((B.value ?? 0) + 1);
  });
  B.subscribe(() => {
    calls++;
    A.setValue((A.value ?? 0) + 1);
    if (r.waveCount === WAVE_CAP + 1) C.setValue('written-only-in-last-wave');
  });
  let thrown = null;
  try {
    r.batch(() => {
      A.setValue(1);
      B.setValue(1);
    });
  } catch (e) {
    thrown = e;
  }
  log({
    capPolicy,
    waves: r.waveCount,
    listenerCalls: calls,
    A: A.value,
    B: B.value,
    C: C.value,
    revA: A.revision(EV.UpdateValue),
    revB: B.revision(EV.UpdateValue),
    revC: C.revision(EV.UpdateValue),
    settle: r.settle,
    capped: r.capped,
    thrown: thrown?.message ?? null,
  });
}

// ---------------------------------------------------------------------------
log('\n## 4. B3-5 detach during wave + unsubscribe during wave');
{
  const r = new Root();
  const arr = r.add('arr', true);
  const i0 = arr.add('0');
  const i1 = arr.add('1');
  r.flush();
  const seen = [];
  i0.subscribe(() => {
    seen.push('i0');
    arr.remove(i1); // i1 is already in the fixed wave set
  });
  i1.subscribe(() => seen.push('i1'));
  arr.subscribe((e) => seen.push(`arr#w${e.wave}`));
  r.batch(() => {
    i0.setValue('a');
    i1.setValue('b');
  });
  log({
    seen,
    trace: r.trace.filter((t) => t[0] === 'skip-detached'),
    i1Detached: i1.detached,
    i1Rev: i1.revision(EV.UpdateValue),
    i1Value: i1.value,
    arrValue: arr.value,
    waves: r.waveCount,
  });

  // unsubscribe of a sibling listener during delivery of the same node
  const r2 = flat(1);
  const n = r2.children[0];
  const seen2 = [];
  let unsub2;
  n.subscribe(() => {
    seen2.push('L1');
    unsub2();
  });
  unsub2 = n.subscribe(() => seen2.push('L2'));
  n.setValue(1);
  log({ unsubscribeDuringWave: seen2, note: 'Set iteration: L2 skipped when deleted before visit' });

  // subscribe during delivery of the same node
  const r3 = flat(1);
  const m = r3.children[0];
  const seen3 = [];
  m.subscribe(() => {
    seen3.push('L1');
    m.subscribe(() => seen3.push('L-late'));
  });
  m.setValue(1);
  log({ subscribeDuringWave: seen3, note: 'Set iteration visits a listener added during iteration' });
}

// ---------------------------------------------------------------------------
log('\n## 5. B4 payload chain across waves');
for (const payloadMerge of ['last', 'span']) {
  const r = flat(2, { payloadMerge });
  const [X, Y] = r.children;
  const chain = [];
  X.subscribe((e) => {
    chain.push([e.payload.previous, e.payload.current]);
    if (e.wave === 1) X.setValue(10); // L1: one write
  });
  X.subscribe((e) => {
    if (e.wave === 1) X.setValue(11); // L2: second write, same wave, same node
  });
  Y.subscribe(() => {});
  X.setValue(1);
  const valid = chain.every(([, c], i) => i === chain.length - 1 || c === chain[i + 1][0]);
  log({ payloadMerge, chain, validChain: valid, commits: r.commitCount, waves: r.waveCount });
}
{
  const r = flat(1);
  const X = r.children[0];
  const chain = [];
  X.subscribe((e) => chain.push([e.payload.previous, e.payload.current]));
  r.batch(() => {
    X.setValue(1);
    X.setValue(2);
    X.setValue(3);
  });
  log({ batchPayload: chain, note: 'previous = commit before the batch; intermediates 1,2 never notified' });
}

// ---------------------------------------------------------------------------
log('\n## 6. batch() throwing midway; nested batch in listener; batch depth vs flush');
for (const batchThrow of ['settle', 'discard']) {
  const r = flat(3, { batchThrow });
  const [A, B, C] = r.children;
  const seen = [];
  for (const n of [A, B, C]) n.subscribe((e) => seen.push([n.key, e.payload.current]));
  let msg = null;
  try {
    r.batch(() => {
      A.setValue('a');
      B.setValue('b');
      throw new Error('midway');
      C.setValue('c');
    });
  } catch (e) {
    msg = e.message;
  }
  log({ batchThrow, thrown: msg, A: A.value, B: B.value, C: C.value, delivered: seen });
}
for (const batchDepthBeforeFlush of [true, false]) {
  const r = flat(3, { batchDepthBeforeFlush });
  const [A, B, C] = r.children;
  const seen = [];
  for (const n of [A, B, C]) n.subscribe((e) => seen.push(`${n.key}=${e.payload.current}#w${e.wave}`));
  A.subscribe(() => {
    r.batch(() => {
      B.setValue('fromListener');
      C.setValue('fromListener');
    });
  });
  r.batch(() => A.setValue('a'));
  log({ batchDepthBeforeFlush, delivered: seen, B: B.value, C: C.value, lostMarks: r.marks.size, waves: r.waveCount });
}
{
  // nested batch: inner listener write inside the outer batch's wave
  const r = flat(2);
  const [A, B] = r.children;
  const seen = [];
  B.subscribe((e) => seen.push(`B=${e.payload.current}#w${e.wave}`));
  A.subscribe((e) => {
    seen.push(`A=${e.payload.current}#w${e.wave}`);
    if (e.wave === 1) B.setValue('byListener');
  });
  r.batch(() => {
    r.batch(() => A.setValue('inner'));
    B.setValue('outer');
  });
  log({ nested: seen, commits: r.commitCount });
}

// ---------------------------------------------------------------------------
log('\n## B3-6 isolation: a throwing listener; later nodes still notified, ledger up');
{
  const r = flat(3);
  const [A, B, C] = r.children;
  const seen = [];
  A.subscribe(() => {
    throw new Error('boom');
  });
  A.subscribe(() => seen.push('A2'));
  B.subscribe(() => seen.push('B'));
  C.subscribe(() => seen.push('C'));
  r.batch(() => {
    A.setValue(1);
    B.setValue(1);
    C.setValue(1);
  });
  log({ seen, errors: r.errors.map((e) => e.path + ':' + e.err.message), revA: A.revision(EV.UpdateValue) });
}

// ---------------------------------------------------------------------------
log('\n## B3-2/B5 signal-only node after value nodes; signal from inside a wave');
{
  const r = flat(3);
  const [A, B, C] = r.children;
  const seen = [];
  for (const n of [A, B, C]) n.subscribe((e) => seen.push(`${n.key}:${e.type}#w${e.wave}`));
  A.subscribe((e) => {
    if (e.wave === 1) B.publish(EV.RequestFocus);
  });
  C.publish(EV.RequestFocus); // queued: no wave active, flushes at once → wave 1 alone
  r.batch(() => {
    A.setValue(1);
    C.setValue(1);
    B.publish(EV.RequestSelect);
  });
  log({ seen });
}
