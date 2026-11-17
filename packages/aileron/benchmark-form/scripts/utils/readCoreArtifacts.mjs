import { readFileSync } from 'node:fs';

/**
 * Read the runner's samples and summary artifacts.
 * @param {string} samplesPath - samples.json: case id → attempt groups with per-variant measurements.
 * @param {string} summaryPath - summary.json written by the runner.
 * @returns {{ samples: Record<string, { attempt: number, samples: Record<string, object[]> }[]>, summary: object }} Parsed artifacts.
 */
export function readCoreArtifacts(samplesPath, summaryPath) {
  return {
    samples: JSON.parse(readFileSync(samplesPath, 'utf8')),
    summary: JSON.parse(readFileSync(summaryPath, 'utf8')),
  };
}
