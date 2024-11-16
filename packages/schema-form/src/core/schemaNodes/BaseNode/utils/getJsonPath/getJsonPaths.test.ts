import { describe, expect, it } from 'vitest';

import { getJsonPaths } from './getJsonPaths';

// 모듈의 경로를 맞춰주세요.

describe('getJsonPaths', () => {
  it('should handle an empty object', () => {
    const data = {};
    const result = getJsonPaths(data);
    expect(result).toEqual([]);
  });

  it('should handle an empty array', () => {
    const data: any[] = [];
    const result = getJsonPaths(data);
    expect(result).toEqual([]);
  });

  it('should handle a flat object', () => {
    const data = {
      name: 'John',
      age: 30,
    };
    const result = getJsonPaths(data);
    expect(result).toEqual(['/name', '/age']);
  });

  it('should handle a nested object', () => {
    const data = {
      person: {
        name: 'John',
        age: 30,
      },
    };
    const result = getJsonPaths(data);
    expect(result).toEqual(['/person', '/person/name', '/person/age']);
  });

  it('should handle an array of objects', () => {
    const data = [{ name: 'John' }, { name: 'Jane' }];
    const result = getJsonPaths(data);
    expect(result).toEqual(['[0]', '[0]/name', '[1]', '[1]/name']);
  });

  it('should handle nested arrays and objects', () => {
    const data = {
      people: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ],
      status: 'active',
    };
    const result = getJsonPaths(data);
    expect(result).toEqual([
      '/people',
      '/people[0]',
      '/people[0]/name',
      '/people[0]/age',
      '/people[1]',
      '/people[1]/name',
      '/people[1]/age',
      '/status',
    ]);
  });

  it('should handle complex nested structures', () => {
    const data = {
      a: {
        b: [{ c: 1 }, { d: { e: 2 } }],
      },
    };
    const result = getJsonPaths(data);
    expect(result).toEqual([
      '/a',
      '/a/b',
      '/a/b[0]',
      '/a/b[0]/c',
      '/a/b[1]',
      '/a/b[1]/d',
      '/a/b[1]/d/e',
    ]);
  });
});
