export type ErrorDetails = Record<string, unknown>;

export class BaseError extends Error {
  public readonly type: string;
  public readonly subType: string;
  public readonly code: string;
  public readonly details: ErrorDetails;

  constructor(
    type: string,
    subType: string,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(message);
    this.type = type;
    this.subType = subType;
    this.code = `${type}.${subType}`;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
