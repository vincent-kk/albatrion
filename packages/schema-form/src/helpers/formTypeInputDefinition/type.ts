import type {
  FormTypeInputDefinition,
  FormTypeTestFn,
} from '@/schema-form/types';

export interface NormalizedFormTypeInputDefinition
  extends Pick<FormTypeInputDefinition, 'Component'> {
  test: FormTypeTestFn;
}
