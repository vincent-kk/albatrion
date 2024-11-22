import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
} from '@lumy/schema-form/types';

export interface NormalizedFormTypeInputDefinition
  extends Pick<FormTypeInputDefinition, 'Component'> {
  test: FormTypeTestFn;
}
