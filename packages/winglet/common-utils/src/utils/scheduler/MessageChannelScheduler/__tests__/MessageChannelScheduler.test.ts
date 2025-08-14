import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MessageChannelScheduler } from '../MessageChannelScheduler';
import {
  cancelAll,
  clearImmediate,
  destroyGlobalScheduler,
  getPendingCount,
  isPending,
  setImmediate,
} from '../handler';

describe('MessageChannelScheduler', () => {
  let scheduler: MessageChannelScheduler;

  beforeEach(() => {
    // Reset singleton instance and global scheduler
    (MessageChannelScheduler as any).__instance__ = null;
    destroyGlobalScheduler();
  });

  afterEach(() => {
    if (scheduler && !scheduler.destroyed) {
      scheduler.destroy();
    }
    destroyGlobalScheduler();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = MessageChannelScheduler.getInstance();
      const instance2 = MessageChannelScheduler.getInstance();
      expect(instance1).toBe(instance2);
      instance1.destroy();
    });

    it('should create new instance after destroy', () => {
      const instance1 = MessageChannelScheduler.getInstance();
      instance1.destroy();
      const instance2 = MessageChannelScheduler.getInstance();
      expect(instance1).not.toBe(instance2);
      instance2.destroy();
    });

    it('should handle real singleton instance with real options', () => {
      const instance1 = MessageChannelScheduler.getInstance({
        maxPendingTasks: 100,
      });
      const instance2 = MessageChannelScheduler.getInstance({
        maxPendingTasks: 200,
      });

      expect(instance1).toBe(instance2);
      // Options from first creation should be used
      expect(() => {
        for (let i = 0; i < 101; i++) {
          instance1.schedule(() => {});
        }
      }).toThrow('Max tasks exceeded: 100');

      instance1.destroy();
    });
  });

  describe('Real Data Execution Tests', () => {
    it('should execute real tasks with actual data processing', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const results: number[] = [];
      const taskCount = 10;

      for (let i = 0; i < taskCount; i++) {
        const capturedIndex = i;
        scheduler.schedule(() => {
          // Real computation work
          const computed =
            capturedIndex * capturedIndex + Math.sqrt(capturedIndex);
          results.push(computed);
        });
      }

      // Wait for all macro tasks to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(results.length).toBe(taskCount);
      // Verify actual computation results
      results.forEach((result, index) => {
        const expected = index * index + Math.sqrt(index);
        expect(result).toBeCloseTo(expected, 10);
      });
    });

    it('should handle complex object manipulation in tasks', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const dataStore: Record<string, any> = {};
      const operations: Array<{ type: string; key: string; value?: any }> = [
        { type: 'set', key: 'user', value: { id: 1, name: 'Test User' } },
        { type: 'set', key: 'config', value: { theme: 'dark', lang: 'en' } },
        { type: 'update', key: 'user', value: { age: 25 } },
        { type: 'delete', key: 'config' },
        { type: 'set', key: 'metrics', value: { views: 100, clicks: 50 } },
      ];

      operations.forEach((op) => {
        scheduler.schedule(() => {
          switch (op.type) {
            case 'set':
              dataStore[op.key] = op.value;
              break;
            case 'update':
              dataStore[op.key] = { ...dataStore[op.key], ...op.value };
              break;
            case 'delete':
              delete dataStore[op.key];
              break;
          }
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(dataStore.user).toEqual({ id: 1, name: 'Test User', age: 25 });
      expect(dataStore.config).toBeUndefined();
      expect(dataStore.metrics).toEqual({ views: 100, clicks: 50 });
    });

    it('should handle async operations initiated from scheduled tasks', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const asyncResults: string[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 0; i < 5; i++) {
        const index = i;
        scheduler.schedule(() => {
          const promise = (async () => {
            // Simulate async work
            await new Promise((resolve) => setTimeout(resolve, index * 5));
            asyncResults.push(`Task ${index} completed`);
          })();
          promises.push(promise);
        });
      }

      // Wait for macro tasks to start
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Wait for all async operations to complete
      await Promise.all(promises);

      expect(asyncResults.length).toBe(5);
      expect(asyncResults).toContain('Task 0 completed');
      expect(asyncResults).toContain('Task 4 completed');
    });
  });

  describe('Performance Comparison: MessageChannel vs setTimeout', () => {
    it('should measure execution latency comparison', async () => {
      const iterations = 100;
      const messageChannelTimings: number[] = [];
      const setTimeoutTimings: number[] = [];

      // Test MessageChannel latency
      for (let i = 0; i < iterations; i++) {
        await new Promise<void>((resolve) => {
          const start = performance.now();
          setImmediate(() => {
            messageChannelTimings.push(performance.now() - start);
            resolve();
          });
        });
      }

      // Test setTimeout(0) latency
      for (let i = 0; i < iterations; i++) {
        await new Promise<void>((resolve) => {
          const start = performance.now();
          setTimeout(() => {
            setTimeoutTimings.push(performance.now() - start);
            resolve();
          }, 0);
        });
      }

      const avgMessageChannel =
        messageChannelTimings.reduce((a, b) => a + b, 0) / iterations;
      const avgSetTimeout =
        setTimeoutTimings.reduce((a, b) => a + b, 0) / iterations;

      console.log(
        `\n=== Performance Comparison (${iterations} iterations) ===`,
      );
      console.log(
        `MessageChannel avg latency: ${avgMessageChannel.toFixed(3)}ms`,
      );
      console.log(`setTimeout(0) avg latency: ${avgSetTimeout.toFixed(3)}ms`);
      console.log(
        `Speedup: ${(avgSetTimeout / avgMessageChannel).toFixed(2)}x`,
      );

      // MessageChannel should generally be faster or comparable
      expect(avgMessageChannel).toBeLessThanOrEqual(avgSetTimeout * 1.5);
    });

    it('should compare batch task scheduling performance', async () => {
      const batchSize = 1000;
      let messageChannelCompleted = 0;
      let setTimeoutCompleted = 0;

      // Batch schedule with MessageChannel
      const mcStart = performance.now();
      const mcPromise = new Promise<number>((resolve) => {
        for (let i = 0; i < batchSize; i++) {
          setImmediate(() => {
            messageChannelCompleted++;
            if (messageChannelCompleted === batchSize) {
              resolve(performance.now() - mcStart);
            }
          });
        }
      });

      const mcTime = await mcPromise;

      // Batch schedule with setTimeout
      const stStart = performance.now();
      const stPromise = new Promise<number>((resolve) => {
        for (let i = 0; i < batchSize; i++) {
          setTimeout(() => {
            setTimeoutCompleted++;
            if (setTimeoutCompleted === batchSize) {
              resolve(performance.now() - stStart);
            }
          }, 0);
        }
      });

      const stTime = await stPromise;

      console.log(`\n=== Batch Scheduling (${batchSize} tasks) ===`);
      console.log(`MessageChannel total time: ${mcTime.toFixed(2)}ms`);
      console.log(`setTimeout(0) total time: ${stTime.toFixed(2)}ms`);
      console.log(`Speedup: ${(stTime / mcTime).toFixed(2)}x`);

      expect(messageChannelCompleted).toBe(batchSize);
      expect(setTimeoutCompleted).toBe(batchSize);
    });

    it('should measure task execution order consistency', async () => {
      const executionOrder: string[] = [];

      // Schedule mixed macro tasks
      await Promise.resolve().then(() => {
        executionOrder.push('microtask-1');
      });

      setImmediate(() => {
        executionOrder.push('messageChannel-1');
      });

      setTimeout(() => {
        executionOrder.push('setTimeout-1');
      }, 0);

      setImmediate(() => {
        executionOrder.push('messageChannel-2');
      });

      setTimeout(() => {
        executionOrder.push('setTimeout-2');
      }, 0);

      await Promise.resolve().then(() => {
        executionOrder.push('microtask-2');
      });

      // Wait for all tasks
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log('\n=== Execution Order ===');
      console.log(executionOrder);

      // Microtasks should always execute first
      expect(executionOrder[0]).toBe('microtask-1');
      expect(executionOrder[1]).toBe('microtask-2');

      // Macro tasks should follow
      expect(executionOrder.slice(2)).toContain('messageChannel-1');
      expect(executionOrder.slice(2)).toContain('messageChannel-2');
      expect(executionOrder.slice(2)).toContain('setTimeout-1');
      expect(executionOrder.slice(2)).toContain('setTimeout-2');
    });
  });

  describe('Advanced Scheduling Patterns', () => {
    it('should handle high-frequency scheduling and cancellation', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const executed: number[] = [];
      const taskIds: number[] = [];

      // Schedule many tasks rapidly
      for (let i = 0; i < 100; i++) {
        const capturedIndex = i;
        const taskId = scheduler.schedule(() => {
          executed.push(capturedIndex);
        });
        taskIds.push(taskId);

        // Cancel every 3rd task
        if (i % 3 === 0) {
          scheduler.cancel(taskId);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have executed 2/3 of tasks (approximately)
      expect(executed.length).toBeGreaterThan(60);
      expect(executed.length).toBeLessThan(70);

      // Cancelled tasks should not be in executed array
      for (let i = 0; i < 100; i += 3) {
        expect(executed).not.toContain(i);
      }
    });

    it('should maintain performance under stress with real computations', async () => {
      scheduler = MessageChannelScheduler.getInstance({
        maxPendingTasks: 10000,
      });

      const taskCount = 5000;
      const results: number[] = [];
      const startTime = performance.now();

      for (let i = 0; i < taskCount; i++) {
        const index = i;
        scheduler.schedule(() => {
          // Real CPU work
          let sum = 0;
          for (let j = 0; j < 100; j++) {
            sum += Math.sqrt(index * j);
          }
          results.push(sum);
        });
      }

      // Wait for all tasks to complete
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (results.length === taskCount) {
            clearInterval(checkInterval);
            resolve(undefined);
          }
        }, 10);
      });

      const totalTime = performance.now() - startTime;
      const throughput = taskCount / (totalTime / 1000);

      console.log(`\n=== Stress Test (${taskCount} tasks) ===`);
      console.log(`Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`Throughput: ${throughput.toFixed(0)} tasks/second`);
      console.log(`Avg per task: ${(totalTime / taskCount).toFixed(3)}ms`);

      expect(results.length).toBe(taskCount);
      expect(throughput).toBeGreaterThan(1000); // Should handle > 1000 tasks/sec
    });
  });

  describe('Error Handling with Real Errors', () => {
    it('should handle and report real runtime errors', async () => {
      const errors: Array<{ error: Error; taskId: number }> = [];

      scheduler = MessageChannelScheduler.getInstance({
        onTaskError: (error, taskId) => {
          errors.push({ error, taskId });
        },
      });

      const taskId1 = scheduler.schedule(() => {
        throw new TypeError('Invalid type operation');
      });

      const taskId2 = scheduler.schedule(() => {
        // This will cause a real runtime error
        const obj: any = null;
        obj.nonExistentMethod();
      });

      scheduler.schedule(() => {
        // This runs successfully
        const result = 2 + 2;
        expect(result).toBe(4);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(errors.length).toBe(2);
      expect(errors[0].error).toBeInstanceOf(TypeError);
      expect(errors[0].error.message).toBe('Invalid type operation');
      expect(errors[0].taskId).toBe(taskId1);

      expect(errors[1].error).toBeInstanceOf(Error);
      expect(errors[1].taskId).toBe(taskId2);
    });

    it('should continue processing after errors', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const executed: string[] = [];

      scheduler.schedule(() => executed.push('before-error'));
      scheduler.schedule(() => {
        throw new Error('Intentional error');
      });
      scheduler.schedule(() => executed.push('after-error'));

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(executed).toEqual(['before-error', 'after-error']);
    });
  });

  describe('Global Handler Functions', () => {
    it('should work with global setImmediate/clearImmediate', async () => {
      const results: number[] = [];

      const id1 = setImmediate(() => results.push(1));
      const id2 = setImmediate(() => results.push(2));
      const id3 = setImmediate(() => results.push(3));

      // Cancel the middle one
      clearImmediate(id2);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(results).toEqual([1, 3]);
      expect(isPending(id1)).toBe(false);
      expect(isPending(id2)).toBe(false);
      expect(isPending(id3)).toBe(false);
    });

    it('should track pending count globally', async () => {
      expect(getPendingCount()).toBe(0);

      const ids: number[] = [];
      for (let i = 0; i < 5; i++) {
        ids.push(setImmediate(() => {}));
      }

      expect(getPendingCount()).toBe(5);

      clearImmediate(ids[0]);
      clearImmediate(ids[1]);

      expect(getPendingCount()).toBe(3);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getPendingCount()).toBe(0);
    });

    it('should handle cancelAll globally', () => {
      for (let i = 0; i < 10; i++) {
        setImmediate(() => {});
      }

      expect(getPendingCount()).toBe(10);

      const cancelled = cancelAll();
      expect(cancelled).toBe(10);
      expect(getPendingCount()).toBe(0);
    });
  });

  describe('Macro Task Timing Analysis', () => {
    it('should measure precise timing between macro task executions', async () => {
      const timings: number[] = [];
      let lastTime = performance.now();

      for (let i = 0; i < 20; i++) {
        await new Promise<void>((resolve) => {
          setImmediate(() => {
            const currentTime = performance.now();
            const delta = currentTime - lastTime;
            if (i > 0) {
              // Skip first iteration
              timings.push(delta);
            }
            lastTime = currentTime;
            resolve();
          });
        });
      }

      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const minTiming = Math.min(...timings);
      const maxTiming = Math.max(...timings);

      console.log('\n=== Macro Task Timing Intervals ===');
      console.log(`Average interval: ${avgTiming.toFixed(3)}ms`);
      console.log(`Min interval: ${minTiming.toFixed(3)}ms`);
      console.log(`Max interval: ${maxTiming.toFixed(3)}ms`);

      // Macro tasks should have some minimal interval
      expect(minTiming).toBeGreaterThan(0);
      expect(avgTiming).toBeLessThan(10); // Should be relatively fast
    });

    it('should compare timing consistency between schedulers', async () => {
      const messageChannelDeltas: number[] = [];
      const setTimeoutDeltas: number[] = [];

      // Measure MessageChannel timing consistency
      let mcLastTime = performance.now();
      for (let i = 0; i < 10; i++) {
        await new Promise<void>((resolve) => {
          setImmediate(() => {
            const currentTime = performance.now();
            if (i > 0) {
              messageChannelDeltas.push(currentTime - mcLastTime);
            }
            mcLastTime = currentTime;
            resolve();
          });
        });
      }

      // Measure setTimeout timing consistency
      let stLastTime = performance.now();
      for (let i = 0; i < 10; i++) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            const currentTime = performance.now();
            if (i > 0) {
              setTimeoutDeltas.push(currentTime - stLastTime);
            }
            stLastTime = currentTime;
            resolve();
          }, 0);
        });
      }

      const mcVariance = calculateVariance(messageChannelDeltas);
      const stVariance = calculateVariance(setTimeoutDeltas);

      console.log('\n=== Timing Consistency Analysis ===');
      console.log(`MessageChannel variance: ${mcVariance.toFixed(3)}`);
      console.log(`setTimeout variance: ${stVariance.toFixed(3)}`);
      console.log(
        `MessageChannel std dev: ${Math.sqrt(mcVariance).toFixed(3)}ms`,
      );
      console.log(`setTimeout std dev: ${Math.sqrt(stVariance).toFixed(3)}ms`);

      // Both should have reasonable consistency
      expect(Math.sqrt(mcVariance)).toBeLessThan(5);
      expect(Math.sqrt(stVariance)).toBeLessThan(5);
    });

    it('should verify macro task executes after all microtasks', async () => {
      const executionLog: string[] = [];

      // Schedule macro task
      setImmediate(() => {
        executionLog.push('macro-task');

        // Schedule microtask from within macro task
        Promise.resolve().then(() => {
          executionLog.push('nested-microtask');
        });
      });

      // Schedule multiple microtasks
      for (let i = 0; i < 5; i++) {
        await Promise.resolve().then(() => {
          executionLog.push(`microtask-${i}`);
        });
      }

      // Wait for all tasks
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log('\n=== Microtask vs Macrotask Order ===');
      console.log(executionLog);

      // All initial microtasks should execute before macro task
      const macroIndex = executionLog.indexOf('macro-task');
      for (let i = 0; i < 5; i++) {
        const microIndex = executionLog.indexOf(`microtask-${i}`);
        expect(microIndex).toBeLessThan(macroIndex);
      }

      // Nested microtask should come after macro task
      const nestedIndex = executionLog.indexOf('nested-microtask');
      expect(nestedIndex).toBeGreaterThan(macroIndex);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should properly clean up resources after task execution', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const bigData: string[] = [];
      const dataSize = 1000;

      // Create tasks with large data references
      for (let i = 0; i < 100; i++) {
        const localData = new Array(dataSize).fill(`data-${i}`);
        scheduler.schedule(() => {
          // Process data
          const processed = localData.map((item) => item.toUpperCase());
          bigData.push(processed[0]);
        });
      }

      expect(scheduler.getPendingCount()).toBe(100);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(scheduler.getPendingCount()).toBe(0);
      expect(bigData.length).toBe(100);

      // Verify all data was processed correctly
      bigData.forEach((item, index) => {
        expect(item).toBe(`DATA-${index}`);
      });
    });

    it('should handle proper cleanup on destroy with pending tasks', () => {
      scheduler = MessageChannelScheduler.getInstance();

      // Schedule many tasks
      for (let i = 0; i < 1000; i++) {
        scheduler.schedule(() => {
          // These should never execute
          throw new Error('Should not execute');
        });
      }

      expect(scheduler.getPendingCount()).toBe(1000);

      // Destroy immediately
      scheduler.destroy();

      expect(scheduler.destroyed).toBe(true);
      expect(scheduler.getPendingCount()).toBe(0);
    });
  });

  describe('Browser Environment Performance Comparison', () => {
    it('should compare MessageChannel vs setTimeout vs scheduleMacrotask in browser-like conditions', async () => {
      const iterations = 50;

      // Test individual task latency - 실제 브라우저와 유사한 조건
      const messageChannelTimings: number[] = [];
      const setTimeoutTimings: number[] = [];
      const scheduleMacrotaskTimings: number[] = [];

      console.log('\n=== Browser-like Individual Task Latency Test ===');

      // MessageChannel (setImmediate) latency
      for (let i = 0; i < iterations; i++) {
        await new Promise<void>((resolve) => {
          const start = performance.now();
          setImmediate(() => {
            messageChannelTimings.push(performance.now() - start);
            resolve();
          });
        });
        // 브라우저와 유사한 조건을 위해 약간의 지연 추가
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // setTimeout(0) latency
      for (let i = 0; i < iterations; i++) {
        await new Promise<void>((resolve) => {
          const start = performance.now();
          setTimeout(() => {
            setTimeoutTimings.push(performance.now() - start);
            resolve();
          }, 0);
        });
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // scheduleMacrotask latency (현재 환경에 따라 setImmediate 또는 setTimeout)
      const { scheduleMacrotask } = await import('../../scheduleMacrotask');
      for (let i = 0; i < iterations; i++) {
        await new Promise<void>((resolve) => {
          const start = performance.now();
          scheduleMacrotask(() => {
            scheduleMacrotaskTimings.push(performance.now() - start);
            resolve();
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      const avgMessageChannel =
        messageChannelTimings.reduce((a, b) => a + b, 0) / iterations;
      const avgSetTimeout =
        setTimeoutTimings.reduce((a, b) => a + b, 0) / iterations;
      const avgScheduleMacrotask =
        scheduleMacrotaskTimings.reduce((a, b) => a + b, 0) / iterations;

      console.log(
        `MessageChannel (setImmediate) avg: ${avgMessageChannel.toFixed(3)}ms`,
      );
      console.log(`setTimeout(0) avg: ${avgSetTimeout.toFixed(3)}ms`);
      console.log(
        `scheduleMacrotask avg: ${avgScheduleMacrotask.toFixed(3)}ms`,
      );
      console.log(
        `MessageChannel speedup over setTimeout: ${(avgSetTimeout / avgMessageChannel).toFixed(2)}x`,
      );
      console.log(
        `MessageChannel speedup over scheduleMacrotask: ${(avgScheduleMacrotask / avgMessageChannel).toFixed(2)}x`,
      );

      // 결과 검증
      expect(avgMessageChannel).toBeLessThan(avgSetTimeout);
      expect(messageChannelTimings.length).toBe(iterations);
      expect(setTimeoutTimings.length).toBe(iterations);
      expect(scheduleMacrotaskTimings.length).toBe(iterations);
    });

    it('should demonstrate the 4ms setTimeout delay issue vs MessageChannel', async () => {
      const iterations = 20;

      console.log('\n=== 4ms setTimeout Delay vs MessageChannel Demo ===');

      // Test rapid sequential scheduling to trigger 4ms delay
      const setTimeoutDelays: number[] = [];
      const messageChannelDelays: number[] = [];

      // Rapid setTimeout scheduling
      const setTimeoutStart = performance.now();
      let setTimeoutCompleted = 0;

      for (let i = 0; i < iterations; i++) {
        const taskStart = performance.now();
        setTimeout(() => {
          setTimeoutDelays.push(performance.now() - taskStart);
          setTimeoutCompleted++;
        }, 0);
      }

      // Wait for setTimeout tasks to complete
      while (setTimeoutCompleted < iterations) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      const setTimeoutTotal = performance.now() - setTimeoutStart;

      // Rapid MessageChannel scheduling
      const messageChannelStart = performance.now();
      let messageChannelCompleted = 0;

      for (let i = 0; i < iterations; i++) {
        const taskStart = performance.now();
        setImmediate(() => {
          messageChannelDelays.push(performance.now() - taskStart);
          messageChannelCompleted++;
        });
      }

      // Wait for MessageChannel tasks to complete
      while (messageChannelCompleted < iterations) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      const messageChannelTotal = performance.now() - messageChannelStart;

      const avgSetTimeoutDelay =
        setTimeoutDelays.reduce((a, b) => a + b, 0) / iterations;
      const avgMessageChannelDelay =
        messageChannelDelays.reduce((a, b) => a + b, 0) / iterations;

      console.log(`\nRapid Sequential Scheduling (${iterations} tasks):`);
      console.log(
        `setTimeout(0) - Total: ${setTimeoutTotal.toFixed(2)}ms, Avg per task: ${avgSetTimeoutDelay.toFixed(3)}ms`,
      );
      console.log(
        `MessageChannel - Total: ${messageChannelTotal.toFixed(2)}ms, Avg per task: ${avgMessageChannelDelay.toFixed(3)}ms`,
      );
      console.log(
        `Total time speedup: ${(setTimeoutTotal / messageChannelTotal).toFixed(2)}x`,
      );
      console.log(
        `Per-task speedup: ${(avgSetTimeoutDelay / avgMessageChannelDelay).toFixed(2)}x`,
      );

      // MessageChannel should be significantly faster in rapid scheduling
      expect(avgMessageChannelDelay).toBeLessThan(avgSetTimeoutDelay);
      expect(messageChannelTotal).toBeLessThan(setTimeoutTotal);
    });

    it('should show execution timing with mixed task types', async () => {
      const executionOrder: { type: string; timestamp: number }[] = [];
      const baseTime = performance.now();

      console.log('\n=== Mixed Task Execution Order ===');

      // Schedule various task types
      Promise.resolve().then(() => {
        executionOrder.push({
          type: 'Promise.resolve()',
          timestamp: performance.now() - baseTime,
        });
      });

      queueMicrotask(() => {
        executionOrder.push({
          type: 'queueMicrotask',
          timestamp: performance.now() - baseTime,
        });
      });

      setImmediate(() => {
        executionOrder.push({
          type: 'setImmediate (MessageChannel)',
          timestamp: performance.now() - baseTime,
        });
      });

      setTimeout(() => {
        executionOrder.push({
          type: 'setTimeout(0)',
          timestamp: performance.now() - baseTime,
        });
      }, 0);

      setTimeout(() => {
        executionOrder.push({
          type: 'setTimeout(1)',
          timestamp: performance.now() - baseTime,
        });
      }, 1);

      // Wait for all tasks
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log('Execution order with timestamps (ms from start):');
      executionOrder
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach(({ type, timestamp }) => {
          console.log(`  ${timestamp.toFixed(3)}ms: ${type}`);
        });

      // Verify microtasks execute before macrotasks
      const microtaskTasks = executionOrder.filter(
        (task) =>
          task.type.includes('Promise') || task.type.includes('queueMicrotask'),
      );
      const macrotaskTasks = executionOrder.filter(
        (task) =>
          task.type.includes('setImmediate') ||
          task.type.includes('setTimeout'),
      );

      if (microtaskTasks.length > 0 && macrotaskTasks.length > 0) {
        const lastMicrotask = Math.max(
          ...microtaskTasks.map((t) => t.timestamp),
        );
        const firstMacrotask = Math.min(
          ...macrotaskTasks.map((t) => t.timestamp),
        );
        expect(lastMicrotask).toBeLessThanOrEqual(firstMacrotask);
      }
    });
  });

  describe('Automatic Batch Optimization', () => {
    it('should transparently optimize regular schedule() calls with automatic batching', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const batchSize = 1000;
      let completed = 0;
      const results: number[] = [];

      const start = performance.now();

      // 기존 schedule() API를 사용하지만 내부적으로 배치 최적화
      for (let i = 0; i < batchSize; i++) {
        const capturedIndex = i;
        scheduler.schedule(() => {
          results.push(capturedIndex);
          completed++;
        });
      }

      // 모든 작업 완료 대기
      while (completed < batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      const totalTime = performance.now() - start;

      console.log(
        `\n=== Transparent Batch Optimization (${batchSize} tasks) ===`,
      );
      console.log(`Total time with auto-batching: ${totalTime.toFixed(2)}ms`);
      console.log(`Average per task: ${(totalTime / batchSize).toFixed(4)}ms`);
      console.log(
        `Throughput: ${Math.round(batchSize / (totalTime / 1000))} tasks/second`,
      );

      expect(completed).toBe(batchSize);
      expect(results).toHaveLength(batchSize);
      expect(results.sort((a, b) => a - b)).toEqual(
        Array.from({ length: batchSize }, (_, i) => i),
      );

      // 성능이 개선되어야 함 (배치 처리로 인해)
      expect(totalTime).toBeLessThan(50); // 1000개 작업이 50ms 이내
    });

    it('should maintain interface compatibility while providing performance benefits', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      // 기존 방식과 동일하게 사용할 수 있어야 함
      let executed = false;
      const taskId = scheduler.schedule(() => {
        executed = true;
      });

      expect(typeof taskId).toBe('number');
      expect(taskId).toBeGreaterThan(0);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(executed).toBe(true);
      expect(scheduler.isPending(taskId)).toBe(false);
    });

    it('should handle mixed single and batch scenarios correctly', async () => {
      scheduler = MessageChannelScheduler.getInstance();

      const results: string[] = [];

      // 단일 작업
      scheduler.schedule(() => {
        results.push('single-1');
      });

      // 약간의 지연 후 배치 작업들
      await new Promise((resolve) => setTimeout(resolve, 1));

      for (let i = 0; i < 5; i++) {
        scheduler.schedule(() => {
          results.push(`batch-${i}`);
        });
      }

      // 또 다른 단일 작업
      await new Promise((resolve) => setTimeout(resolve, 1));
      scheduler.schedule(() => {
        results.push('single-2');
      });

      // 모든 작업 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(results).toContain('single-1');
      expect(results).toContain('single-2');
      for (let i = 0; i < 5; i++) {
        expect(results).toContain(`batch-${i}`);
      }
      expect(results).toHaveLength(7);
    });

    it('should compare optimized schedule() performance vs setTimeout', async () => {
      const batchSize = 2000;

      // Test MessageChannel with automatic batching
      scheduler = MessageChannelScheduler.getInstance();
      let mcCompleted = 0;

      const mcStart = performance.now();
      for (let i = 0; i < batchSize; i++) {
        scheduler.schedule(() => {
          mcCompleted++;
        });
      }

      while (mcCompleted < batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      const mcTime = performance.now() - mcStart;

      // Test setTimeout batch (for comparison)
      let stCompleted = 0;

      const stStart = performance.now();
      for (let i = 0; i < batchSize; i++) {
        setTimeout(() => {
          stCompleted++;
        }, 0);
      }

      while (stCompleted < batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      const stTime = performance.now() - stStart;

      console.log(
        `\n=== Optimized schedule() vs setTimeout (${batchSize} tasks) ===`,
      );
      console.log(`MessageChannel (auto-batch): ${mcTime.toFixed(2)}ms`);
      console.log(`setTimeout batch: ${stTime.toFixed(2)}ms`);
      console.log(`Relative performance: ${(stTime / mcTime).toFixed(2)}x`);

      expect(mcCompleted).toBe(batchSize);
      expect(stCompleted).toBe(batchSize);
      // MessageChannel should be competitive with setTimeout
      expect(mcTime).toBeLessThan(stTime * 2); // At most 2x slower
    });
  });
});

// Helper function to calculate variance
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}
