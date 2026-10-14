import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormError } from './components/FormError';
import { FormGroup } from './components/FormGroup';
import { FormInput } from './components/FormInput';
import { FormLabel } from './components/FormLabel';
import { fieldInputDefinitions } from './fieldInputs';

export const plugin = {
  FieldRenderer: FormGroup,
  FormLabelRenderer: FormLabel,
  FormInputRenderer: FormInput,
  FormErrorRenderer: FormError,
  fieldInputDefinitions,
} satisfies SchemaFormPlugin;
