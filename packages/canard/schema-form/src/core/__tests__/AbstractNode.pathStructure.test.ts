import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import type { JsonSchema } from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import { isArrayNode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * This test file verifies the path and schemaPath structure of nodes
 * in multi-layered hierarchical schemas.
 *
 * - path: The JSONPointer path representing the location in the JSON data
 *         that this schema validates (e.g., '/user/profile/name')
 * - schemaPath: The JSONPointer path representing the location within
 *               the JSON Schema definition (e.g., '#/properties/user/properties/profile/properties/name')
 */

describe('AbstractNode path and schemaPath structure', () => {
  describe('Basic flat structure', () => {
    it('should assign correct path and schemaPath for root node', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      expect(node.path).toBe('');
      expect(node.schemaPath).toBe('#');
      expect(node.isRoot).toBe(true);
    });

    it('should assign correct path and schemaPath for simple properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const nameNode = node.find('/name');
      const ageNode = node.find('/age');
      const activeNode = node.find('/active');

      expect(nameNode?.path).toBe('/name');
      expect(nameNode?.schemaPath).toBe('#/properties/name');

      expect(ageNode?.path).toBe('/age');
      expect(ageNode?.schemaPath).toBe('#/properties/age');

      expect(activeNode?.path).toBe('/active');
      expect(activeNode?.schemaPath).toBe('#/properties/active');
    });
  });

  describe('Two-level nested structure', () => {
    it('should assign correct path and schemaPath for nested object properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const userNode = node.find('/user');
      const nameNode = node.find('/user/name');
      const emailNode = node.find('/user/email');

      // User node (level 1)
      expect(userNode?.path).toBe('/user');
      expect(userNode?.schemaPath).toBe('#/properties/user');

      // Name node (level 2)
      expect(nameNode?.path).toBe('/user/name');
      expect(nameNode?.schemaPath).toBe('#/properties/user/properties/name');

      // Email node (level 2)
      expect(emailNode?.path).toBe('/user/email');
      expect(emailNode?.schemaPath).toBe('#/properties/user/properties/email');
    });
  });

  describe('Three-level nested structure', () => {
    it('should assign correct path and schemaPath for deeply nested object properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            properties: {
              department: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  headCount: { type: 'number' },
                },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const companyNode = node.find('/company');
      const departmentNode = node.find('/company/department');
      const nameNode = node.find('/company/department/name');
      const headCountNode = node.find('/company/department/headCount');

      // Company node (level 1)
      expect(companyNode?.path).toBe('/company');
      expect(companyNode?.schemaPath).toBe('#/properties/company');

      // Department node (level 2)
      expect(departmentNode?.path).toBe('/company/department');
      expect(departmentNode?.schemaPath).toBe(
        '#/properties/company/properties/department',
      );

      // Name node (level 3)
      expect(nameNode?.path).toBe('/company/department/name');
      expect(nameNode?.schemaPath).toBe(
        '#/properties/company/properties/department/properties/name',
      );

      // HeadCount node (level 3)
      expect(headCountNode?.path).toBe('/company/department/headCount');
      expect(headCountNode?.schemaPath).toBe(
        '#/properties/company/properties/department/properties/headCount',
      );
    });
  });

  describe('Four-level nested structure', () => {
    it('should assign correct path and schemaPath for very deeply nested object properties', () => {
      const jsonSchema: JsonSchema = {
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
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const level1Node = node.find('/level1');
      const level2Node = node.find('/level1/level2');
      const level3Node = node.find('/level1/level2/level3');
      const valueNode = node.find('/level1/level2/level3/value');

      // Level 1
      expect(level1Node?.path).toBe('/level1');
      expect(level1Node?.schemaPath).toBe('#/properties/level1');

      // Level 2
      expect(level2Node?.path).toBe('/level1/level2');
      expect(level2Node?.schemaPath).toBe(
        '#/properties/level1/properties/level2',
      );

      // Level 3
      expect(level3Node?.path).toBe('/level1/level2/level3');
      expect(level3Node?.schemaPath).toBe(
        '#/properties/level1/properties/level2/properties/level3',
      );

      // Level 4 (value)
      expect(valueNode?.path).toBe('/level1/level2/level3/value');
      expect(valueNode?.schemaPath).toBe(
        '#/properties/level1/properties/level2/properties/level3/properties/value',
      );
    });
  });

  describe('Array structure', () => {
    it('should assign correct path and schemaPath for array and its items', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: { tags: ['red', 'green', 'blue'] },
        onChange: () => {},
      });

      await delay();

      const tagsNode = node.find('/tags') as ArrayNode;

      // Array node
      expect(tagsNode?.path).toBe('/tags');
      expect(tagsNode?.schemaPath).toBe('#/properties/tags');

      // Array items
      const item0 = node.find('/tags/0');
      const item1 = node.find('/tags/1');
      const item2 = node.find('/tags/2');

      expect(item0?.path).toBe('/tags/0');
      expect(item0?.schemaPath).toBe('#/properties/tags/items');

      expect(item1?.path).toBe('/tags/1');
      expect(item1?.schemaPath).toBe('#/properties/tags/items');

      expect(item2?.path).toBe('/tags/2');
      expect(item2?.schemaPath).toBe('#/properties/tags/items');
    });

    it('should assign correct path and schemaPath for array of objects', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: {
          users: [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
          ],
        },
        onChange: () => {},
      });

      await delay();

      const usersNode = node.find('/users') as ArrayNode;

      // Array node
      expect(usersNode?.path).toBe('/users');
      expect(usersNode?.schemaPath).toBe('#/properties/users');

      // First item
      const item0 = node.find('/users/0') as ObjectNode;
      expect(item0?.path).toBe('/users/0');
      expect(item0?.schemaPath).toBe('#/properties/users/items');

      // First item's properties
      const name0 = node.find('/users/0/name');
      const age0 = node.find('/users/0/age');
      expect(name0?.path).toBe('/users/0/name');
      expect(name0?.schemaPath).toBe(
        '#/properties/users/items/properties/name',
      );
      expect(age0?.path).toBe('/users/0/age');
      expect(age0?.schemaPath).toBe('#/properties/users/items/properties/age');

      // Second item
      const item1 = node.find('/users/1') as ObjectNode;
      expect(item1?.path).toBe('/users/1');
      expect(item1?.schemaPath).toBe('#/properties/users/items');

      // Second item's properties
      const name1 = node.find('/users/1/name');
      const age1 = node.find('/users/1/age');
      expect(name1?.path).toBe('/users/1/name');
      expect(name1?.schemaPath).toBe(
        '#/properties/users/items/properties/name',
      );
      expect(age1?.path).toBe('/users/1/age');
      expect(age1?.schemaPath).toBe('#/properties/users/items/properties/age');
    });
  });

  describe('Nested array structure', () => {
    it('should assign correct path and schemaPath for nested arrays', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          matrix: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: {
          matrix: [
            [1, 2, 3],
            [4, 5, 6],
          ],
        },
        onChange: () => {},
      });

      await delay();

      // Matrix node
      const matrixNode = node.find('/matrix');
      expect(matrixNode?.path).toBe('/matrix');
      expect(matrixNode?.schemaPath).toBe('#/properties/matrix');

      // First row
      const row0 = node.find('/matrix/0');
      expect(row0?.path).toBe('/matrix/0');
      expect(row0?.schemaPath).toBe('#/properties/matrix/items');

      // First row's elements
      const cell00 = node.find('/matrix/0/0');
      const cell01 = node.find('/matrix/0/1');
      expect(cell00?.path).toBe('/matrix/0/0');
      expect(cell00?.schemaPath).toBe('#/properties/matrix/items/items');
      expect(cell01?.path).toBe('/matrix/0/1');
      expect(cell01?.schemaPath).toBe('#/properties/matrix/items/items');

      // Second row
      const row1 = node.find('/matrix/1');
      expect(row1?.path).toBe('/matrix/1');
      expect(row1?.schemaPath).toBe('#/properties/matrix/items');
    });
  });

  describe('Mixed object and array structure', () => {
    it('should assign correct path and schemaPath for complex nested structures', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            properties: {
              departments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    employees: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: {
          company: {
            departments: [
              {
                name: 'Engineering',
                employees: [
                  { id: '1', name: 'Alice' },
                  { id: '2', name: 'Bob' },
                ],
              },
            ],
          },
        },
        onChange: () => {},
      });

      await delay();

      // Root company
      const companyNode = node.find('/company');
      expect(companyNode?.path).toBe('/company');
      expect(companyNode?.schemaPath).toBe('#/properties/company');

      // Departments array
      const departmentsNode = node.find('/company/departments');
      expect(departmentsNode?.path).toBe('/company/departments');
      expect(departmentsNode?.schemaPath).toBe(
        '#/properties/company/properties/departments',
      );

      // First department
      const dept0 = node.find('/company/departments/0');
      expect(dept0?.path).toBe('/company/departments/0');
      expect(dept0?.schemaPath).toBe(
        '#/properties/company/properties/departments/items',
      );

      // Department name
      const deptName = node.find('/company/departments/0/name');
      expect(deptName?.path).toBe('/company/departments/0/name');
      expect(deptName?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/name',
      );

      // Employees array
      const employeesNode = node.find('/company/departments/0/employees');
      expect(employeesNode?.path).toBe('/company/departments/0/employees');
      expect(employeesNode?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/employees',
      );

      // First employee
      const emp0 = node.find('/company/departments/0/employees/0');
      expect(emp0?.path).toBe('/company/departments/0/employees/0');
      expect(emp0?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/employees/items',
      );

      // First employee's properties
      const empId = node.find('/company/departments/0/employees/0/id');
      const empName = node.find('/company/departments/0/employees/0/name');
      expect(empId?.path).toBe('/company/departments/0/employees/0/id');
      expect(empId?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/employees/items/properties/id',
      );
      expect(empName?.path).toBe('/company/departments/0/employees/0/name');
      expect(empName?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/employees/items/properties/name',
      );

      // Second employee
      const emp1 = node.find('/company/departments/0/employees/1');
      expect(emp1?.path).toBe('/company/departments/0/employees/1');
      expect(emp1?.schemaPath).toBe(
        '#/properties/company/properties/departments/items/properties/employees/items',
      );
    });
  });

  describe('oneOf structure with path and schemaPath', () => {
    it('should assign correct path and schemaPath for oneOf properties', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['personal', 'business'],
            default: 'personal',
          },
          name: { type: 'string' },
        },
        oneOf: [
          {
            '&if': "(./type) === 'personal'",
            properties: {
              bio: { type: 'string' },
              age: { type: 'number' },
            },
          },
          {
            '&if': "(./type) === 'business'",
            properties: {
              company: { type: 'string' },
              position: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Base properties
      const typeNode = node.find('/type');
      const nameNode = node.find('/name');

      expect(typeNode?.path).toBe('/type');
      expect(typeNode?.schemaPath).toBe('#/properties/type');

      expect(nameNode?.path).toBe('/name');
      expect(nameNode?.schemaPath).toBe('#/properties/name');

      // oneOf properties (personal branch active by default)
      expect(node.oneOfIndex).toBe(0);

      const bioNode = node.find('/bio');
      const ageNode = node.find('/age');

      expect(bioNode?.path).toBe('/bio');
      expect(bioNode?.schemaPath).toBe('#/oneOf/0/properties/bio');

      expect(ageNode?.path).toBe('/age');
      expect(ageNode?.schemaPath).toBe('#/oneOf/0/properties/age');
    });

    it('should update schemaPath when oneOf branch changes', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['a', 'b'],
            default: 'a',
          },
        },
        oneOf: [
          {
            '&if': "(./category) === 'a'",
            properties: {
              valueA: { type: 'string' },
            },
          },
          {
            '&if': "(./category) === 'b'",
            properties: {
              valueB: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Initial state: branch A
      expect(node.oneOfIndex).toBe(0);
      const valueANode = node.find('/valueA');
      expect(valueANode?.path).toBe('/valueA');
      expect(valueANode?.schemaPath).toBe('#/oneOf/0/properties/valueA');

      // Switch to branch B
      const categoryNode = node.find('/category');
      if (categoryNode && categoryNode.type === 'string') {
        categoryNode.setValue('b');
      }
      await delay();

      // After switch: branch B
      expect(node.oneOfIndex).toBe(1);
      const valueBNode = node.find('/valueB');
      expect(valueBNode?.path).toBe('/valueB');
      expect(valueBNode?.schemaPath).toBe('#/oneOf/1/properties/valueB');
    });
  });

  describe('Nested oneOf structure', () => {
    it('should assign correct path and schemaPath for nested oneOf', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          wrapper: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['simple', 'advanced'],
                default: 'simple',
              },
            },
            oneOf: [
              {
                '&if': "(./mode) === 'simple'",
                properties: {
                  value: { type: 'string' },
                },
              },
              {
                '&if': "(./mode) === 'advanced'",
                properties: {
                  config: {
                    type: 'object',
                    properties: {
                      key: { type: 'string' },
                      data: { type: 'number' },
                    },
                  },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Wrapper node
      const wrapperNode = node.find('/wrapper') as ObjectNode;
      expect(wrapperNode?.path).toBe('/wrapper');
      expect(wrapperNode?.schemaPath).toBe('#/properties/wrapper');

      // Mode node (base property)
      const modeNode = wrapperNode.find('mode');
      expect(modeNode?.path).toBe('/wrapper/mode');
      expect(modeNode?.schemaPath).toBe('#/properties/wrapper/properties/mode');

      // Simple branch active
      expect(wrapperNode.oneOfIndex).toBe(0);
      const valueNode = wrapperNode.find('value');
      expect(valueNode?.path).toBe('/wrapper/value');
      expect(valueNode?.schemaPath).toBe(
        '#/properties/wrapper/oneOf/0/properties/value',
      );

      // Switch to advanced
      if (modeNode?.type === 'string') modeNode?.setValue('advanced');
      await delay();

      expect(wrapperNode.oneOfIndex).toBe(1);
      const configNode = wrapperNode.find('config') as ObjectNode;
      expect(configNode?.path).toBe('/wrapper/config');
      expect(configNode?.schemaPath).toBe(
        '#/properties/wrapper/oneOf/1/properties/config',
      );

      const keyNode = configNode?.find('key');
      const dataNode = configNode?.find('data');
      expect(keyNode?.path).toBe('/wrapper/config/key');
      expect(keyNode?.schemaPath).toBe(
        '#/properties/wrapper/oneOf/1/properties/config/properties/key',
      );
      expect(dataNode?.path).toBe('/wrapper/config/data');
      expect(dataNode?.schemaPath).toBe(
        '#/properties/wrapper/oneOf/1/properties/config/properties/data',
      );
    });
  });

  describe('Array root type', () => {
    it('should assign correct path and schemaPath when root is array', async () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: [
          { id: '1', name: 'First' },
          { id: '2', name: 'Second' },
        ],
        onChange: () => {},
      });

      await delay();

      // Root array
      expect(isArrayNode(node)).toBe(true);
      expect(node.path).toBe('');
      expect(node.schemaPath).toBe('#');

      // First item
      const item0 = node.find('/0');
      expect(item0?.path).toBe('/0');
      expect(item0?.schemaPath).toBe('#/items');

      // First item's properties
      const id0 = node.find('/0/id');
      const name0 = node.find('/0/name');
      expect(id0?.path).toBe('/0/id');
      expect(id0?.schemaPath).toBe('#/items/properties/id');
      expect(name0?.path).toBe('/0/name');
      expect(name0?.schemaPath).toBe('#/items/properties/name');

      // Second item
      const item1 = node.find('/1');
      expect(item1?.path).toBe('/1');
      expect(item1?.schemaPath).toBe('#/items');
    });
  });

  describe('Relative path navigation', () => {
    it('should maintain correct path and schemaPath with relative navigation', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            properties: {
              child: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      // Navigate using relative path
      const parentNode = node.find('/parent') as ObjectNode;
      const childNode = parentNode.find('child') as ObjectNode;
      const valueNode = childNode.find('value');

      expect(valueNode?.path).toBe('/parent/child/value');
      expect(valueNode?.schemaPath).toBe(
        '#/properties/parent/properties/child/properties/value',
      );

      // Navigate back up
      const backToChild = valueNode?.find('..');
      expect(backToChild?.path).toBe('/parent/child');
      expect(backToChild?.schemaPath).toBe(
        '#/properties/parent/properties/child',
      );

      const backToParent = valueNode?.find('../..');
      expect(backToParent?.path).toBe('/parent');
      expect(backToParent?.schemaPath).toBe('#/properties/parent');

      const backToRoot = valueNode?.find('../../..');
      expect(backToRoot?.path).toBe('');
      expect(backToRoot?.schemaPath).toBe('#');
    });
  });

  describe('$ref structure', () => {
    it('should assign correct path and schemaPath for $ref schemas', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          person: {
            $ref: '#/$defs/Person',
          },
        },
        $defs: {
          Person: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const personNode = node.find('/person');
      expect(personNode?.path).toBe('/person');
      expect(personNode?.schemaPath).toBe('#/properties/person');

      const nameNode = node.find('/person/name');
      const ageNode = node.find('/person/age');

      expect(nameNode?.path).toBe('/person/name');
      expect(nameNode?.schemaPath).toBe('#/properties/person/properties/name');

      expect(ageNode?.path).toBe('/person/age');
      expect(ageNode?.schemaPath).toBe('#/properties/person/properties/age');
    });

    it('should handle recursive $ref schemas', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          root: {
            $ref: '#/$defs/TreeNode',
          },
        },
        $defs: {
          TreeNode: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              children: {
                type: 'array',
                items: {
                  $ref: '#/$defs/TreeNode',
                },
              },
            },
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: {
          root: {
            name: 'Root',
            children: [
              {
                name: 'Child1',
                children: [],
              },
            ],
          },
        },
        onChange: () => {},
      });

      await delay();

      // Root tree node
      const rootNode = node.find('/root');
      expect(rootNode?.path).toBe('/root');
      expect(rootNode?.schemaPath).toBe('#/properties/root');

      // Root name
      const rootName = node.find('/root/name');
      expect(rootName?.path).toBe('/root/name');
      expect(rootName?.schemaPath).toBe('#/properties/root/properties/name');

      // Children array
      const childrenNode = node.find('/root/children');
      expect(childrenNode?.path).toBe('/root/children');
      expect(childrenNode?.schemaPath).toBe(
        '#/properties/root/properties/children',
      );

      // First child
      const child0 = node.find('/root/children/0');
      expect(child0?.path).toBe('/root/children/0');
      expect(child0?.schemaPath).toBe(
        '#/properties/root/properties/children/items',
      );

      // First child's name
      const child0Name = node.find('/root/children/0/name');
      expect(child0Name?.path).toBe('/root/children/0/name');
      expect(child0Name?.schemaPath).toBe(
        '#/properties/root/properties/children/items/properties/name',
      );
    });
  });

  describe('Special characters in property names', () => {
    it('should handle property names with special characters correctly', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          'user~name': { type: 'string' },
          'path/to/value': { type: 'number' },
          'mixed~0/1~key': { type: 'boolean' },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      // Tilde (~) is escaped as ~0, slash (/) as ~1 in JSONPointer
      const userNameNode = node.find('/user~0name');
      expect(userNameNode?.path).toBe('/user~0name');
      expect(userNameNode?.schemaPath).toBe('#/properties/user~0name');

      const pathValueNode = node.find('/path~1to~1value');
      expect(pathValueNode?.path).toBe('/path~1to~1value');
      expect(pathValueNode?.schemaPath).toBe('#/properties/path~1to~1value');

      const mixedNode = node.find('/mixed~00~11~0key');
      expect(mixedNode?.path).toBe('/mixed~00~11~0key');
      expect(mixedNode?.schemaPath).toBe('#/properties/mixed~00~11~0key');
    });
  });

  describe('Absolute path navigation', () => {
    it('should navigate using absolute paths from any node', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'object',
            properties: {
              b: {
                type: 'object',
                properties: {
                  c: { type: 'string' },
                },
              },
            },
          },
          x: { type: 'number' },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      });

      const cNode = node.find('/a/b/c');

      // Navigate to sibling using absolute path
      const xFromC = cNode?.find('#/x');
      expect(xFromC?.path).toBe('/x');
      expect(xFromC?.schemaPath).toBe('#/properties/x');

      // Navigate to parent using absolute path
      const bFromC = cNode?.find('#/a/b');
      expect(bFromC?.path).toBe('/a/b');
      expect(bFromC?.schemaPath).toBe('#/properties/a/properties/b');

      // Navigate to root using absolute path
      const rootFromC = cNode?.find('#/');
      expect(rootFromC?.path).toBe('');
      expect(rootFromC?.schemaPath).toBe('#');
    });
  });

  describe('anyOf structure', () => {
    it('should assign correct path and schemaPath for anyOf properties', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          contactMethod: {
            type: 'string',
            enum: ['email', 'phone'],
            default: 'email',
          },
        },
        anyOf: [
          {
            '&if': "(./contactMethod) === 'email'",
            properties: {
              email: { type: 'string' },
            },
          },
          {
            '&if': "(./contactMethod) === 'phone'",
            properties: {
              phone: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Base property
      const contactMethodNode = node.find('/contactMethod');
      expect(contactMethodNode?.path).toBe('/contactMethod');
      expect(contactMethodNode?.schemaPath).toBe('#/properties/contactMethod');

      // anyOf properties (email branch active by default)
      const emailNode = node.find('/email');
      expect(emailNode?.path).toBe('/email');
      expect(emailNode?.schemaPath).toBe('#/anyOf/0/properties/email');

      // Switch to phone branch
      if (contactMethodNode?.type === 'string') {
        contactMethodNode.setValue('phone');
      }
      await delay();

      const phoneNode = node.find('/phone');
      expect(phoneNode?.path).toBe('/phone');
      expect(phoneNode?.schemaPath).toBe('#/anyOf/1/properties/phone');
    });

    it('should assign correct path and schemaPath for anyOf with multiple active branches', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        anyOf: [
          {
            '&if': true,
            properties: {
              name: { type: 'string' },
            },
          },
          {
            '&if': true,
            properties: {
              age: { type: 'number' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Both branches should be active when &if is true
      const nameNode = node.find('/name');
      const ageNode = node.find('/age');

      expect(nameNode?.path).toBe('/name');
      expect(nameNode?.schemaPath).toBe('#/anyOf/0/properties/name');

      expect(ageNode?.path).toBe('/age');
      expect(ageNode?.schemaPath).toBe('#/anyOf/1/properties/age');
    });

    it('should assign correct path and schemaPath for nested anyOf', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          wrapper: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['a', 'b'],
                default: 'a',
              },
            },
            anyOf: [
              {
                '&if': "(./type) === 'a'",
                properties: {
                  valueA: { type: 'string' },
                },
              },
              {
                '&if': "(./type) === 'b'",
                properties: {
                  valueB: { type: 'number' },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      const wrapperNode = node.find('/wrapper') as ObjectNode;
      expect(wrapperNode?.path).toBe('/wrapper');
      expect(wrapperNode?.schemaPath).toBe('#/properties/wrapper');

      const typeNode = wrapperNode.find('type');
      expect(typeNode?.path).toBe('/wrapper/type');
      expect(typeNode?.schemaPath).toBe('#/properties/wrapper/properties/type');

      const valueANode = wrapperNode.find('valueA');
      expect(valueANode?.path).toBe('/wrapper/valueA');
      expect(valueANode?.schemaPath).toBe(
        '#/properties/wrapper/anyOf/0/properties/valueA',
      );

      // Switch to branch B
      if (typeNode?.type === 'string') {
        typeNode.setValue('b');
      }
      await delay();

      const valueBNode = wrapperNode.find('valueB');
      expect(valueBNode?.path).toBe('/wrapper/valueB');
      expect(valueBNode?.schemaPath).toBe(
        '#/properties/wrapper/anyOf/1/properties/valueB',
      );
    });
  });

  describe('allOf structure', () => {
    // Note: allOf schemas are MERGED into a single schema before node creation.
    // Unlike oneOf/anyOf where branch paths are preserved (e.g., #/oneOf/0/properties/x),
    // allOf properties appear directly under the merged schema (e.g., #/properties/x).
    // This is because allOf represents composition (all must be true), not selection.

    it('should assign correct path and schemaPath for allOf merged properties', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        allOf: [
          {
            properties: {
              name: { type: 'string' },
            },
          },
          {
            properties: {
              age: { type: 'number' },
            },
          },
          {
            properties: {
              email: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Root node
      expect(node.path).toBe('');
      expect(node.schemaPath).toBe('#');

      // allOf properties are merged into root schema, so schemaPath points to merged properties
      const nameNode = node.find('/name');
      const ageNode = node.find('/age');
      const emailNode = node.find('/email');

      expect(nameNode?.path).toBe('/name');
      expect(nameNode?.schemaPath).toBe('#/properties/name');

      expect(ageNode?.path).toBe('/age');
      expect(ageNode?.schemaPath).toBe('#/properties/age');

      expect(emailNode?.path).toBe('/email');
      expect(emailNode?.schemaPath).toBe('#/properties/email');
    });

    it('should assign correct path and schemaPath for allOf with base properties', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          timestamp: { type: 'string' },
        },
        allOf: [
          {
            properties: {
              name: { type: 'string' },
            },
          },
          {
            properties: {
              status: { type: 'string' },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Base properties
      const idNode = node.find('/id');
      const timestampNode = node.find('/timestamp');

      expect(idNode?.path).toBe('/id');
      expect(idNode?.schemaPath).toBe('#/properties/id');

      expect(timestampNode?.path).toBe('/timestamp');
      expect(timestampNode?.schemaPath).toBe('#/properties/timestamp');

      // allOf properties are merged with base properties
      const nameNode = node.find('/name');
      const statusNode = node.find('/status');

      expect(nameNode?.path).toBe('/name');
      expect(nameNode?.schemaPath).toBe('#/properties/name');

      expect(statusNode?.path).toBe('/status');
      expect(statusNode?.schemaPath).toBe('#/properties/status');
    });

    it('should assign correct path and schemaPath for nested allOf', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          person: {
            type: 'object',
            allOf: [
              {
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
              {
                properties: {
                  contact: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                      phone: { type: 'string' },
                    },
                  },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Person node
      const personNode = node.find('/person') as ObjectNode;
      expect(personNode?.path).toBe('/person');
      expect(personNode?.schemaPath).toBe('#/properties/person');

      // allOf properties are merged into person schema
      const firstNameNode = personNode.find('firstName');
      const lastNameNode = personNode.find('lastName');

      expect(firstNameNode?.path).toBe('/person/firstName');
      expect(firstNameNode?.schemaPath).toBe(
        '#/properties/person/properties/firstName',
      );

      expect(lastNameNode?.path).toBe('/person/lastName');
      expect(lastNameNode?.schemaPath).toBe(
        '#/properties/person/properties/lastName',
      );

      // allOf[1] nested object is also merged
      const contactNode = personNode.find('contact') as ObjectNode;
      expect(contactNode?.path).toBe('/person/contact');
      expect(contactNode?.schemaPath).toBe(
        '#/properties/person/properties/contact',
      );

      const emailNode = contactNode?.find('email');
      const phoneNode = contactNode?.find('phone');

      expect(emailNode?.path).toBe('/person/contact/email');
      expect(emailNode?.schemaPath).toBe(
        '#/properties/person/properties/contact/properties/email',
      );

      expect(phoneNode?.path).toBe('/person/contact/phone');
      expect(phoneNode?.schemaPath).toBe(
        '#/properties/person/properties/contact/properties/phone',
      );
    });

    it('should assign correct path and schemaPath for allOf with arrays', async () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        allOf: [
          {
            properties: {
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
          {
            properties: {
              scores: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        ],
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        defaultValue: {
          tags: ['a', 'b'],
          scores: [1, 2, 3],
        },
        onChange: () => {},
      }) as ObjectNode;

      await delay();

      // Array nodes - allOf schemas are merged
      const tagsNode = node.find('/tags');
      const scoresNode = node.find('/scores');

      expect(tagsNode?.path).toBe('/tags');
      expect(tagsNode?.schemaPath).toBe('#/properties/tags');

      expect(scoresNode?.path).toBe('/scores');
      expect(scoresNode?.schemaPath).toBe('#/properties/scores');

      // Array items
      const tag0 = node.find('/tags/0');
      const tag1 = node.find('/tags/1');

      expect(tag0?.path).toBe('/tags/0');
      expect(tag0?.schemaPath).toBe('#/properties/tags/items');

      expect(tag1?.path).toBe('/tags/1');
      expect(tag1?.schemaPath).toBe('#/properties/tags/items');

      const score0 = node.find('/scores/0');
      expect(score0?.path).toBe('/scores/0');
      expect(score0?.schemaPath).toBe('#/properties/scores/items');
    });
  });
});
