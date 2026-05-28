import fs from 'node:fs';
import path from 'node:path';

/**
 * Parse a V8 `.heapsnapshot` and aggregate shallow self-size + instance
 * count BY constructor name. Isolates schema-form node classes
 * (ObjectNode, ArrayNode, StringNode, ...) from React fiber / JSDOM noise
 * — those share the heap but have different constructor names.
 *
 * The `.heapsnapshot` format (V8):
 *   snapshot.meta.node_fields  : field layout per node, e.g.
 *     ["type","name","id","self_size","edge_count","trace_node_id",...]
 *   snapshot.meta.node_types[0]: the node-type enum table
 *   nodes  : flat Int array, node_fields.length ints per node
 *   strings: the string table; a node's `name` field indexes into it
 *
 * For type === "object" nodes, `name` is the constructor name. We sum
 * `self_size` (shallow) and count per name. Shallow size, not retained —
 * retained needs a dominator tree; shallow is the honest, cheap proxy for
 * "how big is one node of this class".
 *
 * Usage:
 *   node --import tsx src/utils/parse-heapsnapshot.ts <file.heapsnapshot> [--top=40] [--filter=Node]
 */

interface Snapshot {
  snapshot: {
    meta: { node_fields: string[]; node_types: (string | string[])[] };
    node_count: number;
  };
  nodes: number[];
  strings: string[];
}

function parseFlag(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : fallback;
}

// Schema-form node + infra class names worth highlighting.
const SCHEMA_FORM_CLASSES = new Set([
  'ObjectNode',
  'ArrayNode',
  'StringNode',
  'NumberNode',
  'BooleanNode',
  'NullNode',
  'VirtualNode',
  'BranchStrategy',
  'TerminalStrategy',
  'NodeEventManager',
  'AbstractNode',
]);

function main() {
  const file = process.argv[2];
  if (!file || file.startsWith('--')) {
    console.error(
      'usage: parse-heapsnapshot.ts <file.heapsnapshot> [--top=N] [--filter=substr]',
    );
    process.exit(1);
  }
  const top = parseInt(parseFlag('top', '40'), 10);
  const filter = parseFlag('filter', '');

  const snap: Snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  const fields = snap.snapshot.meta.node_fields;
  const stride = fields.length;
  const typeIdx = fields.indexOf('type');
  const nameIdx = fields.indexOf('name');
  const sizeIdx = fields.indexOf('self_size');

  // node_types[typeIdx] is the enum of type strings; "object" entries have
  // a constructor name in the `name` field.
  const typeEnum = snap.snapshot.meta.node_types[typeIdx] as string[];

  const byCtor = new Map<string, { count: number; bytes: number }>();
  const nodes = snap.nodes;
  for (let i = 0; i < nodes.length; i += stride) {
    const typeName = typeEnum[nodes[i + typeIdx]];
    if (typeName !== 'object') continue;
    const ctor = snap.strings[nodes[i + nameIdx]];
    const size = nodes[i + sizeIdx];
    const cur = byCtor.get(ctor) ?? { count: 0, bytes: 0 };
    cur.count += 1;
    cur.bytes += size;
    byCtor.set(ctor, cur);
  }

  const rows = [...byCtor.entries()]
    .map(([ctor, v]) => ({ ctor, ...v, perInstance: v.bytes / v.count }))
    .filter((r) => (filter ? r.ctor.includes(filter) : true))
    .sort((a, b) => b.bytes - a.bytes);

  const fmt = (n: number) =>
    n < 1024
      ? `${n}B`
      : n < 1024 * 1024
        ? `${(n / 1024).toFixed(1)}KB`
        : `${(n / (1024 * 1024)).toFixed(2)}MB`;

  console.log(`# heapsnapshot constructor breakdown — ${path.basename(file)}`);
  console.log(`total object constructors: ${byCtor.size}\n`);

  console.log('## schema-form node classes');
  console.log('| constructor | count | shallow total | per-instance |');
  console.log('| --- | --- | --- | --- |');
  for (const r of rows.filter((r) => SCHEMA_FORM_CLASSES.has(r.ctor))) {
    console.log(
      `| ${r.ctor} | ${r.count} | ${fmt(r.bytes)} | ${r.perInstance.toFixed(0)}B |`,
    );
  }

  console.log(`\n## top ${top} constructors by shallow total`);
  console.log('| constructor | count | shallow total | per-instance |');
  console.log('| --- | --- | --- | --- |');
  for (const r of rows.slice(0, top)) {
    const mark = SCHEMA_FORM_CLASSES.has(r.ctor) ? ' ⬅' : '';
    console.log(
      `| ${r.ctor}${mark} | ${r.count} | ${fmt(r.bytes)} | ${r.perInstance.toFixed(0)}B |`,
    );
  }
}

main();
