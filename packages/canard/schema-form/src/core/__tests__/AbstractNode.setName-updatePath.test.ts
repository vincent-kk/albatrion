import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils/promise';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import { NodeEventType, ValidationMode } from '../nodes/type';

describe('AbstractNode - setName and updatePath', () => {
  describe('setName', () => {
    it('should update name when called by parent node', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            originalName: {
              type: 'string',
              default: 'test value',
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const childNode = node.find('/originalName');
      expect(childNode).toBeDefined();
      expect(childNode?.name).toBe('originalName');
      expect(childNode?.escapedName).toBe('originalName');

      // Note: In real usage, parent nodes manage their children's names internally
      // Direct setName calls are typically only done by the parent node itself
      childNode?.setName('newName', node);
      expect(childNode?.name).toBe('newName');
      expect(childNode?.escapedName).toBe('newName');
    });

    it('should escape special characters in name', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            'name/with~special': {
              type: 'string',
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const childNode = node.find('/name~1with~0special');
      expect(childNode).toBeDefined();
      expect(childNode?.name).toBe('name/with~special');
      expect(childNode?.escapedName).toBe('name~1with~0special');

      childNode?.setName('another/~name', node);
      expect(childNode?.name).toBe('another/~name');
      expect(childNode?.escapedName).toBe('another~1~0name');
    });

    it('should not update name when called by non-parent node', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field1: { type: 'string' },
            field2: { type: 'string' },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const field1 = node.find('/field1');
      const field2 = node.find('/field2');

      expect(field1?.name).toBe('field1');
      field2?.setName('wrongName', field2!);
      expect(field1?.name).toBe('field1');
    });

    it('should trigger path update when name changes', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: {
                field: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const nestedField = node.find('/nested/field');
      const nestedNode = node.find('/nested') as ObjectNode;

      expect(nestedField?.path).toBe('/nested/field');

      // setName triggers synchronous path update for children
      nestedNode?.setName('renamed', node);
      expect(nestedNode?.path).toBe('/renamed');

      // Child paths are immediately updated synchronously
      expect(nestedField?.path).toBe('/renamed/field');
    });
  });

  describe('updatePath', () => {
    it('should update path based on parent path and escaped name', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                child: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const parentNode = node.find('/parent') as ObjectNode;
      const childNode = node.find('/parent/child');

      expect(childNode?.path).toBe('/parent/child');

      parentNode?.setName('renamedParent', node);
      expect(parentNode?.path).toBe('/renamedParent');

      // Child paths are immediately updated synchronously
      expect(childNode?.path).toBe('/renamedParent/child');
    });

    it('should update schemaPath correctly', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            container: {
              type: 'object',
              properties: {
                item: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const containerNode = node.find('/container');
      const itemNode = node.find('/container/item');

      // schemaPath follows the same structure as path for regular objects
      expect(containerNode?.schemaPath).toBe('/container');
      expect(itemNode?.schemaPath).toBe('/container/item');

      containerNode?.setName('newContainer', node);
      expect(containerNode?.schemaPath).toBe('/newContainer');

      // Child schemaPath is immediately updated synchronously
      expect(itemNode?.schemaPath).toBe('/newContainer/item');
    });

    it('should handle array node paths correctly', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'string',
              },
              default: ['first', 'second'],
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const arrayNode = node.find('/items') as ArrayNode;
      const firstItem = arrayNode?.find('/items/0');
      const secondItem = arrayNode?.find('/items/1');

      expect(firstItem?.path).toBe('/items/0');
      expect(secondItem?.path).toBe('/items/1');
      // Array items have indexed schemaPath
      expect(firstItem?.schemaPath).toBe('/items/0');
      expect(secondItem?.schemaPath).toBe('/items/1');
    });

    it('should emit UpdatePath event when path changes', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: { type: 'string' },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const fieldNode = node.find('/field');
      const listener = vi.fn();

      fieldNode?.subscribe(listener);

      // Call setName which triggers updatePath
      fieldNode?.setName('renamedField', node);

      // Wait for microtask to complete (events are batched in microtasks)
      await Promise.resolve();

      // Check that UpdatePath event was emitted
      const calls = listener.mock.calls.filter(
        (call) => (call[0].type & NodeEventType.UpdatePath) > 0,
      );

      expect(calls.length).toBeGreaterThan(0);
      if (calls.length > 0) {
        // The payload is indexed by event type (2 for UpdatePath)
        const payload = calls[0][0].payload;
        expect(payload[NodeEventType.UpdatePath]).toBe('/renamedField');
      }
    });

    it('should not emit event when path does not change', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            field: { type: 'string' },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const fieldNode = node.find('/field');
      const listener = vi.fn();

      fieldNode?.subscribe(listener);
      const result = fieldNode?.updatePath();

      expect(result).toBe(false);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle oneOf scope in schemaPath', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          oneOf: [
            {
              properties: {
                stringField: {
                  type: 'string',
                  title: 'String Option',
                },
              },
            },
            {
              properties: {
                numberField: {
                  type: 'number',
                  title: 'Number Option',
                },
              },
            },
          ],
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      // When oneOf is at object level, children have oneOf scope
      const stringField = node.find('/stringField');
      const numberField = node.find('/numberField');

      expect(stringField?.schemaPath).toBe('/oneOf/0/properties/stringField');
      expect(numberField?.schemaPath).toBe('/oneOf/1/properties/numberField');
    });

    it('should propagate path updates to deeply nested children', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'object',
                  properties: {
                    level3: {
                      type: 'object',
                      properties: {
                        deepField: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const level1 = node.find('/level1') as ObjectNode;
      const deepField = node.find('/level1/level2/level3/deepField');

      expect(deepField?.path).toBe('/level1/level2/level3/deepField');
      expect(deepField?.schemaPath).toBe('/level1/level2/level3/deepField');

      level1?.setName('renamedLevel1', node);

      // Deep nested paths are immediately updated synchronously
      expect(deepField?.path).toBe('/renamedLevel1/level2/level3/deepField');
      expect(deepField?.schemaPath).toBe(
        '/renamedLevel1/level2/level3/deepField',
      );
    });

    it('should handle complex nested structures with arrays and objects', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  addresses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                      },
                    },
                  },
                },
              },
              default: [
                {
                  name: 'User 1',
                  addresses: [{ street: 'Street 1', city: 'City 1' }],
                },
              ],
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const usersArray = node.find('/users') as ArrayNode;
      const firstUser = usersArray?.find('/users/0') as ObjectNode;
      const addressesArray = firstUser?.find('/users/0/addresses') as ArrayNode;
      const firstAddress = addressesArray?.find('/users/0/addresses/0');
      const streetField = firstAddress?.find('/users/0/addresses/0/street');

      expect(streetField?.path).toBe('/users/0/addresses/0/street');
      expect(streetField?.schemaPath).toBe('/users/0/addresses/0/street');

      usersArray?.setName('members', node);

      // Complex nested paths are immediately updated synchronously
      expect(streetField?.path).toBe('/members/0/addresses/0/street');
      expect(streetField?.schemaPath).toBe('/members/0/addresses/0/street');
    });
  });

  describe('integration', () => {
    it('should maintain consistency between name, escapedName, path, and schemaPath', () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            'special~key/name': {
              type: 'object',
              properties: {
                subField: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const specialNode = node.find('/special~0key~1name') as ObjectNode;
      const subField = specialNode?.find('/special~0key~1name/subField');

      expect(specialNode?.name).toBe('special~key/name');
      expect(specialNode?.escapedName).toBe('special~0key~1name');
      expect(specialNode?.path).toBe('/special~0key~1name');
      expect(specialNode?.schemaPath).toBe('/special~0key~1name');

      expect(subField?.path).toBe('/special~0key~1name/subField');
      expect(subField?.schemaPath).toBe('/special~0key~1name/subField');

      specialNode?.setName('normal_name', node);

      expect(specialNode?.name).toBe('normal_name');
      expect(specialNode?.escapedName).toBe('normal_name');
      expect(specialNode?.path).toBe('/normal_name');
      expect(specialNode?.schemaPath).toBe('/normal_name');

      // Child paths are immediately updated synchronously
      expect(subField?.path).toBe('/normal_name/subField');
      expect(subField?.schemaPath).toBe('/normal_name/subField');
    });

    it('should handle circular parent-child path updates', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                child: {
                  type: 'object',
                  properties: {
                    grandchild: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        onChange: () => {},
        validationMode: ValidationMode.None,
      }) as ObjectNode;

      const parentNode = node.find('/parent') as ObjectNode;
      const childNode = parentNode?.find('/parent/child') as ObjectNode;
      const grandchildNode = childNode?.find('/parent/child/grandchild');

      // Subscribe to child node's events (grandchild listens to its direct parent)
      const childListener = vi.fn();
      childNode?.subscribe(childListener);

      parentNode?.setName('renamed', node);

      // Paths are immediately updated synchronously
      expect(parentNode?.path).toBe('/renamed');
      expect(childNode?.path).toBe('/renamed/child');
      expect(grandchildNode?.path).toBe('/renamed/child/grandchild');

      // Wait for microtask to check events
      await delay(10);

      // Events are still emitted asynchronously
      const updateCalls = childListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdatePath,
      );

      // Child should have received UpdatePath event
      expect(updateCalls.length).toBeGreaterThan(0);
    });
  });
});
