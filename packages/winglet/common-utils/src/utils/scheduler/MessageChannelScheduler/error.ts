import { BaseError, type ErrorDetails } from '@/common-utils/errors';

/**
 * Error thrown when an operation is cancelled
 * Can be triggered by AbortController or manual cancellation
 */
export class MessageChannelSchedulerError extends BaseError {
  /**
   * MessageChannelSchedulerError constructor
   * @param code - Specific error code
   * @param message - Error message
   * @param details - Additional error information
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('MESSAGE_CHANNEL_SCHEDULER', code, message, details);
    this.name = 'MessageChannelScheduler';
  }
}

/**
 * Type guard function to check if the given error is an AbortError
 * @param error - The error object to check
 * @returns Whether the error is an AbortError
 */
export const isMessageChannelSchedulerError = (
  error: unknown,
): error is MessageChannelSchedulerError =>
  error instanceof MessageChannelSchedulerError;
