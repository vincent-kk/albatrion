// Executed from repository root with node; all outputs are diagnostic-only, never formal gate samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const require = createRequire(
  path.resolve('packages/aileron/benchmark-form/package.json'),
);
const { chromium } = require('playwright');
const options = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const at = arg.indexOf('=');
    return [arg.slice(2, at), arg.slice(at + 1)];
  }),
);
const root = path.resolve(options.root),
  output = path.resolve(options.output);
const profile = options.profile === 'true';
const burst = options.suite === 'burst';
const count = Number(options.count || (profile ? 5 : 10));
const warmup = Number(options.warmup ?? 3);
const lanes = options.lanes.split(',');
const cases = (
  burst
    ? [
        'type-flat-500-validate-burst',
        'type-nested-d5-f4-validate-burst',
        'type-flat-2000-validate-burst',
      ]
    : ['mount-array-1000-none', 'mount-array-1000-validate']
).filter((id) => !options.fixtures || options.fixtures.split(',').includes(id));
assert.ok(!fs.existsSync(output), 'Do not overwrite diagnostic runs');
fs.mkdirSync(output, { recursive: true });
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
const normalized = (value) =>
  JSON.stringify(value, (_key, entry) =>
    typeof entry === 'string'
      ? entry
          .split(pathToFileURL(root).href)
          .join('ir6-diagnostic:/')
          .split(root)
          .join('[diagnostic-root]')
      : entry,
  );
const save = (name, value) =>
  fs.writeFileSync(
    path.join(output, name),
    gzipSync(normalized(value), { mtime: 0 }),
  );
const browser = await chromium.launch({ headless: true });
const samples = [];
try {
  for (const id of cases)
    for (let index = -warmup; index < count; index++) {
      const collectProfile = profile && index >= 0;
      const order = index % 2 === 0 ? lanes : [...lanes].reverse();
      for (const lane of order) {
        const page = await browser.newPage({
          viewport: { width: 900, height: 700 },
        });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        if (burst)
          await page.addInitScript(() => {
            window.__ir6Diagnosis = { commits: [], active: false };
            const ids = new WeakMap(),
              previous = new Map();
            let nextId = 1;
            // Fiber flags and names are raw diagnostic observations, not a production render counter.
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
              supportsFiber: true,
              inject() {
                return 1;
              },
              onCommitFiberUnmount() {},
              onCommitFiberRoot(_id, root) {
                const active = window.__ir6Diagnosis.active;
                const nodes = [],
                  stack = [root.current];
                while (stack.length) {
                  const fiber = stack.pop();
                  let identity =
                    ids.get(fiber) ??
                    (fiber.alternate ? ids.get(fiber.alternate) : undefined);
                  if (!identity) identity = nextId++;
                  ids.set(fiber, identity);
                  if (fiber.alternate) ids.set(fiber.alternate, identity);
                  const changed = previous.get(identity) !== fiber;
                  previous.set(identity, fiber);
                  const type = fiber.type;
                  const name =
                    typeof type === 'function'
                      ? type.displayName || type.name
                      : typeof type?.type === 'function'
                        ? type.type.displayName || type.type.name
                        : undefined;
                  if (active && changed && name && fiber.flags & 1)
                    nodes.push({
                      name,
                      flags: fiber.flags,
                      path:
                        fiber.memoizedProps?.node?.path ??
                        fiber.memoizedProps?.path ??
                        null,
                    });
                  if (fiber.sibling) stack.push(fiber.sibling);
                  if (changed && fiber.child) stack.push(fiber.child);
                }
                if (active)
                  window.__ir6Diagnosis.commits.push({
                    at: performance.now(),
                    nodes,
                  });
              },
            };
          });
        let cdp;
        try {
          await page.goto(
            pathToFileURL(path.join(root, lane, 'index.html')).href,
          );
          await page.waitForFunction(() => !!window.__ir6);
          if (burst)
            await page.evaluate((name) => window.__ir6.prepare(name), id);
          if (collectProfile) {
            cdp = await page.context().newCDPSession(page);
            await cdp.send('Profiler.enable');
            await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
            await cdp.send('Tracing.start', {
              categories: 'devtools.timeline,blink.user_timing,v8',
              transferMode: 'ReturnAsStream',
            });
            await cdp.send('Profiler.start');
          }
          const marker = await page.evaluate(() => {
            performance.mark('ir6-diagnostic-clock');
            return performance.getEntriesByName('ir6-diagnostic-clock')[0]
              .startTime;
          });
          if (!burst)
            await page.evaluate((name) => window.__ir6.prepare(name), id);
          else {
            const target = page.locator('[id="/field_000"]');
            const nested = id.includes('nested');
            const input = nested
              ? page.locator('[id="/n0/n0/n0/n0/n0"]')
              : target;
            await input.focus();
            await input.press('End');
          }
          await page.evaluate(() => {
            window.__ir6.begin();
            if (window.__ir6Diagnosis) window.__ir6Diagnosis.active = true;
          });
          if (burst)
            for (let key = 0; key < 20; key++)
              await page.keyboard.type(String.fromCharCode(97 + key));
          const record = await page.evaluate(() => window.__ir6.finish());
          const extra = await page.evaluate(() => ({
            marks: performance
              .getEntriesByType('mark')
              .map((entry) => ({ name: entry.name, at: entry.startTime })),
            commits: window.__ir6Diagnosis?.commits ?? [],
          }));
          assert.deepEqual(errors, []);
          assert.equal(record.mount.allDeferred, 0);
          assert.equal(record.handlers.length, burst ? 20 : 0);
          assert.ok(Number.isFinite(record.mount.firstPaintedMs));
          const name = `${id}-${lane}-${index}`;
          if (collectProfile) {
            const cpu = (await cdp.send('Profiler.stop')).profile;
            const done = new Promise((resolve) =>
              cdp.once('Tracing.tracingComplete', resolve),
            );
            await cdp.send('Tracing.end');
            const event = await done;
            assert.equal(event.dataLossOccurred, false);
            const chunks = [];
            for (;;) {
              const chunk = await cdp.send('IO.read', { handle: event.stream });
              chunks.push(
                Buffer.from(
                  chunk.data,
                  chunk.base64Encoded ? 'base64' : 'utf8',
                ),
              );
              if (chunk.eof) break;
            }
            await cdp.send('IO.close', { handle: event.stream });
            const trace = JSON.parse(Buffer.concat(chunks).toString());
            if (trace.metadata && 'command_line' in trace.metadata)
              trace.metadata.command_line =
                '[browser command line omitted: ephemeral executable and profile directories]';
            const clock = trace.traceEvents.find(
              (entry) => entry.name === 'ir6-diagnostic-clock',
            );
            assert.ok(clock, 'Trace contains exact page/CDP clock marker');
            extra.clock = {
              pageMs: marker,
              traceUs: clock.ts,
              threadId: clock.tid,
              processId: clock.pid,
              offsetMs: clock.ts / 1000 - marker,
            };
            save(name + '.cpuprofile.json.gz', cpu);
            save(name + '.trace.json.gz', trace);
          }
          if (index < 0) {
            console.log(`IR6_DIAGNOSTIC_WARMUP ${lane} ${index} ${id}`);
            continue;
          }
          save(name + '.page.json.gz', {
            diagnosticOnly: true,
            record,
            ...extra,
          });
          samples.push({
            id,
            lane,
            index,
            file: name + '.page.json.gz',
            firstPaintedMs: record.mount.firstPaintedMs,
            eagerPaintedMs: record.mount.eagerPaintedMs,
          });
          console.log(
            `IR6_DIAGNOSTIC_ONLY ${options.suite} ${lane} ${index} ${id} eager=${record.mount.eagerPaintedMs.toFixed(3)}`,
          );
        } finally {
          await page.close();
        }
      }
    }
  fs.writeFileSync(
    path.join(output, 'diagnostic-complete.json'),
    JSON.stringify(
      {
        diagnosticOnly: true,
        formalGateEvidence: false,
        profile,
        count,
        warmup,
        order: 'forward/reverse by page index',
        cases,
        lanes,
        inputs,
        chromium: browser.version(),
        samples,
        note: profile
          ? '100us CPU sampling plus timeline; instrumentation overhead included. Burst records fiber identity changes plus flags; observer overhead is included.'
          : 'No profiler; controlled diagnostic A/B only; never replaces registered verdicts.',
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await browser.close();
}
