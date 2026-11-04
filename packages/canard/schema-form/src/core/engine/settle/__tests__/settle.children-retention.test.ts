import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-children-retention
describe('child list array retention across reselection', () => {
  const createHostTree = () =>
    createTestTree({
      type: 'object',
      properties: {
        host: {
          type: 'object',
          properties: { flag: { type: 'boolean' } },
          if: { properties: { flag: { const: true } }, required: ['flag'] },
          then: {
            properties: { selected: { type: 'string', default: 'entered' } },
          },
        },
        s0: { type: 'string' },
        s1: { type: 'string' },
        s2: { type: 'string' },
      },
    });

  it('P-09 keeps the parent children array when its reselected list repeats the same nodes in order', () => {
    const { root } = createHostTree();
    writeFieldNode(
      root,
      { host: { flag: false }, s0: 'a', s1: 'b', s2: 'c' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const host = root.structure!.host;
    const rootChildren = root.children;
    const hostChildren = host.children;

    writeFieldNode(
      host.structure!.flag,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );

    expect(host.structure!.selected?.emit).toBe('entered');
    expect(root.children).toBe(rootChildren);
    expect(host.children).not.toBe(hostChildren);
    expect(host.children).toContain(host.structure!.selected);
  });

  it('P-09 publishes a new host children array when a child really leaves', () => {
    const { root } = createHostTree();
    writeFieldNode(
      root,
      { host: { flag: true }, s0: 'a', s1: 'b', s2: 'c' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    const host = root.structure!.host;
    const hostChildren = host.children;

    writeFieldNode(
      host.structure!.flag,
      false,
      'callerReplace',
      WriteOption.Overwrite,
    );

    expect(host.structure!.selected).toBeUndefined();
    expect(host.children).not.toBe(hostChildren);
    expect(host.children).toHaveLength(1);
  });
});
