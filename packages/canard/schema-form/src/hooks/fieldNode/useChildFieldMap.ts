import { useMemo } from 'react';

import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import type { Dictionary } from '@aileron/declare';

import type { ChildField } from '@/schema-form/components/FieldProxy';
import type { ChildFieldProps } from '@/schema-form/types';

/** Proxy handler that answers a missing child field with a no-op function. */
const CHILD_FIELD_MAP_HANDLER: ProxyHandler<Dictionary> = {
  get(target, key) {
    return target[key as keyof typeof target] ?? NOOP_FUNCTION;
  },
};

type ChildFieldMap<Value extends Dictionary> = {
  [key in keyof Value]: ChildField<ChildFieldProps<Value[key]>>;
};

export const useChildFieldMap = <Value extends Dictionary>(
  ChildFields: ChildField[],
) =>
  useMemo(() => {
    const fields = {} as ChildFieldMap<Required<Value>>;
    for (let index = 0, length = ChildFields.length; index < length; index++) {
      if (!(index in ChildFields)) continue;
      const ChildField = ChildFields[index];
      const field = ChildField.field as keyof Value;
      if (field) fields[field] = ChildField;
    }
    return new Proxy<ChildFieldMap<Required<Value>>>(
      fields,
      CHILD_FIELD_MAP_HANDLER,
    );
  }, [ChildFields]);
