import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

import { buildCoreCaseResult } from './helpers/buildCoreCaseResult/buildCoreCaseResult';
import { computeCoreWeightedExchange } from './helpers/computeCoreWeightedExchange';
import { observeCpu } from './helpers/observeCpu';
import { parseCoreOptions } from './helpers/parseCoreOptions';
import { prepareCoreBaseline } from './helpers/prepareCoreBaseline';
import { prepareCoreBundles } from './helpers/prepareCoreBundles';
import { readAncestorPids } from './helpers/readAncestorPids';
import { readCoreWeights } from './helpers/readCoreWeights';
import { renderCoreSummary } from './helpers/renderCoreSummary/renderCoreSummary';
import { runCoreGroup } from './helpers/runCoreGroup';
import type { CoreSummary } from './reportTypes';

/**
 * Run the production browser benchmark and persist portable advisory artifacts.
 * @param args - CLI flags validated before any build or browser work.
 * @param repository - Candidate checkout; its built products are measured as supplied.
 * @param cwd - Directory resolving user-provided output and prepared-baseline paths.
 * @param ci - Records CPU quiet evidence without refusing CI measurements.
 * @returns Completed summary; build, quiet-gate and browser failures throw.
 */
export async function runCoreBenchmark(
  args: string[],
  repository: string,
  cwd: string,
  ci: boolean,
) {
  const options = parseCoreOptions(args);
  const weights = readCoreWeights();
  const output = resolve(cwd, options.out);
  mkdirSync(output, { recursive: true });
  const baseline = prepareCoreBaseline(
    repository,
    options.baseline,
    options.baselineDir ? resolve(cwd, options.baselineDir) : undefined,
    output,
  );
  const bundles = mkdtempSync(join(output, '.bundles-'));
  try {
    const hashes = await prepareCoreBundles(repository, bundles, baseline.root);
    const quiet = await observeCpu(30000, readAncestorPids());
    writeFileSync(
      join(output, 'quiet.json'),
      JSON.stringify(
        { ci, approved: quiet.heavy.length === 0, ...quiet },
        null,
        2,
      ) + '\n',
    );
    if (!ci && quiet.heavy.length)
      throw new Error(
        'CPU quiet gate refused start; see quiet.json and retry when external CPU is quiet',
      );
    const browser = await chromium.launch({ headless: true });
    const summary: CoreSummary = {
      mode: baseline.root ? 'compare' : 'measure',
      runs: options.runs,
      warmup: options.warmup,
      cases: [],
    };
    const raw: Record<string, object[]> = {};
    try {
      for (const id of options.cases) {
        raw[id] = [];
        for (const attempt of [1, 2] as const) {
          const samples = await runCoreGroup(
            browser,
            bundles,
            id,
            options.runs,
            options.warmup,
            Boolean(baseline.root),
          );
          raw[id].push({ attempt, samples });
          const row = buildCoreCaseResult(
            id,
            attempt,
            samples,
            Boolean(baseline.root),
          );
          if (row.verdict === 'retry') continue;
          summary.cases.push(row);
          console.log(
            `${id}: ${row.verdict} median=${row.candidate.medianMs.toFixed(3)}ms`,
          );
          if (ci && row.verdict === 'slower')
            console.log(
              `::warning title=Browser benchmark slower::${id} is slower beyond its noise threshold (advisory)`,
            );
          break;
        }
      }
    } finally {
      await browser.close();
    }
    if (baseline.root)
      summary.weighted = {
        blocking: computeCoreWeightedExchange(
          'blockingMs',
          summary.cases,
          weights,
        ),
        feedback: computeCoreWeightedExchange(
          'feedbackCommittedMs',
          summary.cases,
          weights,
        ),
      };
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repository,
      encoding: 'utf8',
    }).trim();
    const baselineRevision = baseline.root
      ? execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: baseline.root,
          encoding: 'utf8',
        }).trim()
      : null;
    writeFileSync(
      join(output, 'summary.json'),
      JSON.stringify(
        { ...summary, revision, baselineRevision, hashes },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(
      join(output, 'samples.json'),
      JSON.stringify(raw, null, 2) + '\n',
    );
    writeFileSync(join(output, 'summary.md'), renderCoreSummary(summary));
    console.log(renderCoreSummary(summary));
    return summary;
  } finally {
    rmSync(bundles, { recursive: true, force: true });
    baseline.cleanup();
  }
}
