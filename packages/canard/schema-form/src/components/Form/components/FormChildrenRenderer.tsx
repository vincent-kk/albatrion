import { type ReactNode, memo } from 'react';

import type { Fn } from '@aileron/declare';

import { NodeEventType } from '@/schema-form/core';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';
import { useRootNodeContext } from '@/schema-form/providers';
import type {
  AllowedValue,
  InferValueType,
  JsonSchema,
} from '@/schema-form/types';

import type { FormChildrenProps } from '../type';

/** Root-node events that re-run the function-children render-prop. */
const RERENDERING_EVENT =
  NodeEventType.UpdateValue |
  NodeEventType.UpdateGlobalError |
  NodeEventType.RequestRefresh |
  NodeEventType.RequestRemount;

interface FormChildrenRendererProps<
  Schema extends JsonSchema,
  Value extends AllowedValue,
> {
  jsonSchema: Schema;
  render: Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}

const FormChildrenRendererInner = <
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
>({
  jsonSchema,
  render,
}: FormChildrenRendererProps<Schema, Value>) => {
  const rootNode = useRootNodeContext();
  useSchemaNodeTracker(rootNode ?? null, RERENDERING_EVENT);
  return (
    <>
      {render({
        jsonSchema,
        node: rootNode,
        defaultValue: rootNode?.defaultValue,
        value: rootNode?.value,
        errors: rootNode?.globalErrors || undefined,
      } as FormChildrenProps<Schema, Value>)}
    </>
  );
};

/**
 * Bridges function children (render-prop) to the node event system with the
 * same tracker idiom `SchemaNodeProxy` uses: matching root events bump a
 * version and the render-prop reads live node state during render. React
 * batches version bumps raised in the same event/microtask, so one edit
 * re-runs the render-prop once.
 */
export const FormChildrenRenderer = memo(
  FormChildrenRendererInner,
) as typeof FormChildrenRendererInner;
