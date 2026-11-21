import * as fjp from 'fast-json-patch';
import { describe, expect, it } from 'vitest';

import { applyPatch, compare, difference, mergePatch } from '../../index';

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const KEYS = ['a', 'b', 'c', '~', '/', '~1', '', ' ', 'x/y', '0', '10', 'é'];

const esc = (k: string) => k.replace(/~/g, '~0').replace(/\//g, '~1');

const deepFreeze = <T>(v: T): T => {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const k of Object.keys(v)) deepFreeze((v as any)[k]);
  }
  return v;
};

const jclone = (v: unknown) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

const genValue = (rnd: () => number, depth: number): any => {
  const r = rnd();
  if (depth <= 0 || r < 0.4) {
    const s = rnd();
    if (s < 0.3) return Math.floor(rnd() * 5);
    if (s < 0.6) return ['', 'x', 'y'][Math.floor(rnd() * 3)];
    if (s < 0.75) return null;
    return rnd() < 0.5;
  }
  if (r < 0.7) {
    const n = Math.floor(rnd() * 4);
    const out: any[] = [];
    for (let i = 0; i < n; i++) out.push(genValue(rnd, depth - 1));
    return out;
  }
  const n = Math.floor(rnd() * 4);
  const out: Record<string, any> = {};
  for (let i = 0; i < n; i++)
    out[KEYS[Math.floor(rnd() * KEYS.length)]] = genValue(rnd, depth - 1);
  return out;
};

const listPointers = (doc: any, base = '', out: string[] = []) => {
  out.push(base);
  if (Array.isArray(doc))
    doc.forEach((v, i) => listPointers(v, base + '/' + i, out));
  else if (doc && typeof doc === 'object')
    for (const k of Object.keys(doc)) listPointers(doc[k], base + '/' + esc(k), out);
  return out;
};

const listContainers = (doc: any) =>
  listPointers(doc).filter((p) => {
    const v = fjp.getValueByPointer(doc, p);
    return v && typeof v === 'object';
  });

const pick = <T>(rnd: () => number, list: T[]) =>
  list[Math.floor(rnd() * list.length)];

const genOp = (rnd: () => number, doc: any, sourceRefs: any[]): any => {
  const pointers = listPointers(doc);
  const containers = listContainers(doc);
  const ops = ['add', 'remove', 'replace', 'move', 'copy', 'test'];
  const op = pick(rnd, ops);
  const rootTarget = rnd() < 0.12;
  let path: string;
  if (rootTarget) path = '';
  else if (op === 'add' || op === 'move' || op === 'copy') {
    const parent = containers.length ? pick(rnd, containers) : '';
    const pv = fjp.getValueByPointer(doc, parent);
    if (Array.isArray(pv)) {
      const r = rnd();
      path = parent + '/' + (r < 0.3 ? '-' : Math.floor(rnd() * (pv.length + 1)));
    } else if (pv && typeof pv === 'object')
      path = parent + '/' + esc(pick(rnd, KEYS));
    else path = '';
  } else path = pick(rnd, pointers);
  let value: any;
  const useShared = rnd() < 0.3 && sourceRefs.length;
  value = useShared ? pick(rnd, sourceRefs) : genValue(rnd, 2);
  if (op === 'test') value = fjp.getValueByPointer(doc, path);
  if (op === 'remove') return { op, path };
  if (op === 'move' || op === 'copy') return { op, from: pick(rnd, pointers), path };
  return { op, path, value };
};

const ourTry = (doc: any, patch: any[]) => {
  try {
    return { ok: true as const, value: applyPatch(doc, patch) };
  } catch (error: any) {
    return { ok: false as const, error: error?.code ?? String(error) };
  }
};

describe('r4 applyPatch fuzz', () => {
  it('JF1 multi-op immutable patches against fast-json-patch, one-by-one, frozen inputs', () => {
    const rnd = mulberry32(4242);
    const failures: any[] = [];
    for (let run = 0; run < 4000 && failures.length < 5; run++) {
      const sourceRaw = genValue(rnd, 3);
      const source =
        sourceRaw && typeof sourceRaw === 'object' ? sourceRaw : { a: sourceRaw };
      const sourceRefs = listContainers(source)
        .filter((p) => p !== '')
        .map((p) => fjp.getValueByPointer(source, p));
      const sharedValue = genValue(rnd, 2);
      if (sharedValue && typeof sharedValue === 'object') sourceRefs.push(sharedValue);
      deepFreeze(source);
      deepFreeze(sharedValue);
      const snapshot = JSON.stringify(source);
      const sharedSnapshot = JSON.stringify(sharedValue);
      // Build a valid sequence according to fast-json-patch
      let cur = jclone(source);
      const patch: any[] = [];
      const n = 1 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        for (let attempt = 0; attempt < 10; attempt++) {
          const op = genOp(rnd, cur, sourceRefs);
          if (op.op === 'add' || op.op === 'replace') deepFreeze(op.value);
          if (
            op.op === 'move' &&
            (op.from === '' ? op.path !== '' : op.path.startsWith(op.from + '/'))
          )
            continue;
          try {
            // RFC 6902 4.4: move is remove-then-add, with path resolved after the removal
            const refOps =
              op.op === 'move' && op.from !== ''
                ? [
                    { op: 'remove', path: op.from },
                    {
                      op: 'add',
                      path: op.path,
                      value: jclone(fjp.getValueByPointer(cur, op.from)),
                    },
                  ]
                : [jclone(op)];
            let next: any = jclone(cur);
            for (const refOp of refOps)
              next = fjp.applyPatch(next, [refOp as any], true, true).newDocument;
            if (next === undefined) continue;
            JSON.stringify(next);
            patch.push(op);
            cur = next;
            break;
          } catch {
            /* regenerate */
          }
        }
      }
      if (!patch.length) continue;
      const ours = ourTry(source, patch);
      const ref = jclone(cur);
      // one-by-one
      let step: any = source;
      let stepErr: any = null;
      for (const op of patch) {
        try {
          step = applyPatch(step, [op]);
        } catch (e: any) {
          stepErr = e?.code ?? String(e);
          break;
        }
      }
      const problem: string[] = [];
      if (!ours.ok) problem.push('ours threw ' + ours.error);
      else if (JSON.stringify(ours.value) !== JSON.stringify(ref))
        problem.push('result differs from fjp');
      if (stepErr) problem.push('one-by-one threw ' + stepErr);
      else if (ours.ok && JSON.stringify(step) !== JSON.stringify(ours.value))
        problem.push('one-by-one differs');
      if (JSON.stringify(source) !== snapshot) problem.push('source changed');
      if (JSON.stringify(sharedValue) !== sharedSnapshot)
        problem.push('shared value changed');
      if (problem.length)
        failures.push({
          run,
          problem,
          source: snapshot,
          patch: JSON.stringify(patch),
          ours: ours.ok ? JSON.stringify(ours.value) : ours.error,
          ref: JSON.stringify(ref),
        });
    }
    expect(failures).toEqual([]);
  });

  it('JF2 compare then applyPatch round trip and difference then mergePatch round trip', () => {
    const rnd = mulberry32(777);
    const failures: any[] = [];
    for (let run = 0; run < 3000 && failures.length < 5; run++) {
      const a = genValue(rnd, 3);
      const b = genValue(rnd, 3);
      const src = a && typeof a === 'object' ? a : { a };
      const tgt = b && typeof b === 'object' ? b : { b };
      deepFreeze(src);
      deepFreeze(tgt);
      for (const strict of [false, true]) {
        const patch = compare(src, tgt, { strict });
        let out: any;
        try {
          out = applyPatch(src, patch);
        } catch (e: any) {
          failures.push({ run, strict, kind: 'apply threw', code: e?.code, src, tgt, patch });
          continue;
        }
        if (JSON.stringify(out) !== JSON.stringify(tgt) && !isDeepEqualUnordered(out, tgt))
          failures.push({ run, strict, kind: 'compare round trip', src, tgt, patch, out });
      }
      // difference / mergePatch: skip targets containing null (RFC 7396 limit)
      if (JSON.stringify(tgt).includes('null')) continue;
      const diff = difference(src, tgt);
      const merged = diff === undefined ? src : mergePatch(src, diff as any);
      if (!isDeepEqualUnordered(merged, tgt))
        failures.push({ run, kind: 'merge round trip', src, tgt, diff, merged });
    }
    expect(failures).toEqual([]);
  });
});

const isDeepEqualUnordered = (x: any, y: any): boolean => {
  if (x === y) return true;
  if (Array.isArray(x) !== Array.isArray(y)) return false;
  if (Array.isArray(x)) {
    if (x.length !== y.length) return false;
    return x.every((v, i) => isDeepEqualUnordered(v, y[i]));
  }
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    const kx = Object.keys(x);
    const ky = Object.keys(y);
    if (kx.length !== ky.length) return false;
    return kx.every((k) => Object.prototype.hasOwnProperty.call(y, k) && isDeepEqualUnordered(x[k], y[k]));
  }
  return false;
};
