import type { SchemaFormPlugin } from '@canard/schema-form';

import { ErrorMessageRenderer } from './components/ErrorMessageRenderer';
import { FieldRenderer } from './components/FieldRenderer';
import { LabelRenderer } from './components/LabelRenderer';
import { fieldInputDefinitions } from './fieldInputs';

export const plugin = {
  FieldRenderer,
  LabelRenderer,
  ErrorMessageRenderer,
  fieldInputDefinitions,
} satisfies SchemaFormPlugin;
