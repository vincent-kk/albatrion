import { expect, it } from 'vitest';

import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../type';
import fixtures from '../../../__tests__/fixtures/ownedInlineMounts.json';
import type { AnalysisContext } from '../type';
import { populateNodeChildren } from '../populateNodeChildren';
import { countChildEnumeration } from './fixtures/countChildEnumeration';

it.each([
  { name: 'nested-d5-f4', nodes: 1365, objects: 341, children: 1364 },
  { name: 'flat-500', nodes: 501, objects: 1, children: 500 },
])('enumerates each $name child once without intermediate Maps', (expected) => {
  const fixture = fixtures.find((row) => row.name === expected.name)!;
  const graph = blueprint(structuredClone(fixture.schema) as BlueprintSchema);
  expect(graph.nodes).toHaveLength(expected.nodes);
  const context = {
    fragments: graph.fragments,
    options: {},
  } as AnalysisContext;
  const hosts = graph.nodes.filter((node) => node.kind === 'object');
  expect(hosts).toHaveLength(expected.objects);
  let visits = 0;
  let allocations = 0;
  const results = [];
  for (const host of hosts) {
    const result = countChildEnumeration(context, host);
    results.push(result);
    visits += result.snapshotEntries + result.mapEntries;
    allocations += result.mapAllocations;
    expect(result.inputs.map((row) => row.path)).toEqual(
      host.childEntries.map((entry) => entry.node.path),
    );
    expect(result.inputs.every((row) => row.inputs.length === 1)).toBe(true);
  }
  console.log(`CHILD105 ${expected.name} hosts=${hosts.length} visits=${visits} maps=${allocations}`);
  expect(visits).toBe(expected.children);
  // Virtual grouping keeps its existing empty Map; property and tuple Maps disappear.
  expect(allocations).toBe(expected.objects);
  for (const result of results) {
    expect(result.snapshots).toBe(1);
    expect(result.snapshotEntries).toBe(result.inputs.length);
    expect(result.mapAllocations).toBe(1);
    expect(result.mapEntries).toBe(0);
    expect(result.mapPasses).toBe(1);
  }
});

it('keeps gated and multiple-contribution hosts on the existing aggregation path', () => {
  for (const schema of [
    { type: 'object', properties: { a: { type: 'string' } }, controls: { children: [{ targets: ['a'], controls: { active: true } }] } },
    { type: 'object', properties: { a: { type: 'string' } }, allOf: [{ properties: { b: { type: 'number' } } }] },
    { type: 'object', controls: { active: true }, properties: { a: { type: 'string' } } },
  ]) {
    const graph = blueprint(schema as BlueprintSchema);
    const result = countChildEnumeration(
      { fragments: graph.fragments, options: {} } as AnalysisContext,
      graph.nodes[0],
    );
    expect(result.mapAllocations).toBe(3);
    expect(result.mapEntries).toBe(graph.nodes[0].childEntries.length);
  }
});

it('captures property values and own-key order before recursive construction', () => {
  const original = { type: 'number' };
  const properties = Object.assign(Object.create({ inherited: original }), {
    '10': { type: 'string' },
    '2': original,
    'a/b~c': original,
  });
  const graph = blueprint({ type: 'object', properties });
  const inputs: unknown[] = [];
  const paths: string[] = [];
  populateNodeChildren(
    { fragments: graph.fragments, options: {} } as AnalysisContext,
    { ...graph.nodes[0], childEntries: [] },
    (_context, children, path) => {
      inputs.push(children[0].schema);
      paths.push(path);
      delete properties['10'];
      properties['a/b~c'] = { type: 'boolean' };
      properties.added = original;
      return [];
    },
  );
  expect(paths).toEqual(['/2', '/10', '/a~1b~0c']);
  expect(inputs).toEqual([original, { type: 'string' }, original]);
});
