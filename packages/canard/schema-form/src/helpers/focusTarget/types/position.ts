import type { FieldNode } from '@/schema-form/core';
import type { FieldInputProps } from '@/schema-form/types';

/** Handle accepted by the input's ref, including a DOM control. */
export type FocusAnchor = NonNullable<
  Parameters<NonNullable<FieldInputProps['focusRef']>>[0]
>;

/** Actual input position, with a target set by its React ref. */
export interface InputPosition {
  readonly node: FieldNode;
  focusTarget: FocusAnchor | null;
}

/** Form-local positions keyed by their committed input containers. */
export type InputPositions = Map<Element, InputPosition>;
