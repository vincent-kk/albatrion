import { useMemo } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Dictionary } from '@aileron/declare';

import type { ChildNodeComponent } from '@/schema-form/components/SchemaNode';
import type { ChildNodeComponentProps } from '@/schema-form/types';

type ChildNodeComponentMap<Value extends Dictionary> = {
  [key in keyof Value]: ChildNodeComponent<ChildNodeComponentProps<Value[key]>>;
};

export const useChildNodeComponentMap = <Value extends Dictionary>(
  ChildNodeComponents: ChildNodeComponent[],
) =>
  useMemo(
    () =>
      new Proxy(
        ChildNodeComponents.reduce(
          (accumulator, ChildNodeComponent) => {
            const field = ChildNodeComponent.field as keyof Value;
            if (field) accumulator[field] = ChildNodeComponent;
            return accumulator;
          },
          {} as ChildNodeComponentMap<Required<Value>>,
        ),
        {
          get(target, key) {
            return target[key as keyof typeof target] ?? NOOP_FUNCTION;
          },
        },
      ),
    [ChildNodeComponents],
  );
