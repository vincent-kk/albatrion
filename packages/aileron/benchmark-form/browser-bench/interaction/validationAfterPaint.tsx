// Loaded by the IR-6 bundle preparer; one frozen product alias determines this page's lane.
import { getValidationAfterPaintFixture } from '../../fixtures/input-responsiveness/getValidationAfterPaintFixture';
import { afterPaint } from './helpers/afterPaint';
import { mountFixture } from './helpers/mountFixture';
import { observePage } from './helpers/observePage';
import type {
  ValidationAfterPaintFixture,
  ValidationAfterPaintPage,
} from './validationAfterPaintTypes';

const container = document.getElementById('root')!;
const observation = observePage(container);
const validationStarts: number[] = [];
let mounted: Awaited<ReturnType<typeof mountFixture>>;
let fixture: ValidationAfterPaintFixture;
let started = 0;
let stream: ValidationAfterPaintPage['stream'];

window.__ir6 = {
  async prepare(id) {
    fixture = getValidationAfterPaintFixture(id);
    mounted = await mountFixture(container, fixture, observation, {
      onFirstPaint: () => {
        if (fixture.firstKey) {
          started = observation.begin();
          void window.__ir6FirstKey();
        }
      },
      onValidationRun: () => validationStarts.push(performance.now()),
    });
    if (!fixture.firstKey)
      await new Promise((resolve) => setTimeout(resolve, 150));
    return fixture;
  },
  begin() {
    started = observation.begin();
    if (fixture.mount) started = mounted.mount.startedAt!;
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
    const startedAt = performance.now();
    const scriptMs: number[] = [];
    for (let index = 0; index < fixture.streamFrames!; index++) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          const before = performance.now();
          mounted.handle
            .findNode(fixture.target)!
            .setValue('a'.repeat(index + 1));
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
      writeFrames: fixture.streamFrames!,
      validationRuns: 0,
    };
  },
  async finish() {
    const end = fixture.mount
      ? mounted.mount.startedAt! + 1000
      : performance.now();
    if (fixture.mount)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, end - performance.now())),
      );
    await new Promise((resolve) => setTimeout(resolve, 150));
    await afterPaint();
    observation.stop();
    if (stream)
      stream.validationRuns = validationStarts.filter(
        (at) => at >= stream!.startedAt,
      ).length;
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
        targetValue: fixture.mount
          ? ''
          : String(mounted.handle.findNode(fixture.target)!.value),
        branch: null,
      },
    };
  },
};
