import React from 'react';

import { describe, expect, test } from 'vitest';

import type {
  FieldInputDefinition,
  FieldInputTestObject,
  Hint,
} from '@/schema-form/types';

import { normalizeFieldInputDefinitions } from '../fieldInputDefinitions';

// 테스트용 React 컴포넌트들
const TestStringComponent = () =>
  React.createElement('input', { type: 'text' });
const TestNumberComponent = () =>
  React.createElement('input', { type: 'number' });
const TestEmailComponent = () =>
  React.createElement('input', { type: 'email' });
const TestPasswordComponent = () =>
  React.createElement('input', { type: 'password' });
const TestTextareaComponent = () => React.createElement('textarea');
const TestSelectComponent = () => React.createElement('select');

// 테스트용 잘못된 컴포넌트 (React 컴포넌트가 아님)
const NotAComponent = 'not-a-component';
const NumberValue = 123;

describe('normalizeFieldInputDefinitions', () => {
  describe('빈 입력 처리', () => {
    test('undefined가 주어지면 빈 배열을 반환', () => {
      const result = normalizeFieldInputDefinitions(undefined);
      expect(result).toEqual([]);
    });

    test('빈 배열이 주어지면 빈 배열을 반환', () => {
      const result = normalizeFieldInputDefinitions([]);
      expect(result).toEqual([]);
    });
  });

  describe('잘못된 컴포넌트 필터링', () => {
    test('React 컴포넌트가 아닌 것들은 제외', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: 'string' },
          Component: NotAComponent as any,
        },
        {
          test: { type: 'number' },
          Component: NumberValue as any,
        },
        {
          test: { type: 'string' },
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFieldInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(result[0].Component).toBeDefined();
    });
  });

  describe('FieldInputTestFn을 사용한 정의', () => {
    test('함수형 테스트는 그대로 유지', () => {
      const testFn = (hint: Hint) => hint.type === 'string';
      const definitions: FieldInputDefinition[] = [
        {
          test: testFn,
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFieldInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(result[0].test).toBe(testFn);
      expect(result[0].Component).toBeDefined();
    });
  });

  describe('FieldInputTestObject를 사용한 정의', () => {
    test('객체 형태의 테스트는 함수로 변환', () => {
      const testObject: FieldInputTestObject = { type: 'string' };
      const definitions: FieldInputDefinition[] = [
        {
          test: testObject,
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFieldInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(typeof result[0].test).toBe('function');
      expect(result[0].Component).toBeDefined();
    });

    test('잘못된 테스트 타입은 제외', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: 'invalid-test' as any,
          Component: TestStringComponent,
        },
        {
          test: 123 as any,
          Component: TestNumberComponent,
        },
        {
          test: { type: 'string' },
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFieldInputDefinitions(definitions);
      expect(result).toHaveLength(1);
    });
  });
});

describe('fieldInputTestFnFactory (fieldInputTestObject를 통한 간접 테스트)', () => {
  const createTestHint = (overrides: Partial<Hint> = {}): Hint => ({
    schemaType: 'string',
    typeMismatch: false,
    type: 'string',
    nullable: false,
    required: true,
    path: '/test',
    jsonSchema: { type: 'string' },
    format: undefined,
    inputType: undefined,
    ...overrides,
  });

  describe('type 필드 테스트', () => {
    test('단일 type 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { type: 'string' }, Component: TestStringComponent },
        { test: { type: 'number' }, Component: TestNumberComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // string 타입 테스트
      const stringHint = createTestHint({ type: 'string' });
      expect(normalized[0].test(stringHint)).toBe(true);
      expect(normalized[1].test(stringHint)).toBe(false);

      // number 타입 테스트
      const numberHint = createTestHint({ type: 'number' });
      expect(normalized[0].test(numberHint)).toBe(false);
      expect(normalized[1].test(numberHint)).toBe(true);
    });

    test('배열 형태의 type 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: ['string', 'number'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 배열에 포함된 타입들
      expect(testFn(createTestHint({ type: 'string' }))).toBe(true);
      expect(testFn(createTestHint({ type: 'number' }))).toBe(true);

      // 배열에 포함되지 않은 타입
      expect(testFn(createTestHint({ type: 'boolean' }))).toBe(false);
    });
  });

  describe('format 필드 테스트', () => {
    test('단일 format 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { format: 'email' }, Component: TestEmailComponent },
        { test: { format: 'password' }, Component: TestPasswordComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // email 포맷 테스트
      const emailHint = createTestHint({ format: 'email' });
      expect(normalized[0].test(emailHint)).toBe(true);
      expect(normalized[1].test(emailHint)).toBe(false);

      // password 포맷 테스트
      const passwordHint = createTestHint({ format: 'password' });
      expect(normalized[0].test(passwordHint)).toBe(false);
      expect(normalized[1].test(passwordHint)).toBe(true);
    });

    test('배열 형태의 format 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { format: ['email', 'password'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'password' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'url' }))).toBe(false);
    });

    test('undefined format 값 처리', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // format이 undefined인 경우
      expect(testFn(createTestHint({ format: undefined }))).toBe(true);

      // format이 다른 값인 경우
      expect(testFn(createTestHint({ format: 'email' }))).toBe(false);
    });

    test('format이 없는 hint에서 undefined와 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      const hintWithoutFormat = createTestHint();
      delete (hintWithoutFormat as any).format;

      expect(testFn(hintWithoutFormat)).toBe(true);
    });
  });

  describe('path 필드 테스트', () => {
    test('단일 path 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { path: '/user/name' }, Component: TestStringComponent },
        { test: { path: '/user/age' }, Component: TestNumberComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      const nameHint = createTestHint({ path: '/user/name' });
      expect(normalized[0].test(nameHint)).toBe(true);
      expect(normalized[1].test(nameHint)).toBe(false);

      const ageHint = createTestHint({ path: '/user/age' });
      expect(normalized[0].test(ageHint)).toBe(false);
      expect(normalized[1].test(ageHint)).toBe(true);
    });

    test('배열 형태의 path 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { path: ['/user/name', '/user/email'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ path: '/user/name' }))).toBe(true);
      expect(testFn(createTestHint({ path: '/user/email' }))).toBe(true);
      expect(testFn(createTestHint({ path: '/user/age' }))).toBe(false);
    });
  });

  describe('nullable 필드 테스트', () => {
    test('nullable이 true인 경우 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { nullable: true }, Component: TestStringComponent },
        { test: { nullable: false }, Component: TestNumberComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // nullable이 true인 hint
      const nullableHint = createTestHint({ nullable: true });
      expect(normalized[0].test(nullableHint)).toBe(true);
      expect(normalized[1].test(nullableHint)).toBe(false);

      // nullable이 false인 hint
      const nonNullableHint = createTestHint({ nullable: false });
      expect(normalized[0].test(nonNullableHint)).toBe(false);
      expect(normalized[1].test(nonNullableHint)).toBe(true);
    });

    test('nullable 조건이 없으면 모든 nullable 값과 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { type: 'string' }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // nullable이 true인 경우
      expect(testFn(createTestHint({ type: 'string', nullable: true }))).toBe(
        true,
      );

      // nullable이 false인 경우
      expect(testFn(createTestHint({ type: 'string', nullable: false }))).toBe(
        true,
      );
    });

    test('type과 nullable 복합 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: 'string', nullable: true },
          Component: TestStringComponent,
        },
        {
          test: { type: 'string', nullable: false },
          Component: TestNumberComponent,
        },
        {
          test: { type: 'number', nullable: true },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // string + nullable: true
      const stringNullable = createTestHint({ type: 'string', nullable: true });
      expect(normalized[0].test(stringNullable)).toBe(true);
      expect(normalized[1].test(stringNullable)).toBe(false);
      expect(normalized[2].test(stringNullable)).toBe(false);

      // string + nullable: false
      const stringNonNullable = createTestHint({
        type: 'string',
        nullable: false,
      });
      expect(normalized[0].test(stringNonNullable)).toBe(false);
      expect(normalized[1].test(stringNonNullable)).toBe(true);
      expect(normalized[2].test(stringNonNullable)).toBe(false);

      // number + nullable: true
      const numberNullable = createTestHint({ type: 'number', nullable: true });
      expect(normalized[0].test(numberNullable)).toBe(false);
      expect(normalized[1].test(numberNullable)).toBe(false);
      expect(normalized[2].test(numberNullable)).toBe(true);

      // number + nullable: false
      const numberNonNullable = createTestHint({
        type: 'number',
        nullable: false,
      });
      expect(normalized[0].test(numberNonNullable)).toBe(false);
      expect(normalized[1].test(numberNonNullable)).toBe(false);
      expect(normalized[2].test(numberNonNullable)).toBe(false);
    });

    test('format과 nullable 복합 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { format: 'email', nullable: true },
          Component: TestEmailComponent,
        },
        {
          test: { format: 'email', nullable: false },
          Component: TestPasswordComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // email + nullable: true
      const emailNullable = createTestHint({ format: 'email', nullable: true });
      expect(normalized[0].test(emailNullable)).toBe(true);
      expect(normalized[1].test(emailNullable)).toBe(false);

      // email + nullable: false
      const emailNonNullable = createTestHint({
        format: 'email',
        nullable: false,
      });
      expect(normalized[0].test(emailNonNullable)).toBe(false);
      expect(normalized[1].test(emailNonNullable)).toBe(true);
    });

    test('path와 nullable 복합 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { path: '/user/name', nullable: true },
          Component: TestStringComponent,
        },
        {
          test: { path: '/user/name', nullable: false },
          Component: TestNumberComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // path + nullable: true
      const pathNullable = createTestHint({
        path: '/user/name',
        nullable: true,
      });
      expect(normalized[0].test(pathNullable)).toBe(true);
      expect(normalized[1].test(pathNullable)).toBe(false);

      // path + nullable: false
      const pathNonNullable = createTestHint({
        path: '/user/name',
        nullable: false,
      });
      expect(normalized[0].test(pathNonNullable)).toBe(false);
      expect(normalized[1].test(pathNonNullable)).toBe(true);
    });

    test('모든 조건과 nullable 복합 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: {
            type: 'string',
            format: 'email',
            path: '/user/email',
            nullable: true,
          },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 모든 조건 만족 (nullable: true)
      const validHint = createTestHint({
        type: 'string',
        format: 'email',
        path: '/user/email',
        nullable: true,
      });
      expect(testFn(validHint)).toBe(true);

      // nullable만 다름
      const invalidNullableHint = createTestHint({
        type: 'string',
        format: 'email',
        path: '/user/email',
        nullable: false,
      });
      expect(testFn(invalidNullableHint)).toBe(false);
    });
  });

  describe('inputType 필드 테스트', () => {
    test('단일 inputType 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { inputType: 'textarea' }, Component: TestTextareaComponent },
        { test: { inputType: 'select' }, Component: TestSelectComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      const textareaHint = createTestHint({ inputType: 'textarea' });
      expect(normalized[0].test(textareaHint)).toBe(true);
      expect(normalized[1].test(textareaHint)).toBe(false);

      const selectHint = createTestHint({ inputType: 'select' });
      expect(normalized[0].test(selectHint)).toBe(false);
      expect(normalized[1].test(selectHint)).toBe(true);
    });

    test('배열 형태의 inputType 값 매칭', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { inputType: ['textarea', 'select'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ inputType: 'textarea' }))).toBe(true);
      expect(testFn(createTestHint({ inputType: 'select' }))).toBe(true);
      expect(testFn(createTestHint({ inputType: 'input' }))).toBe(false);
    });
  });

  describe('복합 조건 테스트', () => {
    test('모든 조건이 만족해야 true 반환', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: {
            type: 'string',
            format: 'email',
            path: '/user/email',
          },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 모든 조건 만족
      const validHint = createTestHint({
        type: 'string',
        format: 'email',
        path: '/user/email',
      });
      expect(testFn(validHint)).toBe(true);

      // type이 다름
      const invalidTypeHint = createTestHint({
        type: 'number',
        format: 'email',
        path: '/user/email',
      });
      expect(testFn(invalidTypeHint)).toBe(false);

      // format이 다름
      const invalidFormatHint = createTestHint({
        type: 'string',
        format: 'password',
        path: '/user/email',
      });
      expect(testFn(invalidFormatHint)).toBe(false);

      // path가 다름
      const invalidPathHint = createTestHint({
        type: 'string',
        format: 'email',
        path: '/user/name',
      });
      expect(testFn(invalidPathHint)).toBe(false);
    });

    test('배열과 단일 값이 혼합된 복합 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: {
            type: ['string', 'number'],
            format: 'email',
            path: ['/user/email', '/admin/email'],
          },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 유효한 조합들
      expect(
        testFn(
          createTestHint({
            type: 'string',
            format: 'email',
            path: '/user/email',
          }),
        ),
      ).toBe(true);

      expect(
        testFn(
          createTestHint({
            type: 'number',
            format: 'email',
            path: '/admin/email',
          }),
        ),
      ).toBe(true);

      // 잘못된 조합
      expect(
        testFn(
          createTestHint({
            type: 'string',
            format: 'password', // format이 맞지 않음
            path: '/user/email',
          }),
        ),
      ).toBe(false);

      expect(
        testFn(
          createTestHint({
            type: 'boolean', // type이 배열에 없음
            format: 'email',
            path: '/user/email',
          }),
        ),
      ).toBe(false);
    });
  });

  describe('type + inputType 조합 테스트', () => {
    test('type이 string이면서 inputType이 undefined인 경우', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: 'string', inputType: undefined },
          Component: TestStringComponent,
        },
        {
          test: { type: 'string', inputType: 'textarea' },
          Component: TestTextareaComponent,
        },
        { test: { type: 'string' }, Component: TestEmailComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // type: string, inputType: undefined - 첫 번째 정의와 매칭
      const stringWithoutInputType = createTestHint({
        type: 'string',
        inputType: undefined,
      });
      expect(normalized[0].test(stringWithoutInputType)).toBe(true);
      expect(normalized[1].test(stringWithoutInputType)).toBe(false);
      expect(normalized[2].test(stringWithoutInputType)).toBe(true); // inputType 조건 없음

      // type: string, inputType: 'textarea' - 두 번째 정의와 매칭
      const stringWithTextarea = createTestHint({
        type: 'string',
        inputType: 'textarea',
      });
      expect(normalized[0].test(stringWithTextarea)).toBe(false);
      expect(normalized[1].test(stringWithTextarea)).toBe(true);
      expect(normalized[2].test(stringWithTextarea)).toBe(true); // inputType 조건 없음

      // type: string, inputType: 'select' - 세 번째 정의만 매칭
      const stringWithSelect = createTestHint({
        type: 'string',
        inputType: 'select',
      });
      expect(normalized[0].test(stringWithSelect)).toBe(false);
      expect(normalized[1].test(stringWithSelect)).toBe(false);
      expect(normalized[2].test(stringWithSelect)).toBe(true); // inputType 조건 없음
    });
  });

  describe('실제 사용 사례 시나리오', () => {
    test('이메일 입력 필드 선택', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: 'string', format: 'email' },
          Component: TestEmailComponent,
        },
        {
          test: { type: 'string', format: 'password' },
          Component: TestPasswordComponent,
        },
        { test: { type: 'string' }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      const emailHint = createTestHint({
        type: 'string',
        format: 'email',
        path: '/user/email',
        jsonSchema: { type: 'string', format: 'email' },
      });

      // 첫 번째 정의가 이메일과 매칭되어야 함
      expect(normalized[0].test(emailHint)).toBe(true);
      expect(normalized[1].test(emailHint)).toBe(false);
      expect(normalized[2].test(emailHint)).toBe(true); // 기본 string도 매칭
    });

    test('특정 경로의 텍스트에어리어 선택', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { path: '/description' }, Component: TestTextareaComponent },
        { test: { path: '/comment' }, Component: TestTextareaComponent },
        { test: { type: 'string' }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      const descriptionHint = createTestHint({
        type: 'string',
        path: '/description',
      });

      expect(normalized[0].test(descriptionHint)).toBe(true);
      expect(normalized[1].test(descriptionHint)).toBe(false);
      expect(normalized[2].test(descriptionHint)).toBe(true);
    });

    test('커스텀 inputType 컴포넌트 선택', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { inputType: 'custom-select' },
          Component: TestSelectComponent,
        },
        {
          test: { type: 'string', inputType: undefined },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      const customSelectHint = createTestHint({
        type: 'string',
        inputType: 'custom-select',
        jsonSchema: { type: 'string', inputType: 'custom-select' },
      });

      expect(normalized[0].test(customSelectHint)).toBe(true);
      expect(normalized[1].test(customSelectHint)).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    test('hint에 undefined 필드가 있는 경우', () => {
      const definitions: FieldInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      const hintWithUndefinedFormat = createTestHint({ format: undefined });
      expect(testFn(hintWithUndefinedFormat)).toBe(true);
    });

    test('배열에 undefined가 있는 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { format: [undefined, 'email'] as any },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ format: undefined }))).toBe(true);
      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'password' }))).toBe(false);
    });

    test('다양한 타입의 undefined 배열 조건', () => {
      const definitions: FieldInputDefinition[] = [
        {
          test: { type: ['string', undefined] as any },
          Component: TestStringComponent,
        },
        {
          test: { inputType: [undefined, 'select', 'textarea'] as any },
          Component: TestSelectComponent,
        },
        {
          test: { path: ['/user/name', undefined] as any },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);

      // type 테스트
      expect(normalized[0].test(createTestHint({ type: 'string' }))).toBe(true);
      expect(
        normalized[0].test(createTestHint({ type: undefined as any })),
      ).toBe(true);
      expect(normalized[0].test(createTestHint({ type: 'number' }))).toBe(
        false,
      );

      // inputType 테스트
      expect(normalized[1].test(createTestHint({ inputType: undefined }))).toBe(
        true,
      );
      expect(normalized[1].test(createTestHint({ inputType: 'select' }))).toBe(
        true,
      );
      expect(
        normalized[1].test(createTestHint({ inputType: 'textarea' })),
      ).toBe(true);
      expect(normalized[1].test(createTestHint({ inputType: 'input' }))).toBe(
        false,
      );

      // path 테스트
      expect(normalized[2].test(createTestHint({ path: '/user/name' }))).toBe(
        true,
      );
      expect(
        normalized[2].test(createTestHint({ path: undefined as any })),
      ).toBe(true);
      expect(normalized[2].test(createTestHint({ path: '/user/age' }))).toBe(
        false,
      );
    });

    test('빈 객체 테스트 조건', () => {
      const definitions: FieldInputDefinition[] = [
        { test: {}, Component: TestStringComponent },
      ];

      const normalized = normalizeFieldInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 빈 객체는 모든 hint에 대해 true를 반환해야 함
      expect(testFn(createTestHint())).toBe(true);
      expect(testFn(createTestHint({ type: 'number' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
    });
  });
});
