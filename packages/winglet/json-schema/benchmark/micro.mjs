// Isolate the per-node "which applicator keywords are present" strategy.
const KEYWORDS = [
  "$defs",
  "definitions",
  "additionalProperties",
  "not",
  "if",
  "then",
  "else",
  "allOf",
  "anyOf",
  "oneOf",
  "prefixItems",
  "items",
  "properties",
];
const KW_MAP = new Map(KEYWORDS.map((k, i) => [k, { keyword: k, order: i }]));
const hop = Object.prototype.hasOwnProperty;

// Representative node population (what a real scan sees): mostly leaves.
function makePop() {
  const nodes = [];
  for (let i = 0; i < 8000; i++)
    nodes.push({ type: "string", minLength: i % 5 }); // leaf, 2 keys
  for (let i = 0; i < 1000; i++)
    nodes.push({ type: "number", minimum: 0, maximum: 100, description: "d" }); // leaf, 4 keys
  for (let i = 0; i < 800; i++)
    nodes.push({ type: "object", properties: { a: {} } }); // 1 applicator (properties)
  for (let i = 0; i < 150; i++)
    nodes.push({
      type: "object",
      properties: { a: {} },
      additionalProperties: {},
    }); // 2 applicators
  for (let i = 0; i < 50; i++)
    nodes.push({ allOf: [{}], anyOf: [{}], if: {}, then: {} }); // 4 applicators
  for (let i = 0; i < 200; i++)
    nodes.push({
      type: "string",
      title: "t",
      description: "d",
      minLength: 1,
      maxLength: 9,
      pattern: "^x$",
      format: "email",
      default: "",
      examples: [],
    }); // validator-heavy 9 keys
  return nodes;
}
const pop = makePop();

function stratHOP(node) {
  // 13x hasOwnProperty (current)
  let hits = 0;
  for (let d = 0; d < KEYWORDS.length; d++) {
    if (hop.call(node, KEYWORDS[d])) {
      const v = node[KEYWORDS[d]];
      if (v !== undefined) hits++;
    }
  }
  return hits;
}
function stratForInMap(node) {
  // for..in + Map.get, collect matched
  let matched = null;
  for (const key in node) {
    const desc = KW_MAP.get(key);
    if (desc !== undefined) (matched ||= []).push(desc);
  }
  if (matched === null) return 0;
  if (matched.length > 1) matched.sort((a, b) => a.order - b.order);
  let hits = 0;
  for (let m = 0; m < matched.length; m++) {
    const v = node[matched[m].keyword];
    if (v !== undefined) hits++;
  }
  return hits;
}
function stratKeysMap(node) {
  // Object.keys + Map.get
  const keys = Object.keys(node);
  let matched = null;
  for (let i = 0; i < keys.length; i++) {
    const desc = KW_MAP.get(keys[i]);
    if (desc !== undefined) (matched ||= []).push(desc);
  }
  if (matched === null) return 0;
  if (matched.length > 1) matched.sort((a, b) => a.order - b.order);
  let hits = 0;
  for (let m = 0; m < matched.length; m++) {
    const v = node[matched[m].keyword];
    if (v !== undefined) hits++;
  }
  return hits;
}

function time(fn, iters) {
  // warmup
  for (let w = 0; w < 20; w++) {
    let s = 0;
    for (const n of pop) s += fn(n);
    if (s < 0) throw 0;
  }
  const samples = [];
  for (let r = 0; r < iters; r++) {
    const t0 = performance.now();
    let s = 0;
    for (const n of pop) s += fn(n);
    if (s < 0) throw 0;
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}
// sanity: all strategies agree on hit counts
const a = pop.reduce((s, n) => s + stratHOP(n), 0),
  b = pop.reduce((s, n) => s + stratForInMap(n), 0),
  c = pop.reduce((s, n) => s + stratKeysMap(n), 0);
console.log("hit-count agree:", a === b && b === c, "(", a, b, c, ")");
const N = 400;
console.log("hasOwnProperty x13 :", time(stratHOP, N).toFixed(3), "ms/pass");
console.log(
  "for..in + Map.get  :",
  time(stratForInMap, N).toFixed(3),
  "ms/pass",
);
console.log(
  "Object.keys+Map.get:",
  time(stratKeysMap, N).toFixed(3),
  "ms/pass",
);
