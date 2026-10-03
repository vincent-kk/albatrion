// Lens D scratch: exhaustive check of rule A over a representative domain.
const NUM_RE = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
const isPlain = (v) => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const p = Object.getPrototypeOf(v);
  return p === Object.prototype || p === null;
};
const isMember = (v, k) => {
  switch (k) {
    case 'string': return typeof v === 'string';
    case 'number': return typeof v === 'number' && Number.isFinite(v);
    case 'integer': return Number.isInteger(v);
    case 'boolean': return typeof v === 'boolean';
    case 'null': return v === null;
    case 'object': return isPlain(v);
    case 'array': return Array.isArray(v);
  }
};
const parseNum = (s) => {
  const t = s.trim();
  if (!NUM_RE.test(t)) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n)) return undefined;
  const intNotation = !/[.eE]/.test(t);
  if (intNotation && !Number.isSafeInteger(n)) return undefined;
  return n;
};
const convert = (v, k) => {
  switch (k) {
    case 'number': {
      if (typeof v !== 'string') return NO;
      const n = parseNum(v);
      return n === undefined ? NO : n;
    }
    case 'integer': {
      if (typeof v !== 'string') return NO;
      const n = parseNum(v);
      return n !== undefined && Number.isSafeInteger(n) ? n : NO;
    }
    case 'string':
      if (typeof v === 'number' && Number.isFinite(v)) return String(v);
      if (typeof v === 'boolean') return String(v);
      return NO;
    case 'boolean':
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (v === 1) return true;
      if (v === 0) return false;
      return NO;
    default: return NO;
  }
};
const NO = Symbol('no');
const interpret = (v, list, nullable) => {
  if (v === undefined) return { value: v, mismatch: false, tie: false };
  if (v === null) return { value: v, mismatch: !nullable, tie: false };
  if (list.some((k) => isMember(v, k))) return { value: v, mismatch: false, tie: false };
  const out = [];
  for (const k of list) {
    const r = convert(v, k);
    if (r !== NO && !out.some((x) => x === r)) out.push(r);
  }
  if (out.length === 1) return { value: out[0], mismatch: false, tie: false };
  return { value: v, mismatch: true, tie: out.length > 1 };
};
const KINDS = ['string', 'number', 'integer', 'boolean', 'object', 'array'];
const VALUES = [
  undefined, null, '', ' ', 'abc', '42', ' 42 ', '4.2', '1e2', '1.0', '-0', '01',
  '9007199254740993', '1e16', '1e400', 'true', 'false', 'True', ' true', '0', '1',
  0, -0, 1, 2, 12.5, NaN, Infinity, -Infinity, 2 ** 60, 1e300, true, false,
  {}, { a: 1 }, [], [1], new Date(0), Object.create(null), 10n,
];
const perms = (a) => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
const ties = new Set();
let orderViolations = 0, idemViolations = 0, postMismatch = 0;
for (let mask = 1; mask < 1 << KINDS.length; mask++) {
  const list = KINDS.filter((_, i) => mask & (1 << i));
  for (const nullable of [false, true]) for (const v of VALUES) {
    const base = interpret(v, list, nullable);
    for (const p of perms(list)) {
      const r = interpret(v, p, nullable);
      if (!Object.is(r.value, base.value) || r.mismatch !== base.mismatch) orderViolations++;
    }
    const again = interpret(base.value, list, nullable);
    if (!Object.is(again.value, base.value) || again.mismatch !== base.mismatch) idemViolations++;
    if (base.tie) ties.add(`${String(Object.is(v, -0) ? '-0' : v)} @ ${list.join(',')}`);
    if (!base.mismatch && base.value !== v && !list.some((k) => isMember(base.value, k))) postMismatch++;
  }
}
const tieValues = new Set([...ties].map((t) => t.split(' @ ')[0]));
const tieListsOk = [...ties].every((t) => {
  const l = t.split(' @ ')[1].split(',');
  return l.includes('string') && l.includes('boolean') && !l.includes('number') && !l.includes('integer');
});
console.log({ orderViolations, idemViolations, postMismatch, tieCount: ties.size, tieValues: [...tieValues], tieListsOk });
