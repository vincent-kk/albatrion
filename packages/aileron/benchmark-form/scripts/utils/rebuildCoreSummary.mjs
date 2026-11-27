import { tsImport } from 'tsx/esm/api';

/** Markers delimiting the generated block inside a hand-written report. */
export const CORE_SUMMARY_MARKERS = {
  begin: '<!-- core-summary:begin -->',
  end: '<!-- core-summary:end -->',
};

/** Weighted-exchange reason text stored by summaries written before the English report format, keyed to its current wording. */
const LEGACY_WEIGHTED_REASONS = new Map([
  ['< 50 ms 관측 불가', '< 50 ms not observable'],
]);

/**
 * Rewrite stored weighted-exchange reasons into the current wording so older artifacts still compare.
 * @param {object | undefined} weighted - summary.json `weighted` content.
 * @returns {object | undefined} A JSON copy with legacy reasons replaced.
 */
const migrateWeightedReasons = (weighted) => {
  let text = JSON.stringify(weighted);
  if (text === undefined) return undefined;
  for (const [legacy, current] of LEGACY_WEIGHTED_REASONS)
    text = text.split(legacy).join(current);
  return JSON.parse(text);
};

/**
 * Recompute every case result and the weighted exchanges from raw samples with the harness's own code and render them.
 * @param {object} summary - summary.json content.
 * @param {Record<string, { attempt: number, samples: Record<string, object[]> }[]>} samples - samples.json content.
 * @returns {Promise<{ markdown: string, mismatches: string[] }>} The rendered block and every field that differs from summary.json.
 */
export async function rebuildCoreSummary(summary, samples) {
  const load = (path) =>
    tsImport(`../../browser-bench/core/helpers/${path}`, import.meta.url);
  const { buildCoreCaseResult } = await load(
    'buildCoreCaseResult/buildCoreCaseResult.ts',
  );
  const { computeCoreWeightedExchange } = await load(
    'computeCoreWeightedExchange.ts',
  );
  const { readCoreWeights } = await load('readCoreWeights.ts');
  const { renderCoreSummary } = await load(
    'renderCoreSummary/renderCoreSummary.ts',
  );
  const normalize = (value) => JSON.parse(JSON.stringify(value));
  const mismatches = [];
  const cases = summary.cases.map((row) => {
    const groups = samples[row.id] ?? [];
    const group =
      groups.find((candidate) => candidate.attempt === row.attempt) ??
      groups[groups.length - 1];
    if (!group) throw new Error(`No sample group for ${row.id}`);
    const rebuilt = normalize(
      buildCoreCaseResult(
        row.id,
        group.attempt,
        group.samples,
        summary.mode === 'compare',
      ),
    );
    if (JSON.stringify(rebuilt) !== JSON.stringify(normalize(row)))
      mismatches.push(`case ${row.id} differs from its raw samples`);
    return rebuilt;
  });
  const weighted =
    summary.mode === 'compare'
      ? normalize({
          blocking: computeCoreWeightedExchange(
            'blockingMs',
            cases,
            readCoreWeights(),
          ),
          feedback: computeCoreWeightedExchange(
            'feedbackCommittedMs',
            cases,
            readCoreWeights(),
          ),
        })
      : undefined;
  if (
    JSON.stringify(weighted) !==
    JSON.stringify(migrateWeightedReasons(summary.weighted))
  )
    mismatches.push('weighted exchange differs from the recomputed cases');
  const rendered = renderCoreSummary({ ...summary, cases, weighted });
  return {
    markdown: `${CORE_SUMMARY_MARKERS.begin}\n${rendered}${CORE_SUMMARY_MARKERS.end}\n`,
    mismatches,
  };
}
