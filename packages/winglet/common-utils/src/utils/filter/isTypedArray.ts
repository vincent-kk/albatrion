/**
 * Determines whether a value is a TypedArray with enhanced type safety.
 *
 * Provides reliable TypedArray detection using ArrayBuffer.isView() combined
 * with DataView exclusion, identifying all TypedArray variants including
 * Uint8Array, Int32Array, Float64Array, and others used for binary data processing.
 *
 * @template T - Expected TypedArray type extending TypedArray
 * @param value - Value to test for TypedArray type
 * @returns Type-safe boolean indicating whether the value is a TypedArray
 *
 * @example
 * Basic TypedArray detection:
 * ```typescript
 * import { isTypedArray } from '@winglet/common-utils';
 *
 * // True cases - TypedArray instances
 * console.log(isTypedArray(new Uint8Array(10))); // true
 * console.log(isTypedArray(new Int32Array([1, 2, 3]))); // true
 * console.log(isTypedArray(new Float64Array(5))); // true
 * console.log(isTypedArray(new Uint8ClampedArray(256))); // true
 * console.log(isTypedArray(new BigInt64Array(4))); // true
 *
 * const buffer = new ArrayBuffer(16);
 * console.log(isTypedArray(new Int16Array(buffer))); // true
 *
 * // False cases - not TypedArray
 * console.log(isTypedArray(new ArrayBuffer(16))); // false (ArrayBuffer)
 * console.log(isTypedArray(new DataView(buffer))); // false (DataView)
 * console.log(isTypedArray([1, 2, 3])); // false (regular array)
 * console.log(isTypedArray('bytes')); // false (string)
 * console.log(isTypedArray(null)); // false
 * console.log(isTypedArray({})); // false (object)
 * ```
 *
 * @example
 * Binary data processing:
 * ```typescript
 * function processBinaryData(data: unknown) {
 *   if (!isTypedArray(data)) {
 *     throw new Error('Expected TypedArray for binary processing');
 *   }
 *
 *   // TypeScript knows data is TypedArray
 *   console.log(`Processing ${data.constructor.name} with ${data.length} elements`);
 *   console.log(`Byte length: ${data.byteLength}`);
 *   console.log(`Bytes per element: ${data.BYTES_PER_ELEMENT}`);
 *
 *   return {
 *     type: data.constructor.name,
 *     length: data.length,
 *     byteLength: data.byteLength,
 *     bytesPerElement: data.BYTES_PER_ELEMENT
 *   };
 * }
 * ```
 *
 * @remarks
 * **TypedArray Types Detected:**
 * - Int8Array, Uint8Array, Uint8ClampedArray
 * - Int16Array, Uint16Array
 * - Int32Array, Uint32Array
 * - Float32Array, Float64Array
 * - BigInt64Array, BigUint64Array
 *
 * **Detection Method:**
 * - Uses `ArrayBuffer.isView()` to check for buffer views
 * - Excludes DataView instances (which are also buffer views)
 * - More reliable than individual instanceof checks
 *
 * **Use Cases:**
 * - Binary data processing
 * - File format parsing
 * - Image/audio data manipulation
 * - Network protocol handling
 * - WebGL/graphics programming
 * - Performance-critical numeric computation
 *
 * **Performance:** Efficient native method calls provide optimal performance.
 *
 * **Related Functions:**
 * - Use `isArrayBuffer()` for ArrayBuffer detection
 * - Use `isDataView()` for DataView detection
 * - Use `isArray()` for regular array detection
 */
export const isTypedArray = <T extends TypedArray>(
  value: unknown,
): value is T => ArrayBuffer.isView(value) && !(value instanceof DataView);

/**
 * Union type representing all TypedArray types.
 *
 * Includes all standard TypedArray implementations:
 * - Signed integer arrays: Int8Array, Int16Array, Int32Array, BigInt64Array
 * - Unsigned integer arrays: Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, BigUint64Array
 * - Floating point arrays: Float32Array, Float64Array
 */
export type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | Float32Array
  | Float64Array;
