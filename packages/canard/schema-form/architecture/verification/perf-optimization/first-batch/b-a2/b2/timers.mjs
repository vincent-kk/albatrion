// Imported by make.mjs to embed timer definitions in the dense and focused measurement copies.
// Embedded in the copied bundle by make.mjs; no product module imports this file.
export const timerSource = `
let __b2Enabled = false, __b2Hot = null, __b2Stack = [], __b2Metrics = {}, __b2Known = false;
const __b2Depth = new Map();
const __b2Roots = new Set(['markWrite', 'computeStableNode', 'markCommitDeliveries', 'registerRecalculation']);
const __b2Enter = (id, rootName) => {
  if (!__b2Enabled) return null;
  const previousHot = __b2Hot;
  if (!__b2Hot && __b2Roots.has(rootName)) __b2Hot = rootName;
  if (!__b2Hot) return null;
  const key = __b2Hot + ':' + id;
  const depth = __b2Depth.get(key) || 0;
  __b2Depth.set(key, depth + 1);
  const metrics = __b2Metrics[__b2Hot] ??= {};
  const row = metrics[id] ??= { inclusiveMs: 0, selfMs: 0, calls: 0 };
  row.calls++;
  const frame = { id, key, row, outer: !depth, previousHot, childrenMs: 0, start: performance.now() };
  __b2Stack.push(frame);
  return frame;
};
const __b2Exit = (frame) => {
  if (!frame) return;
  const end = performance.now(), elapsed = end - frame.start;
  if (__b2Stack.pop() !== frame) throw new Error('B2 timer stack mismatch');
  if (frame.outer) frame.row.inclusiveMs += elapsed;
  frame.row.selfMs += Math.max(0, elapsed - frame.childrenMs);
  __b2Depth.set(frame.key, __b2Depth.get(frame.key) - 1);
  const parent = __b2Stack.at(-1);
  if (parent) parent.childrenMs += elapsed;
  __b2Hot = frame.previousHot;
};
const __b2Wrap = (id, rootName, raw) => function(...args) {
  if (!__b2Enabled) return Reflect.apply(raw, this, args);
  const frame = __b2Enter(id, rootName);
  const previousKnown = __b2Known;
  if (rootName === 'markWrite') __b2Known = args.length >= 5 && typeof args[4] === 'number';
  try { return Reflect.apply(raw, this, args); }
  finally { __b2Known = previousKnown; __b2Exit(frame); }
};
const __b2Expr = (id, body) => {
  if (!__b2Enabled || !__b2Hot) return body();
  const frame = __b2Enter(id);
  try { return body(); } finally { __b2Exit(frame); }
};
const __b2DefaultSpec = (knownId, otherId, body) => __b2Expr(__b2Known ? knownId : otherId, body);
const __benchStart = () => {
  if (__b2Stack.length) throw new Error('B2 reset during a live frame');
  __b2Metrics = {}; __b2Depth.clear(); __b2Hot = null; __b2Known = false; __b2Enabled = true;
};
const __benchStop = () => {
  if (__b2Stack.length) throw new Error('B2 stop during a live frame');
  __b2Enabled = false;
  return { b2: __b2Metrics };
};
`;
