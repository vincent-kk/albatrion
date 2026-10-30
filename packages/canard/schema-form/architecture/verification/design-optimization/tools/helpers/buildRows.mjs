import { buildBranchRows } from './buildBranchRows.mjs';

/** Return the fixed canonical rows or diagnostic size families; N denotes form size, not write count. */
export function buildRows(probes, branchSwitch = false) {
  if (branchSwitch) return buildBranchRows();
  if (!probes)
    return [
      { id: 'mount-oneOf-80', operation: 'mount', shape: 'oneOf', n: 80 },
      { id: 'mount-flat-1000', operation: 'mount', shape: 'flat', n: 1000 },
      {
        id: 'mount-nested-d6-f4',
        operation: 'mount',
        shape: 'nested',
        n: 4096,
      },
      { id: 'single-flat-1000', operation: 'single', shape: 'flat', n: 1000 },
      {
        id: 'single-nested-d6-f4',
        operation: 'single',
        shape: 'nested',
        n: 4096,
      },
      { id: 'switch-oneOf-80', operation: 'switch', shape: 'oneOf', n: 80 },
      { id: 'bulk-flat-2000', operation: 'bulk', shape: 'flat', n: 2000 },
      { id: 'bulk-nested-d6-f4', operation: 'bulk', shape: 'nested', n: 4096 },
    ];
  return [
    ...[0, 100, 1000, 4000].map((n) => ({
      id: `switch-siblings-${n}`,
      operation: 'switch',
      shape: 'siblings',
      siblings: n,
      n,
    })),
    ...[false, true].flatMap((gated) =>
      [250, 1000, 4000, 8000].map((n) => ({
        id: `leaf-${gated ? 'gate' : 'plain'}-${n}`,
        operation: 'leaf',
        shape: 'siblings',
        siblings: n,
        gated,
        n,
      })),
    ),
    ...[1000, 2500, 5000, 10000].map((n) => ({
      id: `mount-blueprint-${n}`,
      operation: 'mount',
      shape: 'flat',
      n,
    })),
  ];
}
