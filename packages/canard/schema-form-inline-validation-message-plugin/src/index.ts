import type { SchemaFormPlugin } from '@canard/schema-form';

import { formatError } from './formatError';

export const plugin = { formatError } satisfies SchemaFormPlugin;
