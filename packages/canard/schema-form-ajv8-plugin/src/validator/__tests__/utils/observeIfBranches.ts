/** Whole-validation results with the `then` marker and with the `else` marker. */
export interface IfBranchObservation {
  /** Whether the value with `accepted: true` passes; true exactly when `if` held. */
  readonly accepted: boolean;
  /** Whether the value with `rejected: true` passes; true exactly when `if` failed. */
  readonly rejected: boolean;
}

/**
 * Observe whole validation's `if` verdict through markers its `then` and `else` require.
 * The schema under test must use `then: { required: ['accepted'] }` and `else: { required: ['rejected'] }`.
 * @param validate - An independent AJV compile of the same root copy; it shares no instance with the plugin.
 * @param place - Builds the whole value, putting the marker into the host value of the `if`.
 * @returns Both outcomes; they differ when the markers isolate the `if` verdict.
 */
export const observeIfBranches = (
  validate: (data: unknown) => unknown,
  place: (marker: { accepted?: true; rejected?: true }) => unknown,
): IfBranchObservation => ({
  accepted: validate(place({ accepted: true })) === true,
  rejected: validate(place({ rejected: true })) === true,
});
