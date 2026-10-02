import { clone } from '@winglet/common-utils/object';

import { buildSchemaNodeTree, mountSchemaNode } from '@/schema-form/core';
import {
  isRenderAtomic,
  isRenderTerminal,
} from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';

/** Build a speculative root; buffer records until its binding is committed. */
export const createRootLoad = (
  props: RootLoadProps,
  reporter: RootLoad['reporter'],
  mount = true,
): RootLoad => {
  const load: RootLoad = {
    props,
    records: [],
    ready: false,
    prepared: false,
    reporter,
  };
  try {
    load.root = buildSchemaNodeTree({
      ...props,
      defaultValue: clone(props.defaultValue),
      isTerminal: isRenderTerminal,
      isAtomic: isRenderAtomic,
      errorReporter: {
        hasConsumer: () =>
          reporter?.hasConsumer() ?? process.env.NODE_ENV !== 'production',
        report: (record) => {
          if (load.ready) {
            if (reporter && load.root) reporter.root = load.root;
            reporter?.report(record);
          }
          else load.records.push(record);
        },
      },
      onChange: (value) => {
        if (load.ready) load.props.onChange?.(value);
      },
      onStateChange: () => {
        if (load.ready && load.root)
          load.props.onStateChange?.(load.root.globalState);
      },
    });
    if (mount)
      mountSchemaNode(load.root, undefined, undefined, {
        deferValidation: true,
      });
  } catch (error) {
    load.error = error;
    if (load.root?.diagnostics.cause === 'sharedConflict')
      load.root = undefined;
  }
  return load;
};
