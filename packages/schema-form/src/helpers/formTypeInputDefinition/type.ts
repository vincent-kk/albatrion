import type { FormTypeInputDefinition, FormTypeTestFn } from '@lumy-form/types';

export interface NormalizedFormTypeInputDefinition
  extends Pick<FormTypeInputDefinition, 'Component'> {
  test: FormTypeTestFn;
}
