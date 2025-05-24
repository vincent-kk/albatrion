import type { ObjectSchema } from '@/schema-form/types';

export type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];
