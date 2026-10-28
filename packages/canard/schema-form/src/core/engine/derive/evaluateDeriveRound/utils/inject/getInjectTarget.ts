import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  PointerOperator,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { getDeriveChildEntry } from '../rank/getDeriveChildEntry';

/**
 * Resolve a dynamic path through declared templates and the current shape.
 * @param root - Live calculated root
 * @param path - Absolute target pointer, never the context token
 * @returns Declared target and optional live occurrence
 */
export const getInjectTarget = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
) => {
  const segments = parsePointerSegments(path);
  if (segments[0] === PointerOperator.Context) return undefined;
  let template = root.blueprintNode;
  let live: Self | undefined = root;
  let siblings = template.childEntries;
  const order: number[] = [];
  for (const name of segments) {
    if (template.strategy !== 'branch') return undefined;
    if (typeof name !== 'string') return undefined;
    siblings = template.childEntries;
    const index = Number(name);
    const items =
      template.kind === 'array' &&
      Number.isInteger(index) &&
      index >= 0 &&
      String(index) === name
        ? getItemEntries(template, index)
        : undefined;
    const selected = live?.structure?.[name]?.blueprintNode;
    const item = items?.find((entry) => entry.node === selected) ?? items?.[0];
    if (items) siblings = items;
    const found = item
      ? { entry: item, position: index }
      : getDeriveChildEntry(template, name);
    if (!found) return undefined;
    order.push(found.position);
    const structure: Record<string, Self> | null = live?.structure ?? null;
    live =
      structure && hasOwnProperty(structure, name)
        ? structure[name]
        : undefined;
    template = live?.blueprintNode ?? found.entry.node;
  }
  return {
    target: live,
    template: live?.blueprintNode ?? template,
    siblings,
    order,
  };
};
