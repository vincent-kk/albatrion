import { JSONPointer } from '@winglet/common-utils';
import { describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScanner } from '../JsonSchemaScanner';
import { JsonSchemaScannerAsync } from '../JsonSchemaScannerAsync';

describe('JsonSchemaScanner/JsonSchemaScannerAsync 추가 스펙 테스트', () => {
  it('filter가 false를 반환하면 하위 노드를 방문하지 않는다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const filter = vi
      .fn()
      .mockImplementation((node, path) => path === JSONPointer.Root);
    const schema: UnknownSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
    };
    const scanner = new JsonSchemaScanner(visitor, { filter });
    scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledTimes(1);
    expect(visitor.enter).toHaveBeenCalledWith(
      schema,
      JSONPointer.Root,
      0,
      undefined,
    );
  });

  it('maxDepth가 0이면 루트만 방문한다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const schema: UnknownSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
    };
    const scanner = new JsonSchemaScanner(visitor, { maxDepth: 0 });
    scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledTimes(1);
    expect(visitor.enter).toHaveBeenCalledWith(
      schema,
      JSONPointer.Root,
      0,
      undefined,
    );
  });

  it('순환 참조($ref)가 있어도 무한루프 없이 종료된다', () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const schema: UnknownSchema = { $ref: '#/self' };
    const resolveReference = vi.fn().mockReturnValue(schema);
    const scanner = new JsonSchemaScanner(visitor, { resolveReference });
    scanner.scan(schema);
    // 무한루프 없이 한 번만 방문
    expect(visitor.enter).not.toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });

  it('exit 훅이 없어도 예외 없이 동작한다', () => {
    const visitor = { enter: vi.fn() };
    const schema: UnknownSchema = { type: 'string' };
    const scanner = new JsonSchemaScanner(visitor);
    expect(() => scanner.scan(schema)).not.toThrow();
  });

  it('context가 모든 훅에 정확히 전달된다', async () => {
    const context = { value: 42 };
    const visitor = {
      enter: vi.fn(),
      exit: vi.fn(),
    };
    const filter = vi.fn().mockReturnValue(true);
    const resolveReference = vi.fn().mockResolvedValue({ type: 'string' });
    const schema: UnknownSchema = { $ref: '#/ref' };
    const scanner = new JsonSchemaScannerAsync(visitor, {
      filter,
      resolveReference,
      context,
    });
    await scanner.scan(schema);
    expect(visitor.enter).toHaveBeenCalledWith(
      { type: 'string' },
      `${JSONPointer.Root} -> (#/ref)`,
      1,
      context,
    );
    expect(filter).toHaveBeenCalledWith(schema, JSONPointer.Root, 0, context);
    expect(resolveReference).toHaveBeenCalledWith('#/ref', context);
  });

  it('비동기 resolveReference에서 예외 발생 시 에러를 전파한다', async () => {
    const visitor = { enter: vi.fn(), exit: vi.fn() };
    const resolveReference = vi.fn().mockRejectedValue(new Error('fail'));
    const schema: UnknownSchema = { $ref: '#/fail' };
    const scanner = new JsonSchemaScannerAsync(visitor, { resolveReference });
    await expect(scanner.scan(schema)).rejects.toThrow('fail');
  });
});
