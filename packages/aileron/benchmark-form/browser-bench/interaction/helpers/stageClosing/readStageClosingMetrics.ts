import type { StageClosingPage } from '../../stageClosingTypes';
import { quantile } from '../validationAfterPaint/quantile';
import { readInteractionMetrics } from '../validationAfterPaint/readInteractionMetrics';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** Page-level operation medians keep the first operation visible separately. */
export function readStageClosingMetrics(
  page: StageClosingPage,
  first = false,
): Record<string, number | null> {
  const operations = first
    ? page.closing.operations.slice(0, 1)
    : page.closing.operations;
  const interaction = readInteractionMetrics(page);
  return {
    handlerP95: quantile(interaction.handler, 0.95),
    eventProcessingP95: quantile(interaction.processing, 0.95),
    durationP95: quantile(
      interaction.duration.length ? interaction.duration : interaction.handler,
      0.95,
    ),
    arrivalP95: quantile(
      page.validations.map((v) => v.arrivalMs),
      0.95,
    ),
    undelivered: page.handlers.filter(
      (h) => !page.validations.some((v) => v.sequence === h.sequence),
    ).length,
    firstPainted: page.mount.firstPaintedMs ?? null,
    eagerPainted: page.mount.eagerPaintedMs,
    callDuration: quantile(operations.map((op) => op.callDuration)),
    nextPainted: quantile(operations.map((op) => op.nextPainted)),
    resolutionTime: quantile(operations.map((op) => op.resolutionTime)),
    postPaintBusy: operations.length
      ? quantile(operations.map((op) => op.postPaintBusy))
      : page.closing.mountPostPaintBusy,
    flooredLongestFrame: operations.length
      ? quantile(
          operations.map((op) =>
            Math.max(op.longestFrame, rules.operationFrameFloorMs),
          ),
        )
      : null,
    longestFrame: operations.length
      ? quantile(operations.map((op) => op.longestFrame))
      : Math.max(
          0,
          ...page.frames
            .filter(
              (f) =>
                f.startTime < page.end && f.startTime + f.duration > page.start,
            )
            .map((f) => f.duration),
        ),
    longFrameCount: operations.length
      ? quantile(operations.map((op) => op.longFrameCount))
      : page.frames.filter(
          (f) =>
            f.startTime < page.end &&
            f.startTime + f.duration > page.start &&
            f.duration >= 50,
        ).length,
  };
}
