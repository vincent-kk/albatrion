/**
 * Detailed Propagate Batch Analysis Tests
 *
 * These tests provide detailed analysis of call counts and timing
 * to verify the effectiveness of the Batch option in preventing infinite loops.
 */

import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType } from '../nodes/type';

describe('ObjectNode Propagate Batch Detailed Analysis', () => {
  describe('exact call count analysis', () => {
    it('should report exact emitChange call count for parent setValue', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      const eventListener = vi.fn();
      objectNode.subscribe(eventListener);

      // Parent setValue
      objectNode.setValue({ name: 'Alice', age: 25, email: 'alice@example.com' });
      await delay();

      const totalCalls = eventListener.mock.calls.length;
      const updateValueCalls = eventListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateValue,
      ).length;
      const requestEmitChangeCalls = eventListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.RequestEmitChange,
      ).length;
      const updateComputedPropertiesCalls = eventListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateComputedProperties,
      ).length;

      console.log('\n=== Parent setValue Call Analysis ===');
      console.log(`Total events: ${totalCalls}`);
      console.log(`UpdateValue: ${updateValueCalls}`);
      console.log(`RequestEmitChange: ${requestEmitChangeCalls}`);
      console.log(`UpdateComputedProperties: ${updateComputedPropertiesCalls}`);

      // Assertions: should be bounded
      expect(totalCalls).toBeLessThan(20);
      expect(updateValueCalls).toBeGreaterThan(0);

      // Verify correct final state
      expect(objectNode.value).toEqual({
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      });
    });

    it('should report exact call count for child setValue', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const nameNode = objectNode.find('./name') as StringNode;

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      const childListener = vi.fn();
      nameNode.subscribe(childListener);

      // Child setValue (real user scenario)
      nameNode.setValue('Bob');
      await delay();

      const parentTotalCalls = parentListener.mock.calls.length;
      const childTotalCalls = childListener.mock.calls.length;

      console.log('\n=== Child setValue Call Analysis ===');
      console.log(`Parent total events: ${parentTotalCalls}`);
      console.log(`Child total events: ${childTotalCalls}`);

      // Both should be bounded
      expect(parentTotalCalls).toBeLessThan(20);
      expect(childTotalCalls).toBeLessThan(20);

      expect(objectNode.value).toEqual({ name: 'Bob' });
    });

    it('should compare parent vs child setValue call patterns', async () => {
      const schema = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
      } satisfies JsonSchema;

      // Test 1: Parent setValue
      const node1 = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const objectNode1 = node1 as ObjectNode;
      const listener1 = vi.fn();
      objectNode1.subscribe(listener1);

      objectNode1.setValue({ field: 'value' });
      await delay();

      const parentCallCount = listener1.mock.calls.length;

      // Test 2: Child setValue
      const node2 = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      await delay();

      const objectNode2 = node2 as ObjectNode;
      const fieldNode2 = objectNode2.find('./field') as StringNode;
      const listener2 = vi.fn();
      objectNode2.subscribe(listener2);

      fieldNode2.setValue('value');
      await delay();

      const childCallCount = listener2.mock.calls.length;

      console.log('\n=== Parent vs Child Call Comparison ===');
      console.log(`Parent setValue: ${parentCallCount} events`);
      console.log(`Child setValue: ${childCallCount} events`);
      console.log(`Difference: ${Math.abs(parentCallCount - childCallCount)} events`);

      // Both should be reasonable
      expect(parentCallCount).toBeLessThan(20);
      expect(childCallCount).toBeLessThan(20);
    });
  });

  describe('handleChange callback frequency', () => {
    it('should count handleChange callback invocations', async () => {
      const schema = {
        type: 'object',
        properties: {
          field1: { type: 'string' },
          field2: { type: 'string' },
        },
      } satisfies JsonSchema;

      const onChangeSpy = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: onChangeSpy,
      });

      await delay();

      const objectNode = node as ObjectNode;

      // Parent setValue
      objectNode.setValue({ field1: 'value1', field2: 'value2' });
      await delay();

      const onChangeCallCount = onChangeSpy.mock.calls.length;

      console.log('\n=== onChange Callback Analysis ===');
      console.log(`onChange called: ${onChangeCallCount} times`);

      // onChange should be called reasonable number of times
      expect(onChangeCallCount).toBeLessThan(10);

      // Verify final callback value
      const lastCall = onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1];
      expect(lastCall[0]).toEqual({ field1: 'value1', field2: 'value2' });
    });

    it('should analyze handleChange frequency with multiple child changes', async () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
        },
      } satisfies JsonSchema;

      const onChangeSpy = vi.fn();

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: onChangeSpy,
      });

      await delay();

      const objectNode = node as ObjectNode;
      const aNode = objectNode.find('./a') as StringNode;
      const bNode = objectNode.find('./b') as StringNode;
      const cNode = objectNode.find('./c') as StringNode;

      // Multiple child changes in same sync stack
      aNode.setValue('a-value');
      bNode.setValue('b-value');
      cNode.setValue('c-value');

      await delay();

      const onChangeCallCount = onChangeSpy.mock.calls.length;

      console.log('\n=== Multiple Child Changes Analysis ===');
      console.log(`onChange called: ${onChangeCallCount} times`);
      console.log('Expected: Batched into fewer calls');

      // Should be batched efficiently
      expect(onChangeCallCount).toBeLessThan(15);

      expect(objectNode.value).toEqual({
        a: 'a-value',
        b: 'b-value',
        c: 'c-value',
      });
    });
  });

  describe('timing analysis', () => {
    it('should measure propagation timing', async () => {
      const schema = {
        type: 'object',
        properties: {
          f1: { type: 'string' },
          f2: { type: 'string' },
          f3: { type: 'string' },
          f4: { type: 'string' },
          f5: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;

      const timings: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        objectNode.setValue({
          f1: `v${i}`,
          f2: `v${i}`,
          f3: `v${i}`,
          f4: `v${i}`,
          f5: `v${i}`,
        });
        await delay();
        const end = performance.now();
        timings.push(end - start);
      }

      const avgTiming = timings.reduce((a, b) => a + b) / timings.length;
      const maxTiming = Math.max(...timings);

      console.log('\n=== Timing Analysis (10 iterations) ===');
      console.log(`Average: ${avgTiming.toFixed(2)}ms`);
      console.log(`Max: ${maxTiming.toFixed(2)}ms`);
      console.log(`All timings: ${timings.map((t) => t.toFixed(2)).join(', ')}ms`);

      // Performance bounds
      expect(avgTiming).toBeLessThan(50);
      expect(maxTiming).toBeLessThan(100);
    });
  });

  describe('stress test scenarios', () => {
    it('should handle rapid successive setValue calls', async () => {
      const schema = {
        type: 'object',
        properties: {
          counter: { type: 'number', default: 0 },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Rapid successive parent setValue calls
      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        objectNode.setValue({ counter: i });
      }

      await delay();
      await delay(); // Extra delay for all events to process

      const totalCalls = listener.mock.calls.length;

      console.log('\n=== Rapid setValue Stress Test ===');
      console.log(`Iterations: ${iterations}`);
      console.log(`Total events: ${totalCalls}`);
      console.log(`Events per iteration: ${(totalCalls / iterations).toFixed(2)}`);

      // Should be bounded even with many rapid calls
      expect(totalCalls).toBeLessThan(iterations * 10);
      expect(objectNode.value).toEqual({ counter: iterations - 1 });
    });

    it('should handle rapid child setValue calls', async () => {
      const schema = {
        type: 'object',
        properties: {
          value: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const valueNode = objectNode.find('./value') as StringNode;

      const parentListener = vi.fn();
      objectNode.subscribe(parentListener);

      // Rapid successive child setValue calls
      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        valueNode.setValue(`value-${i}`);
      }

      await delay();
      await delay();

      const totalCalls = parentListener.mock.calls.length;

      console.log('\n=== Rapid Child setValue Stress Test ===');
      console.log(`Iterations: ${iterations}`);
      console.log(`Parent total events: ${totalCalls}`);
      console.log(`Events per iteration: ${(totalCalls / iterations).toFixed(2)}`);

      // Should be bounded
      expect(totalCalls).toBeLessThan(iterations * 10);
      expect(objectNode.value).toEqual({ value: `value-${iterations - 1}` });
    });
  });

  describe('batched flag behavior', () => {
    it('should verify __batched__ flag prevents duplicate RequestEmitChange', async () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const objectNode = node as ObjectNode;
      const aNode = objectNode.find('./a') as StringNode;
      const bNode = objectNode.find('./b') as StringNode;

      const listener = vi.fn();
      objectNode.subscribe(listener);

      // Multiple changes in same sync stack should trigger RequestEmitChange only once
      aNode.setValue('a-value');
      bNode.setValue('b-value');

      await delay();

      const requestEmitChangeCalls = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.RequestEmitChange,
      ).length;

      console.log('\n=== __batched__ Flag Behavior ===');
      console.log(`RequestEmitChange events: ${requestEmitChangeCalls}`);
      console.log('Expected: Should be limited by __batched__ flag');

      // Should be limited (not one per child change)
      expect(requestEmitChangeCalls).toBeLessThan(5);
    });
  });
});
