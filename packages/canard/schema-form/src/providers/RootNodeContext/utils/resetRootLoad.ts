import { clone } from '@winglet/common-utils/object';

import {
  SetValueOption,
  adoptFieldNodeTree,
  mountFieldNode,
  reloadFieldNodeForm,
} from '@/schema-form/core';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import { reportErrorToHost } from '../../FormErrorContext';
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
  if (!previous.prepared && previous.records.length) {
    next.recordOrigins ??= new WeakMap();
    for (const record of previous.records) {
      const origin = previous.recordOrigins?.get(record);
      next.recordOrigins.set(record, {
        root: origin?.root ?? previous.root,
        warningScope: origin?.warningScope ?? previous.warningScope,
      });
    }
    next.records = previous.records.splice(0).concat(next.records);
  }
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
  previous.retired = true;
  for (const record of next.records.splice(0)) {
    try {
      reportBufferedRootRecord(next, record);
    } catch (error) {
      reportErrorToHost(error);
    }
  }
  if (!previous.prepared && !previous.reported) {
    previous.reported = true;
    if (previous.error) {
      previous.reporter?.capture(previous.error);
      reportErrorToHost(previous.error);
    }
  }
  return next;
};
