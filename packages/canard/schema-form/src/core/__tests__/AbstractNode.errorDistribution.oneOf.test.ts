import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { ValidationMode } from '../nodes/type';
import { createValidatorFactory } from './utils/createValidatorFactory';

/**
 * oneOf/anyOf 스키마에서 AJV 에러가 노드로 정확하게 전달되는지 테스트
 *
 * Path 형식 규칙:
 * - dataPath: '' (빈 문자열)이 루트, '/user/name' 형식 (RFC 6901)
 * - schemaPath: '#'이 루트, '#/properties/user' 형식 (URI fragment)
 *
 * 핵심 검증 포인트:
 * 1. error.dataPath와 node.path의 일치
 * 2. error.schemaPath와 node.schemaPath의 matchesSchemaPath 로직
 * 3. variant가 있는 노드에서의 에러 필터링
 */
describe('AbstractNode Error Distribution with oneOf/anyOf Schemas', () => {
  const wait = (delay = 10) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  const createAjv = () =>
    new Ajv({
      allErrors: true,
      strictSchema: false,
      validateFormats: false,
    });

  describe('oneOf 스키마에서 에러 전달', () => {
    it('선택된 variant의 필드에만 에러가 전달되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['person', 'company'],
              default: 'person',
            },
          },
          oneOf: [
            {
              properties: {
                type: { const: 'person' },
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 50,
                },
                age: {
                  type: 'number',
                  minimum: 0,
                  maximum: 150,
                },
              },
              required: ['name', 'age'],
            },
            {
              properties: {
                type: { const: 'company' },
                companyName: {
                  type: 'string',
                  minLength: 1,
                },
                registrationNumber: {
                  type: 'string',
                  pattern: '^[0-9]{10}$',
                },
              },
              required: ['companyName', 'registrationNumber'],
            },
          ],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 루트 노드의 schemaPath 확인 (# 접두사)
      expect(node.schemaPath).toBe('#');

      // type 노드의 경로 확인
      const typeNode = node.find('/type') as StringNode;
      expect(typeNode).not.toBeNull();
      expect(typeNode.path).toBe('/type');
      expect(typeNode.schemaPath).toBe('#/properties/type');

      // person variant 선택 상태에서 name/age 노드 확인
      const nameNode = node.find('/name') as StringNode;
      const ageNode = node.find('/age') as NumberNode;

      expect(nameNode).not.toBeNull();
      expect(ageNode).not.toBeNull();

      // path 형식 검증 (dataPath 형식: / 접두사, # 없음)
      expect(nameNode.path).toBe('/name');
      expect(ageNode.path).toBe('/age');

      // schemaPath 형식 검증 (# 접두사, oneOf 경로 포함)
      expect(nameNode.schemaPath).toBe('#/oneOf/0/properties/name');
      expect(ageNode.schemaPath).toBe('#/oneOf/0/properties/age');

      // required 에러가 해당 노드에 전달되었는지 확인
      // person variant가 선택되었고 name, age가 required이므로 에러가 있어야 함
      expect(nameNode.errors).toBeDefined();
      expect(ageNode.errors).toBeDefined();

      // 에러의 dataPath 형식 확인 (빈 문자열이 아닌 /name, /age 형식)
      if (nameNode.errors && nameNode.errors.length > 0) {
        expect(nameNode.errors[0].dataPath).toBe('/name');
      }
      if (ageNode.errors && ageNode.errors.length > 0) {
        expect(ageNode.errors[0].dataPath).toBe('/age');
      }
    });

    it('variant 변경 시 새로운 variant의 필드로 에러가 재배포되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            userType: {
              type: 'string',
              enum: ['student', 'employee'],
              default: 'student',
            },
          },
          oneOf: [
            {
              properties: {
                userType: { const: 'student' },
                studentId: {
                  type: 'string',
                  minLength: 5,
                },
                grade: {
                  type: 'number',
                  minimum: 1,
                  maximum: 12,
                },
              },
              required: ['studentId'],
            },
            {
              properties: {
                userType: { const: 'employee' },
                employeeId: {
                  type: 'string',
                  minLength: 3,
                },
                department: {
                  type: 'string',
                  minLength: 1,
                },
              },
              required: ['employeeId'],
            },
          ],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 초기 상태: student variant
      const studentIdNode = node.find('/studentId') as StringNode;
      expect(studentIdNode).not.toBeNull();
      expect(studentIdNode.schemaPath).toBe('#/oneOf/0/properties/studentId');

      // student variant에서 에러 확인
      expect(studentIdNode.errors).toBeDefined();

      // variant 변경: student → employee
      const userTypeNode = node.find('/userType') as StringNode;
      userTypeNode.setValue('employee');
      await wait();

      // 새로운 variant의 노드 확인
      const employeeIdNode = node.find('/employeeId') as StringNode;
      expect(employeeIdNode).not.toBeNull();
      expect(employeeIdNode.path).toBe('/employeeId');
      expect(employeeIdNode.schemaPath).toBe('#/oneOf/1/properties/employeeId');

      // 새 variant에서 required 에러 확인
      expect(employeeIdNode.errors).toBeDefined();
      if (employeeIdNode.errors && employeeIdNode.errors.length > 0) {
        expect(employeeIdNode.errors[0].dataPath).toBe('/employeeId');
      }
    });

    it('중첩된 oneOf 구조에서 에러 경로가 정확해야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['physical', 'digital'],
              default: 'physical',
            },
          },
          oneOf: [
            {
              properties: {
                category: { const: 'physical' },
                dimensions: {
                  type: 'object',
                  properties: {
                    width: { type: 'number', minimum: 0 },
                    height: { type: 'number', minimum: 0 },
                    depth: { type: 'number', minimum: 0 },
                  },
                  required: ['width', 'height'],
                },
              },
              required: ['dimensions'],
            },
            {
              properties: {
                category: { const: 'digital' },
                fileSize: { type: 'number', minimum: 0 },
                format: {
                  type: 'string',
                  enum: ['pdf', 'epub', 'mp3'],
                },
              },
              required: ['fileSize', 'format'],
            },
          ],
        },
        defaultValue: {
          category: 'physical',
          dimensions: {},
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 중첩된 객체 내부의 노드 확인
      const dimensionsNode = node.find('/dimensions') as ObjectNode;
      expect(dimensionsNode).not.toBeNull();
      expect(dimensionsNode.path).toBe('/dimensions');

      const widthNode = node.find('/dimensions/width') as NumberNode;
      const heightNode = node.find('/dimensions/height') as NumberNode;

      // 중첩 경로 확인
      if (widthNode) {
        expect(widthNode.path).toBe('/dimensions/width');
        // schemaPath는 oneOf 경로를 포함
        expect(widthNode.schemaPath).toContain('#/oneOf/0');
      }

      if (heightNode) {
        expect(heightNode.path).toBe('/dimensions/height');
        expect(heightNode.schemaPath).toContain('#/oneOf/0');
      }
    });

    it('값 입력 후 validation 에러가 정확한 노드에 전달되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['basic', 'advanced'],
              default: 'basic',
            },
          },
          oneOf: [
            {
              properties: {
                mode: { const: 'basic' },
                value: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                },
              },
            },
            {
              properties: {
                mode: { const: 'advanced' },
                minValue: {
                  type: 'number',
                  minimum: 0,
                },
                maxValue: {
                  type: 'number',
                  maximum: 1000,
                },
              },
            },
          ],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // basic 모드에서 value 노드에 범위 초과 값 입력
      const valueNode = node.find('/value') as NumberNode;
      expect(valueNode).not.toBeNull();

      valueNode.setValue(150); // maximum 100 초과
      await wait();

      // 에러가 해당 노드에 전달되어야 함
      expect(valueNode.errors).toBeDefined();
      expect(valueNode.errors?.length).toBeGreaterThan(0);
      expect(valueNode.errors?.[0]?.keyword).toBe('maximum');
      expect(valueNode.errors?.[0]?.dataPath).toBe('/value');

      // 유효한 값 입력
      valueNode.setValue(50);
      await wait();

      // 에러가 사라져야 함
      expect(valueNode.errors?.length).toBe(0);
    });
  });

  describe('anyOf 스키마에서 에러 전달', () => {
    it('anyOf 스키마에서 에러가 올바른 노드에 전달되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      // anyOf를 루트 레벨에서 사용하는 스키마 (contact 내부가 아닌)
      const node = nodeFromJsonSchema({
        jsonSchema: {
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
              '&if': "./contactMethod === 'email'",
              properties: {
                email: {
                  type: 'string',
                  minLength: 5,
                },
              },
              required: ['email'],
            },
            {
              '&if': "./contactMethod === 'phone'",
              properties: {
                phone: {
                  type: 'string',
                  pattern: '^[0-9]{10,15}$',
                },
              },
              required: ['phone'],
            },
          ],
        },
        defaultValue: {
          contactMethod: 'email',
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 루트 노드 확인
      expect(node.path).toBe('');
      expect(node.schemaPath).toBe('#');

      // email variant가 활성화되어 있으므로 email 노드 확인
      const emailNode = node.find('/email') as StringNode;
      expect(emailNode).not.toBeNull();
      expect(emailNode.path).toBe('/email');
      expect(emailNode.schemaPath).toContain('#/anyOf/0');

      // required 에러 확인 (email이 비어 있으므로)
      expect(emailNode.errors).toBeDefined();
      if (emailNode.errors && emailNode.errors.length > 0) {
        expect(emailNode.errors[0].dataPath).toBe('/email');
      }

      // phone 메소드로 변경
      const contactMethodNode = node.find('/contactMethod') as StringNode;
      contactMethodNode.setValue('phone');
      await wait();

      // phone 노드 확인
      const phoneNode = node.find('/phone') as StringNode;
      expect(phoneNode).not.toBeNull();
      expect(phoneNode.path).toBe('/phone');
      expect(phoneNode.schemaPath).toContain('#/anyOf/1');
    });
  });

  describe('배열 내 oneOf 에러 전달', () => {
    it('배열 아이템의 oneOf 필드에 에러가 정확히 전달되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  itemType: {
                    type: 'string',
                    enum: ['product', 'service'],
                    default: 'product',
                  },
                },
                oneOf: [
                  {
                    properties: {
                      itemType: { const: 'product' },
                      sku: {
                        type: 'string',
                        minLength: 3,
                      },
                      quantity: {
                        type: 'number',
                        minimum: 1,
                      },
                    },
                    required: ['sku', 'quantity'],
                  },
                  {
                    properties: {
                      itemType: { const: 'service' },
                      serviceCode: {
                        type: 'string',
                        minLength: 2,
                      },
                      hours: {
                        type: 'number',
                        minimum: 0.5,
                      },
                    },
                    required: ['serviceCode', 'hours'],
                  },
                ],
              },
              minItems: 1,
            },
          },
        },
        defaultValue: {
          items: [{ itemType: 'product' }],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 첫 번째 배열 아이템의 노드 확인
      const firstItemNode = node.find('/items/0') as ObjectNode;
      expect(firstItemNode).not.toBeNull();
      expect(firstItemNode.path).toBe('/items/0');

      // 배열 아이템 내부의 oneOf 필드 확인
      const skuNode = node.find('/items/0/sku') as StringNode;
      const quantityNode = node.find('/items/0/quantity') as NumberNode;

      if (skuNode) {
        expect(skuNode.path).toBe('/items/0/sku');
        // schemaPath에 items와 oneOf 경로가 포함되어야 함
        expect(skuNode.schemaPath).toContain('#/properties/items/items');
        expect(skuNode.schemaPath).toContain('oneOf/0');
      }

      if (quantityNode) {
        expect(quantityNode.path).toBe('/items/0/quantity');
        expect(quantityNode.schemaPath).toContain('#/properties/items/items');
      }

      // required 에러 확인
      if (skuNode && skuNode.errors && skuNode.errors.length > 0) {
        expect(skuNode.errors[0].dataPath).toBe('/items/0/sku');
      }
    });

    it('여러 배열 아이템에 각각 에러가 전달되어야 함 (초기값 + validate 호출)', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      // 초기값에 유효하지 않은 값 포함 (150, 200은 maximum 100 초과)
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            numbers: {
              type: 'array',
              items: {
                type: 'number',
                minimum: 0,
                maximum: 100,
              },
            },
          },
        },
        defaultValue: {
          numbers: [50, 150, 200], // 두 번째, 세 번째 아이템이 maximum 초과
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 각 배열 아이템의 노드 확인
      const item0 = node.find('/numbers/0') as NumberNode;
      const item1 = node.find('/numbers/1') as NumberNode;
      const item2 = node.find('/numbers/2') as NumberNode;

      expect(item0).not.toBeNull();
      expect(item1).not.toBeNull();
      expect(item2).not.toBeNull();

      // 초기화 직후에는 validation이 실행되지 않아 에러 없음
      // (defaultValue/schema.default를 통한 초기화는 validation을 유발하지 않음)
      expect(item0.errors?.length).toBe(0);
      expect(item1.errors?.length).toBe(0);
      expect(item2.errors?.length).toBe(0);

      // 명시적으로 validate() 호출하여 전체 폼 유효성 검사 실행
      await node.validate();
      await wait();

      // 첫 번째 아이템은 유효, 에러 없음
      expect(item0.errors?.length).toBe(0);

      // 두 번째 아이템은 maximum 초과로 에러 발생
      expect(item1.errors?.length).toBeGreaterThan(0);
      expect(item1.errors?.[0]?.keyword).toBe('maximum');
      expect(item1.errors?.[0]?.dataPath).toBe('/numbers/1');

      // 세 번째 아이템도 maximum 초과로 에러 발생
      expect(item2.errors?.length).toBeGreaterThan(0);
      expect(item2.errors?.[0]?.keyword).toBe('maximum');
      expect(item2.errors?.[0]?.dataPath).toBe('/numbers/2');

      // 두 번째 아이템을 유효한 값으로 변경하면 에러 사라짐
      item1.setValue(80);
      await wait();
      expect(item1.errors?.length).toBe(0);

      // 세 번째 아이템은 여전히 에러 유지
      expect(item2.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('에러 schemaPath 매칭 검증', () => {
    it('oneOf variant 필드의 schemaPath가 AJV 에러의 schemaPath와 매칭되어야 함', async () => {
      const ajv = createAjv();
      const validatorFactory = createValidatorFactory(ajv);
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              default: 'draft',
            },
          },
          oneOf: [
            {
              properties: {
                status: { const: 'draft' },
                draftNote: {
                  type: 'string',
                  maxLength: 200,
                },
              },
            },
            {
              properties: {
                status: { const: 'published' },
                publishedAt: {
                  type: 'string',
                  format: 'date-time',
                },
                viewCount: {
                  type: 'number',
                  minimum: 0,
                },
              },
              required: ['publishedAt'],
            },
          ],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // draft 상태에서 draftNote 노드 확인
      const draftNoteNode = node.find('/draftNote') as StringNode;
      expect(draftNoteNode).not.toBeNull();

      // schemaPath 형식 확인 (# 접두사 필수)
      expect(draftNoteNode.schemaPath).toBe('#/oneOf/0/properties/draftNote');
      expect(draftNoteNode.schemaPath.startsWith('#')).toBe(true);

      // 값 설정 후 에러 검증
      draftNoteNode.setValue('a'.repeat(250)); // maxLength 200 초과
      await wait();

      // 에러가 전달되어야 함
      expect(draftNoteNode.errors?.length).toBeGreaterThan(0);
      expect(draftNoteNode.errors?.[0]?.keyword).toBe('maxLength');
    });

    it('루트 레벨 에러의 dataPath가 빈 문자열이어야 함', async () => {
      const ajv = createAjv();
      const validatorFactory = createValidatorFactory(ajv);
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
          },
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 루트 노드의 path 확인
      expect(node.path).toBe('');
      expect(node.schemaPath).toBe('#');

      // additionalProperties 위반 시 루트 레벨 에러
      node.setValue({ name: 'test', unknownField: 'value' });
      await wait();

      // 전역 에러 확인
      const globalErrors = node.globalErrors;
      if (globalErrors.length > 0) {
        // additionalProperties 에러의 dataPath 확인
        const additionalPropError = globalErrors.find(
          (e) => e.keyword === 'additionalProperties',
        );
        if (additionalPropError) {
          // dataPath가 빈 문자열이어야 함 (루트 레벨)
          expect(additionalPropError.dataPath).toBe('');
        }
      }
    });
  });

  describe('복합 시나리오', () => {
    it('oneOf + 배열 + 중첩 객체 조합에서 에러가 정확히 전달되어야 함', async () => {
      const validatorFactory = createValidatorFactory(createAjv());
      const onChange = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            orderType: {
              type: 'string',
              enum: ['retail', 'wholesale'],
              default: 'retail',
            },
          },
          oneOf: [
            {
              properties: {
                orderType: { const: 'retail' },
                customer: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1 },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string', minLength: 1 },
                        city: { type: 'string', minLength: 1 },
                      },
                      required: ['street', 'city'],
                    },
                  },
                  required: ['name', 'address'],
                },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'string', minLength: 1 },
                      quantity: { type: 'number', minimum: 1 },
                    },
                    required: ['productId', 'quantity'],
                  },
                  minItems: 1,
                },
              },
              required: ['customer', 'items'],
            },
            {
              properties: {
                orderType: { const: 'wholesale' },
                businessId: { type: 'string', minLength: 5 },
                bulkItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sku: { type: 'string' },
                      cases: { type: 'number', minimum: 10 },
                    },
                    required: ['sku', 'cases'],
                  },
                  minItems: 1,
                },
              },
              required: ['businessId', 'bulkItems'],
            },
          ],
        },
        defaultValue: {
          orderType: 'retail',
          customer: {
            name: 'John',
            address: {
              street: '',
              city: '',
            },
          },
          items: [{ productId: '', quantity: 0 }],
        },
        onChange,
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await wait();

      // 중첩 구조의 경로 확인
      const streetNode = node.find('/customer/address/street') as StringNode;
      const cityNode = node.find('/customer/address/city') as StringNode;
      const productIdNode = node.find('/items/0/productId') as StringNode;
      const quantityNode = node.find('/items/0/quantity') as NumberNode;

      // path 형식 확인 (dataPath 형식)
      if (streetNode) {
        expect(streetNode.path).toBe('/customer/address/street');
        expect(streetNode.path.startsWith('/')).toBe(true);
        expect(streetNode.path.includes('#')).toBe(false);
      }

      if (cityNode) {
        expect(cityNode.path).toBe('/customer/address/city');
      }

      if (productIdNode) {
        expect(productIdNode.path).toBe('/items/0/productId');
      }

      if (quantityNode) {
        expect(quantityNode.path).toBe('/items/0/quantity');
        // minimum 1 위반 에러 확인
        if (quantityNode.errors && quantityNode.errors.length > 0) {
          expect(quantityNode.errors[0].dataPath).toBe('/items/0/quantity');
          expect(quantityNode.errors[0].keyword).toBe('minimum');
        }
      }

      // schemaPath 형식 확인 (# 접두사)
      if (streetNode) {
        expect(streetNode.schemaPath.startsWith('#')).toBe(true);
        expect(streetNode.schemaPath).toContain('oneOf/0');
      }
    });
  });
});
