import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * Error thrown when an error occurs in the DataLoader
 * Can occur during batching, caching, or other operations
 */
export class DataLoaderError extends BaseError {
  static readonly __group__ = 'DATA_LOADER';
  /**
   * DataLoaderError constructor
   * @param code - Specific error code
   * @param message - Error message
   * @param details - Additional error information
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(DataLoaderError.__group__, code, message, details);
    this.name = 'DataLoader';
  }
}

/**
 * Type guard function to check if the given error is an DataLoaderError
 * @param error - The error object to check
 * @returns Whether the error is an DataLoaderError
 */
export const isDataLoaderError = (error: unknown): error is DataLoaderError =>
  error instanceof DataLoaderError;
