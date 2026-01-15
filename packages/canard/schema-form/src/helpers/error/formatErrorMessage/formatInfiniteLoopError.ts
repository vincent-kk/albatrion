/**
 * Formats a structured error message for infinite loop detection.
 * @param path - JSON pointer path of the node where the loop was detected
 * @param dependencies - Array of dependency paths that the node watches
 * @param batchCount - Number of batches that were created before detection
 * @param maxBatchCount - Maximum number of batches allowed before detection
 */
export const formatInfiniteLoopError = (
  path: string,
  dependencies: string[],
  batchCount: number,
  maxBatchCount: number,
): string => {
  const divider = '─'.repeat(50);
  const dependenciesSection =
    dependencies.length > 0
      ? dependencies.map((dep) => `  │    • ${dep}`).join('\n')
      : '  │    (none)';

  return `
Infinite loop detected in derived value computation.

  ╭${divider}
  │  Node:         ${path}
  │  Batch Count:  ${batchCount} (exceeded maximum of ${maxBatchCount})
  ├${divider}
  │  Dependencies:
${dependenciesSection}
  ╰${divider}

This indicates a circular dependency where derived values reference each other
in a loop (e.g., A depends on B, B depends on A).

How to fix:
  1. Check the 'computed.derived' expression in the node above
  2. Look for circular references among the listed dependencies
  3. Break the cycle by removing or restructuring one dependency
`.trim();
};
