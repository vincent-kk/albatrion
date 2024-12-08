import type { SchemaFormPlugin } from '@lumy-pack/schema-form';

import { FormError } from './components/FormError';
import { FormGroup } from './components/FormGroup';
import { FormInput } from './components/FormInput';
import { FormLabel } from './components/FormLabel';
import { formatError } from './components/formatError';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;
