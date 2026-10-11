import type { ObjectSchema } from '@/schema-form/__legacy__/types';

export type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];
/** Reverse index: field name -> virtual keys referencing it (built here, not read from the schema) */
export type VirtualReferenceFieldsMap = Map<string, string[]>;
export type VirtualReferencesMap = Map<string, VirtualReference>;
