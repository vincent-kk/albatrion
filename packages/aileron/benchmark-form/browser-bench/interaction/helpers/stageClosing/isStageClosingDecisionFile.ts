/** Classify package-relative non-test decision code independently of its observed hash. */
export function isStageClosingDecisionFile(file: string) {
  if (
    /(^|\/)(__tests__|tests?)\//.test(file) ||
    /\.(test|spec)\.[^/]+$/.test(file)
  )
    return false;
  const helpers = 'browser-bench/interaction/helpers/';
  return (
    file.startsWith(helpers + 'stageClosing/') ||
    file.startsWith(helpers + 'validationAfterPaint/') ||
    file.startsWith(helpers + 'summarize') ||
    file === helpers + 'deriveStageClosingResults.ts' ||
    file === helpers + 'checkStageClosingResults.ts' ||
    file === helpers + 'deriveValidationAfterPaintResults.ts' ||
    file.startsWith('fixtures/input-responsiveness/')
  );
}
