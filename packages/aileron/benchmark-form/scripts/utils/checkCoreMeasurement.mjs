import { coreObservability } from '../coreObservability.mjs';
import { parseCoreCaseId } from './parseCoreCaseId.mjs';

/** Nominal rAF periods and tolerance, mirroring isCoreFrameIntervalNominal.ts. */
const FRAME_PERIODS_MS = [1000 / 60, 1000 / 120];
/** Maximum absolute deviation in milliseconds from a supported nominal rAF period. */
const FRAME_TOLERANCE_MS = 3;

/**
 * Check one measurement against the observability table.
 * @param {string} id - Core case identifier.
 * @param {string} variant - candidate, baseline or control.
 * @param {number} index - Sample index for messages.
 * @param {object} measurement - One CoreMeasurement.
 * @param {{ requireObserved: boolean, require60Hz?: boolean }} options - Whether "required" metrics must be non-null (checkers) or may be null (page-level leniency).
 * @returns {string[]} Problems; empty when the measurement conforms.
 */
export function checkCoreMeasurement(id, variant, index, measurement, options) {
  const row = coreObservability[parseCoreCaseId(id).key];
  const where = `${id} ${variant}[${index}]`;
  const problems = [];
  if (!row) return [`${where}: no observability row`];
  const { metrics, counts } = measurement;
  const finite = (value) => typeof value === 'number' && Number.isFinite(value);
  if (!finite(measurement.durationMs) || measurement.durationMs < 0)
    problems.push(`${where}: durationMs is not finite`);
  for (const [name, expectation] of Object.entries(row.metrics)) {
    const value = metrics[name];
    if (expectation === 'null' && value !== null)
      problems.push(`${where}: ${name} must be null, got ${value}`);
    else if (expectation === 'number' && !finite(value))
      problems.push(`${where}: ${name} must be finite, got ${value}`);
    else if (expectation === 'nullable' && value !== null && !finite(value))
      problems.push(`${where}: ${name} must be null or finite, got ${value}`);
    else if (
      expectation === 'required' &&
      (options.requireObserved
        ? !finite(value)
        : value !== null && !finite(value))
    )
      problems.push(`${where}: ${name} is required, got ${value}`);
  }
  const nominal = FRAME_PERIODS_MS.find(
    (period) =>
      Math.abs(metrics.frameIntervalMs - period) <= FRAME_TOLERANCE_MS,
  );
  if (nominal === undefined || metrics.frameIntervalNominalMs !== nominal)
    problems.push(
      `${where}: frameIntervalNominalMs ${metrics.frameIntervalNominalMs} disagrees with supported frameIntervalMs ${metrics.frameIntervalMs}`,
    );
  if (
    options.require60Hz &&
    !(
      metrics.frameIntervalNominalMs === 1000 / 60 &&
      metrics.frameIntervalMs >= 13.7 &&
      metrics.frameIntervalMs <= 19.7
    )
  )
    problems.push(
      `${where}: CI requires 60 Hz with frameIntervalMs 13.7–19.7 ms`,
    );
  for (const name of ['frameBudget60', 'frameBudget120']) {
    const budget = metrics[name];
    if (
      !budget ||
      !finite(budget.frameOverflowMs) ||
      budget.frameOverflowMs < 0 ||
      !Number.isInteger(budget.overBudgetFrames) ||
      budget.overBudgetFrames < 0 ||
      budget.overBudgetFrames > metrics.frames
    )
      problems.push(
        `${where}: ${name} must contain finite nonnegative overflow and a bounded frame count`,
      );
  }
  if (
    metrics.frameBudget60?.frameOverflowMs !== metrics.frameOverflowMs ||
    metrics.frameBudget60?.overBudgetFrames !== metrics.overBudgetFrames
  )
    problems.push(
      `${where}: primary frame budget disagrees with existing fields`,
    );
  if (
    metrics.frameBudget120?.frameOverflowMs < metrics.frameOverflowMs ||
    metrics.frameBudget120?.overBudgetFrames < metrics.overBudgetFrames
  )
    problems.push(
      `${where}: secondary frame budget cannot overflow less than primary`,
    );
  if (!(metrics.frames >= 2))
    problems.push(`${where}: frames ${metrics.frames} < 2`);
  if (counts.failedCalls !== 0)
    problems.push(`${where}: failedCalls ${counts.failedCalls}`);
  if (counts.markers !== row.markers)
    problems.push(`${where}: markers ${counts.markers} ≠ ${row.markers}`);
  if (
    row.lifetimeCompiles === 'zero'
      ? counts.lifetimeCompiles !== 0
      : !(counts.lifetimeCompiles >= 1)
  )
    problems.push(
      `${where}: lifetimeCompiles ${counts.lifetimeCompiles} violates ${row.lifetimeCompiles}`,
    );
  if (
    row.validations === 'zero'
      ? counts.validations !== 0 || counts.compiles !== 0
      : !(counts.validations >= 1)
  )
    problems.push(
      `${where}: validations ${counts.validations} / compiles ${counts.compiles} violate ${row.validations}`,
    );
  if (
    row.minExactWrites !== null &&
    !(metrics.feedbackClasses.exact >= row.minExactWrites)
  )
    problems.push(
      `${where}: exact writes ${metrics.feedbackClasses.exact} < ${row.minExactWrites}`,
    );
  return problems;
}
