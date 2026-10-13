import { clone } from '@winglet/common-utils/object';

import { buildFieldNodeTree, mountFieldNode } from '@/schema-form/core';
import {
  isRenderAtomic,
  isRenderTerminal,
} from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';

/**
 * Build a speculative root whose reports wait in `records` until the load is committed (`ready`).
 * @param props - Committed Form props for this load; the default value is cloned before building.
 * @param reporter - Instance reporter that receives reports once the load is ready; may be absent.
 * @param mount - Mount the built tree now; `false` leaves mounting to a reset that first adopts the previous tree.
 * @returns The load; a construction or mount failure is kept in `error` instead of thrown.
 */
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
    load.root = buildFieldNodeTree({
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
          } else load.records.push(record);
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
      mountFieldNode(load.root, undefined, undefined, {
        deferValidation: true,
      });
  } catch (error) {
    load.error = error;
    if (load.root?.diagnostics.cause === 'sharedConflict')
      load.root = undefined;
  }
  return load;
};
