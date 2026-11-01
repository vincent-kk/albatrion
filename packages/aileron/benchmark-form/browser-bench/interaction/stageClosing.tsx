// Loaded by the closing bundle preparer; frozen aliases select product code without lane adaptations.
import { getStageClosingFixture } from '../../fixtures/input-responsiveness/getStageClosingFixture';
import { afterPaint } from './helpers/afterPaint';
import { mountFixture } from './helpers/mountFixture';
import { observePage } from './helpers/observePage';
import { finalizeStageClosingOperations } from './helpers/stageClosing/finalizeStageClosingOperations';
import { readPostPaintBusy } from './helpers/stageClosing/readPostPaintBusy';
import { runStageClosingOperations } from './helpers/stageClosing/runStageClosingOperations';
import type {
  ClosingOperation,
  StageClosingFixture,
  StageClosingPage,
  ValidatorWork,
} from './stageClosingTypes';
import type { ValidationAfterPaintPage } from './validationAfterPaintTypes';

const container = document.getElementById('root');
if (!container) throw new Error('Missing form root');
const observation = observePage(container);
const validationStarts: number[] = [],
  work: ValidatorWork[] = [];
let mounted: Awaited<ReturnType<typeof mountFixture>> | undefined;
let fixture: StageClosingFixture | undefined;
let started = 0;
let stream: ValidationAfterPaintPage['stream'];
let operations: ClosingOperation[] = [];

window.__ir6 = {
  async prepare(id) {
    fixture = getStageClosingFixture(id);
    const current = fixture;
    mounted = await mountFixture(container, fixture, observation, {
      onFirstPaint: () => {
        if (current.firstKey) {
          started = observation.begin();
          void window.__ir6FirstKey();
        }
      },
      onValidationRun: () => validationStarts.push(performance.now()),
      onValidatorWork: (kind, start, end) => work.push({ kind, start, end }),
    });
    if (!fixture.firstKey)
      await new Promise((resolve) => setTimeout(resolve, 150));
    return fixture;
  },
  begin() {
    if (!mounted || !fixture) throw new Error('Prepare before begin');
    started = fixture.mount
      ? (mounted.mount.startedAt ?? observation.begin())
      : observation.begin();
    if (fixture.mount) observation.begin();
  },
  async waitForNextKey() {
    const last = observation.handlers[observation.handlers.length - 1];
    if (last)
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.max(0, 100 - (performance.now() - last.start)),
        ),
      );
  },
  async stream() {
    if (!mounted || !fixture?.streamFrames)
      throw new Error('Missing stream fixture');
    const startedAt = performance.now(),
      scriptMs: number[] = [];
    for (let index = 0; index < fixture.streamFrames; index++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          const before = performance.now();
          const node = mounted?.currentHandle().findNode(fixture?.target ?? '');
          if (!node) throw new Error('Missing stream target');
          node.setValue('a'.repeat(index + 1));
          scriptMs.push(performance.now() - before);
          resolve();
        }),
      );
    }
    const endedAt = performance.now();
    stream = {
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      scriptMs,
      writeFrames: fixture.streamFrames,
      validationRuns: 0,
    };
  },
  finish: () => window.__closing.finish(),
};
window.__closing = {
  async operate() {
    if (!mounted || !fixture?.operation)
      throw new Error('Missing operation fixture');
    operations = await runStageClosingOperations(
      mounted,
      fixture,
      observation.frames,
      work,
      __IR0_LANE__ === 'L',
    );
  },
  async finish(): Promise<StageClosingPage> {
    if (!mounted || !fixture) throw new Error('Prepare before finish');
    const mountStart = mounted.mount.startedAt;
    if (mountStart === undefined || mounted.mount.firstPaintedMs === undefined)
      throw new Error('Missing paint milestone');
    const end = fixture.operation
      ? operations[operations.length - 1]?.end
      : fixture.mount
        ? mountStart + 1000
        : performance.now();
    if (end === undefined) throw new Error('Missing operation window');
    if (fixture.mount && !fixture.operation)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, end - performance.now())),
      );
    await new Promise((resolve) => setTimeout(resolve, 150));
    await afterPaint();
    observation.stop();
    operations = finalizeStageClosingOperations(
      operations,
      observation.frames,
      work,
    );
    if (stream) {
      const start = stream.startedAt;
      stream.validationRuns = validationStarts.filter(
        (at) => at >= start,
      ).length;
    }
    const target = mounted.currentHandle().findNode(fixture.target);
    return {
      start: started,
      end,
      observedUntil: performance.now(),
      events: observation.events,
      firstInputs: observation.firstInputs,
      frames: observation.frames,
      handlers: observation.handlers,
      validations: observation.validations,
      supported: observation.supported,
      mount: mounted.mount,
      ...(stream ? { stream } : {}),
      final: {
        inputs: container.querySelectorAll('input,select').length,
        counter: 0,
        targetValue: fixture.mount ? '' : String(target?.value),
        branch: null,
      },
      closing: {
        operations,
        validatorWork: work,
        mountPostPaintBusy: readPostPaintBusy(
          observation.frames,
          work,
          mountStart + mounted.mount.firstPaintedMs,
          mountStart + 1000,
        ),
        legacyReset: __IR0_LANE__ === 'L' && fixture.operation === 'reset',
      },
    };
  },
};
