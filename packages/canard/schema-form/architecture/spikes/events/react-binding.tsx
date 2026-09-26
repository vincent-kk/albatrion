/**
 * React 19 binding for the mini store, mirroring the library's pattern:
 * `useSyncExternalStore` over the node's revision ledger
 * (`hooks/useSchemaNodeTracker.ts`) and `node.value` read during render
 * (`SchemaNodeInput.tsx:116`).
 */
import {
  type ChangeEvent,
  type FC,
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import type { StoreNode } from './mini-store';

export const useNodeRevision = (node: StoreNode<any>): number => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => node.subscribe(onStoreChange),
    [node],
  );
  const getRevision = useCallback(() => node.revision, [node]);
  return useSyncExternalStore(subscribe, getRevision, getRevision);
};

export interface RenderLog {
  /** Component name → values seen at each render, in order. */
  renders: Record<string, string[]>;
}

export const createRenderLog = (): RenderLog => ({ renders: {} });

const record = (log: RenderLog | undefined, name: string, value: string) => {
  if (!log) return;
  (log.renders[name] ??= []).push(value);
};

/** Controlled input with no caret bookkeeping — the common FormTypeInput shape. */
export const PlainControlledInput: FC<{
  node: StoreNode<string>;
  log?: RenderLog;
}> = ({ node, log }) => {
  useNodeRevision(node);
  record(log, node.name, node.value);
  return (
    <input
      id={node.name}
      type="text"
      value={node.value}
      onChange={(e) => node.setValue(e.target.value)}
    />
  );
};

export const formatCard = (raw: string): string =>
  raw
    .replace(/[^0-9]/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');

/**
 * Controlled card input that reinstates the caret after dash insertion —
 * a copy of the library test's `CardFormatterInput`
 * (`controlled-interaction.render.test.tsx`), bound to the mini store.
 */
export const CardFormatterInput: FC<{
  node: StoreNode<string>;
  log?: RenderLog;
}> = ({ node, log }) => {
  useNodeRevision(node);
  record(log, node.name, node.value);
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caret.current != null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const selectionStart = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value
      .slice(0, selectionStart)
      .replace(/[^0-9]/g, '').length;
    const next = formatCard(el.value);
    let pos = 0;
    let seen = 0;
    while (pos < next.length && seen < digitsBefore) {
      const code = next.charCodeAt(pos);
      if (code >= 48 && code <= 57) seen++;
      pos++;
    }
    if (next[pos] === '-') pos++;
    caret.current = pos;
    node.setValue(next);
  };
  return (
    <input
      id={node.name}
      ref={ref}
      type="text"
      value={node.value}
      onChange={handleChange}
    />
  );
};

/** Formatting controlled input WITHOUT caret bookkeeping — isolates what sync notify alone buys. */
export const CardFormatterNoBookkeeping: FC<{ node: StoreNode<string> }> = ({
  node,
}) => {
  useNodeRevision(node);
  return (
    <input
      id={node.name}
      type="text"
      value={node.value}
      onChange={(e) => node.setValue(formatCard(e.target.value))}
    />
  );
};

/** Read-only subscriber used for the 1,000-node batch test. */
export const NodeField: FC<{
  node: StoreNode<string>;
  counter: { renders: number };
}> = ({ node, counter }) => {
  useNodeRevision(node);
  counter.renders++;
  return <span data-node={node.name}>{node.value}</span>;
};
