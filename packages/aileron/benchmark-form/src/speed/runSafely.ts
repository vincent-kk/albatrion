/** Voids a failed row with its current execution phase and lets the caller continue. */
export async function runSafely(
  row: { verdict: 'pass' | 'over' | 'void'; voidReason?: string },
  phase: () => string,
  work: () => Promise<void>,
): Promise<void> {
  try {
    await work();
  } catch (error) {
    row.verdict = 'void';
    row.voidReason = `${phase()}: ${String(error)}`;
  }
}
