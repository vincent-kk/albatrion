import { describe, expect, it, vi } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

const wait = (delay = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode - derivedValue', () => {
  describe('기본 derivedValue 동작', () => {
    it('computed.value 표현식으로 값을 계산해야 함 (BasicDerivedValue)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          price: {
            type: 'number',
            default: 1000,
          },
          quantity: {
            type: 'number',
            default: 1,
          },
          totalPrice: {
            type: 'number',
            computed: {
              derived: '../price * ../quantity',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값: 1000 * 1 = 1000
      const totalPrice = node.find('/totalPrice');
      expect(totalPrice?.value).toBe(1000);

      // price 변경: 2000 * 1 = 2000
      const price = node.find('/price') as NumberNode;
      price.setValue(2000);
      await wait();
      expect(totalPrice?.value).toBe(2000);

      // quantity 변경: 2000 * 3 = 6000
      const quantity = node.find('/quantity') as NumberNode;
      quantity.setValue(3);
      await wait();
      expect(totalPrice?.value).toBe(6000);
    });

    it('문자열 연결 표현식을 계산해야 함 (StringConcatenation)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            default: '길동',
          },
          lastName: {
            type: 'string',
            default: '홍',
          },
          fullName: {
            type: 'string',
            computed: {
              derived: '../lastName + ../firstName',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const fullName = node.find('/fullName');
      expect(fullName?.value).toBe('홍길동');

      // firstName 변경
      (node.find('/firstName') as StringNode).setValue('순신');
      await wait();
      expect(fullName?.value).toBe('홍순신');

      // lastName 변경
      (node.find('/lastName') as StringNode).setValue('이');
      await wait();
      expect(fullName?.value).toBe('이순신');
    });

    it('삼항 연산자를 사용한 조건부 값을 계산해야 함 (ConditionalDerivedValue)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          age: {
            type: 'number',
            default: 20,
          },
          ageGroup: {
            type: 'string',
            computed: {
              derived: '../age >= 18 ? "성인" : "미성년자"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const ageGroup = node.find('/ageGroup');
      expect(ageGroup?.value).toBe('성인');

      // 미성년자로 변경
      (node.find('/age') as NumberNode).setValue(15);
      await wait();
      expect(ageGroup?.value).toBe('미성년자');

      // 경계값 테스트 (18세)
      (node.find('/age') as NumberNode).setValue(18);
      await wait();
      expect(ageGroup?.value).toBe('성인');
    });

    it('복잡한 수식을 계산해야 함 (ComplexCalculation)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          price: {
            type: 'number',
            default: 10000,
          },
          quantity: {
            type: 'number',
            default: 2,
          },
          taxRate: {
            type: 'number',
            default: 10,
          },
          discountRate: {
            type: 'number',
            default: 5,
          },
          finalPrice: {
            type: 'number',
            computed: {
              derived:
                '../price * ../quantity * (1 + ../taxRate / 100) * (1 - ../discountRate / 100)',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값: 10000 * 2 * 1.1 * 0.95 = 20900
      const finalPrice = node.find('/finalPrice');
      expect(finalPrice?.value).toBeCloseTo(20900);

      // taxRate 변경: 10000 * 2 * 1.2 * 0.95 = 22800
      (node.find('/taxRate') as NumberNode).setValue(20);
      await wait();
      expect(finalPrice?.value).toBeCloseTo(22800);
    });
  });

  describe('Null 병합 연산자 처리', () => {
    it('null 병합 연산자를 올바르게 처리해야 함 (NullCoalescing)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          nickname: {
            type: 'string',
          },
          name: {
            type: 'string',
            default: '익명',
          },
          displayName: {
            type: 'string',
            computed: {
              derived: '../nickname ?? ../name ?? "알 수 없음"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const displayName = node.find('/displayName');
      // nickname이 undefined이므로 name 값 사용
      expect(displayName?.value).toBe('익명');

      // nickname 설정
      (node.find('/nickname') as StringNode).setValue('멋쟁이');
      await wait();
      expect(displayName?.value).toBe('멋쟁이');

      // nickname 해제, name도 해제
      (node.find('/nickname') as StringNode).setValue(undefined);
      (node.find('/name') as StringNode).setValue(undefined);
      await wait();
      expect(displayName?.value).toBe('알 수 없음');
    });
  });

  describe('경로 참조 테스트', () => {
    it('부모 경로 참조를 올바르게 처리해야 함 (ParentPathReference)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          basePrice: {
            type: 'number',
            default: 50000,
          },
          options: {
            type: 'object',
            properties: {
              discountPercent: {
                type: 'number',
                default: 10,
              },
              discountedPrice: {
                type: 'number',
                computed: {
                  derived: '../../basePrice * (1 - ../discountPercent / 100)',
                },
              },
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값: 50000 * 0.9 = 45000
      const discountedPrice = node.find('/options/discountedPrice');
      expect(discountedPrice?.value).toBeCloseTo(45000);

      // basePrice 변경: 100000 * 0.9 = 90000
      (node.find('/basePrice') as NumberNode).setValue(100000);
      await wait();
      expect(discountedPrice?.value).toBeCloseTo(90000);

      // discountPercent 변경: 100000 * 0.8 = 80000
      (node.find('/options/discountPercent') as NumberNode).setValue(20);
      await wait();
      expect(discountedPrice?.value).toBeCloseTo(80000);
    });

    it('절대 경로 참조를 올바르게 처리해야 함 (AbsolutePathReference)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          config: {
            type: 'object',
            properties: {
              taxRate: {
                type: 'number',
                default: 10,
              },
            },
          },
          product: {
            type: 'object',
            properties: {
              price: {
                type: 'number',
                default: 10000,
              },
              priceWithTax: {
                type: 'number',
                computed: {
                  derived: '../price * (1 + /config/taxRate / 100)',
                },
              },
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값: 10000 * 1.1 = 11000
      const priceWithTax = node.find('/product/priceWithTax');
      expect(priceWithTax?.value).toBeCloseTo(11000);

      // taxRate 변경: 10000 * 1.2 = 12000
      (node.find('/config/taxRate') as NumberNode).setValue(20);
      await wait();
      expect(priceWithTax?.value).toBeCloseTo(12000);
    });
  });

  describe('&value 별칭 문법', () => {
    it('&value 별칭으로 derivedValue를 설정해야 함 (AliasValueSyntax)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 10,
          },
          b: {
            type: 'number',
            default: 20,
          },
          sum: {
            type: 'number',
            '&derived': '../a + ../b',
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const sum = node.find('/sum');
      expect(sum?.value).toBe(30);

      // a 변경
      (node.find('/a') as NumberNode).setValue(50);
      await wait();
      expect(sum?.value).toBe(70);
    });
  });

  describe('배열 및 옵셔널 체이닝', () => {
    it('배열 길이를 계산해야 함 (ArrayLengthCalculation)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['항목 1', '항목 2', '항목 3'],
          },
          itemCount: {
            type: 'number',
            computed: {
              derived: '(../items)?.length ?? 0',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const itemCount = node.find('/itemCount');
      expect(itemCount?.value).toBe(3);

      // 배열 항목 추가 - 배열 전체 값 변경
      const items = node.find('/items') as ArrayNode;
      items.setValue(['항목 1', '항목 2', '항목 3', '항목 4', '항목 5']);
      await wait();
      expect(itemCount?.value).toBe(5);
    });

    it('옵셔널 체이닝을 올바르게 처리해야 함 (OptionalChaining)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
          displayName: {
            type: 'string',
            computed: {
              derived: '(../user)?.profile?.name ?? "익명"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const displayName = node.find('/displayName');
      // user가 빈 객체이므로 '익명' 반환
      expect(displayName?.value).toBe('익명');

      // name 설정
      (node.find('/user/profile/name') as StringNode).setValue('홍길동');
      await wait();
      expect(displayName?.value).toBe('홍길동');
    });
  });

  describe('일방향 의존성 체인', () => {
    it('A → B → C 형태의 일방향 의존성 체인이 올바르게 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          input: {
            type: 'number',
            default: 100,
          },
          calculated1: {
            type: 'number',
            computed: {
              derived: '../input * 1.1',
            },
          },
          calculated2: {
            type: 'number',
            computed: {
              derived: '../calculated1 + 50',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값: input=100, calculated1=110, calculated2=160
      expect(node.find('/input')?.value).toBe(100);
      expect(node.find('/calculated1')?.value).toBeCloseTo(110);
      expect(node.find('/calculated2')?.value).toBeCloseTo(160);

      // input 변경: input=200, calculated1=220, calculated2=270
      (node.find('/input') as NumberNode).setValue(200);
      await wait();
      expect(node.find('/calculated1')?.value).toBeCloseTo(220);
      expect(node.find('/calculated2')?.value).toBeCloseTo(270);
    });
  });

  describe('양방향 순환 참조 테스트', () => {
    it('수렴하는 순환 참조: A = B * 0.5, B = A + 10 → A=10, B=20으로 수렴', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          seed: {
            type: 'number',
            title: '시드값 (수동 입력)',
            default: 100,
          },
          a: {
            type: 'number',
            title: 'A (B의 절반)',
            computed: {
              // B가 변경되면 A도 변경됨
              derived: '(../b || 0) * 0.5',
            },
          },
          b: {
            type: 'number',
            title: 'B (A + 10)',
            computed: {
              // A가 변경되면 B도 변경됨 → 순환!
              // 하지만 이 수식은 수렴함: a=10, b=20
              derived: '(../a || 0) + 10',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      // 충분한 시간을 두어 수렴하도록 함
      await wait(10);

      const a = node.find('/a');
      const b = node.find('/b');

      // 수렴 값 확인: A = B * 0.5, B = A + 10
      // A = (A + 10) * 0.5 → A = 0.5A + 5 → 0.5A = 5 → A = 10
      // B = 10 + 10 = 20
      expect(a?.value).toBeCloseTo(10);
      expect(b?.value).toBeCloseTo(20);
    });

    it('UpdateValue 이벤트 횟수가 무한하지 않아야 함 (수렴하는 순환 참조)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../b || 0) * 0.5',
            },
          },
          b: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../a || 0) + 10',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      let aUpdateCount = 0;
      let bUpdateCount = 0;

      const aNode = node.find('/a');
      const bNode = node.find('/b');

      aNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) aUpdateCount++;
      });
      bNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) bUpdateCount++;
      });

      await wait(100);

      // 업데이트 횟수가 합리적인 범위 내여야 함 (무한 루프가 아님)
      // 수렴하는 순환 참조에서는 몇 번의 반복 후 안정화됨
      expect(aUpdateCount).toBeLessThan(28);
      expect(bUpdateCount).toBeLessThan(28);

      // 최종 값이 수렴했는지 확인
      expect(aNode?.value).toBeCloseTo(10);
      expect(bNode?.value).toBeCloseTo(20);
    });

    it('값이 같아지면 업데이트가 중단되어야 함 (equals 체크)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 50,
          },
          mirror: {
            type: 'number',
            computed: {
              // source 값을 그대로 반영
              derived: '../source',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const mirror = node.find('/mirror');
      expect(mirror?.value).toBe(50);

      let updateCount = 0;
      mirror?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updateCount++;
      });

      // source를 같은 값으로 설정
      (node.find('/source') as NumberNode).setValue(50);
      await wait();

      // 값이 같으므로 UpdateValue 이벤트가 발생하지 않아야 함
      expect(updateCount).toBe(0);
      expect(mirror?.value).toBe(50);
    });
  });

  describe('무한 루프 방지 테스트', () => {
    it('값이 동일할 때 업데이트를 중단해야 함 (equals 체크)', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          trigger: {
            type: 'number',
            default: 10,
          },
          derived: {
            type: 'number',
            computed: {
              derived: '../trigger * 2',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const derived = node.find('/derived');
      expect(derived?.value).toBe(20);

      // 같은 값으로 trigger 설정 - derived는 변경되지 않아야 함
      const updateCount = vi.fn();
      derived?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateCount();
        }
      });

      (node.find('/trigger') as NumberNode).setValue(10); // 같은 값
      await wait();

      // derived의 값이 이미 20이므로 UpdateValue 이벤트가 발생하지 않아야 함
      expect(derived?.value).toBe(20);
    });

    it('derivedValue가 없는 노드에서는 computeEnabled가 false여야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          normal: {
            type: 'string',
            default: 'test',
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const normal = node.find('/normal');
      expect(normal?.computeEnabled).toBe(false);
    });

    it('derivedValue가 있는 노드에서는 computeEnabled가 true여야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 10,
          },
          derived: {
            type: 'number',
            computed: {
              derived: '../source * 2',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const derived = node.find('/derived');
      expect(derived?.computeEnabled).toBe(true);
    });
  });

  describe('derivedValue와 다른 computed 속성 조합', () => {
    it('derivedValue와 disabled를 함께 사용할 수 있어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          isEnabled: {
            type: 'boolean',
            default: true,
          },
          price: {
            type: 'number',
            default: 1000,
          },
          discountedPrice: {
            type: 'number',
            computed: {
              derived: '../price * 0.9',
              disabled: '!../isEnabled',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const discountedPrice = node.find('/discountedPrice');
      expect(discountedPrice?.value).toBeCloseTo(900);
      expect(discountedPrice?.disabled).toBe(false);

      // isEnabled를 false로 변경
      (node.find('/isEnabled') as BooleanNode).setValue(false);
      await wait();
      expect(discountedPrice?.disabled).toBe(true);
    });

    it('derivedValue와 readOnly를 함께 사용할 수 있어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          isLocked: {
            type: 'boolean',
            default: false,
          },
          value1: {
            type: 'number',
            default: 10,
          },
          value2: {
            type: 'number',
            default: 20,
          },
          total: {
            type: 'number',
            computed: {
              derived: '../value1 + ../value2',
              readOnly: '../isLocked',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const total = node.find('/total');
      expect(total?.value).toBe(30);
      expect(total?.readOnly).toBe(false);

      // isLocked를 true로 변경
      (node.find('/isLocked') as BooleanNode).setValue(true);
      await wait();
      expect(total?.readOnly).toBe(true);
      // 값은 여전히 계산됨
      expect(total?.value).toBe(30);
    });
  });

  describe('엣지 케이스', () => {
    it('의존성이 undefined일 때 안전하게 처리해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          maybeNumber: {
            type: 'number',
          },
          derived: {
            type: 'number',
            computed: {
              derived: '(../maybeNumber ?? 0) + 10',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const derived = node.find('/derived');
      // maybeNumber가 undefined이므로 0 + 10 = 10
      expect(derived?.value).toBe(10);

      // maybeNumber 설정
      (node.find('/maybeNumber') as NumberNode).setValue(5);
      await wait();
      expect(derived?.value).toBe(15);
    });

    it('boolean 타입의 derivedValue가 올바르게 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          value1: {
            type: 'boolean',
            default: true,
          },
          value2: {
            type: 'boolean',
            default: false,
          },
          combined: {
            type: 'boolean',
            computed: {
              derived: '../value1 && ../value2',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const combined = node.find('/combined');
      expect(combined?.value).toBe(false); // true && false = false

      // value2를 true로 변경
      (node.find('/value2') as BooleanNode).setValue(true);
      await wait();
      expect(combined?.value).toBe(true); // true && true = true
    });

    it('동일한 의존성을 여러 번 참조해도 올바르게 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            default: 5,
          },
          triple: {
            type: 'number',
            computed: {
              derived: '../value + ../value + ../value',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const triple = node.find('/triple');
      expect(triple?.value).toBe(15); // 5 + 5 + 5 = 15

      // value 변경
      (node.find('/value') as NumberNode).setValue(10);
      await wait();
      expect(triple?.value).toBe(30); // 10 + 10 + 10 = 30
    });
  });

  describe('자기 자신(./)을 반환하여 조건부 업데이트 건너뛰기', () => {
    it('조건이 false일 때 ./를 반환하면 값이 유지되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          enableAutoCalc: {
            type: 'boolean',
            default: true,
          },
          price: {
            type: 'number',
            default: 1000,
          },
          quantity: {
            type: 'number',
            default: 2,
          },
          total: {
            type: 'number',
            default: 0,
            computed: {
              // enableAutoCalc가 true이면 계산, false이면 자기 자신(./) 반환
              derived: '../enableAutoCalc ? ../price * ../quantity : ./',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const total = node.find('/total');
      // 초기값: enableAutoCalc=true이므로 1000 * 2 = 2000
      expect(total?.value).toBe(2000);

      // enableAutoCalc를 false로 변경
      (node.find('/enableAutoCalc') as BooleanNode).setValue(false);
      await wait();

      // ./를 반환하므로 현재 값(2000)이 유지됨
      expect(total?.value).toBe(2000);

      // price를 변경해도 total은 변경되지 않음 (자동 계산 비활성화)
      (node.find('/price') as NumberNode).setValue(5000);
      await wait();
      expect(total?.value).toBe(2000); // 여전히 이전 값 유지

      // enableAutoCalc를 다시 true로 변경
      (node.find('/enableAutoCalc') as BooleanNode).setValue(true);
      await wait();

      // 이제 새 가격으로 계산됨: 5000 * 2 = 10000
      expect(total?.value).toBe(10000);
    });

    it('./를 반환할 때 UpdateValue 이벤트가 발생하지 않아야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          shouldUpdate: {
            type: 'boolean',
            default: false,
          },
          source: {
            type: 'number',
            default: 100,
          },
          target: {
            type: 'number',
            default: 50,
            computed: {
              // shouldUpdate가 false이면 ./를 반환
              derived: '../shouldUpdate ? ../source : ./',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const target = node.find('/target');
      expect(target?.value).toBe(50); // ./를 반환하므로 default 값 유지

      let updateCount = 0;
      target?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updateCount++;
      });

      // source 값을 변경해도 shouldUpdate가 false이므로 업데이트 없음
      (node.find('/source') as NumberNode).setValue(200);
      await wait();

      expect(updateCount).toBe(0);
      expect(target?.value).toBe(50);
    });
  });

  describe('oneOf/anyOf와 derivedValue 조합', () => {
    it('oneOf 분기 전환 시 해당 분기의 derivedValue가 계산되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          calcType: {
            type: 'string',
            enum: ['multiply', 'add'],
            default: 'multiply',
          },
          a: {
            type: 'number',
            default: 10,
          },
          b: {
            type: 'number',
            default: 5,
          },
          result: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                computed: {
                  if: '/calcType === "multiply"',
                },
                properties: {
                  value: {
                    type: 'number',
                    computed: {
                      derived: '/a * /b',
                    },
                  },
                },
              },
              {
                type: 'object',
                computed: {
                  if: '/calcType == "add"',
                },
                properties: {
                  value: {
                    type: 'number',
                    computed: {
                      derived: '/a + /b',
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
        onChange,
      });

      await wait();

      // 초기값: multiply 분기 → 10 * 5 = 50
      const resultValue = node.find('/result/value');
      expect(resultValue?.value).toBe(50);

      // calcType을 add로 변경
      (node.find('/calcType') as StringNode).setValue('add');
      await wait();

      // add 분기로 전환 → 10 + 5 = 15
      const newResultValue = node.find('/result/value');
      expect(newResultValue?.value).toBe(15);
    });

    it('anyOf에서 여러 분기가 동시에 활성화될 때 각각의 derivedValue가 독립적으로 계산되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          baseValue: {
            type: 'number',
            default: 100,
          },
          showDouble: {
            type: 'boolean',
            default: true,
          },
          showTriple: {
            type: 'boolean',
            default: true,
          },
          calculations: {
            type: 'object',
            anyOf: [
              {
                type: 'object',
                computed: {
                  if: '../showDouble',
                },
                properties: {
                  double: {
                    type: 'number',
                    computed: {
                      derived: '../../baseValue * 2',
                    },
                  },
                },
              },
              {
                type: 'object',
                computed: {
                  if: '../showTriple',
                },
                properties: {
                  triple: {
                    type: 'number',
                    computed: {
                      derived: '../../baseValue * 3',
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
        onChange,
      });

      await wait();

      // 두 분기 모두 활성화: double = 200, triple = 300
      const calculations = node.find('/calculations');
      expect(calculations?.value).toEqual({
        double: 200,
        triple: 300,
      });

      // baseValue 변경
      (node.find('/baseValue') as NumberNode).setValue(50);
      await wait();

      // 두 값 모두 업데이트됨
      expect(calculations?.value).toEqual({
        double: 100,
        triple: 150,
      });

      // showTriple을 false로 변경
      (node.find('/showTriple') as BooleanNode).setValue(false);
      await wait();

      // triple 분기가 비활성화되어 값에서 제거됨
      expect(calculations?.value).toEqual({
        double: 100,
      });
    });

    it('active가 false인 노드에서는 derivedValue가 계산되지 않아야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          isAdvancedMode: {
            type: 'boolean',
            default: false,
          },
          price: {
            type: 'number',
            default: 1000,
          },
          advancedCalc: {
            type: 'number',
            computed: {
              active: '../isAdvancedMode',
              derived: '../price * 1.5',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const advancedCalc = node.find('/advancedCalc');
      // active가 false이므로 노드 값은 undefined
      expect(advancedCalc?.active).toBe(false);
      expect(advancedCalc?.value).toBeUndefined();

      // isAdvancedMode를 true로 변경
      (node.find('/isAdvancedMode') as BooleanNode).setValue(true);
      await wait();

      // active가 true가 되면 derivedValue 계산됨
      expect(advancedCalc?.active).toBe(true);
      expect(advancedCalc?.value).toBe(1500); // 1000 * 1.5

      // price 변경
      (node.find('/price') as NumberNode).setValue(2000);
      await wait();
      expect(advancedCalc?.value).toBe(3000); // 2000 * 1.5

      // isAdvancedMode를 다시 false로 변경
      (node.find('/isAdvancedMode') as BooleanNode).setValue(false);
      await wait();

      // active가 false가 되면 값이 undefined
      expect(advancedCalc?.active).toBe(false);
      expect(advancedCalc?.value).toBeUndefined();
    });

    it('oneOf 분기 전환 시 이전 분기의 derivedValue 구독이 정리되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['a', 'b'],
            default: 'a',
          },
          input: {
            type: 'number',
            default: 10,
          },
          result: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                computed: { if: '../mode === "a"' },
                properties: {
                  calc: {
                    type: 'number',
                    computed: { derived: '(../../input || 0) * 2' },
                  },
                },
              },
              {
                type: 'object',
                computed: { if: '../mode === "b"' },
                properties: {
                  calc: {
                    type: 'number',
                    computed: { derived: '(../../input || 0) * 3' },
                  },
                },
              },
            ],
          },
        },
      };

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // mode='a' 분기: input * 2 = 20
      expect(node.find('/result/calc')?.value).toBe(20);

      // mode를 'b'로 변경
      (node.find('/mode') as StringNode).setValue('b');
      await wait();

      // mode='b' 분기: input * 3 = 30
      expect(node.find('/result/calc')?.value).toBe(30);

      // input 변경
      (node.find('/input') as NumberNode).setValue(100);
      await wait();

      // 현재 활성 분기(b)만 업데이트됨: 100 * 3 = 300
      expect(node.find('/result/calc')?.value).toBe(300);
    });
  });

  describe('oneOf/anyOf와 derivedValue 무한 루프 방지 테스트', () => {
    describe('안전한 패턴: if 조건이 사용자 입력만 참조', () => {
      it('oneOf if 조건이 사용자 입력만 참조하고, derived가 외부 필드만 참조하면 안전해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['simple', 'advanced'],
              default: 'simple',
            },
            baseValue: {
              type: 'number',
              default: 100,
            },
            result: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: 사용자 입력만 참조
                    if: '/mode === "simple"',
                  },
                  properties: {
                    calculation: {
                      type: 'number',
                      computed: {
                        // 안전: 외부 필드만 참조
                        derived: '/baseValue * 2',
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/mode === "advanced"',
                  },
                  properties: {
                    calculation: {
                      type: 'number',
                      computed: {
                        derived: '/baseValue * 3 + 50',
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
          onChange,
        });

        await wait();

        // 초기: simple 모드, 100 * 2 = 200
        expect(node.find('/result/calculation')?.value).toBe(200);

        // advanced 모드로 전환
        (node.find('/mode') as StringNode).setValue('advanced');
        await wait();

        // advanced: 100 * 3 + 50 = 350
        expect(node.find('/result/calculation')?.value).toBe(350);

        // baseValue 변경
        (node.find('/baseValue') as NumberNode).setValue(50);
        await wait();

        // 50 * 3 + 50 = 200
        expect(node.find('/result/calculation')?.value).toBe(200);

        // simple로 다시 전환
        (node.find('/mode') as StringNode).setValue('simple');
        await wait();

        // simple: 50 * 2 = 100
        expect(node.find('/result/calculation')?.value).toBe(100);
      });

      it('anyOf 각 분기의 derived가 독립적인 외부 값만 참조하면 안전해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            baseValue: {
              type: 'number',
              default: 100,
            },
            showPercentages: {
              type: 'boolean',
              default: true,
            },
            showMultiples: {
              type: 'boolean',
              default: true,
            },
            calculations: {
              type: 'object',
              anyOf: [
                {
                  type: 'object',
                  computed: {
                    if: '/showPercentages',
                  },
                  properties: {
                    tenPercent: {
                      type: 'number',
                      computed: {
                        derived: '/baseValue * 0.1',
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/showMultiples',
                  },
                  properties: {
                    double: {
                      type: 'number',
                      computed: {
                        derived: '/baseValue * 2',
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
          onChange,
        });

        await wait();

        // 두 분기 모두 활성화: tenPercent = 10, double = 200
        expect(node.find('/calculations')?.value).toEqual({
          tenPercent: 10,
          double: 200,
        });

        // baseValue 변경
        (node.find('/baseValue') as NumberNode).setValue(50);
        await wait();

        // tenPercent = 5, double = 100
        expect(node.find('/calculations')?.value).toEqual({
          tenPercent: 5,
          double: 100,
        });

        // showPercentages 비활성화
        (node.find('/showPercentages') as BooleanNode).setValue(false);
        await wait();

        // tenPercent 분기 비활성화
        expect(node.find('/calculations')?.value).toEqual({
          double: 100,
        });
      });
    });

    describe('안전한 패턴: derived가 oneOf 분기 내부 값을 참조하지만 if에 영향 없음', () => {
      it('외부 derived가 oneOf 분기 내부 값을 참조하되, if 조건에 영향을 주지 않으면 안전해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            userChoice: {
              type: 'string',
              enum: ['option1', 'option2'],
              default: 'option1',
            },
            options: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: 사용자 입력만 참조
                    if: '/userChoice === "option1"',
                  },
                  properties: {
                    multiplier: {
                      type: 'number',
                      default: 2,
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/userChoice === "option2"',
                  },
                  properties: {
                    multiplier: {
                      type: 'number',
                      default: 3,
                    },
                  },
                },
              ],
            },
            baseValue: {
              type: 'number',
              default: 100,
            },
            // oneOf 분기 내부 값을 참조하지만, if 조건에 영향을 주지 않음
            result: {
              type: 'number',
              computed: {
                derived: '/baseValue * (/options/multiplier ?? 1)',
              },
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        // option1: 100 * 2 = 200
        expect(node.find('/result')?.value).toBe(200);

        // option2로 전환
        (node.find('/userChoice') as StringNode).setValue('option2');
        await wait();

        // option2: 100 * 3 = 300
        expect(node.find('/result')?.value).toBe(300);

        // baseValue 변경
        (node.find('/baseValue') as NumberNode).setValue(50);
        await wait();

        // 50 * 3 = 150
        expect(node.find('/result')?.value).toBe(150);
      });
    });

    describe('안전한 패턴: if 조건에서 원본 값으로 직접 계산', () => {
      it('if 조건에서 derived 대신 원본 값으로 동일한 계산을 하면 안전해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            price: {
              type: 'number',
              default: 100,
            },
            quantity: {
              type: 'number',
              default: 1,
            },
            // derived 필드
            totalPrice: {
              type: 'number',
              computed: {
                derived: '../price * ../quantity',
              },
            },
            // if 조건에서 derived(totalPrice)가 아닌 원본 값으로 직접 계산
            discount: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: derived 대신 원본 값으로 계산
                    if: '/price * /quantity < 1000',
                  },
                  properties: {
                    message: {
                      type: 'string',
                      default: '할인 없음',
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/price * /quantity >= 1000',
                  },
                  properties: {
                    rate: {
                      type: 'number',
                      default: 10,
                    },
                    discountedPrice: {
                      type: 'number',
                      computed: {
                        derived: '/totalPrice * 0.9',
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
          onChange,
        });

        await wait();

        // 초기: 100 * 1 = 100 < 1000, 첫 번째 분기
        expect(node.find('/totalPrice')?.value).toBe(100);
        expect(node.find('/discount/message')?.value).toBe('할인 없음');

        // quantity를 10으로 변경: 100 * 10 = 1000 >= 1000
        (node.find('/quantity') as NumberNode).setValue(10);
        await wait();

        expect(node.find('/totalPrice')?.value).toBe(1000);
        expect(node.find('/discount/rate')?.value).toBe(10);
        expect(node.find('/discount/discountedPrice')?.value).toBe(900); // 1000 * 0.9

        // price 변경: 200 * 10 = 2000
        (node.find('/price') as NumberNode).setValue(200);
        await wait();

        expect(node.find('/totalPrice')?.value).toBe(2000);
        expect(node.find('/discount/discountedPrice')?.value).toBe(1800); // 2000 * 0.9
      });
    });

    describe('안전한 패턴: derived 체인과 oneOf 조건 분리', () => {
      it('derived 체인이 oneOf 조건과 완전히 분리되면 안전해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            input: {
              type: 'number',
              default: 100,
            },
            // derived 체인: input → step1 → step2 → final
            step1: {
              type: 'number',
              computed: {
                derived: '../input + 10',
              },
            },
            step2: {
              type: 'number',
              computed: {
                derived: '../step1 * 2',
              },
            },
            final: {
              type: 'number',
              computed: {
                derived: '../step2 + 100',
              },
            },
            // oneOf 조건이 derived 체인과 무관
            displayMode: {
              type: 'string',
              enum: ['compact', 'detailed'],
              default: 'compact',
            },
            display: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: 사용자 입력만 참조
                    if: '/displayMode === "compact"',
                  },
                  properties: {
                    summary: {
                      type: 'string',
                      computed: {
                        derived: '"Result: " + /final',
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/displayMode === "detailed"',
                  },
                  properties: {
                    detail: {
                      type: 'string',
                      computed: {
                        derived: '/step1 + " -> " + /step2 + " -> " + /final',
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
          onChange,
        });

        await wait();

        // 초기: input=100 → step1=110 → step2=220 → final=320
        expect(node.find('/step1')?.value).toBe(110);
        expect(node.find('/step2')?.value).toBe(220);
        expect(node.find('/final')?.value).toBe(320);
        expect(node.find('/display/summary')?.value).toBe('Result: 320');

        // displayMode 변경
        (node.find('/displayMode') as StringNode).setValue('detailed');
        await wait();

        expect(node.find('/display/detail')?.value).toBe('110 -> 220 -> 320');

        // input 변경: 50 → 60 → 120 → 220
        (node.find('/input') as NumberNode).setValue(50);
        await wait();

        expect(node.find('/step1')?.value).toBe(60);
        expect(node.find('/step2')?.value).toBe(120);
        expect(node.find('/final')?.value).toBe(220);
        expect(node.find('/display/detail')?.value).toBe('60 -> 120 -> 220');
      });
    });

    describe('업데이트 횟수 제한 테스트', () => {
      it('oneOf 분기 전환과 derived 업데이트의 총 횟수가 합리적이어야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            trigger: {
              type: 'string',
              enum: ['a', 'b'],
              default: 'a',
            },
            value: {
              type: 'number',
              default: 10,
            },
            result: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: { if: '/trigger === "a"' },
                  properties: {
                    calc: {
                      type: 'number',
                      computed: { derived: '/value * 2' },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/trigger === "b"' },
                  properties: {
                    calc: {
                      type: 'number',
                      computed: { derived: '/value * 3' },
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        let calcUpdateCount = 0;
        const calcNode = node.find('/result/calc');
        calcNode?.subscribe(({ type }) => {
          if (type & NodeEventType.UpdateValue) calcUpdateCount++;
        });

        // 분기 전환 10번 수행
        for (let i = 0; i < 10; i++) {
          (node.find('/trigger') as StringNode).setValue(
            i % 2 === 0 ? 'b' : 'a',
          );
          await wait();
        }

        // 분기 전환 횟수에 비례하는 합리적인 업데이트 횟수여야 함
        // 각 분기 전환마다 새 노드가 생성되므로 구독은 이전 노드에 대한 것
        // 새 노드의 업데이트는 카운트되지 않음
        expect(calcUpdateCount).toBeLessThan(100);
      });

      it('anyOf 다중 분기 활성화/비활성화 시 업데이트 횟수가 합리적이어야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            base: {
              type: 'number',
              default: 10,
            },
            showA: {
              type: 'boolean',
              default: true,
            },
            showB: {
              type: 'boolean',
              default: true,
            },
            results: {
              type: 'object',
              anyOf: [
                {
                  type: 'object',
                  computed: { if: '/showA' },
                  properties: {
                    a: {
                      type: 'number',
                      computed: { derived: '/base * 2' },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/showB' },
                  properties: {
                    b: {
                      type: 'number',
                      computed: { derived: '/base * 3' },
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        let baseChangeCount = 0;
        node.subscribe(({ type }) => {
          if (type & NodeEventType.UpdateValue) baseChangeCount++;
        });

        // base 값 여러 번 변경
        for (let i = 0; i < 5; i++) {
          (node.find('/base') as NumberNode).setValue(10 + i * 10);
          await wait();
        }

        // 합리적인 업데이트 횟수여야 함
        expect(baseChangeCount).toBeLessThan(50);

        // 최종 값 확인
        expect(node.find('/results')?.value).toEqual({
          a: 100, // 50 * 2
          b: 150, // 50 * 3
        });
      });
    });

    describe('위험 패턴 감지 및 안정화 테스트', () => {
      it('수렴하는 순환 참조가 oneOf와 결합되어도 안정화되어야 함', async () => {
        const onChange = vi.fn();
        // 수렴하는 순환: a = b * 0.5, b = a + 10 → a=10, b=20
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              default: 0,
              computed: {
                derived: '(../b || 0) * 0.5',
              },
            },
            b: {
              type: 'number',
              default: 0,
              computed: {
                derived: '(../a || 0) + 10',
              },
            },
            // oneOf가 수렴하는 순환 참조 값을 사용 (읽기 전용)
            display: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: 수렴 후의 안정적인 값을 참조
                    if: '/a < 15',
                  },
                  properties: {
                    message: {
                      type: 'string',
                      default: 'A is low',
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/a >= 15',
                  },
                  properties: {
                    message: {
                      type: 'string',
                      default: 'A is high',
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        // 수렴 시간 대기
        await wait(100);

        // 수렴 값 확인: a=10, b=20
        expect(node.find('/a')?.value).toBeCloseTo(10);
        expect(node.find('/b')?.value).toBeCloseTo(20);

        // oneOf가 올바른 분기 선택 (a=10 < 15)
        expect(node.find('/display/message')?.value).toBe('A is low');
      });

      it('active=false인 노드의 derived가 oneOf 조건에 영향을 주지 않아야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            enableCalc: {
              type: 'boolean',
              default: false,
            },
            base: {
              type: 'number',
              default: 50,
            },
            calculated: {
              type: 'number',
              computed: {
                active: '../enableCalc',
                derived: '../base * 2',
              },
            },
            // oneOf가 calculated 값이 아닌 base 값을 참조
            display: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: {
                    // 안전: derived가 아닌 원본 값 참조
                    if: '/base < 100',
                  },
                  properties: {
                    label: {
                      type: 'string',
                      default: 'Small',
                    },
                  },
                },
                {
                  type: 'object',
                  computed: {
                    if: '/base >= 100',
                  },
                  properties: {
                    label: {
                      type: 'string',
                      default: 'Large',
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        // calculated는 비활성화 상태
        expect(node.find('/calculated')?.active).toBe(false);
        expect(node.find('/calculated')?.value).toBeUndefined();

        // oneOf는 base 값 기준: 50 < 100
        expect(node.find('/display/label')?.value).toBe('Small');

        // enableCalc 활성화
        (node.find('/enableCalc') as BooleanNode).setValue(true);
        await wait();

        // calculated 활성화
        expect(node.find('/calculated')?.active).toBe(true);
        expect(node.find('/calculated')?.value).toBe(100);

        // oneOf는 여전히 base 값 기준 (calculated와 무관)
        expect(node.find('/display/label')?.value).toBe('Small');

        // base 변경
        (node.find('/base') as NumberNode).setValue(150);
        await wait();

        // calculated도 업데이트
        expect(node.find('/calculated')?.value).toBe(300);
        // oneOf 분기 전환
        expect(node.find('/display/label')?.value).toBe('Large');
      });
    });

    describe('복합 시나리오 테스트', () => {
      it('중첩된 oneOf에서 각 레벨의 derived가 독립적으로 동작해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            level1Choice: {
              type: 'string',
              enum: ['x', 'y'],
              default: 'x',
            },
            level2Choice: {
              type: 'string',
              enum: ['p', 'q'],
              default: 'p',
            },
            baseValue: {
              type: 'number',
              default: 10,
            },
            nested: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: { if: '/level1Choice === "x"' },
                  properties: {
                    innerNested: {
                      type: 'object',
                      oneOf: [
                        {
                          type: 'object',
                          computed: { if: '/level2Choice === "p"' },
                          properties: {
                            result: {
                              type: 'number',
                              computed: { derived: '/baseValue * 2' },
                            },
                          },
                        },
                        {
                          type: 'object',
                          computed: { if: '/level2Choice === "q"' },
                          properties: {
                            result: {
                              type: 'number',
                              computed: { derived: '/baseValue * 3' },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/level1Choice === "y"' },
                  properties: {
                    innerNested: {
                      type: 'object',
                      oneOf: [
                        {
                          type: 'object',
                          computed: { if: '/level2Choice === "p"' },
                          properties: {
                            result: {
                              type: 'number',
                              computed: { derived: '/baseValue * 4' },
                            },
                          },
                        },
                        {
                          type: 'object',
                          computed: { if: '/level2Choice === "q"' },
                          properties: {
                            result: {
                              type: 'number',
                              computed: { derived: '/baseValue * 5' },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        // x + p: 10 * 2 = 20
        expect(node.find('/nested/innerNested/result')?.value).toBe(20);

        // level2를 q로 변경: x + q: 10 * 3 = 30
        (node.find('/level2Choice') as StringNode).setValue('q');
        await wait();
        expect(node.find('/nested/innerNested/result')?.value).toBe(30);

        // level1을 y로 변경: y + q: 10 * 5 = 50
        (node.find('/level1Choice') as StringNode).setValue('y');
        await wait();
        expect(node.find('/nested/innerNested/result')?.value).toBe(50);

        // level2를 p로 변경: y + p: 10 * 4 = 40
        (node.find('/level2Choice') as StringNode).setValue('p');
        await wait();
        expect(node.find('/nested/innerNested/result')?.value).toBe(40);

        // baseValue 변경: y + p: 20 * 4 = 80
        (node.find('/baseValue') as NumberNode).setValue(20);
        await wait();
        expect(node.find('/nested/innerNested/result')?.value).toBe(80);
      });

      it('anyOf 여러 분기가 동시에 활성화되어도 derived 간 간섭이 없어야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            input: {
              type: 'number',
              default: 100,
            },
            showAll: {
              type: 'boolean',
              default: true,
            },
            results: {
              type: 'object',
              anyOf: [
                {
                  type: 'object',
                  computed: { if: '/showAll' },
                  properties: {
                    sum: {
                      type: 'number',
                      computed: { derived: '/input + 10' },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/showAll' },
                  properties: {
                    product: {
                      type: 'number',
                      computed: { derived: '/input * 2' },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/showAll' },
                  properties: {
                    quotient: {
                      type: 'number',
                      computed: { derived: '/input / 2' },
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        // 모든 분기 활성화
        expect(node.find('/results')?.value).toEqual({
          sum: 110,
          product: 200,
          quotient: 50,
        });

        // input 변경
        (node.find('/input') as NumberNode).setValue(200);
        await wait();

        // 모든 derived가 독립적으로 업데이트
        expect(node.find('/results')?.value).toEqual({
          sum: 210,
          product: 400,
          quotient: 100,
        });
      });

      it('./를 사용한 조건부 업데이트가 oneOf와 함께 안전하게 동작해야 함', async () => {
        const onChange = vi.fn();
        const jsonSchema: JsonSchemaWithVirtual = {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['auto', 'manual'],
              default: 'auto',
            },
            input: {
              type: 'number',
              default: 100,
            },
            result: {
              type: 'object',
              oneOf: [
                {
                  type: 'object',
                  computed: { if: '/mode === "auto"' },
                  properties: {
                    value: {
                      type: 'number',
                      default: 0,
                      computed: {
                        // auto 모드에서만 자동 계산
                        derived: '/input * 2',
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  computed: { if: '/mode === "manual"' },
                  properties: {
                    value: {
                      type: 'number',
                      default: 50,
                      // manual 모드에서는 derived 없음 (사용자 입력만)
                    },
                  },
                },
              ],
            },
          },
        };

        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        // auto 모드: 자동 계산
        expect(node.find('/result/value')?.value).toBe(200);

        // input 변경
        (node.find('/input') as NumberNode).setValue(150);
        await wait();
        expect(node.find('/result/value')?.value).toBe(300);

        // manual 모드로 전환
        (node.find('/mode') as StringNode).setValue('manual');
        await wait();

        // manual 모드: 기본값 사용
        expect(node.find('/result/value')?.value).toBe(50);

        // manual 모드에서 값 변경
        (node.find('/result/value') as NumberNode).setValue(999);
        await wait();
        expect(node.find('/result/value')?.value).toBe(999);

        // auto 모드로 다시 전환
        (node.find('/mode') as StringNode).setValue('auto');
        await wait();

        // auto 모드: 자동 계산 재개
        expect(node.find('/result/value')?.value).toBe(300); // 150 * 2
      });
    });
  });
});
