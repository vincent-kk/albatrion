// usage: node phases.mjs -> inclusive % of named engine functions across all prof/<scenario>/loop.cpuprofile
import fs from 'node:fs';

import context from './context.mjs';

const scen = process.argv[2]?.split(',') ?? [
  'mount',
  'mount-bp',
  'switch',
  'switch-distinct',
  'switch-wide',
  'wave',
  'leaf-wide-oneof',
];
const phases = [
  'blueprint',
  'buildNodes',
  'fieldNodeFactory',
  'loadFieldNodeAtMount',
  'dispatchMount',
  'writeFieldNode',
  'markWrite',
  'transitionSettlement',
  'computeNode',
  'selectChildren',
  'selectEntryStep',
  'primeHost',
  'registerPresenceChanges',
  'updateOutput',
  'assembleObject',
  'preserveReferences',
  'sameValue',
  'evaluateGate',
  'flushPendingGateReads',
  'register',
  'registerRecalculation',
  'affected',
  'affectedByPresence',
  'finishSettlement',
  'commitSettlement',
  'markCommitDeliveries',
  'commitGlobalState',
  'markFieldNodeEvent',
  'updateInactiveValuesMemo',
  'setLatentRaw',
  'runDeliveryWaves',
  'deliverWave',
  'compareDocumentOrder',
  'add',
  'delete',
  'consume',
  'set',
  'hasOwnProperty',
  'writeObjectKey',
  '(garbage collector)',
];
const table = {};
for (const s of scen) {
  const p = JSON.parse(
    fs.readFileSync(new URL(`${s}/loop.cpuprofile`, context.profiles), 'utf8'),
  );
  const byId = new Map(p.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of p.nodes)
    for (const c of n.children ?? []) parent.set(c, n.id);
  const inc = new Map();
  let total = 0;
  p.samples.forEach((id, i) => {
    const dt = p.timeDeltas[i];
    if (byId.get(id).callFrame.functionName === '(idle)') return;
    total += dt;
    const seen = new Set();
    for (let x = id; x !== undefined; x = parent.get(x)) {
      const f = byId.get(x).callFrame;
      const key = [
        'add',
        'delete',
        'consume',
        'set',
        'register',
        'affected',
        'affectedByPresence',
      ].includes(f.functionName)
        ? `${f.functionName}@${f.lineNumber}`
        : f.functionName;
      if (!seen.has(key)) {
        seen.add(key);
        inc.set(key, (inc.get(key) ?? 0) + dt);
      }
    }
  });
  // collapse class-method names (add/delete/set) by summing their per-line keys
  const get = (name) => {
    let v = 0;
    for (const [k, t] of inc)
      if (k === name || k.startsWith(`${name}@`)) v += t;
    return v;
  };
  table[s] = Object.fromEntries(
    phases.map((n) => [n, +((100 * get(n)) / total).toFixed(1)]),
  );
}
const pad = (x, w) => String(x).padStart(w);
console.log(
  pad('phase (inclusive %)', 26) + scen.map((s) => pad(s, 16)).join(''),
);
for (const n of phases)
  console.log(
    pad(n, 26) + scen.map((s) => pad(table[s][n] || '-', 16)).join(''),
  );
