// usage: node --import ./register.mjs compare.mjs <scenario> [samples]
// Same-process, alternating current/legacy samples; each sample is a batch, with an untimed macrotask yield before every iteration.
import { performance } from 'node:perf_hooks';

import context from './context.mjs';
import { setup } from './fixtures.mjs';

const [scenario, samplesArg = '21'] = process.argv.slice(2);
const mods = {
  current: await import(new URL('current.mjs', context.engines)),
  legacy: await import(new URL('legacy.mjs', context.engines)),
};
const runs = {
  current: setup(scenario, 'current', mods),
  legacy: setup(scenario, 'legacy', mods),
};
const mount = scenario.startsWith('mount');
const yieldTask = () => new Promise((r) => setTimeout(r, 0));
const timed = async (run, count) => {
  let ms = 0;
  for (let i = 0; i < count; i++) {
    await yieldTask();
    const s = performance.now();
    await run();
    ms += performance.now() - s;
  }
  return ms / count;
};
const hot = (run, count) => {
  const s = performance.now();
  for (let i = 0; i < count; i++) run();
  return (performance.now() - s) / count;
};
const batch = mount ? 2 : 20;
for (let w = 0; w < 3; w++) {
  await timed(runs.current, batch);
  await timed(runs.legacy, batch);
}
const c = [],
  l = [],
  r = [],
  h = [];
for (let i = 0; i < Number(samplesArg); i++) {
  let a, b;
  if (i % 2) {
    a = await timed(runs.current, batch);
    b = await timed(runs.legacy, batch);
  } else {
    b = await timed(runs.legacy, batch);
    a = await timed(runs.current, batch);
  }
  c.push(a);
  l.push(b);
  r.push(a / b);
  if (!mount) h.push(hot(runs.current, batch * 5));
}
const med = (x) => {
  const y = [...x].sort((p, q) => p - q);
  return +y[y.length >> 1].toPrecision(4);
};
console.log(
  JSON.stringify({
    scenario,
    samples: c.length,
    batch,
    currentMs: med(c),
    legacyMs: med(l),
    currentOverLegacy: med(r),
    currentHotLoopMs: h.length ? med(h) : null,
  }),
);
