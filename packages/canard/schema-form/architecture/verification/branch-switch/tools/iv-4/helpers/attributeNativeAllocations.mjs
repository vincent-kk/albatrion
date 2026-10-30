import assert from 'node:assert/strict';

/**
 * Assign native allocation self bytes to the nearest product frame without overlap.
 * @param {any} profile Inspector sampling tree including minor/major collected objects.
 * @param {number} operations Number of sampled operations excluding setup and warmup.
 * @param {string} engineUrl Portable URL naming this lane's product bundle.
 * @returns Product owners, including their native descendants, and the exact sampled sum.
 * @throws For invalid operation counts or sampled sizes.
 */
export function attributeNativeAllocations(profile, operations, engineUrl) {
  assert.ok(Number.isSafeInteger(operations) && operations > 0);
  const sums = new Map();
  const pending = [{ node: profile.head, owner: null }];
  let totalBytes = 0;
  while (pending.length) {
    let { node, owner } = pending.pop();
    const frame = node.callFrame;
    if (frame.url === engineUrl)
      owner = JSON.stringify([frame.functionName, frame.lineNumber + 1]);
    assert.ok(Number.isFinite(node.selfSize) && node.selfSize >= 0);
    sums.set(owner, (sums.get(owner) ?? 0) + node.selfSize);
    totalBytes += node.selfSize;
    for (const child of node.children ?? [])
      pending.push({ node: child, owner });
  }
  const rows = [...sums]
    .map(([key, bytes]) => {
      const [name, line] =
        key === null ? ['(outside product)', 0] : JSON.parse(key);
      return {
        function: name,
        bundleLine: line,
        bytes,
        bytesPerRoundTrip: bytes / operations,
        percent: (100 * bytes) / totalBytes,
      };
    })
    .sort((left, right) => right.bytes - left.bytes);
  return { totalBytes, operations, rows };
}
