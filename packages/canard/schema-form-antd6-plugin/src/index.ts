import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormErrorMessage } from './components/FormErrorMessage';
import { FormGroup } from './components/FormGroup';
import { FormLabel } from './components/FormLabel';
import { fieldInputDefinitions } from './fieldInputs';

export const plugin = {
  FieldRenderer: FormGroup,
  LabelRenderer: FormLabel,
  ErrorMessageRenderer: FormErrorMessage,
  fieldInputDefinitions,
} satisfies SchemaFormPlugin;
