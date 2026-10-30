import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

import cases from '../../fixtures/input-responsiveness/cases.json';
import ir1Cases from '../../fixtures/input-responsiveness/ir-1-cases.json';
import { observeCpu } from './helpers/observeCpu';
import { prepareBundles } from './helpers/prepareBundles';
import { readAncestorPids } from './helpers/readAncestorPids';
import { readMeasurementPids } from './helpers/readMeasurementPids';
import { samplePage } from './helpers/samplePage';
import { samplePageWithCpu } from './helpers/samplePageWithCpu';
import { serializeEvidence } from './helpers/serializeEvidence';
import { summarizePage } from './helpers/summarizePage';

/**
 * Run preparation, an untimed protocol smoke, or the once-only IR-0 measurement window.
 * @param args - Explicit --action=prepare|smoke|run and --root=<new-or-prepared .noindex directory>
 * @returns Resolves after evidence is durably saved; refuses missing Chromium without installing it
 * @throws For invalid options, reused completed windows, modified frozen bundles or failed fixture assertions
 */
export async function runInteractions(args: string[]) {
  const options = Object.fromEntries(
    args
      .filter((arg) => arg.includes('='))
      .map((arg) => {
        const equals = arg.indexOf('=');
        return [arg.slice(2, equals), arg.slice(equals + 1)];
      }),
  );
  assert.ok(options.root, '--root is required');
  assert.ok(
    ['prepare', 'smoke', 'run'].includes(options.action),
    '--action must be prepare, smoke, or run',
  );
  const root = path.resolve(options.root);
  assert.ok(
    fs.existsSync(chromium.executablePath()),
    'Chromium missing; ask before yarn exec playwright install chromium',
  );
  if (options.action === 'prepare') {
    const inputs = await prepareBundles(root, options['stage-root']);
    console.log('IR0_PREPARED ' + inputs.lanes.join(','));
    return;
  }
  const inputs = JSON.parse(
    fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
  );
  for (const lane of inputs.lanes) {
    const digest = createHash('sha256')
      .update(fs.readFileSync(path.join(root, lane, 'bundle.js')))
      .digest('hex');
    assert.equal(
      digest,
      inputs.bundles[lane].browser.sha256,
      'Frozen browser bundle hash',
    );
  }
  const stageCases =
    options.stage === 'ir-1'
      ? options.suite === 'quiet-gates'
        ? ir1Cases.filter(
            (id) =>
              id.startsWith('replace-') ||
              id.startsWith('type-') ||
              id.startsWith('validation-'),
          )
        : options.suite === 'backfill'
          ? ['mount-flat-500-on', 'mount-array-1000-on']
          : ir1Cases
      : cases;
  const paired = options['paired-relative'] === 'true';
  const smoke = options.action === 'smoke';
  const selected = options.fixture
    ? stageCases.filter((id) => id === options.fixture)
    : stageCases;
  assert.ok(selected.length > 0);
  const count = smoke ? 1 : 10,
    warmup = smoke ? 1 : 3;
  const toolCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const toolHashes = Object.fromEntries(
    execFileSync(
      'rg',
      [
        '--files',
        'browser-bench',
        'fixtures/input-responsiveness',
        'fixtures/equivalent',
        'src/fixtures',
      ],
      { encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .map((file) => [
        file,
        createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      ]),
  );
  if (!smoke) {
    assert.ok(
      !fs.existsSync(path.join(root, 'formal-start.json')),
      'Never restart a started window',
    );
    assert.ok(
      fs.existsSync(path.join(root, 'smoke-complete.json')),
      'Complete smoke before formal start',
    );
    const smokeEvidence = JSON.parse(
      fs.readFileSync(path.join(root, 'smoke-complete.json'), 'utf8'),
    );
    assert.deepEqual(
      options.suite === 'quiet-gates'
        ? smokeEvidence.cases.filter((id: string) => stageCases.includes(id))
        : smokeEvidence.cases,
      stageCases,
      'Smoke covers every fixture',
    );
    assert.deepEqual(
      smokeEvidence.inputs.bundles,
      inputs.bundles,
      'Smoke uses the frozen browser bundles',
    );
    let attemptAt = new Date().toISOString();
    if (paired) {
      const prior = JSON.parse(
        fs.readFileSync(path.join(root, 'prior-refusals.json'), 'utf8'),
      );
      assert.ok(
        prior.length >= 3 &&
          prior.every(
            (entry: { samples: number; approved: boolean }) =>
              entry.samples === 0 && !entry.approved,
          ),
        'Owner paired rule requires three preserved zero-sample refusals',
      );
    } else {
      const excluded = readAncestorPids();
      const quiet = await observeCpu(30000, excluded);
      const attempt = {
        at: new Date().toISOString(),
        samples: 0,
        approved: quiet.heavy.length === 0,
        policy: {
          observationMs: 30000,
          maximumExternalPidPercent: 30,
          excluded,
        },
        quiet,
      };
      const attemptName = `start-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      fs.writeFileSync(
        path.join(root, attemptName),
        JSON.stringify(attempt, null, 2),
      );
      if (!attempt.approved) {
        console.log('IR0_START_REFUSED samples=0');
        return;
      }
      attemptAt = attempt.at;
    }
    fs.writeFileSync(
      path.join(root, 'formal-start.json'),
      JSON.stringify({
        at: attemptAt,
        mode: paired ? 'paired-relative' : 'quiet',
        count,
        warmup,
        cases: selected,
        lanes: inputs.lanes,
        toolCommit,
        toolHashes,
      }),
    );
    console.log('IR0_FORMAL_STARTED');
  }
  const browser = await chromium.launch({ headless: true });
  const cpu: object[] = [];
  let cpuInFlight: Promise<void> | undefined;
  const monitor = smoke
    ? undefined
    : setInterval(() => {
        if (!cpuInFlight)
          cpuInFlight = observeCpu(1000, [])
            .then((entry) => {
              cpu.push(entry);
            })
            .finally(() => {
              cpuInFlight = undefined;
            });
      }, 10000);
  let quietInFlight: Promise<void> | undefined;
  const quietMonitor =
    !smoke && paired
      ? setInterval(() => {
          if (!quietInFlight)
            quietInFlight = observeCpu(30000, readMeasurementPids())
              .then((quiet) => {
                const evidence = {
                  at: new Date().toISOString(),
                  approved: quiet.heavy.length === 0,
                  quiet,
                };
                fs.writeFileSync(
                  path.join(
                    root,
                    'background-quiet-' +
                      evidence.at.replace(/[:.]/g, '-') +
                      '.json',
                  ),
                  JSON.stringify(evidence),
                );
                if (evidence.approved) console.log('IR1_BACKGROUND_QUIET_PASS');
              })
              .finally(() => {
                quietInFlight = undefined;
              });
        }, 120000)
      : undefined;
  const samples: object[] = [];
  const startedAt = new Date().toISOString();
  const output = path.join(root, smoke ? 'smoke' : 'raw');
  fs.mkdirSync(output, { recursive: false });
  try {
    for (const id of selected) {
      for (let index = -warmup; index < count; index++) {
        const offset =
          ((index % inputs.lanes.length) + inputs.lanes.length) %
          inputs.lanes.length;
        const order = paired
          ? [...inputs.lanes.slice(offset), ...inputs.lanes.slice(0, offset)]
          : index % 2 === 0
            ? inputs.lanes
            : [...inputs.lanes].reverse();
        for (const lane of order) {
          const page = await (
            options.stage === 'ir-1' ? samplePageWithCpu : samplePage
          )(browser, root, lane, id);
          if (index >= 0) {
            const name = `${id}-${lane}-${index}.json`;
            fs.writeFileSync(
              path.join(output, name),
              serializeEvidence(page, root),
            );
            samples.push({
              id,
              lane,
              index,
              file: name,
              summary: summarizePage(page),
            });
          }
        }
      }
      console.log(
        `${smoke ? 'SMOKE' : 'MEASURED'} ${id} ${inputs.lanes.join('/')} ${count} fresh pages/lane`,
      );
    }
    const result = {
      mode: paired ? 'paired-relative' : 'quiet',
      startedAt,
      endedAt: new Date().toISOString(),
      smoke,
      count,
      warmup,
      toolCommit,
      toolHashes,
      chromium: browser.version(),
      inputs,
      cases: selected,
      samples,
    };
    fs.writeFileSync(
      path.join(root, smoke ? 'smoke-complete.json' : 'complete.json'),
      JSON.stringify(result, null, 2),
    );
    console.log(smoke ? 'IR0_SMOKE_OK' : 'IR0_WINDOW_COMPLETE');
  } catch (error) {
    fs.writeFileSync(
      path.join(root, smoke ? 'smoke-failure.json' : 'failure.json'),
      JSON.stringify({
        samples: samples.length,
        message: String(error).split(root).join('[prepared-root]'),
      }),
    );
    throw error;
  } finally {
    if (monitor) clearInterval(monitor);
    if (quietMonitor) clearInterval(quietMonitor);
    await quietInFlight;
    await cpuInFlight;
    fs.writeFileSync(
      path.join(root, smoke ? 'smoke-cpu.json' : 'cpu.json'),
      JSON.stringify(cpu),
    );
    await browser.close();
  }
}
