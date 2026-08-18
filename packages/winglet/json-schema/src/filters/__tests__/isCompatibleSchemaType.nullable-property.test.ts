import { describe, expect, test } from 'vitest';

import type { UnknownSchema } from '../../types/jsonSchema';
import { isCompatibleSchemaType } from '../isCompatibleSchemaType';

describe('isCompatibleSchemaType', () => {
  describe('nullable property compatibility', () => {
    test('should return true for type:[string,null] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'null'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string + nullable:true vs type:[string,null]', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: 'string' };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:string + nullable:true vs type:string', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: 'string' };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:[string] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:number + nullable:true vs type:[integer,null]', () => {
      const left: UnknownSchema = { type: 'number', nullable: true };
      const right: UnknownSchema = { type: ['integer', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return true for type:integer + nullable:true vs type:number + nullable:true', () => {
      const left: UnknownSchema = { type: 'integer', nullable: true };
      const right: UnknownSchema = { type: 'number', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should return false for different base types with nullable', () => {
      const left: UnknownSchema = { type: 'string', nullable: true };
      const right: UnknownSchema = { type: 'number', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should return false for type:[string,number] vs type:string + nullable:true', () => {
      const left: UnknownSchema = { type: ['string', 'number'] };
      const right: UnknownSchema = { type: 'string', nullable: true };
      expect(isCompatibleSchemaType(left, right)).toBe(false);
    });

    test('should handle nullable:false as non-nullable', () => {
      const left: UnknownSchema = { type: 'string', nullable: false };
      const right: UnknownSchema = { type: ['string', 'null'] };
      expect(isCompatibleSchemaType(left, right)).toBe(true);
    });

    test('should handle real-world OpenAPI nullable schema', () => {
      const openApiStyle: UnknownSchema = {
        type: 'string',
        nullable: true,
        description: 'Optional user name',
      };
      const jsonSchemaStyle: UnknownSchema = {
        type: ['string', 'null'],
        description: 'User name or null',
      };
      expect(isCompatibleSchemaType(openApiStyle, jsonSchemaStyle)).toBe(true);
    });
  });
});
