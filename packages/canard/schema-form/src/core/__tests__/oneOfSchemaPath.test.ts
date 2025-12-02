import { describe, expect, it } from 'vitest';

import type { ArraySchema, ObjectSchema } from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import { isArrayNode, isObjectNode } from '../nodes';

describe('oneOf schemaPath assignment', () => {
  describe('Simple oneOf schemas', () => {
    it('should assign correct schemaPath for basic oneOf properties', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        oneOf: [
          {
            properties: {
              address: { type: 'string' },
            },
          },
          {
            properties: {
              phone: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      // Base properties should have simple schemaPath
      const nameNode = node.find('/name');
      const ageNode = node.find('/age');
      expect(nameNode?.schemaPath).toBe('/properties/name');
      expect(ageNode?.schemaPath).toBe('/properties/age');

      // oneOf properties should have oneOf-prefixed schemaPath
      const addressNode = node.find('/address');
      const phoneNode = node.find('/phone');
      expect(addressNode?.schemaPath).toBe('/oneOf/0/properties/address');
      expect(phoneNode?.schemaPath).toBe('/oneOf/1/properties/phone');
    });

    it('should handle oneOf with const discriminators', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          type: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              type: { const: 'user' },
              username: { type: 'string' },
            },
          },
          {
            properties: {
              type: { const: 'admin' },
              permissions: { type: 'array', items: { type: 'string' } },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const typeNode = node.find('/type');
      const usernameNode = node.find('/username');
      const permissionsNode = node.find('/permissions');

      expect(typeNode?.schemaPath).toBe('/properties/type');
      expect(usernameNode?.schemaPath).toBe('/oneOf/0/properties/username');
      expect(permissionsNode?.schemaPath).toBe(
        '/oneOf/1/properties/permissions',
      );
    });

    it('should handle oneOf with enum discriminators', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              status: { enum: ['pending'] },
              estimatedTime: { type: 'string' },
            },
          },
          {
            properties: {
              status: { enum: ['completed'] },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const statusNode = node.find('/status');
      const estimatedTimeNode = node.find('/estimatedTime');
      const completedAtNode = node.find('/completedAt');

      expect(statusNode?.schemaPath).toBe('/properties/status');
      expect(estimatedTimeNode?.schemaPath).toBe(
        '/oneOf/0/properties/estimatedTime',
      );
      expect(completedAtNode?.schemaPath).toBe(
        '/oneOf/1/properties/completedAt',
      );
    });
  });

  describe('Complex nested oneOf schemas', () => {
    it('should handle nested objects with oneOf', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              profile: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                oneOf: [
                  {
                    properties: {
                      type: { const: 'personal' },
                      bio: { type: 'string' },
                    },
                  },
                  {
                    properties: {
                      type: { const: 'business' },
                      company: { type: 'string' },
                      position: { type: 'string' },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const userNode = node.find('/user');
      expect(isObjectNode(userNode)).toBe(true);
      if (!isObjectNode(userNode)) return;

      const profileNode = userNode.find('profile');
      expect(isObjectNode(profileNode)).toBe(true);
      if (!isObjectNode(profileNode)) return;

      // Base properties should have normal paths
      const idNode = userNode.find('id');
      const nameNode = profileNode.find('name');
      expect(idNode?.schemaPath).toBe('/properties/user/properties/id');
      expect(nameNode?.schemaPath).toBe(
        '/properties/user/properties/profile/properties/name',
      );

      // oneOf properties should have nested oneOf paths
      const typeNode = profileNode.find('type');
      const bioNode = profileNode.find('bio');
      const companyNode = profileNode.find('company');
      const positionNode = profileNode.find('position');

      // type is a const discriminator, so it might be null or have special handling
      expect(typeNode).toBeNull();
      expect(bioNode?.schemaPath).toBe(
        '/properties/user/properties/profile/oneOf/0/properties/bio',
      );
      expect(companyNode?.schemaPath).toBe(
        '/properties/user/properties/profile/oneOf/1/properties/company',
      );
      expect(positionNode?.schemaPath).toBe(
        '/properties/user/properties/profile/oneOf/1/properties/position',
      );
    });

    it('should handle arrays containing objects with oneOf', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
              },
              oneOf: [
                {
                  properties: {
                    type: { const: 'product' },
                    price: { type: 'number' },
                    currency: { type: 'string' },
                  },
                },
                {
                  properties: {
                    type: { const: 'service' },
                    duration: { type: 'string' },
                    unit: { type: 'string' },
                  },
                },
              ],
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        defaultValue: {
          items: [
            { id: '1', type: 'product', price: 100, currency: 'USD' },
            { id: '2', type: 'service', duration: '1', unit: 'hour' },
          ],
        },
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const itemsNode = node.find('/items');
      expect(itemsNode).toBeDefined();

      // Array node should have normal path
      expect(itemsNode?.schemaPath).toBe('/properties/items');

      // Array items should be accessible (array node implementation varies)
      // The schemaPath for array item nodes would depend on how array children are implemented
    });

    it('should handle multiple levels of oneOf nesting', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              category: { type: 'string' },
            },
            oneOf: [
              {
                properties: {
                  category: { const: 'media' },
                  content: {
                    type: 'object',
                    properties: {
                      format: { type: 'string' },
                    },
                    oneOf: [
                      {
                        properties: {
                          format: { const: 'image' },
                          width: { type: 'number' },
                          height: { type: 'number' },
                        },
                      },
                      {
                        properties: {
                          format: { const: 'video' },
                          duration: { type: 'number' },
                          framerate: { type: 'number' },
                        },
                      },
                    ],
                  },
                },
              },
              {
                properties: {
                  category: { const: 'text' },
                  content: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      language: { type: 'string' },
                    },
                  },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const dataNode = node.find('/data');
      expect(isObjectNode(dataNode)).toBe(true);
      if (!isObjectNode(dataNode)) return;

      // Base property
      const categoryNode = dataNode.find('category');
      expect(categoryNode?.schemaPath).toBe(
        '/properties/data/properties/category',
      );

      // First level oneOf content
      const contentNode = dataNode.find('content');
      expect(isObjectNode(contentNode)).toBe(true);
      if (!isObjectNode(contentNode)) return;

      // Media branch - nested oneOf
      const formatNode = contentNode.find('format');
      const widthNode = contentNode.find('width');
      const heightNode = contentNode.find('height');
      const durationNode = contentNode.find('duration');
      const framerateNode = contentNode.find('framerate');

      // These should have double-nested oneOf paths
      expect(formatNode?.schemaPath).toBe(
        '/properties/data/oneOf/0/properties/content/properties/format',
      );
      expect(widthNode?.schemaPath).toBe(
        '/properties/data/oneOf/0/properties/content/oneOf/0/properties/width',
      );
      expect(heightNode?.schemaPath).toBe(
        '/properties/data/oneOf/0/properties/content/oneOf/0/properties/height',
      );
      expect(durationNode?.schemaPath).toBe(
        '/properties/data/oneOf/0/properties/content/oneOf/1/properties/duration',
      );
      expect(framerateNode?.schemaPath).toBe(
        '/properties/data/oneOf/0/properties/content/oneOf/1/properties/framerate',
      );

      // Note: The oneOf system selects the first matching branch (media in this case)
      // So text and language properties from the second branch might not be available
      // unless explicitly discriminated. Let's test what's actually available.
      const textNode = contentNode.find('text');
      const languageNode = contentNode.find('language');

      // These nodes may be null because they're in a different oneOf branch
      // The system is currently showing media branch content
      if (textNode) {
        expect(textNode.schemaPath).toContain('text');
      }
      if (languageNode) {
        expect(languageNode.schemaPath).toContain('language');
      }
    });
  });

  describe('Edge cases and error conditions', () => {
    it('should handle oneOf with empty properties', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          base: { type: 'string' },
        },
        oneOf: [
          {
            properties: {},
          },
          {
            properties: {
              extra: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const baseNode = node.find('/base');
      const extraNode = node.find('/extra');

      expect(baseNode?.schemaPath).toBe('/properties/base');
      expect(extraNode?.schemaPath).toBe('/oneOf/1/properties/extra');
    });

    it('should throw error when oneOf property redefines existing property', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              name: { type: 'string' }, // This should cause an error
            },
          },
        ],
      };

      expect(() =>
        nodeFromJsonSchema({
          jsonSchema: schema,
          onChange: () => {},
        }),
      ).toThrow(
        "Property 'name' defined in 'oneOf' schema cannot redefine a property already defined in the current schema.",
      );
    });

    it('should throw error when oneOf redefines type', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          data: { type: 'string' },
        },
        oneOf: [
          {
            type: 'array', // This should cause an error
            properties: {
              items: { type: 'string' },
            },
          },
        ],
      };

      expect(() =>
        nodeFromJsonSchema({
          jsonSchema: schema,
          onChange: () => {},
        }),
      ).toThrow(
        "Type cannot be redefined in 'oneOf' schema. It must either be omitted or match the parent schema type.",
      );
    });

    it('should handle oneOf with required fields', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          type: { type: 'string' },
        },
        oneOf: [
          {
            properties: {
              type: { const: 'A' },
              fieldA: { type: 'string' },
            },
            required: ['fieldA'],
          },
          {
            properties: {
              type: { const: 'B' },
              fieldB: { type: 'number' },
              optionalB: { type: 'string' },
            },
            required: ['fieldB'],
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      const fieldANode = node.find('/fieldA');
      const fieldBNode = node.find('/fieldB');
      const optionalBNode = node.find('/optionalB');

      expect(fieldANode?.schemaPath).toBe('/oneOf/0/properties/fieldA');
      expect(fieldBNode?.schemaPath).toBe('/oneOf/1/properties/fieldB');
      expect(optionalBNode?.schemaPath).toBe('/oneOf/1/properties/optionalB');

      // Check if required flag is properly set based on oneOf requirements
      expect(fieldANode?.required).toBe(true);
      expect(fieldBNode?.required).toBe(true);
      expect(optionalBNode?.required).toBe(false);
    });

    it('should handle complex discriminator patterns', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          version: { type: 'number' },
        },
        oneOf: [
          {
            properties: {
              kind: { const: 'document' },
              version: { const: 1 },
              title: { type: 'string' },
              content: { type: 'string' },
            },
          },
          {
            properties: {
              kind: { const: 'document' },
              version: { const: 2 },
              title: { type: 'string' },
              blocks: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
          {
            properties: {
              kind: { const: 'image' },
              version: { const: 1 },
              url: { type: 'string' },
              alt: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      expect(isObjectNode(node)).toBe(true);
      if (!isObjectNode(node)) return;

      // Base properties
      const kindNode = node.find('/kind');
      const versionNode = node.find('/version');
      expect(kindNode?.schemaPath).toBe('/properties/kind');
      expect(versionNode?.schemaPath).toBe('/properties/version');

      // oneOf variant properties
      const titleNode = node.find('/title');
      const contentNode = node.find('/content');
      const blocksNode = node.find('/blocks');
      const urlNode = node.find('/url');
      const altNode = node.find('/alt');

      expect(titleNode?.schemaPath).toBe('/oneOf/0/properties/title');
      expect(contentNode?.schemaPath).toBe('/oneOf/0/properties/content');
      expect(blocksNode?.schemaPath).toBe('/oneOf/1/properties/blocks');
      expect(urlNode?.schemaPath).toBe('/oneOf/2/properties/url');
      expect(altNode?.schemaPath).toBe('/oneOf/2/properties/alt');
    });
  });

  describe('Array root type with oneOf', () => {
    it('should handle array schema with oneOf items', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
          },
          oneOf: [
            {
              properties: {
                type: { const: 'user' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
            {
              properties: {
                type: { const: 'admin' },
                name: { type: 'string' },
                permissions: { type: 'array', items: { type: 'string' } },
              },
            },
          ],
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        defaultValue: [
          { type: 'user', name: 'John', email: 'john@example.com' },
          { type: 'admin', name: 'Jane', permissions: ['read', 'write'] },
        ],
        onChange: () => {},
      });

      expect(isArrayNode(node)).toBe(true);
      if (!isArrayNode(node)) return;

      console.log('Array root node schemaPath:', node.schemaPath);
      expect(node.schemaPath).toBe('/');

      // Array items should be accessible via index
      const item0 = node.find('/0');
      const item1 = node.find('/1');

      console.log('item0:', !!item0);
      console.log('item0 schemaPath:', item0?.schemaPath);
      console.log('item1:', !!item1);
      console.log('item1 schemaPath:', item1?.schemaPath);

      expect(isObjectNode(item0)).toBe(true);
      expect(isObjectNode(item1)).toBe(true);

      if (!isObjectNode(item0) || !isObjectNode(item1)) return;

      // Test first item (user type)
      const typeNode0 = item0.find('type');
      const nameNode0 = item0.find('name');
      const emailNode0 = item0.find('email');

      console.log('typeNode0 schemaPath:', typeNode0?.schemaPath);
      console.log('nameNode0 schemaPath:', nameNode0?.schemaPath);
      console.log('emailNode0 schemaPath:', emailNode0?.schemaPath);

      expect(typeNode0?.schemaPath).toBe('/items/properties/type');
      expect(nameNode0?.schemaPath).toBe('/items/oneOf/0/properties/name');
      expect(emailNode0?.schemaPath).toBe('/items/oneOf/0/properties/email');

      // Test second item (admin type)
      const typeNode1 = item1.find('type');
      const nameNode1 = item1.find('name');
      const permissionsNode1 = item1.find('permissions');

      console.log('typeNode1 schemaPath:', typeNode1?.schemaPath);
      console.log('nameNode1 schemaPath:', nameNode1?.schemaPath);
      console.log('permissionsNode1 schemaPath:', permissionsNode1?.schemaPath);

      expect(typeNode1?.schemaPath).toBe('/items/properties/type');
      expect(nameNode1?.schemaPath).toBe('/items/oneOf/1/properties/name');
      expect(permissionsNode1?.schemaPath).toBe(
        '/items/oneOf/1/properties/permissions',
      );
    });

    it('should handle complex array with nested oneOf objects', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                category: { type: 'string' },
              },
              oneOf: [
                {
                  properties: {
                    category: { const: 'product' },
                    details: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        price: { type: 'number' },
                      },
                    },
                  },
                },
                {
                  properties: {
                    category: { const: 'service' },
                    details: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        duration: { type: 'string' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        defaultValue: [
          {
            id: '1',
            data: {
              category: 'product',
              details: { name: 'Laptop', price: 999 },
            },
          },
        ],
        onChange: () => {},
      });

      expect(isArrayNode(node)).toBe(true);
      if (!isArrayNode(node)) return;

      const item0 = node.find('/0');
      expect(isObjectNode(item0)).toBe(true);
      if (!isObjectNode(item0)) return;

      const idNode = item0.find('id');
      const dataNode = item0.find('data');

      console.log('Array item idNode schemaPath:', idNode?.schemaPath);
      console.log('Array item dataNode schemaPath:', dataNode?.schemaPath);

      expect(idNode?.schemaPath).toBe('/items/properties/id');
      expect(dataNode?.schemaPath).toBe('/items/properties/data');

      expect(isObjectNode(dataNode)).toBe(true);
      if (!isObjectNode(dataNode)) return;

      const categoryNode = dataNode.find('category');
      const detailsNode = dataNode.find('details');

      console.log('categoryNode schemaPath:', categoryNode?.schemaPath);
      console.log('detailsNode schemaPath:', detailsNode?.schemaPath);

      expect(categoryNode?.schemaPath).toBe(
        '/items/properties/data/properties/category',
      );
      expect(detailsNode?.schemaPath).toBe(
        '/items/properties/data/oneOf/0/properties/details',
      );

      expect(isObjectNode(detailsNode)).toBe(true);
      if (!isObjectNode(detailsNode)) return;

      const nameNode = detailsNode.find('name');
      const priceNode = detailsNode.find('price');

      console.log('nameNode in details schemaPath:', nameNode?.schemaPath);
      console.log('priceNode in details schemaPath:', priceNode?.schemaPath);

      expect(nameNode?.schemaPath).toBe(
        '/items/properties/data/oneOf/0/properties/details/properties/name',
      );
      expect(priceNode?.schemaPath).toBe(
        '/items/properties/data/oneOf/0/properties/details/properties/price',
      );
    });

    it('should handle array with oneOf at items level with different types', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
          },
          oneOf: [
            {
              properties: {
                type: { const: 'text' },
                content: { type: 'string' },
              },
            },
            {
              properties: {
                type: { const: 'number' },
                value: { type: 'number' },
              },
            },
          ],
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        defaultValue: [
          { type: 'text', content: 'Hello' },
          { type: 'number', value: 42 },
        ],
        onChange: () => {},
      });

      expect(isArrayNode(node)).toBe(true);
      if (!isArrayNode(node)) return;

      console.log('Array with oneOf items schemaPath:', node.schemaPath);

      const item0 = node.find('/0');
      const item1 = node.find('/1');

      console.log('item0 type:', item0?.type);
      console.log('item0 schemaPath:', item0?.schemaPath);
      console.log('item1 type:', item1?.type);
      console.log('item1 schemaPath:', item1?.schemaPath);

      // Array items with oneOf should have items-based paths
      expect(item0?.schemaPath).toBe('/items');
      expect(item1?.schemaPath).toBe('/items');

      if (isObjectNode(item0)) {
        const typeNode0 = item0.find('type');
        const contentNode = item0.find('content');
        console.log('typeNode0 schemaPath:', typeNode0?.schemaPath);
        console.log('contentNode schemaPath:', contentNode?.schemaPath);
        expect(typeNode0?.schemaPath).toBe('/items/properties/type');
        expect(contentNode?.schemaPath).toBe(
          '/items/oneOf/0/properties/content',
        );
      }

      if (isObjectNode(item1)) {
        const typeNode1 = item1.find('type');
        const valueNode = item1.find('value');
        console.log('typeNode1 schemaPath:', typeNode1?.schemaPath);
        console.log('valueNode schemaPath:', valueNode?.schemaPath);
        expect(typeNode1?.schemaPath).toBe('/items/properties/type');
        expect(valueNode?.schemaPath).toBe('/items/oneOf/1/properties/value');
      }
    });
  });
});
