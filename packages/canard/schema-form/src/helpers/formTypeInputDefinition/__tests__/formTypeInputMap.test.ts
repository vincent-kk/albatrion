import React from 'react';

import { describe, expect, test } from 'vitest';

import type { FormTypeInputMap } from '@/schema-form/types';

import { normalizeFormTypeInputMap } from '../formTypeInputMap';

// 테스트용 React 컴포넌트들
const TestStringComponent = () =>
  React.createElement('input', { type: 'text' });
const TestNumberComponent = () =>
  React.createElement('input', { type: 'number' });
const TestArrayItemComponent = () =>
  React.createElement('div', {}, 'Array Item');
const TestUserNameComponent = () =>
  React.createElement('input', { type: 'text', placeholder: 'username' });
const TestUserEmailComponent = () =>
  React.createElement('input', { type: 'email' });

// 테스트용 잘못된 컴포넌트
const NotAComponent = 'not-a-component';

describe('normalizeFormTypeInputMap', () => {
  describe('빈 입력 처리', () => {
    test('undefined가 주어지면 빈 배열을 반환', () => {
      const result = normalizeFormTypeInputMap(undefined);
      expect(result).toEqual([]);
    });

    test('빈 객체가 주어지면 빈 배열을 반환', () => {
      const result = normalizeFormTypeInputMap({});
      expect(result).toEqual([]);
    });
  });

  describe('잘못된 컴포넌트 필터링', () => {
    test('React 컴포넌트가 아닌 것들은 제외', () => {
      const inputMap: FormTypeInputMap = {
        '/user/name': NotAComponent as any,
        '/user/age': 123 as any,
        '/user/email': TestUserEmailComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(1);
      expect(result[0].Component).toBeDefined();
    });
  });

  describe('정규식 패턴 매칭', () => {
    test('정규식 패턴을 key로 사용하는 경우', () => {
      const inputMap: FormTypeInputMap = {
        '/user/(name|email)': TestUserNameComponent,
        '/api/v[12]/users': TestStringComponent,
        '/settings/\\d+': TestNumberComponent,
        '^/admin.*': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(4);

      // /user/(name|email) 패턴
      expect(
        result[0].test({
          path: '/user/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/user/email',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/user/phone',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // /api/v[12]/users 패턴
      expect(
        result[1].test({
          path: '/api/v1/users',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/api/v2/users',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/api/v3/users',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // /settings/\\d+ 패턴 (숫자)
      expect(
        result[2].test({
          path: '/settings/123',
          type: 'number',
          nullable: false,
          required: false,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/settings/0',
          type: 'number',
          nullable: false,
          required: true,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/settings/abc',
          type: 'number',
          nullable: false,
          required: false,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(false);

      // ^/admin.* 패턴 (admin으로 시작하는 모든 경로)
      expect(
        result[3].test({
          path: '/admin',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/admin/users',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/admin/settings/theme',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/user/admin',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);
    });

    test('복잡한 정규식 패턴', () => {
      const inputMap: FormTypeInputMap = {
        '/orders/\\d{4}-\\d{2}-\\d{2}': TestStringComponent, // 날짜 패턴
        '/files/.*\\.(jpg|png|gif)$': TestStringComponent, // 이미지 파일 패턴
        '/api/(?:users|posts)/\\d+/comments': TestStringComponent, // 비캡처 그룹
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(3);

      // 날짜 패턴
      expect(
        result[0].test({
          path: '/orders/2024-01-15',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/orders/2024-1-5',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 형식이 맞지 않음

      // 이미지 파일 패턴
      expect(
        result[1].test({
          path: '/files/avatar.jpg',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/files/logo.png',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/files/document.pdf',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // 비캡처 그룹 패턴
      expect(
        result[2].test({
          path: '/api/users/123/comments',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/api/posts/456/comments',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/api/orders/789/comments',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);
    });

    test('정규식과 정확한 경로 매칭의 우선순위', () => {
      const inputMap: FormTypeInputMap = {
        '/user/profile': TestUserNameComponent, // 정확한 경로
        '/user/.*': TestStringComponent, // 정규식 패턴
      };

      const result = normalizeFormTypeInputMap(inputMap);

      // 정확한 경로가 먼저 체크되고, 그 후 정규식이 체크됨
      expect(
        result[0].test({
          path: '/user/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true); // 정확한 경로 매칭

      expect(
        result[1].test({
          path: '/user/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true); // 정규식도 매칭됨

      expect(
        result[1].test({
          path: '/user/settings',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true); // 정규식만 매칭됨
    });

    test('잘못된 정규식 패턴 에러 처리', () => {
      // 각각 에러가 발생해야 함
      expect(() => {
        normalizeFormTypeInputMap({
          '/invalid[regex': TestStringComponent, // 닫히지 않은 bracket
        });
      }).toThrow(
        'FormTypeInputMap contains an invalid key pattern.: /invalid[regex',
      );

      expect(() => {
        normalizeFormTypeInputMap({
          '/another(unclosed': TestStringComponent, // 닫히지 않은 parenthesis
        });
      }).toThrow(
        'FormTypeInputMap contains an invalid key pattern.: /another(unclosed',
      );

      expect(() => {
        normalizeFormTypeInputMap({
          '/invalid*+': TestStringComponent, // 잘못된 quantifier
        });
      }).toThrow(
        'FormTypeInputMap contains an invalid key pattern.: /invalid*+',
      );
    });
  });

  describe('정확한 경로 매칭 (pathExactMatchFnFactory)', () => {
    test('정확한 경로 매칭', () => {
      const inputMap: FormTypeInputMap = {
        '/user/name': TestUserNameComponent,
        '/user/email': TestUserEmailComponent,
        '/settings/theme': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(3);

      // 정확한 경로 매칭 테스트
      expect(
        result[0].test({
          path: '/user/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/user/email',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[1].test({
          path: '/user/email',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/settings/theme',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });

    test('경로가 일치하지 않으면 false', () => {
      const inputMap: FormTypeInputMap = {
        '/user/name': TestUserNameComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      expect(
        result[0].test({
          path: '/user/age',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[0].test({
          path: '/admin/name',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);
    });
  });

  describe('인덱스 패턴 매칭 (formTypeTestFnFactory)', () => {
    test('배열 인덱스 패턴 매칭', () => {
      const inputMap: FormTypeInputMap = {
        '/users/*/name': TestUserNameComponent,
        '/items/*/description': TestStringComponent,
        '/data/*/nested/*/value': TestNumberComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(3);

      // 첫 번째 패턴: /users/*/name
      expect(
        result[0].test({
          path: '/users/0/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/users/123/name',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/users/invalid/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'invalid'는 배열 인덱스가 아님

      expect(
        result[0].test({
          path: '/users/0/email',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 마지막 세그먼트가 다름

      // 두 번째 패턴: /items/*/description
      expect(
        result[1].test({
          path: '/items/5/description',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/items/0/title',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // 세 번째 패턴: /data/*/nested/*/value
      expect(
        result[2].test({
          path: '/data/0/nested/1/value',
          type: 'number',
          nullable: false,
          required: true,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/data/10/nested/20/value',
          type: 'number',
          nullable: false,
          required: false,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/data/abc/nested/1/value',
          type: 'number',
          nullable: false,
          required: true,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(false); // 'abc'는 배열 인덱스가 아님
    });

    test('세그먼트 길이가 다르면 매칭되지 않음', () => {
      const inputMap: FormTypeInputMap = {
        '/users/*/name': TestUserNameComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      // 세그먼트 수가 다른 경우들
      expect(
        result[0].test({
          path: '/users/0',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 2개 vs 3개

      expect(
        result[0].test({
          path: '/users/0/name/extra',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 4개 vs 3개

      expect(
        result[0].test({
          path: '/users',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 1개 vs 3개
    });

    test('비-인덱스 세그먼트 정확 매칭', () => {
      const inputMap: FormTypeInputMap = {
        '/api/users/*/profile': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      expect(
        result[0].test({
          path: '/api/users/0/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/api/admin/0/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'admin' vs 'users'

      expect(
        result[0].test({
          path: '/v2/users/0/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'v2' vs 'api'
    });
  });

  describe('정규식과 인덱스 패턴 혼합', () => {
    test('정규식, 인덱스 패턴, 정확한 경로가 모두 섞인 경우', () => {
      const inputMap: FormTypeInputMap = {
        '/users/*/name': TestUserNameComponent, // 인덱스 패턴
        '/users/\\d+/email': TestUserEmailComponent, // 정규식 (숫자 인덱스만)
        '/users/admin/settings': TestStringComponent, // 정확한 경로
        '/api/v\\d+/.*': TestStringComponent, // 정규식 (버전 + 와일드카드)
        '/files/*/images/(thumb|full)': TestStringComponent, // 인덱스 + 정규식 혼합
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(5);

      // 인덱스 패턴: /users/*/name
      expect(
        result[0].test({
          path: '/users/0/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/users/admin/name',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'admin'은 배열 인덱스가 아님

      // 정규식: /users/\\d+/email (숫자 인덱스만)
      expect(
        result[1].test({
          path: '/users/123/email',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/users/0/email',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/users/admin/email',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'admin'은 숫자가 아님

      // 정확한 경로: /users/admin/settings
      expect(
        result[2].test({
          path: '/users/admin/settings',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/users/0/settings',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // 정규식: /api/v\\d+/.*
      expect(
        result[3].test({
          path: '/api/v1/users',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/api/v2/posts/123',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/api/beta/users',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      // 혼합 패턴: /files/*/images/(thumb|full)
      expect(
        result[4].test({
          path: '/files/gallery/images/thumb',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false); // 'gallery'는 배열 인덱스가 아님 (정규식이 아닌 인덱스 패턴으로 처리됨)
    });

    test('Fragment와 정규식 조합', () => {
      const inputMap: FormTypeInputMap = {
        '#/users/\\d+/profile': TestUserNameComponent,
        '#/admin/(users|posts|settings)': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(2);

      // Fragment 제거 후 정규식 매칭
      expect(
        result[0].test({
          path: '/users/123/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/admin/users',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/admin/posts',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/admin/comments',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);
    });
  });

  describe('혼합된 패턴 처리', () => {
    test('인덱스 패턴과 정확한 경로가 혼합된 경우', () => {
      const inputMap: FormTypeInputMap = {
        '/users/*/name': TestUserNameComponent,
        '/users/profile': TestStringComponent,
        '/admin/settings': TestNumberComponent,
        '/items/*/tags/*': TestArrayItemComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(4);

      // 인덱스 패턴
      expect(
        result[0].test({
          path: '/users/0/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      // 정확한 경로
      expect(
        result[1].test({
          path: '/users/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/admin/settings',
          type: 'number',
          nullable: false,
          required: true,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      // 다중 인덱스 패턴
      expect(
        result[3].test({
          path: '/items/0/tags/1',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '/items/5/tags/10',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });
  });

  describe('Fragment 제거 처리', () => {
    test('#이 포함된 경로에서 fragment 제거', () => {
      const inputMap: FormTypeInputMap = {
        '#/user/name': TestUserNameComponent,
        '#/items/*/title': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(2);

      // Fragment가 제거된 후 매칭되어야 함
      expect(
        result[0].test({
          path: '/user/name',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/items/0/title',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });
  });

  describe('실제 사용 사례', () => {
    test('폼 필드별 컴포넌트 매핑', () => {
      const inputMap: FormTypeInputMap = {
        '/user/name': TestUserNameComponent,
        '/user/email': TestUserEmailComponent,
        '/orders/*/items/*/name': TestStringComponent,
        '/orders/*/total': TestNumberComponent,
        '/settings/*': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(5);

      // 사용자 정보
      expect(
        result[0].test({
          path: '/user/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/user/email',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      // 주문 아이템
      expect(
        result[2].test({
          path: '/orders/0/items/0/name',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '/orders/5/items/2/name',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      // 주문 총액
      expect(
        result[3].test({
          path: '/orders/0/total',
          type: 'number',
          nullable: false,
          required: true,
          jsonSchema: { type: 'number' },
        }),
      ).toBe(true);

      // 설정들
      expect(
        result[4].test({
          path: '/settings/0',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[4].test({
          path: '/settings/100',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });

    test('중복되지 않는 서로 다른 패턴들', () => {
      const inputMap: FormTypeInputMap = {
        '/api/users/*': TestUserNameComponent,
        '/api/posts/*/comments/*': TestStringComponent,
        '/static/assets': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      // 각각 다른 패턴이므로 겹치지 않아야 함
      expect(
        result[0].test({
          path: '/api/users/123',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/api/posts/1/comments/2',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[1].test({
          path: '/api/posts/1/comments/2',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '/api/users/123',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[2].test({
          path: '/static/assets',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });
  });

  describe('에러 처리', () => {
    test('잘못된 경로 패턴에 대한 에러 처리', () => {
      // pathExactMatchFnFactory에서 정규식 생성에 실패할 수 있는 패턴들
      const invalidPatterns: FormTypeInputMap = {
        '/invalid[regex': TestStringComponent,
      };

      // 에러가 발생해야 함
      expect(() => {
        normalizeFormTypeInputMap(invalidPatterns);
      }).toThrow();
    });
  });

  describe('엣지 케이스', () => {
    test('루트 경로', () => {
      const inputMap: FormTypeInputMap = {
        '/': TestStringComponent,
        '#': TestNumberComponent,
        '#/': TestNumberComponent,
        '': TestNumberComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);
      expect(result).toHaveLength(4);

      expect(
        result[0].test({
          path: '',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[1].test({
          path: '',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[2].test({
          path: '',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[3].test({
          path: '',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);
    });

    test('매우 깊은 중첩 경로', () => {
      const inputMap: FormTypeInputMap = {
        '/level1/*/level3/*/level5/*/level7/*/value': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      expect(
        result[0].test({
          path: '/level1/0/level3/1/level5/2/level7/3/value',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/level1/0/level3/1/level5/2/level7/invalid/value',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);
    });

    test('숫자가 아닌 문자열이 인덱스 위치에 있는 경우', () => {
      const inputMap: FormTypeInputMap = {
        '/users/*/profile': TestStringComponent,
      };

      const result = normalizeFormTypeInputMap(inputMap);

      // 유효한 인덱스들
      expect(
        result[0].test({
          path: '/users/0/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      expect(
        result[0].test({
          path: '/users/123/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true);

      // 무효한 인덱스들
      expect(
        result[0].test({
          path: '/users/abc/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[0].test({
          path: '/users/-1/profile',
          type: 'string',
          nullable: false,
          required: false,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(false);

      expect(
        result[0].test({
          path: '/users/01/profile',
          type: 'string',
          nullable: false,
          required: true,
          jsonSchema: { type: 'string' },
        }),
      ).toBe(true); // isArrayIndex가 '01'을 유효한 인덱스로 인식
    });
  });
});
