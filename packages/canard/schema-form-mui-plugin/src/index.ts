import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormError } from './components/FormError';
import { FormGroup } from './components/FormGroup';
import { FormInput } from './components/FormInput';
import { FormLabel } from './components/FormLabel';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

export type { MuiContext } from './type';
