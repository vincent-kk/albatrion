export type ErrorDetails = Record<string, unknown>;

export class BaseError extends Error {
  public readonly group: string;
  public readonly specific: string;
  public readonly code: string;
  public readonly details: ErrorDetails;

  constructor(
    group: string,
    specific: string,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(message);
    this.group = group;
    this.specific = specific;
    this.code = `${group}.${specific}`;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
