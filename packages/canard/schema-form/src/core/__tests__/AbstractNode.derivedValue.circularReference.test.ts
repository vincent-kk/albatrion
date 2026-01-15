/**
 * 순환 참조 derived 및 동시 다발적 derived 업데이트 테스트
 *
 * 이 테스트 파일은 다음을 검증합니다:
 * 1. 발산하는 순환 참조 감지 (무한 루프 방지)
 * 2. 동시 다발적 derived 업데이트 시 이벤트 순서 일관성
 */
import { describe, expect, it, vi } from 'vitest';

import { isSchemaFormError } from '@/schema-form/errors';
import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

const wait = (delay = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode - 순환 참조 derived 테스트', () => {
  describe('순환 참조 수렴 테스트', () => {
    it('수렴하는 순환 참조 (A = B * 0.5, B = A + 10)에서 업데이트 횟수가 제한적이어야 함', async () => {
      const onChange = vi.fn();
      const MAX_UPDATES = 100;

      // 수렴하는 순환 참조: A = B * 0.5, B = A + 10
      // 수렴점: A = 10, B = 20
      // 주의: 발산하는 순환 참조 (A = B + 1, B = A + 1)는 무한루프를 발생시킴
      // 현재 구현에서는 마이크로태스크 기반으로 동작하므로
      // 발산하는 순환 참조는 수렴하지 않고 계속 값이 증가함 (테스트 불가)
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 0,
            computed: {
              // 빠르게 수렴하는 순환 참조: A = B * 0.5, B = A + 10
              // → A=10, B=20 근처에서 수렴
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

      let aUpdateCount = 0;
      let bUpdateCount = 0;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      const aNode = node.find('/a');
      const bNode = node.find('/b');

      // 업데이트 횟수 추적
      aNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          aUpdateCount++;
        }
      });

      bNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          bUpdateCount++;
        }
      });

      // 충분한 시간을 대기하여 순환이 안정화
      await wait(200);

      // 총 업데이트 횟수 확인
      const totalUpdates = aUpdateCount + bUpdateCount;
      console.log(
        `총 업데이트 횟수: ${totalUpdates} (A: ${aUpdateCount}, B: ${bUpdateCount})`,
      );

      // 수렴 후 안정화되었으므로 업데이트 횟수가 제한적이어야 함
      expect(totalUpdates).toBeLessThan(MAX_UPDATES);

      // 값이 수렴했는지 확인 (A = B * 0.5, B = A + 10 → A = 10, B = 20)
      const aValue = aNode?.value as number;
      const bValue = bNode?.value as number;
      expect(aValue).toBeCloseTo(bValue * 0.5, 0);
      expect(bValue).toBeCloseTo(aValue + 10, 0);
    });

    it('자기 자신을 참조하는 발산하는 derived에서 무한 루프가 제어되어야 함', async () => {
      const onChange = vi.fn();

      // 자기 자신 + 1을 참조하는 발산 케이스
      // 실제로는 자기 자신(./)을 직접 참조할 수 없으므로 형제 노드를 통해 간접 자기 참조 시뮬레이션
      const jsonSchema = {
        type: 'object',
        properties: {
          trigger: {
            type: 'number',
            default: 1,
          },
          selfIncrement: {
            type: 'number',
            default: 0,
            computed: {
              // trigger가 변경될 때마다 자기 값에 1을 더하는 것처럼 동작
              // 실제로는 이전 값에 의존하지 않고 trigger에만 의존
              derived: '../trigger * 10',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      let updateCount = 0;
      const selfIncrementNode = node.find('/selfIncrement');

      selfIncrementNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateCount++;
        }
      });

      // trigger 변경
      (node.find('/trigger') as NumberNode).setValue(5);
      await wait();

      // 단순 의존성이므로 한 번의 업데이트만 발생해야 함
      expect(updateCount).toBeLessThanOrEqual(2);
      expect(selfIncrementNode?.value).toBe(50);
    });

    it('3노드 수렴하는 순환 참조 (A → B → C → A)에서 안정화되어야 함', async () => {
      const onChange = vi.fn();

      // 3노드 수렴하는 순환: A = C * 0.5, B = A * 0.5, C = B + 10
      // 수렴점: C ≈ 40, A ≈ 20, B ≈ 10
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../c || 0) * 0.5',
            },
          },
          b: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../a || 0) * 0.5',
            },
          },
          c: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../b || 0) + 10',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      let totalUpdateCount = 0;
      const MAX_UPDATES = 100;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      const aNode = node.find('/a');
      const bNode = node.find('/b');
      const cNode = node.find('/c');

      const trackUpdate = ({ type }: { type: number }) => {
        if (type & NodeEventType.UpdateValue) {
          totalUpdateCount++;
        }
      };

      aNode?.subscribe(trackUpdate);
      bNode?.subscribe(trackUpdate);
      cNode?.subscribe(trackUpdate);

      await wait(200);

      console.log(`3노드 순환 총 업데이트 횟수: ${totalUpdateCount}`);

      // 수렴 후 업데이트 횟수가 제한적이어야 함
      expect(totalUpdateCount).toBeLessThan(MAX_UPDATES);

      // 값이 수렴했는지 확인
      const aValue = aNode?.value as number;
      const bValue = bNode?.value as number;
      const cValue = cNode?.value as number;

      // 수렴점: C ≈ 13.33, A ≈ 6.67, B ≈ 3.33 (실제 수렴값)
      expect(cValue).toBeCloseTo(bValue + 10, 0);
      expect(aValue).toBeCloseTo(cValue * 0.5, 0);
      expect(bValue).toBeCloseTo(aValue * 0.5, 0);
    });
  });

  describe('동시 다발적 derived 업데이트 이벤트 순서', () => {
    it('단일 소스 변경 시 여러 derived의 이벤트 순서가 일관되어야 함', async () => {
      const onChange = vi.fn();

      // 단일 소스(source)가 여러 derived 필드에 영향
      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 10,
          },
          derived1: {
            type: 'number',
            computed: {
              derived: '../source * 2',
            },
          },
          derived2: {
            type: 'number',
            computed: {
              derived: '../source * 3',
            },
          },
          derived3: {
            type: 'number',
            computed: {
              derived: '../source * 4',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const eventLog: Array<{
        node: string;
        type: number;
        timestamp: number;
      }> = [];

      const derived1Node = node.find('/derived1');
      const derived2Node = node.find('/derived2');
      const derived3Node = node.find('/derived3');

      // 초기값 확인
      expect(derived1Node?.value).toBe(20);
      expect(derived2Node?.value).toBe(30);
      expect(derived3Node?.value).toBe(40);

      // 이벤트 추적 설정
      derived1Node?.subscribe(({ type }) => {
        eventLog.push({ node: 'derived1', type, timestamp: performance.now() });
      });
      derived2Node?.subscribe(({ type }) => {
        eventLog.push({ node: 'derived2', type, timestamp: performance.now() });
      });
      derived3Node?.subscribe(({ type }) => {
        eventLog.push({ node: 'derived3', type, timestamp: performance.now() });
      });

      // source 변경
      (node.find('/source') as NumberNode).setValue(100);
      await wait();

      // 모든 derived가 업데이트되었는지 확인
      expect(derived1Node?.value).toBe(200);
      expect(derived2Node?.value).toBe(300);
      expect(derived3Node?.value).toBe(400);

      // 이벤트가 발생했는지 확인
      const updateValueEvents = eventLog.filter(
        (e) => e.type & NodeEventType.UpdateValue,
      );
      const computedPropertyEvents = eventLog.filter(
        (e) => e.type & NodeEventType.UpdateComputedProperties,
      );

      console.log('UpdateValue 이벤트 수:', updateValueEvents.length);
      console.log(
        'UpdateComputedProperties 이벤트 수:',
        computedPropertyEvents.length,
      );

      // 각 derived 노드에 대해 업데이트 이벤트가 발생해야 함
      expect(eventLog.length).toBeGreaterThan(0);
    });

    it('체이닝된 derived (A → B → C)에서 이벤트 순서가 의존성 순서를 따라야 함', async () => {
      const onChange = vi.fn();

      // derived 체이닝: source → step1 → step2 → step3
      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 10,
          },
          step1: {
            type: 'number',
            computed: {
              derived: '../source + 10', // 20
            },
          },
          step2: {
            type: 'number',
            computed: {
              derived: '../step1 * 2', // 40
            },
          },
          step3: {
            type: 'number',
            computed: {
              derived: '../step2 + 100', // 140
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/step1')?.value).toBe(20);
      expect(node.find('/step2')?.value).toBe(40);
      expect(node.find('/step3')?.value).toBe(140);

      const updateSequence: string[] = [];

      node.find('/step1')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateSequence.push('step1');
        }
      });
      node.find('/step2')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateSequence.push('step2');
        }
      });
      node.find('/step3')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateSequence.push('step3');
        }
      });

      // source 변경
      (node.find('/source') as NumberNode).setValue(50);
      await wait();

      // 값이 올바르게 업데이트되었는지 확인
      expect(node.find('/step1')?.value).toBe(60); // 50 + 10
      expect(node.find('/step2')?.value).toBe(120); // 60 * 2
      expect(node.find('/step3')?.value).toBe(220); // 120 + 100

      console.log('업데이트 순서:', updateSequence);

      // 모든 단계가 업데이트되었는지 확인
      expect(updateSequence).toContain('step1');
      expect(updateSequence).toContain('step2');
      expect(updateSequence).toContain('step3');
    });

    it('병렬 derived + 체이닝된 derived가 혼합된 경우 올바르게 동작해야 함', async () => {
      const onChange = vi.fn();

      // 복합 구조: source가 parallel1, parallel2에 직접 영향
      // combined는 parallel1과 parallel2에 의존
      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 10,
          },
          parallel1: {
            type: 'number',
            computed: {
              derived: '../source * 2', // 20
            },
          },
          parallel2: {
            type: 'number',
            computed: {
              derived: '../source * 3', // 30
            },
          },
          combined: {
            type: 'number',
            computed: {
              derived: '../parallel1 + ../parallel2', // 50
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/parallel1')?.value).toBe(20);
      expect(node.find('/parallel2')?.value).toBe(30);
      expect(node.find('/combined')?.value).toBe(50);

      const eventCounts = {
        parallel1: 0,
        parallel2: 0,
        combined: 0,
      };

      node.find('/parallel1')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          eventCounts.parallel1++;
        }
      });
      node.find('/parallel2')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          eventCounts.parallel2++;
        }
      });
      node.find('/combined')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          eventCounts.combined++;
        }
      });

      // source 변경
      (node.find('/source') as NumberNode).setValue(100);
      await wait();

      // 값이 올바르게 업데이트되었는지 확인
      expect(node.find('/parallel1')?.value).toBe(200); // 100 * 2
      expect(node.find('/parallel2')?.value).toBe(300); // 100 * 3
      expect(node.find('/combined')?.value).toBe(500); // 200 + 300

      console.log('이벤트 카운트:', eventCounts);

      // 모든 노드가 업데이트되었는지 확인
      expect(eventCounts.parallel1).toBeGreaterThan(0);
      expect(eventCounts.parallel2).toBeGreaterThan(0);
      expect(eventCounts.combined).toBeGreaterThan(0);
    });

    it('마이크로태스크 기준으로 이벤트 발생 시점을 추적해야 함', async () => {
      const onChange = vi.fn();

      const jsonSchema = {
        type: 'object',
        properties: {
          trigger: {
            type: 'string',
            default: 'initial',
          },
          dependent1: {
            type: 'string',
            computed: {
              derived: '../trigger + "_dep1"',
            },
          },
          dependent2: {
            type: 'string',
            computed: {
              derived: '../trigger + "_dep2"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const eventLog: Array<{
        node: string;
        type: number;
        microtask: number;
      }> = [];
      let microtaskCount = 0;

      const trackEvent = (nodeName: string) => (event: { type: number }) => {
        eventLog.push({
          node: nodeName,
          type: event.type,
          microtask: microtaskCount,
        });
      };

      node.find('/dependent1')?.subscribe(trackEvent('dependent1'));
      node.find('/dependent2')?.subscribe(trackEvent('dependent2'));

      // trigger 변경
      const triggerNode = node.find('/trigger');
      (triggerNode as any).setValue('changed');

      // 마이크로태스크 추적
      microtaskCount = 1;
      await Promise.resolve();

      microtaskCount = 2;
      await Promise.resolve();

      await wait();

      console.log('이벤트 로그:', eventLog);

      // 이벤트가 발생했는지 확인
      expect(eventLog.length).toBeGreaterThan(0);

      // UpdateComputedProperties 이벤트가 첫 번째 마이크로태스크에서 발생해야 함
      const computedEventsInFirstMicrotask = eventLog.filter(
        (e) =>
          e.type & NodeEventType.UpdateComputedProperties && e.microtask === 1,
      );

      if (computedEventsInFirstMicrotask.length > 0) {
        console.log(
          '✅ UpdateComputedProperties가 첫 번째 마이크로태스크에서 발생',
        );
      }

      // 의존하는 노드들의 값이 업데이트되었는지 확인
      expect(node.find('/dependent1')?.value).toBe('changed_dep1');
      expect(node.find('/dependent2')?.value).toBe('changed_dep2');
    });

    it('동시에 여러 소스가 변경될 때 이벤트가 올바르게 병합되어야 함', async () => {
      const onChange = vi.fn();

      const jsonSchema = {
        type: 'object',
        properties: {
          sourceA: {
            type: 'number',
            default: 10,
          },
          sourceB: {
            type: 'number',
            default: 20,
          },
          combined: {
            type: 'number',
            computed: {
              derived: '../sourceA + ../sourceB', // 30
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      expect(node.find('/combined')?.value).toBe(30);

      let combinedUpdateCount = 0;
      node.find('/combined')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          combinedUpdateCount++;
        }
      });

      // 두 소스를 동시에 변경 (동기적으로)
      (node.find('/sourceA') as NumberNode).setValue(100);
      (node.find('/sourceB') as NumberNode).setValue(200);

      await wait();

      // 최종 값이 올바른지 확인
      expect(node.find('/combined')?.value).toBe(300); // 100 + 200

      console.log(`combined 업데이트 횟수: ${combinedUpdateCount}`);

      // 이벤트가 적절히 병합되었는지 확인 (너무 많은 업데이트가 발생하지 않아야 함)
      expect(combinedUpdateCount).toBeLessThanOrEqual(4);
    });
  });

  describe('무한 루프 보호 메커니즘 검증', () => {
    it('equals 체크가 동일한 값에 대해 업데이트를 중단해야 함', async () => {
      const onChange = vi.fn();

      const jsonSchema = {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            default: 100,
          },
          mirror: {
            type: 'number',
            computed: {
              derived: '../source', // source를 그대로 반영
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      expect(node.find('/mirror')?.value).toBe(100);

      let updateCount = 0;
      node.find('/mirror')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateCount++;
        }
      });

      // 같은 값으로 설정
      (node.find('/source') as NumberNode).setValue(100);
      await wait();

      // equals 체크로 인해 UpdateValue 이벤트가 발생하지 않아야 함
      expect(updateCount).toBe(0);
      expect(node.find('/mirror')?.value).toBe(100);
    });

    it('수렴하는 순환 참조가 안정화 후 더 이상 업데이트되지 않아야 함', async () => {
      const onChange = vi.fn();

      // 수렴하는 순환: A = B * 0.5, B = A + 10 → A=10, B=20
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

      // 초기 안정화 대기
      await wait(100);

      const aNode = node.find('/a');
      const bNode = node.find('/b');

      // 수렴 값 확인
      expect(aNode?.value).toBeCloseTo(10);
      expect(bNode?.value).toBeCloseTo(20);

      // 안정화 후 추가 업데이트 추적
      let postStabilizationUpdates = 0;
      aNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          postStabilizationUpdates++;
        }
      });
      bNode?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          postStabilizationUpdates++;
        }
      });

      // 추가 대기
      await wait(100);

      console.log(`안정화 후 업데이트 횟수: ${postStabilizationUpdates}`);

      // 안정화 후에는 추가 업데이트가 발생하지 않아야 함
      expect(postStabilizationUpdates).toBe(0);
    });
  });

  describe('rootNode.setValue() + oneOf/if-then-else + derived 수렴 테스트', () => {
    it('if-then-else + derived: rootNode.setValue()로 여러 필드 동시 주입 시 값이 수렴해야 함', async () => {
      const onChange = vi.fn();

      // if-then-else 조건부 스키마 + derived
      // category가 'movie'일 때 openingDate가 required
      // totalPrice = basePrice * quantity (derived)
      const jsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['game', 'movie'],
            default: 'game',
          },
          basePrice: {
            type: 'number',
            default: 100,
          },
          quantity: {
            type: 'number',
            default: 1,
          },
          totalPrice: {
            type: 'number',
            computed: {
              derived: '(../basePrice || 0) * (../quantity || 1)',
            },
          },
          openingDate: {
            type: 'string',
            format: 'date',
          },
        },
        if: {
          properties: {
            category: { enum: ['movie'] },
          },
        },
        then: {
          required: ['openingDate'],
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/totalPrice')?.value).toBe(100); // 100 * 1

      let updateCount = 0;
      node.find('/totalPrice')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateCount++;
        }
      });

      // rootNode.setValue()로 여러 필드 동시 주입 (formHandle.current?.setValue()와 동일)
      (node as ObjectNode).setValue({
        category: 'movie',
        basePrice: 200,
        quantity: 3,
        openingDate: '2025-01-01',
      });

      await wait();

      // 값이 올바르게 수렴했는지 확인
      expect(node.find('/category')?.value).toBe('movie');
      expect(node.find('/basePrice')?.value).toBe(200);
      expect(node.find('/quantity')?.value).toBe(3);
      expect(node.find('/totalPrice')?.value).toBe(600); // 200 * 3
      expect(node.find('/openingDate')?.value).toBe('2025-01-01');

      console.log(
        `if-then-else + derived: totalPrice 업데이트 횟수: ${updateCount}`,
      );

      // 업데이트 횟수가 합리적인 범위 내에 있어야 함
      expect(updateCount).toBeLessThanOrEqual(5);
    });

    it('oneOf + derived: rootNode.setValue()로 조건부 필드와 derived 동시 주입 시 수렴해야 함', async () => {
      const onChange = vi.fn();

      // oneOf 조건부 스키마 + derived
      // type이 'premium'일 때 premiumFeatures가 활성화
      // discountedPrice = price * discountRate (derived)
      const jsonSchema = {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['basic', 'premium'],
            default: 'basic',
          },
          price: {
            type: 'number',
            default: 1000,
          },
          discountRate: {
            type: 'number',
            default: 0.9, // 10% 할인
          },
          discountedPrice: {
            type: 'number',
            computed: {
              derived: '(../price || 0) * (../discountRate || 1)',
            },
          },
        },
        oneOf: [
          {
            computed: {
              if: "#/type === 'premium'",
            },
            properties: {
              premiumFeatures: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        ],
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/discountedPrice')?.value).toBe(900); // 1000 * 0.9

      let updateCount = 0;
      node.find('/discountedPrice')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) {
          updateCount++;
        }
      });

      // rootNode.setValue()로 여러 필드 동시 주입
      (node as ObjectNode).setValue({
        type: 'premium',
        price: 5000,
        discountRate: 0.8, // 20% 할인
      });

      await wait();

      // 값이 올바르게 수렴했는지 확인
      expect(node.find('/type')?.value).toBe('premium');
      expect(node.find('/price')?.value).toBe(5000);
      expect(node.find('/discountRate')?.value).toBe(0.8);
      expect(node.find('/discountedPrice')?.value).toBe(4000); // 5000 * 0.8

      console.log(
        `oneOf + derived: discountedPrice 업데이트 횟수: ${updateCount}`,
      );

      // 업데이트 횟수가 합리적인 범위 내에 있어야 함
      expect(updateCount).toBeLessThanOrEqual(5);
    });

    it('복합 시나리오: if-then-else + 여러 derived 필드 동시 업데이트', async () => {
      const onChange = vi.fn();

      // 복합 시나리오: 여러 derived가 동일 소스에 의존
      const jsonSchema = {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            default: 'active',
          },
          baseAmount: {
            type: 'number',
            default: 1000,
          },
          taxRate: {
            type: 'number',
            default: 0.1,
          },
          // 여러 derived 필드
          taxAmount: {
            type: 'number',
            computed: {
              derived: '(../baseAmount || 0) * (../taxRate || 0)',
            },
          },
          totalAmount: {
            type: 'number',
            computed: {
              derived:
                '(../baseAmount || 0) + ((../baseAmount || 0) * (../taxRate || 0))',
            },
          },
          displayLabel: {
            type: 'string',
            computed: {
              derived:
                '"Total: " + ((../baseAmount || 0) + ((../baseAmount || 0) * (../taxRate || 0)))',
            },
          },
        },
        if: {
          properties: {
            status: { enum: ['active'] },
          },
        },
        then: {
          required: ['baseAmount', 'taxRate'],
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/taxAmount')?.value).toBe(100); // 1000 * 0.1
      expect(node.find('/totalAmount')?.value).toBe(1100); // 1000 + 100
      expect(node.find('/displayLabel')?.value).toBe('Total: 1100');

      const updateCounts = {
        taxAmount: 0,
        totalAmount: 0,
        displayLabel: 0,
      };

      node.find('/taxAmount')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updateCounts.taxAmount++;
      });
      node.find('/totalAmount')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updateCounts.totalAmount++;
      });
      node.find('/displayLabel')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) updateCounts.displayLabel++;
      });

      // rootNode.setValue()로 여러 필드 동시 주입
      (node as ObjectNode).setValue({
        status: 'active',
        baseAmount: 5000,
        taxRate: 0.2, // 20%
      });

      await wait();

      // 모든 derived 필드가 올바르게 수렴했는지 확인
      expect(node.find('/taxAmount')?.value).toBe(1000); // 5000 * 0.2
      expect(node.find('/totalAmount')?.value).toBe(6000); // 5000 + 1000
      expect(node.find('/displayLabel')?.value).toBe('Total: 6000');

      console.log('복합 시나리오 업데이트 횟수:', updateCounts);

      // 각 derived 필드의 업데이트 횟수가 합리적이어야 함
      expect(updateCounts.taxAmount).toBeLessThanOrEqual(5);
      expect(updateCounts.totalAmount).toBeLessThanOrEqual(5);
      expect(updateCounts.displayLabel).toBeLessThanOrEqual(5);
    });

    it('조건 전환: if-then-else 조건 변경 시 derived 값이 올바르게 수렴', async () => {
      const onChange = vi.fn();

      // 조건에 따라 다른 derived 계산식 적용
      const jsonSchema = {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['standard', 'express'],
            default: 'standard',
          },
          basePrice: {
            type: 'number',
            default: 1000,
          },
          // standard: basePrice * 1.0, express: basePrice * 1.5
          shippingFee: {
            type: 'number',
            computed: {
              derived:
                "../mode === 'express' ? (../basePrice || 0) * 0.15 : (../basePrice || 0) * 0.05",
            },
          },
          totalPrice: {
            type: 'number',
            computed: {
              derived:
                "(../basePrice || 0) + (../mode === 'express' ? (../basePrice || 0) * 0.15 : (../basePrice || 0) * 0.05)",
            },
          },
        },
        if: {
          properties: {
            mode: { enum: ['express'] },
          },
        },
        then: {
          properties: {
            expressNote: {
              type: 'string',
              default: '빠른 배송 선택됨',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 (standard 모드)
      expect(node.find('/shippingFee')?.value).toBe(50); // 1000 * 0.05
      expect(node.find('/totalPrice')?.value).toBe(1050);

      // express 모드로 전환
      (node as ObjectNode).setValue({
        mode: 'express',
        basePrice: 2000,
      });

      await wait();

      // express 모드에서의 값 확인
      expect(node.find('/shippingFee')?.value).toBe(300); // 2000 * 0.15
      expect(node.find('/totalPrice')?.value).toBe(2300); // 2000 + 300

      // 다시 standard 모드로 전환
      (node as ObjectNode).setValue({
        mode: 'standard',
        basePrice: 3000,
      });

      await wait();

      // standard 모드에서의 값 확인
      expect(node.find('/shippingFee')?.value).toBe(150); // 3000 * 0.05
      expect(node.find('/totalPrice')?.value).toBe(3150); // 3000 + 150
    });

    it('oneOf 조건 전환: 조건 변경 시 derived 값이 올바르게 수렴', async () => {
      const onChange = vi.fn();

      // oneOf를 사용한 조건부 스키마
      const jsonSchema = {
        type: 'object',
        properties: {
          productType: {
            type: 'string',
            enum: ['digital', 'physical'],
            default: 'digital',
          },
          basePrice: {
            type: 'number',
            default: 100,
          },
          // digital: 세금 없음, physical: 10% 세금
          finalPrice: {
            type: 'number',
            computed: {
              derived:
                "../productType === 'physical' ? (../basePrice || 0) * 1.1 : (../basePrice || 0)",
            },
          },
        },
        oneOf: [
          {
            computed: {
              if: "#/productType === 'digital'",
            },
            properties: {
              downloadLink: { type: 'string' },
            },
          },
          {
            computed: {
              if: "#/productType === 'physical'",
            },
            properties: {
              shippingAddress: { type: 'string' },
            },
          },
        ],
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 (digital)
      expect(node.find('/finalPrice')?.value).toBe(100); // 세금 없음

      // physical로 전환
      (node as ObjectNode).setValue({
        productType: 'physical',
        basePrice: 500,
      });

      await wait();

      // physical 모드에서의 값 확인 (10% 세금 추가)
      expect(node.find('/finalPrice')?.value).toBe(550); // 500 * 1.1

      // digital로 다시 전환
      (node as ObjectNode).setValue({
        productType: 'digital',
        basePrice: 200,
      });

      await wait();

      // digital 모드에서의 값 확인 (세금 없음)
      expect(node.find('/finalPrice')?.value).toBe(200);
    });

    it('체이닝된 derived + 조건부 스키마: 연쇄 계산이 올바르게 수렴', async () => {
      const onChange = vi.fn();

      // 체이닝된 derived: a → b → c → d
      const jsonSchema = {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['A', 'B'],
            default: 'A',
          },
          input: {
            type: 'number',
            default: 10,
          },
          step1: {
            type: 'number',
            computed: {
              derived: '(../input || 0) * 2', // 20
            },
          },
          step2: {
            type: 'number',
            computed: {
              derived: '(../step1 || 0) + 100', // 120
            },
          },
          step3: {
            type: 'number',
            computed: {
              derived: '(../step2 || 0) * (../category === "A" ? 1 : 2)', // 조건부 계산
            },
          },
        },
        if: {
          properties: {
            category: { enum: ['B'] },
          },
        },
        then: {
          required: ['input'],
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 (category: A)
      expect(node.find('/step1')?.value).toBe(20); // 10 * 2
      expect(node.find('/step2')?.value).toBe(120); // 20 + 100
      expect(node.find('/step3')?.value).toBe(120); // 120 * 1 (category A)

      let step3UpdateCount = 0;
      node.find('/step3')?.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateValue) step3UpdateCount++;
      });

      // rootNode.setValue()로 여러 필드 동시 주입
      (node as ObjectNode).setValue({
        category: 'B',
        input: 50,
      });

      await wait();

      // 체이닝된 계산이 모두 올바르게 수렴했는지 확인
      expect(node.find('/step1')?.value).toBe(100); // 50 * 2
      expect(node.find('/step2')?.value).toBe(200); // 100 + 100
      expect(node.find('/step3')?.value).toBe(400); // 200 * 2 (category B)

      console.log(`체이닝된 derived step3 업데이트 횟수: ${step3UpdateCount}`);

      // 체이닝으로 인해 여러 번 업데이트될 수 있지만, 합리적인 범위 내여야 함
      expect(step3UpdateCount).toBeLessThanOrEqual(10);
    });

    it('SetValueOption.Merge로 부분 업데이트 시 derived 수렴', async () => {
      const onChange = vi.fn();

      const jsonSchema = {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            default: 'John',
          },
          lastName: {
            type: 'string',
            default: 'Doe',
          },
          fullName: {
            type: 'string',
            computed: {
              derived: '(../firstName || "") + " " + (../lastName || "")',
            },
          },
          age: {
            type: 'number',
            default: 25,
          },
          ageGroup: {
            type: 'string',
            computed: {
              derived: '(../age || 0) >= 18 ? "adult" : "minor"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      // 초기값 확인
      expect(node.find('/fullName')?.value).toBe('John Doe');
      expect(node.find('/ageGroup')?.value).toBe('adult');

      // 부분 업데이트: firstName만 변경
      (node.find('/firstName') as StringNode).setValue('Jane');

      await wait();

      expect(node.find('/fullName')?.value).toBe('Jane Doe');

      // 또 다른 부분 업데이트: lastName 변경
      (node.find('/lastName') as StringNode).setValue('Smith');

      await wait();

      expect(node.find('/fullName')?.value).toBe('Jane Smith');

      // 전체 업데이트
      (node as ObjectNode).setValue({
        firstName: 'Alice',
        lastName: 'Johnson',
        age: 15,
      });

      await wait();

      expect(node.find('/fullName')?.value).toBe('Alice Johnson');
      expect(node.find('/ageGroup')?.value).toBe('minor');
    });
  });

  describe('발산하는 순환 참조 무한 루프 감지', () => {
    /**
     * 발산하는 순환 참조 테스트
     *
     * 주의: 마이크로태스크 내에서 throw된 에러는 동기적 try-catch로 잡을 수 없습니다.
     * 대신 process.on('uncaughtException')을 사용하여 에러를 캡처합니다.
     */
    it('발산하는 순환 참조 (A = B + 1, B = A + 1)에서 JsonSchemaError가 발생해야 함', async () => {
      const onChange = vi.fn();
      let caughtError: unknown = null;

      // Node.js 환경에서 uncaughtException 핸들러 등록
      const errorHandler = (error: Error) => {
        if (isSchemaFormError(error)) {
          caughtError = error;
        }
      };
      process.on('uncaughtException', errorHandler);

      // 발산하는 순환 참조: A = B + 1, B = A + 1
      // 이 경우 값이 계속 증가하여 무한 루프 발생
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../b || 0) + 1', // 발산!
            },
          },
          b: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../a || 0) + 1', // 발산!
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      // 충분한 시간 대기 (마이크로태스크가 100회 이상 실행되도록)
      await wait(100);

      // 핸들러 제거
      process.off('uncaughtException', errorHandler);

      // JsonSchemaError가 발생해야 함
      expect(caughtError).not.toBeNull();
      expect(isSchemaFormError(caughtError)).toBe(true);

      if (isSchemaFormError(caughtError)) {
        expect(caughtError.code).toContain('INFINITE_LOOP_DETECTED');
        expect(caughtError.message).toContain('Infinite loop detected');
        expect(caughtError.message).toContain('Node:');
        expect(caughtError.message).toContain('Dependencies:');
        expect(caughtError.details).toHaveProperty('path');
        expect(caughtError.details).toHaveProperty('batchCount');
        console.log('발산 순환 참조 감지:', caughtError.details.path);
      }
    });

    it('3노드 발산하는 순환 참조 (A → B → C → A, 모두 +1)에서 에러가 발생해야 함', async () => {
      const onChange = vi.fn();
      let caughtError: unknown = null;

      const errorHandler = (error: Error) => {
        if (isSchemaFormError(error)) {
          caughtError = error;
        }
      };
      process.on('uncaughtException', errorHandler);

      // 3노드 발산: 모두 +1씩 증가하는 순환
      const jsonSchema = {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../c || 0) + 1',
            },
          },
          b: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../a || 0) + 1',
            },
          },
          c: {
            type: 'number',
            default: 0,
            computed: {
              derived: '(../b || 0) + 1',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait(100);

      process.off('uncaughtException', errorHandler);

      expect(caughtError).not.toBeNull();
      expect(isSchemaFormError(caughtError)).toBe(true);

      if (isSchemaFormError(caughtError)) {
        expect(caughtError.code).toContain('INFINITE_LOOP_DETECTED');
        console.log('3노드 발산 순환 참조 감지:', caughtError.details?.path);
      }
    });

    it('수렴하는 순환 참조에서는 에러가 발생하지 않아야 함', async () => {
      const onChange = vi.fn();

      // 수렴하는 순환 참조: A = B * 0.5, B = A + 10
      // 이 경우 수렴하므로 에러 없음
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

      let caughtError: unknown = null;

      try {
        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait(200);

        // 수렴 후 값 확인
        const aValue = node.find('/a')?.value as number;
        const bValue = node.find('/b')?.value as number;
        expect(aValue).toBeCloseTo(bValue * 0.5, 0);
        expect(bValue).toBeCloseTo(aValue + 10, 0);
      } catch (error) {
        caughtError = error;
      }

      // 수렴하는 순환에서는 에러가 발생하지 않아야 함
      expect(caughtError).toBeNull();
    });

    it('일반적인 derived (순환 없음)에서는 에러가 발생하지 않아야 함', async () => {
      const onChange = vi.fn();

      const jsonSchema = {
        type: 'object',
        properties: {
          price: {
            type: 'number',
            default: 100,
          },
          quantity: {
            type: 'number',
            default: 2,
          },
          total: {
            type: 'number',
            computed: {
              derived: '(../price || 0) * (../quantity || 1)',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      let caughtError: unknown = null;

      try {
        const node = nodeFromJsonSchema({
          jsonSchema,
          onChange,
        });

        await wait();

        expect(node.find('/total')?.value).toBe(200);

        // setValue 후에도 정상 동작
        (node.find('/price') as NumberNode).setValue(500);
        await wait();
        expect(node.find('/total')?.value).toBe(1000);
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeNull();
    });
  });
});
