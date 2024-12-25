export type ErrorDetails = Record<string, unknown>;

export class BaseError extends Error {
  public readonly code: string;
  public readonly details: ErrorDetails;

  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
