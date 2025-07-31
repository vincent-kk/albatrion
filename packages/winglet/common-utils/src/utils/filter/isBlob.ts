const Blob = globalThis.Blob;

/**
 * Determines whether a value is a Blob object with enhanced type safety.
 *
 * Provides reliable Blob detection with environment compatibility, identifying
 * Blob objects used for handling binary data in web applications. Returns false
 * in environments where Blob API is not available (e.g., older Node.js versions).
 *
 * @param value - Value to test for Blob type
 * @returns Type-safe boolean indicating whether the value is a Blob object
 *
 * @example
 * Basic Blob detection:
 * ```typescript
 * import { isBlob } from '@winglet/common-utils';
 *
 * // True cases - Blob instances (in browser environment)
 * if (typeof Blob !== 'undefined') {
 *   const blob1 = new Blob(['Hello World'], { type: 'text/plain' });
 *   const blob2 = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' });
 *   const blob3 = new Blob(['<h1>HTML</h1>'], { type: 'text/html' });
 *   
 *   console.log(isBlob(blob1)); // true
 *   console.log(isBlob(blob2)); // true  
 *   console.log(isBlob(blob3)); // true
 *   
 *   // File objects are also Blobs
 *   const file = new File(['content'], 'test.txt', { type: 'text/plain' });
 *   console.log(isBlob(file)); // true (File extends Blob)
 * }
 * 
 * // False cases - not Blob objects
 * console.log(isBlob('binary data')); // false (string)
 * console.log(isBlob(new ArrayBuffer(16))); // false (ArrayBuffer)
 * console.log(isBlob(new Uint8Array([1, 2, 3]))); // false (TypedArray)
 * console.log(isBlob({ size: 100, type: 'text/plain' })); // false (blob-like object)
 * console.log(isBlob(null)); // false
 * console.log(isBlob(undefined)); // false
 * 
 * // Environment without Blob API support
 * console.log(isBlob(anything)); // always false
 * ```
 *
 * @example
 * File and binary data processing:
 * ```typescript
 * interface DataProcessor {
 *   processData(data: unknown): Promise<ProcessingResult>;
 * }
 *
 * interface ProcessingResult {
 *   success: boolean;
 *   type: string;
 *   size: number;
 *   content?: string;
 *   error?: string;
 * }
 *
 * class BlobDataProcessor implements DataProcessor {
 *   async processData(data: unknown): Promise<ProcessingResult> {
 *     if (!isBlob(data)) {
 *       return {
 *         success: false,
 *         type: 'unknown',
 *         size: 0,
 *         error: 'Input is not a Blob object'
 *       };
 *     }
 *     
 *     // TypeScript knows data is Blob
 *     try {
 *       const content = await this.extractContent(data);
 *       
 *       return {
 *         success: true,
 *         type: data.type || 'unknown',
 *         size: data.size,
 *         content
 *       };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         type: data.type || 'unknown',
 *         size: data.size,
 *         error: error.message
 *       };
 *     }
 *   }
 *   
 *   private async extractContent(blob: Blob): Promise<string> {
 *     if (blob.type.startsWith('text/')) {
 *       return await blob.text();
 *     }
 *     
 *     if (blob.type.startsWith('application/json')) {
 *       return await blob.text();
 *     }
 *     
 *     // For binary data, return base64
 *     const arrayBuffer = await blob.arrayBuffer();
 *     const uint8Array = new Uint8Array(arrayBuffer);
 *     return btoa(String.fromCharCode(...uint8Array));
 *   }
 * }
 * ```
 *
 * @example
 * Image processing with Blob validation:
 * ```typescript
 * class ImageProcessor {
 *   async processImage(imageData: unknown): Promise<{
 *     processed: boolean;
 *     width?: number;
 *     height?: number;
 *     url?: string;
 *     error?: string;
 *   }> {
 *     if (!isBlob(imageData)) {
 *       return {
 *         processed: false,
 *         error: 'Expected Blob object for image processing'
 *       };
 *     }
 *     
 *     if (!imageData.type.startsWith('image/')) {
 *       return {
 *         processed: false,
 *         error: `Invalid image type: ${imageData.type}`
 *       };
 *     }
 *     
 *     try {
 *       const url = URL.createObjectURL(imageData);
 *       const dimensions = await this.getImageDimensions(url);
 *       
 *       return {
 *         processed: true,
 *         width: dimensions.width,
 *         height: dimensions.height,
 *         url
 *       };
 *     } catch (error) {
 *       return {
 *         processed: false,
 *         error: `Image processing failed: ${error.message}`
 *       };
 *     }
 *   }
 *   
 *   private getImageDimensions(url: string): Promise<{ width: number; height: number }> {
 *     return new Promise((resolve, reject) => {
 *       const img = new Image();
 *       img.onload = () => {
 *         URL.revokeObjectURL(url);
 *         resolve({ width: img.width, height: img.height });
 *       };
 *       img.onerror = () => {
 *         URL.revokeObjectURL(url);
 *         reject(new Error('Failed to load image'));
 *       };
 *       img.src = url;
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * API response handling:
 * ```typescript
 * interface ApiClient {
 *   downloadFile(url: string): Promise<Blob>;
 *   uploadFile(blob: unknown): Promise<{ success: boolean; message: string }>;
 * }
 *
 * class BlobApiClient implements ApiClient {
 *   async downloadFile(url: string): Promise<Blob> {
 *     const response = await fetch(url);
 *     
 *     if (!response.ok) {
 *       throw new Error(`Download failed: ${response.statusText}`);
 *     }
 *     
 *     const blob = await response.blob();
 *     
 *     if (!isBlob(blob)) {
 *       throw new Error('Response is not a valid Blob');
 *     }
 *     
 *     return blob;
 *   }
 *   
 *   async uploadFile(blob: unknown): Promise<{ success: boolean; message: string }> {
 *     if (!isBlob(blob)) {
 *       return {
 *         success: false,
 *         message: 'Upload data must be a Blob object'
 *       };
 *     }
 *     
 *     const formData = new FormData();
 *     formData.append('file', blob);
 *     
 *     try {
 *       const response = await fetch('/api/upload', {
 *         method: 'POST',
 *         body: formData
 *       });
 *       
 *       if (response.ok) {
 *         return {
 *           success: true,
 *           message: `File uploaded successfully (${blob.size} bytes)`
 *         };
 *       } else {
 *         return {
 *           success: false,
 *           message: `Upload failed: ${response.statusText}`
 *         };
 *       }
 *     } catch (error) {
 *       return {
 *         success: false,
 *         message: `Upload error: ${error.message}`
 *       };
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * Blob creation and validation utilities:
 * ```typescript
 * interface BlobOptions {
 *   type?: string;
 *   endings?: 'transparent' | 'native';
 * }
 *
 * class BlobUtils {
 *   static createTextBlob(text: string, options: BlobOptions = {}): Blob | null {
 *     if (typeof Blob === 'undefined') {
 *       console.warn('Blob API not supported');
 *       return null;
 *     }
 *     
 *     const blob = new Blob([text], {
 *       type: options.type || 'text/plain',
 *       endings: options.endings
 *     });
 *     
 *     return isBlob(blob) ? blob : null;
 *   }
 *   
 *   static createBinaryBlob(data: ArrayBuffer | Uint8Array, type = 'application/octet-stream'): Blob | null {
 *     if (typeof Blob === 'undefined') {
 *       console.warn('Blob API not supported');
 *       return null;
 *     }
 *     
 *     const blob = new Blob([data], { type });
 *     return isBlob(blob) ? blob : null;
 *   }
 *   
 *   static async blobToBase64(blob: unknown): Promise<string | null> {
 *     if (!isBlob(blob)) {
 *       return null;
 *     }
 *     
 *     try {
 *       const arrayBuffer = await blob.arrayBuffer();
 *       const uint8Array = new Uint8Array(arrayBuffer);
 *       return btoa(String.fromCharCode(...uint8Array));
 *     } catch (error) {
 *       console.error('Failed to convert blob to base64:', error);
 *       return null;
 *     }
 *   }
 *   
 *   static getBlobInfo(blob: unknown): { 
 *     isValid: boolean; 
 *     size?: number; 
 *     type?: string; 
 *   } {
 *     if (!isBlob(blob)) {
 *       return { isValid: false };
 *     }
 *     
 *     return {
 *       isValid: true,
 *       size: blob.size,
 *       type: blob.type
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Environment feature detection:
 * ```typescript
 * interface BlobApiSupport {
 *   blob: boolean;
 *   file: boolean;
 *   fileReader: boolean;
 *   url: boolean;
 *   formData: boolean;
 * }
 *
 * function detectBlobApiSupport(): BlobApiSupport {
 *   return {
 *     blob: typeof Blob !== 'undefined',
 *     file: typeof File !== 'undefined',
 *     fileReader: typeof FileReader !== 'undefined',
 *     url: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
 *     formData: typeof FormData !== 'undefined'
 *   };
 * }
 *
 * function validateBlobEnvironment(): string[] {
 *   const errors: string[] = [];
 *   const support = detectBlobApiSupport();
 *   
 *   if (!support.blob) {
 *     errors.push('Blob API not supported');
 *   }
 *   
 *   if (!support.url) {
 *     errors.push('URL.createObjectURL not supported');
 *   }
 *   
 *   if (!support.formData) {
 *     errors.push('FormData API not supported');
 *   }
 *   
 *   return errors;
 * }
 *
 * // Usage
 * const validationErrors = validateBlobEnvironment();
 * if (validationErrors.length > 0) {
 *   console.warn('Blob features unavailable:', validationErrors);
 * } else {
 *   console.log('Environment supports Blob operations');
 * }
 * ```
 *
 * @remarks
 * **Blob Characteristics:**
 * - Immutable raw data objects
 * - Can represent data in various formats (text, binary, etc.)
 * - Have size and optional MIME type
 * - Support streaming and slicing operations
 * - File objects extend Blob with additional metadata
 *
 * **Environment Compatibility:**
 * - Available in modern browsers
 * - Limited support in older browsers
 * - Node.js support varies by version (may require polyfills)
 * - Always check for Blob constructor existence
 *
 * **Common Use Cases:**
 * - File upload/download handling
 * - Image and media processing
 * - Binary data manipulation
 * - API request/response handling
 * - Client-side file generation
 *
 * **Performance:** Direct instanceof check with environment validation provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isFile()` for File-specific detection (File extends Blob)
 * - Use `isArrayBuffer()` for raw binary buffer detection
 * - Use `isTypedArray()` for typed binary array detection
 */
export const isBlob = (value: unknown): value is Blob =>
  // Check if the Blob constructor exists and
  // verify if the value is an instance of Blob.
  Blob !== undefined && value instanceof Blob;