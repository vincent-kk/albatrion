import type { ObjectSchema } from '@/schema-form/types';

export type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];
export type VirtualReferenceFieldsMap = Map<string, VirtualReference['fields']>;
export type VirtualReferencesMap = Map<string, VirtualReference>;
