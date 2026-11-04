/**
 * React 19 binding of the v4c prototype (`work-loop/proto/loop-v4c.mjs`) for
 * the C-10 spike: `useSyncExternalStore` over the node's revision ledger and
 * the committed emit read during render — the library's own shape
 * (`hooks/useSchemaNodeTracker.ts`, `SchemaNodeInput.tsx`).
 *
 * `DerivedField` is the C-10 consumer: after a commit caused by a keystroke
 * in `a`, its layout effect (or passive effect) writes `b` — a write that
 * starts AFTER the keystroke's entry has closed.
 */
import { type FC, useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react';

// @ts-expect-error — untyped .mjs prototype module
import * as L from '../work-loop/proto/loop-v4c.mjs';

export type Node = any;

export const useNodeRevision = (node: Node): number => {
  const subscribe = useCallback((onStoreChange: () => void) => L.subscribe(node, onStoreChange), [node]);
  const getRevision = useCallback(() => node.revision as number, [node]);
  return useSyncExternalStore(subscribe, getRevision, getRevision);
};

/** Controlled text input bound to a leaf; the keystroke path is `write`. */
export const LeafInput: FC<{ node: Node }> = ({ node }) => {
  useNodeRevision(node);
  const value = (L.valueOf(node) as string | undefined) ?? '';
  return <input id={node.name} type="text" value={value} onChange={(e) => L.write(node, e.target.value)} />;
};

export type EffectKind = 'layout' | 'passive';

/**
 * Shows `target`; whenever `source`'s committed value changes, an effect of
 * `kind` writes `derived:<source>` into `target`. `log` receives one line per
 * effect run that wrote.
 */
export const DerivedField: FC<{ source: Node; target: Node; kind: EffectKind; log: string[] }> = ({ source, target, kind, log }) => {
  useNodeRevision(source);
  useNodeRevision(target);
  const sourceValue = (L.valueOf(source) as string | undefined) ?? '';
  const targetValue = (L.valueOf(target) as string | undefined) ?? '';
  const useKindEffect = kind === 'layout' ? useLayoutEffect : useEffect;
  useKindEffect(() => {
    const next = sourceValue === '' ? '' : `derived:${sourceValue}`;
    if ((L.valueOf(target) ?? '') === next) return;
    log.push(`${kind}-effect writes ${JSON.stringify(next)} (entryDepth before=${source.root.entryDepth})`);
    L.setValue(target, next);
  }, [sourceValue]);
  return <span id={target.name}>{targetValue}</span>;
};
