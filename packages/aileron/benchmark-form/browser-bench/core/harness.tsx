// Loaded by prepareCoreBundles; the frozen schema-form alias selects the measured build.
import { getCoreFixture } from '../../fixtures/core/getCoreFixture';
import type { CoreFixture } from '../../fixtures/core/types';
import { afterCorePaint } from './helpers/afterCorePaint';
import { measureCoreWrites } from './helpers/measureCoreWrites';
import { mountCoreFixture } from './helpers/mountCoreFixture';
import { observeCoreInputs } from './helpers/observeCoreInputs';
import type { MountedCoreFixture } from './types';

/** The bundle HTML supplies one root for the browser-owned page lifecycle. */
const element = document.getElementById('root');
if (!element) throw new Error('Core browser root missing');
/** Keep the checked browser root available to asynchronous lifecycle methods. */
const container = element;
/** Passive native boundaries are installed before first-paint keyboard input. */
const observation = observeCoreInputs(container);
/** Exactly one fixture is prepared in each fresh page. */
let fixture: CoreFixture | undefined;
/** Current public form handle is resolved after every root replacement. */
let mounted: MountedCoreFixture | undefined;
/** First-key latency starts inside the first-paint hook, before the driver is called. */
let firstKey: Promise<number> | undefined;
/** Count actual validator invocations through the registered plugin wrapper. */
let validations = 0;
/** A page contributes one operation sample, never a reused warm cache sample. */
let completed = false;

window.__core = {
  async prepare(id) {
    if (fixture) throw new Error('Core page already prepared');
    const selected = getCoreFixture(id);
    fixture = selected;
    mounted = await mountCoreFixture(
      container,
      selected,
      () => {
        if (selected.operation !== 'first-key') return;
        observation.begin();
        const started = performance.now();
        firstKey = window.__coreFirstKey().then(async () => {
          await afterCorePaint();
          return performance.now() - started;
        });
      },
      () => {
        validations++;
      },
    );
    if (selected.operation !== 'first-key')
      await new Promise((resolve) => setTimeout(resolve, 150));
  },
  async run() {
    const selected = fixture;
    const form = mounted;
    if (!selected || !form || completed)
      throw new Error('Core run requires one fresh prepared page');
    completed = true;
    const validationsBefore = validations;
    let durationMs = form.durationMs;
    if (selected.operation === 'first-key') {
      if (!firstKey) throw new Error('Core first-paint hook did not run');
      durationMs = await firstKey;
      measureCoreWrites(
        selected,
        observation.records,
        form.currentHandle(),
        container,
      );
    } else if (selected.operation === 'type') {
      observation.begin();
      await window.__coreType();
      await afterCorePaint();
      durationMs = measureCoreWrites(
        selected,
        observation.records,
        form.currentHandle(),
        container,
      );
    } else if (selected.operation === 'rebuild') {
      const before = form.currentHandle().node;
      if (!before) throw new Error('Core rebuild root missing');
      const started = performance.now();
      form.currentHandle().rebuild();
      await afterCorePaint();
      durationMs = performance.now() - started;
      const after = form.currentHandle().node;
      if (!after || before === after)
        throw new Error('Core rebuild did not replace the root');
    }
    observation.stop();
    const inputs = container.querySelectorAll('input,select').length;
    if (
      inputs !== selected.expectedInputs ||
      container.querySelector('[data-deferred]')
    )
      throw new Error('Core complete control count mismatch: ' + selected.id);
    if (!Number.isFinite(durationMs) || durationMs < 0)
      throw new Error('Core duration is invalid');
    return {
      durationMs,
      counts: {
        inputs,
        nodes: container.querySelectorAll('*').length,
        writes: observation.records.length,
        validations:
          selected.operation === 'mount' || selected.operation === 'first-key'
            ? validations
            : validations - validationsBefore,
      },
    };
  },
};
