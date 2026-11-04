// Loaded by prepareCoreBundles; the frozen schema-form alias selects the measured build.
import { plugin } from '@canard/schema-form-ajv8-plugin';

import { getCoreFixture } from '../../fixtures/core/getCoreFixture';
import type { CoreFixture } from '../../fixtures/core/types';
import { mountCorePageFixture } from './harness/utils/mountCorePageFixture';
import { observeCoreFixtureOperation } from './harness/utils/observeCoreFixtureOperation';
import { observeCoreMarker } from './harness/utils/observeCoreMarker';
import { observeCoreValidator } from './harness/utils/observeCoreValidator/observeCoreValidator';
import type { CoreWrappedValidator } from './harness/utils/observeCoreValidator/observeCoreValidator';
import { afterCorePaint } from './helpers/afterCorePaint';
import { createCoreLongTaskSource } from './helpers/createCoreLongTaskSource';
import { measureCoreWrites } from './helpers/measureCoreWrites';
import { observeCoreInputs } from './helpers/observeCoreInputs';
import type { CoreOperationResult } from './helpers/observeCoreOperation/observeCoreOperation';
import type {
  CoreMarkerObservation,
  CoreObservationEnv,
  CoreValidationReport,
  MountedCoreFixture,
} from './types';

/** The bundle HTML supplies one root for the browser-owned page lifecycle. */
const element = document.getElementById('root');
if (!element) throw new Error('Core browser root missing');
/** Keep the checked browser root available to asynchronous lifecycle methods. */
const container = element;
/** Browser-owned clocks handed to every observer. */
const env: CoreObservationEnv = {
  now: () => performance.now(),
  requestAnimationFrame: (callback) => {
    requestAnimationFrame(() => callback());
  },
  setTimeout: (callback, delayMs) => {
    setTimeout(callback, delayMs);
  },
};
/** Passive native boundaries are installed before first-paint keyboard input. */
const observation = observeCoreInputs(container);
/** Exactly one fixture is prepared in each fresh page. */
let fixture: CoreFixture | undefined;
/** Validator wrapper registered before the first render. */
let validator: CoreWrappedValidator | undefined;
/** Marker observer attached before the first render. */
let marker: CoreMarkerObservation | undefined;
/** onValidate reports since the page loaded. */
const reports: CoreValidationReport[] = [];
/** Current public form handle is resolved after every root replacement. */
let mounted: MountedCoreFixture | undefined;
/** First-key latency starts inside the first-paint hook, before the driver is called. */
let firstKey: Promise<number> | undefined;
/** Mount and first-key are observed inside prepare; run only reports them. */
let prepared: CoreOperationResult | undefined;
/** A page contributes one operation sample, never a reused warm cache sample. */
let completed = false;

window.__core = {
  async prepare(id) {
    if (fixture) throw new Error('Core page already prepared');
    const selected = getCoreFixture(id);
    fixture = selected;
    const wrapped = observeCoreValidator(plugin, selected.measuredPath, env);
    validator = wrapped;
    const markers = observeCoreMarker(container, env);
    marker = markers;
    const mount = async () => {
      const result = await mountCorePageFixture(
        container,
        selected,
        wrapped,
        observation,
        reports,
        env,
        (promise) => {
          firstKey = promise;
        },
      );
      mounted = result.form;
      return result;
    };
    if (selected.operation === 'mount')
      prepared = await observeCoreFixtureOperation(
        selected,
        wrapped,
        markers,
        reports,
        createCoreLongTaskSource,
        env,
        async () => {
          const { startMs, form } = await mount();
          return { startMs, durationMs: form.durationMs, writes: [] };
        },
      );
    else if (selected.operation === 'first-key')
      prepared = await observeCoreFixtureOperation(
        selected,
        wrapped,
        markers,
        reports,
        createCoreLongTaskSource,
        env,
        async () => {
          const { form } = await mount();
          if (!firstKey) throw new Error('Core first-paint hook did not run');
          const durationMs = await firstKey;
          measureCoreWrites(
            selected,
            observation.records,
            form.currentHandle(),
            container,
          );
          return {
            startMs: observation.records[0].start,
            durationMs,
            writes: [...observation.records],
          };
        },
      );
    else {
      await mount();
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  },
  async run() {
    const selected = fixture;
    const form = mounted;
    const wrapped = validator;
    const markers = marker;
    if (!selected || !form || !wrapped || !markers || completed)
      throw new Error('Core run requires one fresh prepared page');
    completed = true;
    const lifetimeBefore = wrapped.observation.records.length;
    let result = prepared;
    if (selected.operation === 'type')
      result = await observeCoreFixtureOperation(
        selected,
        wrapped,
        markers,
        reports,
        createCoreLongTaskSource,
        env,
        async () => {
          observation.begin();
          await window.__coreType();
          await afterCorePaint();
          const durationMs = measureCoreWrites(
            selected,
            observation.records,
            form.currentHandle(),
            container,
          );
          return {
            startMs: observation.records[0].start,
            durationMs,
            writes: [...observation.records],
          };
        },
      );
    else if (selected.operation === 'rebuild')
      result = await observeCoreFixtureOperation(
        selected,
        wrapped,
        markers,
        reports,
        createCoreLongTaskSource,
        env,
        async () => {
          const before = form.currentHandle().node;
          if (!before) throw new Error('Core rebuild root missing');
          const startMs = env.now();
          form.currentHandle().rebuild();
          await afterCorePaint();
          const durationMs = env.now() - startMs;
          const after = form.currentHandle().node;
          if (!after || before === after)
            throw new Error('Core rebuild did not replace the root');
          return { startMs, durationMs, writes: [] };
        },
      );
    if (!result) throw new Error('Core operation was not observed');
    observation.stop();
    const inputs = container.querySelectorAll('input,select').length;
    if (
      inputs !== selected.expectedInputs ||
      container.querySelector('[data-deferred]')
    )
      throw new Error('Core complete control count mismatch: ' + selected.id);
    if (
      !Number.isFinite(result.metrics.durationMs) ||
      result.metrics.durationMs < 0
    )
      throw new Error('Core duration is invalid');
    const records = wrapped.observation.records;
    const inWindow =
      selected.operation === 'mount' || selected.operation === 'first-key'
        ? records
        : records.slice(lifetimeBefore);
    return {
      durationMs: result.metrics.durationMs,
      counts: {
        inputs,
        nodes: container.querySelectorAll('*').length,
        writes: observation.records.length,
        validations: inWindow.filter((record) => record.kind === 'run').length,
        compiles: inWindow.filter((record) => record.kind === 'compile').length,
        lifetimeValidations: records.filter((record) => record.kind === 'run')
          .length,
        lifetimeCompiles: records.filter((record) => record.kind === 'compile')
          .length,
        failedCalls: records.filter((record) => !record.ok).length,
        markers: markers.count(),
      },
      metrics: result.metrics,
      ...(result.writes.length ? { writes: result.writes } : {}),
    };
  },
};
