import { clone } from '@winglet/common-utils/object';

import {
  adoptSchemaNodeTree,
  mountSchemaNode,
  reloadSchemaNodeForm,
} from '@/schema-form/core';
import { isSameSchema } from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';
import { applyFormErrors } from './applyFormErrors';
import { createRootLoad } from './createRootLoad';

/** Perform one synchronous load, preserving equal authored roots and replacing others. */
export const resetRootLoad = (
  previous: RootLoad,
  props: RootLoadProps,
): RootLoad => {
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
        reloadSchemaNodeForm(root, clone(props.defaultValue));
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
    mountSchemaNode(replacement, clone(props.defaultValue));
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
