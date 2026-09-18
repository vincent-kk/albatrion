import { parseGraph } from '../../src/utils/object/serialization';
import { checkTextLimit } from '../../src/utils/object/serialization/utils/checkTextLimit';
import { encodeGraph } from '../../src/utils/object/serialization/utils/encodeGraph';

/** Experimental wire compaction; an adapter prototype, not an alternative public codec. */
export function stringifyDenseExperiment(value: unknown): string {
  const [root, nodes] = encodeGraph(value);
  for (const node of nodes) {
    if (node[0] !== 'array') continue;
    const entries = node[2] as [string, unknown][];
    const tokens = [];
    let i = 0;
    while (i < node[1] && entries[i]?.[0] === String(i))
      tokens.push(entries[i++][1]);
    if (i === node[1])
      node.splice(0, node.length, 'array-dense', tokens, entries.slice(i));
  }
  const text = JSON.stringify(['winglet.graph', 1, root, nodes]);
  checkTextLimit(text);
  return text;
}

/** Restores experimental wire through the canonical validator; measures adapter cost explicitly. */
export function parseDenseExperiment(text: string): unknown {
  checkTextLimit(text);
  const wire = JSON.parse(text);
  for (const node of wire[3]) {
    if (node[0] !== 'array-dense') continue;
    const tokens = node[1];
    const entries = tokens.map((token: unknown, i: number) => [
      String(i),
      token,
    ]);
    node.splice(
      0,
      node.length,
      'array',
      tokens.length,
      entries.concat(node[2]),
    );
  }
  return parseGraph(JSON.stringify(wire));
}
