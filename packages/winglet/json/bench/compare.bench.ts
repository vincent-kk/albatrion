import { bench, describe } from 'vitest';

import { compare } from '@/json/JSONPointer/utils/patch/compare/compare';

/** A flat JSON document with one numeric value per measured node. */
type JsonDocument = Record<string, number>;

/** Inputs for one document-size and change-density combination. */
interface CompareScenario {
  name: string;
  source: JsonDocument;
  target: JsonDocument;
}

/**
 * Builds a JSON document with the requested number of numeric nodes.
 *
 * @param nodeCount - The number of properties to create
 * @returns A flat JSON document with stable keys and values
 */
const createDocument = (nodeCount: number): JsonDocument => {
  const document: JsonDocument = {};
  for (let index = 0; index < nodeCount; index++)
    document[`node${index}`] = index;
  return document;
};

/**
 * Builds one reusable pair of comparison inputs.
 *
 * @param nodeCount - The number of nodes in each document
 * @param changedPercent - The percentage of target nodes whose values differ
 * @returns Source and target documents with a benchmark label
 */
const createScenario = (
  nodeCount: number,
  changedPercent: number,
): CompareScenario => {
  const source = createDocument(nodeCount);
  if (changedPercent === 0)
    return {
      name: `${nodeCount} nodes — 0% changed (identical-reference early exit)`,
      source,
      target: source,
    };

  const target = { ...source };
  const changedNodeCount = (nodeCount * changedPercent) / 100;
  for (let index = 0; index < changedNodeCount; index++)
    target[`node${index}`] = -index - 1;
  return {
    name: `${nodeCount} nodes — ${changedPercent}% changed`,
    source,
    target,
  };
};

/** Precomputed inputs keep document creation and mutation outside benchmark timing. */
const scenarios = [
  createScenario(100, 0),
  createScenario(100, 1),
  createScenario(100, 50),
  createScenario(1000, 0),
  createScenario(1000, 1),
  createScenario(1000, 50),
];

describe('compare — document size by change density', () => {
  for (const { name, source, target } of scenarios)
    bench(name, () => compare(source, target));
});
