import type {
  JSONSchemaError,
  JSONSchemaWithVirtual,
} from '@/schema-form/types';

interface ValidationTarget {
  readonly variant: number | undefined;
  readonly schemaPath: string;
  clearErrors(): void;
  setErrors(errors: JSONSchemaError[]): void;
}

export interface ValidationHost {
  readonly isRoot: boolean;
  readonly jsonSchema: JSONSchemaWithVirtual;
  __setGlobalErrors__(errors: JSONSchemaError[]): boolean;
  find(pointer?: string): ValidationTarget | null;
}
