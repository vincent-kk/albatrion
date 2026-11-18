import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { isEmpty } from '../isEmpty';
describe('round-2 common-utils 7: collection realm equivalence', () => {
  it.each(['Map', 'Set'])('treats a %s in another realm like a local collection', type => {
    const local = type === 'Map' ? new Map([[1, 2]]) : new Set([1]);
    const foreign = runInNewContext(type === 'Map' ? 'new Map([[1,2]])' : 'new Set([1])');
    expect(isEmpty(foreign)).toBe(isEmpty(local));
    foreign.clear();
    local.clear();
    expect(isEmpty(foreign)).toBe(isEmpty(local));
  });
});
