/** Remove only instrumentation visits from complete differential observations. */
export const withoutGateVisits = (
  observations: readonly unknown[],
): unknown[] =>
  observations.map((observation) =>
    Object.fromEntries(
      Object.entries(observation as Record<string, unknown>).filter(
        ([key]) => key !== 'visits',
      ),
    ),
  );
