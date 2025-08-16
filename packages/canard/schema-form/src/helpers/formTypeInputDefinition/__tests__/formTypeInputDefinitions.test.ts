import React from 'react';

import { describe, expect, test } from 'vitest';

import type {
  FormTypeInputDefinition,
  FormTypeTestObject,
  Hint,
} from '@/schema-form/types';

import { normalizeFormTypeInputDefinitions } from '../formTypeInputDefinitions';

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

describe('normalizeFormTypeInputDefinitions', () => {
  describe('빈 입력 처리', () => {
    test('undefined가 주어지면 빈 배열을 반환', () => {
      const result = normalizeFormTypeInputDefinitions(undefined);
      expect(result).toEqual([]);
    });

    test('빈 배열이 주어지면 빈 배열을 반환', () => {
      const result = normalizeFormTypeInputDefinitions([]);
      expect(result).toEqual([]);
    });
  });

  describe('잘못된 컴포넌트 필터링', () => {
    test('React 컴포넌트가 아닌 것들은 제외', () => {
      const definitions: FormTypeInputDefinition[] = [
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

      const result = normalizeFormTypeInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(result[0].Component).toBeDefined();
    });
  });

  describe('FormTypeTestFn을 사용한 정의', () => {
    test('함수형 테스트는 그대로 유지', () => {
      const testFn = (hint: Hint) => hint.type === 'string';
      const definitions: FormTypeInputDefinition[] = [
        {
          test: testFn,
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFormTypeInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(result[0].test).toBe(testFn);
      expect(result[0].Component).toBeDefined();
    });
  });

  describe('FormTypeTestObject를 사용한 정의', () => {
    test('객체 형태의 테스트는 함수로 변환', () => {
      const testObject: FormTypeTestObject = { type: 'string' };
      const definitions: FormTypeInputDefinition[] = [
        {
          test: testObject,
          Component: TestStringComponent,
        },
      ];

      const result = normalizeFormTypeInputDefinitions(definitions);
      expect(result).toHaveLength(1);
      expect(typeof result[0].test).toBe('function');
      expect(result[0].Component).toBeDefined();
    });

    test('잘못된 테스트 타입은 제외', () => {
      const definitions: FormTypeInputDefinition[] = [
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

      const result = normalizeFormTypeInputDefinitions(definitions);
      expect(result).toHaveLength(1);
    });
  });
});

describe('formTypeTestFnFactory (formTypeTestObject를 통한 간접 테스트)', () => {
  const createTestHint = (overrides: Partial<Hint> = {}): Hint => ({
    type: 'string',
    path: '/test',
    jsonSchema: { type: 'string' },
    format: undefined,
    formType: undefined,
    ...overrides,
  });

  describe('type 필드 테스트', () => {
    test('단일 type 값 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { type: 'string' }, Component: TestStringComponent },
        { test: { type: 'number' }, Component: TestNumberComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

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
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { type: ['string', 'number'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
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
      const definitions: FormTypeInputDefinition[] = [
        { test: { format: 'email' }, Component: TestEmailComponent },
        { test: { format: 'password' }, Component: TestPasswordComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

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
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { format: ['email', 'password'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'password' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'url' }))).toBe(false);
    });

    test('undefined format 값 처리', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // format이 undefined인 경우
      expect(testFn(createTestHint({ format: undefined }))).toBe(true);

      // format이 다른 값인 경우
      expect(testFn(createTestHint({ format: 'email' }))).toBe(false);
    });

    test('format이 없는 hint에서 undefined와 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      const hintWithoutFormat = createTestHint();
      delete (hintWithoutFormat as any).format;

      expect(testFn(hintWithoutFormat)).toBe(true);
    });
  });

  describe('path 필드 테스트', () => {
    test('단일 path 값 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { path: '/user/name' }, Component: TestStringComponent },
        { test: { path: '/user/age' }, Component: TestNumberComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      const nameHint = createTestHint({ path: '/user/name' });
      expect(normalized[0].test(nameHint)).toBe(true);
      expect(normalized[1].test(nameHint)).toBe(false);

      const ageHint = createTestHint({ path: '/user/age' });
      expect(normalized[0].test(ageHint)).toBe(false);
      expect(normalized[1].test(ageHint)).toBe(true);
    });

    test('배열 형태의 path 값 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { path: ['/user/name', '/user/email'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ path: '/user/name' }))).toBe(true);
      expect(testFn(createTestHint({ path: '/user/email' }))).toBe(true);
      expect(testFn(createTestHint({ path: '/user/age' }))).toBe(false);
    });
  });

  describe('formType 필드 테스트', () => {
    test('단일 formType 값 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { formType: 'textarea' }, Component: TestTextareaComponent },
        { test: { formType: 'select' }, Component: TestSelectComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      const textareaHint = createTestHint({ formType: 'textarea' });
      expect(normalized[0].test(textareaHint)).toBe(true);
      expect(normalized[1].test(textareaHint)).toBe(false);

      const selectHint = createTestHint({ formType: 'select' });
      expect(normalized[0].test(selectHint)).toBe(false);
      expect(normalized[1].test(selectHint)).toBe(true);
    });

    test('배열 형태의 formType 값 매칭', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { formType: ['textarea', 'select'] },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ formType: 'textarea' }))).toBe(true);
      expect(testFn(createTestHint({ formType: 'select' }))).toBe(true);
      expect(testFn(createTestHint({ formType: 'input' }))).toBe(false);
    });
  });

  describe('복합 조건 테스트', () => {
    test('모든 조건이 만족해야 true 반환', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: {
            type: 'string',
            format: 'email',
            path: '/user/email',
          },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
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
      const definitions: FormTypeInputDefinition[] = [
        {
          test: {
            type: ['string', 'number'],
            format: 'email',
            path: ['/user/email', '/admin/email'],
          },
          Component: TestEmailComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
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

  describe('type + formType 조합 테스트', () => {
    test('type이 string이면서 formType이 undefined인 경우', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { type: 'string', formType: undefined },
          Component: TestStringComponent,
        },
        {
          test: { type: 'string', formType: 'textarea' },
          Component: TestTextareaComponent,
        },
        { test: { type: 'string' }, Component: TestEmailComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      // type: string, formType: undefined - 첫 번째 정의와 매칭
      const stringWithoutFormType = createTestHint({
        type: 'string',
        formType: undefined,
      });
      expect(normalized[0].test(stringWithoutFormType)).toBe(true);
      expect(normalized[1].test(stringWithoutFormType)).toBe(false);
      expect(normalized[2].test(stringWithoutFormType)).toBe(true); // formType 조건 없음

      // type: string, formType: 'textarea' - 두 번째 정의와 매칭
      const stringWithTextarea = createTestHint({
        type: 'string',
        formType: 'textarea',
      });
      expect(normalized[0].test(stringWithTextarea)).toBe(false);
      expect(normalized[1].test(stringWithTextarea)).toBe(true);
      expect(normalized[2].test(stringWithTextarea)).toBe(true); // formType 조건 없음

      // type: string, formType: 'select' - 세 번째 정의만 매칭
      const stringWithSelect = createTestHint({
        type: 'string',
        formType: 'select',
      });
      expect(normalized[0].test(stringWithSelect)).toBe(false);
      expect(normalized[1].test(stringWithSelect)).toBe(false);
      expect(normalized[2].test(stringWithSelect)).toBe(true); // formType 조건 없음
    });
  });

  describe('실제 사용 사례 시나리오', () => {
    test('이메일 입력 필드 선택', () => {
      const definitions: FormTypeInputDefinition[] = [
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

      const normalized = normalizeFormTypeInputDefinitions(definitions);

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
      const definitions: FormTypeInputDefinition[] = [
        { test: { path: '/description' }, Component: TestTextareaComponent },
        { test: { path: '/comment' }, Component: TestTextareaComponent },
        { test: { type: 'string' }, Component: TestStringComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      const descriptionHint = createTestHint({
        type: 'string',
        path: '/description',
      });

      expect(normalized[0].test(descriptionHint)).toBe(true);
      expect(normalized[1].test(descriptionHint)).toBe(false);
      expect(normalized[2].test(descriptionHint)).toBe(true);
    });

    test('커스텀 formType 컴포넌트 선택', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { formType: 'custom-select' }, Component: TestSelectComponent },
        {
          test: { type: 'string', formType: undefined },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      const customSelectHint = createTestHint({
        type: 'string',
        formType: 'custom-select',
        jsonSchema: { type: 'string', formType: 'custom-select' },
      });

      expect(normalized[0].test(customSelectHint)).toBe(true);
      expect(normalized[1].test(customSelectHint)).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    test('hint에 undefined 필드가 있는 경우', () => {
      const definitions: FormTypeInputDefinition[] = [
        { test: { format: undefined }, Component: TestStringComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      const hintWithUndefinedFormat = createTestHint({ format: undefined });
      expect(testFn(hintWithUndefinedFormat)).toBe(true);
    });

    test('배열에 undefined가 있는 조건', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { format: [undefined, 'email'] as any },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      expect(testFn(createTestHint({ format: undefined }))).toBe(true);
      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'password' }))).toBe(false);
    });

    test('다양한 타입의 undefined 배열 조건', () => {
      const definitions: FormTypeInputDefinition[] = [
        {
          test: { type: ['string', undefined] as any },
          Component: TestStringComponent,
        },
        {
          test: { formType: [undefined, 'select', 'textarea'] as any },
          Component: TestSelectComponent,
        },
        {
          test: { path: ['/user/name', undefined] as any },
          Component: TestStringComponent,
        },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);

      // type 테스트
      expect(normalized[0].test(createTestHint({ type: 'string' }))).toBe(true);
      expect(
        normalized[0].test(createTestHint({ type: undefined as any })),
      ).toBe(true);
      expect(normalized[0].test(createTestHint({ type: 'number' }))).toBe(
        false,
      );

      // formType 테스트
      expect(normalized[1].test(createTestHint({ formType: undefined }))).toBe(
        true,
      );
      expect(normalized[1].test(createTestHint({ formType: 'select' }))).toBe(
        true,
      );
      expect(normalized[1].test(createTestHint({ formType: 'textarea' }))).toBe(
        true,
      );
      expect(normalized[1].test(createTestHint({ formType: 'input' }))).toBe(
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
      const definitions: FormTypeInputDefinition[] = [
        { test: {}, Component: TestStringComponent },
      ];

      const normalized = normalizeFormTypeInputDefinitions(definitions);
      const testFn = normalized[0].test;

      // 빈 객체는 모든 hint에 대해 true를 반환해야 함
      expect(testFn(createTestHint())).toBe(true);
      expect(testFn(createTestHint({ type: 'number' }))).toBe(true);
      expect(testFn(createTestHint({ format: 'email' }))).toBe(true);
    });
  });
});
