const Buffer = globalThis.Buffer;

/**
 * Determines whether a value is a Node.js Buffer with enhanced type safety.
 *
 * Provides reliable Buffer detection with environment compatibility, identifying
 * Node.js Buffer objects used for binary data handling. Returns false in browser
 * environments where the global Buffer object is not defined.
 *
 * @param value - Value to test for Buffer type
 * @returns Type-safe boolean indicating whether the value is a Node.js Buffer
 *
 * @example
 * Basic Buffer detection:
 * ```typescript
 * import { isBuffer } from '@winglet/common-utils';
 *
 * // True cases - Buffer instances (in Node.js environment)
 * if (typeof Buffer !== 'undefined') {
 *   console.log(isBuffer(Buffer.from('hello'))); // true
 *   console.log(isBuffer(Buffer.from([1, 2, 3, 4]))); // true
 *   console.log(isBuffer(Buffer.alloc(10))); // true
 *   console.log(isBuffer(Buffer.allocUnsafe(16))); // true
 *   console.log(isBuffer(Buffer.from('data', 'utf8'))); // true
 * }
 *
 * // False cases - not Buffer objects
 * console.log(isBuffer(new Uint8Array([1, 2, 3]))); // false (TypedArray)
 * console.log(isBuffer(new ArrayBuffer(16))); // false (ArrayBuffer)
 * console.log(isBuffer('buffer data')); // false (string)
 * console.log(isBuffer([1, 2, 3])); // false (regular array)
 * console.log(isBuffer({ length: 4, 0: 1, 1: 2 })); // false (buffer-like object)
 * console.log(isBuffer(null)); // false
 * console.log(isBuffer(undefined)); // false
 *
 * // Browser environment without Buffer
 * console.log(isBuffer(anything)); // always false
 * ```
 *
 * @example
 * Cross-platform binary data handling:
 * ```typescript
 * interface BinaryDataHandler {
 *   processData(data: unknown): Promise<ProcessedData>;
 * }
 *
 * interface ProcessedData {
 *   success: boolean;
 *   type: 'buffer' | 'typedarray' | 'arraybuffer' | 'unknown';
 *   size: number;
 *   content?: string;
 *   error?: string;
 * }
 *
 * class UniversalBinaryHandler implements BinaryDataHandler {
 *   async processData(data: unknown): Promise<ProcessedData> {
 *     if (isBuffer(data)) {
 *       // Node.js Buffer handling
 *       return {
 *         success: true,
 *         type: 'buffer',
 *         size: data.length,
 *         content: data.toString('hex')
 *       };
 *     }
 *
 *     if (data instanceof Uint8Array) {
 *       return {
 *         success: true,
 *         type: 'typedarray',
 *         size: data.length,
 *         content: Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
 *       };
 *     }
 *
 *     if (data instanceof ArrayBuffer) {
 *       const view = new Uint8Array(data);
 *       return {
 *         success: true,
 *         type: 'arraybuffer',
 *         size: data.byteLength,
 *         content: Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('')
 *       };
 *     }
 *
 *     return {
 *       success: false,
 *       type: 'unknown',
 *       size: 0,
 *       error: 'Unsupported binary data type'
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * File system operations (Node.js):
 * ```typescript
 * import * as fs from 'fs';
 * import * as path from 'path';
 *
 * class FileBufferProcessor {
 *   async readFileAsBuffer(filepath: string): Promise<Buffer | null> {
 *     if (typeof Buffer === 'undefined') {
 *       console.error('Buffer not available in this environment');
 *       return null;
 *     }
 *
 *     try {
 *       const data = await fs.promises.readFile(filepath);
 *
 *       if (isBuffer(data)) {
 *         return data;
 *       }
 *
 *       console.error('File read did not return Buffer');
 *       return null;
 *     } catch (error) {
 *       console.error(`Failed to read file: ${error.message}`);
 *       return null;
 *     }
 *   }
 *
 *   async writeBufferToFile(buffer: unknown, filepath: string): Promise<boolean> {
 *     if (!isBuffer(buffer)) {
 *       console.error('Expected Buffer object for file writing');
 *       return false;
 *     }
 *
 *     try {
 *       await fs.promises.writeFile(filepath, buffer);
 *       console.log(`Buffer written to ${filepath}: ${buffer.length} bytes`);
 *       return true;
 *     } catch (error) {
 *       console.error(`Failed to write file: ${error.message}`);
 *       return false;
 *     }
 *   }
 *
 *   processBuffer(buffer: unknown): {
 *     processed: boolean;
 *     info?: { size: number; encoding: string; preview: string }
 *   } {
 *     if (!isBuffer(buffer)) {
 *       return { processed: false };
 *     }
 *
 *     // TypeScript knows buffer is Buffer with all Buffer methods
 *     return {
 *       processed: true,
 *       info: {
 *         size: buffer.length,
 *         encoding: 'binary',
 *         preview: buffer.slice(0, 16).toString('hex')
 *       }
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Cryptographic operations with Buffer validation:
 * ```typescript
 * import * as crypto from 'crypto';
 *
 * class CryptoBufferProcessor {
 *   hashBuffer(data: unknown, algorithm = 'sha256'): string | null {
 *     if (!isBuffer(data)) {
 *       console.error('Hash input must be a Buffer');
 *       return null;
 *     }
 *
 *     try {
 *       const hash = crypto.createHash(algorithm);
 *       hash.update(data);
 *       return hash.digest('hex');
 *     } catch (error) {
 *       console.error(`Hashing failed: ${error.message}`);
 *       return null;
 *     }
 *   }
 *
 *   encryptBuffer(data: unknown, key: string): Buffer | null {
 *     if (!isBuffer(data)) {
 *       console.error('Encryption input must be a Buffer');
 *       return null;
 *     }
 *
 *     try {
 *       const keyBuffer = Buffer.from(key, 'utf8');
 *       const cipher = crypto.createCipher('aes-256-cbc', keyBuffer);
 *
 *       const encrypted = Buffer.concat([
 *         cipher.update(data),
 *         cipher.final()
 *       ]);
 *
 *       return isBuffer(encrypted) ? encrypted : null;
 *     } catch (error) {
 *       console.error(`Encryption failed: ${error.message}`);
 *       return null;
 *     }
 *   }
 *
 *   compareBuffers(buffer1: unknown, buffer2: unknown): boolean {
 *     if (!isBuffer(buffer1) || !isBuffer(buffer2)) {
 *       return false;
 *     }
 *
 *     return Buffer.compare(buffer1, buffer2) === 0;
 *   }
 * }
 * ```
 *
 * @example
 * Network data processing:
 * ```typescript
 * import * as net from 'net';
 *
 * class NetworkBufferHandler {
 *   createServer(port: number) {
 *     const server = net.createServer((socket) => {
 *       socket.on('data', (data) => {
 *         if (isBuffer(data)) {
 *           this.processIncomingData(data, socket);
 *         } else {
 *           console.warn('Received non-Buffer data from socket');
 *         }
 *       });
 *     });
 *
 *     server.listen(port, () => {
 *       console.log(`Server listening on port ${port}`);
 *     });
 *
 *     return server;
 *   }
 *
 *   private processIncomingData(buffer: Buffer, socket: net.Socket) {
 *     console.log(`Received ${buffer.length} bytes`);
 *
 *     // Parse protocol header
 *     if (buffer.length >= 4) {
 *       const messageLength = buffer.readUInt32BE(0);
 *       const messageType = buffer.readUInt16BE(4);
 *       const payload = buffer.slice(6);
 *
 *       this.handleMessage(messageType, payload, socket);
 *     }
 *   }
 *
 *   private handleMessage(type: number, payload: Buffer, socket: net.Socket) {
 *     const response = this.createResponse(type, payload);
 *
 *     if (isBuffer(response)) {
 *       socket.write(response);
 *     }
 *   }
 *
 *   private createResponse(type: number, payload: Buffer): Buffer | null {
 *     if (typeof Buffer === 'undefined') {
 *       return null;
 *     }
 *
 *     const header = Buffer.alloc(6);
 *     header.writeUInt32BE(payload.length, 0);
 *     header.writeUInt16BE(type + 1000, 4); // Response type
 *
 *     return Buffer.concat([header, payload]);
 *   }
 * }
 * ```
 *
 * @example
 * Environment detection and polyfill handling:
 * ```typescript
 * interface BufferEnvironment {
 *   hasBuffer: boolean;
 *   hasTypedArrays: boolean;
 *   hasArrayBuffer: boolean;
 *   platform: 'node' | 'browser' | 'unknown';
 * }
 *
 * function detectBufferEnvironment(): BufferEnvironment {
 *   const hasBuffer = typeof Buffer !== 'undefined';
 *   const hasTypedArrays = typeof Uint8Array !== 'undefined';
 *   const hasArrayBuffer = typeof ArrayBuffer !== 'undefined';
 *
 *   let platform: 'node' | 'browser' | 'unknown' = 'unknown';
 *
 *   if (typeof process !== 'undefined' && process.versions?.node) {
 *     platform = 'node';
 *   } else if (typeof window !== 'undefined') {
 *     platform = 'browser';
 *   }
 *
 *   return {
 *     hasBuffer,
 *     hasTypedArrays,
 *     hasArrayBuffer,
 *     platform
 *   };
 * }
 *
 * function createBufferFromData(data: number[] | string): Buffer | Uint8Array | null {
 *   const env = detectBufferEnvironment();
 *
 *   if (env.hasBuffer) {
 *     // Use Node.js Buffer
 *     const buffer = Buffer.from(data);
 *     return isBuffer(buffer) ? buffer : null;
 *   }
 *
 *   if (env.hasTypedArrays && Array.isArray(data)) {
 *     // Fallback to Uint8Array
 *     return new Uint8Array(data);
 *   }
 *
 *   console.warn('No suitable binary data type available');
 *   return null;
 * }
 * ```
 *
 * @remarks
 * **Buffer vs Other Binary Types:**
 * - Buffer is Node.js-specific, extends Uint8Array
 * - More feature-rich than standard TypedArrays
 * - Has additional methods for encoding, slicing, and manipulation
 * - Not available in browser environments (without polyfills)
 *
 * **Environment Compatibility:**
 * - Native in Node.js environments
 * - Not available in browsers (unless polyfilled)
 * - Use feature detection before Buffer operations
 * - Consider TypedArray alternatives for cross-platform code
 *
 * **Buffer Advantages:**
 * - Rich API for binary data manipulation
 * - Multiple encoding support (hex, base64, utf8, etc.)
 * - Efficient memory operations
 * - Stream integration
 * - Built-in comparison and search methods
 *
 * **Use Cases:**
 * - File system operations
 * - Network protocol handling
 * - Cryptographic operations
 * - Binary data processing
 * - Stream processing
 *
 * **Performance:** Uses Buffer.isBuffer() when available, which is optimized for Buffer detection.
 *
 * **Related Functions:**
 * - Use `isTypedArray()` for TypedArray detection (cross-platform)
 * - Use `isArrayBuffer()` for ArrayBuffer detection
 * - Use `isUint8Array()` for Uint8Array detection (Buffer extends Uint8Array)
 */
export const isBuffer = (value: unknown): value is Buffer =>
  Buffer !== undefined && Buffer.isBuffer(value);
