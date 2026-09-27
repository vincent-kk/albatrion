/**
 * Compare competing writes by kind, source document position, local layer, and declaration order.
 * @param {object} left Candidate already considered for this target.
 * @param {object} right Candidate being considered for this target.
 * @returns {number} Positive when left has precedence, negative when right has precedence.
 */
export function compareCandidates(left, right) {
  if (left.priority !== right.priority) return left.priority - right.priority;
  const a = [];
  const b = [];
  for (let node = left.source; node; node = node.parent) a.unshift(node.pos);
  for (let node = right.source; node; node = node.parent) b.unshift(node.pos);
  for (let index = 0; index < Math.min(a.length, b.length); index++) if (a[index] !== b[index]) return a[index] - b[index];
  return a.length - b.length || (left.layer ?? 0) - (right.layer ?? 0) || (left.order ?? 0) - (right.order ?? 0);
}
