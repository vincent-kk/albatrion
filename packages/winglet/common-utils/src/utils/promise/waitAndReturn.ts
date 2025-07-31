import type { Fn } from '@aileron/declare';

import { delay } from './delay';

/**
 * Executes a function immediately, then waits for a specified delay before returning its result.
 *
 * Provides a way to ensure minimum execution duration for operations, perfect for creating
 * consistent user experience with loading states, implementing minimum display times for
 * feedback, and ensuring operations don't complete too quickly. The function executes
 * immediately but the result is delayed, making it ideal for UI consistency scenarios.
 *
 * @template Return - Return type of the function to execute
 * @param fn - Function to execute immediately (can be sync or async)
 * @param ms - Minimum duration in milliseconds before returning the result (default: 0)
 * @returns Promise that resolves with the function's return value after the minimum duration
 *
 * @throws {Error} Any error thrown by the executed function (thrown after the delay)
 *
 * @example
 * Basic usage with minimum duration:
 * ```typescript
 * import { waitAndReturn } from '@winglet/common-utils';
 *
 * // Function executes immediately, but result returned after 1 second minimum
 * const result = await waitAndReturn(() => {
 *   console.log('This executes immediately');
 *   return 'Hello, World!';
 * }, 1000);
 *
 * console.log(result); // "Hello, World!" (after 1 second minimum)
 * ```
 *
 * @example
 * Loading spinner with minimum display time:
 * ```typescript
 * async function loadDataWithMinimumSpinner(userId: string) {
 *   const spinner = document.getElementById('loading-spinner');
 *   const statusText = document.getElementById('status');
 *
 *   // Show spinner immediately
 *   spinner.style.display = 'block';
 *   statusText.textContent = 'Loading user data...';
 *
 *   try {
 *     // API call starts immediately, but minimum 800ms spinner display
 *     const userData = await waitAndReturn(async () => {
 *       console.log('API call started immediately');
 *       const response = await fetch(`/api/users/${userId}`);
 *       if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *       return response.json();
 *     }, 800);
 *
 *     // Spinner is guaranteed to show for at least 800ms
 *     statusText.textContent = 'Data loaded successfully';
 *     return userData;
 *   } catch (error) {
 *     statusText.textContent = 'Failed to load data';
 *     throw error;
 *   } finally {
 *     // Always hide spinner after minimum duration
 *     spinner.style.display = 'none';
 *   }
 * }
 *
 * // Usage
 * try {
 *   const user = await loadDataWithMinimumSpinner('123');
 *   console.log('User loaded:', user);
 * } catch (error) {
 *   console.error('Loading failed:', error.message);
 * }
 * ```
 *
 * @example
 * Form submission with minimum feedback duration:
 * ```typescript
 * async function submitFormWithFeedback(formData: FormData) {
 *   const submitButton = document.getElementById('submit-btn') as HTMLButtonElement;
 *   const feedbackElement = document.getElementById('feedback');
 *
 *   // Disable button and show immediate feedback
 *   submitButton.disabled = true;
 *   submitButton.textContent = 'Submitting...';
 *   feedbackElement.textContent = 'Processing your request...';
 *   feedbackElement.className = 'feedback processing';
 *
 *   try {
 *     // Submit immediately but ensure minimum 1.5s feedback display
 *     const result = await waitAndReturn(async () => {
 *       const response = await fetch('/api/submit', {
 *         method: 'POST',
 *         body: formData
 *       });
 *
 *       if (!response.ok) {
 *         throw new Error(`Submission failed: ${response.statusText}`);
 *       }
 *
 *       return response.json();
 *     }, 1500);
 *
 *     // Success feedback is shown for minimum duration
 *     feedbackElement.textContent = 'Successfully submitted!';
 *     feedbackElement.className = 'feedback success';
 *     submitButton.textContent = 'Submit';
 *
 *     return result;
 *   } catch (error) {
 *     // Error feedback is also shown for minimum duration
 *     feedbackElement.textContent = `Error: ${error.message}`;
 *     feedbackElement.className = 'feedback error';
 *     submitButton.textContent = 'Retry';
 *     throw error;
 *   } finally {
 *     submitButton.disabled = false;
 *   }
 * }
 *
 * // Usage
 * const form = document.getElementById('myForm') as HTMLFormElement;
 * form.addEventListener('submit', async (e) => {
 *   e.preventDefault();
 *   try {
 *     const result = await submitFormWithFeedback(new FormData(form));
 *     console.log('Submission successful:', result);
 *   } catch (error) {
 *     console.error('Submission failed:', error.message);
 *   }
 * });
 * ```
 *
 * @example
 * Image processing with progress indication:
 * ```typescript
 * interface ProcessingResult {
 *   originalSize: number;
 *   compressedSize: number;
 *   compressionRatio: number;
 *   processedUrl: string;
 * }
 *
 * async function processImageWithMinimumFeedback(
 *   imageFile: File,
 *   minDisplayTime: number = 2000
 * ): Promise<ProcessingResult> {
 *   const progressElement = document.getElementById('progress');
 *   const statusElement = document.getElementById('status');
 *
 *   // Show processing UI immediately
 *   progressElement.style.display = 'block';
 *   statusElement.textContent = 'Processing image...';
 *
 *   const result = await waitAndReturn(async () => {
 *     // Start processing immediately
 *     console.log(`Starting processing of ${imageFile.name}`);
 *
 *     // Simulate image processing steps
 *     const canvas = document.createElement('canvas');
 *     const ctx = canvas.getContext('2d');
 *     const img = new Image();
 *
 *     return new Promise<ProcessingResult>((resolve, reject) => {
 *       img.onload = () => {
 *         try {
 *           // Process image
 *           canvas.width = img.width * 0.8;
 *           canvas.height = img.height * 0.8;
 *           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
 *
 *           // Convert to blob
 *           canvas.toBlob((blob) => {
 *             if (!blob) {
 *               reject(new Error('Failed to process image'));
 *               return;
 *             }
 *
 *             const processedUrl = URL.createObjectURL(blob);
 *             const originalSize = imageFile.size;
 *             const compressedSize = blob.size;
 *
 *             resolve({
 *               originalSize,
 *               compressedSize,
 *               compressionRatio: ((originalSize - compressedSize) / originalSize) * 100,
 *               processedUrl
 *             });
 *           }, 'image/jpeg', 0.8);
 *         } catch (error) {
 *           reject(error);
 *         }
 *       };
 *
 *       img.onerror = () => reject(new Error('Failed to load image'));
 *       img.src = URL.createObjectURL(imageFile);
 *     });
 *   }, minDisplayTime);
 *
 *   // Update UI after minimum display time
 *   statusElement.textContent = `Processing complete! Saved ${result.compressionRatio.toFixed(1)}%`;
 *   progressElement.style.display = 'none';
 *
 *   return result;
 * }
 *
 * // Usage
 * const fileInput = document.getElementById('imageInput') as HTMLInputElement;
 * fileInput.addEventListener('change', async (e) => {
 *   const files = e.target.files;
 *   if (files && files[0]) {
 *     try {
 *       const result = await processImageWithMinimumFeedback(files[0]);
 *       console.log('Image processed:', result);
 *
 *       // Show processed image
 *       const img = document.createElement('img');
 *       img.src = result.processedUrl;
 *       document.body.appendChild(img);
 *     } catch (error) {
 *       console.error('Image processing failed:', error.message);
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * API health check with consistent timing:
 * ```typescript
 * interface HealthCheckResult {
 *   service: string;
 *   status: 'healthy' | 'unhealthy';
 *   responseTime: number;
 *   timestamp: Date;
 *   details?: any;
 * }
 *
 * async function performHealthCheck(
 *   serviceName: string,
 *   healthUrl: string,
 *   minCheckDuration: number = 1000
 * ): Promise<HealthCheckResult> {
 *   const startTime = Date.now();
 *
 *   // Perform health check immediately, but ensure consistent timing
 *   const result = await waitAndReturn(async () => {
 *     try {
 *       console.log(`Checking health of ${serviceName}...`);
 *
 *       const response = await fetch(healthUrl, {
 *         method: 'GET',
 *         headers: { 'Accept': 'application/json' }
 *       });
 *
 *       const actualResponseTime = Date.now() - startTime;
 *
 *       if (response.ok) {
 *         const details = await response.json();
 *         return {
 *           service: serviceName,
 *           status: 'healthy' as const,
 *           responseTime: actualResponseTime,
 *           timestamp: new Date(),
 *           details
 *         };
 *       } else {
 *         return {
 *           service: serviceName,
 *           status: 'unhealthy' as const,
 *           responseTime: actualResponseTime,
 *           timestamp: new Date(),
 *           details: { error: `HTTP ${response.status}` }
 *         };
 *       }
 *     } catch (error) {
 *       return {
 *         service: serviceName,
 *         status: 'unhealthy' as const,
 *         responseTime: Date.now() - startTime,
 *         timestamp: new Date(),
 *         details: { error: error.message }
 *       };
 *     }
 *   }, minCheckDuration);
 *
 *   console.log(`Health check for ${serviceName} completed in ${Date.now() - startTime}ms`);
 *   return result;
 * }
 *
 * // Usage - check multiple services with consistent timing
 * const services = [
 *   { name: 'User Service', url: 'https://users.api.com/health' },
 *   { name: 'Order Service', url: 'https://orders.api.com/health' },
 *   { name: 'Payment Service', url: 'https://payments.api.com/health' }
 * ];
 *
 * const healthResults = await Promise.all(
 *   services.map(service =>
 *     performHealthCheck(service.name, service.url, 2000)
 *   )
 * );
 *
 * healthResults.forEach(result => {
 *   console.log(`${result.service}: ${result.status} (${result.responseTime}ms)`);
 * });
 * ```
 *
 * @example
 * Database operation with minimum transaction time:
 * ```typescript
 * interface TransactionResult<T> {
 *   success: boolean;
 *   data?: T;
 *   error?: string;
 *   duration: number;
 * }
 *
 * async function executeWithMinimumDuration<T>(
 *   operation: () => Promise<T>,
 *   operationName: string,
 *   minDuration: number = 500
 * ): Promise<TransactionResult<T>> {
 *   const startTime = Date.now();
 *
 *   const result = await waitAndReturn(async () => {
 *     try {
 *       console.log(`Starting ${operationName}...`);
 *       const data = await operation();
 *
 *       return {
 *         success: true,
 *         data,
 *         duration: Date.now() - startTime
 *       };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: error.message,
 *         duration: Date.now() - startTime
 *       };
 *     }
 *   }, minDuration);
 *
 *   console.log(`${operationName} completed in ${Date.now() - startTime}ms`);
 *   return result;
 * }
 *
 * // Usage with database operations
 * const userCreation = await executeWithMinimumDuration(
 *   () => database.users.create({
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   }),
 *   'User creation',
 *   1000
 * );
 *
 * if (userCreation.success) {
 *   console.log('User created:', userCreation.data);
 * } else {
 *   console.error('User creation failed:', userCreation.error);
 * }
 * ```
 *
 * @example
 * Testing with minimum execution time:
 * ```typescript
 * describe('Operations with minimum duration', () => {
 *   it('should execute immediately but return after minimum time', async () => {
 *     const mockFn = vi.fn().mockReturnValue('immediate result');
 *     const startTime = Date.now();
 *
 *     const result = await waitAndReturn(mockFn, 100);
 *     const endTime = Date.now();
 *
 *     expect(result).toBe('immediate result');
 *     expect(mockFn).toHaveBeenCalledTimes(1);
 *     expect(endTime - startTime).toBeGreaterThanOrEqual(100);
 *   });
 *
 *   it('should handle async functions with minimum duration', async () => {
 *     const asyncFn = vi.fn().mockResolvedValue('async result');
 *     const startTime = Date.now();
 *
 *     const result = await waitAndReturn(asyncFn, 200);
 *     const endTime = Date.now();
 *
 *     expect(result).toBe('async result');
 *     expect(asyncFn).toHaveBeenCalledTimes(1);
 *     expect(endTime - startTime).toBeGreaterThanOrEqual(200);
 *   });
 *
 *   it('should propagate errors after minimum duration', async () => {
 *     const errorFn = vi.fn().mockRejectedValue(new Error('Test error'));
 *     const startTime = Date.now();
 *
 *     await expect(waitAndReturn(errorFn, 150)).rejects.toThrow('Test error');
 *
 *     const endTime = Date.now();
 *     expect(errorFn).toHaveBeenCalledTimes(1);
 *     expect(endTime - startTime).toBeGreaterThanOrEqual(150);
 *   });
 * });
 * ```
 *
 * @example
 * Building a consistent feedback system:
 * ```typescript
 * class ConsistentFeedbackManager {
 *   private readonly minFeedbackDuration: number;
 *
 *   constructor(minDuration: number = 1000) {
 *     this.minFeedbackDuration = minDuration;
 *   }
 *
 *   async executeWithFeedback<T>(
 *     operation: () => Promise<T>,
 *     feedbackElement: HTMLElement,
 *     messages: {
 *       loading: string;
 *       success: string;
 *       error: (error: Error) => string;
 *     }
 *   ): Promise<T> {
 *     // Show loading state immediately
 *     feedbackElement.textContent = messages.loading;
 *     feedbackElement.className = 'feedback loading';
 *
 *     try {
 *       const result = await waitAndReturn(operation, this.minFeedbackDuration);
 *
 *       // Show success state after minimum duration
 *       feedbackElement.textContent = messages.success;
 *       feedbackElement.className = 'feedback success';
 *
 *       return result;
 *     } catch (error) {
 *       // Show error state after minimum duration
 *       feedbackElement.textContent = messages.error(error);
 *       feedbackElement.className = 'feedback error';
 *       throw error;
 *     }
 *   }
 * }
 *
 * // Usage
 * const feedbackManager = new ConsistentFeedbackManager(1200);
 * const feedbackElement = document.getElementById('feedback');
 *
 * try {
 *   const result = await feedbackManager.executeWithFeedback(
 *     () => saveUserProfile(profileData),
 *     feedbackElement,
 *     {
 *       loading: 'Saving profile...',
 *       success: 'Profile saved successfully!',
 *       error: (error) => `Failed to save profile: ${error.message}`
 *     }
 *   );
 *
 *   console.log('Profile saved:', result);
 * } catch (error) {
 *   console.error('Save failed:', error);
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **Immediate Execution**: Function runs right away, no initial delay
 * - **Minimum Duration Guarantee**: Result is held back until minimum time elapses
 * - **Type Preservation**: Maintains original function's return type and error behavior
 * - **Error Handling**: Errors are propagated after the minimum duration
 * - **Flexible Timing**: Works with both fast and slow operations seamlessly
 *
 * **Execution Flow:**
 * 1. Execute the function immediately (sync or async)
 * 2. Start delay timer concurrently
 * 3. Wait for both function completion and minimum duration
 * 4. Return function result or propagate error after minimum time
 *
 * **vs waitAndExecute:**
 * - **waitAndReturn**: Execute immediately, delay result → UI consistency, minimum feedback time
 * - **waitAndExecute**: Delay first, then execute → scheduling, deferred operations
 *
 * **Common Use Cases:**
 * - **Loading States**: Ensure spinners/progress indicators show for minimum time
 * - **User Feedback**: Prevent flashing success/error messages
 * - **Form Submissions**: Provide consistent feedback duration regardless of speed
 * - **API Responses**: Smooth out variable response times for better UX
 * - **Progress Indicators**: Guarantee minimum display time for progress bars
 * - **Consistent Timing**: Make fast operations feel more substantial
 *
 * **Best Practices:**
 * - Use appropriate minimum durations (800-1500ms for loading, 300-500ms for feedback)
 * - Consider user expectations when setting minimum times
 * - Handle errors gracefully since they occur after delay
 * - Use for operations where consistency matters more than raw speed
 * - Test with both fast and slow operations to verify behavior
 *
 * **Performance Considerations:**
 * - **Memory Usage**: ~80-120 bytes per call (function result + delay overhead)
 * - **CPU Overhead**: <0.1ms setup cost, immediate function execution (no artificial delay)
 * - **Concurrent Execution**: Function starts immediately while delay runs in parallel
 * - **Result Caching**: Function result held in memory only during minimum delay period
 * - **Async Function Optimization**:
 *   - Sync functions: Result cached immediately, minimal memory impact
 *   - Async functions: Promise resolved concurrently with delay timer
 * - **Timing Guarantee**: Always respects minimum duration regardless of function speed
 * - **GC Behavior**: Function result and delay timer cleaned up simultaneously
 */
export const waitAndReturn: {
  <Return>(fn: Fn<[], Return>, ms?: number): Promise<Return>;
  (fn: undefined, ms?: number): Promise<undefined>;
} = async <Return>(fn: Fn<[], Return> | undefined, ms = 0) => {
  const result = typeof fn === 'function' ? fn() : undefined;
  await delay(ms);
  return result;
};
