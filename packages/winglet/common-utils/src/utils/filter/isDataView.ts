/**
 * Determines whether a value is a DataView with enhanced type safety.
 *
 * Provides reliable DataView detection using instanceof check for
 * identifying binary data view objects used for reading and writing
 * binary data in ArrayBuffers with specific endianness control.
 *
 * @param value - Value to test for DataView type
 * @returns Type-safe boolean indicating whether the value is a DataView
 *
 * @example
 * Basic DataView detection:
 * ```typescript
 * import { isDataView } from '@winglet/common-utils';
 *
 * const buffer = new ArrayBuffer(16);
 * const dataView = new DataView(buffer);
 * const uint8Array = new Uint8Array(buffer);
 *
 * console.log(isDataView(dataView)); // true
 * console.log(isDataView(buffer)); // false (ArrayBuffer, not DataView)
 * console.log(isDataView(uint8Array)); // false (TypedArray, not DataView)
 * console.log(isDataView({})); // false
 * console.log(isDataView(null)); // false
 * ```
 *
 * @example
 * Binary data processing with DataView:
 * ```typescript
 * function processBinaryData(data: unknown) {
 *   if (isDataView(data)) {
 *     // TypeScript knows data is DataView
 *     console.log(`DataView with ${data.byteLength} bytes`);
 *     
 *     // Safe to use DataView methods
 *     if (data.byteLength >= 4) {
 *       const int32Value = data.getInt32(0, true); // little-endian
 *       const float32Value = data.getFloat32(0, false); // big-endian
 *       
 *       return { int32Value, float32Value };
 *     }
 *   }
 *   
 *   throw new Error('Expected DataView for binary data processing');
 * }
 * ```
 *
 * @example
 * Multi-format binary reader:
 * ```typescript
 * function readBinaryHeader(view: unknown) {
 *   if (!isDataView(view)) {
 *     throw new Error('Binary header requires DataView');
 *   }
 *   
 *   // Read various data types with endianness control
 *   return {
 *     magic: view.getUint32(0, true),        // 4 bytes, little-endian
 *     version: view.getUint16(4, true),     // 2 bytes, little-endian
 *     flags: view.getUint8(6),              // 1 byte
 *     timestamp: view.getBigUint64(8, true), // 8 bytes, little-endian
 *     checksum: view.getUint32(16, false)   // 4 bytes, big-endian
 *   };
 * }
 * ```
 *
 * @example
 * File format validation:
 * ```typescript
 * async function validateBinaryFile(file: File) {
 *   const buffer = await file.arrayBuffer();
 *   const view = new DataView(buffer);
 *   
 *   if (isDataView(view)) {
 *     // Check file signature
 *     const signature = view.getUint32(0, false);
 *     
 *     switch (signature) {
 *       case 0x89504E47: // PNG
 *         return 'PNG image';
 *       case 0x47494638: // GIF
 *         return 'GIF image';
 *       case 0xFFD8FFE0: // JPEG
 *         return 'JPEG image';
 *       default:
 *         return 'Unknown format';
 *     }
 *   }
 *   
 *   return 'Invalid binary data';
 * }
 * ```
 *
 * @example
 * Network protocol parsing:
 * ```typescript
 * interface PacketHeader {
 *   type: number;
 *   length: number;
 *   sequenceId: number;
 *   checksum: number;
 * }
 *
 * function parsePacketHeader(data: unknown): PacketHeader | null {
 *   if (!isDataView(data) || data.byteLength < 10) {
 *     return null;
 *   }
 *   
 *   return {
 *     type: data.getUint8(0),
 *     length: data.getUint16(1, true),
 *     sequenceId: data.getUint32(3, true),
 *     checksum: data.getUint16(7, true)
 *   };
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - Provides endianness control (little/big endian)
 * - Supports all numeric types (Int8, Uint16, Float32, BigInt64, etc.)
 * - Allows unaligned memory access
 * - Works with any offset within the underlying ArrayBuffer
 *
 * **Use Cases:**
 * - Binary file format parsing
 * - Network protocol implementation
 * - Low-level data manipulation
 * - Cross-platform binary data exchange
 * - Endianness-sensitive operations
 *
 * **Related Types:**
 * - Use `isArrayBuffer()` for the underlying buffer
 * - Use `isTypedArray()` for typed array views
 * - Use `isBuffer()` for Node.js Buffer objects
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 */
export const isDataView = (value: unknown): value is DataView =>
  value instanceof DataView;