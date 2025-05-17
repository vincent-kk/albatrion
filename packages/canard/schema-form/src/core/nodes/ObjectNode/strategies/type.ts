import type { ObjectValue } from '@/schema-form/types';

import type { UnionSetValueOption } from '../../type';
import type { ChildNode } from '../type';

export interface ObjectNodeStrategy {
  get value(): ObjectValue | undefined;
  get children(): Array<ChildNode>;
  applyValue(
    this: this,
    value: ObjectValue | undefined,
    option: UnionSetValueOption,
  ): void;
  activateLink?(): void;
}
