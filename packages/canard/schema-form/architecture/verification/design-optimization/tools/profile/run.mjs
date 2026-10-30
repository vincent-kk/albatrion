// usage: node --import ./register.mjs run.mjs <scenario> <engine> <profile|time> [seconds]
// scenarios: mount (B6 flat 10,000 mixed), mount-bp (B6 + blueprint per iteration),
//   switch (event-cascade oneOf a<->b), switch-distinct (branch keys a_x/a_y vs b_x/b_y),
//   switch-wide (exact switch schema + 1,000 sibling number fields),
//   wave (EVENT-004: 1,000 numbers, root setValue, every child subscribed)
import { performance } from 'node:perf_hooks';

import context from './context.mjs';
import { setup } from './fixtures.mjs';

const [scenario, engine = 'current', mode = 'profile', secondsArg = '4'] =
  process.argv.slice(2);
const seconds = Number(secondsArg);
if (!Number.isFinite(seconds) || seconds <= 0)
  throw new Error('Seconds must be positive');
if (!['current', 'legacy'].includes(engine)) throw new Error('Unknown engine');
if (!['profile', 'time'].includes(mode)) throw new Error('Unknown mode');

const mods = {
  current:
    engine === 'current'
      ? await import(new URL('current.mjs', context.engines))
      : null,
  legacy:
    engine === 'legacy'
      ? await import(new URL('legacy.mjs', context.engines))
      : null,
};
let sink = 0;
const run = setup(scenario, engine, mods);
const isAsync =
  engine === 'legacy' && scenario !== 'mount' && scenario !== 'mount-bp';
if (mode === 'profile') {
  // profile only the measured loop: inspector profiler started after setup and warmup, written to prof/<scenario>/loop.cpuprofile
  const { Session } = await import('node:inspector/promises');
  const fs = await import('node:fs');
  for (let i = 0; i < 20; i++) {
    if (isAsync) await new Promise((resolve) => setTimeout(resolve, 0));
    if (isAsync) await run();
    else run();
  }
  const session = new Session();
  session.connect();
  await session.post('Profiler.enable');
  await session.post('Profiler.setSamplingInterval', { interval: 200 });
  await session.post('Profiler.start');
  const end = performance.now() + seconds * 1000;
  let n = 0;
  while (performance.now() < end) {
    if (isAsync) await new Promise((resolve) => setTimeout(resolve, 0));
    if (isAsync) await run();
    else run();
    n++;
  }
  const { profile } = await session.post('Profiler.stop');
  session.disconnect();
  const out = new URL(
    `${scenario}${engine === 'legacy' ? '-legacy' : ''}/`,
    context.profiles,
  );
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(new URL('loop.cpuprofile', out), JSON.stringify(profile));
  console.log(
    JSON.stringify({
      scenario,
      engine,
      iterations: n,
      seconds,
      msPerIteration: (seconds * 1000) / n,
      sink,
    }),
  );
} else {
  // per-iteration timing; one untimed macrotask yield before every iteration (legacy loop guard resets on a macrotask)
  const yieldTask = () => new Promise((r) => setTimeout(r, 0));
  const timed = async (count) => {
    let ms = 0;
    for (let i = 0; i < count; i++) {
      await yieldTask();
      const s = performance.now();
      if (isAsync) await run();
      else run();
      ms += performance.now() - s;
    }
    return ms / count;
  };
  let k = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < 400) {
    await timed(1);
    k++;
  }
  const batch = Math.max(1, Math.round(k / 3));
  const per = [];
  for (let b = 0; b < 15; b++) per.push(await timed(batch));
  per.sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      scenario,
      engine,
      batch,
      batches: 15,
      medianMs: per[7],
      p10Ms: per[1],
      p90Ms: per[13],
      sink,
    }),
  );
}
