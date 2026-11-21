import { FieldNodeEventType } from '../../core/engine/record';
import { attempt, build } from './probeHelpers';

/** Seeded generator (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T>(r: () => number, xs: readonly T[]) =>
  xs[Math.floor(r() * xs.length)];

/** One generated call. `held` holds node references captured before the run. */
export type Op = {
  label: string;
  run: (root: any, held: Record<string, any>) => unknown;
};

export type Mode = 'sequential' | 'batch' | 'visit' | 'nested';

const walk = (root: any, visit: (node: any) => void) => {
  const stack = [root];
  while (stack.length) {
    const node = stack.shift();
    visit(node);
    for (const child of node.children ?? []) stack.push(child);
  }
};

/**
 * Run the same generated calls in one mode and snapshot the observable result.
 * @param heldPaths - Paths whose nodes are captured before the calls run
 */
export const runMode = (
  schema: any,
  initial: () => any,
  ops: Op[],
  mode: Mode,
  heldPaths: readonly string[] = [],
  extra: any = {},
) => {
  const { root, changes } = build(schema, initial(), extra);
  const labels = new WeakMap<object, string>();
  const startValue = new Map<any, string>();
  const lastPayload = new Map<any, unknown>();
  const sawValue = new Set<any>();
  const sawError = new Set<any>();
  walk(root, (node) => {
    labels.set(node, `#${node.path}`);
    startValue.set(node, JSON.stringify(node.value));
    node.subscribe((event: any) => {
      if (event.type & FieldNodeEventType.UpdateValue) {
        sawValue.add(node);
        const current = event.payload?.[FieldNodeEventType.UpdateValue]?.current;
        lastPayload.set(
          node,
          node.strategy === 'branch' ? current?.value : current,
        );
      }
      if (event.type & FieldNodeEventType.UpdateError) sawError.add(node);
    });
  });
  const startErrors = new Map<any, string>();
  walk(root, (node) =>
    startErrors.set(node, JSON.stringify(node.errors.map((e: any) => e.keyword))),
  );
  const held: Record<string, any> = {};
  for (const path of heldPaths) held[path] = root.find(path);
  changes.length = 0;
  const errors: string[] = [];
  const returns: unknown[] = [];
  const record = (op: Op) => () => {
    const result = op.run(root, held);
    returns.push(result === undefined ? 'undefined' : JSON.parse(JSON.stringify(result) ?? 'null'));
  };
  const all = () => {
    for (const op of ops) {
      const thrown = attempt(record(op));
      if (thrown) errors.push(`${op.label}: ${String(thrown)}`);
    }
  };
  if (mode === 'sequential') all();
  else if (mode === 'batch') {
    const thrown = attempt(() => root.batch(all));
    if (thrown) errors.push(`batch: ${String(thrown)}`);
  } else if (mode === 'nested') {
    const thrown = attempt(() =>
      root.batch(() => {
        for (const op of ops) {
          const t = attempt(() => root.batch(record(op)));
          if (t) errors.push(`${op.label}: ${String(t)}`);
        }
      }),
    );
    if (thrown) errors.push(`batch: ${String(thrown)}`);
  } else {
    const thrown = attempt(() =>
      root.visitSubtree((node: any) => {
        if (node === root) all();
        return false;
      }),
    );
    if (thrown) errors.push(`visit: ${String(thrown)}`);
  }
  const nodes: unknown[] = [];
  const missedValueEvent: string[] = [];
  const stalePayload: string[] = [];
  const missedErrorEvent: string[] = [];
  walk(root, (node) => {
    nodes.push({
      path: node.path,
      id: labels.get(node) ?? 'new',
      errors: node.errors.map((e: any) => e.keyword),
      touched: !!node.isTouched,
      active: node.isActive,
    });
    if (!labels.has(node)) return;
    const now = JSON.stringify(node.value);
    if (now !== startValue.get(node) && !sawValue.has(node))
      missedValueEvent.push(node.path);
    if (
      sawValue.has(node) &&
      JSON.stringify(lastPayload.get(node)) !== now
    )
      stalePayload.push(node.path);
    const errNow = JSON.stringify(node.errors.map((e: any) => e.keyword));
    if (errNow !== startErrors.get(node) && !sawError.has(node))
      missedErrorEvent.push(node.path);
  });
  const output = JSON.stringify(root.outputValue);
  const lastChange = changes.length
    ? JSON.stringify(changes[changes.length - 1])
    : undefined;
  return {
    value: JSON.stringify(root.value),
    output,
    inactive: JSON.stringify(root.inactiveValues),
    nodes,
    errorCount: errors.length,
    errors,
    returns,
    missedValueEvent,
    stalePayload,
    missedErrorEvent,
    onChange:
      lastChange === undefined ? 'none' : lastChange === output ? 'ok' : 'MISMATCH',
    globalErrors: root.globalErrors.map((e: any) => `${e.dataPath}:${e.keyword}`),
  };
};

/** Fields compared across modes; the thrown messages themselves are compared by count. */
export const comparable = (x: ReturnType<typeof runMode>) => {
  const { errors: _errors, onChange, ...rest } = x;
  return JSON.stringify({ ...rest, onChange: onChange === 'MISMATCH' ? 'MISMATCH' : 'ok' });
};
