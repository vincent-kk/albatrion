import assert from 'node:assert/strict';

/**
 * Aggregate sampled allocation bytes by frame without double-counting descendants.
 * @param {any} profile Inspector sampling profile retaining minor/major collected objects.
 * @param {number} operations Actual profiled operation count, excluding warmup and setup.
 * @returns Self/inclusive frame totals and sampled bytes per operation.
 * @throws When operation count or sampled sizes are invalid.
 */
export function summarizeAllocations(profile, operations) {
  assert.ok(Number.isSafeInteger(operations) && operations > 0);
  const frames = new Map();
  const stack = [{ node: profile.head, ancestors: [] }];
  let totalBytes = 0;
  while (stack.length) {
    const { node, ancestors } = stack.pop();
    assert.ok(Number.isFinite(node.selfSize) && node.selfSize >= 0);
    const { functionName, url, lineNumber } = node.callFrame;
    const key = JSON.stringify([functionName, url, lineNumber]);
    let frame = frames.get(key);
    if (!frame)
      frames.set(
        key,
        (frame = {
          name: functionName || '(anonymous)',
          url,
          line: lineNumber + 1,
          selfBytes: 0,
          inclusiveBytes: 0,
        }),
      );
    frame.selfBytes += node.selfSize;
    totalBytes += node.selfSize;
    const lineage =
      ancestors.indexOf(frame) === -1 ? [...ancestors, frame] : ancestors;
    for (const ancestor of lineage) ancestor.inclusiveBytes += node.selfSize;
    for (const child of node.children ?? [])
      stack.push({ node: child, ancestors: lineage });
  }
  return {
    totalBytes,
    bytesPerOperation: totalBytes / operations,
    frames: [...frames.values()].sort(
      (left, right) => right.selfBytes - left.selfBytes,
    ),
  };
}
