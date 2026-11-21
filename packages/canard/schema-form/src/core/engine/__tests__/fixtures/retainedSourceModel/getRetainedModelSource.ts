import type { Shape, Source } from '../retainedSourceModelCases';

/** Represent a model value as an array only for the array shape. */
export const getRetainedModelSource = (shape: Shape, value: string): Source =>
  shape === 'array' ? [value] : value;
