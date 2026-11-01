import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';

import { readFieldNodePathPrefixes } from './readFieldNodePathPrefixes';

/** Rebind prefix containers before notifying React that a path may identify a new node.
 * @param root - Context root whose children maps define the address.
 * @param path - Non-root path; unresolved suffixes are followed as their containers appear.
 * @param onStoreChange - External-store notifier, allowed to render and unsubscribe synchronously.
 * @returns A cleanup releasing every current prefix listener. */
export const subscribeFieldNodePath = (
  root: FieldNode,
  path: string,
  onStoreChange: () => void,
): (() => void) => {
  const releases: (() => void)[] = [];
  const release = () => {
    for (const unsubscribe of releases.splice(0)) unsubscribe();
  };
  const attach = () => {
    for (const node of readFieldNodePathPrefixes(root, path))
      releases.push(node.subscribe(onChildren));
  };
  const onChildren: Parameters<FieldNode['subscribe']>[0] = ({ type }) => {
    if (!(type & FieldNodeEventType.UpdateChildren)) return;
    release();
    attach();
    onStoreChange();
  };
  attach();
  return release;
};
