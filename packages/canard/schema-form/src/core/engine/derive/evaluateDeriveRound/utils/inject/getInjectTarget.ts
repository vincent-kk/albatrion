import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Nullable, Optional } from '@aileron/declare';

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
  let live: Optional<Self> = root;
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
      '' + index === name
        ? getItemEntries(template, index)
        : undefined;
    const selected = live?.childrenByName?.[name]?.blueprintNode;
    const item = items?.find((entry) => entry.node === selected) ?? items?.[0];
    if (items) siblings = items;
    const found = item
      ? { entry: item, position: index }
      : getDeriveChildEntry(template, name);
    if (!found) return undefined;
    order.push(found.position);
    const childrenByName: Nullable<Dictionary<Self>> =
      live?.childrenByName ?? null;
    live =
      childrenByName && hasOwnProperty(childrenByName, name)
        ? childrenByName[name]
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
