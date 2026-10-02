import { clone } from '@winglet/common-utils/object';

import {
  adoptSchemaNodeTree,
  mountSchemaNode,
  reloadSchemaNodeForm,
  SetValueOption,
} from '@/schema-form/core';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';
import { applyFormErrors } from './applyFormErrors';
import { createRootLoad } from './createRootLoad';

/**
 * Perform one synchronous load, preserving equal authored roots and replacing others.
 * @param previous - Committed load whose tree may be retained
 * @param props - Committed schema, source and Form defaults for the new load
 * @param option - Call-local automatic-write override; other bits are ignored
 * @returns The retained or replacement load with synchronous errors recorded
 */
export const resetRootLoad = (
  previous: RootLoad,
  props: RootLoadProps,
  option?: typeof SetValueOption.DisableAutomaticWrites | typeof SetValueOption.EnableAutomaticWrites,
): RootLoad => {
  const automaticWrites = (option ?? 0) &
    (SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites);
  const loadOption = automaticWrites || (props.disableAutomaticWrites
    ? SetValueOption.DisableAutomaticWrites
    : SetValueOption.EnableAutomaticWrites);
  previous.reporter?.beginLoad();
  const root = previous.root;
  if (
    root &&
    previous.props.validator === props.validator &&
    isSameSchema(previous.props.jsonSchema, props.jsonSchema)
  ) {
    previous.props = { ...props, jsonSchema: previous.props.jsonSchema };
    previous.error = undefined;
    try {
      root.batch(() => {
        reloadSchemaNodeForm(root, clone(props.defaultValue), loadOption);
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
  next.ready = previous.ready;
  next.prepared = true;
  const replacement = next.root;
  if (next.reporter) next.reporter.root = replacement;
  const load = () => {
    if (root) adoptSchemaNodeTree(root, replacement);
    mountSchemaNode(replacement, clone(props.defaultValue), loadOption);
    applyFormErrors(replacement, props.errors);
  };
  try {
    if (root) root.batch(load);
    else load();
  } catch (error) {
    next.error = error;
  }
  for (const record of next.records.splice(0)) next.reporter?.report(record);
  return next;
};
