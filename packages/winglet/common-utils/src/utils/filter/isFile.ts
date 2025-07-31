import { isBlob } from './isBlob';

const File = globalThis.File;

/**
 * Determines whether a value is a File object with enhanced type safety.
 *
 * Provides reliable File detection with environment compatibility, identifying
 * File objects used in web applications for file handling. File objects extend
 * Blob functionality with additional metadata like name and last modified time.
 * Returns false in environments where File API is not available.
 *
 * @param value - Value to test for File type
 * @returns Type-safe boolean indicating whether the value is a File object
 *
 * @example
 * Basic File detection:
 * ```typescript
 * import { isFile } from '@winglet/common-utils';
 *
 * // True cases - File instances (in browser environment)
 * if (typeof File !== 'undefined') {
 *   const file1 = new File(['content'], 'test.txt', { type: 'text/plain' });
 *   const file2 = new File(['<h1>Hello</h1>'], 'test.html', { type: 'text/html' });
 *   
 *   console.log(isFile(file1)); // true
 *   console.log(isFile(file2)); // true
 * }
 * 
 * // False cases - not File objects
 * console.log(isFile(new Blob(['content']))); // false (Blob, not File)
 * console.log(isFile('filename.txt')); // false (string)
 * console.log(isFile({ name: 'file.txt', size: 100 })); // false (file-like object)
 * console.log(isFile(null)); // false
 * console.log(isFile(undefined)); // false
 * 
 * // Environment without File API support (e.g., older Node.js)
 * console.log(isFile(anything)); // always false
 * ```
 *
 * @example
 * File upload handling:
 * ```typescript
 * interface FileUploadHandler {
 *   handleFileUpload(files: unknown[]): Promise<UploadResult[]>;
 * }
 *
 * interface UploadResult {
 *   success: boolean;
 *   filename?: string;
 *   size?: number;
 *   error?: string;
 * }
 *
 * class WebFileUploadHandler implements FileUploadHandler {
 *   async handleFileUpload(files: unknown[]): Promise<UploadResult[]> {
 *     const results: UploadResult[] = [];
 *     
 *     for (const file of files) {
 *       if (!isFile(file)) {
 *         results.push({
 *           success: false,
 *           error: 'Invalid file object'
 *         });
 *         continue;
 *       }
 *       
 *       // TypeScript knows file is File
 *       try {
 *         const result = await this.processFile(file);
 *         results.push({
 *           success: true,
 *           filename: file.name,
 *           size: file.size
 *         });
 *       } catch (error) {
 *         results.push({
 *           success: false,
 *           filename: file.name,
 *           error: error.message
 *         });
 *       }
 *     }
 *     
 *     return results;
 *   }
 *   
 *   private async processFile(file: File): Promise<void> {
 *     // Validate file
 *     if (file.size > 10 * 1024 * 1024) { // 10MB limit
 *       throw new Error('File too large');
 *     }
 *     
 *     const allowedTypes = ['image/jpeg', 'image/png', 'text/plain', 'application/pdf'];
 *     if (!allowedTypes.includes(file.type)) {
 *       throw new Error('File type not allowed');
 *     }
 *     
 *     // Process file content
 *     const content = await file.text();
 *     console.log(`Processing ${file.name}: ${content.length} characters`);
 *   }
 * }
 * ```
 *
 * @example
 * File input validation:
 * ```typescript
 * interface FileValidationRule {
 *   name: string;
 *   validate: (file: File) => boolean;
 *   errorMessage: string;
 * }
 *
 * class FileValidator {
 *   private rules: FileValidationRule[] = [
 *     {
 *       name: 'size',
 *       validate: (file) => file.size <= 5 * 1024 * 1024, // 5MB
 *       errorMessage: 'File size must be less than 5MB'
 *     },
 *     {
 *       name: 'type',
 *       validate: (file) => file.type.startsWith('image/'),
 *       errorMessage: 'Only image files are allowed'
 *     },
 *     {
 *       name: 'name',
 *       validate: (file) => file.name.length > 0 && file.name.length <= 255,
 *       errorMessage: 'Filename must be between 1 and 255 characters'
 *     }
 *   ];
 *   
 *   validateFile(file: unknown): { valid: boolean; errors: string[] } {
 *     if (!isFile(file)) {
 *       return {
 *         valid: false,
 *         errors: ['Invalid file object']
 *       };
 *     }
 *     
 *     const errors: string[] = [];
 *     
 *     for (const rule of this.rules) {
 *       if (!rule.validate(file)) {
 *         errors.push(rule.errorMessage);
 *       }
 *     }
 *     
 *     return {
 *       valid: errors.length === 0,
 *       errors
 *     };
 *   }
 *   
 *   validateFiles(files: unknown[]): { 
 *     validFiles: File[]; 
 *     invalidFiles: Array<{ file: unknown; errors: string[] }> 
 *   } {
 *     const validFiles: File[] = [];
 *     const invalidFiles: Array<{ file: unknown; errors: string[] }> = [];
 *     
 *     for (const file of files) {
 *       const validation = this.validateFile(file);
 *       
 *       if (validation.valid && isFile(file)) {
 *         validFiles.push(file);
 *       } else {
 *         invalidFiles.push({ file, errors: validation.errors });
 *       }
 *     }
 *     
 *     return { validFiles, invalidFiles };
 *   }
 * }
 * ```
 *
 * @example
 * File processing with metadata:
 * ```typescript
 * interface FileMetadata {
 *   name: string;
 *   size: number;
 *   type: string;
 *   lastModified: number;
 *   lastModifiedDate: Date;
 * }
 *
 * function extractFileMetadata(file: unknown): FileMetadata | null {
 *   if (!isFile(file)) {
 *     return null;
 *   }
 *   
 *   // TypeScript knows file is File with all File properties
 *   return {
 *     name: file.name,
 *     size: file.size,
 *     type: file.type,
 *     lastModified: file.lastModified,
 *     lastModifiedDate: new Date(file.lastModified)
 *   };
 * }
 *
 * async function processFileWithMetadata(file: unknown) {
 *   const metadata = extractFileMetadata(file);
 *   
 *   if (!metadata || !isFile(file)) {
 *     throw new Error('Invalid file input');
 *   }
 *   
 *   console.log('File metadata:', metadata);
 *   
 *   // Read file content
 *   const content = await file.text();
 *   
 *   return {
 *     metadata,
 *     content,
 *     processed: true,
 *     processedAt: new Date()
 *   };
 * }
 * ```
 *
 * @example
 * Drag and drop file handling:
 * ```typescript
 * class FileDropHandler {
 *   setupDropZone(element: HTMLElement) {
 *     element.addEventListener('dragover', this.handleDragOver);
 *     element.addEventListener('drop', this.handleDrop);
 *   }
 *   
 *   private handleDragOver = (event: DragEvent) => {
 *     event.preventDefault();
 *     event.stopPropagation();
 *   };
 *   
 *   private handleDrop = async (event: DragEvent) => {
 *     event.preventDefault();
 *     event.stopPropagation();
 *     
 *     const files = Array.from(event.dataTransfer?.files || []);
 *     const validFiles = files.filter(isFile);
 *     
 *     if (validFiles.length !== files.length) {
 *       console.warn(`${files.length - validFiles.length} invalid file objects detected`);
 *     }
 *     
 *     for (const file of validFiles) {
 *       await this.processDroppedFile(file);
 *     }
 *   };
 *   
 *   private async processDroppedFile(file: File) {
 *     console.log(`Processing dropped file: ${file.name} (${file.size} bytes)`);
 *     
 *     // Handle different file types
 *     if (file.type.startsWith('image/')) {
 *       await this.processImage(file);
 *     } else if (file.type === 'text/plain') {
 *       await this.processText(file);
 *     } else {
 *       console.log(`Unsupported file type: ${file.type}`);
 *     }
 *   }
 *   
 *   private async processImage(file: File) {
 *     const imageUrl = URL.createObjectURL(file);
 *     // Process image...
 *     URL.revokeObjectURL(imageUrl); // Clean up
 *   }
 *   
 *   private async processText(file: File) {
 *     const text = await file.text();
 *     console.log(`Text content: ${text.substring(0, 100)}...`);
 *   }
 * }
 * ```
 *
 * @example
 * File API feature detection:
 * ```typescript
 * interface FileApiSupport {
 *   file: boolean;
 *   blob: boolean;
 *   fileReader: boolean;
 *   formData: boolean;
 *   url: boolean;
 * }
 *
 * function detectFileApiSupport(): FileApiSupport {
 *   return {
 *     file: typeof File !== 'undefined',
 *     blob: typeof Blob !== 'undefined',
 *     fileReader: typeof FileReader !== 'undefined',
 *     formData: typeof FormData !== 'undefined',
 *     url: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
 *   };
 * }
 *
 * function createFileIfSupported(content: string, filename: string): File | null {
 *   const support = detectFileApiSupport();
 *   
 *   if (!support.file) {
 *     console.warn('File API not supported');
 *     return null;
 *   }
 *   
 *   const file = new File([content], filename, { type: 'text/plain' });
 *   
 *   if (isFile(file)) {
 *     return file;
 *   }
 *   
 *   console.error('Failed to create File object');
 *   return null;
 * }
 * ```
 *
 * @remarks
 * **File vs Blob Relationship:**
 * - File extends Blob with additional properties (name, lastModified)
 * - All File objects are also Blob objects
 * - This function specifically checks for File, not just Blob
 * - Use `isBlob()` if you want to accept both File and Blob objects
 *
 * **Environment Compatibility:**
 * - File API is available in modern browsers
 * - Not available in older browsers or some server environments
 * - Node.js has limited File API support (may require polyfills)
 * - Always check environment support before using
 *
 * **File Properties Available:**
 * - `name` - filename string
 * - `size` - file size in bytes
 * - `type` - MIME type string
 * - `lastModified` - timestamp of last modification
 * - All Blob methods: `text()`, `arrayBuffer()`, `stream()`, `slice()`
 *
 * **Use Cases:**
 * - File upload handling
 * - Drag and drop file processing
 * - File input validation
 * - File metadata extraction
 * - Client-side file processing
 *
 * **Performance:** File and Blob instanceof checks with environment validation.
 *
 * **Related Functions:**
 * - Use `isBlob()` for Blob detection (includes File objects)
 * - Use `isArrayBuffer()` for binary buffer detection
 * - Use File API methods for file content access
 */
export const isFile = (value: unknown): value is File =>
  // Check if the File constructor exists, isBlob result is true, and
  // verify if the value is an instance of File.
  File !== undefined && isBlob(value) && value instanceof File;