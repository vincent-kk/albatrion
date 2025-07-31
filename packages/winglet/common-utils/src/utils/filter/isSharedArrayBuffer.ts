const SharedArrayBuffer = globalThis.SharedArrayBuffer;

/**
 * Determines whether a value is a SharedArrayBuffer with enhanced type safety.
 *
 * Provides reliable SharedArrayBuffer detection with environment compatibility,
 * identifying shared memory buffer objects used for multi-threaded JavaScript
 * applications in both browsers (Web Workers) and Node.js (worker_threads).
 * Returns false in environments where SharedArrayBuffer is not available.
 *
 * @param value - Value to test for SharedArrayBuffer type
 * @returns Type-safe boolean indicating whether the value is a SharedArrayBuffer
 *
 * @example
 * Basic SharedArrayBuffer detection:
 * ```typescript
 * import { isSharedArrayBuffer } from '@winglet/common-utils';
 *
 * // True cases - SharedArrayBuffer instances (if supported)
 * if (typeof SharedArrayBuffer !== 'undefined') {
 *   console.log(isSharedArrayBuffer(new SharedArrayBuffer(16))); // true
 *   console.log(isSharedArrayBuffer(new SharedArrayBuffer(1024))); // true
 * }
 *
 * // False cases - not SharedArrayBuffer
 * console.log(isSharedArrayBuffer(new ArrayBuffer(16))); // false (regular ArrayBuffer)
 * console.log(isSharedArrayBuffer(new Uint8Array(16))); // false (TypedArray)
 * console.log(isSharedArrayBuffer(new DataView(new ArrayBuffer(16)))); // false (DataView)
 * console.log(isSharedArrayBuffer({})); // false (object)
 * console.log(isSharedArrayBuffer(null)); // false
 * console.log(isSharedArrayBuffer('buffer')); // false (string)
 *
 * // Environment without SharedArrayBuffer support
 * // (older browsers, restricted contexts)
 * console.log(isSharedArrayBuffer(anything)); // always false
 * ```
 *
 * @example
 * Multi-threaded application setup:
 * ```typescript
 * interface WorkerMessage {
 *   type: 'INIT' | 'PROCESS' | 'RESULT';
 *   buffer?: unknown;
 *   data?: any;
 * }
 *
 * function setupSharedMemoryWorker() {
 *   if (typeof SharedArrayBuffer === 'undefined') {
 *     throw new Error('SharedArrayBuffer not supported in this environment');
 *   }
 *
 *   const sharedBuffer = new SharedArrayBuffer(1024);
 *   const worker = new Worker('worker.js');
 *
 *   worker.postMessage({
 *     type: 'INIT',
 *     buffer: sharedBuffer
 *   });
 *
 *   return { worker, sharedBuffer };
 * }
 *
 * function handleWorkerMessage(message: WorkerMessage) {
 *   if (message.type === 'INIT' && isSharedArrayBuffer(message.buffer)) {
 *     // TypeScript knows buffer is SharedArrayBuffer
 *     console.log(`Shared buffer initialized: ${message.buffer.byteLength} bytes`);
 *
 *     // Safe to create views
 *     const int32View = new Int32Array(message.buffer);
 *     const uint8View = new Uint8Array(message.buffer);
 *
 *     return { int32View, uint8View };
 *   }
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Cross-origin isolation check:
 * ```typescript
 * function checkSharedArrayBufferSupport() {
 *   const support = {
 *     available: typeof SharedArrayBuffer !== 'undefined',
 *     crossOriginIsolated: globalThis.crossOriginIsolated || false,
 *     secureContext: globalThis.isSecureContext || false
 *   };
 *
 *   if (!support.available) {
 *     console.warn('SharedArrayBuffer not available');
 *     return support;
 *   }
 *
 *   if (!support.crossOriginIsolated) {
 *     console.warn('SharedArrayBuffer requires cross-origin isolation');
 *   }
 *
 *   return support;
 * }
 *
 * function createSharedBuffer(size: number): SharedArrayBuffer | null {
 *   const support = checkSharedArrayBufferSupport();
 *
 *   if (!support.available || !support.crossOriginIsolated) {
 *     return null;
 *   }
 *
 *   const buffer = new SharedArrayBuffer(size);
 *
 *   if (isSharedArrayBuffer(buffer)) {
 *     console.log(`Created shared buffer: ${buffer.byteLength} bytes`);
 *     return buffer;
 *   }
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Atomic operations with shared memory:
 * ```typescript
 * interface SharedCounter {
 *   buffer: SharedArrayBuffer;
 *   view: Int32Array;
 * }
 *
 * function createSharedCounter(): SharedCounter | null {
 *   if (typeof SharedArrayBuffer === 'undefined') {
 *     console.error('SharedArrayBuffer not supported');
 *     return null;
 *   }
 *
 *   const buffer = new SharedArrayBuffer(4); // 4 bytes for one Int32
 *
 *   if (!isSharedArrayBuffer(buffer)) {
 *     console.error('Failed to create SharedArrayBuffer');
 *     return null;
 *   }
 *
 *   const view = new Int32Array(buffer);
 *   Atomics.store(view, 0, 0); // Initialize counter to 0
 *
 *   return { buffer, view };
 * }
 *
 * function incrementSharedCounter(counter: SharedCounter): number {
 *   if (!isSharedArrayBuffer(counter.buffer)) {
 *     throw new Error('Invalid shared buffer');
 *   }
 *
 *   // Atomic increment operation
 *   return Atomics.add(counter.view, 0, 1) + 1;
 * }
 *
 * function getSharedCounterValue(counter: SharedCounter): number {
 *   if (!isSharedArrayBuffer(counter.buffer)) {
 *     throw new Error('Invalid shared buffer');
 *   }
 *
 *   return Atomics.load(counter.view, 0);
 * }
 * ```
 *
 * @example
 * Worker communication with shared memory:
 * ```typescript
 * // Main thread
 * class SharedMemoryManager {
 *   private sharedBuffers = new Map<string, SharedArrayBuffer>();
 *
 *   createBuffer(id: string, size: number): boolean {
 *     if (typeof SharedArrayBuffer === 'undefined') {
 *       console.error('SharedArrayBuffer not supported');
 *       return false;
 *     }
 *
 *     const buffer = new SharedArrayBuffer(size);
 *
 *     if (isSharedArrayBuffer(buffer)) {
 *       this.sharedBuffers.set(id, buffer);
 *       return true;
 *     }
 *
 *     return false;
 *   }
 *
 *   getBuffer(id: string): SharedArrayBuffer | null {
 *     const buffer = this.sharedBuffers.get(id);
 *     return isSharedArrayBuffer(buffer) ? buffer : null;
 *   }
 *
 *   shareWithWorker(worker: Worker, bufferId: string): boolean {
 *     const buffer = this.getBuffer(bufferId);
 *
 *     if (!buffer) {
 *       return false;
 *     }
 *
 *     worker.postMessage({
 *       type: 'SHARED_BUFFER',
 *       id: bufferId,
 *       buffer
 *     });
 *
 *     return true;
 *   }
 * }
 *
 * // Worker thread (worker.js)
 * self.onmessage = function(event) {
 *   const { type, id, buffer } = event.data;
 *
 *   if (type === 'SHARED_BUFFER' && isSharedArrayBuffer(buffer)) {
 *     console.log(`Worker received shared buffer ${id}: ${buffer.byteLength} bytes`);
 *
 *     // Process data in shared memory
 *     const view = new Uint8Array(buffer);
 *     for (let i = 0; i < view.length; i++) {
 *       view[i] = i % 256; // Fill with test data
 *     }
 *
 *     self.postMessage({ type: 'BUFFER_PROCESSED', id });
 *   }
 * };
 * ```
 *
 * @example
 * Environment capability detection:
 * ```typescript
 * interface EnvironmentCapabilities {
 *   sharedArrayBuffer: boolean;
 *   atomics: boolean;
 *   crossOriginIsolated: boolean;
 *   workers: boolean;
 * }
 *
 * function detectEnvironmentCapabilities(): EnvironmentCapabilities {
 *   return {
 *     sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
 *     atomics: typeof Atomics !== 'undefined',
 *     crossOriginIsolated: globalThis.crossOriginIsolated || false,
 *     workers: typeof Worker !== 'undefined'
 *   };
 * }
 *
 * function validateSharedMemoryEnvironment(): string[] {
 *   const errors: string[] = [];
 *   const caps = detectEnvironmentCapabilities();
 *
 *   if (!caps.sharedArrayBuffer) {
 *     errors.push('SharedArrayBuffer not supported');
 *   }
 *
 *   if (!caps.atomics) {
 *     errors.push('Atomics not supported');
 *   }
 *
 *   if (!caps.crossOriginIsolated) {
 *     errors.push('Cross-origin isolation required for SharedArrayBuffer');
 *   }
 *
 *   if (!caps.workers) {
 *     errors.push('Web Workers not supported');
 *   }
 *
 *   return errors;
 * }
 *
 * // Usage
 * const validationErrors = validateSharedMemoryEnvironment();
 * if (validationErrors.length > 0) {
 *   console.warn('Shared memory features unavailable:', validationErrors);
 * } else {
 *   console.log('Environment supports shared memory operations');
 * }
 * ```
 *
 * @example
 * Node.js worker_threads usage:
 * ```typescript
 * // main-thread.js (Node.js)
 * import { Worker, isMainThread, parentPort } from 'worker_threads';
 * import { isSharedArrayBuffer } from '@winglet/common-utils';
 *
 * if (isMainThread) {
 *   // Main thread
 *   const sharedBuffer = new SharedArrayBuffer(1024);
 *   if (isSharedArrayBuffer(sharedBuffer)) {
 *     const worker = new Worker(__filename, {
 *       workerData: { sharedBuffer }
 *     });
 *
 *     worker.postMessage({ type: 'process', buffer: sharedBuffer });
 *   }
 * } else {
 *   // Worker thread
 *   parentPort?.on('message', ({ type, buffer }) => {
 *     if (type === 'process' && isSharedArrayBuffer(buffer)) {
 *       // Safe to use shared buffer in worker thread
 *       const view = new Int32Array(buffer);
 *       Atomics.store(view, 0, 42);
 *       parentPort?.postMessage({ done: true });
 *     }
 *   });
 * }
 * ```
 *
 * @remarks
 * **Environment Requirements:**
 * - **Browsers**: Requires cross-origin isolation (COOP/COEP headers) and HTTPS
 * - **Node.js**: Supported since v10.5.0 with worker_threads module
 * - Not available in all browsers or restricted environments
 * - May be disabled due to Spectre vulnerability mitigations
 *
 * **Security Considerations:**
 * - SharedArrayBuffer was temporarily disabled due to Spectre vulnerabilities
 * - Requires proper security headers: Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy
 * - Only available in secure contexts (HTTPS)
 *
 * **Use Cases:**
 * - Multi-threaded JavaScript applications (Web Workers, worker_threads)
 * - High-performance computing in browsers
 * - Real-time data processing with workers
 * - Shared state between worker threads
 * - Atomic operations for thread synchronization
 * - Node.js multi-core processing pipelines
 *
 * **Performance:** Direct instanceof check with environment validation provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isArrayBuffer()` for regular ArrayBuffer detection
 * - Use `isTypedArray()` for TypedArray views
 * - Use `isDataView()` for DataView objects
 * - Check `typeof SharedArrayBuffer !== 'undefined'` for environment support
 */
export const isSharedArrayBuffer = (
  value: unknown,
): value is SharedArrayBuffer =>
  // Check if the SharedArrayBuffer constructor exists and
  // verify if the value is an instance of SharedArrayBuffer.
  SharedArrayBuffer !== undefined && value instanceof SharedArrayBuffer;
