import type {
  ClosingOperation,
  StageClosingFixture,
  ValidatorWork,
} from '../../stageClosingTypes';
import type { Entry } from '../../types';
import { afterPaint } from '../afterPaint';
import type { mountFixture } from '../mountFixture';
import { readPostPaintBusy } from './readPostPaintBusy';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';
import { waitForStageClosingDeadline } from './waitForStageClosingDeadline';

/** Browser-owned operation loop retains ten complete one-second slots and asserts public node identity. */
export async function runStageClosingOperations(
  mounted: Awaited<ReturnType<typeof mountFixture>>,
  fixture: StageClosingFixture,
  frames: Entry[],
  work: ValidatorWork[],
  legacy: boolean,
): Promise<ClosingOperation[]> {
  const operations: ClosingOperation[] = [];
  for (let index = 1; index <= rules.operations; index++) {
    if (fixture.id === 'reset-flat-500-replace')
      await mounted.rerender({ ...fixture.schema, title: 'replace-' + index });
    const handle = mounted.currentHandle();
    const before = handle.node;
    if (!before) throw new Error('Missing root before operation');
    const start = performance.now();
    const pending =
      fixture.operation === 'validate'
        ? handle.validate()
        : fixture.operation === 'rebuild'
          ? handle.rebuild()
          : handle.reset();
    const callDuration = performance.now() - start;
    const painted = afterPaint().then(() => performance.now());
    const resolutionTime =
      fixture.operation === 'validate'
        ? await Promise.resolve(pending).then(() => performance.now() - start)
        : undefined;
    const firstPaint = await painted;
    const after = mounted.currentHandle().node;
    if (!after) throw new Error('Missing root after operation');
    const nodeChanged = after !== before;
    const expectedNodeChanged =
      fixture.operation !== 'validate' &&
      (legacy || fixture.id !== 'reset-flat-500-same');
    if (nodeChanged !== expectedNodeChanged)
      throw new Error(
        'Node identity assertion failed: ' + fixture.id + ' operation ' + index,
      );
    const end = start + rules.slotMs;
    await waitForStageClosingDeadline(
      end,
      () => performance.now(),
      (milliseconds) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds)),
    );
    const relevant = frames.filter(
      (frame) =>
        frame.startTime < end && frame.startTime + frame.duration > start,
    );
    operations.push({
      index,
      start,
      end,
      firstPaint,
      callDuration,
      nextPainted: firstPaint - start,
      resolutionTime,
      nodeChanged,
      expectedNodeChanged,
      ...(fixture.id === 'reset-flat-500-replace'
        ? { schemaTitle: 'replace-' + index }
        : {}),
      longestFrame: Math.max(0, ...relevant.map((frame) => frame.duration)),
      longFrameCount: relevant.filter((frame) => frame.duration >= 50).length,
      postPaintBusy: readPostPaintBusy(frames, work, firstPaint, end),
    });
  }
  return operations;
}
