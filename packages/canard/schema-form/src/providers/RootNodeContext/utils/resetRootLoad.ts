import { clone } from '@winglet/common-utils/object';

import {
  SetValueOption,
  adoptFieldNodeTree,
  mountFieldNode,
  reloadFieldNodeForm,
} from '@/schema-form/core';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';
import { applyFormErrors } from './applyFormErrors';
import { createRootLoad } from './createRootLoad';
import { reportBufferedRootRecord } from './reportBufferedRootRecord';

/** Mask selecting the automatic-write override bits of a reset option. */
const AUTOMATIC_WRITES_MASK =
  SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites;

/**
 * Perform one synchronous load, preserving equal authored roots and replacing others.
 * @param previous - Committed load whose tree may be retained
 * @param props - Committed schema, source and Form defaults for the new load
 * @param option - Call-local automatic-write override; other bits are ignored
 * @param rebuild - Explicitly replace the tree even when the schema is unchanged.
 * @returns The retained or replacement load with synchronous errors recorded
 */
export const resetRootLoad = (
  previous: RootLoad,
  props: RootLoadProps,
  option?:
    | typeof SetValueOption.DisableAutomaticWrites
    | typeof SetValueOption.EnableAutomaticWrites,
  rebuild = false,
): RootLoad => {
  const automaticWrites = (option ?? 0) & AUTOMATIC_WRITES_MASK;
  const loadOption =
    automaticWrites ||
    (props.disableAutomaticWrites
      ? SetValueOption.DisableAutomaticWrites
      : SetValueOption.EnableAutomaticWrites);
  previous.reporter?.beginLoad();
  const root = previous.root;
  if (
    !rebuild &&
    root &&
    previous.props.validator === props.validator &&
    isSameSchema(previous.props.jsonSchema, props.jsonSchema)
  ) {
    previous.props = { ...props, jsonSchema: previous.props.jsonSchema };
    previous.error = undefined;
    try {
      root.batch(() => {
        reloadFieldNodeForm(root, clone(props.defaultValue), loadOption);
        applyFormErrors(root, props.errors);
      });
    } catch (error) {
      previous.error = error;
    }
    return previous;
  }
  const next = createRootLoad(props, previous.reporter, false);
  if (!next.root) {
    previous.reporter?.capture(next.error);
    return previous;
  }
  if (!previous.ready && previous.records.length) {
    next.recordRoots = new WeakMap();
    for (const record of previous.records)
      next.recordRoots.set(
        record,
        previous.recordRoots?.has(record)
          ? previous.recordRoots.get(record)
          : previous.root,
      );
    next.records = previous.records.splice(0).concat(next.records);
  }
  next.ready = previous.ready;
  next.prepared = true;
  const replacement = next.root;
  if (next.reporter) next.reporter.root = replacement;
  const load = () => {
    if (root) adoptFieldNodeTree(root, replacement);
    mountFieldNode(replacement, clone(props.defaultValue), loadOption);
    applyFormErrors(replacement, props.errors);
  };
  try {
    if (root) root.batch(load);
    else load();
  } catch (error) {
    next.error = error;
  }
  if (next.ready)
    for (const record of next.records.splice(0))
      reportBufferedRootRecord(next, record);
  return next;
};
