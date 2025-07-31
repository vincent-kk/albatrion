/**
 * Determines whether a value is an ArrayBuffer with enhanced type safety.
 *
 * Provides reliable ArrayBuffer detection using instanceof check for
 * identifying binary data buffer objects used in low-level operations
 * and WebAPI interactions.
 *
 * @param value - Value to test for ArrayBuffer type
 * @returns Type-safe boolean indicating whether the value is an ArrayBuffer
 *
 * @example
 * Basic ArrayBuffer detection:
 * ```typescript
 * import { isArrayBuffer } from '@winglet/common-utils';
 *
 * const buffer = new ArrayBuffer(16);
 * const uint8Array = new Uint8Array(16);
 * const regularArray = [1, 2, 3];
 *
 * console.log(isArrayBuffer(buffer)); // true
 * console.log(isArrayBuffer(uint8Array.buffer)); // true
 * console.log(isArrayBuffer(uint8Array)); // false (typed array, not ArrayBuffer)
 * console.log(isArrayBuffer(regularArray)); // false
 * console.log(isArrayBuffer('binary data')); // false
 * console.log(isArrayBuffer(null)); // false
 * ```
 *
 * @example
 * File processing with ArrayBuffer:
 * ```typescript
 * function processFileData(data: unknown) {
 *   if (isArrayBuffer(data)) {
 *     // TypeScript knows data is ArrayBuffer
 *     console.log(`Processing ${data.byteLength} bytes`);
 *     
 *     // Safe to create typed array views
 *     const uint8View = new Uint8Array(data);
 *     const dataView = new DataView(data);
 *     
 *     return { uint8View, dataView };
 *   }
 *   
 *   throw new Error('Expected ArrayBuffer for binary data processing');
 * }
 * ```
 *
 * @example
 * WebAPI integration:
 * ```typescript
 * async function handleFileUpload(file: File) {
 *   const buffer = await file.arrayBuffer();
 *   
 *   if (isArrayBuffer(buffer)) {
 *     // Process binary file data
 *     const bytes = new Uint8Array(buffer);
 *     return processImageData(bytes);
 *   }
 * }
 * ```
 *
 * @remarks
 * **Use Cases:**
 * - Binary data validation before processing
 * - WebAPI response validation (fetch, FileReader)
 * - Low-level data manipulation guards
 * - Memory buffer validation
 *
 * **Related Types:**
 * - Use `isTypedArray()` for Uint8Array, Int32Array etc.
 * - Use `isDataView()` for DataView objects
 * - Use `isBuffer()` for Node.js Buffer objects
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 */
export const isArrayBuffer = (value: unknown): value is ArrayBuffer =>
  value instanceof ArrayBuffer;