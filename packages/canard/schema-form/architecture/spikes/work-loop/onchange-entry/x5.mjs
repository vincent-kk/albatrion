/**
 * Devil's X5 (reviews/raw-round5-devil.md appendix A) plus the entry cases of
 * round-5 C-8 / C-9 / C-10, run against one loop module:
 *   node onchange-entry/x5.mjs v4     # per-wave onChange (loop-v4.mjs)
 *   node onchange-entry/x5.mjs v4c    # per-entry onChange (loop-v4c.mjs)
 * Prints one line per case; `##X5## {json}` lines carry the numbers.
 */
const which = process.argv[2] ?? 'v4c';
const L = await import(`../proto/loop-${which}.mjs`);
const { attach, batch, counters, leaf, object, prime, resetCounters, setValue, subscribe, valueOf, write } = L;
const lastSettle = L.lastSettle;
const lastEntry = L.lastEntry ?? null;

const rows = [];
function row(name, data) {
  rows.push({ loop: which, name, ...data });
  console.log(`  ${name.padEnd(44)} ${Object.entries(data).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ')}`);
}

/** Root with three string leaves, an onChange counter and (v4c) an onValidate counter. */
function form(opts) {
  const root = object('root');
  const a = leaf('a');
  const b = leaf('b');
  const c = leaf('c');
  attach(root, a);
  attach(root, b);
  attach(root, c);
  prime(root, {}, opts);
  const seen = { onChange: 0, validations: 0, emits: [], commits: [] };
  root.onChange = (emit, payload) => {
    seen.onChange++;
    seen.emits.push(emit);
    seen.commits.push(payload?.commit ?? null);
  };
  if ('onValidate' in root) root.onValidate = () => seen.validations++;
  resetCounters();
  return { root, a, b, c, seen };
}

console.log(`X5 on loop-${which}.mjs`);

// C-8: three un-batched setValue calls in one handler.
{
  const { a, b, c, seen } = form();
  setValue(a, 1);
  setValue(b, 2);
  setValue(c, 3);
  row('X5-seq: 3 setValue, no batch', { onChange: seen.onChange, validations: seen.validations, entries: counters.entries ?? null, settles: counters.settles, waves: counters.waves });
}

// C-8: the same three inside batch(fn).
{
  const { root, a, b, c, seen } = form();
  batch(root, () => {
    setValue(a, 4);
    setValue(b, 5);
    setValue(c, 6);
  });
  row('X5-batch: 3 setValue in one batch', { onChange: seen.onChange, validations: seen.validations, entries: counters.entries ?? null, settles: counters.settles, waves: counters.waves });
}

// C-9: a listener writes another node during the wave (2 waves).
{
  const { a, b, seen } = form();
  let once = true;
  subscribe(a, () => {
    if (once) {
      once = false;
      setValue(b, 99);
    }
  });
  setValue(a, 7);
  row('X5-feedback: listener writes b during wave', {
    onChange: seen.onChange,
    validations: seen.validations,
    waves: lastEntry ? lastEntry.waves : lastSettle.waves,
    settles: counters.settles,
    entries: counters.entries ?? null,
    emits: seen.emits,
    commits: seen.commits,
    finalEmit: valueOf(a.root),
  });
}

// Listener writes on EVERY wave up to 5 (chain a -> b -> c ... 5 deep).
{
  const { root, a, b, c, seen } = form();
  const d = leaf('d');
  const e = leaf('e');
  attach(root, d);
  attach(root, e);
  subscribe(a, () => setValue(b, 'b'));
  subscribe(b, () => setValue(c, 'c'));
  subscribe(c, () => setValue(d, 'd'));
  subscribe(d, () => setValue(e, 'e'));
  resetCounters();
  setValue(a, 'a');
  row('X5-chain: 4 listeners chained (5 waves)', { onChange: seen.onChange, validations: seen.validations, waves: lastEntry ? lastEntry.waves : lastSettle.waves, settles: counters.settles, emits: seen.emits });
}

// Same-value write: no emit change.
{
  const { a, seen } = form();
  setValue(a, 1);
  const before = { onChange: seen.onChange, validations: seen.validations };
  setValue(a, 1);
  write(a, 1);
  row('X5-same: rewrite an equal value', { onChangeDelta: seen.onChange - before.onChange, validationsDelta: seen.validations - before.validations, settles: counters.settles });
}

// C-10 shape without React: a write made from inside onChange is a new entry.
{
  const { root, a, b, seen } = form();
  let guard = true;
  const inner = root.onChange;
  root.onChange = (emit, payload) => {
    inner(emit, payload);
    if (guard) {
      guard = false;
      setValue(b, 'from-onChange');
    }
  };
  setValue(a, 'x');
  row('X5-reentry: onChange writes b once', {
    onChange: seen.onChange,
    validations: seen.validations,
    entries: counters.entries ?? null,
    emits: seen.emits,
    commits: seen.commits,
    status: root.settle.status,
  });
}

// Unbounded onChange -> write -> onChange chain (v4c prod: capped and
// recorded; v4c dev: throws). v4 has no cap on this chain at all — unguarded
// it ran to heap exhaustion (~4 GB, OOM) — so the writer stops itself at 200.
const SELF_STOP = 200;
for (const dev of [false, true]) {
  const { root, a, seen } = form({ dev });
  let n = 0;
  const inner = root.onChange;
  root.onChange = (emit, payload) => {
    inner(emit, payload);
    if (n < SELF_STOP) setValue(a, ++n);
  };
  let threw = null;
  try {
    setValue(a, 0);
  } catch (err) {
    threw = err.message;
  }
  row(`X5-loop: onChange always writes (dev=${dev})`, {
    onChange: seen.onChange,
    validations: seen.validations,
    writesApplied: n,
    selfStop: n >= SELF_STOP,
    finalA: valueOf(a),
    status: root.settle.status,
    waves: lastSettle.waves,
    threw,
    capExceeded: lastEntry ? lastEntry.onChangeCapExceeded : null,
  });
}

for (const r of rows) console.log(`##X5## ${JSON.stringify(r)}`);
