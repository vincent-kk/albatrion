import { categorizeProfileFrame } from './profile/categorizeProfileFrame.mjs';

/** Attribute sampled CPU time in a page-clock interval; inclusive totals overlap and never imply exact instrumentation. */
export function attributeCpuProfile(profile, clock, from, to, source, phase) {
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const parents = new Map();
  for (const node of profile.nodes)
    for (const child of node.children ?? []) parents.set(child, node.id);
  const slotLine = source;
  const groups = Object.create(null),
    functions = Object.create(null),
    stackCache = new Map();
  let cursor = profile.startTime;
  for (let index = 0; index < profile.samples.length; index++) {
    const delta = profile.timeDeltas[index];
    const left = cursor / 1000 - clock.offsetMs;
    cursor += delta;
    const right = cursor / 1000 - clock.offsetMs;
    const weight = Math.max(0, Math.min(right, to) - Math.max(left, from));
    if (!weight) continue;
    const id = profile.samples[index];
    let stack = stackCache.get(id);
    if (!stack) {
      stack = [];
      for (let at = id; at; at = parents.get(at)) stack.push(nodes.get(at));
      stackCache.set(id, stack);
    }
    const leaf = stack[0].callFrame;
    if (leaf.functionName === '(idle)') continue;
    const assigned =
      stack
        .map((node) => categorizeProfileFrame(node.callFrame, slotLine, phase))
        .find(Boolean) ?? 'other-native-gc-and-js';
    (groups[assigned] ??= { selfMs: 0, inclusiveMs: 0 }).selfMs += weight;
    if (assigned === 'other-native-gc-and-js')
      groups[assigned].inclusiveMs += weight;
    const seenGroups = [],
      seenFunctions = [];
    for (let depth = 0; depth < stack.length; depth++) {
      const frame = stack[depth].callFrame;
      const category = categorizeProfileFrame(frame, slotLine, phase);
      if (category && !seenGroups.includes(category)) {
        (groups[category] ??= { selfMs: 0, inclusiveMs: 0 }).inclusiveMs +=
          weight;
        seenGroups.push(category);
      }
      const name = frame.functionName || '(anonymous)';
      const owner =
        category ??
        stack
          .slice(depth + 1)
          .map((node) =>
            categorizeProfileFrame(node.callFrame, slotLine, phase),
          )
          .find(Boolean) ??
        'other-native-gc-and-js';
      const key = name === '(anonymous)' ? `${name} under ${owner}` : name;
      if (seenFunctions.includes(key)) continue;
      const value = (functions[key] ??= {
        name: key,
        group: owner,
        selfMs: 0,
        totalMs: 0,
        sites: [],
      });
      value.totalMs += weight;
      if (!depth) value.selfMs += weight;
      if (
        !value.sites.some(
          (site) =>
            site.line === frame.lineNumber &&
            site.column === frame.columnNumber,
        )
      )
        value.sites.push({
          line: frame.lineNumber,
          column: frame.columnNumber,
        });
      seenFunctions.push(key);
    }
  }
  return {
    from,
    to,
    groups,
    functions: Object.values(functions),
    note: '100us CPU sampling estimates, native program/GC included in other; idle excluded. Group inclusive times overlap; shared external-store effects are not uniquely owned by display hooks.',
  };
}
