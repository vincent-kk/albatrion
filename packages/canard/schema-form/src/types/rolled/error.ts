import type { Roll } from '@aileron/declare';

import type { JsonSchemaError as BaseJsonSchemaError } from '../error';

type JsonSchemaError = Roll<BaseJsonSchemaError>;

export type { JsonSchemaError };
