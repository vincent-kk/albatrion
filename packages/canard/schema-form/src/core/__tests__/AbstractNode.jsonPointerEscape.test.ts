import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * JSON Pointer RFC 6901에 따른 이스케이프 테스트
 *
 * RFC 6901 표준에 따르면:
 * - `~` → `~0`로 이스케이프
 * - `/` → `~1`로 이스케이프
 */
describe('AbstractNode - JSON Pointer Escape', () => {
  describe('RFC 6901 표준 이스케이프 문자 (~, /)', () => {
    it('틸드(~) 문자가 포함된 프로퍼티 키가 정상적으로 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'user~name': {
            type: 'string',
            default: 'John Doe',
          },
          'config~settings': {
            type: 'object',
            properties: {
              'theme~mode': {
                type: 'string',
                default: 'dark',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 프로퍼티 키와 이스케이프된 키 검증
      const userNameNode = node.find('user~0name');
      expect(userNameNode).toBeDefined();
      expect(userNameNode?.name).toBe('user~name');
      expect(userNameNode?.escapedName).toBe('user~0name');
      expect(userNameNode?.path).toBe('/user~0name');
      expect(userNameNode?.value).toBe('John Doe');

      // 중첩된 객체의 틸드 문자 검증
      const configNode = node.find('config~0settings');
      expect(configNode?.name).toBe('config~settings');
      expect(configNode?.escapedName).toBe('config~0settings');
      expect(configNode?.path).toBe('/config~0settings');

      const themeNode = node.find('config~0settings/theme~0mode');
      expect(themeNode?.name).toBe('theme~mode');
      expect(themeNode?.escapedName).toBe('theme~0mode');
      expect(themeNode?.path).toBe('/config~0settings/theme~0mode');
      expect(themeNode?.value).toBe('dark');
    });

    it('슬래시(/) 문자가 포함된 프로퍼티 키가 정상적으로 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'user/name': {
            type: 'string',
            default: 'Jane Smith',
          },
          'config/database': {
            type: 'object',
            properties: {
              'host/port': {
                type: 'string',
                default: 'localhost:5432',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 슬래시 문자 이스케이프 검증
      const userNameNode = node.find('user~1name');
      expect(userNameNode).toBeDefined();
      expect(userNameNode?.name).toBe('user/name');
      expect(userNameNode?.escapedName).toBe('user~1name');
      expect(userNameNode?.path).toBe('/user~1name');
      expect(userNameNode?.value).toBe('Jane Smith');

      // 중첩된 객체의 슬래시 문자 검증
      const configNode = node.find('config~1database');
      expect(configNode?.name).toBe('config/database');
      expect(configNode?.escapedName).toBe('config~1database');
      expect(configNode?.path).toBe('/config~1database');

      const hostPortNode = node.find('config~1database/host~1port');
      expect(hostPortNode?.name).toBe('host/port');
      expect(hostPortNode?.escapedName).toBe('host~1port');
      expect(hostPortNode?.path).toBe('/config~1database/host~1port');
      expect(hostPortNode?.value).toBe('localhost:5432');
    });

    it('틸드와 슬래시가 모두 포함된 프로퍼티 키가 정상적으로 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'user~/settings': {
            type: 'string',
            default: 'mixed chars',
          },
          'config/~database': {
            type: 'object',
            properties: {
              '~host/port~': {
                type: 'string',
                default: 'complex key',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 혼합 문자 이스케이프 검증
      const userSettingsNode = node.find('user~0~1settings');
      expect(userSettingsNode?.name).toBe('user~/settings');
      expect(userSettingsNode?.escapedName).toBe('user~0~1settings');
      expect(userSettingsNode?.path).toBe('/user~0~1settings');
      expect(userSettingsNode?.value).toBe('mixed chars');

      const configNode = node.find('config~1~0database');
      expect(configNode?.name).toBe('config/~database');
      expect(configNode?.escapedName).toBe('config~1~0database');
      expect(configNode?.path).toBe('/config~1~0database');

      const hostPortNode = node.find('config~1~0database/~0host~1port~0');
      expect(hostPortNode?.name).toBe('~host/port~');
      expect(hostPortNode?.escapedName).toBe('~0host~1port~0');
      expect(hostPortNode?.path).toBe('/config~1~0database/~0host~1port~0');
      expect(hostPortNode?.value).toBe('complex key');
    });
  });

  describe('확장 문자는 이스케이프되지 않음 (.., ., *, #)', () => {
    it('점(.) 문자가 포함된 프로퍼티 키는 이스케이프되지 않아야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'user.name': {
            type: 'string',
            default: 'John.Doe',
          },
          'config.settings': {
            type: 'object',
            properties: {
              'app.version': {
                type: 'string',
                default: '1.0.0',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const userNameNode = node.find('user.name');
      expect(userNameNode?.name).toBe('user.name');
      expect(userNameNode?.escapedName).toBe('user.name');
      expect(userNameNode?.path).toBe('/user.name');

      const appVersionNode = node.find('config.settings/app.version');
      expect(appVersionNode?.name).toBe('app.version');
      expect(appVersionNode?.escapedName).toBe('app.version');
      expect(appVersionNode?.path).toBe('/config.settings/app.version');
    });

    it('더블 점(..) 문자가 포함된 프로퍼티 키는 이스케이프되지 않아야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'parent..dir': {
            type: 'string',
            default: 'parent directory',
          },
          'config..backup': {
            type: 'object',
            properties: {
              'data..store': {
                type: 'string',
                default: 'backup store',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const parentDirNode = node.find('parent..dir');
      expect(parentDirNode?.name).toBe('parent..dir');
      expect(parentDirNode?.escapedName).toBe('parent..dir');
      expect(parentDirNode?.path).toBe('/parent..dir');

      const dataStoreNode = node.find('config..backup/data..store');
      expect(dataStoreNode?.name).toBe('data..store');
      expect(dataStoreNode?.escapedName).toBe('data..store');
      expect(dataStoreNode?.path).toBe('/config..backup/data..store');
    });

    it('별표(*) 문자가 포함된 프로퍼티 키는 이스케이프되지 않아야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'wildcard*key': {
            type: 'string',
            default: 'wildcard value',
          },
          'data*files': {
            type: 'object',
            properties: {
              'log*entries': {
                type: 'string',
                default: 'log data',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const wildcardNode = node.find('wildcard*key');
      expect(wildcardNode?.name).toBe('wildcard*key');
      expect(wildcardNode?.escapedName).toBe('wildcard*key');
      expect(wildcardNode?.path).toBe('/wildcard*key');

      const logEntriesNode = node.find('data*files/log*entries');
      expect(logEntriesNode?.name).toBe('log*entries');
      expect(logEntriesNode?.escapedName).toBe('log*entries');
      expect(logEntriesNode?.path).toBe('/data*files/log*entries');
    });

    it('해시(#) 문자가 포함된 프로퍼티 키는 이스케이프되지 않아야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'fragment#key': {
            type: 'string',
            default: 'fragment value',
          },
          'config#vars': {
            type: 'object',
            properties: {
              'env#settings': {
                type: 'string',
                default: 'environment settings',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const fragmentNode = node.find('fragment#key');
      expect(fragmentNode?.name).toBe('fragment#key');
      expect(fragmentNode?.escapedName).toBe('fragment#key');
      expect(fragmentNode?.path).toBe('/fragment#key');

      const envSettingsNode = node.find('config#vars/env#settings');
      expect(envSettingsNode?.name).toBe('env#settings');
      expect(envSettingsNode?.escapedName).toBe('env#settings');
      expect(envSettingsNode?.path).toBe('/config#vars/env#settings');
    });
  });

  describe('RFC 6901 표준 이스케이프만 적용되는 복합 케이스', () => {
    it('틸드와 슬래시만 이스케이프되고 다른 특수 문자는 그대로 유지되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'complex~/..*#key': {
            type: 'string',
            default: 'mixed special chars',
          },
          'another#.*~/complex': {
            type: 'object',
            properties: {
              'nested~/../*#prop': {
                type: 'string',
                default: 'deeply nested',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 틸드와 슬래시만 이스케이프되고 나머지는 그대로
      const complexNode = node.find('complex~0~1..*#key');
      expect(complexNode?.name).toBe('complex~/..*#key');
      expect(complexNode?.escapedName).toBe('complex~0~1..*#key');
      expect(complexNode?.path).toBe('/complex~0~1..*#key');
      expect(complexNode?.value).toBe('mixed special chars');

      // 다른 순서의 특수 문자 검증
      const anotherNode = node.find('another#.*~0~1complex');
      expect(anotherNode?.name).toBe('another#.*~/complex');
      expect(anotherNode?.escapedName).toBe('another#.*~0~1complex');
      expect(anotherNode?.path).toBe('/another#.*~0~1complex');

      // 중첩된 복합 키 검증
      const nestedNode = node.find(
        'another#.*~0~1complex/nested~0~1..~1*#prop',
      );
      expect(nestedNode?.name).toBe('nested~/../*#prop');
      expect(nestedNode?.escapedName).toBe('nested~0~1..~1*#prop');
      expect(nestedNode?.path).toBe(
        '/another#.*~0~1complex/nested~0~1..~1*#prop',
      );
      expect(nestedNode?.value).toBe('deeply nested');
    });

    it('연속된 RFC 6901 표준 문자만 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          '~~key': {
            type: 'string',
            default: 'double tilde',
          },
          '//path': {
            type: 'string',
            default: 'double slash',
          },
          '...dots': {
            type: 'string',
            default: 'triple dots',
          },
          '**stars': {
            type: 'string',
            default: 'double stars',
          },
          '##hash': {
            type: 'string',
            default: 'double hash',
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const doubleTildeNode = node.find('~0~0key');
      expect(doubleTildeNode?.name).toBe('~~key');
      expect(doubleTildeNode?.escapedName).toBe('~0~0key');

      const doubleSlashNode = node.find('~1~1path');
      expect(doubleSlashNode?.name).toBe('//path');
      expect(doubleSlashNode?.escapedName).toBe('~1~1path');

      // 확장 문자들은 이스케이프되지 않음
      const tripleDotsNode = node.find('...dots');
      expect(tripleDotsNode?.name).toBe('...dots');
      expect(tripleDotsNode?.escapedName).toBe('...dots');

      const doubleStarsNode = node.find('**stars');
      expect(doubleStarsNode?.name).toBe('**stars');
      expect(doubleStarsNode?.escapedName).toBe('**stars');

      const doubleHashNode = node.find('##hash');
      expect(doubleHashNode?.name).toBe('##hash');
      expect(doubleHashNode?.escapedName).toBe('##hash');
    });
  });

  describe('배열과 객체에서의 이스케이프', () => {
    it('배열 아이템이 특수 문자 프로퍼티를 가져도 RFC 6901 표준만 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'items~array': {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                'item~name': {
                  type: 'string',
                },
                'item/value': {
                  type: 'number',
                },
                'item.id': {
                  type: 'string',
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 배열 노드 생성 및 아이템 추가
      const arrayNode = node.find('items~0array');
      expect(arrayNode?.path).toBe('/items~0array');

      // @ts-expect-error - setValue는 테스트를 위해 any 타입으로 설정
      arrayNode?.setValue([
        { 'item~name': 'first', 'item/value': 1, 'item.id': 'id1' },
        { 'item~name': 'second', 'item/value': 2, 'item.id': 'id2' },
      ]);
      await delay();

      // 배열 내 객체의 특수 문자 프로퍼티 검증
      const firstItemNameNode = node.find('items~0array/0/item~0name');
      expect(firstItemNameNode?.path).toBe('/items~0array/0/item~0name');
      expect(firstItemNameNode?.value).toBe('first');

      const firstItemValueNode = node.find('items~0array/0/item~1value');
      expect(firstItemValueNode?.path).toBe('/items~0array/0/item~1value');
      expect(firstItemValueNode?.value).toBe(1);

      // 점은 이스케이프되지 않음
      const firstItemIdNode = node.find('items~0array/0/item.id');
      expect(firstItemIdNode?.path).toBe('/items~0array/0/item.id');
      expect(firstItemIdNode?.value).toBe('id1');

      const secondItemNameNode = node.find('items~0array/1/item~0name');
      expect(secondItemNameNode?.path).toBe('/items~0array/1/item~0name');
      expect(secondItemNameNode?.value).toBe('second');
    });

    it('중첩된 객체에서 RFC 6901 표준 문자만 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'level1~prop': {
            type: 'object',
            properties: {
              'level2/prop': {
                type: 'object',
                properties: {
                  'level3.prop': {
                    type: 'object',
                    properties: {
                      'level4*prop': {
                        type: 'string',
                        default: 'deeply nested value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 깊게 중첩된 특수 문자 프로퍼티 검증 (RFC 6901만 이스케이프)
      const deeplyNestedNode = node.find(
        'level1~0prop/level2~1prop/level3.prop/level4*prop',
      );
      expect(deeplyNestedNode?.path).toBe(
        '/level1~0prop/level2~1prop/level3.prop/level4*prop',
      );
      expect(deeplyNestedNode?.value).toBe('deeply nested value');

      // 각 레벨의 이스케이프 검증
      const level1Node = node.find('level1~0prop');
      expect(level1Node?.name).toBe('level1~prop');
      expect(level1Node?.escapedName).toBe('level1~0prop');

      const level2Node = node.find('level1~0prop/level2~1prop');
      expect(level2Node?.name).toBe('level2/prop');
      expect(level2Node?.escapedName).toBe('level2~1prop');

      const level3Node = node.find('level1~0prop/level2~1prop/level3.prop');
      expect(level3Node?.name).toBe('level3.prop');
      expect(level3Node?.escapedName).toBe('level3.prop');

      const level4Node = node.find(
        'level1~0prop/level2~1prop/level3.prop/level4*prop',
      );
      expect(level4Node?.name).toBe('level4*prop');
    });
  });

  describe('find 메서드를 통한 노드 검색', () => {
    it('RFC 6901 표준 이스케이프된 경로로 노드를 찾을 수 있어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'user~name': {
            type: 'string',
            default: 'John',
          },
          'config/settings': {
            type: 'object',
            properties: {
              'theme.mode': {
                type: 'string',
                default: 'dark',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // RFC 6901 표준 이스케이프된 경로로 검색
      const userNameNode1 = node.find('user~0name');
      expect(userNameNode1?.value).toBe('John');

      const themeNode1 = node.find('config~1settings/theme.mode');
      expect(themeNode1?.value).toBe('dark');

      // 절대 경로로 검색
      const userNameNode2 = node.find('/user~0name');
      expect(userNameNode2?.value).toBe('John');

      const themeNode2 = node.find('/config~1settings/theme.mode');
      expect(themeNode2?.value).toBe('dark');

      // 상대 경로로 검색
      const configNode = node.find('config~1settings');
      const themeNode3 = configNode?.find('./theme.mode');
      expect(themeNode3?.value).toBe('dark');
    });

    it('존재하지 않는 경로로 검색 시 null을 반환해야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          normalKey: {
            type: 'string',
            default: 'normal',
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 존재하지 않는 경로
      expect(node.find('user~0name')).toBeNull();
      expect(node.find('config~1settings')).toBeNull();
      expect(node.find('theme.mode')).toBeNull();
      expect(node.find('wildcard*key')).toBeNull();
      expect(node.find('fragment#key')).toBeNull();
    });
  });

  describe('특수 문자가 없는 프로퍼티 키', () => {
    it('특수 문자가 없는 일반적인 프로퍼티 키는 이스케이프되지 않아야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          userName: {
            type: 'string',
            default: 'John',
          },
          userAge: {
            type: 'number',
            default: 30,
          },
          settings: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                default: 'light',
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 일반 프로퍼티 키는 이스케이프되지 않음
      const userNameNode = node.find('userName');
      expect(userNameNode?.name).toBe('userName');
      expect(userNameNode?.escapedName).toBe('userName');
      expect(userNameNode?.path).toBe('/userName');

      const userAgeNode = node.find('userAge');
      expect(userAgeNode?.name).toBe('userAge');
      expect(userAgeNode?.escapedName).toBe('userAge');
      expect(userAgeNode?.path).toBe('/userAge');

      const themeNode = node.find('settings/theme');
      expect(themeNode?.name).toBe('theme');
      expect(themeNode?.escapedName).toBe('theme');
      expect(themeNode?.path).toBe('/settings/theme');
    });
  });

  describe('실제 사용 사례', () => {
    it('파일 경로 같은 실제 키 이름에서 RFC 6901 표준만 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'config/database.json': {
            type: 'object',
            properties: {
              'host~production': {
                type: 'string',
                default: 'prod.db.com',
              },
              'host~development': {
                type: 'string',
                default: 'dev.db.com',
              },
            },
          },
          'logs/app.log': {
            type: 'string',
            default: 'log content',
          },
          'backup~2024-01-01': {
            type: 'object',
            properties: {
              'size.bytes': {
                type: 'number',
                default: 1024,
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 파일 경로 스타일 키 검증 (슬래시만 이스케이프, 점은 그대로)
      const configDbNode = node.find('config~1database.json');
      expect(configDbNode?.name).toBe('config/database.json');
      expect(configDbNode?.escapedName).toBe('config~1database.json');
      expect(configDbNode?.path).toBe('/config~1database.json');

      const hostProdNode = node.find('config~1database.json/host~0production');
      expect(hostProdNode?.name).toBe('host~production');
      expect(hostProdNode?.escapedName).toBe('host~0production');
      expect(hostProdNode?.path).toBe(
        '/config~1database.json/host~0production',
      );
      expect(hostProdNode?.value).toBe('prod.db.com');

      const logNode = node.find('logs~1app.log');
      expect(logNode?.name).toBe('logs/app.log');
      expect(logNode?.escapedName).toBe('logs~1app.log');
      expect(logNode?.value).toBe('log content');

      const backupNode = node.find('backup~02024-01-01');
      expect(backupNode?.name).toBe('backup~2024-01-01');
      expect(backupNode?.escapedName).toBe('backup~02024-01-01');

      const sizeNode = node.find('backup~02024-01-01/size.bytes');
      expect(sizeNode?.name).toBe('size.bytes');
      expect(sizeNode?.escapedName).toBe('size.bytes');
      expect(sizeNode?.path).toBe('/backup~02024-01-01/size.bytes');
      expect(sizeNode?.value).toBe(1024);
    });

    it('URL 쿼리 파라미터 같은 복잡한 키에서 RFC 6901 표준만 이스케이프되어야 함', async () => {
      const schema = {
        type: 'object',
        properties: {
          'api/v1/users?filter=active&sort=name': {
            type: 'object',
            properties: {
              'cache~key': {
                type: 'string',
                default: 'users_active_sorted',
              },
              'response.headers': {
                type: 'object',
                properties: {
                  'content-type': {
                    type: 'string',
                    default: 'application/json',
                  },
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      // 복잡한 URL 스타일 키 검증 (슬래시만 이스케이프)
      const apiNode = node.find('api~1v1~1users?filter=active&sort=name');
      expect(apiNode?.name).toBe('api/v1/users?filter=active&sort=name');
      expect(apiNode?.escapedName).toBe(
        'api~1v1~1users?filter=active&sort=name',
      );

      const cacheKeyNode = node.find(
        'api~1v1~1users?filter=active&sort=name/cache~0key',
      );
      expect(cacheKeyNode?.name).toBe('cache~key');
      expect(cacheKeyNode?.escapedName).toBe('cache~0key');
      expect(cacheKeyNode?.value).toBe('users_active_sorted');

      const headersNode = node.find(
        'api~1v1~1users?filter=active&sort=name/response.headers',
      );
      expect(headersNode?.name).toBe('response.headers');
      expect(headersNode?.escapedName).toBe('response.headers');
      const contentTypeNode = node.find(
        'api~1v1~1users?filter=active&sort=name/response.headers/content-type',
      );
      expect(contentTypeNode?.name).toBe('content-type');
      expect(contentTypeNode?.escapedName).toBe('content-type');
      expect(contentTypeNode?.value).toBe('application/json');
    });
  });
});
