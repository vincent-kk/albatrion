import { describe, expect, it } from 'vitest';

import type { ObjectSchema } from '@/schema-form/types';

import { getOneOfKeyInfo } from '../getOneOfKeyInfo/getOneOfKeyInfo';

describe('getOneOfKeyInfo', () => {
  // 기본 동작 테스트
  it('oneOf 속성이 있는 스키마에서 키 정보를 올바르게 추출해야 함', () => {
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

    // oneOfKeySet에는 모든 oneOf 속성의 키가 포함되어야 함
    expect(result?.oneOfKeySet.has('age')).toBe(true);
    expect(result?.oneOfKeySet.has('address')).toBe(true);
    expect(result?.oneOfKeySet.has('email')).toBe(true);
    expect(result?.oneOfKeySet.has('phone')).toBe(true);
    expect(result?.oneOfKeySet.size).toBe(4);

    // oneOfKeySetList[0]에는 첫 번째 oneOf 항목의 키가 포함되어야 함
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('address')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(2);

    // oneOfKeySetList[1]에는 두 번째 oneOf 항목의 키가 포함되어야 함
    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('phone')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(2);
  });

  // oneOf가 비어있는 경우
  it('oneOf 배열이 비어있는 경우 undefined를 반환해야 함', () => {
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

  // oneOf가 없는 경우
  it('oneOf 속성이 없는 경우 undefined를 반환해야 함', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    };

    const result = getOneOfKeyInfo(schema);
    expect(result).toBeUndefined();
  });

  // oneOf 항목에 properties가 없는 경우
  it('oneOf 항목에 properties가 없는 경우 해당 항목은 무시해야 함', () => {
    const schema: ObjectSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      oneOf: [
        {
          // properties 없음
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

    // 첫 번째 항목은 properties가 없으므로 빈 Set이어야 함
    expect(result?.oneOfKeySetList[0]).toBeUndefined();

    // 두 번째 항목은 email 프로퍼티가 있어야 함
    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(1);
  });

  // oneOf 항목이 중복된 키를 가질 경우
  it('oneOf 항목이 중복된 키를 가지는 경우 모든 키를 올바르게 처리해야 함', () => {
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
    // 중복된 'shared' 키는 oneOfKeySet에서 한 번만 카운트됨
    expect(result?.oneOfKeySet.size).toBe(3);
    expect(result?.oneOfKeySet.has('age')).toBe(true);
    expect(result?.oneOfKeySet.has('email')).toBe(true);
    expect(result?.oneOfKeySet.has('shared')).toBe(true);

    // 각 oneOfKeySetList 항목은 자신의 키를 가져야 함
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('shared')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(2);

    expect(result?.oneOfKeySetList[1].has('email')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('shared')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(2);
  });

  // 복잡한 스키마 테스트
  it('복잡한 스키마에서도 올바른 결과를 반환해야 함', () => {
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

    // 모든 타입은 'type' 속성을 공유함
    expect(result?.oneOfKeySet.has('type')).toBe(true);

    // person 타입
    expect(result?.oneOfKeySetList[0].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('age')).toBe(true);
    expect(result?.oneOfKeySetList[0].has('address')).toBe(true);
    expect(result?.oneOfKeySetList[0].size).toBe(3);

    // company 타입
    expect(result?.oneOfKeySetList[1].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('employees')).toBe(true);
    expect(result?.oneOfKeySetList[1].has('location')).toBe(true);
    expect(result?.oneOfKeySetList[1].size).toBe(3);

    // organization 타입
    expect(result?.oneOfKeySetList[2].has('type')).toBe(true);
    expect(result?.oneOfKeySetList[2].has('members')).toBe(true);
    expect(result?.oneOfKeySetList[2].has('purpose')).toBe(true);
    expect(result?.oneOfKeySetList[2].size).toBe(3);
  });
});
