import type {
  JsonSchemaError,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

interface ValidationTarget {
  readonly variant: number | undefined;
  readonly schemaPath: string;
  clearErrors(): void;
  setErrors(errors: JsonSchemaError[]): void;
}

export interface ValidationHost {
  readonly isRoot: boolean;
  readonly jsonSchema: JsonSchemaWithVirtual;
  __setGlobalErrors__(errors: JsonSchemaError[]): boolean;
  find(pointer?: string): ValidationTarget | null;
}
