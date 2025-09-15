import { describe, expect, it } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { NumberNode } from '../nodes/NumberNode';
import { ValidationMode } from '../nodes/type';

describe('AbstractNode depth calculation', () => {
  it('should calculate depth correctly for root node', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'string',
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    });

    expect(node.depth).toBe(0);
  });

  it('should calculate depth correctly for nested object properties', () => {
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
                    type: 'string',
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

    expect(node.depth).toBe(0);

    const level1 = node.find('/level1') as ObjectNode;
    expect(level1.depth).toBe(1);

    const level2 = node.find('/level1/level2') as ObjectNode;
    expect(level2.depth).toBe(2);

    const level3 = node.find('/level1/level2/level3') as StringNode;
    expect(level3.depth).toBe(3);
  });

  it('should calculate depth correctly for array items', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            nested: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ArrayNode;

    expect(node.depth).toBe(0);

    await node.push();
    const firstItem = node.find('/0') as ObjectNode;
    expect(firstItem.depth).toBe(1);

    const nestedArray = node.find('/0/nested') as ArrayNode;
    expect(nestedArray.depth).toBe(2);

    await nestedArray.push();
    const nestedItem = node.find('/0/nested/0') as StringNode;
    expect(nestedItem.depth).toBe(3);
  });

  it('should calculate depth correctly for deeply nested mixed structures', async () => {
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
                      coordinates: {
                        type: 'object',
                        properties: {
                          lat: { type: 'number' },
                          lng: { type: 'number' },
                        },
                      },
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

    expect(node.depth).toBe(0);

    const users = node.find('/users') as ArrayNode;
    expect(users.depth).toBe(1);

    await users.push();
    const user = node.find('/users/0') as ObjectNode;
    expect(user.depth).toBe(2);

    const name = node.find('/users/0/name') as StringNode;
    expect(name.depth).toBe(3);

    const addresses = node.find('/users/0/addresses') as ArrayNode;
    expect(addresses.depth).toBe(3);

    await addresses.push();
    const address = node.find('/users/0/addresses/0') as ObjectNode;
    expect(address.depth).toBe(4);

    const street = node.find('/users/0/addresses/0/street') as StringNode;
    expect(street.depth).toBe(5);

    const coordinates = node.find('/users/0/addresses/0/coordinates') as ObjectNode;
    expect(coordinates.depth).toBe(5);

    const lat = node.find('/users/0/addresses/0/coordinates/lat') as NumberNode;
    expect(lat.depth).toBe(6);

    const lng = node.find('/users/0/addresses/0/coordinates/lng') as NumberNode;
    expect(lng.depth).toBe(6);
  });

  it('should update depth correctly when nodes are moved or renamed', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          parent1: {
            type: 'object',
            properties: {
              child: { type: 'string' },
            },
          },
          parent2: {
            type: 'object',
            properties: {},
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ObjectNode;

    const parent1 = node.find('/parent1') as ObjectNode;
    const child = node.find('/parent1/child') as StringNode;

    expect(parent1.depth).toBe(1);
    expect(child.depth).toBe(2);

    child.setName('renamedChild', parent1);
    expect(child.depth).toBe(2);
    expect(child.path).toBe('/parent1/renamedChild');
  });

  it('should handle depth for nodes with special characters in names', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          'prop/with/slash': {
            type: 'object',
            properties: {
              'prop~with~tilde': {
                type: 'string',
              },
            },
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ObjectNode;

    expect(node.depth).toBe(0);

    const propWithSlash = node.find('/prop~1with~1slash') as ObjectNode;
    expect(propWithSlash.depth).toBe(1);

    const propWithTilde = node.find('/prop~1with~1slash/prop~0with~0tilde') as StringNode;
    expect(propWithTilde.depth).toBe(2);
  });

  it('should calculate depth correctly for terminal object nodes', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          normalObject: {
            type: 'object',
            properties: {
              nested: { type: 'string' },
            },
          },
          terminalObject: {
            type: 'object',
            terminal: true,
            default: { some: 'value' },
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ObjectNode;

    const normalObject = node.find('/normalObject') as ObjectNode;
    const nested = node.find('/normalObject/nested') as StringNode;
    const terminalObject = node.find('/terminalObject') as ObjectNode;

    expect(node.depth).toBe(0);
    expect(normalObject.depth).toBe(1);
    expect(nested.depth).toBe(2);
    expect(terminalObject.depth).toBe(1);
  });

  it('should maintain correct depth after array operations', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: { type: 'string' },
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ArrayNode;

    await node.push();
    await node.push();
    await node.push();

    const item0 = node.find('/0') as ObjectNode;
    const item1 = node.find('/1') as ObjectNode;
    const item2 = node.find('/2') as ObjectNode;

    expect(item0.depth).toBe(1);
    expect(item1.depth).toBe(1);
    expect(item2.depth).toBe(1);

    const value0 = node.find('/0/value') as StringNode;
    const value1 = node.find('/1/value') as StringNode;
    const value2 = node.find('/2/value') as StringNode;

    expect(value0.depth).toBe(2);
    expect(value1.depth).toBe(2);
    expect(value2.depth).toBe(2);

    await node.remove(1);

    const remainingItem1 = node.find('/1') as ObjectNode;
    const remainingValue1 = node.find('/1/value') as StringNode;

    expect(remainingItem1.depth).toBe(1);
    expect(remainingValue1.depth).toBe(2);
  });

  it('should calculate depth correctly for root array node', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.None,
    }) as ArrayNode;

    expect(node.depth).toBe(0);

    await node.push();
    const firstItem = node.find('/0') as StringNode;
    expect(firstItem.depth).toBe(1);
  });

  it('should verify depth matches the number of path segments', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: {
              b: {
                type: 'object',
                properties: {
                  c: {
                    type: 'object',
                    properties: {
                      d: { type: 'string' },
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

    const nodeA = node.find('/a') as ObjectNode;
    const nodeB = node.find('/a/b') as ObjectNode;
    const nodeC = node.find('/a/b/c') as ObjectNode;
    const nodeD = node.find('/a/b/c/d') as StringNode;

    expect(nodeA.path).toBe('/a');
    expect(nodeA.depth).toBe(1);

    expect(nodeB.path).toBe('/a/b');
    expect(nodeB.depth).toBe(2);

    expect(nodeC.path).toBe('/a/b/c');
    expect(nodeC.depth).toBe(3);

    expect(nodeD.path).toBe('/a/b/c/d');
    expect(nodeD.depth).toBe(4);
  });
});