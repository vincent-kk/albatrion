export type ErrorDetails = Record<string, unknown>;

export abstract class BaseError extends Error {
  /** Error group identifier */
  public readonly group: string;
  /** Error specific code */
  public readonly specific: string;
  /** Full error code (in the format `${group}.${specific}`) */
  public readonly code: string;
  /** Additional error information */
  public readonly details: ErrorDetails;

  /**
   * BaseError constructor
   * @param group - Error group identifier
   * @param specific - Error specific code
   * @param message - Error message
   * @param details - Additional error information
   */
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
