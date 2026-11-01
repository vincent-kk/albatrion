import { clone } from '@winglet/common-utils/object';

import {
  SetValueOption,
  adoptFieldNodeTree,
  batchFieldNodeLoad,
  mountFieldNode,
  reloadFieldNodeForm,
} from '@/schema-form/core';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import { reportFailureToHost } from '../../FormErrorContext';
import type { RootLoad, RootLoadProps } from '../type';
import { applyFormErrors } from './applyFormErrors';
import { createRootLoad } from './createRootLoad';
import { reportBufferedRootRecord } from './reportBufferedRootRecord';

/** Mask selecting the automatic-write override bits of a reset option. */
const AUTOMATIC_WRITES_MASK =
  SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites;

/**
 * Perform one synchronous load, preserving equal authored roots and replacing others.
 * Call beginLoad to advance the reporter load and renew its warning scope.
 * Deliver the replaced never-prepared load's buffered and reset-chain records,
 * then the new build records, once to the reporter.
 * Retire the previous load after the reset chain, including failed adoption.
 * Report a replaced never-prepared load's construction error once to capture and the host.
 * @param previous - Committed or speculative load whose tree may be retained
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
      batchFieldNodeLoad(root, () => {
        reloadFieldNodeForm(root, clone(props.defaultValue), loadOption, {
          deferValidation: true,
        });
        applyFormErrors(root, props.errors);
      });
    } catch (error) {
      previous.error = error;
    }
    return previous;
  }
  const next = createRootLoad(props, previous.reporter, false);
  if (!next.root) {
    previous.reporter?.capture(next.error, 'load');
    return previous;
  }
  next.prepared = true;
  next.reported = true;
  const replacement = next.root;
  if (next.reporter) next.reporter.root = replacement;
  const load = () => {
    if (root) adoptFieldNodeTree(root, replacement);
    mountFieldNode(replacement, clone(props.defaultValue), loadOption, {
      deferValidation: true,
    });
    applyFormErrors(replacement, props.errors, undefined, 'load');
  };
  try {
    if (root) batchFieldNodeLoad(root, load);
    else load();
  } catch (error) {
    next.error = error;
  }
  if (!previous.prepared && previous.records.length) {
    next.recordScopes ??= new WeakMap();
    for (const record of previous.records) {
      const scope = previous.recordScopes?.get(record);
      next.recordScopes.set(record, {
        root: scope?.root ?? previous.root,
        warningScope: scope?.warningScope ?? previous.warningScope,
      });
    }
    next.records = previous.records.splice(0).concat(next.records);
  }
  previous.retired = true;
  for (const record of next.records.splice(0)) {
    try {
      reportBufferedRootRecord(next, record);
    } catch (error) {
      reportFailureToHost(error);
    }
  }
  if (!previous.prepared && !previous.reported) {
    previous.reported = true;
    if (previous.error) {
      previous.reporter?.capture(previous.error, 'load');
      reportFailureToHost(previous.error);
    }
  }
  return next;
};
