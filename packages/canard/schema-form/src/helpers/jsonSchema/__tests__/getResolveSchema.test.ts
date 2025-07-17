import { describe, expect, it } from 'vitest';

import type { JsonSchema, JsonSchemaWithRef } from '@/schema-form/types';

import { getResolveSchema } from '../getResolveSchema/getResolveSchema';

describe('getResolveSchema', () => {
  describe('when schema has no references', () => {
    it('should return null for schema without $ref', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      expect(resolveSchema).toBeNull();
    });

    it('should return null for empty schema', () => {
      const schema: JsonSchema = { type: 'object' };

      const resolveSchema = getResolveSchema(schema);

      expect(resolveSchema).toBeNull();
    });
  });

  describe('when schema has references', () => {
    it('should return resolve function for simple $ref schema', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          Name: {
            type: 'string',
            minLength: 1,
          },
        },
        properties: {
          name: {
            $ref: '#/$defs/Name',
          },
        },
        required: ['name'],
      };

      const resolveSchema = getResolveSchema(schema);

      expect(resolveSchema).not.toBeNull();
      expect(typeof resolveSchema).toBe('function');
    });

    it('should resolve simple $ref references correctly', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          Name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
          },
        },
        properties: {
          name: {
            $ref: '#/$defs/Name',
          },
        },
      };

      const resolveSchema = getResolveSchema(schema);
      const refSchema: JsonSchemaWithRef = { $ref: '#/$defs/Name' };

      const resolved = resolveSchema!(refSchema);

      expect(resolved).toEqual({
        type: 'string',
        minLength: 1,
        maxLength: 50,
      });
    });

    it('should resolve nested $ref references', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          Person: {
            type: 'object',
            $defs: {
              Name: {
                type: 'string',
                minLength: 1,
              },
            },
            properties: {
              firstName: { $ref: '#/$defs/Person/$defs/Name' },
              lastName: { $ref: '#/$defs/Person/$defs/Name' },
            },
          },
        },
        properties: {
          person: { $ref: '#/$defs/Person' },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      // Person 정의 resolve
      const personRefSchema: JsonSchemaWithRef = { $ref: '#/$defs/Person' };
      const resolvedPerson = resolveSchema!(personRefSchema);

      expect(resolvedPerson).toEqual({
        type: 'object',
        $defs: {
          Name: {
            type: 'string',
            minLength: 1,
          },
        },
        properties: {
          firstName: {
            type: 'string',
            minLength: 1,
          },
          lastName: {
            type: 'string',
            minLength: 1,
          },
        },
      });

      // 중첩된 Name 정의 resolve
      const nameRefSchema: JsonSchemaWithRef = {
        $ref: '#/$defs/Person/$defs/Name',
      };
      const resolvedName = resolveSchema!(nameRefSchema);

      expect(resolvedName).toEqual({
        type: 'string',
        minLength: 1,
      });
    });

    it('should resolve self-referencing schemas', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          children: {
            type: 'array',
            items: { $ref: '#' },
          },
        },
        required: ['id'],
      };

      const resolveSchema = getResolveSchema(schema);
      const refSchema: JsonSchemaWithRef = { $ref: '#' };

      const resolved = resolveSchema!(refSchema);

      expect(resolved).toEqual(schema);
    });

    it('should resolve tree structure with recursive references', () => {
      const schema: JsonSchema = {
        title: 'Tree Schema with $defs',
        type: 'object',
        properties: {
          root: {
            $ref: '#/$defs/TreeNode',
          },
        },
        required: ['root'],
        $defs: {
          TreeNode: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              children: {
                type: 'array',
                items: {
                  $ref: '#/$defs/TreeNode',
                },
              },
            },
            required: ['id', 'name'],
            additionalProperties: false,
          },
        },
      };

      const resolveSchema = getResolveSchema(schema);
      const treeNodeRef: JsonSchemaWithRef = { $ref: '#/$defs/TreeNode' };

      const resolved = resolveSchema!(treeNodeRef);

      expect(resolved).toEqual({
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/$defs/TreeNode',
            },
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      });
    });

    it('should resolve references with escaped characters', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          'user~profile': {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name'],
          },
          'config/settings': {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              language: { type: 'string', default: 'en' },
            },
          },
        },
        properties: {
          userProfile: {
            $ref: '#/$defs/user~0profile', // ~ → ~0 이스케이프
          },
          configSettings: {
            $ref: '#/$defs/config~1settings', // / → ~1 이스케이프
          },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      // 틸드가 이스케이프된 reference
      const userProfileRef: JsonSchemaWithRef = {
        $ref: '#/$defs/user~0profile',
      };
      const resolvedUserProfile = resolveSchema!(userProfileRef);

      expect(resolvedUserProfile).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name'],
      });

      // 슬래시가 이스케이프된 reference
      const configRef: JsonSchemaWithRef = { $ref: '#/$defs/config~1settings' };
      const resolvedConfig = resolveSchema!(configRef);

      expect(resolvedConfig).toEqual({
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark'] },
          language: { type: 'string', default: 'en' },
        },
      });
    });

    it('should resolve direct sub-schema references', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
                required: ['name'],
              },
              settings: {
                type: 'object',
                properties: {
                  theme: { type: 'string', enum: ['light', 'dark'] },
                  notifications: { type: 'boolean', default: true },
                },
              },
            },
          },
          userProfile: {
            $ref: '#/properties/user/properties/profile',
          },
          userSettings: {
            $ref: '#/properties/user/properties/settings',
          },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      // user profile 참조
      const profileRef: JsonSchemaWithRef = {
        $ref: '#/properties/user/properties/profile',
      };
      const resolvedProfile = resolveSchema!(profileRef);

      expect(resolvedProfile).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name'],
      });

      // user settings 참조
      const settingsRef: JsonSchemaWithRef = {
        $ref: '#/properties/user/properties/settings',
      };
      const resolvedSettings = resolveSchema!(settingsRef);

      expect(resolvedSettings).toEqual({
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark'] },
          notifications: { type: 'boolean', default: true },
        },
      });
    });
  });

  describe('maxDepth parameter', () => {
    it('should respect maxDepth parameter in default case', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          Name: { type: 'string' },
        },
        properties: {
          name: { $ref: '#/$defs/Name' },
        },
      };

      // maxDepth 기본값 (1)으로 테스트
      const resolveSchema = getResolveSchema(schema);
      expect(resolveSchema).not.toBeNull();
    });

    it('should respect custom maxDepth parameter', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          Name: { type: 'string' },
        },
        properties: {
          name: { $ref: '#/$defs/Name' },
        },
      };

      // 커스텀 maxDepth로 테스트
      const resolveSchema = getResolveSchema(schema, 5);
      expect(resolveSchema).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle complex schemas with multiple reference types', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          UserType: {
            type: 'string',
            enum: ['admin', 'user', 'guest'],
          },
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              country: { type: 'string' },
            },
            required: ['street', 'city'],
          },
        },
        properties: {
          id: { type: 'string' },
          type: { $ref: '#/$defs/UserType' },
          address: { $ref: '#/$defs/Address' },
          workAddress: { $ref: '#/$defs/Address' },
          permissions: {
            type: 'array',
            items: { $ref: '#/$defs/UserType' },
          },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      // UserType 참조 테스트
      const userTypeRef: JsonSchemaWithRef = { $ref: '#/$defs/UserType' };
      const resolvedUserType = resolveSchema!(userTypeRef);

      expect(resolvedUserType).toEqual({
        type: 'string',
        enum: ['admin', 'user', 'guest'],
      });

      // Address 참조 테스트
      const addressRef: JsonSchemaWithRef = { $ref: '#/$defs/Address' };
      const resolvedAddress = resolveSchema!(addressRef);

      expect(resolvedAddress).toEqual({
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
        required: ['street', 'city'],
      });
    });

    it('should handle non-existent references gracefully', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          ValidDef: { type: 'string' },
        },
        properties: {
          valid: { $ref: '#/$defs/ValidDef' },
        },
      };

      const resolveSchema = getResolveSchema(schema);

      // 존재하지 않는 reference로 테스트
      const invalidRef: JsonSchemaWithRef = { $ref: '#/$defs/NonExistent' };

      // getValue 함수가 undefined를 반환할 때의 동작 확인
      expect(() => {
        resolveSchema!(invalidRef);
      }).not.toThrow();
    });

    it('should handle schemas with mixed reference and non-reference properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        $defs: {
          ContactInfo: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
            },
          },
        },
        properties: {
          id: { type: 'string' }, // 일반 프로퍼티
          name: { type: 'string' }, // 일반 프로퍼티
          contact: { $ref: '#/$defs/ContactInfo' }, // 참조 프로퍼티
          isActive: { type: 'boolean', default: true }, // 일반 프로퍼티
        },
      };

      const resolveSchema = getResolveSchema(schema);

      const contactRef: JsonSchemaWithRef = { $ref: '#/$defs/ContactInfo' };
      const resolvedContact = resolveSchema!(contactRef);

      expect(resolvedContact).toEqual({
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
        },
      });
    });
  });
});
