/** Shared consumer data; runner.cjs compiles the four probe files twice without executing them. */
import type { JSONSchema } from '@canard/schema-form_0.16.0';

export const schema = {
  type: 'object',
  properties: { name: { type: 'string' }, count: { type: 'number' } },
  required: ['name', 'count'],
} as const;

export const looseSchema = {
  type: 'object',
  properties: { name: { type: 'string' }, count: { type: 'number' } },
  required: ['name', 'count'],
};

export const contextualSchema = {
  type: 'object',
  properties: { name: { type: 'string' }, count: { type: 'number' } },
  required: ['name', 'count'],
} satisfies JSONSchema;

export const closedSchema = { ...schema, additionalProperties: false } as const;
export const nullableSchema = { ...schema, type: ['object', 'null'] } as const;
export const nullableFlagSchema = { ...schema, nullable: true } as const;
export const nullableStringSchema = { type: ['string', 'null'] } as const;
export const singleTypeArraySchema = { type: ['string'] } as const;
export const literalSchema = { const: 'ready' } as const;
export const branchSchema = {
  oneOf: [
    { type: 'object', properties: { name: { type: 'string' } }, additionalProperties: false },
    { type: 'object', properties: { count: { type: 'number' } }, additionalProperties: false },
  ],
} as const;

export interface Profile { name: string; count: number }
export const initial = { name: 'Vincent', count: 1 };
export const readonlyInitial = { name: 'Vincent', count: 1 } as const;
export declare const nullableInitial: Profile | null;

/** Record the static type of value under label; the probes are never executed. */
export declare function inspect(label: string, value: unknown): void;
