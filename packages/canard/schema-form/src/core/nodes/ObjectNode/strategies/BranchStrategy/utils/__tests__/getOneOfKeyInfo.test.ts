import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { getOneOfKeyInfo } from '../getOneOfKeyInfo/getOneOfKeyInfo';

describe('getOneOfKeyInfo', () => {
  // Basic functionality test
  it('should correctly extract key information from schema with oneOf properties', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            age: { type: 'number' },
            address: { type: 'string' },
          },
        },
        {
          properties: {
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      ],
    };

    const result = getOneOfKeyInfo(schema);

    expect(result).toBeDefined();
    expect(result?.oneOfKeySet).toBeInstanceOf(Set);
    expect(result?.oneOfKeySetList).toBeInstanceOf(Array);
    expect(result?.oneOfKeySetList.length).toBe(2);

    // oneOfKeySet should contain all keys from oneOf properties
    expect(result?.oneOfKeySet.has('age')).toBe(true);
    expect(result?.oneOfKeySet.has('address')).toBe(true);
    expect(result?.oneOfKeySet.has('email')).toBe(true);
    expect(result?.oneOfKeySet.has('phone')).toBe(true);
    expect(result?.oneOfKeySet.size).toBe(4);

    // oneOfKeySetList[0] should contain keys from first oneOf item
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('address')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(2);

    // oneOfKeySetList[1] should contain keys from second oneOf item
    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('phone')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(2);
  });

  // When oneOf array is empty
  it('should return undefined when oneOf array is empty', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      oneOf: [],
    };

    const result = getOneOfKeyInfo(schema);
    expect(result).toBeUndefined();
  });

  // When oneOf is missing
  it('should return undefined when oneOf property is missing', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = getOneOfKeyInfo(schema);
    expect(result).toBeUndefined();
  });

  // When oneOf item has no properties
  it('should ignore items without properties in oneOf', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      oneOf: [
        {
          // No properties
        },
        {
          properties: {
            email: { type: 'string' },
          },
        },
      ],
    };

    const result = getOneOfKeyInfo(schema);

    expect(result).toBeDefined();
    expect(result?.oneOfKeySet.size).toBe(1);
    expect(result?.oneOfKeySet.has('email')).toBe(true);

    // First item should be an empty Set since it has no properties
    expect(result?.oneOfKeySetList[0]).toBeUndefined();

    // Second item should have email property
    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(1);
  });

  // When oneOf items have duplicate keys
  it('should handle duplicate keys correctly when oneOf items have them', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            age: { type: 'number' },
            shared: { type: 'string' },
          },
        },
        {
          properties: {
            email: { type: 'string' },
            shared: { type: 'string' },
          },
        },
      ],
    };

    const result = getOneOfKeyInfo(schema);

    expect(result).toBeDefined();
    // Duplicate 'shared' key should be counted only once in oneOfKeySet
    expect(result?.oneOfKeySet.size).toBe(3);
    expect(result?.oneOfKeySet.has('age')).toBe(true);
    expect(result?.oneOfKeySet.has('email')).toBe(true);
    expect(result?.oneOfKeySet.has('shared')).toBe(true);

    // Each oneOfKeySetList item should have its own keys
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('shared')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(2);

    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('shared')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(2);
  });

  // Complex schema test
  it('should return correct results even for complex schemas', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
      oneOf: [
        {
          properties: {
            type: { type: 'string', enum: ['person'] },
            age: { type: 'number' },
            address: { type: 'string' },
          },
        },
        {
          properties: {
            type: { type: 'string', enum: ['company'] },
            employees: { type: 'number' },
            location: { type: 'string' },
          },
        },
        {
          properties: {
            type: { type: 'string', enum: ['organization'] },
            members: { type: 'number' },
            purpose: { type: 'string' },
          },
        },
      ],
    };

    const result = getOneOfKeyInfo(schema);

    expect(result).toBeDefined();
    expect(result?.oneOfKeySet.size).toBe(7); // type, age, address, employees, location, members, purpose
    expect(result?.oneOfKeySetList.length).toBe(3);

    // All types share the 'type' property
    expect(result?.oneOfKeySet.has('type')).toBe(true);

    // person type
    expect(result?.oneOfKeySetList[0].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('address')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(3);

    // company type
    expect(result?.oneOfKeySetList[1].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('employees')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('location')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(3);

    // organization type
    expect(result?.oneOfKeySetList[2].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[2].has('members')).toBe(true);
    expect(result?.oneOfKeySetList[2].has('purpose')).toBe(true);
    expect(result?.oneOfKeySetList[2].size).toBe(3);
  });
});
